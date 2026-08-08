import React from 'react';
import { Menu, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ViewKey } from './Sidebar';

interface TopBarProps {
  activeView: ViewKey;
  onOpenMobile: () => void;
  onOpenProfile: () => void;
}

const VIEW_META: Record<ViewKey, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'A summary of your financial activity' },
  'add-expense': { title: 'Add Expense', subtitle: 'Record a new expense transaction' },
  expenses: { title: 'Expenses', subtitle: 'Review and manage your transactions' },
  analytics: { title: 'Analytics', subtitle: 'Visual insights into your spending' },
  budget: { title: 'Budget', subtitle: 'Plan and track your monthly budget' },
  admin: { title: 'Admin Panel', subtitle: 'Manage users and platform data' },
  profile: { title: 'Edit Profile', subtitle: 'Update your personal information' },
};

const TopBar: React.FC<TopBarProps> = ({ activeView, onOpenMobile, onOpenProfile }) => {
  const { user } = useAuth();
  const meta = VIEW_META[activeView];

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16 lg:h-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 font-semibold">{meta.title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate leading-tight">{meta.title}</h1>
            <p className="text-xs text-slate-500 truncate hidden sm:block">{meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden md:block text-sm text-slate-500 font-medium">{formattedDate}</p>
          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-tight max-w-32 truncate">
                {user?.fullName || user?.email}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user?.isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
