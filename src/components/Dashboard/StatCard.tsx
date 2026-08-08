import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  footer?: string;
  footerTone?: 'positive' | 'negative' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, gradient, footer, footerTone = 'neutral' }) => {
  const footerColor = {
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    neutral: 'text-slate-500',
  }[footerTone];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {footer && <p className={`text-xs font-medium mt-1.5 ${footerColor}`}>{footer}</p>}
      </div>
    </div>
  );
};

export default StatCard;
