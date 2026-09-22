import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../../types/domain';
import {
  acquireMutationLock,
  buildConflictSnapshot,
  connectionChanged,
  mutationFailed,
  mutationStarted,
  mutationSucceeded,
  normalizeConflictSnapshot,
  releaseMutationLock
} from '.';

const vehicle = (values: Partial<Vehicle> = {}): Vehicle => ({
  schemaVersion: 1,
  id: 'sandero',
  manufacturer: 'Renault',
  model: 'Sandero',
  trim: 'Expression',
  year: 2013,
  modelYear: 2014,
  engine: '1.6 8V',
  fuelType: 'Flex',
  color: 'Prata',
  plate: '',
  renavam: '',
  chassis: '',
  currentOdometer: 148000,
  observations: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'owner@example.com',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'owner@example.com',
  revision: 1,
  ...values
});

describe('concorrência otimista', () => {
  it('aceita uma revisão remota que ainda corresponde à base editada', () => {
    const base = vehicle();
    const local = vehicle({ color: 'Vermelho', revision: 2 });

    expect(buildConflictSnapshot('vehicle', base, local, structuredClone(base), 'now')).toBeNull();
  });

  it('detecta conflito e preserva integralmente as versões local e remota', () => {
    const base = vehicle();
    const local = vehicle({ color: 'Vermelho', revision: 2 });
    const remote = vehicle({ color: 'Azul', observations: 'Servidor', revision: 2 });
    const conflict = buildConflictSnapshot('vehicle', base, local, remote, '2026-09-22');

    expect(conflict).toMatchObject({
      id: 'vehicle:sandero',
      entityType: 'vehicle',
      entityId: 'sandero',
      divergentFields: ['color', 'observations'],
      detectedAt: '2026-09-22'
    });
    expect(conflict?.local).toEqual(local);
    expect(conflict?.remote).toEqual(remote);
  });

  it('migra conflito legado sem campos divergentes e descarta estado inválido', () => {
    const local = vehicle({ color: 'Vermelho', revision: 2 });
    const remote = vehicle({ color: 'Azul', observations: 'Servidor', revision: 2 });
    const migrated = normalizeConflictSnapshot(
      {
        id: 'vehicle:sandero',
        entityType: 'vehicle',
        entityId: 'sandero',
        local,
        remote,
        detectedAt: '2026-09-22'
      },
      ['vehicle'] as const
    );

    expect(migrated?.divergentFields).toEqual(['color', 'observations']);
    expect(normalizeConflictSnapshot({ entityType: 'vehicle' }, ['vehicle'] as const)).toBeNull();
    expect(
      normalizeConflictSnapshot({ ...migrated, entityType: 'unknown' }, ['vehicle'] as const)
    ).toBeNull();
  });
});

describe('ciclo de sincronização offline', () => {
  it('marca operação offline como pendente e volta a salvar após reconexão', () => {
    expect(mutationStarted(false, 1)).toMatchObject({ status: 'pending', pendingCount: 1 });
    expect(connectionChanged(true, 1)).toMatchObject({ status: 'saving', pendingCount: 1 });
    expect(mutationSucceeded(true, 0, 'now')).toEqual({
      status: 'synced',
      pendingCount: 0,
      message: 'Alterações sincronizadas.',
      updatedAt: 'now'
    });
  });

  it('impede mutação duplicada até a operação original ser liberada', () => {
    const locks = new Set<string>();
    expect(acquireMutationLock(locks, 'document:1')).toBe(1);
    expect(() => acquireMutationLock(locks, 'document:1')).toThrow('já está em andamento');
    expect(releaseMutationLock(locks, 'document:1')).toBe(0);
    expect(acquireMutationLock(locks, 'document:1')).toBe(1);
  });

  it('expõe erro de persistência e mantém a contagem das demais pendências', () => {
    expect(mutationFailed(1, new Error('Firestore indisponível'))).toEqual({
      status: 'error',
      pendingCount: 1,
      message: 'Firestore indisponível'
    });
    expect(connectionChanged(false, 0)).toBeNull();
  });
});
