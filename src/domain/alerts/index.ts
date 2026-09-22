import { getComponent } from '../../catalog/components/sandero';
import { todayISO } from '../../lib/format';
import type { AlertItem, AppData } from '../../types/domain';
import { calculateMaintenanceStatus, daysUntil } from '../maintenance';
import { calculateWarrantyState } from '../warranty';

const priorityOrder: AlertItem['priority'][] = ['critical', 'important', 'attention', 'info'];

function urgentCriterion(
  remainingKm: number | undefined,
  remainingDays: number | undefined,
  kmThreshold: number,
  daysThreshold: number
): AlertItem['urgentCriterion'] {
  if (remainingKm === undefined) return remainingDays === undefined ? undefined : 'date';
  if (remainingDays === undefined) return 'km';
  if (remainingKm <= 0 && remainingDays <= 0) return 'both';
  if (remainingKm <= 0) return 'km';
  if (remainingDays <= 0) return 'date';
  const kmRatio = remainingKm / Math.max(kmThreshold, 1);
  const dayRatio = remainingDays / Math.max(daysThreshold, 1);
  if (kmRatio === dayRatio) return 'both';
  return kmRatio < dayRatio ? 'km' : 'date';
}

function limitDescription(remainingKm?: number, remainingDays?: number) {
  if (remainingKm !== undefined && remainingDays !== undefined) {
    if (remainingKm > 0 && remainingDays > 0)
      return `Faltam ${remainingKm.toLocaleString('pt-BR')} km ou ${remainingDays} dia(s).`;
    if (remainingKm < 0 && remainingDays < 0)
      return `${Math.abs(remainingKm).toLocaleString('pt-BR')} km e ${Math.abs(remainingDays)} dia(s) de atraso.`;
  }
  const values: string[] = [];
  if (remainingKm !== undefined)
    values.push(
      remainingKm > 0
        ? `faltam ${remainingKm.toLocaleString('pt-BR')} km`
        : remainingKm < 0
          ? `${Math.abs(remainingKm).toLocaleString('pt-BR')} km de atraso`
          : 'limite de KM atingido'
    );
  if (remainingDays !== undefined)
    values.push(
      remainingDays > 0
        ? `faltam ${remainingDays} dia(s)`
        : remainingDays < 0
          ? `${Math.abs(remainingDays)} dia(s) de atraso`
          : 'vence hoje'
    );
  if (!values.length) return 'Limite cadastrado sem distância calculável.';
  const text = values.join(' ou ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}

export function isAlertSnoozed(alert: AlertItem, currentKm: number, today = todayISO()): boolean {
  const gates: boolean[] = [];
  if (alert.snoozedUntilDate) gates.push(today < alert.snoozedUntilDate);
  if (alert.snoozedUntilKm !== undefined) gates.push(currentKm < alert.snoozedUntilKm);
  return gates.length > 0 && gates.every(Boolean);
}

export function isAlertActive(alert: AlertItem, currentKm: number, today = todayISO()): boolean {
  return !alert.resolved && !alert.hidden && !isAlertSnoozed(alert, currentKm, today);
}

export function deriveAlerts(data: AppData): AlertItem[] {
  const today = todayISO();
  const alerts: AlertItem[] = [];
  for (const plan of data.maintenancePlans) {
    const status = calculateMaintenanceStatus(plan, {
      currentKm: data.vehicle.currentOdometer,
      today,
      alertKmThreshold: data.settings.alertKmThreshold,
      alertDaysThreshold: data.settings.alertDaysThreshold
    });
    if (status !== 'overdue' && status !== 'upcoming') continue;
    const component = getComponent(plan.componentDefinitionId);
    const remainingKm =
      plan.nextDueKm === undefined ? undefined : plan.nextDueKm - data.vehicle.currentOdometer;
    const remainingDays = plan.nextDueDate ? daysUntil(plan.nextDueDate, today) : undefined;
    alerts.push({
      id: `maintenance-${plan.id}`,
      sourceType: 'maintenance',
      sourceId: plan.id,
      title: plan.title,
      description: limitDescription(remainingKm, remainingDays),
      priority:
        status === 'overdue'
          ? 'critical'
          : plan.priority === 'high' || plan.priority === 'urgent'
            ? 'important'
            : 'attention',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      canHide: true,
      dueDate: plan.nextDueDate,
      dueKm: plan.nextDueKm,
      remainingDays,
      remainingKm,
      urgentCriterion: urgentCriterion(
        remainingKm,
        remainingDays,
        data.settings.alertKmThreshold,
        data.settings.alertDaysThreshold
      ),
      componentName: component?.name,
      href: `/maintenance/${plan.id}`
    });
  }
  for (const state of data.componentStates.filter((item) => item.state === 'missing')) {
    const component = getComponent(state.componentDefinitionId);
    if (!component) continue;
    alerts.push({
      id: `missing-${component.id}`,
      sourceType: 'part',
      sourceId: component.id,
      title: `${component.name} faltando`,
      description: component.isEssential
        ? 'Componente essencial sem peça instalada.'
        : 'Componente marcado como faltando.',
      priority: component.isEssential ? 'critical' : 'attention',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: !component.isEssential,
      canHide: !component.isEssential,
      componentName: component.name,
      href: `/parts/${component.id}`
    });
  }
  for (const issue of data.issues.filter(
    (item) => !['resolved', 'ignored'].includes(item.status)
  )) {
    if (issue.priority !== 'urgent' && issue.priority !== 'high') continue;
    const component = getComponent(issue.componentDefinitionId);
    alerts.push({
      id: `issue-${issue.id}`,
      sourceType: 'issue',
      sourceId: issue.id,
      title: issue.title,
      description: `Problema aberto com prioridade ${issue.priority === 'urgent' ? 'urgente' : 'alta'}.`,
      priority: issue.priority === 'urgent' ? 'critical' : 'important',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      canHide: true,
      componentName: component?.name,
      href: '/maintenance?tab=issues'
    });
  }
  for (const warranty of data.warranties) {
    const state = calculateWarrantyState(
      warranty,
      data.vehicle.currentOdometer,
      today,
      data.settings.alertDaysThreshold,
      data.settings.alertKmThreshold
    );
    if (state === 'active') continue;
    const part = data.parts.find((item) => item.id === warranty.partInstanceId);
    const occurrence = data.occurrences.find(
      (item) => item.id === warranty.maintenanceOccurrenceId
    );
    const plan = data.maintenancePlans.find((item) => item.id === occurrence?.maintenancePlanId);
    const component = getComponent(part?.componentDefinitionId ?? plan?.componentDefinitionId);
    const remainingKm =
      warranty.endOdometerKm === undefined
        ? undefined
        : warranty.endOdometerKm - data.vehicle.currentOdometer;
    const remainingDays = warranty.endDate ? daysUntil(warranty.endDate, today) : undefined;
    alerts.push({
      id: `warranty-${warranty.id}`,
      sourceType: 'warranty',
      sourceId: warranty.id,
      title: `Garantia ${state === 'expired' ? 'vencida' : 'próxima do vencimento'}`,
      description: `${limitDescription(remainingKm, remainingDays)}${warranty.provider ? ` ${warranty.provider}.` : ''}`,
      priority: state === 'expired' ? 'important' : 'attention',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      canHide: true,
      dueDate: warranty.endDate,
      dueKm: warranty.endOdometerKm,
      remainingDays,
      remainingKm,
      urgentCriterion: urgentCriterion(
        remainingKm,
        remainingDays,
        data.settings.alertKmThreshold,
        data.settings.alertDaysThreshold
      ),
      componentName: component?.name,
      href: part ? `/parts/${part.componentDefinitionId}` : '/history'
    });
  }
  for (const document of data.documents) {
    if (!document.dueDate || document.status === 'paid') continue;
    const remainingDays = daysUntil(document.dueDate, today);
    if (remainingDays > data.settings.alertDaysThreshold) continue;
    alerts.push({
      id: `document-${document.id}`,
      sourceType: 'document',
      sourceId: document.id,
      title: `${document.name} ${remainingDays <= 0 ? 'vencido' : 'próximo'}`,
      description: limitDescription(undefined, remainingDays),
      priority: remainingDays <= 0 ? 'critical' : 'important',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      canHide: true,
      dueDate: document.dueDate,
      remainingDays,
      urgentCriterion: 'date',
      href: '/documents'
    });
  }
  return alerts;
}

export function mergeAlertState(derived: AlertItem[], previous: AlertItem[]): AlertItem[] {
  return derived.map((item) => {
    const old = previous.find((candidate) => candidate.id === item.id);
    if (!old) return item;
    const worsened = priorityOrder.indexOf(item.priority) < priorityOrder.indexOf(old.priority);
    if (worsened) return item;
    return {
      ...item,
      seen: old.seen,
      hidden: item.canHide ? old.hidden : false,
      snoozedUntilDate: old.snoozedUntilDate,
      snoozedUntilKm: old.snoozedUntilKm
    };
  });
}
