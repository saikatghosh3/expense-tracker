import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  BarChart3,
  Wallet,
  Shield,
  User,
  LogOut,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type ViewKey =
  | 'overview'
  | 'add-expense'
  | 'expenses'
  | 'analytics'
  | 'budget'
  | 'admin'
  | 'profile';

interface SidebarProps {
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, mobileOpen, onCloseMobile }) => {
  const { user, isAdmin, signOut } = useAuth();

  const mainNav: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { key: 'expenses', label: 'Expenses', icon: Receipt },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'budget', label: 'Budget', icon: Wallet },
  ];

  const handleNavigate = (view: ViewKey) => {
    onNavigate(view);
    onCloseMobile();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavLink = ({ item }: { item: { key: ViewKey; label: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const active = activeView === item.key;
    return (
      <button
        onClick={() => handleNavigate(item.key)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/40'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'text-slate-500 group-hover:text-indigo-400'}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-950 border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight tracking-tight">ExpenseTracker</p>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">Finance Suite</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <p className="px-4 mb-3 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Main Menu</p>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink key={item.key} item={item} />
              ))}
            </nav>
          </div>

          <div>
            <p className="px-4 mb-3 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">Account</p>
            <nav className="space-y-1">
              <NavLink item={{ key: 'profile', label: 'Edit Profile', icon: User }} />
              {isAdmin && (
                <>
                  <p className="px-4 mt-6 mb-3 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
                    Administration
                  </p>
                  <NavLink item={{ key: 'admin', label: 'Admin Panel', icon: Shield }} />
                </>
              )}
            </nav>
          </div>
        </div>

        {/* User card + sign out */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
