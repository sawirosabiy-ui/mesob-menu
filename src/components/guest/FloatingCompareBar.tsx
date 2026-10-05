import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Scale, ArrowRight, X } from 'lucide-react';

export const FloatingCompareBar: React.FC = () => {
  const {
    comparisonIds,
    comparedDishes,
    clearCompare,
    setIsCompareModalOpen,
    language,
    t,
  } = useRestaurant();

  if (comparisonIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 animate-slide-up">
      <div className="bg-stone-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">
                {comparisonIds.length} {t.compareBarTitle}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {comparedDishes.map((d) => (
                <span
                  key={d.id}
                  className="text-[10px] text-amber-300 bg-stone-800/80 px-1.5 py-0.5 rounded truncate max-w-[100px]"
                >
                  {d.name[language]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-1.5 text-stone-400 hover:text-stone-200"
            title={t.clearCompare}
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <span>{t.compareNow}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
