import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';
import { useAuth } from '../context/AuthContext';

export const DevSetupBanner: React.FC = () => {
  const { isDemoMode, enableDemoMode, disableDemoMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Only show prominent setup notice when placeholder keys exist OR when explicitly previewing Demo Mode
  if (isFirebaseConfigured && !isDemoMode) return null;

  return (
    <div className="bg-emerald-950 text-emerald-50 border-b border-emerald-900 text-xs">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Wrench className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <p className="truncate">
            {!isFirebaseConfigured
              ? 'Placeholder keys detected in src/firebase.ts — running in Demo Mode. Paste your Firebase keys anytime.'
              : 'Previewing in Demo Mode (sample Lucknow student data). Switch back to live Firebase Auth anytime.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isFirebaseConfigured && isDemoMode ? (
            <button
              onClick={disableDemoMode}
              className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Use Live Firebase
            </button>
          ) : !isDemoMode ? (
            <button
              onClick={enableDemoMode}
              className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              Demo Mode
            </button>
          ) : null}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
