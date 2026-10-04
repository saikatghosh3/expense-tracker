import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../ui/Primitives';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-5">
      <Compass className="w-8 h-8 text-white" />
    </div>
    <p className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2">404</p>
    <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Page not found</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
      The page you are looking for does not exist or has been moved.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link to="/">
        <Button>Go to Dashboard</Button>
      </Link>
      <Link to="/expenses">
        <Button variant="secondary">View Expenses</Button>
      </Link>
    </div>
  </div>
);

export default NotFound;