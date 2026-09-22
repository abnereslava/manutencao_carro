import { doc, getDoc, setDoc, waitForPendingWrites, type Firestore } from 'firebase/firestore';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { Skeleton } from '../../components/ui';
import { getComponent, SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { getInitializedDataStore } from '../../data/firebase/config';
import {
  createRepositories,
  saveComponentStateChange,
  saveDocumentChange,
  saveIssueChange,
  saveMaintenanceCreation,
  saveMaintenancePlanStateChange,
  saveMaintenanceCompletion,
  saveOdometerChange,
  saveWarrantyChange
} from '../../data/repositories/firestoreRepositories';
import { seedData } from '../../data/seed';
import { deriveAlerts, mergeAlertState } from '../../domain/alerts';
import { clearExpenseRefund, setExpenseRefund } from '../../domain/expenses';
import { calculateMaintenanceStatus, nextCycle } from '../../domain/maintenance';
import { getCurrentOdometer, validateOdometerReading } from '../../domain/odometer';
import { installPart, removePart } from '../../domain/parts';
import { todayISO, uid } from '../../lib/format';
import {
  SCHEMA_VERSION,
  type AppData,
  type AuditMetadata,
  type ComponentState,
  type DocumentRecord,
  type Issue,
  type MaintenanceCompletionInput,
  type MaintenanceOccurrence,
  type MaintenancePlan,
  type OdometerRecord,
  type PartAction,
  type PartInstance,
  type Warranty,
  type Vehicle
} from '../../types/domain';
import { useAuth } from './AuthProvider';

interface DataContextValue {
  data: AppData;
  syncState: SyncState;
  conflicts: DataConflict[];
  addOdometer: (value: number, date: string, notes: string) => Promise<string | null>;
  updateOdometer: (
    id: string,
    value: number,
    date: string,
    notes: string
  ) => Promise<string | null>;
  removeOdometer: (id: string) => Promise<void>;
  saveVehicle: (vehicle: Vehicle) => Promise<void>;
  saveMaintenance: (
    input: Pick<
      MaintenancePlan,
      | 'title'
      | 'type'
      | 'priority'
      | 'recurrenceType'
      | 'intervalKm'
      | 'intervalDays'
      | 'intervalMonths'
      | 'intervalYears'
      | 'nextDueKm'
      | 'nextDueDate'
      | 'componentDefinitionId'
      | 'description'
      | 'observations'
    > & {
      initialPerformedDate?: string;
      initialPerformedKm?: number;
      initialStatus?: 'pending' | 'scheduled';
    }
  ) => Promise<string>;
  completeMaintenance: (id: string, input: MaintenanceCompletionInput) => Promise<void>;
  updatePart: (
    id: string,
    input: Pick<
      PartInstance,
      | 'name'
      | 'manufacturer'
      | 'brand'
      | 'model'
      | 'partCode'
      | 'conditionAtInstall'
      | 'priorLifeKnown'
      | 'initialConditionNotes'
      | 'supplier'
      | 'purchasePriceCents'
      | 'observations'
    >
  ) => Promise<void>;
  setComponentNotApplicable: (componentDefinitionId: string, value: boolean) => Promise<void>;
  saveIssue: (
    input: Pick<
      Issue,
      | 'title'
      | 'description'
      | 'componentDefinitionId'
      | 'relatedPartInstanceIds'
      | 'relatedMaintenancePlanId'
      | 'priority'
      | 'status'
      | 'identifiedDate'
      | 'identifiedOdometerKm'
      | 'observations'
    > & { id?: string }
  ) => Promise<string>;
  setIssueStatus: (id: string, status: Issue['status']) => Promise<void>;
  setMaintenanceStatus: (
    id: string,
    status: Extract<MaintenancePlan['status'], 'pending' | 'in_progress'>
  ) => Promise<void>;
  saveWarranty: (
    input: Pick<
      Warranty,
      | 'type'
      | 'partInstanceId'
      | 'maintenanceOccurrenceId'
      | 'startDate'
      | 'startOdometerKm'
      | 'endDate'
      | 'endOdometerKm'
      | 'provider'
      | 'terms'
      | 'documentUrl'
      | 'observations'
    > & { id?: string }
  ) => Promise<string>;
  saveRefund: (occurrenceId: string, amountCents: number, notes: string) => Promise<void>;
  removeRefund: (occurrenceId: string) => Promise<void>;
  addDocument: (
    input: Pick<DocumentRecord, 'name' | 'type' | 'referenceYear' | 'dueDate' | 'amountCents'>
  ) => Promise<void>;
  markAlertSeen: (id: string) => Promise<void>;
  snoozeAlert: (id: string) => Promise<void>;
  updateSettings: (settings: AppData['settings']) => Promise<void>;
  resolveConflict: (
    id: string,
    choice: 'local' | 'remote' | 'manual',
    manualValue?: ConflictValue
  ) => Promise<void>;
  resetDemo: () => void;
}

export type SyncStatus = 'idle' | 'saving' | 'synced' | 'pending' | 'error';

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  message?: string;
  updatedAt?: string;
}

export type ConflictEntity =
  | 'vehicle'
  | 'odometer'
  | 'componentState'
  | 'part'
  | 'maintenanceOccurrence'
  | 'maintenancePlan'
  | 'issue'
  | 'warranty'
  | 'document';

export type ConflictValue =
  | Vehicle
  | OdometerRecord
  | ComponentState
  | PartInstance
  | MaintenanceOccurrence
  | MaintenancePlan
  | Issue
  | Warranty
  | DocumentRecord;

export interface DataConflict {
  id: string;
  entityType: ConflictEntity;
  entityId: string;
  local: ConflictValue;
  remote: ConflictValue;
  divergentFields: string[];
  detectedAt: string;
}

const DataContext = createContext<DataContextValue | null>(null);
const storageKey = 'carango-demo-data-v1';
const conflictStorageKey = 'carango-sync-conflicts-v1';
type Repositories = ReturnType<typeof createRepositories>;

function restoreConflicts(): DataConflict[] {
  try {
    const value = sessionStorage.getItem(conflictStorageKey);
    return value ? (JSON.parse(value) as DataConflict[]) : [];
  } catch {
    return [];
  }
}

function divergentFields(local: ConflictValue, remote: ConflictValue) {
  const ignored = new Set([
    'schemaVersion',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'revision'
  ]);
  return [...new Set([...Object.keys(local), ...Object.keys(remote)])].filter(
    (key) =>
      !ignored.has(key) &&
      JSON.stringify((local as unknown as Record<string, unknown>)[key]) !==
        JSON.stringify((remote as unknown as Record<string, unknown>)[key])
  );
}

function restoreDemo(): AppData {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as AppData) : structuredClone(seedData);
  } catch {
    return structuredClone(seedData);
  }
}

function emptyProductionData(): AppData {
  return {
    ...structuredClone(seedData),
    odometer: [],
    componentStates: [],
    parts: [],
    maintenancePlans: [],
    occurrences: [],
    issues: [],
    warranties: [],
    documents: [],
    alerts: [],
    vehicle: {
      ...structuredClone(seedData.vehicle),
      plate: '',
      renavam: '',
      chassis: '',
      observations: ''
    }
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setDataState] = useState<AppData>(() =>
    user?.demo ? restoreDemo() : emptyProductionData()
  );
  const [loading, setLoading] = useState(Boolean(user && !user.demo));
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle', pendingCount: 0 });
  const [conflicts, setConflicts] = useState<DataConflict[]>(restoreConflicts);
  const repositories = useRef<Repositories | null>(null);
  const database = useRef<Firestore | null>(null);
  const mutationLocks = useRef(new Set<string>());

  useEffect(() => {
    sessionStorage.setItem(conflictStorageKey, JSON.stringify(conflicts));
  }, [conflicts]);

  useEffect(() => {
    const markPending = () => {
      if (mutationLocks.current.size)
        setSyncState((current) => ({
          ...current,
          status: 'pending',
          message: 'Sem conexão. Alterações aguardando confirmação do servidor.'
        }));
    };
    const markSaving = () => {
      if (mutationLocks.current.size)
        setSyncState((current) => ({
          ...current,
          status: 'saving',
          message: 'Conexão restaurada. Confirmando alterações…'
        }));
    };
    addEventListener('offline', markPending);
    addEventListener('online', markSaving);
    return () => {
      removeEventListener('offline', markPending);
      removeEventListener('online', markSaving);
    };
  }, []);

  useEffect(() => {
    if (!user || user.demo) {
      setLoading(false);
      return;
    }
    const db = getInitializedDataStore();
    if (!db) {
      setLoading(false);
      return;
    }
    database.current = db;
    const repos = createRepositories(db);
    repositories.current = repos;
    let active = true;
    void Promise.all([
      repos.vehicles.get('sandero'),
      repos.odometer.list(250),
      repos.componentStates.list(250),
      repos.parts.list(250),
      repos.maintenancePlans.list(250),
      repos.maintenanceOccurrences.list(250),
      repos.issues.list(250),
      repos.warranties.list(250),
      repos.documents.list(250),
      repos.alerts.list(250),
      getDoc(doc(db, 'appSettings/default'))
    ])
      .then(
        async ([
          vehicle,
          odometer,
          componentStates,
          parts,
          plans,
          occurrences,
          issues,
          warranties,
          documents,
          alerts,
          settings
        ]) => {
          if (!active) return;
          const fallback = emptyProductionData();
          const resolvedVehicle = vehicle ?? fallback.vehicle;
          if (!vehicle) await repos.vehicles.save(resolvedVehicle);
          const initialStates = componentStates.items.length
            ? componentStates.items
            : SANDERO_COMPONENTS.map((component) => ({
                schemaVersion: SCHEMA_VERSION,
                id: `state-${component.id}`,
                componentDefinitionId: component.id,
                state: 'unknown' as const,
                observations: '',
                createdAt: new Date().toISOString(),
                createdBy: user.email,
                updatedAt: new Date().toISOString(),
                updatedBy: user.email,
                revision: 1
              }));
          if (!componentStates.items.length)
            await Promise.all(initialStates.map((state) => repos.componentStates.save(state)));
          const next: AppData = {
            ...fallback,
            vehicle: resolvedVehicle,
            odometer: odometer.items,
            componentStates: componentStates.items,
            parts: parts.items,
            maintenancePlans: plans.items,
            occurrences: occurrences.items,
            issues: issues.items,
            warranties: warranties.items,
            documents: documents.items,
            alerts: alerts.items,
            settings: settings.exists()
              ? (settings.data() as AppData['settings'])
              : fallback.settings
          };
          next.componentStates = initialStates;
          next.vehicle.currentOdometer =
            getCurrentOdometer(next.odometer) || next.vehicle.currentOdometer;
          next.alerts = mergeAlertState(deriveAlerts(next), next.alerts);
          setDataState(next);
          setLoading(false);
        }
      )
      .catch(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const runMutation = async <T,>(key: string, action: () => Promise<T>): Promise<T> => {
    if (mutationLocks.current.has(key))
      throw new Error('Esta operação já está em andamento. Aguarde a confirmação.');
    mutationLocks.current.add(key);
    setSyncState({
      status: navigator.onLine ? 'saving' : 'pending',
      pendingCount: mutationLocks.current.size,
      message: navigator.onLine
        ? 'Salvando alterações…'
        : 'Sem conexão. Alterações aguardando confirmação do servidor.'
    });
    try {
      const result = await action();
      if (database.current) await waitForPendingWrites(database.current);
      const remaining = Math.max(0, mutationLocks.current.size - 1);
      setSyncState({
        status: remaining ? (navigator.onLine ? 'saving' : 'pending') : 'synced',
        pendingCount: remaining,
        message: remaining ? 'Ainda há alterações sendo salvas…' : 'Alterações sincronizadas.',
        updatedAt: new Date().toISOString()
      });
      return result;
    } catch (error) {
      setSyncState({
        status: 'error',
        pendingCount: Math.max(0, mutationLocks.current.size - 1),
        message: error instanceof Error ? error.message : 'Não foi possível salvar as alterações.'
      });
      throw error;
    } finally {
      mutationLocks.current.delete(key);
    }
  };

  const getRemoteEntity = async (
    entityType: ConflictEntity,
    id: string
  ): Promise<ConflictValue | null> => {
    const repos = repositories.current;
    if (!repos) return null;
    switch (entityType) {
      case 'vehicle':
        return repos.vehicles.get(id);
      case 'odometer':
        return repos.odometer.get(id);
      case 'componentState':
        return repos.componentStates.get(id);
      case 'part':
        return repos.parts.get(id);
      case 'maintenanceOccurrence':
        return repos.maintenanceOccurrences.get(id);
      case 'maintenancePlan':
        return repos.maintenancePlans.get(id);
      case 'issue':
        return repos.issues.get(id);
      case 'warranty':
        return repos.warranties.get(id);
      case 'document':
        return repos.documents.get(id);
    }
  };

  const ensureNoConflict = async (
    entityType: ConflictEntity,
    base: ConflictValue,
    local: ConflictValue
  ) => {
    if (user?.demo || !repositories.current) return;
    const remote = await getRemoteEntity(entityType, base.id);
    if (
      !remote ||
      (remote.revision === base.revision &&
        remote.updatedAt === base.updatedAt &&
        remote.updatedBy === base.updatedBy)
    )
      return;
    const conflict: DataConflict = {
      id: `${entityType}:${base.id}`,
      entityType,
      entityId: base.id,
      local,
      remote,
      divergentFields: divergentFields(local, remote),
      detectedAt: new Date().toISOString()
    };
    setConflicts((current) => [conflict, ...current.filter((item) => item.id !== conflict.id)]);
    throw new Error('Conflito detectado. Escolha qual versão deve ser mantida.');
  };
  const audit = () => ({
    schemaVersion: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    createdBy: user?.email ?? 'local',
    updatedAt: new Date().toISOString(),
    updatedBy: user?.email ?? 'local',
    revision: 1
  });
  const recalculate = (current: AppData, km: number) => {
    const next = {
      ...current,
      vehicle: { ...current.vehicle, currentOdometer: km },
      maintenancePlans: current.maintenancePlans.map((plan) => ({
        ...plan,
        status: calculateMaintenanceStatus(plan, {
          currentKm: km,
          today: todayISO(),
          alertKmThreshold: current.settings.alertKmThreshold,
          alertDaysThreshold: current.settings.alertDaysThreshold
        })
      }))
    };
    return { ...next, alerts: mergeAlertState(deriveAlerts(next), current.alerts) };
  };

  const addOdometer: DataContextValue['addOdometer'] = async (value, date, notes) => {
    const recordedDate = date || todayISO();
    const error = validateOdometerReading(data.odometer, value, { recordedDate });
    if (error) return error;
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para salvar a quilometragem.');
    const current = data;
    const record: OdometerRecord = {
      ...audit(),
      id: uid('odo'),
      vehicleId: current.vehicle.id,
      odometerKm: value,
      recordedDate,
      observations: notes
    };
    const recalculated = recalculate(
      { ...current, odometer: [record, ...current.odometer] },
      getCurrentOdometer([record, ...current.odometer])
    );
    const now = new Date().toISOString();
    const plans = recalculated.maintenancePlans.map((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.status === plan.status
        ? plan
        : {
            ...plan,
            revision: plan.revision + 1,
            updatedAt: now,
            updatedBy: user?.email ?? 'local'
          };
    });
    const next = {
      ...recalculated,
      maintenancePlans: plans,
      vehicle: {
        ...recalculated.vehicle,
        revision: current.vehicle.revision + 1,
        updatedAt: now,
        updatedBy: user?.email ?? 'local'
      }
    };
    const changedPlans = next.maintenancePlans.filter((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.revision !== plan.revision;
    });
    await runMutation('odometer:add', async () => {
      await ensureNoConflict('vehicle', current.vehicle, next.vehicle);
      await Promise.all(
        changedPlans.map(async (plan) => {
          const previous = current.maintenancePlans.find((item) => item.id === plan.id);
          if (previous) await ensureNoConflict('maintenancePlan', previous, plan);
        })
      );
      if (database.current)
        await saveOdometerChange(database.current, {
          record,
          vehicle: next.vehicle,
          plans: changedPlans,
          alerts: next.alerts,
          removedAlertIds: current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        });
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
    return null;
  };
  const updateOdometer: DataContextValue['updateOdometer'] = async (id, value, date, notes) => {
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para editar a quilometragem.');
    const current = data;
    const existing = current.odometer.find((item) => item.id === id);
    if (!existing) throw new Error('Leitura não encontrada.');
    const recordedDate = date || todayISO();
    const error = validateOdometerReading(current.odometer, value, {
      editingId: id,
      recordedDate
    });
    if (error) return error;
    const now = new Date().toISOString();
    const record: OdometerRecord = {
      ...existing,
      odometerKm: value,
      recordedDate,
      observations: notes,
      revision: existing.revision + 1,
      updatedAt: now,
      updatedBy: user?.email ?? 'local'
    };
    const list = current.odometer.map((item) => (item.id === id ? record : item));
    const recalculated = recalculate({ ...current, odometer: list }, getCurrentOdometer(list));
    const plans = recalculated.maintenancePlans.map((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.status === plan.status
        ? plan
        : {
            ...plan,
            revision: plan.revision + 1,
            updatedAt: now,
            updatedBy: user?.email ?? 'local'
          };
    });
    const next = {
      ...recalculated,
      maintenancePlans: plans,
      vehicle: {
        ...recalculated.vehicle,
        revision: current.vehicle.revision + 1,
        updatedAt: now,
        updatedBy: user?.email ?? 'local'
      }
    };
    const changedPlans = next.maintenancePlans.filter((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.revision !== plan.revision;
    });
    await runMutation(`odometer:update:${id}`, async () => {
      await ensureNoConflict('odometer', existing, record);
      await ensureNoConflict('vehicle', current.vehicle, next.vehicle);
      await Promise.all(
        changedPlans.map(async (plan) => {
          const previous = current.maintenancePlans.find((item) => item.id === plan.id);
          if (previous) await ensureNoConflict('maintenancePlan', previous, plan);
        })
      );
      if (database.current)
        await saveOdometerChange(database.current, {
          record,
          vehicle: next.vehicle,
          plans: changedPlans,
          alerts: next.alerts,
          removedAlertIds: current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        });
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
    return null;
  };
  const removeOdometer: DataContextValue['removeOdometer'] = async (id) => {
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para excluir a quilometragem.');
    const current = data;
    const record = current.odometer.find((item) => item.id === id);
    if (!record) throw new Error('Leitura não encontrada.');
    const list = current.odometer.filter((item) => item.id !== id);
    const recalculated = recalculate({ ...current, odometer: list }, getCurrentOdometer(list));
    const now = new Date().toISOString();
    const plans = recalculated.maintenancePlans.map((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.status === plan.status
        ? plan
        : {
            ...plan,
            revision: plan.revision + 1,
            updatedAt: now,
            updatedBy: user?.email ?? 'local'
          };
    });
    const next = {
      ...recalculated,
      maintenancePlans: plans,
      vehicle: {
        ...recalculated.vehicle,
        revision: current.vehicle.revision + 1,
        updatedAt: now,
        updatedBy: user?.email ?? 'local'
      }
    };
    const changedPlans = next.maintenancePlans.filter((plan) => {
      const previous = current.maintenancePlans.find((item) => item.id === plan.id);
      return previous?.revision !== plan.revision;
    });
    await runMutation(`odometer:remove:${id}`, async () => {
      await ensureNoConflict('odometer', record, record);
      await ensureNoConflict('vehicle', current.vehicle, next.vehicle);
      await Promise.all(
        changedPlans.map(async (plan) => {
          const previous = current.maintenancePlans.find((item) => item.id === plan.id);
          if (previous) await ensureNoConflict('maintenancePlan', previous, plan);
        })
      );
      if (database.current)
        await saveOdometerChange(database.current, {
          removedRecordId: id,
          vehicle: next.vehicle,
          plans: changedPlans,
          alerts: next.alerts,
          removedAlertIds: current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        });
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const saveVehicle: DataContextValue['saveVehicle'] = async (vehicle) => {
    if (!user?.demo && !repositories.current)
      throw new Error('O Firestore não está disponível para editar o veículo.');
    const current = data;
    const nextVehicle = {
      ...vehicle,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local',
      revision: current.vehicle.revision + 1
    };
    await runMutation(`vehicle:${vehicle.id}`, async () => {
      await ensureNoConflict('vehicle', current.vehicle, nextVehicle);
      if (repositories.current) await repositories.current.vehicles.save(nextVehicle);
    });
    const next = { ...current, vehicle: nextVehicle };
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const saveMaintenance: DataContextValue['saveMaintenance'] = async (input) => {
    const planId = uid('maint');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para criar a manutenção.');
    const current = data;
    const { initialPerformedDate, initialPerformedKm, initialStatus, ...planInput } = input;
    const plan = {
      ...audit(),
      id: planId,
      status:
        initialStatus === 'pending' ||
        (initialStatus === undefined &&
          planInput.recurrenceType === 'none' &&
          planInput.nextDueKm === undefined &&
          planInput.nextDueDate === undefined)
          ? 'pending'
          : 'ok',
      isActive: true,
      ...planInput
    } as MaintenancePlan;
    plan.status = calculateMaintenanceStatus(plan, {
      currentKm: current.vehicle.currentOdometer,
      today: todayISO(),
      alertKmThreshold: current.settings.alertKmThreshold,
      alertDaysThreshold: current.settings.alertDaysThreshold
    });
    const occurrence =
      initialPerformedDate && initialPerformedKm !== undefined
        ? ({
            ...audit(),
            id: uid('occ'),
            maintenancePlanId: plan.id,
            performedDate: initialPerformedDate,
            odometerKm: initialPerformedKm,
            status: 'completed',
            observations: '',
            partActions: []
          } as MaintenanceOccurrence)
        : undefined;
    const base = {
      ...current,
      maintenancePlans: [plan, ...current.maintenancePlans],
      occurrences: occurrence ? [occurrence, ...current.occurrences] : current.occurrences
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    await runMutation('maintenance:create', async () => {
      if (database.current)
        await saveMaintenanceCreation(database.current, {
          plan,
          occurrence,
          alerts: next.alerts,
          removedAlertIds: current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        });
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
    return planId;
  };
  const completeMaintenance: DataContextValue['completeMaintenance'] = async (id, input) => {
    const current = data;
    const plan = current.maintenancePlans.find((item) => item.id === id);
    if (!plan) throw new Error('Plano de manutenção não encontrado.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para concluir esta manutenção.');
    if (plan.type === 'inspection' && !input.inspection)
      throw new Error('Informe o resultado da inspeção.');
    if (plan.type === 'inspection' && input.partActions.length)
      throw new Error('Uma inspeção não pode instalar, substituir ou remover peças.');
    if (input.warranty) {
      if (!input.warranty.endDate && input.warranty.endOdometerKm === undefined)
        throw new Error('A garantia precisa de um vencimento por data, KM ou ambos.');
      if (input.warranty.endDate && input.warranty.endDate < input.performedDate)
        throw new Error('A garantia não pode vencer antes da realização do serviço.');
      if (
        input.warranty.endOdometerKm !== undefined &&
        input.warranty.endOdometerKm < input.odometerKm
      )
        throw new Error('A garantia não pode vencer antes do KM da realização.');
    }

    const occurrenceId = uid('occ');
    let parts = [...current.parts];
    let componentStates = [...current.componentStates];
    const changedParts = new Map<string, PartInstance>();
    const changedStates = new Map<string, AppData['componentStates'][number]>();
    const occurrencePartActions: PartAction[] = [];

    const replacePart = (value: PartInstance) => {
      changedParts.set(value.id, value);
      parts = parts.some((item) => item.id === value.id)
        ? parts.map((item) => (item.id === value.id ? value : item))
        : [value, ...parts];
    };
    const replaceState = (value: AppData['componentStates'][number]) => {
      changedStates.set(value.id, value);
      componentStates = componentStates.map((item) => (item.id === value.id ? value : item));
    };

    input.partActions.forEach((actionInput) => {
      const component = getComponent(actionInput.componentDefinitionId);
      const state = componentStates.find(
        (item) => item.componentDefinitionId === actionInput.componentDefinitionId
      );
      if (!component || !state) throw new Error('Componente da ação de peça não encontrado.');
      const currentPart = parts.find((item) => item.id === state.currentPartInstanceId);
      let actionPartId = currentPart?.id;

      if (actionInput.action === 'installed' || actionInput.action === 'replaced') {
        if (!actionInput.newPart?.name.trim())
          throw new Error('Informe o nome da nova peça instalada.');
        if (actionInput.action === 'installed' && currentPart)
          throw new Error(`Use “Substituir” para ${component.name}, que já possui uma peça.`);
        if (actionInput.action === 'replaced' && !currentPart)
          throw new Error(`Não há peça atual em ${component.name} para substituir.`);

        const newPart: PartInstance = {
          ...audit(),
          id: uid('part'),
          componentDefinitionId: component.id,
          name: actionInput.newPart.name.trim(),
          brand: actionInput.newPart.brand?.trim() || undefined,
          model: actionInput.newPart.model?.trim() || undefined,
          partCode: actionInput.newPart.partCode?.trim() || undefined,
          conditionAtInstall: actionInput.newPart.conditionAtInstall,
          priorLifeKnown: actionInput.newPart.priorLifeKnown,
          initialConditionNotes: actionInput.newPart.initialConditionNotes?.trim() || undefined,
          technicalConditionData: {},
          installDate: input.performedDate,
          installOdometerKm: input.odometerKm,
          status: 'installed',
          purchasePriceCents: actionInput.newPart.purchasePriceCents,
          observations: actionInput.observations?.trim() ?? '',
          installationOccurrenceId: occurrenceId
        };

        if (currentPart) {
          replacePart({
            ...currentPart,
            status: 'replaced',
            removalDate: input.performedDate,
            removalOdometerKm: input.odometerKm,
            removalReason: actionInput.observations?.trim() || undefined,
            replacedByPartInstanceId: newPart.id,
            removalOccurrenceId: occurrenceId,
            revision: currentPart.revision + 1,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email ?? 'local'
          });
        }
        replacePart(newPart);
        replaceState({
          ...installPart(state, newPart),
          updatedBy: user?.email ?? 'local'
        });
        actionPartId = newPart.id;
      } else if (actionInput.action === 'removed') {
        if (!currentPart)
          throw new Error(`Não há peça instalada em ${component.name} para remover.`);
        replacePart({
          ...currentPart,
          status: 'removed_discarded',
          removalDate: input.performedDate,
          removalOdometerKm: input.odometerKm,
          removalReason: actionInput.observations?.trim() || undefined,
          removalOccurrenceId: occurrenceId,
          revision: currentPart.revision + 1,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.email ?? 'local'
        });
        replaceState({
          ...removePart(state, component).state,
          updatedBy: user?.email ?? 'local'
        });
      } else if (!currentPart) {
        throw new Error(`Não há peça instalada em ${component.name} para registrar esta ação.`);
      }

      occurrencePartActions.push({
        id: uid('part-action'),
        componentDefinitionId: component.id,
        partInstanceId: actionPartId,
        action: actionInput.action,
        observations: actionInput.observations?.trim() || undefined
      });
    });

    if (plan.type === 'inspection' && plan.componentDefinitionId) {
      const inspectedState = componentStates.find(
        (item) => item.componentDefinitionId === plan.componentDefinitionId
      );
      occurrencePartActions.push({
        id: uid('part-action'),
        componentDefinitionId: plan.componentDefinitionId,
        partInstanceId: inspectedState?.currentPartInstanceId,
        action: 'inspected',
        observations: input.inspection?.observations.trim() || undefined
      });
    }

    const occurrence: MaintenanceOccurrence = {
      ...audit(),
      id: occurrenceId,
      maintenancePlanId: id,
      performedDate: input.performedDate,
      odometerKm: input.odometerKm,
      status: 'completed',
      workshopOrProvider: input.workshopOrProvider,
      observations: input.observations,
      expense: input.expense,
      partActions: occurrencePartActions,
      inspectionResult: input.inspection?.result,
      inspectionObservations: input.inspection?.observations.trim() || undefined
    };
    const cycle = nextCycle(plan, input.odometerKm, input.performedDate);
    const updatedPlan: MaintenancePlan = {
      ...plan,
      ...cycle,
      status: plan.recurrenceType === 'none' ? 'archived' : 'ok',
      isActive: plan.recurrenceType !== 'none',
      revision: plan.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };

    const warranty: Warranty | undefined = input.warranty
      ? {
          ...audit(),
          id: uid('warranty'),
          type: 'service',
          maintenanceOccurrenceId: occurrence.id,
          startDate: input.performedDate,
          startOdometerKm: input.odometerKm,
          endDate: input.warranty.endDate,
          endOdometerKm: input.warranty.endOdometerKm,
          provider: input.warranty.provider?.trim() || input.workshopOrProvider,
          terms: input.warranty.terms?.trim() || undefined,
          documentUrl: input.warranty.documentUrl?.trim() || undefined,
          observations: input.warranty.observations.trim()
        }
      : undefined;

    const resolvedIssues = current.issues
      .filter((issue) => input.resolveIssueIds?.includes(issue.id))
      .map((issue) => ({
        ...issue,
        status: 'resolved' as const,
        resolvedDate: input.performedDate,
        relatedMaintenanceOccurrenceId: occurrence.id,
        revision: issue.revision + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email ?? 'local'
      }));
    const inspectionIssue: Issue | undefined =
      input.inspection?.createIssue && input.inspection.result !== 'satisfactory'
        ? {
            ...audit(),
            id: uid('issue'),
            title: `Resultado da inspeção: ${plan.title}`,
            description:
              input.inspection.observations.trim() ||
              'A inspeção identificou um ponto que precisa de acompanhamento.',
            componentDefinitionId: plan.componentDefinitionId,
            relatedPartInstanceIds: occurrencePartActions[0]?.partInstanceId
              ? [occurrencePartActions[0].partInstanceId]
              : undefined,
            relatedMaintenancePlanId: plan.id,
            relatedMaintenanceOccurrenceId: occurrence.id,
            priority: input.inspection.result === 'problem' ? 'high' : 'medium',
            status: 'identified',
            identifiedDate: input.performedDate,
            identifiedOdometerKm: input.odometerKm,
            observations: input.inspection.observations.trim()
          }
        : undefined;
    const changedIssues = [...resolvedIssues, ...(inspectionIssue ? [inspectionIssue] : [])];
    const issues = [
      ...(inspectionIssue ? [inspectionIssue] : []),
      ...current.issues.map(
        (issue) => resolvedIssues.find((updated) => updated.id === issue.id) ?? issue
      )
    ];

    const base = {
      ...current,
      parts,
      componentStates,
      occurrences: [occurrence, ...current.occurrences],
      issues,
      warranties: warranty ? [warranty, ...current.warranties] : current.warranties,
      maintenancePlans: current.maintenancePlans.map((item) =>
        item.id === id ? updatedPlan : item
      )
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    await runMutation(`maintenance:complete:${id}`, async () => {
      await ensureNoConflict('maintenancePlan', plan, updatedPlan);
      await Promise.all(
        [...changedParts.values()].map(async (changed) => {
          const original = current.parts.find((item) => item.id === changed.id);
          if (original) await ensureNoConflict('part', original, changed);
        })
      );
      await Promise.all(
        [...changedStates.values()].map(async (changed) => {
          const original = current.componentStates.find((item) => item.id === changed.id);
          if (original) await ensureNoConflict('componentState', original, changed);
        })
      );
      await Promise.all(
        resolvedIssues.map(async (changed) => {
          const original = current.issues.find((item) => item.id === changed.id);
          if (original) await ensureNoConflict('issue', original, changed);
        })
      );
      if (database.current)
        await saveMaintenanceCompletion(database.current, {
          occurrence,
          plan: updatedPlan,
          parts: [...changedParts.values()],
          componentStates: [...changedStates.values()],
          warranty,
          issues: changedIssues,
          alerts: next.alerts,
          removedAlertIds: current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        });
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const updatePart: DataContextValue['updatePart'] = async (id, input) => {
    const current = data;
    const part = current.parts.find((item) => item.id === id);
    if (!part) throw new Error('Peça não encontrada.');
    if (!user?.demo && !repositories.current)
      throw new Error('O Firestore não está disponível para editar esta peça.');
    const updated: PartInstance = {
      ...part,
      ...input,
      name: input.name.trim(),
      manufacturer: input.manufacturer?.trim() || undefined,
      brand: input.brand?.trim() || undefined,
      model: input.model?.trim() || undefined,
      partCode: input.partCode?.trim() || undefined,
      initialConditionNotes: input.initialConditionNotes?.trim() || undefined,
      supplier: input.supplier?.trim() || undefined,
      observations: input.observations.trim(),
      revision: part.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    if (!updated.name) throw new Error('Informe o nome da peça.');
    if (updated.purchasePriceCents !== undefined && updated.purchasePriceCents < 0)
      throw new Error('O preço da peça não pode ser negativo.');
    await runMutation(`part:${id}`, async () => {
      await ensureNoConflict('part', part, updated);
      if (repositories.current) await repositories.current.parts.save(updated);
    });
    const next = {
      ...current,
      parts: current.parts.map((item) => (item.id === id ? updated : item))
    };
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const setComponentNotApplicable: DataContextValue['setComponentNotApplicable'] = async (
    componentDefinitionId,
    value
  ) => {
    const current = data;
    const component = getComponent(componentDefinitionId);
    const state = current.componentStates.find(
      (item) => item.componentDefinitionId === componentDefinitionId
    );
    if (!component || !state) throw new Error('Componente não encontrado.');
    if (value && state.currentPartInstanceId)
      throw new Error('Remova a peça instalada antes de marcar o componente como não aplicável.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para atualizar este componente.');
    const updatedState = {
      ...state,
      state: value
        ? ('notApplicable' as const)
        : component.isEssential
          ? ('missing' as const)
          : ('unknown' as const),
      revision: state.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    const base = {
      ...current,
      componentStates: current.componentStates.map((item) =>
        item.id === state.id ? updatedState : item
      )
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    const removedAlertIds = current.alerts
      .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.id);
    await runMutation(`component:${state.id}`, async () => {
      await ensureNoConflict('componentState', state, updatedState);
      if (database.current)
        await saveComponentStateChange(
          database.current,
          updatedState,
          next.alerts,
          removedAlertIds
        );
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const saveIssue: DataContextValue['saveIssue'] = async (input) => {
    const current = data;
    const existing = input.id ? current.issues.find((issue) => issue.id === input.id) : undefined;
    if (input.id && !existing) throw new Error('Problema não encontrado.');
    if (!input.title.trim() || !input.description.trim() || !input.identifiedDate)
      throw new Error('Informe título, descrição e data de identificação.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para salvar este problema.');
    const issue: Issue = {
      ...(existing ?? audit()),
      id: existing?.id ?? uid('issue'),
      title: input.title.trim(),
      description: input.description.trim(),
      componentDefinitionId: input.componentDefinitionId || undefined,
      relatedPartInstanceIds: input.relatedPartInstanceIds?.filter(Boolean),
      relatedMaintenancePlanId: input.relatedMaintenancePlanId || undefined,
      priority: input.priority,
      status: input.status,
      identifiedDate: input.identifiedDate,
      identifiedOdometerKm: input.identifiedOdometerKm,
      resolvedDate:
        input.status === 'resolved'
          ? (existing?.resolvedDate ?? todayISO())
          : input.status === 'ignored'
            ? existing?.resolvedDate
            : undefined,
      observations: input.observations.trim(),
      revision: existing ? existing.revision + 1 : 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    const base = {
      ...current,
      issues: existing
        ? current.issues.map((item) => (item.id === issue.id ? issue : item))
        : [issue, ...current.issues]
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    const removedAlertIds = current.alerts
      .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.id);
    await runMutation(`issue:${issue.id}`, async () => {
      if (existing) await ensureNoConflict('issue', existing, issue);
      if (database.current)
        await saveIssueChange(database.current, issue, next.alerts, removedAlertIds);
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
    return issue.id;
  };
  const setIssueStatus: DataContextValue['setIssueStatus'] = async (id, status) => {
    const current = data;
    const issue = current.issues.find((item) => item.id === id);
    if (!issue) throw new Error('Problema não encontrado.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para atualizar este problema.');
    const updated: Issue = {
      ...issue,
      status,
      resolvedDate: status === 'resolved' ? todayISO() : undefined,
      revision: issue.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    const base = {
      ...current,
      issues: current.issues.map((item) => (item.id === id ? updated : item))
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    const removedAlertIds = current.alerts
      .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.id);
    await runMutation(`issue:${id}`, async () => {
      await ensureNoConflict('issue', issue, updated);
      if (database.current)
        await saveIssueChange(database.current, updated, next.alerts, removedAlertIds);
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const setMaintenanceStatus: DataContextValue['setMaintenanceStatus'] = async (id, status) => {
    const current = data;
    const plan = current.maintenancePlans.find((item) => item.id === id);
    if (!plan) throw new Error('Plano de manutenção não encontrado.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para atualizar esta manutenção.');
    const updated: MaintenancePlan = {
      ...plan,
      status,
      revision: plan.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    const base = {
      ...current,
      maintenancePlans: current.maintenancePlans.map((item) => (item.id === id ? updated : item))
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    const removedAlertIds = current.alerts
      .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.id);
    await runMutation(`maintenance:${id}`, async () => {
      await ensureNoConflict('maintenancePlan', plan, updated);
      if (database.current)
        await saveMaintenancePlanStateChange(
          database.current,
          updated,
          next.alerts,
          removedAlertIds
        );
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const saveWarranty: DataContextValue['saveWarranty'] = async (input) => {
    const current = data;
    const existing = input.id
      ? current.warranties.find((warranty) => warranty.id === input.id)
      : undefined;
    if (input.id && !existing) throw new Error('Garantia não encontrada.');
    if (!input.endDate && input.endOdometerKm === undefined)
      throw new Error('Informe o vencimento da garantia por data, KM ou ambos.');
    if (input.type === 'part' && !input.partInstanceId)
      throw new Error('Selecione a peça vinculada à garantia.');
    if (input.type === 'service' && !input.maintenanceOccurrenceId)
      throw new Error('Selecione a manutenção vinculada à garantia.');
    if (input.startDate && input.endDate && input.endDate < input.startDate)
      throw new Error('A data final não pode ser anterior à data inicial.');
    if (
      input.startOdometerKm !== undefined &&
      input.endOdometerKm !== undefined &&
      input.endOdometerKm < input.startOdometerKm
    )
      throw new Error('O KM final não pode ser anterior ao KM inicial.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para salvar esta garantia.');
    const warranty: Warranty = {
      ...(existing ?? audit()),
      id: existing?.id ?? uid('warranty'),
      type: input.type,
      partInstanceId: input.type === 'part' ? input.partInstanceId : undefined,
      maintenanceOccurrenceId: input.type === 'service' ? input.maintenanceOccurrenceId : undefined,
      startDate: input.startDate,
      startOdometerKm: input.startOdometerKm,
      endDate: input.endDate,
      endOdometerKm: input.endOdometerKm,
      provider: input.provider?.trim() || undefined,
      terms: input.terms?.trim() || undefined,
      documentUrl: input.documentUrl?.trim() || undefined,
      observations: input.observations.trim(),
      revision: existing ? existing.revision + 1 : 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    const base = {
      ...current,
      warranties: existing
        ? current.warranties.map((item) => (item.id === warranty.id ? warranty : item))
        : [warranty, ...current.warranties]
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    const removedAlertIds = current.alerts
      .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
      .map((alert) => alert.id);
    await runMutation(`warranty:${warranty.id}`, async () => {
      if (existing) await ensureNoConflict('warranty', existing, warranty);
      if (database.current)
        await saveWarrantyChange(database.current, warranty, next.alerts, removedAlertIds);
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
    return warranty.id;
  };
  const updateRefund = async (
    occurrenceId: string,
    operation: { type: 'save'; amountCents: number; notes: string } | { type: 'remove' }
  ) => {
    const current = data;
    const occurrence = current.occurrences.find((item) => item.id === occurrenceId);
    if (!occurrence) throw new Error('Ocorrência de manutenção não encontrada.');
    if (!occurrence.expense) throw new Error('Esta manutenção não possui uma despesa registrada.');
    if (!user?.demo && !repositories.current)
      throw new Error('O Firestore não está disponível para atualizar o estorno.');
    const expense =
      operation.type === 'save'
        ? setExpenseRefund(occurrence.expense, operation.amountCents, operation.notes)
        : clearExpenseRefund(occurrence.expense);
    const updated: MaintenanceOccurrence = {
      ...occurrence,
      expense,
      revision: occurrence.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email ?? 'local'
    };
    await runMutation(`refund:${occurrenceId}`, async () => {
      await ensureNoConflict('maintenanceOccurrence', occurrence, updated);
      if (repositories.current) await repositories.current.maintenanceOccurrences.save(updated);
    });
    const next = {
      ...current,
      occurrences: current.occurrences.map((item) => (item.id === occurrenceId ? updated : item))
    };
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const saveRefund: DataContextValue['saveRefund'] = (occurrenceId, amountCents, notes) =>
    updateRefund(occurrenceId, { type: 'save', amountCents, notes });
  const removeRefund: DataContextValue['removeRefund'] = (occurrenceId) =>
    updateRefund(occurrenceId, { type: 'remove' });
  const addDocument: DataContextValue['addDocument'] = async (input) => {
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para salvar o documento.');
    const current = data;
    const document = {
      ...audit(),
      id: uid('doc'),
      status: 'pending',
      observations: '',
      ...input
    } as DocumentRecord;
    const base = { ...current, documents: [document, ...current.documents] };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    await runMutation('document:add', async () => {
      if (database.current)
        await saveDocumentChange(
          database.current,
          document,
          next.alerts,
          current.alerts
            .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
            .map((alert) => alert.id)
        );
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const markAlertSeen: DataContextValue['markAlertSeen'] = async (id) => {
    const current = data;
    const alerts = current.alerts.map((item) => (item.id === id ? { ...item, seen: true } : item));
    const alert = alerts.find((item) => item.id === id);
    if (!alert) throw new Error('Alerta não encontrado.');
    if (!user?.demo && !repositories.current)
      throw new Error('O Firestore não está disponível para atualizar o alerta.');
    await runMutation(`alert:${id}`, async () => {
      if (repositories.current) await repositories.current.alerts.save(alert);
    });
    const next = { ...current, alerts };
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const snoozeAlert: DataContextValue['snoozeAlert'] = async (id) => {
    const current = data;
    const alerts = current.alerts.map((item) =>
      item.id === id && item.canSnooze
        ? {
            ...item,
            snoozedUntilDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
          }
        : item
    );
    const alert = alerts.find((item) => item.id === id);
    if (!alert) throw new Error('Alerta não encontrado.');
    if (!user?.demo && !repositories.current)
      throw new Error('O Firestore não está disponível para adiar o alerta.');
    await runMutation(`alert:${id}`, async () => {
      if (repositories.current) await repositories.current.alerts.save(alert);
    });
    const next = { ...current, alerts };
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
  const updateSettings: DataContextValue['updateSettings'] = async (settings) => {
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para salvar as configurações.');
    const current = data;
    const next = recalculate({ ...current, settings }, current.vehicle.currentOdometer);
    await runMutation('settings:default', async () => {
      if (database.current) await setDoc(doc(database.current, 'appSettings/default'), settings);
    });
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };

  const replaceConflictEntity = (
    current: AppData,
    entityType: ConflictEntity,
    value: ConflictValue
  ): AppData => {
    let next = current;
    switch (entityType) {
      case 'vehicle':
        next = { ...current, vehicle: value as Vehicle };
        break;
      case 'odometer': {
        const record = value as OdometerRecord;
        const odometer = current.odometer.some((item) => item.id === record.id)
          ? current.odometer.map((item) => (item.id === record.id ? record : item))
          : [record, ...current.odometer];
        next = recalculate({ ...current, odometer }, getCurrentOdometer(odometer));
        break;
      }
      case 'componentState':
        next = {
          ...current,
          componentStates: current.componentStates.map((item) =>
            item.id === value.id ? (value as ComponentState) : item
          )
        };
        break;
      case 'part':
        next = {
          ...current,
          parts: current.parts.map((item) =>
            item.id === value.id ? (value as PartInstance) : item
          )
        };
        break;
      case 'maintenanceOccurrence':
        next = {
          ...current,
          occurrences: current.occurrences.map((item) =>
            item.id === value.id ? (value as MaintenanceOccurrence) : item
          )
        };
        break;
      case 'maintenancePlan':
        next = {
          ...current,
          maintenancePlans: current.maintenancePlans.map((item) =>
            item.id === value.id ? (value as MaintenancePlan) : item
          )
        };
        break;
      case 'issue':
        next = {
          ...current,
          issues: current.issues.map((item) => (item.id === value.id ? (value as Issue) : item))
        };
        break;
      case 'warranty':
        next = {
          ...current,
          warranties: current.warranties.map((item) =>
            item.id === value.id ? (value as Warranty) : item
          )
        };
        break;
      case 'document':
        next = {
          ...current,
          documents: current.documents.map((item) =>
            item.id === value.id ? (value as DocumentRecord) : item
          )
        };
        break;
    }
    return { ...next, alerts: mergeAlertState(deriveAlerts(next), current.alerts) };
  };

  const saveConflictEntity = async (entityType: ConflictEntity, value: ConflictValue) => {
    const repos = repositories.current;
    if (!repos) return;
    switch (entityType) {
      case 'vehicle':
        await repos.vehicles.save(value as Vehicle);
        break;
      case 'odometer':
        await repos.odometer.save(value as OdometerRecord);
        break;
      case 'componentState':
        await repos.componentStates.save(value as ComponentState);
        break;
      case 'part':
        await repos.parts.save(value as PartInstance);
        break;
      case 'maintenanceOccurrence':
        await repos.maintenanceOccurrences.save(value as MaintenanceOccurrence);
        break;
      case 'maintenancePlan':
        await repos.maintenancePlans.save(value as MaintenancePlan);
        break;
      case 'issue':
        await repos.issues.save(value as Issue);
        break;
      case 'warranty':
        await repos.warranties.save(value as Warranty);
        break;
      case 'document':
        await repos.documents.save(value as DocumentRecord);
        break;
    }
  };

  const resolveConflict: DataContextValue['resolveConflict'] = async (id, choice, manualValue) => {
    const conflict = conflicts.find((item) => item.id === id);
    if (!conflict) throw new Error('Conflito não encontrado.');
    let resolved =
      choice === 'remote' ? conflict.remote : choice === 'local' ? conflict.local : manualValue;
    if (!resolved) throw new Error('Informe a versão revisada manualmente.');
    if (choice !== 'remote') {
      const metadata = resolved as ConflictValue & AuditMetadata;
      resolved = {
        ...resolved,
        id: conflict.entityId,
        createdAt: conflict.remote.createdAt,
        createdBy: conflict.remote.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email ?? 'local',
        revision: Math.max(metadata.revision ?? 0, conflict.remote.revision) + 1
      } as ConflictValue;
      await runMutation(`conflict:${id}`, async () => {
        await saveConflictEntity(conflict.entityType, resolved as ConflictValue);
      });
    }
    setDataState((current) => replaceConflictEntity(current, conflict.entityType, resolved));
    setConflicts((current) => current.filter((item) => item.id !== id));
  };
  const resetDemo = () => {
    localStorage.removeItem(storageKey);
    setDataState(structuredClone(seedData));
  };
  const value = useMemo(
    () => ({
      data,
      syncState,
      conflicts,
      addOdometer,
      updateOdometer,
      removeOdometer,
      saveVehicle,
      saveMaintenance,
      completeMaintenance,
      updatePart,
      setComponentNotApplicable,
      saveIssue,
      setIssueStatus,
      setMaintenanceStatus,
      saveWarranty,
      saveRefund,
      removeRefund,
      addDocument,
      markAlertSeen,
      snoozeAlert,
      updateSettings,
      resolveConflict,
      resetDemo
    }),
    [data, syncState, conflicts]
  );
  if (loading)
    return (
      <div className="app-loading">
        <Skeleton lines={6} />
      </div>
    );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData deve ser usado dentro de DataProvider.');
  return value;
}
