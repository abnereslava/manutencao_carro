import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  writeBatch,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint
} from 'firebase/firestore';
import {
  ACTIVE_VEHICLE_ID,
  type AlertItem,
  type ComponentState,
  type DocumentRecord,
  type Issue,
  type MaintenanceOccurrence,
  type MaintenancePlan,
  type OdometerRecord,
  type PartInstance,
  type Vehicle,
  type Warranty
} from '../../types/domain';
import { createConverter } from '../converters/firestoreConverter';

export interface Repository<T extends { id: string }> {
  get(id: string): Promise<T | null>;
  list(
    pageSize?: number,
    cursor?: DocumentSnapshot
  ): Promise<{ items: T[]; cursor?: DocumentSnapshot }>;
  save(value: T): Promise<void>;
  create(value: Omit<T, 'id'>): Promise<string>;
  remove(id: string): Promise<void>;
}

export class FirestoreRepository<T extends { id: string }> implements Repository<T> {
  constructor(
    private readonly db: Firestore,
    private readonly path: string,
    private readonly sortField = 'updatedAt'
  ) {}
  private col() {
    return collection(this.db, this.path).withConverter(createConverter<T>());
  }
  async get(id: string) {
    const snapshot = await getDoc(doc(this.col(), id));
    return snapshot.exists() ? snapshot.data() : null;
  }
  async list(pageSize = 50, cursor?: DocumentSnapshot) {
    const constraints: QueryConstraint[] = [orderBy(this.sortField, 'desc'), limit(pageSize)];
    if (cursor) constraints.push(startAfter(cursor));
    const snapshot = await getDocs(query(this.col(), ...constraints));
    return { items: snapshot.docs.map((item) => item.data()), cursor: snapshot.docs.at(-1) };
  }
  async save(value: T) {
    await setDoc(doc(this.col(), value.id), value, { merge: false });
  }
  async create(value: Omit<T, 'id'>) {
    const created = await addDoc(this.col(), value as T);
    return created.id;
  }
  async remove(id: string) {
    await deleteDoc(doc(this.col(), id));
  }
}
const vehiclePath = `vehicles/${ACTIVE_VEHICLE_ID}`;

export interface MaintenanceCompletionWrite {
  occurrence: MaintenanceOccurrence;
  plan: MaintenancePlan;
  parts: PartInstance[];
  componentStates: ComponentState[];
  warranty?: Warranty;
  issues: Issue[];
  alerts: AlertItem[];
  removedAlertIds: string[];
}

interface DerivedAlertsWrite {
  alerts: AlertItem[];
  removedAlertIds: string[];
}

function setBatchValue<T extends { id: string }>(
  batch: ReturnType<typeof writeBatch>,
  db: Firestore,
  path: string,
  value: T
) {
  const reference = doc(collection(db, path).withConverter(createConverter<T>()), value.id);
  batch.set(reference, value);
}

function addAlertsToBatch(
  batch: ReturnType<typeof writeBatch>,
  db: Firestore,
  input: DerivedAlertsWrite
) {
  input.alerts.forEach((alert) => setBatchValue(batch, db, `${vehiclePath}/alertStates`, alert));
  input.removedAlertIds.forEach((id) => batch.delete(doc(db, `${vehiclePath}/alertStates/${id}`)));
}

export async function saveMaintenanceCompletion(
  db: Firestore,
  input: MaintenanceCompletionWrite
): Promise<void> {
  const batch = writeBatch(db);
  const setValue = <T extends { id: string }>(path: string, value: T) => {
    const reference = doc(collection(db, path).withConverter(createConverter<T>()), value.id);
    batch.set(reference, value);
  };

  setValue(`${vehiclePath}/maintenanceOccurrences`, input.occurrence);
  setValue(`${vehiclePath}/maintenancePlans`, input.plan);
  input.parts.forEach((part) => setValue(`${vehiclePath}/parts`, part));
  input.componentStates.forEach((state) => setValue(`${vehiclePath}/componentStates`, state));
  if (input.warranty) setValue(`${vehiclePath}/warranties`, input.warranty);
  input.issues.forEach((issue) => setValue(`${vehiclePath}/issues`, issue));
  input.alerts.forEach((alert) => setValue(`${vehiclePath}/alertStates`, alert));
  input.removedAlertIds.forEach((id) => batch.delete(doc(db, `${vehiclePath}/alertStates/${id}`)));
  await batch.commit();
}

export interface OdometerChangeWrite extends DerivedAlertsWrite {
  record?: OdometerRecord;
  removedRecordId?: string;
  vehicle: Vehicle;
  plans: MaintenancePlan[];
}

export async function saveOdometerChange(db: Firestore, input: OdometerChangeWrite) {
  const batch = writeBatch(db);
  if (input.record) setBatchValue(batch, db, `${vehiclePath}/odometerRecords`, input.record);
  if (input.removedRecordId)
    batch.delete(doc(db, `${vehiclePath}/odometerRecords/${input.removedRecordId}`));
  setBatchValue(batch, db, 'vehicles', input.vehicle);
  input.plans.forEach((plan) => setBatchValue(batch, db, `${vehiclePath}/maintenancePlans`, plan));
  addAlertsToBatch(batch, db, input);
  await batch.commit();
}

export interface MaintenanceCreationWrite extends DerivedAlertsWrite {
  plan: MaintenancePlan;
  occurrence?: MaintenanceOccurrence;
}

export async function saveMaintenanceCreation(db: Firestore, input: MaintenanceCreationWrite) {
  const batch = writeBatch(db);
  setBatchValue(batch, db, `${vehiclePath}/maintenancePlans`, input.plan);
  if (input.occurrence)
    setBatchValue(batch, db, `${vehiclePath}/maintenanceOccurrences`, input.occurrence);
  addAlertsToBatch(batch, db, input);
  await batch.commit();
}

export async function saveDocumentChange(
  db: Firestore,
  value: DocumentRecord,
  alerts: AlertItem[],
  removedAlertIds: string[]
) {
  const batch = writeBatch(db);
  setBatchValue(batch, db, `${vehiclePath}/documents`, value);
  addAlertsToBatch(batch, db, { alerts, removedAlertIds });
  await batch.commit();
}

export async function saveComponentStateChange(
  db: Firestore,
  state: ComponentState,
  alerts: AlertItem[],
  removedAlertIds: string[]
): Promise<void> {
  const batch = writeBatch(db);
  const stateRef = doc(
    collection(db, `${vehiclePath}/componentStates`).withConverter(
      createConverter<ComponentState>()
    ),
    state.id
  );
  batch.set(stateRef, state);
  alerts.forEach((alert) => {
    const alertRef = doc(
      collection(db, `${vehiclePath}/alertStates`).withConverter(createConverter<AlertItem>()),
      alert.id
    );
    batch.set(alertRef, alert);
  });
  removedAlertIds.forEach((id) => batch.delete(doc(db, `${vehiclePath}/alertStates/${id}`)));
  await batch.commit();
}

async function saveAuditedEntityWithAlerts<T extends { id: string }>(
  db: Firestore,
  path: string,
  value: T,
  alerts: AlertItem[],
  removedAlertIds: string[]
) {
  const batch = writeBatch(db);
  const reference = doc(collection(db, path).withConverter(createConverter<T>()), value.id);
  batch.set(reference, value);
  alerts.forEach((alert) => {
    const alertRef = doc(
      collection(db, `${vehiclePath}/alertStates`).withConverter(createConverter<AlertItem>()),
      alert.id
    );
    batch.set(alertRef, alert);
  });
  removedAlertIds.forEach((id) => batch.delete(doc(db, `${vehiclePath}/alertStates/${id}`)));
  await batch.commit();
}

export const saveIssueChange = (
  db: Firestore,
  issue: Issue,
  alerts: AlertItem[],
  removedAlertIds: string[]
) => saveAuditedEntityWithAlerts(db, `${vehiclePath}/issues`, issue, alerts, removedAlertIds);

export const saveWarrantyChange = (
  db: Firestore,
  warranty: Warranty,
  alerts: AlertItem[],
  removedAlertIds: string[]
) =>
  saveAuditedEntityWithAlerts(db, `${vehiclePath}/warranties`, warranty, alerts, removedAlertIds);

export const saveMaintenancePlanStateChange = (
  db: Firestore,
  plan: MaintenancePlan,
  alerts: AlertItem[],
  removedAlertIds: string[]
) =>
  saveAuditedEntityWithAlerts(db, `${vehiclePath}/maintenancePlans`, plan, alerts, removedAlertIds);

export const createRepositories = (db: Firestore) => ({
  vehicles: new FirestoreRepository<Vehicle>(db, 'vehicles'),
  odometer: new FirestoreRepository<OdometerRecord>(
    db,
    `${vehiclePath}/odometerRecords`,
    'recordedDate'
  ),
  componentStates: new FirestoreRepository<ComponentState>(db, `${vehiclePath}/componentStates`),
  parts: new FirestoreRepository<PartInstance>(db, `${vehiclePath}/parts`),
  maintenancePlans: new FirestoreRepository<MaintenancePlan>(db, `${vehiclePath}/maintenancePlans`),
  maintenanceOccurrences: new FirestoreRepository<MaintenanceOccurrence>(
    db,
    `${vehiclePath}/maintenanceOccurrences`,
    'performedDate'
  ),
  issues: new FirestoreRepository<Issue>(db, `${vehiclePath}/issues`, 'identifiedDate'),
  warranties: new FirestoreRepository<Warranty>(db, `${vehiclePath}/warranties`, 'endDate'),
  documents: new FirestoreRepository<DocumentRecord>(
    db,
    `${vehiclePath}/documents`,
    'referenceYear'
  ),
  alerts: new FirestoreRepository<AlertItem>(db, `${vehiclePath}/alertStates`, 'title')
});
