import React, { useEffect, useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Coins,
  BellRing,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { storage } from '../../data/storage';
import { Button } from '../ui/Primitives';
import { Field, Input, Select } from '../ui/Field';
import { SectionCard } from '../ui/Card';
import PageHeader from '../ui/PageHeader';
import Alert from '../ui/Alert';
import ActionTile from '../ui/ActionTile';
import ProgressBar from '../ui/ProgressBar';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { useAmountField } from '../../hooks/useAmountField';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useConfirmFlag } from '../../hooks/useConfirm';
import { CURRENCY_OPTIONS, currencyOptionLabel } from '../../constants/currency';
import { THEME_OPTIONS } from '../../constants/settings';
import { BUDGET_TIER_HEALTHY_PCT, BUDGET_TIER_WARNING_PCT } from '../../constants/budget';
import {
  CSV_TEMPLATE,
  exportExpensesCsv,
  getStorageUsage,
  formatBytes,
  parseExpensesCsv,
  readFileAsText,
  downloadText,
} from '../../utils/exporters';
import type { CsvParseResult } from '../../utils/exporters';

type PendingImportRow = CsvParseResult['expenses'][number];

const THRESHOLD_ERROR = 'The alert threshold must be 0 or more.';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { settings, updateSettings, setTheme } = useSettings();
  const toast = useToast();

  const {
    value: thresholdInput,
    setValue: setThresholdInput,
    validate: validateThreshold,
    reset: resetThreshold,
  } = useAmountField({ invalidMessage: THRESHOLD_ERROR });

  const [importing, setImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImportRow[]>(
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wipe = useConfirmFlag();
  const usage = getStorageUsage();

  useEffect(() => {
    resetThreshold(String(settings.alertThreshold));
  }, [settings.alertThreshold, resetThreshold]);

  const saveThreshold = () => {
    const parsed = validateThreshold();

    if (parsed === null) {
      toast.warning('Enter a valid amount', THRESHOLD_ERROR);
      return;
    }

    updateSettings({ alertThreshold: parsed });

    toast.success(
      'Alert threshold updated',
      `You will be warned at ${parsed} remaining.`,
    );
  };

  const handleExportJson = () => {
    downloadText(
      `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
      storage.exportAll(),
      'application/json',
    );

    toast.success(
      'Backup downloaded',
      'Keep this file somewhere safe.',
    );
  };

  const handleExportCsv = () => {
    if (!user) return;

    const expenses = storage.getExpensesByUser(user.id);

    if (expenses.length === 0) {
      toast.warning(
        'Nothing to export',
        'You have no expenses yet.',
      );
      return;
    }

    exportExpensesCsv(
      expenses,
      `expenses-${new Date().toISOString().slice(0, 10)}.csv`,
    );

    toast.success(
      'CSV downloaded',
      `${expenses.length} expenses exported.`,
    );
  };

  const { run: importBackup } = useAsyncAction(
    async (file: File) => {
      setImporting(true);
      try {
        const text = await readFileAsText(file);

        storage.importAll(text);
        storage.reset();

        toast.success(
          'Backup restored',
          'Everything was reloaded from the backup.',
        );

        setTimeout(() => window.location.reload(), 600);
      } finally {
        setImporting(false);
      }
    },
    { errorTitle: 'Import failed' },
  );

  const { run: importCsvRows } = useAsyncAction(
    async (rows: PendingImportRow[]) => {
      if (!user) return;

      for (const row of rows) {
        storage.addExpense({
          userId: user.id,
          description: row.description,
          amount: row.amount,
          category: row.category,
          date: row.date,
          merchant: row.merchant,
          notes: row.notes,
        });
      }

      toast.success(
        'Import complete',
        `${rows.length} expenses added.`,
      );

      window.location.reload();
    },
    { errorTitle: 'Import failed' },
  );

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.json')) {
      await importBackup(file);
      return;
    }

    try {
      const text = await readFileAsText(file);
      const result = parseExpensesCsv(text);

      if (result.expenses.length === 0) {
        toast.error(
          'No expenses found',
          result.errors[0] ??
            'Check that the file has the right columns.',
        );
        return;
      }

      setPendingImport(result.expenses);

      result.errors.forEach((error) =>
        toast.warning('Import notice', error),
      );
    } catch (error) {
      toast.error(
        'Could not read file',
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  const confirmCsvImport = () => {
    if (pendingImport.length === 0) return;
    setPendingImport([]);
    void importCsvRows(pendingImport);
  };

  const handleWipeData = () => {
    try {
      storage.reset();
      localStorage.removeItem('expense-tracker-data');
      localStorage.removeItem('expense-tracker-data.corrupt');

      toast.success('All local data cleared');

      setTimeout(() => window.location.reload(), 400);
    } catch {
      toast.error(
        'Could not clear data',
        'Try clearing site data from your browser settings.',
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Appearance, currency, alerts and your local data."
      />

      {/* Appearance */}
      <SectionCard
        icon={SettingsIcon}
        gradient="from-indigo-600 to-violet-600"
        title="Appearance"
        subtitle="Choose how Expense Tracker looks"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = settings.theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                aria-pressed={active}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                />

                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Currency */}
      <SectionCard
        icon={Coins}
        gradient="from-emerald-600 to-teal-600"
        title="Currency"
        subtitle="Used for every amount in the app"
        spacing="space-y-5"
      >
        <Field
          label="Display currency"
          htmlFor="settings-currency"
          className="w-full max-w-sm"
          hint={
            <>
              Preview:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                1,234.56
              </span>
            </>
          }
        >
          <Select
            id="settings-currency"
            value={settings.currency}
            onChange={(event) =>
              updateSettings({ currency: event.target.value })
            }
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option
                key={option.code}
                value={option.code}
              >
                {currencyOptionLabel(option.code, option.label)}
              </option>
            ))}
          </Select>
        </Field>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Changing the currency changes how amounts are displayed.
          Stored amounts are not converted.
        </p>
      </SectionCard>

      {/* Alerts */}
      <SectionCard
        icon={BellRing}
        gradient="from-amber-500 to-orange-600"
        title="Budget Alerts"
        subtitle="Get warned before you overspend"
        spacing="space-y-5"
      >
        <div className="w-full max-w-sm">
          <Field
            label="Warn me when this much is left"
            htmlFor="settings-threshold"
            hint="Alerts appear on your dashboard and budget page when your remaining budget reaches this amount."
            action={
              <Button onClick={saveThreshold} size="sm">
                Save
              </Button>
            }
          >
            <Input
              id="settings-threshold"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={thresholdInput}
              onChange={(event) =>
                setThresholdInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveThreshold();
              }}
            />
          </Field>
        </div>
      </SectionCard>

      {/* Data */}
      <SectionCard
        icon={Database}
        gradient="from-slate-600 to-slate-800"
        title="Your Data"
        subtitle="Everything is stored in this browser only"
      >
        <Alert tone="info">
          There is no server. Your data lives in this browser&apos;s local
          storage, so clearing site data or using a different browser will not
          show your expenses. Download a backup regularly.
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionTile
            icon={Download}
            iconClassName="text-indigo-600 dark:text-indigo-400"
            title="Export backup (JSON)"
            description="Everything, for restoring later"
            onClick={handleExportJson}
          />

          <ActionTile
            icon={FileSpreadsheet}
            iconClassName="text-emerald-600 dark:text-emerald-400"
            title="Export CSV"
            description="For Excel or Google Sheets"
            onClick={handleExportCsv}
          />

          <ActionTile
            icon={Upload}
            iconClassName="text-amber-600 dark:text-amber-400"
            title={importing ? 'Importing…' : 'Import file'}
            description="Backup (JSON) or expenses (CSV)"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          />

          <ActionTile
            icon={FileSpreadsheet}
            iconClassName="text-sky-600 dark:text-sky-400"
            title="CSV template"
            description="See the expected columns"
            onClick={() =>
              downloadText(
                'expense-tracker-template.csv',
                CSV_TEMPLATE,
                'text/csv',
              )
            }
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="hidden"
          onChange={(event) => {
            void handleFileSelected(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        {usage && (
          <div className="pt-1">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Local storage used</span>

              <span className="text-right tabular-nums">
                {formatBytes(usage.usedBytes)} of ~
                {formatBytes(usage.totalBytes)}
              </span>
            </div>

            <ProgressBar
              value={usage.percent}
              filled="solid"
              size="xs"
              minPercent={1}
              label="Local storage used"
              tone={
                usage.percent > BUDGET_TIER_WARNING_PCT
                  ? 'critical'
                  : usage.percent > BUDGET_TIER_HEALTHY_PCT
                    ? 'warning'
                    : 'healthy'
              }
            />
          </div>
        )}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        icon={Trash2}
        gradient="from-rose-600 to-red-600"
        title="Danger Zone"
        subtitle="These actions cannot be undone"
        spacing="space-y-5"
        className="border-rose-200 dark:border-rose-500/30"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => void signOut()}
            className="w-full sm:w-auto"
          >
            Sign out
          </Button>

          <Button
            variant="danger"
            onClick={wipe.open}
            className="w-full sm:w-auto"
          >
            Delete all data
          </Button>
        </div>
      </SectionCard>

      <ConfirmDialog
        isOpen={wipe.isOpen}
        title="Delete everything?"
        message="All users, expenses, budgets and settings stored in this browser will be permanently removed. Download a backup first if you might need it."
        confirmLabel="Delete Everything"
        destructive
        onConfirm={handleWipeData}
        onCancel={wipe.close}
      />

      <ConfirmDialog
        isOpen={pendingImport.length > 0}
        title="Add these expenses?"
        message={`${pendingImport.length} expenses were found in that CSV and will be added to your account. Existing expenses are not changed.`}
        confirmLabel={`Add ${pendingImport.length}`}
        onConfirm={confirmCsvImport}
        onCancel={() => setPendingImport([])}
      />

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-2 text-center">
        <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        Passwords are hashed before saving, but this is a local-only app
        — not real authentication.
      </p>
    </div>
  );
};

export default Settings;