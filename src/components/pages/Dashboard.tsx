import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Overview from '../Dashboard/Overview';
import type { Expense } from '../../types';
import { useExpenses } from '../../hooks/useExpenses';
import { useMonthNavigation } from '../../hooks/useMonthNavigation';
import { useToast } from '../ui/Toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    expenses,
    budget,
    budgetStatus,
    selectedMonth,
    isCurrentMonth,
    availableMonths,
    goToMonth,
    goToMonthSelection,
    deleteExpense,
    loading,
  } = useExpenses();
  const { onPrevMonth, onNextMonth, onResetMonth, onSelectMonth } = useMonthNavigation({
    goToMonth,
    goToMonthSelection,
  });

  const handleDeleteExpense = useCallback(
    (id: string) => {
      void deleteExpense(id).catch((error: unknown) => {
        toast.error('Could not delete expense', error instanceof Error ? error.message : undefined);
      });
    },
    [deleteExpense, toast],
  );

  const handleEditExpense = useCallback(
    (expense: Expense) => navigate(`/add-expense?edit=${expense.id}`),
    [navigate],
  );

  return (
    <Overview
      expenses={expenses}
      budget={budget}
      status={budgetStatus}
      month={selectedMonth.month}
      year={selectedMonth.year}
      isCurrentMonth={isCurrentMonth}
      availableMonths={availableMonths}
      onPrevMonth={onPrevMonth}
      onNextMonth={onNextMonth}
      onSelectMonth={onSelectMonth}
      onResetMonth={onResetMonth}
      loading={loading}
      onDeleteExpense={handleDeleteExpense}
      onEditExpense={handleEditExpense}
    />
  );
};

export default Dashboard;