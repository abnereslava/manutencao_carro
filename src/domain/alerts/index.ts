import { getComponent } from '../../catalog/components/sandero';
import { todayISO } from '../../lib/format';
import type { AlertItem, AppData } from '../../types/domain';
import { calculateMaintenanceStatus, daysUntil } from '../maintenance';
import { calculateWarrantyState } from '../warranty';

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
    alerts.push({
      id: `maintenance-${plan.id}`,
      sourceType: 'maintenance',
      sourceId: plan.id,
      title: plan.title,
      description:
        status === 'overdue'
          ? 'Manutenção com limite atingido.'
          : 'Manutenção dentro da faixa de antecedência.',
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
      dueDate: plan.nextDueDate,
      dueKm: plan.nextDueKm,
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
      href: `/parts/${component.id}`
    });
  }
  for (const issue of data.issues.filter(
    (item) => !['resolved', 'ignored'].includes(item.status)
  )) {
    if (issue.priority !== 'urgent' && issue.priority !== 'high') continue;
    alerts.push({
      id: `issue-${issue.id}`,
      sourceType: 'issue',
      sourceId: issue.id,
      title: issue.title,
      description: 'Problema aberto com prioridade elevada.',
      priority: issue.priority === 'urgent' ? 'critical' : 'important',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
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
    alerts.push({
      id: `warranty-${warranty.id}`,
      sourceType: 'warranty',
      sourceId: warranty.id,
      title: `Garantia ${state === 'expired' ? 'vencida' : 'próxima do vencimento'}`,
      description: warranty.provider ?? 'Garantia cadastrada',
      priority: state === 'expired' ? 'important' : 'attention',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      dueDate: warranty.endDate,
      dueKm: warranty.endOdometerKm,
      href: warranty.partInstanceId
        ? `/parts/${data.parts.find((item) => item.id === warranty.partInstanceId)?.componentDefinitionId ?? ''}`
        : '/history'
    });
  }
  for (const document of data.documents) {
    if (!document.dueDate || document.status === 'paid') continue;
    const days = daysUntil(document.dueDate, today);
    if (days > data.settings.alertDaysThreshold) continue;
    alerts.push({
      id: `document-${document.id}`,
      sourceType: 'document',
      sourceId: document.id,
      title: `${document.name} ${days <= 0 ? 'vencido' : 'próximo'}`,
      description: days <= 0 ? `${Math.abs(days)} dia(s) de atraso.` : `Vence em ${days} dia(s).`,
      priority: days <= 0 ? 'critical' : 'important',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      dueDate: document.dueDate,
      href: '/documents'
    });
  }
  return alerts;
}

export function mergeAlertState(derived: AlertItem[], previous: AlertItem[]): AlertItem[] {
  return derived.map((item) => {
    const old = previous.find((candidate) => candidate.id === item.id);
    return old
      ? {
          ...item,
          seen: old.seen,
          hidden: old.hidden,
          snoozedUntilDate: old.snoozedUntilDate,
          snoozedUntilKm: old.snoozedUntilKm
        }
      : item;
  });
}
