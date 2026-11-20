import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'card' }> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          variant === 'card'
            ? 'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-4 py-3 text-sm font-medium text-white hover:bg-[#14532D] transition-colors cursor-pointer min-h-[44px]'
            : 'inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap shrink-0'
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        Install EcoBite App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'card'
              ? 'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer min-h-[44px]'
              : 'inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap shrink-0'
          }
        >
          <Share className="w-4 h-4 shrink-0" />
          Add to Home Screen
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900">Install EcoBite on iPhone</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-3 space-y-2.5 text-sm text-stone-600 list-decimal pl-5">
                <li>Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong> to launch EcoBite like a native app.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#166534] py-2.5 text-sm font-medium text-white hover:bg-[#14532D] transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
