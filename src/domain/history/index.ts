import { getComponent } from '../../catalog/components/sandero';
import { formatMoney } from '../../lib/format';
import type { AppData, TimelineEvent } from '../../types/domain';
import { calculateExpense } from '../expenses';

const actionLabels = {
  installed: 'Instalação',
  replaced: 'Substituição',
  removed: 'Remoção',
  repaired: 'Reparo',
  inspected: 'Inspeção'
} as const;

export interface OccurrenceDependency {
  id: string;
  label: string;
  blocking: boolean;
}

export interface OccurrenceDependencyAnalysis {
  canDelete: boolean;
  dependencies: OccurrenceDependency[];
}

export function analyzeOccurrenceDependencies(
  data: AppData,
  occurrenceId: string
): OccurrenceDependencyAnalysis {
  const occurrence = data.occurrences.find((item) => item.id === occurrenceId);
  if (!occurrence)
    return {
      canDelete: false,
      dependencies: [{ id: 'missing', label: 'Ocorrência não encontrada.', blocking: true }]
    };
  const dependencies: OccurrenceDependency[] = [];
  const add = (id: string, label: string, blocking: boolean) => {
    if (!dependencies.some((item) => item.id === id)) dependencies.push({ id, label, blocking });
  };
  const plan = data.maintenancePlans.find((item) => item.id === occurrence.maintenancePlanId);
  add(
    `plan:${occurrence.maintenancePlanId}`,
    `Próximo ciclo de ${plan?.title ?? 'manutenção relacionada'} será recalculado`,
    false
  );
  if (occurrence.expense)
    add(`expense:${occurrence.id}`, 'Gasto vinculado à ocorrência será removido', false);

  data.warranties
    .filter((item) => item.maintenanceOccurrenceId === occurrenceId)
    .forEach((item) => add(`warranty:${item.id}`, 'Garantia de serviço vinculada', false));

  data.issues
    .filter((item) => item.relatedMaintenanceOccurrenceId === occurrenceId)
    .forEach((item) => {
      const generatedByInspection =
        item.title.startsWith('Resultado da inspeção:') &&
        item.createdAt === item.updatedAt &&
        item.status === 'identified';
      add(
        `issue:${item.id}`,
        generatedByInspection
          ? `Problema gerado pela inspeção: ${item.title}`
          : `Problema posteriormente relacionado: ${item.title}`,
        !generatedByInspection
      );
    });

  occurrence.partActions.forEach((action) => {
    if (!action.partInstanceId || !['installed', 'replaced', 'removed'].includes(action.action))
      return;
    const part = data.parts.find((item) => item.id === action.partInstanceId);
    const component = getComponent(action.componentDefinitionId);
    if (!part) {
      add(
        `part-missing:${action.id}`,
        `Peça de ${component?.name ?? 'componente'} não encontrada`,
        true
      );
      return;
    }
    if (action.action === 'installed') {
      add(
        `part-origin:${part.id}`,
        `Estado anterior de ${component?.name ?? part.name} não é inequívoco`,
        true
      );
      return;
    }
    if (action.action === 'replaced') {
      const previous = data.parts.find(
        (item) =>
          item.replacedByPartInstanceId === part.id && item.removalOccurrenceId === occurrenceId
      );
      if (!previous)
        add(`part-origin:${part.id}`, `Peça anterior a ${part.name} não foi encontrada`, true);
      else
        add(
          `part-rollback:${part.id}`,
          `${part.name} será removida e ${previous.name} será restaurada`,
          false
        );
      const state = data.componentStates.find(
        (item) => item.componentDefinitionId === action.componentDefinitionId
      );
      if (state?.currentPartInstanceId !== part.id)
        add(`part-current:${part.id}`, `${part.name} já não é a peça atual`, true);
      if (
        (part.removalOccurrenceId && part.removalOccurrenceId !== occurrenceId) ||
        part.replacedByPartInstanceId
      )
        add(`part-later:${part.id}`, `${part.name} possui substituição ou remoção posterior`, true);
      const laterActions = data.occurrences.filter(
        (item) =>
          item.id !== occurrenceId &&
          item.performedDate >= occurrence.performedDate &&
          item.partActions.some((candidate) => candidate.partInstanceId === part.id)
      );
      laterActions.forEach((item) =>
        add(`occurrence:${item.id}`, `Ocorrência posterior usa ${part.name}`, true)
      );
      data.warranties
        .filter((item) => item.partInstanceId === part.id)
        .forEach((item) => add(`warranty:${item.id}`, `Garantia da peça ${part.name}`, false));
      data.issues
        .filter((item) => item.relatedPartInstanceIds?.includes(part.id))
        .forEach((item) =>
          add(`issue-part:${item.id}`, `Problema relacionado a ${part.name}`, true)
        );
    }
    if (action.action === 'removed') {
      if (part.removalOccurrenceId !== occurrenceId)
        add(`part-removal:${part.id}`, `A remoção de ${part.name} já foi alterada`, true);
      else add(`part-rollback:${part.id}`, `${part.name} será restaurada como peça atual`, false);
      const laterActions = data.occurrences.filter(
        (item) =>
          item.id !== occurrenceId &&
          item.performedDate >= occurrence.performedDate &&
          item.partActions.some((candidate) => candidate.partInstanceId === part.id)
      );
      laterActions.forEach((item) =>
        add(`occurrence:${item.id}`, `Ocorrência posterior usa ${part.name}`, true)
      );
    }
  });

  return {
    canDelete: !dependencies.some((item) => item.blocking),
    dependencies
  };
}

export function deriveTimeline(data: AppData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  data.odometer.forEach((item) =>
    events.push({
      id: `odometer:${item.id}`,
      date: item.recordedDate,
      type: 'odometer',
      category: 'odometer',
      title: 'Quilometragem registrada',
      detail: item.observations || 'Leitura do odômetro',
      odometerKm: item.odometerKm,
      sourceType: 'odometer',
      sourceId: item.id,
      href: '/vehicle'
    })
  );

  data.occurrences.forEach((occurrence) => {
    const plan = data.maintenancePlans.find((item) => item.id === occurrence.maintenancePlanId);
    const component = getComponent(plan?.componentDefinitionId);
    const category = plan?.type === 'inspection' ? 'inspection' : 'maintenance';
    const metadata = {
      system: component?.system,
      componentDefinitionId: component?.id,
      positionId: component?.positionId,
      maintenancePlanId: plan?.id
    };
    events.push({
      id: `occurrence:${occurrence.id}`,
      date: occurrence.performedDate,
      type: category,
      category,
      title: plan?.title ?? 'Manutenção concluída',
      detail:
        category === 'inspection'
          ? `Inspeção ${occurrence.inspectionResult ?? 'registrada'}`
          : (occurrence.workshopOrProvider ?? 'Prestador não informado'),
      odometerKm: occurrence.odometerKm,
      sourceType: 'maintenanceOccurrence',
      sourceId: occurrence.id,
      href: plan ? `/maintenance/${plan.id}` : undefined,
      ...metadata
    });

    occurrence.partActions.forEach((action) => {
      if (category === 'inspection' && action.action === 'inspected') return;
      const actionComponent = getComponent(action.componentDefinitionId);
      const part = data.parts.find((item) => item.id === action.partInstanceId);
      events.push({
        id: `part-action:${occurrence.id}:${action.id}`,
        date: occurrence.performedDate,
        type: `part_${action.action}`,
        category: 'part',
        title: `${actionLabels[action.action]} — ${part?.name ?? actionComponent?.name ?? 'Peça'}`,
        detail: action.observations || plan?.title || 'Ação registrada em manutenção',
        odometerKm: occurrence.odometerKm,
        sourceType: 'maintenanceOccurrence',
        sourceId: occurrence.id,
        system: actionComponent?.system,
        componentDefinitionId: actionComponent?.id,
        positionId: actionComponent?.positionId,
        partInstanceId: action.partInstanceId,
        maintenancePlanId: plan?.id,
        href: actionComponent ? `/parts/${actionComponent.id}` : undefined
      });
    });

    if (occurrence.expense) {
      const expense = calculateExpense(occurrence.expense);
      if (expense.grossAmountCents > 0) {
        events.push({
          id: `expense:${occurrence.id}`,
          date: occurrence.performedDate,
          type: 'expense',
          category: 'expense',
          title: `Gasto — ${plan?.title ?? 'Manutenção'}`,
          detail: `Original ${formatMoney(expense.grossAmountCents)} · Líquido ${formatMoney(expense.netAmountCents)}`,
          odometerKm: occurrence.odometerKm,
          sourceType: 'expense',
          sourceId: occurrence.id,
          href: '/expenses',
          ...metadata
        });
      }
    }
  });

  const installationActionPartIds = new Set(
    data.occurrences.flatMap((occurrence) =>
      occurrence.partActions
        .filter((action) => action.action === 'installed' || action.action === 'replaced')
        .flatMap((action) => (action.partInstanceId ? [action.partInstanceId] : []))
    )
  );
  const removalActionPartIds = new Set(
    data.occurrences.flatMap((occurrence) =>
      occurrence.partActions
        .filter((action) => action.action === 'removed')
        .flatMap((action) => (action.partInstanceId ? [action.partInstanceId] : []))
    )
  );

  data.parts.forEach((part) => {
    const component = getComponent(part.componentDefinitionId);
    const metadata = {
      system: component?.system,
      componentDefinitionId: component?.id,
      partInstanceId: part.id,
      positionId: component?.positionId,
      sourceType: 'part' as const,
      sourceId: part.id,
      href: component ? `/parts/${component.id}` : undefined
    };
    if (
      part.installDate &&
      !part.installationOccurrenceId &&
      !installationActionPartIds.has(part.id)
    )
      events.push({
        id: `part-install:${part.id}`,
        date: part.installDate,
        type: 'part_installed',
        category: 'part',
        title: `Instalação — ${part.name}`,
        detail: component?.name ?? 'Componente não identificado',
        odometerKm: part.installOdometerKm,
        ...metadata
      });
    if (part.removalDate && !part.removalOccurrenceId && !removalActionPartIds.has(part.id))
      events.push({
        id: `part-remove:${part.id}`,
        date: part.removalDate,
        type: part.status === 'replaced' ? 'part_replaced' : 'part_removed',
        category: 'part',
        title: `${part.status === 'replaced' ? 'Substituição' : 'Remoção'} — ${part.name}`,
        detail: part.removalReason || component?.name || 'Ação de peça',
        odometerKm: part.removalOdometerKm,
        ...metadata
      });
  });

  data.issues.forEach((issue) => {
    const component = getComponent(issue.componentDefinitionId);
    events.push({
      id: `issue:${issue.id}`,
      date: issue.identifiedDate,
      type: 'issue',
      category: 'issue',
      title: issue.title,
      detail: `Problema ${issue.status === 'resolved' ? 'resolvido' : 'identificado'}`,
      odometerKm: issue.identifiedOdometerKm,
      sourceType: 'issue',
      sourceId: issue.id,
      issueId: issue.id,
      system: component?.system,
      componentDefinitionId: component?.id,
      positionId: component?.positionId,
      partInstanceId: issue.relatedPartInstanceIds?.[0],
      maintenancePlanId: issue.relatedMaintenancePlanId,
      href: '/maintenance?tab=issues'
    });
  });

  data.documents.forEach((document) =>
    events.push({
      id: `document:${document.id}`,
      date: document.issueDate ?? document.dueDate ?? `${document.referenceYear}-01-01`,
      type: 'document',
      category: 'document',
      title: document.name,
      detail: `Documento ${document.status}`,
      sourceType: 'document',
      sourceId: document.id,
      href: '/documents'
    })
  );

  data.warranties.forEach((warranty) => {
    const part = data.parts.find((item) => item.id === warranty.partInstanceId);
    const occurrence = data.occurrences.find(
      (item) => item.id === warranty.maintenanceOccurrenceId
    );
    const plan = data.maintenancePlans.find((item) => item.id === occurrence?.maintenancePlanId);
    const component = getComponent(part?.componentDefinitionId ?? plan?.componentDefinitionId);
    events.push({
      id: `warranty:${warranty.id}`,
      date: warranty.startDate ?? warranty.endDate ?? warranty.createdAt.slice(0, 10),
      type: 'warranty',
      category: 'warranty',
      title: warranty.type === 'part' ? 'Garantia de peça' : 'Garantia de serviço',
      detail: warranty.provider ?? 'Prestador não informado',
      odometerKm: warranty.startOdometerKm,
      sourceType: 'warranty',
      sourceId: warranty.id,
      system: component?.system,
      componentDefinitionId: component?.id,
      positionId: component?.positionId,
      partInstanceId: part?.id,
      maintenancePlanId: plan?.id
    });
  });

  return events.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
