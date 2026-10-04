export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  /** Salted SHA-256 digest. Never a plaintext password. */
  password: string;
  passwordSalt: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: Category;
  /** Calendar date as `YYYY-MM-DD`. */
  date: string;
  createdAt: string;
  updatedAt?: string;
  merchant?: string;
  notes?: string;
}

export interface Budget {
  id: string;
  userId: string;
  amount: number;
  /** 1-12 */
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  id: string;
  userId: string;
  category: Category;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Settings {
  currency: string;
  /** Warn when remaining budget drops to or below this absolute amount. */
  alertThreshold: number;
  /** Warn when budget usage crosses this percentage. */
  alertThresholdPct: number;
  theme: ThemePreference;
  pageSize: number;
  /** Ask before deleting an expense. */
  confirmDelete: boolean;
}

export interface AppData {
  version: number;
  users: User[];
  expenses: Expense[];
  budgets: Budget[];
  categoryBudgets: CategoryBudget[];
  settings: Record<string, Settings>;
  /** Only the id is stored so profile edits always resolve to fresh user data. */
  currentUserId: string | null;
}

export type SortKey = 'date' | 'amount' | 'category' | 'description';
export type SortDirection = 'asc' | 'desc';

export interface ExpenseFilters {
  category: Category | 'all';
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  search: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  /** 0-100, capped at 100 for progress display. */
  percentage: number;
  /** Uncapped, so callers can detect heavy overspend. */
  rawPercentage: number;
  isOver: boolean;
  tier: BudgetTier;
  projected: number;
  daysRemaining: number;
}

export type BudgetTier = 'healthy' | 'warning' | 'critical';

export interface ExpenseData {
  description: string;
  amount: number;
  category: Category;
  date: string;
  merchant?: string;
  notes?: string;
}

export const DEFAULT_FILTERS: ExpenseFilters = {
  category: 'all',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  search: '',
  sortKey: 'date',
  sortDirection: 'desc',
};

export const DEFAULT_SETTINGS: Settings = {
  currency: 'USD',
  alertThreshold: 200,
  alertThresholdPct: 85,
  theme: 'system',
  pageSize: 10,
  confirmDelete: true,
};
