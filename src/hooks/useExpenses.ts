import { useState, useEffect } from 'react';
import { storage, Expense, Budget } from '../data/storage';
import { useAuth } from '../contexts/AuthContext';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load expenses
      const userExpenses = storage.getExpensesByUser(user.id);
      setExpenses(userExpenses);

      // Load current month's budget
      const currentBudget = storage.getBudget(user.id, currentMonth, currentYear);
      setBudget(currentBudget?.amount || 0);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    const newExpense = storage.addExpense({
      ...expenseData,
      userId: user.id,
    });

    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const deleteExpense = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    storage.deleteExpense(id);
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateBudget = async (amount: number) => {
    if (!user) throw new Error('User not authenticated');

    const budgetData = storage.setBudget(user.id, amount, currentMonth, currentYear);
    setBudget(amount);
    return budgetData;
  };

  const getFilteredExpenses = async (filters: {
    category?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    if (!user) return [];

    let filteredExpenses = storage.getExpensesByUser(user.id);

    if (filters.category && filters.category !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === filters.category);
    }

    if (filters.startDate) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date <= filters.endDate!);
    }

    return filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    expenses,
    budget,
    loading,
    addExpense,
    deleteExpense,
    updateBudget,
    getFilteredExpenses,
    loadData,
  };
};