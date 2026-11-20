import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
  isFirestorePermissionError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isFirestorePermissionError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    let message = error.message || 'Something went wrong.';
    let isPerm = false;
    try {
      const parsed = JSON.parse(message);
      if (parsed && parsed.operationType && parsed.error) {
        isPerm = String(parsed.error).toLowerCase().includes('permission');
        message = `${parsed.error} (Operation: ${parsed.operationType} on ${parsed.path || 'unknown'})`;
      }
    } catch {
      // plain string error
    }
    return {
      hasError: true,
      errorMessage: message,
      isFirestorePermissionError: isPerm,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900">Unable to complete request</h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              {this.state.isFirestorePermissionError
                ? 'Your account does not have permission for this Firestore action. Verify your email or switch to Demo Mode to preview safely.'
                : this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#14532D] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload EcoBite
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
