import {
  DEFAULT_SETTINGS,
  isCategory,
  type AppData,
  type Budget,
  type CategoryBudget,
  type Expense,
  type Settings,
  type User,
} from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils/date';
import { PAGE_SIZE_OPTIONS } from '../constants/settings';

/**
 * Coercion of arbitrary stored JSON into the app's types.
 *
 * Anything read from `localStorage` or an imported backup is untrusted, so it is
 * funnelled through here. `data/storage.ts` owns persistence; this module owns
 * the shape rules.
 */

export const CURRENT_VERSION = 2;

export function emptyData(): AppData {
  return {
    version: CURRENT_VERSION,
    users: [],
    expenses: [],
    budgets: [],
    categoryBudgets: [],
    settings: {},
    currentUserId: null,
  };
}

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asMonth(value: unknown): number {
  const month = asNumber(value, getCurrentMonth());
  return month >= 1 && month <= 12 ? month : getCurrentMonth();
}

function asYear(value: unknown): number {
  const year = asNumber(value, getCurrentYear());
  return year > 1900 && year < 3000 ? year : getCurrentYear();
}

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const email = asString(r.email).trim().toLowerCase();
  if (!email) return null;

  return {
    id: asString(r.id) || generateId('user'),
    email,
    fullName: asString(r.fullName) || email.split('@')[0] || 'User',
    password: asString(r.password),
    // Empty salt marks a legacy plaintext password, upgraded on next successful login.
    passwordSalt: asString(r.passwordSalt),
    isAdmin: r.isAdmin === true,
    createdAt: asString(r.createdAt) || new Date().toISOString(),
  };
}

function normalizeExpense(raw: unknown): Expense | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const userId = asString(r.userId);
  const description = asString(r.description).trim();
  if (!userId || !description) return null;

  return {
    id: asString(r.id) || generateId('expense'),
    userId,
    description,
    amount: Math.max(asNumber(r.amount), 0),
    category: isCategory(r.category) ? r.category : 'Other',
    date: asString(r.date) || new Date().toISOString().slice(0, 10),
    createdAt: asString(r.createdAt) || new Date().toISOString(),
    updatedAt: r.updatedAt ? asString(r.updatedAt) : undefined,
    merchant: asString(r.merchant) || undefined,
    notes: asString(r.notes) || undefined,
  };
}

function normalizeBudget(raw: unknown, fallbackUserId = ''): Budget | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const userId = asString(r.userId) || fallbackUserId;
  if (!userId) return null;

  const createdAt = asString(r.createdAt) || new Date().toISOString();
  return {
    id: asString(r.id) || generateId('budget'),
    userId,
    amount: Math.max(asNumber(r.amount), 0),
    month: asMonth(r.month),
    year: asYear(r.year),
    createdAt,
    updatedAt: asString(r.updatedAt) || createdAt,
  };
}

function normalizeCategoryBudget(raw: unknown, fallbackUserId = ''): CategoryBudget | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const userId = asString(r.userId) || fallbackUserId;
  if (!userId) return null;

  const createdAt = asString(r.createdAt) || new Date().toISOString();
  return {
    id: asString(r.id) || generateId('cat-budget'),
    userId,
    category: isCategory(r.category) ? r.category : 'Other',
    amount: Math.max(asNumber(r.amount), 0),
    month: asMonth(r.month),
    year: asYear(r.year),
    createdAt,
    updatedAt: asString(r.updatedAt) || createdAt,
  };
}

export function normalizeSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS };
  const r = raw as Record<string, unknown>;
  const theme =
    r.theme === 'light' || r.theme === 'dark' || r.theme === 'system'
      ? r.theme
      : DEFAULT_SETTINGS.theme;
  const pageSize = asNumber(r.pageSize, DEFAULT_SETTINGS.pageSize);

  return {
    currency: asString(r.currency) || DEFAULT_SETTINGS.currency,
    alertThreshold: Math.max(asNumber(r.alertThreshold, DEFAULT_SETTINGS.alertThreshold), 0),
    alertThresholdPct: Math.min(
      Math.max(asNumber(r.alertThresholdPct, DEFAULT_SETTINGS.alertThresholdPct), 1),
      100,
    ),
    theme,
    pageSize: (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
      ? pageSize
      : DEFAULT_SETTINGS.pageSize,
    confirmDelete: r.confirmDelete !== false,
  };
}

/** Accepts any stored shape and returns a fully-populated, type-safe dataset. */
export function normalizeData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return emptyData();
  const r = raw as Record<string, unknown>;

  const users = Array.isArray(r.users)
    ? r.users.map(normalizeUser).filter((u): u is User => u !== null)
    : [];

  const expenses = Array.isArray(r.expenses)
    ? r.expenses.map(normalizeExpense).filter((e): e is Expense => e !== null)
    : [];

  const budgets = Array.isArray(r.budgets)
    ? r.budgets.map((b) => normalizeBudget(b)).filter((b): b is Budget => b !== null)
    : [];

  const categoryBudgets = Array.isArray(r.categoryBudgets)
    ? r.categoryBudgets.map((b) => normalizeCategoryBudget(b)).filter((b): b is CategoryBudget => b !== null)
    : [];

  const settings: Record<string, Settings> = {};
  if (r.settings && typeof r.settings === 'object') {
    for (const [userId, value] of Object.entries(r.settings as Record<string, unknown>)) {
      settings[userId] = normalizeSettings(value);
    }
  }

  // v1 stored a full `currentUser` snapshot; v2 stores only the id.
  let currentUserId = typeof r.currentUserId === 'string' ? r.currentUserId : null;
  if (!currentUserId && r.currentUser && typeof r.currentUser === 'object') {
    currentUserId = asString((r.currentUser as Record<string, unknown>).id) || null;
  }
  if (currentUserId && !users.some((user) => user.id === currentUserId)) {
    currentUserId = null;
  }

  return {
    version: CURRENT_VERSION,
    users,
    expenses,
    budgets,
    categoryBudgets,
    settings,
    currentUserId,
  };
}