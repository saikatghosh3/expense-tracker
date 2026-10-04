import {
  DEFAULT_SETTINGS,
  type AppData,
  type Budget,
  type Category,
  type CategoryBudget,
  type Expense,
  type ExpenseData,
  type Settings,
  type User,
} from '../types';
import { emptyData, generateId, normalizeData, normalizeSettings } from './normalize';

/**
 * Persistence layer: reads, caches and writes the single localStorage dataset.
 * Shape rules for untrusted data live in `./normalize`.
 */

const STORAGE_KEY = 'expense-tracker-data';
const CORRUPT_KEY = 'expense-tracker-data.corrupt';
const SEED_FLAG_KEY = 'expense-tracker-seeded';

export const DEFAULT_ADMIN_EMAIL = 'admin@admin.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

function readRaw(): AppData | null {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!stored) return null;

  try {
    return normalizeData(JSON.parse(stored));
  } catch {
    // Preserve the unreadable payload for recovery instead of silently overwriting it.
    try {
      localStorage.setItem(CORRUPT_KEY, stored);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable; fall through to defaults.
    }
    return null;
  }
}

let cache: AppData | null = null;

function commit(data: AppData): boolean {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    throw new Error(
      isQuota
        ? 'Browser storage is full. Delete some expenses or export a backup, then try again.'
        : 'Could not save to browser storage.',
    );
  }
}

function read(): AppData {
  if (cache) return cache;
  const data = readRaw() ?? emptyData();
  cache = data;
  return data;
}

function mutate(mutator: (data: AppData) => void): AppData {
  const data = read();
  mutator(data);
  commit(data);
  return data;
}

export const storage = {
  // ---------- Session ----------

  getCurrentUserId(): string | null {
    return read().currentUserId;
  },

  getCurrentUser(): User | null {
    const data = read();
    if (!data.currentUserId) return null;
    return data.users.find((user) => user.id === data.currentUserId) ?? null;
  },

  setCurrentUser(userId: string | null): void {
    mutate((data) => {
      data.currentUserId = userId;
    });
  },

  // ---------- Users ----------

  getAllUsers(): User[] {
    return [...read().users].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  },

  getUserById(userId: string): User | null {
    return read().users.find((user) => user.id === userId) ?? null;
  },

  getUserByEmail(email: string): User | null {
    const normalized = email.trim().toLowerCase();
    return read().users.find((user) => user.email === normalized) ?? null;
  },

  createUser(input: { email: string; fullName: string; password: string; passwordSalt: string }): User {
    const email = input.email.trim().toLowerCase();
    if (this.getUserByEmail(email)) {
      throw new Error('An account with this email already exists.');
    }

    const user: User = {
      id: generateId('user'),
      email,
      fullName: input.fullName.trim() || email.split('@')[0] || 'User',
      password: input.password,
      passwordSalt: input.passwordSalt,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };

    mutate((data) => {
      data.users.push(user);
      data.settings[user.id] = { ...DEFAULT_SETTINGS };
    });

    return user;
  },

  updateUser(
    userId: string,
    updates: Partial<Pick<User, 'fullName' | 'email' | 'password' | 'passwordSalt' | 'isAdmin'>>,
  ): User | null {
    const email = updates.email?.trim().toLowerCase();
    if (email) {
      const existing = this.getUserByEmail(email);
      if (existing && existing.id !== userId) {
        throw new Error('This email address is already in use.');
      }
    }

    return mutate((data) => {
      const index = data.users.findIndex((user) => user.id === userId);
      if (index < 0) return;

      const current = data.users[index];
      if (!current) return;

      const updated: User = {
        ...current,
        fullName: updates.fullName?.trim() || current.fullName,
        email: email || current.email,
        password: updates.password ?? current.password,
        passwordSalt: updates.passwordSalt ?? current.passwordSalt,
        isAdmin: updates.isAdmin ?? current.isAdmin,
      };

      data.users[index] = updated;
    }).users.find((user) => user.id === userId) ?? null;
  },

  /** Removes the user together with every record that belongs to them. */
  deleteUser(userId: string): void {
    mutate((data) => {
      data.users = data.users.filter((user) => user.id !== userId);
      data.expenses = data.expenses.filter((expense) => expense.userId !== userId);
      data.budgets = data.budgets.filter((budget) => budget.userId !== userId);
      data.categoryBudgets = data.categoryBudgets.filter((budget) => budget.userId !== userId);
      delete data.settings[userId];
      if (data.currentUserId === userId) data.currentUserId = null;
    });
  },

  getUserStats(userId: string): { expenseCount: number; totalExpenses: number; budgetCount: number } {
    const data = read();
    const expenses = data.expenses.filter((expense) => expense.userId === userId);
    return {
      expenseCount: expenses.length,
      totalExpenses: expenses.reduce((total, expense) => total + expense.amount, 0),
      budgetCount: data.budgets.filter((budget) => budget.userId === userId).length,
    };
  },

  countUsers(): number {
    return read().users.length;
  },

  isSeeded(): boolean {
    try {
      return localStorage.getItem(SEED_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  },

  markSeeded(): void {
    try {
      localStorage.setItem(SEED_FLAG_KEY, 'true');
    } catch {
      // Non-fatal: seeding would simply be retried on the next load.
    }
  },

  // ---------- Expenses ----------

  getExpensesByUser(userId: string): Expense[] {
    return read()
      .expenses.filter((expense) => expense.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  },

  addExpense(input: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expense: Expense = {
      ...input,
      id: generateId('expense'),
      createdAt: new Date().toISOString(),
    };

    mutate((data) => {
      data.expenses.push(expense);
    });

    return expense;
  },

  updateExpense(expenseId: string, updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>): Expense | null {
    return mutate((data) => {
      const index = data.expenses.findIndex((expense) => expense.id === expenseId);
      if (index < 0) return;

      const current = data.expenses[index];
      if (!current) return;

      const updated: Expense = {
        ...current,
        ...updates,
        amount: updates.amount !== undefined ? Math.max(updates.amount, 0) : current.amount,
        category: updates.category ?? current.category,
        updatedAt: new Date().toISOString(),
      };

      data.expenses[index] = updated;
    }).expenses.find((expense) => expense.id === expenseId) ?? null;
  },

  deleteExpense(expenseId: string): void {
    mutate((data) => {
      data.expenses = data.expenses.filter((expense) => expense.id !== expenseId);
    });
  },

  deleteExpenses(expenseIds: string[]): void {
    const ids = new Set(expenseIds);
    mutate((data) => {
      data.expenses = data.expenses.filter((expense) => !ids.has(expense.id));
    });
  },

  /** Re-inserts previously deleted expenses, preserving their original ids. */
  restoreExpenses(expenses: Expense[]): void {
    mutate((data) => {
      const existing = new Set(data.expenses.map((expense) => expense.id));
      for (const expense of expenses) {
        if (!existing.has(expense.id)) data.expenses.push(expense);
      }
    });
  },

  getExpenseById(expenseId: string): Expense | null {
    return read().expenses.find((expense) => expense.id === expenseId) ?? null;
  },

  getAllExpenses(): Expense[] {
    return [...read().expenses];
  },

  // ---------- Budgets ----------

  setBudget(userId: string, amount: number, month: number, year: number): Budget {
    const safeAmount = Math.max(amount, 0);
    const now = new Date().toISOString();

    const existing = this.getBudget(userId, month, year);
    const budget: Budget = existing
      ? { ...existing, amount: safeAmount, updatedAt: now }
      : { id: generateId('budget'), userId, amount: safeAmount, month, year, createdAt: now, updatedAt: now };

    mutate((data) => {
      const index = data.budgets.findIndex(
        (item) => item.userId === userId && item.month === month && item.year === year,
      );
      if (index >= 0) data.budgets[index] = budget;
      else data.budgets.push(budget);
    });

    return budget;
  },

  getBudget(userId: string, month: number, year: number): Budget | null {
    return (
      read().budgets.find((budget) => budget.userId === userId && budget.month === month && budget.year === year) ?? null
    );
  },

  getBudgetsByUser(userId: string): Budget[] {
    return read()
      .budgets.filter((budget) => budget.userId === userId)
      .sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));
  },

  deleteBudget(userId: string, month: number, year: number): void {
    mutate((data) => {
      data.budgets = data.budgets.filter(
        (budget) => !(budget.userId === userId && budget.month === month && budget.year === year),
      );
    });
  },

  setCategoryBudget(userId: string, category: Category, amount: number, month: number, year: number): CategoryBudget {
    const safeAmount = Math.max(amount, 0);
    const now = new Date().toISOString();

    const existing = this.getCategoryBudget(userId, category, month, year);
    const budget: CategoryBudget = existing
      ? { ...existing, amount: safeAmount, updatedAt: now }
      : { id: generateId('cat-budget'), userId, category, amount: safeAmount, month, year, createdAt: now, updatedAt: now };

    mutate((data) => {
      const index = data.categoryBudgets.findIndex(
        (item) =>
          item.userId === userId &&
          item.category === category &&
          item.month === month &&
          item.year === year,
      );
      if (index >= 0) data.categoryBudgets[index] = budget;
      else data.categoryBudgets.push(budget);
    });

    return budget;
  },

  getCategoryBudget(userId: string, category: Category, month: number, year: number): CategoryBudget | null {
    return (
      read().categoryBudgets.find(
        (budget) =>
          budget.userId === userId &&
          budget.category === category &&
          budget.month === month &&
          budget.year === year,
      ) ?? null
    );
  },

  getCategoryBudgets(userId: string, month: number, year: number): CategoryBudget[] {
    return read().categoryBudgets.filter(
      (budget) => budget.userId === userId && budget.month === month && budget.year === year,
    );
  },

  // ---------- Settings ----------

  getSettings(userId: string): Settings {
    const stored = read().settings[userId];
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
  },

  updateSettings(userId: string, updates: Partial<Settings>): Settings {
    return mutate((data) => {
      data.settings[userId] = normalizeSettings({ ...data.settings[userId], ...updates });
    }).settings[userId] as Settings;
  },

  // ---------- Backup / restore ----------

  exportAll(): string {
    return JSON.stringify(read(), null, 2);
  },

  /**
   * Replaces the dataset with `json`. Throws on malformed input so a bad file
   * can never wipe existing data.
   */
  importAll(json: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('That file is not valid JSON.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('That file does not contain expense tracker data.');
    }

    const normalized = normalizeData(parsed);
    if (normalized.users.length === 0 && normalized.expenses.length === 0) {
      throw new Error('That file contains no users or expenses.');
    }

    commit(normalized);
  },

  /** Test/debug helper: drops the in-memory cache and rereads storage. */
  reset(): void {
    cache = null;
  },
};

export type { ExpenseData };
