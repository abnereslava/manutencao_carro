import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { Skeleton } from '../../components/ui';
import { SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { getInitializedDataStore } from '../../data/firebase/config';
import { createRepositories } from '../../data/repositories/firestoreRepositories';
import { seedData } from '../../data/seed';
import { deriveAlerts, mergeAlertState } from '../../domain/alerts';
import { calculateMaintenanceStatus, nextCycle } from '../../domain/maintenance';
import { getCurrentOdometer, validateOdometerReading } from '../../domain/odometer';
import { todayISO, uid } from '../../lib/format';
import {
  SCHEMA_VERSION,
  type AppData,
  type DocumentRecord,
  type MaintenanceOccurrence,
  type MaintenancePlan,
  type OdometerRecord,
  type Vehicle
} from '../../types/domain';
import { useAuth } from './AuthProvider';

interface DataContextValue {
  data: AppData;
  addOdometer: (value: number, date: string, notes: string) => string | null;
  removeOdometer: (id: string) => void;
  saveVehicle: (vehicle: Vehicle) => void;
  saveMaintenance: (
    input: Pick<
      MaintenancePlan,
      | 'title'
      | 'type'
      | 'priority'
      | 'recurrenceType'
      | 'intervalKm'
      | 'intervalMonths'
      | 'nextDueKm'
      | 'nextDueDate'
      | 'componentDefinitionId'
      | 'description'
      | 'observations'
    > & {
      initialPerformedDate?: string;
      initialPerformedKm?: number;
    }
  ) => void;
  completeMaintenance: (
    id: string,
    date: string,
    km: number,
    provider: string,
    costCents: number
  ) => void;
  addDocument: (
    input: Pick<DocumentRecord, 'name' | 'type' | 'referenceYear' | 'dueDate' | 'amountCents'>
  ) => void;
  markAlertSeen: (id: string) => void;
  snoozeAlert: (id: string) => void;
  updateSettings: (settings: AppData['settings']) => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const storageKey = 'carango-demo-data-v1';
type Repositories = ReturnType<typeof createRepositories>;

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
  const repositories = useRef<Repositories | null>(null);
  const database = useRef<Firestore | null>(null);

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
            initialStates.forEach((state) => void repos.componentStates.save(state));
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

  const persist = useCallback(
    (updater: (current: AppData) => AppData) => {
      setDataState((current) => {
        const next = updater(current);
        if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [user?.demo]
  );
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

  const addOdometer = (value: number, date: string, notes: string) => {
    const error = validateOdometerReading(data.odometer, value);
    if (error) return error;
    const record: OdometerRecord = {
      ...audit(),
      id: uid('odo'),
      vehicleId: data.vehicle.id,
      odometerKm: value,
      recordedDate: date,
      observations: notes
    };
    persist((current) => {
      const next = recalculate(
        { ...current, odometer: [record, ...current.odometer] },
        getCurrentOdometer([record, ...current.odometer])
      );
      void repositories.current?.odometer.save(record);
      void repositories.current?.vehicles.save(next.vehicle);
      next.maintenancePlans.forEach(
        (plan) => void repositories.current?.maintenancePlans.save(plan)
      );
      return next;
    });
    return null;
  };
  const removeOdometer = (id: string) =>
    persist((current) => {
      const list = current.odometer.filter((item) => item.id !== id);
      const next = recalculate({ ...current, odometer: list }, getCurrentOdometer(list));
      void repositories.current?.odometer.remove(id);
      void repositories.current?.vehicles.save(next.vehicle);
      return next;
    });
  const saveVehicle = (vehicle: Vehicle) =>
    persist((current) => {
      const nextVehicle = {
        ...vehicle,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email ?? 'local',
        revision: vehicle.revision + 1
      };
      void repositories.current?.vehicles.save(nextVehicle);
      return { ...current, vehicle: nextVehicle };
    });
  const saveMaintenance: DataContextValue['saveMaintenance'] = (input) =>
    persist((current) => {
      const { initialPerformedDate, initialPerformedKm, ...planInput } = input;
      const plan = {
        ...audit(),
        id: uid('maint'),
        status: 'ok',
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

      void repositories.current?.maintenancePlans.save(plan);
      if (occurrence) void repositories.current?.maintenanceOccurrences.save(occurrence);

      const base = {
        ...current,
        maintenancePlans: [plan, ...current.maintenancePlans],
        occurrences: occurrence ? [occurrence, ...current.occurrences] : current.occurrences
      };
      return { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    });
  const completeMaintenance = (
    id: string,
    date: string,
    km: number,
    provider: string,
    costCents: number
  ) =>
    persist((current) => {
      const plan = current.maintenancePlans.find((item) => item.id === id);
      if (!plan) return current;
      const occurrence: MaintenanceOccurrence = {
        ...audit(),
        id: uid('occ'),
        maintenancePlanId: id,
        performedDate: date,
        odometerKm: km,
        status: 'completed',
        workshopOrProvider: provider,
        observations: '',
        expense: {
          partsTotalCents: 0,
          laborCostCents: costCents,
          otherCostCents: 0,
          manualOverrideEnabled: false,
          refundStatus: 'none',
          refundedAmountCents: 0
        },
        partActions: []
      };
      const cycle = nextCycle(plan, km, date);
      const updatedPlan: MaintenancePlan = {
        ...plan,
        ...cycle,
        status: plan.recurrenceType === 'none' ? 'archived' : 'ok',
        isActive: plan.recurrenceType !== 'none',
        revision: plan.revision + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email ?? 'local'
      };
      void repositories.current?.maintenanceOccurrences.save(occurrence);
      void repositories.current?.maintenancePlans.save(updatedPlan);
      const base = {
        ...current,
        occurrences: [occurrence, ...current.occurrences],
        maintenancePlans: current.maintenancePlans.map((item) =>
          item.id === id ? updatedPlan : item
        )
      };
      return { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    });
  const addDocument: DataContextValue['addDocument'] = (input) =>
    persist((current) => {
      const document = {
        ...audit(),
        id: uid('doc'),
        status: 'pending',
        observations: '',
        ...input
      } as DocumentRecord;
      void repositories.current?.documents.save(document);
      const base = { ...current, documents: [document, ...current.documents] };
      return { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    });
  const markAlertSeen = (id: string) =>
    persist((current) => {
      const alerts = current.alerts.map((item) =>
        item.id === id ? { ...item, seen: true } : item
      );
      const alert = alerts.find((item) => item.id === id);
      if (alert) void repositories.current?.alerts.save(alert);
      return { ...current, alerts };
    });
  const snoozeAlert = (id: string) =>
    persist((current) => {
      const alerts = current.alerts.map((item) =>
        item.id === id && item.canSnooze
          ? {
              ...item,
              snoozedUntilDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
            }
          : item
      );
      const alert = alerts.find((item) => item.id === id);
      if (alert) void repositories.current?.alerts.save(alert);
      return { ...current, alerts };
    });
  const updateSettings = (settings: AppData['settings']) =>
    persist((current) => {
      if (database.current) void setDoc(doc(database.current, 'appSettings/default'), settings);
      return recalculate({ ...current, settings }, current.vehicle.currentOdometer);
    });
  const resetDemo = () => {
    localStorage.removeItem(storageKey);
    setDataState(structuredClone(seedData));
  };
  const value = useMemo(
    () => ({
      data,
      addOdometer,
      removeOdometer,
      saveVehicle,
      saveMaintenance,
      completeMaintenance,
      addDocument,
      markAlertSeen,
      snoozeAlert,
      updateSettings,
      resetDemo
    }),
    [data]
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
