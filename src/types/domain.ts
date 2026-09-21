export const SCHEMA_VERSION = 1;
export const ACTIVE_VEHICLE_ID = 'sandero';

export type ISODate = string;
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'ok' | 'upcoming' | 'overdue' | 'in_progress' | 'archived';
export type RecurrenceType = 'none' | 'km' | 'time' | 'km_or_time';
export type ComponentStatus = 'installed' | 'missing' | 'unknown' | 'notApplicable';
export type AlertPriority = 'info' | 'attention' | 'important' | 'critical';

export interface AuditMetadata {
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  revision: number;
  archivedAt?: string;
  archivedBy?: string;
}

export interface Vehicle extends AuditMetadata {
  id: string;
  manufacturer: string;
  model: string;
  trim: string;
  year: number;
  modelYear: number;
  engine: string;
  fuelType: string;
  color: string;
  plate: string;
  renavam: string;
  chassis: string;
  currentOdometer: number;
  imageUrl?: string;
  observations: string;
}

export interface OdometerRecord extends AuditMetadata {
  id: string;
  vehicleId: string;
  odometerKm: number;
  recordedDate: ISODate;
  observations: string;
}

export interface TechnicalField {
  id: string;
  label: string;
  unit?: string;
  type: 'number' | 'text' | 'date';
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  system: string;
  positionId: string;
  isEssential: boolean;
  isOptional: boolean;
  searchTerms: string[];
  technicalFieldSchema: TechnicalField[];
  sortOrder: number;
}

export interface ComponentState extends AuditMetadata {
  id: string;
  componentDefinitionId: string;
  currentPartInstanceId?: string;
  state: ComponentStatus;
  observations: string;
}

export interface PartInstance extends AuditMetadata {
  id: string;
  componentDefinitionId: string;
  name: string;
  manufacturer?: string;
  brand?: string;
  model?: string;
  partCode?: string;
  conditionAtInstall: 'new' | 'used' | 'reconditioned' | 'unknown';
  priorLifeKnown: boolean;
  initialConditionNotes?: string;
  technicalConditionData: Record<string, string | number>;
  installDate?: ISODate;
  installOdometerKm?: number;
  removalDate?: ISODate;
  removalOdometerKm?: number;
  removalReason?: string;
  replacedByPartInstanceId?: string;
  status: 'installed' | 'replaced' | 'removed_discarded';
  supplier?: string;
  purchasePriceCents?: number;
  observations: string;
  installationOccurrenceId?: string;
  removalOccurrenceId?: string;
}

export interface MaintenancePlan extends AuditMetadata {
  id: string;
  title: string;
  type: 'preventive_recurring' | 'preventive_one_time' | 'corrective' | 'inspection';
  componentDefinitionId?: string;
  relatedPartInstanceId?: string;
  description: string;
  priority: Priority;
  status: MaintenanceStatus;
  recurrenceType: RecurrenceType;
  intervalKm?: number;
  intervalDays?: number;
  intervalMonths?: number;
  intervalYears?: number;
  nextDueKm?: number;
  nextDueDate?: ISODate;
  isActive: boolean;
  observations: string;
}

export interface MaintenanceOccurrence extends AuditMetadata {
  id: string;
  maintenancePlanId: string;
  performedDate: ISODate;
  odometerKm: number;
  status: 'completed';
  workshopOrProvider?: string;
  observations: string;
  expense?: ExpenseBreakdown;
  partActions: PartAction[];
}

export interface PartAction {
  id: string;
  componentDefinitionId: string;
  partInstanceId?: string;
  action: 'installed' | 'replaced' | 'removed' | 'inspected' | 'repaired';
  observations?: string;
}

export interface Issue extends AuditMetadata {
  id: string;
  title: string;
  description: string;
  componentDefinitionId?: string;
  priority: Priority;
  status: 'identified' | 'pending' | 'in_progress' | 'postponed' | 'resolved' | 'ignored';
  identifiedDate: ISODate;
  identifiedOdometerKm?: number;
  resolvedDate?: ISODate;
  observations: string;
}

export interface Warranty extends AuditMetadata {
  id: string;
  type: 'part' | 'service';
  partInstanceId?: string;
  maintenanceOccurrenceId?: string;
  startDate?: ISODate;
  startOdometerKm?: number;
  endDate?: ISODate;
  endOdometerKm?: number;
  provider?: string;
  terms?: string;
  documentUrl?: string;
  observations: string;
}

export interface ExpenseBreakdown {
  partsTotalCents: number;
  laborCostCents: number;
  otherCostCents: number;
  manualTotalCents?: number;
  manualOverrideEnabled: boolean;
  refundStatus: 'none' | 'partial' | 'full';
  refundedAmountCents: number;
  refundNotes?: string;
}

export interface DocumentRecord extends AuditMetadata {
  id: string;
  type: 'ipva' | 'licensing' | 'insurance' | 'custom';
  customTypeName?: string;
  referenceYear: number;
  name: string;
  referenceNumber?: string;
  issueDate?: ISODate;
  dueDate?: ISODate;
  amountCents?: number;
  status: 'pending' | 'paid' | 'expired' | 'active';
  documentUrl?: string;
  observations: string;
}

export interface AlertItem {
  id: string;
  sourceType: 'maintenance' | 'part' | 'issue' | 'warranty' | 'document';
  sourceId: string;
  title: string;
  description: string;
  priority: AlertPriority;
  seen: boolean;
  hidden: boolean;
  resolved: boolean;
  canSnooze: boolean;
  snoozedUntilDate?: ISODate;
  snoozedUntilKm?: number;
  dueDate?: ISODate;
  dueKm?: number;
  href: string;
}

export interface TimelineEvent {
  id: string;
  date: ISODate;
  type: string;
  title: string;
  detail: string;
  odometerKm?: number;
  href?: string;
}

export interface AppSettings {
  alertKmThreshold: number;
  alertDaysThreshold: number;
  persistentFilters: boolean;
}

export interface AppData {
  vehicle: Vehicle;
  odometer: OdometerRecord[];
  componentStates: ComponentState[];
  parts: PartInstance[];
  maintenancePlans: MaintenancePlan[];
  occurrences: MaintenanceOccurrence[];
  issues: Issue[];
  warranties: Warranty[];
  documents: DocumentRecord[];
  alerts: AlertItem[];
  settings: AppSettings;
}
