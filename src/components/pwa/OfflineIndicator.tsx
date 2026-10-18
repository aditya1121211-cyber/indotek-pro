import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 left-1/2 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-amber-500/40 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-amber-400 shadow-2xl backdrop-blur-md sm:bottom-6 sm:rounded-full"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>Mode Offline — Sebagian fitur mungkin tidak tersedia.</span>
      <button
        onClick={() => window.location.reload()}
        className="flex min-h-11 items-center gap-1 rounded px-2 text-white underline hover:text-amber-300"
      >
        <RefreshCw className="w-3 h-3" /> Coba Cek
      </button>
      <a
        href="/offline.html"
        className="flex min-h-11 items-center rounded px-2 text-white underline hover:text-amber-300"
      >
        Info offline
      </a>
    </div>
  );
};
