import {
  BUDGET_TIER_HEALTHY_PCT,
  BUDGET_TIER_WARNING_PCT,
} from '../constants/budget';
import type { BudgetStatus, BudgetTier, Expense } from '../types';
import { getDaysInMonth, getCurrentMonth, getCurrentYear, isDateInMonth } from './date';

export function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/**
 * Total spend restricted to a single calendar month.
 * Budgets are monthly, so they must only ever be compared against a monthly total.
 */
export function getMonthTotal(expenses: Expense[], month: number, year: number): number {
  return sumAmounts(expenses.filter((expense) => isDateInMonth(expense.date, month, year)));
}

export function getCurrentMonthTotal(expenses: Expense[]): number {
  return getMonthTotal(expenses, getCurrentMonth(), getCurrentYear());
}

export function getMonthExpenses(expenses: Expense[], month: number, year: number): Expense[] {
  return expenses.filter((expense) => isDateInMonth(expense.date, month, year));
}

export function getTier(percentage: number): BudgetTier {
  if (percentage <= BUDGET_TIER_HEALTHY_PCT) return 'healthy';
  if (percentage <= BUDGET_TIER_WARNING_PCT) return 'warning';
  return 'critical';
}

export function getBudgetStatus(
  budget: number,
  spent: number,
  month: number = getCurrentMonth(),
  year: number = getCurrentYear(),
): BudgetStatus {
  const remaining = budget - spent;
  const rawPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const percentage = Math.min(Math.max(rawPercentage, 0), 100);

  const daysInMonth = getDaysInMonth(month, year);
  const isCurrentMonth = month === getCurrentMonth() && year === getCurrentYear();
  const daysElapsed = isCurrentMonth ? new Date().getDate() : daysInMonth;
  const daysRemaining = isCurrentMonth ? Math.max(daysInMonth - daysElapsed, 0) : 0;
  const projected = daysElapsed > 0 ? (spent / daysElapsed) * daysInMonth : spent;

  return {
    budget,
    spent,
    remaining,
    percentage,
    rawPercentage,
    isOver: budget > 0 && remaining < 0,
    tier: budget > 0 ? getTier(rawPercentage) : 'healthy',
    projected,
    daysRemaining,
  };
}

export function getMonthBudgetStatus(budget: number, expenses: Expense[], month: number, year: number): BudgetStatus {
  return getBudgetStatus(budget, getMonthTotal(expenses, month, year), month, year);
}

/** Remaining budget after adding `incoming`, used for pre-submit warnings. */
export function getProjectedRemaining(budget: number, spent: number, incoming: number): number {
  return budget - spent - incoming;
}
