import type {
  AlertItem,
  ComponentDefinition,
  ComponentState,
  PartInstance
} from '../../types/domain';

export function installPart(state: ComponentState, part: PartInstance): ComponentState {
  return {
    ...state,
    state: 'installed',
    currentPartInstanceId: part.id,
    revision: state.revision + 1,
    updatedAt: new Date().toISOString()
  };
}

export function removePart(
  state: ComponentState,
  component: ComponentDefinition
): { state: ComponentState; alert?: AlertItem } {
  const next = {
    ...state,
    currentPartInstanceId: undefined,
    state: component.isEssential ? ('missing' as const) : ('unknown' as const),
    revision: state.revision + 1,
    updatedAt: new Date().toISOString()
  };
  if (!component.isEssential) return { state: next };
  return {
    state: next,
    alert: {
      id: `missing-${component.id}`,
      sourceType: 'part',
      sourceId: component.id,
      title: 'Peça essencial faltando',
      description: `${component.name} está sem peça instalada.`,
      priority: 'critical',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: false,
      href: `/parts/${component.id}`
    }
  };
}
