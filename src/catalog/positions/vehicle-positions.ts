export const VEHICLE_POSITIONS = [
  { id: 'general', label: 'Geral', group: 'Veículo' },
  { id: 'engine-bay', label: 'Cofre do motor', group: 'Dianteira' },
  { id: 'front-left', label: 'Dianteira esquerda', group: 'Dianteira' },
  { id: 'front-right', label: 'Dianteira direita', group: 'Dianteira' },
  { id: 'front-axle', label: 'Eixo dianteiro', group: 'Dianteira' },
  { id: 'rear-left', label: 'Traseira esquerda', group: 'Traseira' },
  { id: 'rear-right', label: 'Traseira direita', group: 'Traseira' },
  { id: 'rear-axle', label: 'Eixo traseiro', group: 'Traseira' },
  { id: 'cabin', label: 'Cabine', group: 'Interior' },
  { id: 'dashboard', label: 'Painel', group: 'Interior' },
  { id: 'underbody', label: 'Parte inferior', group: 'Estrutura' },
  { id: 'trunk', label: 'Porta-malas', group: 'Traseira' }
] as const;

export function searchPositions(query: string) {
  const normalized = query.toLocaleLowerCase('pt-BR');
  return VEHICLE_POSITIONS.filter((position) =>
    `${position.label} ${position.group}`.toLocaleLowerCase('pt-BR').includes(normalized)
  );
}

export const positionLabel = (id: string) =>
  VEHICLE_POSITIONS.find((item) => item.id === id)?.label ?? id;
