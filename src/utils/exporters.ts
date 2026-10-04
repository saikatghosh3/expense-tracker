import type { Category, Expense } from '../types';
import { isCategory } from '../types';

/** Triggers a browser download for generated text content. */
export function downloadText(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ['Date', 'Description', 'Category', 'Merchant', 'Amount', 'Notes'];

  const rows = expenses.map((expense) =>
    [
      expense.date,
      expense.description,
      expense.category,
      expense.merchant ?? '',
      expense.amount.toFixed(2),
      expense.notes ?? '',
    ]
      .map((cell) => escapeCsvValue(String(cell)))
      .join(','),
  );

  return [header.join(','), ...rows].join('\r\n');
}

export function exportExpensesCsv(expenses: Expense[], filename: string): void {
  downloadText(filename, expensesToCsv(expenses), 'text/csv');
}

export interface CsvParseResult {
  expenses: Array<{
    description: string;
    amount: number;
    category: Category;
    date: string;
    merchant?: string;
    notes?: string;
  }>;
  errors: string[];
  skipped: number;
}

/** Minimal RFC-4180 parser: handles quoted fields and escaped quotes. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

export function parseExpensesCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const expenses: CsvParseResult['expenses'] = [];
  let skipped = 0;

  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    return { expenses, errors: ['The file needs a header row plus at least one expense row.'], skipped };
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const indexOf = (name: string) => header.findIndex((cell) => cell === name);

  const dateIndex = indexOf('date');
  const descriptionIndex = indexOf('description');
  const categoryIndex = indexOf('category');
  const amountIndex = indexOf('amount');
  const merchantIndex = indexOf('merchant');
  const notesIndex = indexOf('notes');

  if (dateIndex < 0 || descriptionIndex < 0 || amountIndex < 0) {
    return {
      expenses,
      errors: ['Required columns are Date, Description and Amount.'],
      skipped,
    };
  }

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const description = (cells[descriptionIndex] ?? '').trim();
    const amountRaw = (cells[amountIndex] ?? '').trim().replace(/[^0-9.-]/g, '');
    const amount = parseFloat(amountRaw);
    const date = (cells[dateIndex] ?? '').trim();
    const categoryRaw = categoryIndex >= 0 ? (cells[categoryIndex] ?? '').trim() : '';

    if (!description || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      skipped += 1;
      continue;
    }

    expenses.push({
      description,
      amount,
      category: isCategory(categoryRaw) ? categoryRaw : 'Other',
      date,
      merchant: merchantIndex >= 0 ? cells[merchantIndex]?.trim() || undefined : undefined,
      notes: notesIndex >= 0 ? cells[notesIndex]?.trim() || undefined : undefined,
    });
  }

  if (skipped > 0) {
    errors.push(`${skipped} row${skipped === 1 ? '' : 's'} were skipped because they were incomplete or invalid.`);
  }

  return { expenses, errors, skipped };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsText(file);
  });
}

/** Reports how much of the ~5MB localStorage budget is in use. */
export function getStorageUsage(): { usedBytes: number; totalBytes: number; percent: number } | null {
  try {
    const usedBytes = new Blob([localStorage.getItem('expense-tracker-data') ?? '']).size;
    // Most browsers allow roughly 5MB of localStorage per origin.
    const totalBytes = 5 * 1024 * 1024;
    return { usedBytes, totalBytes, percent: Math.min((usedBytes / totalBytes) * 100, 100) };
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const CSV_TEMPLATE = `Date,Description,Category,Merchant,Amount,Notes
${new Date().toISOString().slice(0, 10)},Grocery run,Food & Dining,Corner Market,54.20,Weekly shop
${new Date().toISOString().slice(0, 10)},Monthly transit,Bills & Utilities,,120.00,
`;
