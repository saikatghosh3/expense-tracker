import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronRight, User, Moon, Sun, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getPageMeta } from '../../config/navigation';
import { IconButton } from '../ui/Primitives';

interface TopBarProps {
  onOpenMobile: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useSettings();
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16 lg:h-20">
        <div className="flex items-center gap-3 min-w-0">
          <IconButton
            icon={Menu}
            onClick={onOpenMobile}
            variant="muted"
            ariaLabel="Open navigation"
            className="lg:hidden"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">{meta.title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {meta.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">{meta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <p className="hidden xl:block text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>

          <IconButton icon={Plus} to="/add-expense" title="Add expense (N)" ariaLabel="Add expense" />

          <IconButton
            icon={resolvedTheme === 'dark' ? Sun : Moon}
            onClick={() => setTheme(nextTheme)}
            title={`Switch to ${nextTheme} mode`}
            ariaLabel={`Switch to ${nextTheme} mode`}
          />

          <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <Link
            to="/profile"
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight max-w-32 truncate">
                {user?.fullName || user?.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {user?.isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
