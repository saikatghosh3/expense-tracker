export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  users: User[];
  expenses: Expense[];
  budgets: Budget[];
  currentUser: User | null;
}

const STORAGE_KEY = 'expense-tracker-data';

// Initialize with default admin user
const defaultData: AppData = {
  users: [
    {
      id: 'admin-user-id',
      email: 'admin@admin.com',
      password: 'admin123',
      fullName: 'Administrator',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    }
  ],
  expenses: [],
  budgets: [],
  currentUser: null,
};

export const storage = {
  // Get all data
  getData(): AppData {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.setData(defaultData);
      return defaultData;
    }
    return JSON.parse(stored);
  },

  // Set all data
  setData(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // User operations
  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const data = this.getData();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    data.users.push(newUser);
    this.setData(data);
    return newUser;
  },

  getUserByEmail(email: string): User | null {
    const data = this.getData();
    return data.users.find(user => user.email === email) || null;
  },

  updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const data = this.getData();
    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex < 0) return null;

    const updatedUser = {
      ...data.users[userIndex],
      ...updates,
    };

    data.users[userIndex] = updatedUser;

    if (data.currentUser && data.currentUser.id === userId) {
      data.currentUser = updatedUser;
    }

    this.setData(data);
    return updatedUser;
  },

  deleteUser(userId: string): void {
    const data = this.getData();
    data.users = data.users.filter(user => user.id !== userId);
    data.expenses = data.expenses.filter(expense => expense.userId !== userId);
    data.budgets = data.budgets.filter(budget => budget.userId !== userId);
    this.setData(data);
  },

  // Auth operations
  setCurrentUser(user: User | null): void {
    const data = this.getData();
    data.currentUser = user;
    this.setData(data);
  },

  getCurrentUser(): User | null {
    const data = this.getData();
    return data.currentUser;
  },

  // Expense operations
  addExpense(expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const data = this.getData();
    const newExpense: Expense = {
      ...expenseData,
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    data.expenses.push(newExpense);
    this.setData(data);
    return newExpense;
  },

  getExpensesByUser(userId: string): Expense[] {
    const data = this.getData();
    return data.expenses
      .filter(expense => expense.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteExpense(expenseId: string): void {
    const data = this.getData();
    data.expenses = data.expenses.filter(expense => expense.id !== expenseId);
    this.setData(data);
  },

  // Budget operations
  setBudget(userId: string, amount: number, month: number, year: number): Budget {
    const data = this.getData();
    const existingBudgetIndex = data.budgets.findIndex(
      budget => budget.userId === userId && budget.month === month && budget.year === year
    );

    const budgetData: Budget = {
      id: existingBudgetIndex >= 0 ? data.budgets[existingBudgetIndex].id : `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount,
      month,
      year,
      createdAt: existingBudgetIndex >= 0 ? data.budgets[existingBudgetIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingBudgetIndex >= 0) {
      data.budgets[existingBudgetIndex] = budgetData;
    } else {
      data.budgets.push(budgetData);
    }

    this.setData(data);
    return budgetData;
  },

  getBudget(userId: string, month: number, year: number): Budget | null {
    const data = this.getData();
    return data.budgets.find(
      budget => budget.userId === userId && budget.month === month && budget.year === year
    ) || null;
  },

  // Admin operations
  getAllUsers(): User[] {
    const data = this.getData();
    return data.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUserStats(userId: string): { expenseCount: number; totalExpenses: number } {
    const data = this.getData();
    const userExpenses = data.expenses.filter(expense => expense.userId === userId);
    return {
      expenseCount: userExpenses.length,
      totalExpenses: userExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
  },
};