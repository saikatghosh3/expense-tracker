import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Trash2, Shield, Search, UserCog, Database } from 'lucide-react';
import { storage } from '../../data/storage';
import type { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Button, Skeleton } from '../ui/Primitives';
import { Field, Input } from '../ui/Field';
import { EmptyState, SectionCard } from '../ui/Card';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import MetricCard from '../ui/MetricCard';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../../hooks/useConfirm';

interface UserRow {
  user: User;
  expenseCount: number;
  totalExpenses: number;
  budgetCount: number;
}

const STAT_GRADIENT = 'from-indigo-600 to-violet-600';

const AdminPanel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { formatMoneyWhole } = useSettings();
  const toast = useToast();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const pendingDelete = useConfirm<UserRow>();

  const loadUsers = useCallback(() => {
    try {
      setLoading(true);
      const next = storage.getAllUsers().map((user) => {
        const stats = storage.getUserStats(user.id);
        return {
          user,
          expenseCount: stats.expenseCount,
          totalExpenses: stats.totalExpenses,
          budgetCount: stats.budgetCount,
        };
      });
      // Newest first so recently created accounts are easy to find.
      setRows(next.sort((a, b) => a.user.createdAt.localeCompare(b.user.createdAt)));
    } catch (error) {
      toast.error('Could not load users', error instanceof Error ? error.message : undefined);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.user.email.toLowerCase().includes(term) ||
        row.user.fullName.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const totals = useMemo(
    () => ({
      users: rows.length,
      admins: rows.filter((row) => row.user.isAdmin).length,
      expenses: rows.reduce((sum, row) => sum + row.expenseCount, 0),
    }),
    [rows],
  );

  const handleDelete = useCallback(() => {
    const target = pendingDelete.target;
    if (!target) return;
    try {
      storage.deleteUser(target.user.id);
      toast.success('User removed', `${target.user.email} was deleted.`);
      pendingDelete.close();
      loadUsers();
    } catch (error) {
      toast.error('Could not delete user', error instanceof Error ? error.message : undefined);
    }
  }, [pendingDelete, loadUsers, toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtitle="Accounts stored in this browser. Deleting a user removes all of their expenses and budgets."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: String(totals.users), icon: Users },
          { label: 'Administrators', value: String(totals.admins), icon: Shield },
          { label: 'Expenses Tracked', value: String(totals.expenses), icon: Database },
        ].map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            gradient={STAT_GRADIENT}
            valueSize="xl"
          />
        ))}
      </div>

      <SectionCard
        as="div"
        padding=""
        spacing="space-y-5"
        icon={Users}
        gradient={STAT_GRADIENT}
        title="Users"
        subtitle={`${filtered.length} of ${rows.length} shown`}
      >

        <div className="max-w-sm">
          <Field label="Search by name or email" htmlFor="admin-search" icon={Search}>
            <Input
              id="admin-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
            />
          </Field>
        </div>

        {loading && rows.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={search ? Search : Users}
            title={search ? 'No matching users' : 'No users yet'}
            message={
              search ? 'Try a different name or email address.' : 'Accounts created in this browser will appear here.'
            }
            actionTo={search ? undefined : '/auth'}
            actionLabel={search ? undefined : 'Create an account'}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(({ user, expenseCount, totalExpenses, budgetCount }) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-5 h-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user.fullName}
                      </p>
                      {user.isAdmin && <Badge>ADMIN</Badge>}
                      {isSelf && <Badge tone="slate">YOU</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatMoneyWhole(totalExpenses)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{budgetCount}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {budgetCount === 1 ? 'budget' : 'budgets'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => pendingDelete.ask({ user, expenseCount, totalExpenses, budgetCount })}
                    disabled={isSelf}
                    title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                    aria-label={`Delete ${user.fullName}`}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <Alert tone="warning">
        This admin panel manages local browser data only. Anyone with access to
        this browser can see the same users.
      </Alert>

      <ConfirmDialog
        isOpen={pendingDelete.isOpen}
        title="Delete this user?"
        message={
          pendingDelete.target
            ? `${pendingDelete.target.user.email} will be removed along with ${pendingDelete.target.expenseCount} ${
                pendingDelete.target.expenseCount === 1 ? 'expense' : 'expenses'
              } and ${pendingDelete.target.budgetCount} ${
                pendingDelete.target.budgetCount === 1 ? 'budget' : 'budgets'
              }. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete User"
        destructive
        onConfirm={handleDelete}
        onCancel={pendingDelete.close}
      />

      <div className="flex justify-end">
        <Button variant="secondary" onClick={loadUsers}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;