import type { MaintenancePlan, MaintenanceStatus } from '../../types/domain';

const DAY = 86_400_000;

export interface MaintenanceStateInput {
  currentKm: number;
  today: string;
  alertKmThreshold: number;
  alertDaysThreshold: number;
}

export function daysUntil(date: string, today: string): number {
  const due = new Date(`${date}T12:00:00`).getTime();
  const now = new Date(`${today}T12:00:00`).getTime();
  return Math.ceil((due - now) / DAY);
}

export function calculateMaintenanceStatus(
  plan: Pick<MaintenancePlan, 'isActive' | 'status' | 'nextDueKm' | 'nextDueDate'>,
  input: MaintenanceStateInput
): MaintenanceStatus {
  if (!plan.isActive) return 'archived';
  if (plan.status === 'pending') return 'pending';
  if (plan.status === 'in_progress') return 'in_progress';
  const kmRemaining = plan.nextDueKm === undefined ? Infinity : plan.nextDueKm - input.currentKm;
  const dayRemaining = plan.nextDueDate ? daysUntil(plan.nextDueDate, input.today) : Infinity;
  if (kmRemaining <= 0 || dayRemaining <= 0) return 'overdue';
  if (kmRemaining <= input.alertKmThreshold || dayRemaining <= input.alertDaysThreshold)
    return 'upcoming';
  return 'ok';
}

export function nextCycle(
  plan: Pick<
    MaintenancePlan,
    'recurrenceType' | 'intervalKm' | 'intervalDays' | 'intervalMonths' | 'intervalYears'
  >,
  performedKm: number,
  performedDate: string
) {
  const result: { nextDueKm?: number; nextDueDate?: string } = {};
  if ((plan.recurrenceType === 'km' || plan.recurrenceType === 'km_or_time') && plan.intervalKm)
    result.nextDueKm = performedKm + plan.intervalKm;
  if (plan.recurrenceType === 'time' || plan.recurrenceType === 'km_or_time') {
    const date = new Date(`${performedDate}T12:00:00`);
    if (plan.intervalDays) date.setDate(date.getDate() + plan.intervalDays);
    if (plan.intervalMonths) date.setMonth(date.getMonth() + plan.intervalMonths);
    if (plan.intervalYears) date.setFullYear(date.getFullYear() + plan.intervalYears);
    result.nextDueDate = date.toISOString().slice(0, 10);
  }
  return result;
}
