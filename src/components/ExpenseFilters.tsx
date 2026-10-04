import React from 'react';
import {
  Filter,
  Tag,
  X,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  CATEGORIES,
  type ExpenseFilters as ExpenseFilterState,
  type SortKey,
} from '../types';
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  formatDisplayDate,
} from '../utils/date';
import { countActiveFilters } from '../utils/expenses';
import { useSettings } from '../contexts/SettingsContext';
import { Field, FieldGroup, FieldSet, Input, Select } from './ui/Field';
import { SectionCard } from './ui/Card';
import Alert from './ui/Alert';

interface ExpenseFiltersProps {
  filters: ExpenseFilterState;
  onChange: (updates: Partial<ExpenseFilterState>) => void;
  onReset: () => void;
  applyPreset: (preset: DateRangePreset) => void;
  toggleSortDirection: () => void;
  resultCount: number;
  totalCount: number;
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'description', label: 'Description' },
];

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onChange,
  onReset,
  applyPreset,
  toggleSortDirection,
  resultCount,
  totalCount,
}) => {
  const { formatMoneyWhole } = useSettings();

  const activeCount = countActiveFilters(filters);

  const hasActive =
    activeCount > 0 ||
    filters.sortKey !== 'date' ||
    filters.sortDirection !== 'desc';

  const chips: string[] = [];

  if (filters.search.trim()) {
    chips.push(`"${filters.search.trim()}"`);
  }

  if (filters.category !== 'all') {
    chips.push(filters.category);
  }

  if (filters.startDate) {
    chips.push(`From ${formatDisplayDate(filters.startDate)}`);
  }

  if (filters.endDate) {
    chips.push(`To ${formatDisplayDate(filters.endDate)}`);
  }

  if (filters.minAmount) {
    chips.push(
      `Min ${formatMoneyWhole(parseFloat(filters.minAmount) || 0)}`
    );
  }

  if (filters.maxAmount) {
    chips.push(
      `Max ${formatMoneyWhole(parseFloat(filters.maxAmount) || 0)}`
    );
  }

  return (
    <SectionCard
      icon={Filter}
      gradient="from-indigo-600 to-purple-600"
      title="Filter Expenses"
      subtitle={`Showing ${resultCount} of ${totalCount}`}
      titleAs="h2"
      action={
        hasActive ? (
          <button
            onClick={onReset}
            className="flex w-fit shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          >
            <X className="h-4 w-4" />
            Reset ({activeCount})
          </button>
        ) : undefined
      }
    >
      {/* Quick Range */}
      <div className="space-y-3">
        <span className="block text-sm font-medium text-slate-600 dark:text-slate-400">
          Quick range
        </span>

        <div className="flex flex-wrap gap-2">
          {DATE_RANGE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => applyPreset(preset.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search */}
        <Field
          label="Search"
          htmlFor="filter-search"
          icon={Search}
          className="sm:col-span-2 lg:col-span-6"
        >
          <Input
            id="filter-search"
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange({ search: event.target.value })
            }
            placeholder="Search description, merchant or notes..."
          />
        </Field>

        {/* Category */}
        <Field
          label="Category"
          htmlFor="filter-category"
          icon={Tag}
          className="sm:col-span-2 lg:col-span-6"
        >
          <Select
            id="filter-category"
            value={filters.category}
            onChange={(event) =>
              onChange({
                category:
                  event.target.value as ExpenseFilterState['category'],
              })
            }
          >
            <option value="all">All Categories</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>

        {/* From Date */}
        <Field
          label="From date"
          htmlFor="filter-start"
          className="lg:col-span-3"
        >
          <Input
            id="filter-start"
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              onChange({ startDate: event.target.value })
            }
          />
        </Field>

        {/* To Date */}
        <Field
          label="To date"
          htmlFor="filter-end"
          className="lg:col-span-3"
        >
          <Input
            id="filter-end"
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              onChange({ endDate: event.target.value })
            }
          />
        </Field>

        {/* Amount Range */}
        <FieldSet
          label="Amount range"
          hint="Leave blank for no limit"
          className="lg:col-span-6"
        >
          <FieldGroup>
            <Input
              id="filter-min"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={(event) =>
                onChange({ minAmount: event.target.value })
              }
              placeholder="Min"
              aria-label="Minimum amount"
            />

            <span className="shrink-0 px-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              to
            </span>

            <Input
              id="filter-max"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={(event) =>
                onChange({ maxAmount: event.target.value })
              }
              placeholder="Max"
              aria-label="Maximum amount"
            />
          </FieldGroup>
        </FieldSet>
      </div>

      {/* Sort */}
      <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
        <div className="mb-3 flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />

          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Sort by
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onChange({
                  sortKey: option.value,
                  sortDirection:
                    filters.sortKey === option.value
                      ? filters.sortDirection
                      : 'desc',
                })
              }
              aria-pressed={filters.sortKey === option.value}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                filters.sortKey === option.value
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            onClick={toggleSortDirection}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label={`Sort ${
              filters.sortDirection === 'asc'
                ? 'descending'
                : 'ascending'
            }`}
          >
            {filters.sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}

            {filters.sortDirection === 'asc'
              ? 'Ascending'
              : 'Descending'}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {chips.length > 0 && (
        <Alert
          tone="indigo"
          icon={Filter}
          bodyClassName="flex flex-wrap items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300"
        >
          <span className="font-semibold">Active filters:</span>

          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-lg bg-indigo-100 px-2.5 py-1.5 font-medium dark:bg-indigo-500/20"
            >
              {chip}
            </span>
          ))}
        </Alert>
      )}
    </SectionCard>
  );
};

export default ExpenseFilters;