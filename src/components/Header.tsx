import React from 'react';
import { LogOut, Shield, User, TrendingUp, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showAdminPanel: boolean;
  onToggleAdminPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ showAdminPanel, onToggleAdminPanel }) => {
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              Expense Tracker
            </h1>
            <p className="text-sm sm:text-base text-slate-600 truncate">
              Welcome back, <span className="font-medium">{user?.fullName || user?.email}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Admin Panel Button */}
          {isAdmin && (
            <button
              onClick={onToggleAdminPanel}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                showAdminPanel
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{showAdminPanel ? 'Hide Admin' : 'Admin Panel'}</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {/* User Info - Hidden on mobile, shown on larger screens */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 truncate max-w-32">
              {user?.fullName || user?.email}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium shadow-lg shadow-slate-900/25"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;