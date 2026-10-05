import React from 'react';
import { useMesob } from '../../context/MesobContext';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useMesob();

  if (isOnline) return null;

  return (
    <div className="bg-amber-900/90 text-amber-200 border-b border-amber-700/60 px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-md animate-slide-down">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold block sm:inline">Offline Mode</span>
          <span className="text-[11px] text-amber-300 sm:ml-1.5">
            Viewing cached menu. Table-side ordering via "Show to Waiter" remains active.
          </span>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-2 py-1 rounded bg-amber-800/80 hover:bg-amber-700 text-[10px] font-medium text-amber-100 flex items-center gap-1 shrink-0 cursor-pointer"
        title="Check connection"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
};
