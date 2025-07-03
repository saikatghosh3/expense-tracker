import React from 'react';
import { Filter, Calendar, Tag, X } from 'lucide-react';
import { CATEGORIES } from '../types';

interface ExpenseFiltersProps {
  filters: {
    category: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: { category: string; startDate: string; endDate: string }) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = filters.category !== 'all' || filters.startDate || filters.endDate;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Filter Expenses</h3>
            <p className="text-sm text-slate-600">Refine your expense view</p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg font-medium transition-all duration-200 self-start sm:self-auto"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-sm sm:text-base"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* End Date Filter */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <div className="flex flex-wrap items-center gap-2 text-sm text-indigo-700">
            <Filter className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">Active filters:</span>
            {filters.category !== 'all' && (
              <span className="px-2 py-1 bg-indigo-100 rounded-lg font-medium">
                {filters.category}
              </span>
            )}
            {filters.startDate && (
              <span className="px-2 py-1 bg-indigo-100 rounded-lg font-medium">
                From: {new Date(filters.startDate).toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-indigo-100 rounded-lg font-medium">
                To: {new Date(filters.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;