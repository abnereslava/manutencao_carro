import type { OdometerRecord } from '../../types/domain';

export function sortOdometerRecords(records: OdometerRecord[]): OdometerRecord[] {
  return [...records].sort(
    (a, b) =>
      b.recordedDate.localeCompare(a.recordedDate) ||
      b.createdAt.localeCompare(a.createdAt) ||
      b.odometerKm - a.odometerKm
  );
}

export function getCurrentOdometer(records: OdometerRecord[]): number {
  return records.reduce((max, item) => Math.max(max, item.odometerKm), 0);
}

export function validateOdometerReading(
  records: OdometerRecord[],
  value: number,
  options?: string | { editingId?: string; recordedDate?: string }
): string | null {
  if (!Number.isInteger(value) || value < 0) return 'Informe uma quilometragem válida.';
  const editingId = typeof options === 'string' ? options : options?.editingId;
  const otherRecords = records.filter((item) => item.id !== editingId);

  if (editingId || (typeof options !== 'string' && options?.recordedDate)) {
    const editing = records.find((item) => item.id === editingId);
    if (editingId && !editing) return 'Leitura não encontrada.';
    const recordedDate =
      typeof options === 'string' ? editing?.recordedDate : options?.recordedDate;
    if (!recordedDate) return 'Informe uma data válida para a leitura.';
    const previousKm = otherRecords
      .filter((item) =>
        editingId ? item.recordedDate < recordedDate : item.recordedDate <= recordedDate
      )
      .reduce((max, item) => Math.max(max, item.odometerKm), 0);
    const followingKm = otherRecords
      .filter((item) => item.recordedDate > recordedDate)
      .reduce((min, item) => Math.min(min, item.odometerKm), Infinity);
    if (value < previousKm)
      return `A leitura não pode ser menor que a anterior (${previousKm.toLocaleString('pt-BR')} km).`;
    if (value > followingKm)
      return `A leitura não pode superar a seguinte (${followingKm.toLocaleString('pt-BR')} km).`;
    return null;
  }

  const current = getCurrentOdometer(otherRecords);
  if (value < current)
    return `A leitura não pode ser menor que ${current.toLocaleString('pt-BR')} km.`;
  return null;
}
