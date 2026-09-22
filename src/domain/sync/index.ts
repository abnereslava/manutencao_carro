import type { AuditMetadata } from '../../types/domain';

export type MutationSyncStatus = 'idle' | 'saving' | 'synced' | 'pending' | 'error';

export interface MutationSyncState {
  status: MutationSyncStatus;
  pendingCount: number;
  message?: string;
  updatedAt?: string;
}

export interface ConflictSnapshot<
  TEntityType extends string,
  TValue extends AuditMetadata & { id: string }
> {
  id: string;
  entityType: TEntityType;
  entityId: string;
  local: TValue;
  remote: TValue;
  divergentFields: string[];
  detectedAt: string;
}

const ignoredConflictFields = new Set([
  'schemaVersion',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
  'revision'
]);

export function findDivergentFields<TValue extends AuditMetadata & { id: string }>(
  local: TValue,
  remote: TValue
) {
  return [...new Set([...Object.keys(local), ...Object.keys(remote)])].filter(
    (key) =>
      !ignoredConflictFields.has(key) &&
      JSON.stringify((local as unknown as Record<string, unknown>)[key]) !==
        JSON.stringify((remote as unknown as Record<string, unknown>)[key])
  );
}

export function buildConflictSnapshot<
  TEntityType extends string,
  TValue extends AuditMetadata & { id: string }
>(
  entityType: TEntityType,
  base: TValue,
  local: TValue,
  remote: TValue | null,
  detectedAt: string
): ConflictSnapshot<TEntityType, TValue> | null {
  if (
    !remote ||
    (remote.revision === base.revision &&
      remote.updatedAt === base.updatedAt &&
      remote.updatedBy === base.updatedBy)
  )
    return null;

  return {
    id: `${entityType}:${base.id}`,
    entityType,
    entityId: base.id,
    local,
    remote,
    divergentFields: findDivergentFields(local, remote),
    detectedAt
  };
}

export function acquireMutationLock(locks: Set<string>, key: string) {
  if (locks.has(key)) throw new Error('Esta operação já está em andamento. Aguarde a confirmação.');
  locks.add(key);
  return locks.size;
}

export function releaseMutationLock(locks: Set<string>, key: string) {
  locks.delete(key);
  return locks.size;
}

export function mutationStarted(online: boolean, pendingCount: number): MutationSyncState {
  return {
    status: online ? 'saving' : 'pending',
    pendingCount,
    message: online
      ? 'Salvando alterações…'
      : 'Sem conexão. Alterações aguardando confirmação do servidor.'
  };
}

export function connectionChanged(online: boolean, pendingCount: number): MutationSyncState | null {
  if (!pendingCount) return null;
  return {
    status: online ? 'saving' : 'pending',
    pendingCount,
    message: online
      ? 'Conexão restaurada. Confirmando alterações…'
      : 'Sem conexão. Alterações aguardando confirmação do servidor.'
  };
}

export function mutationSucceeded(
  online: boolean,
  pendingCount: number,
  updatedAt: string
): MutationSyncState {
  return {
    status: pendingCount ? (online ? 'saving' : 'pending') : 'synced',
    pendingCount,
    message: pendingCount ? 'Ainda há alterações sendo salvas…' : 'Alterações sincronizadas.',
    updatedAt
  };
}

export function mutationFailed(pendingCount: number, error: unknown): MutationSyncState {
  return {
    status: 'error',
    pendingCount,
    message: error instanceof Error ? error.message : 'Não foi possível salvar as alterações.'
  };
}
