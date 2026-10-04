import React, { useMemo, useState } from 'react';
import { Plus, Pencil, DollarSign, FileText, Tag, Store, StickyNote, X } from 'lucide-react';
import { CATEGORIES, type Category, type ExpenseData } from '../types';
import { getCategoryIcon } from '../constants/categories';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './ui/Primitives';
import { Field, Input, Textarea } from './ui/Field';
import { SectionCard } from './ui/Card';
import Alert from './ui/Alert';
import Modal from './ui/Modal';
import { formatCurrencyPrecise } from '../utils/format';
import { todayISO } from '../utils/date';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseData) => Promise<void> | void;
  initialValues?: Partial<ExpenseData>;
  submitLabel?: string;
  loading?: boolean;
  /** Monthly budget. Omit to disable the over-budget warning. */
  budget?: number;
  /** Spend already recorded in the same month. */
  monthSpent?: number;
  /** Warn when the post-submit remainder falls to or below this amount. */
  alertThreshold?: number;
  onCancel?: () => void;
  /** Renders inside a modal shell rather than as a standalone card. */
  variant?: 'card' | 'plain';
}

type Errors = Partial<Record<'description' | 'amount' | 'category' | 'date', string>>;

const emptyForm = (): ExpenseData => ({
  description: '',
  amount: 0,
  category: '' as Category,
  date: todayISO(),
  merchant: '',
  notes: '',
});

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  initialValues,
  submitLabel,
  loading = false,
  budget = 0,
  monthSpent = 0,
  alertThreshold = 200,
  onCancel,
  variant = 'card',
}) => {
  const { currency } = useSettings();
  const isEdit = Boolean(initialValues?.description);

  const [formData, setFormData] = useState<ExpenseData>(() => ({
    ...emptyForm(),
    ...initialValues,
  }));
  const [amountInput, setAmountInput] = useState(() =>
    initialValues?.amount !== undefined && initialValues.amount !== 0 ? String(initialValues.amount) : '',
  );
  const [errors, setErrors] = useState<Errors>({});
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [pendingData, setPendingData] = useState<ExpenseData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = parseFloat(amountInput);
  const amountValue = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  /**
   * Remaining budget *after* this expense lands. The previous version compared the
   * pre-add balance against a flat threshold, so large purchases could slip through.
   */
  const projectedRemaining = useMemo(() => budget - monthSpent - amountValue, [budget, monthSpent, amountValue]);

  const willExceedThreshold = budget > 0 && projectedRemaining < alertThreshold;

  const validate = (): Errors => {
    const next: Errors = {};
    if (!formData.description.trim()) next.description = 'Description is required';
    if (!amountInput || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      next.amount = 'Enter an amount greater than 0';
    }
    if (!formData.category) next.category = 'Choose a category';
    if (!formData.date) next.date = 'Date is required';
    return next;
  };

  const commit = async (data: ExpenseData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
      if (!isEdit) {
        setFormData(emptyForm());
        setAmountInput('');
      }
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const data: ExpenseData = {
      description: formData.description.trim(),
      amount: amountValue,
      category: formData.category,
      date: formData.date,
      merchant: formData.merchant?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    if (willExceedThreshold && !isEdit) {
      setPendingData(data);
      setShowBudgetWarning(true);
      return;
    }

    void commit(data);
  };

  const busy = loading || submitting;
  const heading = isEdit ? 'Edit Expense' : 'Add New Expense';
  const Icon = isEdit ? Pencil : Plus;
  const gradient = isEdit ? 'from-amber-600 to-orange-600' : 'from-emerald-600 to-green-600';

  const lowBudgetBanner =
    budget > 0 && projectedRemaining >= 0 && projectedRemaining < alertThreshold ? (
      <Alert
        tone="warning"
        icon={null}
        title="Budget Alert"
        bodyClassName="text-sm text-amber-700 dark:text-amber-300/90"
      >
        {formatCurrencyPrecise(projectedRemaining, currency)} will remain after this expense.
      </Alert>
    ) : null;

  const fields = (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Description" htmlFor="expense-description" error={errors.description} icon={FileText}>
        <Input
          id="expense-description"
          type="text"
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.target.value })}
          placeholder="What did you spend on?"
          maxLength={120}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Amount" htmlFor="expense-amount" error={errors.amount} icon={DollarSign}>
          <Input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </Field>

        {/* Native date inputs render their own picker affordance, so no icon here. */}
        <Field label="Date" htmlFor="expense-date" error={errors.date}>
          <Input
            id="expense-date"
            type="date"
            value={formData.date}
            onChange={(event) => setFormData({ ...formData, date: event.target.value })}
          />
        </Field>
      </div>

      <Field label="Merchant" htmlFor="expense-merchant" icon={Store} hint="Optional">
        <Input
          id="expense-merchant"
          type="text"
          value={formData.merchant ?? ''}
          onChange={(event) => setFormData({ ...formData, merchant: event.target.value })}
          placeholder="Where did it happen?"
          maxLength={80}
        />
      </Field>

        <div>
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Category
            <span className="sr-only"> (required)</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Category">
            {CATEGORIES.map((category) => {
              const selected = formData.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFormData({ ...formData, category })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-sm sm:text-base flex-shrink-0">{getCategoryIcon(category)}</span>
                  <span className="truncate">{category}</span>
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p role="alert" className="text-rose-600 dark:text-rose-400 text-sm mt-2 font-medium">
              {errors.category}
            </p>
          )}
        </div>

        <Field label="Notes" htmlFor="expense-notes" icon={StickyNote} hint="Optional" multiline>
          <Textarea
            id="expense-notes"
            value={formData.notes ?? ''}
            onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
            className="min-h-[80px] resize-y"
            placeholder="Anything worth remembering about this?"
            maxLength={500}
          />
        </Field>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {onCancel && (
            <Button type="button" variant="secondary" size="lg" onClick={onCancel} className="sm:flex-1">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
          <Button type="submit" size="lg" loading={busy} className="flex-1">
            {!busy && <Icon className="w-5 h-5" />}
            {busy ? 'Saving...' : (submitLabel ?? (isEdit ? 'Save Changes' : 'Add Expense'))}
          </Button>
        </div>
    </form>
  );

  const warningModal = (
    <Modal
        isOpen={showBudgetWarning}
        onClose={() => setShowBudgetWarning(false)}
        title="Budget Warning"
        icon={Tag}
        iconClassName="bg-amber-100 dark:bg-amber-500/20 text-amber-600"
        closeOnOverlayClick={false}
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={() => setShowBudgetWarning(false)}
              className="sm:flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowBudgetWarning(false);
                if (pendingData) void commit(pendingData);
                setPendingData(null);
              }}
              className="sm:flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Add Anyway
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            After this expense you would have{' '}
            <span
              className={`font-bold ${projectedRemaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            >
              {projectedRemaining < 0
                ? `${formatCurrencyPrecise(Math.abs(projectedRemaining), currency)} over budget`
                : `${formatCurrencyPrecise(projectedRemaining, currency)} left`}
            </span>
            .
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your monthly budget is {formatCurrencyPrecise(budget, currency)} and you have already spent{' '}
            {formatCurrencyPrecise(monthSpent, currency)}. Consider whether this purchase is necessary.
          </p>
        </div>
    </Modal>
  );

  if (variant === 'plain') {
    return (
      <>
        {fields}
        {warningModal}
      </>
    );
  }

  return (
    <SectionCard
      padding="p-4 sm:p-6"
      spacing="space-y-6"
      icon={Icon}
      gradient={gradient}
      title={heading}
      titleAs="h2"
    >
      {lowBudgetBanner}

      {fields}
      {warningModal}
    </SectionCard>
  );
};

export default ExpenseForm;
