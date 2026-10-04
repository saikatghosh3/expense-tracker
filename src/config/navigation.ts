import type { ElementType } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  BarChart3,
  Wallet,
  Shield,
  User,
  Settings,
} from 'lucide-react';

export type NavSection = 'main' | 'account' | 'admin';

export interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: ElementType;
  section: NavSection;
  adminOnly?: boolean;
}

export interface PageMeta {
  title: string;
  subtitle: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    section: 'main',
  },
  {
    path: '/add-expense',
    label: 'Add Expense',
    shortLabel: 'Add',
    icon: PlusCircle,
    section: 'main',
  },
  {
    path: '/expenses',
    label: 'Expenses',
    shortLabel: 'Expenses',
    icon: Receipt,
    section: 'main',
  },
  {
    path: '/analytics',
    label: 'Analytics',
    shortLabel: 'Analytics',
    icon: BarChart3,
    section: 'main',
  },
  {
    path: '/budget',
    label: 'Budget',
    shortLabel: 'Budget',
    icon: Wallet,
    section: 'main',
  },
  {
    path: '/profile',
    label: 'Edit Profile',
    shortLabel: 'Profile',
    icon: User,
    section: 'account',
  },
  {
    path: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
    section: 'account',
  },
  {
    path: '/admin',
    label: 'Admin Panel',
    shortLabel: 'Admin',
    icon: Shield,
    section: 'admin',
    adminOnly: true,
  },
];

export const SECTION_LABELS: Record<NavSection, string> = {
  main: 'Main Menu',
  account: 'Account',
  admin: 'Administration',
};

/** Exact-path metadata; longest-prefix matching handles nested routes. */
export const PAGE_META: Record<string, PageMeta> = {
  '/': { title: 'Overview', subtitle: 'A summary of your financial activity' },
  '/add-expense': { title: 'Add Expense', subtitle: 'Record a new expense transaction' },
  '/expenses': { title: 'Expenses', subtitle: 'Review and manage your transactions' },
  '/analytics': { title: 'Analytics', subtitle: 'Visual insights into your spending' },
  '/budget': { title: 'Budget', subtitle: 'Plan and track your monthly budget' },
  '/profile': { title: 'Edit Profile', subtitle: 'Update your personal information' },
  '/settings': { title: 'Settings', subtitle: 'Preferences, currency and your data' },
  '/admin': { title: 'Admin Panel', subtitle: 'Manage users and platform data' },
};

export const FALLBACK_META: PageMeta = { title: 'Not Found', subtitle: 'That page does not exist' };

export function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) return PAGE_META[pathname];

  const match = Object.keys(PAGE_META)
    .filter((path) => path !== '/' && pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];

  return match ? PAGE_META[match] : FALLBACK_META;
}
