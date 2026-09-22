import { describe, expect, it } from 'vitest';
import { calculateExpense, clearExpenseRefund, setExpenseRefund } from './expenses';
import { analyzeOccurrenceDependencies, deriveTimeline } from './history';
import { calculateMaintenanceStatus, nextCycle } from './maintenance';
import { getCurrentOdometer, sortOdometerRecords, validateOdometerReading } from './odometer';
import { installPart, removePart } from './parts';
import { calculateWarrantyState } from './warranty';
import { seedData } from '../data/seed';
import type {
  ComponentDefinition,
  ComponentState,
  OdometerRecord,
  Warranty
} from '../types/domain';

const audit = {
  schemaVersion: 1,
  createdAt: '',
  createdBy: '',
  updatedAt: '',
  updatedBy: '',
  revision: 1
};
const records: OdometerRecord[] = [
  {
    ...audit,
    id: '1',
    vehicleId: 'car',
    odometerKm: 100,
    recordedDate: '2026-01-01',
    observations: ''
  },
  {
    ...audit,
    id: '2',
    vehicleId: 'car',
    odometerKm: 180,
    recordedDate: '2026-02-01',
    observations: ''
  }
];

describe('odômetro', () => {
  it('usa a maior leitura como KM atual e ordena sem mutar', () => {
    expect(getCurrentOdometer(records)).toBe(180);
    expect(sortOdometerRecords(records).map((item) => item.id)).toEqual(['2', '1']);
    expect(records[0].id).toBe('1');
  });
  it('bloqueia regressão e aceita avanço', () => {
    expect(validateOdometerReading(records, 170)).toContain('não pode');
    expect(validateOdometerReading(records, 200)).toBeNull();
  });
  it('permite corrigir a leitura atual para baixo sem ultrapassar a anterior', () => {
    expect(
      validateOdometerReading(records, 150, {
        editingId: '2',
        recordedDate: '2026-02-01'
      })
    ).toBeNull();
    expect(
      validateOdometerReading(records, 90, {
        editingId: '2',
        recordedDate: '2026-02-01'
      })
    ).toContain('anterior');
  });
  it('impede que uma correção histórica ultrapasse a leitura seguinte', () => {
    expect(
      validateOdometerReading(records, 150, {
        editingId: '1',
        recordedDate: '2026-01-01'
      })
    ).toBeNull();
    expect(
      validateOdometerReading(records, 200, {
        editingId: '1',
        recordedDate: '2026-01-01'
      })
    ).toContain('seguinte');
  });
  it('valida uma nova leitura retroativa contra a sequência cronológica', () => {
    expect(validateOdometerReading(records, 150, { recordedDate: '2026-01-15' })).toBeNull();
    expect(validateOdometerReading(records, 200, { recordedDate: '2026-01-15' })).toContain(
      'seguinte'
    );
  });
});

describe('manutenção', () => {
  const input = {
    currentKm: 148000,
    today: '2026-09-20',
    alertKmThreshold: 1000,
    alertDaysThreshold: 60
  };
  it('vence pelo primeiro limite atingido', () => {
    expect(
      calculateMaintenanceStatus(
        { isActive: true, status: 'ok', nextDueKm: 147000, nextDueDate: '2027-12-20' },
        input
      )
    ).toBe('overdue');
  });
  it('sinaliza proximidade por data ou KM', () => {
    expect(
      calculateMaintenanceStatus({ isActive: true, status: 'ok', nextDueKm: 148500 }, input)
    ).toBe('upcoming');
  });
  it('preserva pendência manual sem tratá-la como em dia', () => {
    expect(calculateMaintenanceStatus({ isActive: true, status: 'pending' }, input)).toBe(
      'pending'
    );
  });
  it('calcula ciclo combinado a partir da execução real', () => {
    expect(
      nextCycle(
        { recurrenceType: 'km_or_time', intervalKm: 10000, intervalMonths: 12 },
        148200,
        '2026-09-20'
      )
    ).toEqual({ nextDueKm: 158200, nextDueDate: '2027-09-20' });
  });
  it('calcula recorrência temporal em dias e anos', () => {
    expect(nextCycle({ recurrenceType: 'time', intervalDays: 15 }, 0, '2026-09-20')).toEqual({
      nextDueDate: '2026-10-05'
    });
    expect(nextCycle({ recurrenceType: 'time', intervalYears: 2 }, 0, '2026-09-20')).toEqual({
      nextDueDate: '2028-09-20'
    });
  });
});

describe('histórico derivado', () => {
  it('deriva todos os grupos sem duplicar a instalação vinculada à ocorrência', () => {
    const events = deriveTimeline(seedData);
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    expect(events.map((event) => event.category)).toEqual(
      expect.arrayContaining([
        'maintenance',
        'part',
        'issue',
        'document',
        'warranty',
        'odometer',
        'expense'
      ])
    );
    expect(
      events.filter(
        (event) => event.partInstanceId === 'part-engine-oil' && event.type === 'part_installed'
      )
    ).toHaveLength(1);
  });

  it('permite rollback A → B e bloqueia quando B já foi substituída', () => {
    const data = structuredClone(seedData);
    const occurrence = {
      ...data.occurrences[0],
      id: 'occ-replace',
      partActions: [
        {
          id: 'replace-action',
          componentDefinitionId: 'engine-oil',
          partInstanceId: 'part-b',
          action: 'replaced' as const
        }
      ]
    };
    const partA = {
      ...data.parts[0],
      id: 'part-a',
      status: 'replaced' as const,
      replacedByPartInstanceId: 'part-b',
      removalOccurrenceId: occurrence.id
    };
    const partB: (typeof data.parts)[number] = {
      ...data.parts[0],
      id: 'part-b',
      status: 'installed' as const,
      installationOccurrenceId: occurrence.id,
      replacedByPartInstanceId: undefined,
      removalOccurrenceId: undefined
    };

    data.occurrences = [occurrence];
    data.parts = [partA, partB];
    data.componentStates = data.componentStates.map((state) =>
      state.componentDefinitionId === 'engine-oil'
        ? { ...state, currentPartInstanceId: 'part-b', status: 'installed' as const }
        : state
    );
    data.warranties = [];
    data.issues = [];

    expect(analyzeOccurrenceDependencies(data, occurrence.id).canDelete).toBe(true);

    partB.status = 'replaced';
    partB.replacedByPartInstanceId = 'part-c';
    partB.removalOccurrenceId = 'occ-later';
    const blocked = analyzeOccurrenceDependencies(data, occurrence.id);
    expect(blocked.canDelete).toBe(false);
    expect(blocked.dependencies.some((dependency) => dependency.blocking)).toBe(true);
  });
});

describe('financeiro', () => {
  it('trata ocorrência legada sem custo como total zero', () => {
    expect(calculateExpense()).toEqual({
      calculatedTotalCents: 0,
      grossAmountCents: 0,
      refundedAmountCents: 0,
      netAmountCents: 0
    });
  });

  it('preserva calculado, aplica override e estorno sem ficar negativo', () => {
    expect(
      calculateExpense({
        partsTotalCents: 10000,
        laborCostCents: 5000,
        otherCostCents: 1000,
        manualTotalCents: 14000,
        manualOverrideEnabled: true,
        refundStatus: 'partial',
        refundedAmountCents: 4000
      })
    ).toEqual({
      calculatedTotalCents: 16000,
      grossAmountCents: 14000,
      refundedAmountCents: 4000,
      netAmountCents: 10000
    });
  });

  it('classifica estorno parcial e total sem alterar o valor original', () => {
    const expense = {
      partsTotalCents: 30000,
      laborCostCents: 15000,
      otherCostCents: 5000,
      manualOverrideEnabled: false,
      refundStatus: 'none' as const,
      refundedAmountCents: 0
    };
    const partial = setExpenseRefund(expense, 15000, 'Crédito do fornecedor');
    expect(partial).toMatchObject({
      refundStatus: 'partial',
      refundedAmountCents: 15000,
      refundNotes: 'Crédito do fornecedor',
      partsTotalCents: 30000
    });
    expect(calculateExpense(partial).netAmountCents).toBe(35000);
    expect(setExpenseRefund(expense, 50000).refundStatus).toBe('full');
    expect(calculateExpense(setExpenseRefund(expense, 50000)).netAmountCents).toBe(0);
  });

  it('rejeita estorno inválido e permite removê-lo', () => {
    const expense = {
      partsTotalCents: 10000,
      laborCostCents: 0,
      otherCostCents: 0,
      manualOverrideEnabled: false,
      refundStatus: 'none' as const,
      refundedAmountCents: 0
    };
    expect(() => setExpenseRefund(expense, 0)).toThrow('maior que zero');
    expect(() => setExpenseRefund(expense, 10001)).toThrow('não pode superar');
    expect(clearExpenseRefund(setExpenseRefund(expense, 4000))).toMatchObject({
      refundStatus: 'none',
      refundedAmountCents: 0,
      refundNotes: undefined
    });
  });
});

describe('garantia', () => {
  const warranty = (values: Partial<Warranty>): Warranty => ({
    ...audit,
    id: 'w',
    type: 'part',
    observations: '',
    ...values
  });

  it('vence na própria data limite', () => {
    expect(calculateWarrantyState(warranty({ endDate: '2026-09-22' }), 100, '2026-09-22')).toBe(
      'expired'
    );
  });

  it('vence no primeiro limite combinado atingido', () => {
    expect(
      calculateWarrantyState(
        warranty({ endDate: '2027-09-22', endOdometerKm: 150000 }),
        150000,
        '2026-09-22'
      )
    ).toBe('expired');
  });
});

describe('integridade de peça essencial', () => {
  it('instala a nova instância como peça atual', () => {
    const state: ComponentState = {
      ...audit,
      id: 's',
      componentDefinitionId: 'battery',
      state: 'missing',
      observations: ''
    };
    const next = installPart(state, {
      ...audit,
      id: 'new-part',
      componentDefinitionId: 'battery',
      name: 'Bateria nova',
      conditionAtInstall: 'new',
      priorLifeKnown: true,
      technicalConditionData: {},
      status: 'installed',
      observations: ''
    });
    expect(next).toMatchObject({ state: 'installed', currentPartInstanceId: 'new-part' });
    expect(next.revision).toBe(state.revision + 1);
  });

  it('cria alerta crítico não adiável ao remover', () => {
    const state: ComponentState = {
      ...audit,
      id: 's',
      componentDefinitionId: 'battery',
      currentPartInstanceId: 'p',
      state: 'installed',
      observations: ''
    };
    const component: ComponentDefinition = {
      id: 'battery',
      name: 'Bateria',
      category: 'Elétrica',
      system: 'Elétrica',
      positionId: 'engine',
      isEssential: true,
      isOptional: false,
      searchTerms: [],
      technicalFieldSchema: [],
      sortOrder: 1
    };
    const result = removePart(state, component);
    expect(result.state.state).toBe('missing');
    expect(result.alert).toMatchObject({ priority: 'critical', canSnooze: false });
  });

  it('remove componente opcional sem criar alerta crítico', () => {
    const state: ComponentState = {
      ...audit,
      id: 's',
      componentDefinitionId: 'air-conditioning',
      currentPartInstanceId: 'p',
      state: 'installed',
      observations: ''
    };
    const component: ComponentDefinition = {
      id: 'air-conditioning',
      name: 'Ar-condicionado',
      category: 'Conforto',
      system: 'Climatização',
      positionId: 'cabin',
      isEssential: false,
      isOptional: true,
      searchTerms: [],
      technicalFieldSchema: [],
      sortOrder: 1
    };
    const result = removePart(state, component);
    expect(result.state).toMatchObject({ state: 'unknown', currentPartInstanceId: undefined });
    expect(result.alert).toBeUndefined();
  });
});
