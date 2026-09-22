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
import { getComponent, SANDERO_COMPONENTS } from '../../catalog/components/sandero';
import { getInitializedDataStore } from '../../data/firebase/config';
import {
  createRepositories,
  saveComponentStateChange,
  saveMaintenanceCompletion
} from '../../data/repositories/firestoreRepositories';
import { seedData } from '../../data/seed';
import { deriveAlerts, mergeAlertState } from '../../domain/alerts';
import { calculateMaintenanceStatus, nextCycle } from '../../domain/maintenance';
import { getCurrentOdometer, validateOdometerReading } from '../../domain/odometer';
import { installPart, removePart } from '../../domain/parts';
import { todayISO, uid } from '../../lib/format';
import {
  SCHEMA_VERSION,
  type AppData,
  type DocumentRecord,
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
  ) => string;
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
  const saveMaintenance: DataContextValue['saveMaintenance'] = (input) => {
    const planId = uid('maint');
    persist((current) => {
      const { initialPerformedDate, initialPerformedKm, ...planInput } = input;
      const plan = {
        ...audit(),
        id: planId,
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
    return planId;
  };
  const completeMaintenance: DataContextValue['completeMaintenance'] = async (id, input) => {
    const current = data;
    const plan = current.maintenancePlans.find((item) => item.id === id);
    if (!plan) throw new Error('Plano de manutenção não encontrado.');
    if (!user?.demo && !database.current)
      throw new Error('O Firestore não está disponível para concluir esta manutenção.');
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
      partActions: occurrencePartActions
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

    const base = {
      ...current,
      parts,
      componentStates,
      occurrences: [occurrence, ...current.occurrences],
      warranties: warranty ? [warranty, ...current.warranties] : current.warranties,
      maintenancePlans: current.maintenancePlans.map((item) =>
        item.id === id ? updatedPlan : item
      )
    };
    const next = { ...base, alerts: mergeAlertState(deriveAlerts(base), current.alerts) };
    if (database.current) {
      await saveMaintenanceCompletion(database.current, {
        occurrence,
        plan: updatedPlan,
        parts: [...changedParts.values()],
        componentStates: [...changedStates.values()],
        warranty,
        alerts: next.alerts,
        removedAlertIds: current.alerts
          .filter((alert) => !next.alerts.some((item) => item.id === alert.id))
          .map((alert) => alert.id)
      });
    }
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
    if (repositories.current) await repositories.current.parts.save(updated);
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
    if (database.current)
      await saveComponentStateChange(database.current, updatedState, next.alerts, removedAlertIds);
    if (user?.demo) localStorage.setItem(storageKey, JSON.stringify(next));
    setDataState(next);
  };
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
      updatePart,
      setComponentNotApplicable,
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
