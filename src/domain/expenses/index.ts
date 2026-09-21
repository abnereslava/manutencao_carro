import type { ExpenseBreakdown } from '../../types/domain';

export function calculateExpense(expense?: ExpenseBreakdown) {
  const safeExpense: ExpenseBreakdown = expense ?? {
    partsTotalCents: 0,
    laborCostCents: 0,
    otherCostCents: 0,
    manualOverrideEnabled: false,
    refundStatus: 'none',
    refundedAmountCents: 0
  };
  const calculatedTotalCents =
    safeExpense.partsTotalCents + safeExpense.laborCostCents + safeExpense.otherCostCents;
  const grossAmountCents = safeExpense.manualOverrideEnabled
    ? (safeExpense.manualTotalCents ?? calculatedTotalCents)
    : calculatedTotalCents;
  const refundedAmountCents = Math.min(
    Math.max(safeExpense.refundedAmountCents, 0),
    grossAmountCents
  );
  return {
    calculatedTotalCents,
    grossAmountCents,
    refundedAmountCents,
    netAmountCents: grossAmountCents - refundedAmountCents
  };
}

export function sumExpenses(expenses: ExpenseBreakdown[]): number {
  return expenses.reduce((sum, expense) => sum + calculateExpense(expense).netAmountCents, 0);
}
