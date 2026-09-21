import { SANDERO_COMPONENTS } from '../catalog/components/sandero';
import type { AppData, AuditMetadata } from '../types/domain';
import { SCHEMA_VERSION } from '../types/domain';

const now = new Date().toISOString();
const audit: AuditMetadata = {
  schemaVersion: SCHEMA_VERSION,
  createdAt: now,
  createdBy: 'demo@carango.local',
  updatedAt: now,
  updatedBy: 'demo@carango.local',
  revision: 1
};
const state = (
  id: string,
  status: 'installed' | 'missing' | 'unknown' | 'notApplicable',
  part?: string
) => ({
  ...audit,
  id: `state-${id}`,
  componentDefinitionId: id,
  currentPartInstanceId: part,
  state: status,
  observations: ''
});

export const seedData: AppData = {
  vehicle: {
    ...audit,
    id: 'sandero',
    manufacturer: 'Renault',
    model: 'Sandero',
    trim: 'Expression',
    year: 2012,
    modelYear: 2012,
    engine: '1.6 8V Flex',
    fuelType: 'Flex',
    color: 'Prata',
    plate: '',
    renavam: '',
    chassis: '',
    currentOdometer: 148250,
    observations: 'Companheiro de estrada desde 2012.'
  },
  odometer: [
    {
      ...audit,
      id: 'odo-3',
      vehicleId: 'sandero',
      odometerKm: 148250,
      recordedDate: '2026-09-20',
      observations: 'Leitura atual'
    },
    {
      ...audit,
      id: 'odo-2',
      vehicleId: 'sandero',
      odometerKm: 147380,
      recordedDate: '2026-08-15',
      observations: ''
    },
    {
      ...audit,
      id: 'odo-1',
      vehicleId: 'sandero',
      odometerKm: 145900,
      recordedDate: '2026-06-02',
      observations: 'Após viagem'
    }
  ],
  componentStates: SANDERO_COMPONENTS.map((item) => {
    if (item.id === 'cabin-filter') return state(item.id, 'missing');
    if (item.id === 'air-conditioning') return state(item.id, 'notApplicable');
    if (
      [
        'engine-oil',
        'oil-filter',
        'battery',
        'front-brake-pads',
        'timing-belt',
        'wiper-blades'
      ].includes(item.id)
    )
      return state(item.id, 'installed', `part-${item.id}`);
    return state(item.id, 'unknown');
  }),
  parts: [
    {
      ...audit,
      id: 'part-battery',
      componentDefinitionId: 'battery',
      name: 'Bateria 60 Ah',
      brand: 'Moura',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: { initialTestNotes: '12,7 V' },
      installDate: '2025-02-12',
      installOdometerKm: 132100,
      status: 'installed',
      purchasePriceCents: 51990,
      observations: ''
    },
    {
      ...audit,
      id: 'part-engine-oil',
      componentDefinitionId: 'engine-oil',
      name: 'Óleo do motor',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: {},
      installDate: '2026-02-18',
      installOdometerKm: 140200,
      status: 'installed',
      observations: ''
    },
    {
      ...audit,
      id: 'part-oil-filter',
      componentDefinitionId: 'oil-filter',
      name: 'Filtro de óleo',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: {},
      installDate: '2026-02-18',
      installOdometerKm: 140200,
      status: 'installed',
      observations: ''
    },
    {
      ...audit,
      id: 'part-timing-belt',
      componentDefinitionId: 'timing-belt',
      name: 'Kit correia dentada',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: {},
      installDate: '2023-04-10',
      installOdometerKm: 101500,
      status: 'installed',
      observations: ''
    },
    {
      ...audit,
      id: 'part-front-brake-pads',
      componentDefinitionId: 'front-brake-pads',
      name: 'Jogo de pastilhas',
      brand: 'Cobreq',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: { thicknessMm: 12 },
      installDate: '2025-11-04',
      installOdometerKm: 136800,
      status: 'installed',
      observations: ''
    },
    {
      ...audit,
      id: 'part-wiper-blades',
      componentDefinitionId: 'wiper-blades',
      name: 'Par de palhetas',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: {},
      installDate: '2026-01-10',
      installOdometerKm: 139300,
      status: 'installed',
      observations: ''
    }
  ],
  maintenancePlans: [
    {
      ...audit,
      id: 'maint-oil',
      title: 'Troca de óleo e filtro',
      type: 'preventive_recurring',
      componentDefinitionId: 'engine-oil',
      description: 'Troca periódica do óleo e filtro do motor.',
      priority: 'high',
      status: 'upcoming',
      recurrenceType: 'km_or_time',
      intervalKm: 10000,
      intervalMonths: 12,
      nextDueKm: 150200,
      nextDueDate: '2027-02-18',
      isActive: true,
      observations: ''
    },
    {
      ...audit,
      id: 'maint-timing',
      title: 'Revisar correia dentada',
      type: 'preventive_recurring',
      componentDefinitionId: 'timing-belt',
      description: 'Verificar conjunto e histórico.',
      priority: 'urgent',
      status: 'overdue',
      recurrenceType: 'km_or_time',
      intervalKm: 40000,
      intervalYears: 4,
      nextDueKm: 141500,
      nextDueDate: '2027-04-10',
      isActive: true,
      observations: ''
    },
    {
      ...audit,
      id: 'maint-brakes',
      title: 'Inspecionar freios dianteiros',
      type: 'inspection',
      componentDefinitionId: 'front-brake-pads',
      description: 'Medir pastilhas e discos.',
      priority: 'medium',
      status: 'upcoming',
      recurrenceType: 'km',
      intervalKm: 10000,
      nextDueKm: 149000,
      isActive: true,
      observations: ''
    },
    {
      ...audit,
      id: 'maint-coolant',
      title: 'Trocar fluido de arrefecimento',
      type: 'preventive_recurring',
      componentDefinitionId: 'coolant',
      description: '',
      priority: 'medium',
      status: 'ok',
      recurrenceType: 'time',
      intervalYears: 2,
      nextDueDate: '2027-11-12',
      isActive: true,
      observations: ''
    }
  ],
  occurrences: [
    {
      ...audit,
      id: 'occ-oil',
      maintenancePlanId: 'maint-oil',
      performedDate: '2026-02-18',
      odometerKm: 140200,
      status: 'completed',
      workshopOrProvider: 'Oficina do Bairro',
      observations: 'Óleo e filtro substituídos.',
      expense: {
        partsTotalCents: 18990,
        laborCostCents: 7000,
        otherCostCents: 0,
        manualOverrideEnabled: false,
        refundStatus: 'none',
        refundedAmountCents: 0
      },
      partActions: [
        {
          id: 'pa-1',
          componentDefinitionId: 'engine-oil',
          partInstanceId: 'part-engine-oil',
          action: 'installed'
        }
      ]
    }
  ],
  issues: [
    {
      ...audit,
      id: 'issue-noise',
      title: 'Ruído na suspensão dianteira',
      description: 'Batida seca em piso irregular.',
      componentDefinitionId: 'front-shock-left',
      priority: 'high',
      status: 'pending',
      identifiedDate: '2026-09-03',
      identifiedOdometerKm: 147900,
      observations: 'Mais perceptível em baixa velocidade.'
    }
  ],
  warranties: [
    {
      ...audit,
      id: 'warranty-battery',
      type: 'part',
      partInstanceId: 'part-battery',
      startDate: '2025-02-12',
      startOdometerKm: 132100,
      endDate: '2027-02-12',
      provider: 'Autoelétrica Central',
      terms: '24 meses',
      observations: ''
    }
  ],
  documents: [
    {
      ...audit,
      id: 'doc-license',
      type: 'licensing',
      referenceYear: 2026,
      name: 'Licenciamento 2026',
      dueDate: '2026-10-31',
      amountCents: 17408,
      status: 'pending',
      observations: ''
    },
    {
      ...audit,
      id: 'doc-ipva',
      type: 'ipva',
      referenceYear: 2026,
      name: 'IPVA 2026',
      dueDate: '2026-03-20',
      amountCents: 128430,
      status: 'paid',
      observations: ''
    },
    {
      ...audit,
      id: 'doc-insurance',
      type: 'insurance',
      referenceYear: 2026,
      name: 'Seguro',
      issueDate: '2026-05-10',
      dueDate: '2027-05-10',
      amountCents: 178000,
      status: 'active',
      observations: ''
    }
  ],
  alerts: [
    {
      id: 'alert-timing',
      sourceType: 'maintenance',
      sourceId: 'maint-timing',
      title: 'Correia dentada vencida',
      description: 'Limite excedido em 6.750 km.',
      priority: 'critical',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      dueKm: 141500,
      href: '/maintenance'
    },
    {
      id: 'alert-cabin',
      sourceType: 'part',
      sourceId: 'cabin-filter',
      title: 'Filtro de cabine faltando',
      description: 'Componente opcional marcado como faltando.',
      priority: 'attention',
      seen: false,
      hidden: false,
      resolved: false,
      canSnooze: true,
      href: '/parts/cabin-filter'
    },
    {
      id: 'alert-license',
      sourceType: 'document',
      sourceId: 'doc-license',
      title: 'Licenciamento próximo',
      description: 'Vence em 40 dias.',
      priority: 'important',
      seen: true,
      hidden: false,
      resolved: false,
      canSnooze: true,
      dueDate: '2026-10-31',
      href: '/documents'
    }
  ],
  settings: { alertKmThreshold: 1000, alertDaysThreshold: 60, persistentFilters: true }
};
