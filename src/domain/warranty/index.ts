import { daysUntil } from '../maintenance';
import type { Warranty } from '../../types/domain';

export type WarrantyState = 'active' | 'upcoming' | 'expired';

export function calculateWarrantyState(
  warranty: Warranty,
  currentKm: number,
  today: string,
  thresholdDays = 60,
  thresholdKm = 1000
): WarrantyState {
  const days = warranty.endDate ? daysUntil(warranty.endDate, today) : Infinity;
  const km = warranty.endOdometerKm === undefined ? Infinity : warranty.endOdometerKm - currentKm;
  if (days <= 0 || km <= 0) return 'expired';
  if (days <= thresholdDays || km <= thresholdKm) return 'upcoming';
  return 'active';
}
