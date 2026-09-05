import { prisma } from '../lib/prisma.js';

const TOLERANCE = 0.01;

const toAmount = (value) => Number(value ?? 0);

// Net movement posted against an analytic account within [periodStart, periodEnd]. Expense/mixed
// analytic accounts are measured as debit-credit (spend); income accounts as credit-debit (revenue).
async function sumAchieved(analyticAccountId, analyticType, periodStart, periodEnd, client = prisma) {
  const lines = await client.journal_entry_lines.findMany({
    where: {
      analytic_account_id: analyticAccountId,
      journal_entries: {
        status: 'posted',
        entry_date: { gte: periodStart, lte: periodEnd },
      },
    },
    select: { debit_amount: true, credit_amount: true },
  });

  return lines.reduce((total, line) => {
    const debit = toAmount(line.debit_amount);
    const credit = toAmount(line.credit_amount);
    return total + (analyticType === 'income' ? credit - debit : debit - credit);
  }, 0);
}

/**
 * Finds the active Budget covering `analyticAccountId` on `date` (via its BudgetLines), sums what's
 * already been posted against that analytic account within the budget's period, and throws if
 * adding `amount` would exceed the planned amount. Returns budget/plannedAmount/achieved/remaining
 * when there's room, or { limited: false } when no active budget covers this account/date at all.
 */
export async function checkBudgetLimit(analyticAccountId, amount, date) {
  const analyticAccount = await prisma.analytic_accounts.findUnique({ where: { id: analyticAccountId } });
  if (!analyticAccount) {
    throw new Error('checkBudgetLimit: analytic account not found');
  }

  const checkDate = new Date(date);

  const lines = await prisma.budget_lines.findMany({
    where: {
      analytic_account_id: analyticAccountId,
      budgets: {
        status: 'active',
        period_start: { lte: checkDate },
        period_end: { gte: checkDate },
      },
    },
    include: { budgets: true },
  });

  if (lines.length === 0) {
    return { limited: false };
  }

  const budgetIds = [...new Set(lines.map((line) => line.budget_id))];
  if (budgetIds.length > 1) {
    throw new Error(
      `checkBudgetLimit: multiple active budgets (${budgetIds.join(', ')}) cover this analytic account and date`,
    );
  }

  const budget = lines[0].budgets;
  const plannedAmount = lines.reduce((total, line) => total + toAmount(line.planned_amount), 0);

  const achieved = await sumAchieved(analyticAccountId, analyticAccount.analytic_type, budget.period_start, budget.period_end);
  const remaining = plannedAmount - achieved;

  // A hard limit only makes sense for spend (expense/mixed): exceeding a revenue target is the
  // point of a sales budget, not a violation, so income-type accounts are never blocked here.
  if (analyticAccount.analytic_type !== 'income' && achieved + toAmount(amount) > plannedAmount + TOLERANCE) {
    throw new Error(`Exceeds Approved Budget: remaining is ${remaining.toFixed(2)}`);
  }

  return { limited: true, budgetId: budget.id, plannedAmount, achieved, remaining };
}

/**
 * Live achieved amount + percentage for an entire Budget, broken down per BudgetLine.
 * Achieved is tracked per analytic account (not per BudgetLine), so when a budget has more than
 * one line for the same analytic account (different chart_of_accounts account), each such line
 * reports the same achieved figure, but the overall total counts that analytic account once.
 */
export async function getBudgetAchieved(budgetId) {
  const budget = await prisma.budgets.findUnique({
    where: { id: budgetId },
    include: { budget_lines: { include: { analytic_accounts: true, chart_of_accounts: true } } },
  });
  if (!budget) {
    throw new Error('getBudgetAchieved: budget not found');
  }

  const achievedByAnalyticAccount = new Map();
  const lines = [];

  for (const line of budget.budget_lines) {
    const analyticAccountId = line.analytic_account_id;
    if (!achievedByAnalyticAccount.has(analyticAccountId)) {
      achievedByAnalyticAccount.set(
        analyticAccountId,
        await sumAchieved(analyticAccountId, line.analytic_accounts.analytic_type, budget.period_start, budget.period_end),
      );
    }
    const achieved = achievedByAnalyticAccount.get(analyticAccountId);
    const plannedAmount = toAmount(line.planned_amount);

    lines.push({
      budgetLineId: line.id,
      analyticAccountId,
      analyticAccountName: line.analytic_accounts.name,
      accountId: line.account_id,
      accountName: line.chart_of_accounts.name,
      plannedAmount,
      achieved,
      remaining: plannedAmount - achieved,
      percentage: plannedAmount === 0 ? null : Number(((achieved / plannedAmount) * 100).toFixed(2)),
    });
  }

  const totalPlanned = lines.reduce((total, line) => total + line.plannedAmount, 0);
  const totalAchieved = [...achievedByAnalyticAccount.values()].reduce((total, value) => total + value, 0);

  return {
    budgetId: budget.id,
    plannedAmount: totalPlanned,
    achieved: totalAchieved,
    remaining: totalPlanned - totalAchieved,
    percentage: totalPlanned === 0 ? null : Number(((totalAchieved / totalPlanned) * 100).toFixed(2)),
    lines,
  };
}
