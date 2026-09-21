import type { ComponentDefinition } from '../../types/domain';

const component = (
  id: string,
  name: string,
  system: string,
  category: string,
  positionId: string,
  isEssential = true,
  technicalFieldSchema: ComponentDefinition['technicalFieldSchema'] = []
): ComponentDefinition => ({
  id,
  name,
  system,
  category,
  positionId,
  isEssential,
  isOptional: !isEssential,
  searchTerms: [name, system, category],
  technicalFieldSchema,
  sortOrder: 0
});

const tireFields = [{ id: 'treadDepthMm', label: 'Sulco', unit: 'mm', type: 'number' as const }];
const brakeFields = [
  { id: 'thicknessMm', label: 'Espessura', unit: 'mm', type: 'number' as const }
];

export const SANDERO_COMPONENTS: ComponentDefinition[] = [
  component('engine-oil', 'Óleo do motor', 'Motor', 'Lubrificação', 'engine-bay'),
  component('oil-filter', 'Filtro de óleo', 'Motor', 'Filtros', 'engine-bay'),
  component('air-filter', 'Filtro de ar', 'Motor', 'Filtros', 'engine-bay'),
  component('fuel-filter', 'Filtro de combustível', 'Alimentação', 'Filtros', 'underbody'),
  component('spark-plugs', 'Velas de ignição', 'Motor', 'Ignição', 'engine-bay'),
  component('timing-belt', 'Correia dentada', 'Motor', 'Distribuição', 'engine-bay'),
  component('accessory-belt', 'Correia de acessórios', 'Motor', 'Acessórios', 'engine-bay'),
  component('battery', 'Bateria', 'Elétrica', 'Alimentação', 'engine-bay', true, [
    { id: 'initialTestNotes', label: 'Teste inicial', type: 'text' }
  ]),
  component('alternator', 'Alternador', 'Elétrica', 'Carga', 'engine-bay'),
  component('starter', 'Motor de partida', 'Elétrica', 'Partida', 'engine-bay'),
  component('coolant', 'Fluido de arrefecimento', 'Arrefecimento', 'Fluidos', 'engine-bay'),
  component('radiator', 'Radiador', 'Arrefecimento', 'Troca térmica', 'engine-bay'),
  component('water-pump', 'Bomba d’água', 'Arrefecimento', 'Circulação', 'engine-bay'),
  component(
    'front-brake-pads',
    'Pastilhas de freio dianteiras',
    'Freios',
    'Atrito',
    'front-axle',
    true,
    brakeFields
  ),
  component(
    'front-brake-discs',
    'Discos de freio dianteiros',
    'Freios',
    'Atrito',
    'front-axle',
    true,
    brakeFields
  ),
  component('rear-brakes', 'Freios traseiros', 'Freios', 'Atrito', 'rear-axle'),
  component('brake-fluid', 'Fluido de freio', 'Freios', 'Fluidos', 'engine-bay'),
  component(
    'front-shock-left',
    'Amortecedor dianteiro esquerdo',
    'Suspensão',
    'Amortecedores',
    'front-left'
  ),
  component(
    'front-shock-right',
    'Amortecedor dianteiro direito',
    'Suspensão',
    'Amortecedores',
    'front-right'
  ),
  component('rear-shocks', 'Amortecedores traseiros', 'Suspensão', 'Amortecedores', 'rear-axle'),
  component(
    'front-tire-left',
    'Pneu dianteiro esquerdo',
    'Rodas e pneus',
    'Pneus',
    'front-left',
    true,
    tireFields
  ),
  component(
    'front-tire-right',
    'Pneu dianteiro direito',
    'Rodas e pneus',
    'Pneus',
    'front-right',
    true,
    tireFields
  ),
  component(
    'rear-tire-left',
    'Pneu traseiro esquerdo',
    'Rodas e pneus',
    'Pneus',
    'rear-left',
    true,
    tireFields
  ),
  component(
    'rear-tire-right',
    'Pneu traseiro direito',
    'Rodas e pneus',
    'Pneus',
    'rear-right',
    true,
    tireFields
  ),
  component('spare-tire', 'Estepe', 'Rodas e pneus', 'Pneus', 'trunk', false, tireFields),
  component('clutch', 'Embreagem', 'Transmissão', 'Acoplamento', 'engine-bay'),
  component('gearbox-oil', 'Óleo da transmissão', 'Transmissão', 'Fluidos', 'engine-bay'),
  component('steering', 'Sistema de direção', 'Direção', 'Direção', 'front-axle'),
  component('exhaust', 'Sistema de escapamento', 'Escape', 'Exaustão', 'underbody'),
  component('catalytic-converter', 'Catalisador', 'Escape', 'Emissões', 'underbody'),
  component('headlight-left', 'Farol esquerdo', 'Iluminação', 'Faróis', 'front-left'),
  component('headlight-right', 'Farol direito', 'Iluminação', 'Faróis', 'front-right'),
  component('wiper-blades', 'Palhetas do limpador', 'Visibilidade', 'Limpadores', 'general'),
  component('cabin-filter', 'Filtro de cabine', 'Climatização', 'Filtros', 'cabin', false),
  component('air-conditioning', 'Ar-condicionado', 'Climatização', 'Conforto', 'cabin', false)
].map((item, index) => ({ ...item, sortOrder: index + 1 }));

export const SYSTEMS = [...new Set(SANDERO_COMPONENTS.map((item) => item.system))];
export const getComponent = (id?: string) => SANDERO_COMPONENTS.find((item) => item.id === id);
export function searchComponents(query: string) {
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  if (!normalized) return SANDERO_COMPONENTS;
  return SANDERO_COMPONENTS.filter((item) =>
    [item.name, item.system, item.category, ...item.searchTerms]
      .join(' ')
      .toLocaleLowerCase('pt-BR')
      .includes(normalized)
  );
}
