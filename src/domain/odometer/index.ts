import type { OdometerRecord } from '../../types/domain';

export function sortOdometerRecords(records: OdometerRecord[]): OdometerRecord[] {
  return [...records].sort(
    (a, b) => b.recordedDate.localeCompare(a.recordedDate) || b.odometerKm - a.odometerKm
  );
}

export function getCurrentOdometer(records: OdometerRecord[]): number {
  return records.reduce((max, item) => Math.max(max, item.odometerKm), 0);
}

export function validateOdometerReading(
  records: OdometerRecord[],
  value: number,
  editingId?: string
): string | null {
  if (!Number.isInteger(value) || value < 0) return 'Informe uma quilometragem válida.';
  const otherRecords = records.filter((item) => item.id !== editingId);
  const current = getCurrentOdometer(otherRecords);
  if (value < current)
    return `A leitura não pode ser menor que ${current.toLocaleString('pt-BR')} km.`;
  return null;
}
