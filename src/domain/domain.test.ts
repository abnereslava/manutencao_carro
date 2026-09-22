import { describe, expect, it } from 'vitest';
import { calculateExpense } from './expenses';
import { calculateMaintenanceStatus, nextCycle } from './maintenance';
import { getCurrentOdometer, sortOdometerRecords, validateOdometerReading } from './odometer';
import { installPart, removePart } from './parts';
import type { ComponentDefinition, ComponentState, OdometerRecord } from '../types/domain';

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
