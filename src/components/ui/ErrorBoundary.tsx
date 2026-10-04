import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Changing this value resets the boundary, e.g. on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Prevents a single render-time throw from blanking the whole app.
 * Must be used as a class component — React provides no hook equivalent.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  override render(): React.ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 text-center">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            An unexpected error stopped this screen from rendering. Your saved data is safe.
          </p>

          <details className="text-left mb-4">
            <summary className="text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              Technical details
            </summary>
            <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
