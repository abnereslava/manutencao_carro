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

export function setExpenseRefund(
  expense: ExpenseBreakdown,
  refundedAmountCents: number,
  notes?: string
): ExpenseBreakdown {
  const { grossAmountCents } = calculateExpense(expense);
  if (!Number.isInteger(refundedAmountCents))
    throw new Error('O valor do estorno deve ser informado em centavos inteiros.');
  if (refundedAmountCents <= 0) throw new Error('O valor estornado deve ser maior que zero.');
  if (refundedAmountCents > grossAmountCents)
    throw new Error('O estorno não pode superar o valor original da despesa.');
  return {
    ...expense,
    refundStatus: refundedAmountCents === grossAmountCents ? 'full' : 'partial',
    refundedAmountCents,
    refundNotes: notes?.trim() || undefined
  };
}

export function clearExpenseRefund(expense: ExpenseBreakdown): ExpenseBreakdown {
  return {
    ...expense,
    refundStatus: 'none',
    refundedAmountCents: 0,
    refundNotes: undefined
  };
}
