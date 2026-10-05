import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { X, Scale, Flame, ArrowRight, Trash2 } from 'lucide-react';

export const DishComparisonModal: React.FC = () => {
  const {
    isCompareModalOpen,
    setIsCompareModalOpen,
    comparedDishes,
    removeFromCompare,
    clearCompare,
    language,
    t,
    openDishDetail,
  } = useRestaurant();

  if (!isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                {t.comparisonTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.comparisonSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {comparedDishes.length > 0 && (
              <button
                onClick={clearCompare}
                className="p-2 text-stone-400 hover:text-red-400 transition"
                title={t.clearCompare}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto">
          {comparedDishes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Scale className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-sm text-stone-300 mb-2">
                {t.emptyCompare}
              </p>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
              >
                {t.backToMenu}
              </button>
            </div>
          ) : (
            <div className="min-w-[480px]">
              {/* Dishes Top Row */}
              <div
                className="grid gap-3 mb-6"
                style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
              >
                <div className="flex items-end pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {t.metricBestFor}
                  </span>
                </div>

                {comparedDishes.map((dish) => (
                  <div key={dish.id} className="relative bg-stone-900 rounded-2xl p-3 border border-stone-800">
                    <button
                      onClick={() => removeFromCompare(dish.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-stone-400 hover:text-white transition z-10"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={dish.image}
                      alt={dish.name[language]}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                    <h4 className="text-sm font-bold text-white line-clamp-1 font-display">
                      {dish.name[language]}
                    </h4>
                    <span className="text-sm font-bold font-mono text-amber-400 block mt-1">
                      {dish.price} {t.currency}
                    </span>
                    <button
                      onClick={() => {
                        setIsCompareModalOpen(false);
                        openDishDetail(dish);
                      }}
                      className="w-full mt-2.5 py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <span>{t.selectThisDish}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              <div className="space-y-2.5 text-xs">
                {/* Metric: Price */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-stone-900/50 border border-stone-800/60 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-stone-400">{t.metricPrice}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="font-mono font-bold text-amber-300">
                      {d.price} {t.currency}
                    </span>
                  ))}
                </div>

                {/* Metric: Spice Heat */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-stone-900/30 border border-stone-800/40 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-stone-400">{t.metricSpice}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="flex items-center gap-1 font-medium text-stone-200">
                      <Flame className={`w-3.5 h-3.5 ${d.spiceLevel === 'hot' ? 'text-red-500' : 'text-amber-500'}`} />
                      <span>{d.comparison.spiceLevel}</span>
                    </span>
                  ))}
                </div>

                {/* Metric: Style */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-stone-900/50 border border-stone-800/60 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-stone-400">{t.metricStyle}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="text-stone-300">
                      {d.comparison.style[language]}
                    </span>
                  ))}
                </div>

                {/* Metric: Protein Type */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-stone-900/30 border border-stone-800/40 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-stone-400">{t.metricProtein}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="text-amber-200/90 font-medium">
                      {d.comparison.proteinType[language]} ({d.nutrition.protein}g)
                    </span>
                  ))}
                </div>

                {/* Metric: Calories */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-stone-900/50 border border-stone-800/60 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-stone-400">{t.metricCalories}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="font-mono text-stone-200">
                      {d.nutrition.calories} kcal
                    </span>
                  ))}
                </div>

                {/* Metric: Best For */}
                <div
                  className="grid gap-3 py-2.5 px-3 rounded-xl bg-amber-950/20 border border-amber-600/30 items-center"
                  style={{ gridTemplateColumns: `140px repeat(${comparedDishes.length}, minmax(160px, 1fr))` }}
                >
                  <span className="font-semibold text-amber-300">{t.metricBestFor}</span>
                  {comparedDishes.map((d) => (
                    <span key={d.id} className="text-stone-300 text-[11px] leading-relaxed">
                      {d.comparison.bestFor[language]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
