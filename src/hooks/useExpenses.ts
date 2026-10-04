import { useCallback, useEffect, useMemo, useState } from 'react';
import { storage } from '../data/storage';
import type { Budget, Category, CategoryBudget, Expense, ExpenseData } from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils/date';
import { getBudgetStatus, getMonthExpenses, getMonthTotal } from '../utils/budget';
import { useAuth } from '../contexts/AuthContext';

export interface MonthSelection {
  month: number;
  year: number;
}

export const useExpenses = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [availableMonths, setAvailableMonths] = useState<MonthSelection[]>([]);
  const [selected, setSelected] = useState<MonthSelection>(() => ({
    month: getCurrentMonth(),
    year: getCurrentYear(),
  }));
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(() => {
    if (!userId) {
      setExpenses([]);
      return;
    }
    setExpenses(storage.getExpensesByUser(userId));
  }, [userId]);

  const loadMonth = useCallback(
    (month: number, year: number) => {
      if (!userId) {
        setBudget(null);
        setCategoryBudgets([]);
        return;
      }
      setBudget(storage.getBudget(userId, month, year));
      setCategoryBudgets(storage.getCategoryBudgets(userId, month, year));
    },
    [userId],
  );

  const loadAvailableMonths = useCallback(() => {
    if (!userId) {
      setAvailableMonths([]);
      return;
    }
    const budgets = storage.getBudgetsByUser(userId);
    const fromExpenses = storage.getExpensesByUser(userId);
    const seen = new Set<string>();
    const months: MonthSelection[] = [];

    for (const item of [...budgets, ...fromExpenses]) {
      const month = 'month' in item ? item.month : Number(item.date.slice(5, 7));
      const year = 'year' in item ? item.year : Number(item.date.slice(0, 4));
      if (!month || !year) continue;
      const key = `${year}-${month}`;
      if (seen.has(key)) continue;
      seen.add(key);
      months.push({ month, year });
    }

    months.sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));
    setAvailableMonths(months);
  }, [userId]);

  // Reset the selected month to the current one whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) {
      setExpenses([]);
      setBudget(null);
      setCategoryBudgets([]);
      setAvailableMonths([]);
      setSelected({ month: getCurrentMonth(), year: getCurrentYear() });
      setLoading(false);
      return;
    }

    setSelected({ month: getCurrentMonth(), year: getCurrentYear() });
    setLoading(true);
    loadExpenses();
    loadAvailableMonths();
    setLoading(false);
  }, [userId, loadExpenses, loadAvailableMonths]);

  useEffect(() => {
    loadMonth(selected.month, selected.year);
  }, [selected, loadMonth]);

  const goToMonth = useCallback((delta: number) => {
    setSelected((current) => {
      const zeroBased = current.year * 12 + (current.month - 1) + delta;
      return {
        month: (zeroBased % 12) + 1,
        year: Math.floor(zeroBased / 12),
      };
    });
  }, []);

  const goToMonthSelection = useCallback((month: number, year: number) => {
    setSelected({ month, year });
  }, []);

  const isCurrentMonth = selected.month === getCurrentMonth() && selected.year === getCurrentYear();

  const monthExpenses = useMemo(
    () => getMonthExpenses(expenses, selected.month, selected.year),
    [expenses, selected],
  );

  const monthSpent = useMemo(() => getMonthTotal(expenses, selected.month, selected.year), [expenses, selected]);

  const budgetStatus = useMemo(
    () => getBudgetStatus(budget?.amount ?? 0, monthSpent, selected.month, selected.year),
    [budget, monthSpent, selected],
  );

  const lifetimeSpent = useMemo(() => expenses.reduce((total, expense) => total + expense.amount, 0), [expenses]);

  // ---------- Mutations ----------

  const addExpense = useCallback(
    async (data: ExpenseData): Promise<Expense> => {
      if (!userId) throw new Error('You must be signed in to add an expense.');

      const created = storage.addExpense({
        ...data,
        category: data.category as Category,
        userId,
      });

      loadExpenses();
      loadAvailableMonths();
      return created;
    },
    [userId, loadExpenses, loadAvailableMonths],
  );

  const updateExpense = useCallback(
    async (expenseId: string, updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>): Promise<Expense> => {
      if (!userId) throw new Error('You must be signed in to edit an expense.');

      const updated = storage.updateExpense(expenseId, updates);
      if (!updated) throw new Error('That expense no longer exists.');

      loadExpenses();
      return updated;
    },
    [userId, loadExpenses],
  );

  const deleteExpense = useCallback(
    async (expenseId: string): Promise<Expense | null> => {
      if (!userId) throw new Error('You must be signed in to delete an expense.');

      const removed = storage.getExpenseById(expenseId);
      storage.deleteExpense(expenseId);
      loadExpenses();
      return removed;
    },
    [userId, loadExpenses],
  );

  const deleteExpenses = useCallback(
    async (expenseIds: string[]): Promise<Expense[]> => {
      if (!userId) throw new Error('You must be signed in to delete expenses.');

      const removed = expenseIds
        .map((id) => storage.getExpenseById(id))
        .filter((expense): expense is Expense => expense !== null);

      storage.deleteExpenses(expenseIds);
      loadExpenses();
      return removed;
    },
    [userId, loadExpenses],
  );

  const restoreExpenses = useCallback(
    async (restored: Expense[]): Promise<void> => {
      if (!userId) throw new Error('You must be signed in to restore expenses.');
      storage.restoreExpenses(restored);
      loadExpenses();
      loadAvailableMonths();
    },
    [userId, loadExpenses, loadAvailableMonths],
  );

  const updateBudget = useCallback(
    async (amount: number): Promise<Budget> => {
      if (!userId) throw new Error('You must be signed in to change your budget.');

      const saved = storage.setBudget(userId, amount, selected.month, selected.year);
      setBudget(saved);
      loadAvailableMonths();
      return saved;
    },
    [userId, selected, loadAvailableMonths],
  );

  const deleteBudget = useCallback(async (): Promise<void> => {
    if (!userId) throw new Error('You must be signed in to remove your budget.');
    storage.deleteBudget(userId, selected.month, selected.year);
    setBudget(null);
    loadAvailableMonths();
  }, [userId, selected, loadAvailableMonths]);

  const updateCategoryBudget = useCallback(
    async (category: Category, amount: number): Promise<CategoryBudget> => {
      if (!userId) throw new Error('You must be signed in to change category budgets.');

      const saved = storage.setCategoryBudget(userId, category, amount, selected.month, selected.year);
      setCategoryBudgets(storage.getCategoryBudgets(userId, selected.month, selected.year));
      return saved;
    },
    [userId, selected],
  );

  const reload = useCallback(() => {
    loadExpenses();
    loadAvailableMonths();
    loadMonth(selected.month, selected.year);
  }, [loadExpenses, loadAvailableMonths, loadMonth, selected]);

  return {
    expenses,
    monthExpenses,
    monthSpent,
    lifetimeSpent,
    budget: budget?.amount ?? 0,
    budgetRecord: budget,
    categoryBudgets,
    budgetStatus,
    availableMonths,
    selectedMonth: selected,
    isCurrentMonth,
    loading,
    goToMonth,
    goToMonthSelection,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteExpenses,
    restoreExpenses,
    updateBudget,
    deleteBudget,
    updateCategoryBudget,
    reload,
  };
};
