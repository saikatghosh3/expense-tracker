import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trash2, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import ExpenseList from '../ExpenseList';
import ExpenseFilters from '../ExpenseFilters';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Button } from '../ui/Primitives';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import type { Expense } from '../../types';
import { PAGE_SIZE_OPTIONS } from '../../constants/settings';
import { useExpenses } from '../../hooks/useExpenses';
import { useFilters } from '../../contexts/FiltersContext';
import { filterAndSortExpenses, countActiveFilters } from '../../utils/expenses';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../ui/Toast';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useConfirm, useConfirmFlag } from '../../hooks/useConfirm';

const ExpensesList: React.FC = () => {
  const {
    expenses: allExpenses,
    monthExpenses,
    loading,
    deleteExpense,
    deleteExpenses,
  } = useExpenses();
  const { filters, setFilters, resetFilters, applyPreset, toggleSortDirection } = useFilters();
  const { settings, formatMoney } = useSettings();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const pendingDelete = useConfirm<Expense>();
  const bulkDelete = useConfirmFlag();

  const filtered = useMemo(
    () => filterAndSortExpenses(monthExpenses, filters),
    [monthExpenses, filters],
  );

  const pageSize = (PAGE_SIZE_OPTIONS as readonly number[]).includes(settings.pageSize)
    ? settings.pageSize
    : PAGE_SIZE_OPTIONS[0];
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Clamp the page when filters shrink the result set.
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const visible = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const isFiltered = countActiveFilters(filters) > 0;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((current) => {
      const allVisibleSelected = visible.every((expense) => current.has(expense.id));
      const next = new Set(current);
      visible.forEach((expense) => {
        if (allVisibleSelected) next.delete(expense.id);
        else next.add(expense.id);
      });
      return next;
    });
  }, [visible]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleDelete = useCallback(
    (id: string) => {
      const target = allExpenses.find((expense) => expense.id === id);
      if (target) pendingDelete.ask(target);
    },
    [allExpenses, pendingDelete],
  );

  const { run: removeExpense } = useAsyncAction(
    async (expense: Expense) => {
      await deleteExpense(expense.id);
      toast.success('Expense deleted', `${expense.description} was removed.`);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(expense.id);
        return next;
      });
    },
    { errorTitle: 'Could not delete' },
  );

  const { run: removeSelected } = useAsyncAction(
    async (ids: string[]) => {
      await deleteExpenses(ids);
      toast.success(`${ids.length} expenses deleted`, 'They were removed from this month.');
      setSelectedIds(new Set());
      bulkDelete.close();
    },
    { errorTitle: 'Could not delete' },
  );

  const confirmDelete = useCallback(() => {
    const target = pendingDelete.target;
    if (!target) return;
    pendingDelete.close();
    void removeExpense(target);
  }, [pendingDelete, removeExpense]);

  const confirmBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    void removeSelected(ids);
  }, [selectedIds, removeSelected]);

  const selectedTotal = useMemo(
    () =>
      allExpenses
        .filter((expense) => selectedIds.has(expense.id))
        .reduce((total, expense) => total + expense.amount, 0),
    [allExpenses, selectedIds],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={`${filtered.length} of ${monthExpenses.length} in this month`}
        actions={
          <Button to="/add-expense" variant="accent" icon={Plus}>
            Add Expense
          </Button>
        }
      />

      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        applyPreset={applyPreset}
        toggleSortDirection={toggleSortDirection}
        resultCount={filtered.length}
        totalCount={monthExpenses.length}
      />

      {selectedIds.size > 0 && (
        <Alert
          tone="indigo"
          icon={null}
          size="sm"
          bodyClassName="text-sm font-semibold"
          className="flex-wrap items-center justify-between"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="w-4 h-4" />
                Clear
              </Button>
              <Button variant="danger" size="sm" onClick={bulkDelete.open}>
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          }
        >
          {selectedIds.size} selected &middot; {formatMoney(selectedTotal)}
        </Alert>
      )}

      <ExpenseList
        expenses={visible}
        onDeleteExpense={handleDelete}
        loading={loading}
        isFiltered={isFiltered}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        showHeader={false}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingDelete.isOpen}
        title="Delete this expense?"
        message={pendingDelete.target ? `"${pendingDelete.target.description}" will be removed from your records.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={pendingDelete.close}
      />

      <ConfirmDialog
        isOpen={bulkDelete.isOpen}
        title={`Delete ${selectedIds.size} expenses?`}
        message="Every selected expense will be removed from this month."
        confirmLabel={`Delete ${selectedIds.size}`}
        destructive
        onConfirm={confirmBulkDelete}
        onCancel={bulkDelete.close}
      />
    </div>
  );
};

export default ExpensesList;