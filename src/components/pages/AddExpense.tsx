import React, { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import ExpenseForm from '../ExpenseForm';
import type { ExpenseData } from '../../types';
import { useExpenses } from '../../hooks/useExpenses';
import { useSettings } from '../../contexts/SettingsContext';
import { isDateInMonth } from '../../utils/date';
import { EmptyState } from '../ui/Card';
import PageHeader from '../ui/PageHeader';
import { useToast } from '../ui/Toast';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const expenses = useExpenses();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const editing = useMemo(
    () => (editId ? expenses.expenses.find((expense) => expense.id === editId) ?? null : null),
    [editId, expenses.expenses],
  );

  const initialValues = useMemo<Partial<ExpenseData> | undefined>(() => {
    if (!editing) return undefined;
    return {
      description: editing.description,
      amount: editing.amount,
      category: editing.category,
      date: editing.date,
      merchant: editing.merchant,
      notes: editing.notes,
    };
  }, [editing]);

  /**
   * The warning must reflect the month the expense actually lands in. When
   * editing, the old amount is removed so the projection shows the new total.
   */
  const budgetContext = useMemo(() => {
    const date = initialValues?.date;
    const inSelectedMonth =
      !!date && isDateInMonth(date, expenses.selectedMonth.month, expenses.selectedMonth.year);

    if (!inSelectedMonth) {
      return { budget: 0, monthSpent: 0 };
    }

    const monthSpent = editing ? expenses.monthSpent - editing.amount : expenses.monthSpent;
    return { budget: expenses.budget, monthSpent };
  }, [initialValues?.date, expenses.selectedMonth, expenses.monthSpent, expenses.budget, editing]);

  const handleSubmit = useCallback(
    async (data: ExpenseData) => {
      if (editing) {
        await expenses.updateExpense(editing.id, data);
        toast.success('Expense updated', data.description);
      } else {
        await expenses.addExpense(data);
        toast.success('Expense added', `${data.description} was saved.`);
      }
      navigate('/');
    },
    [editing, expenses, navigate, toast],
  );

  if (editId && !editing && !expenses.loading) {
    return (
      <div className="max-w-xl mx-auto">
        <EmptyState
          icon={Receipt}
          title="Expense not found"
          message="It may have been deleted, or the link is out of date."
          actionLabel="Back to expenses"
          onAction={() => navigate('/expenses')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={editing ? 'Edit Expense' : 'Add Expense'}
        subtitle={
          editing
            ? 'Update the details below and save your changes.'
            : 'Record something you have spent.'
        }
      />

      <ExpenseForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={editing ? 'Save Changes' : 'Add Expense'}
        onCancel={() => navigate(-1)}
        budget={budgetContext.budget}
        monthSpent={budgetContext.monthSpent}
        alertThreshold={settings.alertThreshold}
      />
    </div>
  );
};

export default AddExpense;