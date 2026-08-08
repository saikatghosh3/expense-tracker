import React, { useState } from 'react';
import { TrendingUp, BarChart3, ShieldCheck, Wallet, Sparkles, ArrowRight } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Visualize spending trends with beautiful, real-time charts.',
  },
  {
    icon: Wallet,
    title: 'Budget Control',
    description: 'Set monthly budgets and get alerts before you overspend.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'Your financial data stays safe, organized and private.',
  },
];

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-slate-50 overflow-x-hidden">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 xl:p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 animate-gradient animate-from-right">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-blob"></div>
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-violet-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-blob"
          style={{ animationDelay: '-4s', animationDuration: '16s' }}
        ></div>
        <div
          className="absolute top-1/3 right-10 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl animate-blob"
          style={{ animationDelay: '-8s', animationDuration: '18s' }}
        ></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-blob"></div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        ></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-16 animate-fade-up">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-indigo-500/40 animate-pulse-ring"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50 animate-float">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-tight">ExpenseTracker</p>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Finance Suite</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-white">Take control of your </span>
            <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent animate-shimmer-text">
              finances
            </span>
          </h1>
          <p
            className="text-slate-400 text-lg leading-relaxed max-w-md mb-12 animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            A professional expense tracking platform designed to help you spend smarter, save more, and reach your
            financial goals.
          </p>

          <div className="space-y-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 group cursor-default animate-fade-up"
                  style={{ animationDelay: `${0.3 + index * 0.12}s` }}
                >
                  <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40">
                    <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-0.5 transition-transform duration-300 group-hover:translate-x-1">
                      {feature.title}
                    </p>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-16 animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">2.4k+</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Users</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">$1.2M+</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tracked Monthly</p>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">99.9%</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 min-h-screen lg:min-h-0 animate-from-left" style={{ animationDelay: '0.15s' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8 animate-fade-up">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/30 animate-pulse-ring"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-float">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">ExpenseTracker</h1>
            <p className="text-sm text-slate-500 text-center px-4">
              Take control of your finances with smart expense tracking
            </p>
          </div>

          <div
            className="flex items-center gap-2 justify-center mb-8 animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-bounce-soft" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              {isLogin ? 'Welcome back' : 'Join today'}
            </span>
          </div>

          <div key={isLogin ? 'login' : 'signup'} className="animate-slide-in-right">
            {isLogin ? (
              <LoginForm onToggleForm={() => setIsLogin(false)} />
            ) : (
              <SignUpForm onToggleForm={() => setIsLogin(true)} />
            )}
          </div>

          <p
            className="text-center text-[11px] text-slate-400 mt-8 flex items-center justify-center gap-1.5 animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Protected by industry-standard security practices
            <ArrowRight className="w-3 h-3 text-indigo-400 animate-bounce-soft" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
