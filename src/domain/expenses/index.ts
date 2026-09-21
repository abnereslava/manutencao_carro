import type { ExpenseBreakdown } from '../../types/domain';

export function calculateExpense(expense: ExpenseBreakdown) {
  const calculatedTotalCents =
    expense.partsTotalCents + expense.laborCostCents + expense.otherCostCents;
  const grossAmountCents = expense.manualOverrideEnabled
    ? (expense.manualTotalCents ?? calculatedTotalCents)
    : calculatedTotalCents;
  const refundedAmountCents = Math.min(Math.max(expense.refundedAmountCents, 0), grossAmountCents);
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
