import React, { useState } from 'react';
import { TrendingUp, BarChart3, Target, HardDrive, Laptop, Moon } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Charts That Explain Themselves',
    description: 'Category breakdowns, weekday patterns, monthly trends and cumulative spend.',
  },
  {
    icon: Target,
    title: 'Budgets With Real Projections',
    description: 'Set a monthly or per-category limit and see where the month is heading.',
  },
  {
    icon: HardDrive,
    title: 'Your Data Stays On Your Device',
    description: 'No account on any server. Everything is stored in this browser.',
  },
  {
    icon: Laptop,
    title: 'Offline And Lightweight',
    description: 'No network calls, no tracking, no waiting. It just works.',
  },
];

const HIGHLIGHTS = [
  { icon: Moon, label: 'Dark mode' },
  { icon: TrendingUp, label: 'Multi-currency' },
  { icon: HardDrive, label: 'CSV & JSON export' },
];

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-center relative overflow-hidden p-12 xl:p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-tight">ExpenseTracker</p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Personal Finance</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 text-white">
            Know exactly{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              where your money goes
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            A fast, private expense tracker that runs entirely in your browser. No sign-ups on someone else&apos;s
            servers, no subscriptions, no tracking.
          </p>

          <div className="space-y-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 group">
                <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40">
                  <feature.icon className="w-5 h-5 text-indigo-400 transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-0.5">{feature.title}</p>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {HIGHLIGHTS.map((highlight) => (
              <span
                key={highlight.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300"
              >
                <highlight.icon className="w-3.5 h-3.5 text-indigo-400" />
                {highlight.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">ExpenseTracker</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-4">
              Track your spending privately, right in this browser
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center mb-8">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </span>
          </div>

          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggleForm={() => setIsLogin(true)} />
          )}

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-8 max-w-sm mx-auto leading-relaxed">
            This app runs locally with no server. Passwords are hashed before being saved in this browser, so avoid
            reusing a password you use elsewhere.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;