import { z } from 'zod';

const auditSchema = z.object({
  schemaVersion: z.number().int().positive(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
  revision: z.number().int().nonnegative()
});

export const odometerRecordSchema = auditSchema.extend({
  id: z.string().min(1),
  vehicleId: z.string().min(1),
  odometerKm: z.number().int().nonnegative(),
  recordedDate: z.string().min(10),
  observations: z.string()
});

export const maintenancePlanSchema = auditSchema
  .extend({
    id: z.string().min(1),
    title: z.string().min(2),
    type: z.enum(['preventive_recurring', 'preventive_one_time', 'corrective', 'inspection']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    status: z.enum(['ok', 'upcoming', 'overdue', 'pending', 'in_progress', 'archived']),
    recurrenceType: z.enum(['none', 'km', 'time', 'km_or_time']),
    intervalKm: z.number().int().positive().optional(),
    intervalDays: z.number().int().positive().optional(),
    intervalMonths: z.number().int().positive().optional(),
    intervalYears: z.number().int().positive().optional(),
    nextDueKm: z.number().int().nonnegative().optional(),
    nextDueDate: z.string().optional(),
    description: z.string(),
    isActive: z.boolean(),
    observations: z.string()
  })
  .superRefine((value, ctx) => {
    if (
      (value.recurrenceType === 'km' || value.recurrenceType === 'km_or_time') &&
      !value.intervalKm
    ) {
      ctx.addIssue({ code: 'custom', message: 'Informe o intervalo em KM.', path: ['intervalKm'] });
    }
    if (
      (value.recurrenceType === 'time' || value.recurrenceType === 'km_or_time') &&
      !value.intervalDays &&
      !value.intervalMonths &&
      !value.intervalYears
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um intervalo de tempo.',
        path: ['intervalDays']
      });
    }
  });

export const documentSchema = auditSchema
  .extend({
    id: z.string(),
    type: z.enum(['ipva', 'licensing', 'insurance', 'custom']),
    customTypeName: z.string().optional(),
    referenceYear: z.number().int().min(1900).max(2200),
    name: z.string().min(2),
    referenceNumber: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    amountCents: z.number().int().nonnegative().optional(),
    status: z.enum(['pending', 'paid', 'expired', 'active']),
    documentUrl: z.url().optional(),
    observations: z.string()
  })
  .superRefine((value, ctx) => {
    if (value.type === 'custom' && !value.customTypeName?.trim())
      ctx.addIssue({
        code: 'custom',
        message: 'Informe o tipo personalizado.',
        path: ['customTypeName']
      });
  });
