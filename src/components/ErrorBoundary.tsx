import { Component } from 'react';
import type { ReactNode } from 'react';
import { RefreshCw, Lock } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-5 max-w-sm w-full">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <Lock size={26} className="text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-slate-900 text-xl">Something went wrong</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              An unexpected error occurred. Your session history is safe — it's stored
              locally on this device.
            </p>
            {this.state.message && (
              <p className="text-xs text-slate-400 font-mono bg-slate-100 rounded-lg px-3 py-2 mt-3 text-left break-all">
                {this.state.message}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white
                       font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            <RefreshCw size={15} />
            Reload ScopeLock
          </button>
        </div>
      </div>
    );
  }
}
