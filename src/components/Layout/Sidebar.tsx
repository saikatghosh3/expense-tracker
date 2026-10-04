import React, { useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, TrendingUp, User, X, ChevronsLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_ITEMS, SECTION_LABELS, type NavItem, type NavSection } from '../../config/navigation';
import { useToast } from '../ui/Toast';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile, collapsed, onToggleCollapse }) => {
  const { user, isAdmin, signOut } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  const sections = (['main', 'account', 'admin'] as NavSection[])
    .map((section) => ({ section, items: visibleItems.filter((item) => item.section === section) }))
    .filter((group) => group.items.length > 0);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast.success('Signed out', 'See you next time.');
    } catch (error) {
      toast.error('Could not sign out', error instanceof Error ? error.message : undefined);
    }
  }, [signOut, toast]);

  const isActive = (item: NavItem): boolean => {
    if (item.path === '/') return location.pathname === '/';
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky lg:top-0 lg:translate-x-0 inset-y-0 left-0 z-50 flex flex-col h-screen bg-slate-950 border-r border-white/5 transform transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : 'lg:w-72 w-72'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-20 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-950/50">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white font-bold text-base leading-tight tracking-tight truncate">
                  ExpenseTracker
                </p>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">Finance Suite</p>
              </div>
            )}
          </div>
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 sm:px-4 space-y-8" aria-label="Main navigation">
          {sections.map(({ section, items }) => (
            <div key={section}>
              {!collapsed && (
                <p className="px-4 mb-3 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
                  {SECTION_LABELS[section]}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/40'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'text-slate-500 group-hover:text-indigo-400'}`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block px-3 sm:px-4 pb-2">
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <ChevronsLeft
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User card + sign out */}
        <div className="p-3 sm:p-4 border-t border-white/5">
          <div
            className={`flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 ${
              collapsed ? 'lg:flex-col lg:py-3 lg:px-1 px-2 py-3' : 'px-2 py-3'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
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
