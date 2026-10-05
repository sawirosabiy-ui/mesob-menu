import React from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  X,
  Scale,
  Plus,
  Flame,
  Check,
  Sparkles,
} from 'lucide-react';

export const ComparisonSheet: React.FC = () => {
  const {
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    comparedDishes,
    removeFromComparison,
    addToCart,
    openDishDetail,
  } = useMesob();

  if (!isComparisonModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-950 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                Dish Comparison
              </h3>
              <p className="text-xs text-stone-400">
                Decision support to choose your meal with confidence
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsComparisonModalOpen(false)}
            className="p-2 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content (PRD Section 9: Flavor, Texture, Spice, Main ingredient, Experience) */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {comparedDishes.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-10 h-10 text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-400">
                Select dishes to compare side by side.
              </p>
            </div>
          ) : (
            <div className="space-y-6 min-w-[340px]">
              {/* Dish Visual Header Cards */}
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))`,
                }}
              >
                {comparedDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 relative flex flex-col justify-between"
                  >
                    {comparedDishes.length > 1 && (
                      <button
                        onClick={() => removeFromComparison(dish.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-stone-400 hover:text-white transition"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div>
                      <img
                        src={dish.image}
                        alt={dish.name}
                        onClick={() => {
                          setIsComparisonModalOpen(false);
                          openDishDetail(dish);
                        }}
                        className="w-full h-24 sm:h-28 object-cover rounded-xl mb-2.5 cursor-pointer hover:opacity-90 transition"
                      />
                      <h4
                        onClick={() => {
                          setIsComparisonModalOpen(false);
                          openDishDetail(dish);
                        }}
                        className="text-sm font-bold text-white font-display line-clamp-1 hover:text-amber-300 cursor-pointer"
                      >
                        {dish.name}
                      </h4>
                      <span className="text-sm font-mono font-bold text-amber-400 block mt-0.5">
                        {dish.price} ETB
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(dish, 1);
                        setIsComparisonModalOpen(false);
                      }}
                      className="mt-3 w-full py-1.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select Dish</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Comparison Metric Rows (PRD Section 9) */}
              <div className="space-y-2.5 text-xs">
                {/* 1. Flavor Profile */}
                <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Flavor Profile
                  </span>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))` }}
                  >
                    {comparedDishes.map((d) => (
                      <p key={d.id} className="text-stone-200 leading-relaxed">
                        {d.comparison?.flavor || d.description}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 2. Texture */}
                <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Texture
                  </span>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))` }}
                  >
                    {comparedDishes.map((d) => (
                      <p key={d.id} className="text-stone-300 leading-relaxed">
                        {d.comparison?.texture || (d.isFasting ? 'Velvety & Plant-based' : 'Savory & Tender')}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 3. Spice Intensity */}
                <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Spice Intensity
                  </span>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))` }}
                  >
                    {comparedDishes.map((d) => (
                      <div key={d.id} className="flex items-center gap-1.5 text-stone-200">
                        <Flame className="w-4 h-4 text-berbere-500 shrink-0" />
                        <span>{d.comparison?.spice || `Spice Level: ${d.spiceLevel}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Main Ingredient */}
                <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Main Ingredient
                  </span>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))` }}
                  >
                    {comparedDishes.map((d) => (
                      <p key={d.id} className="text-amber-300 font-medium">
                        {d.comparison?.mainIngredient || d.name}
                      </p>
                    ))}
                  </div>
                </div>

                {/* 5. Dining Experience */}
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    Dining Experience
                  </span>
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${comparedDishes.length}, minmax(0, 1fr))` }}
                  >
                    {comparedDishes.map((d) => (
                      <p key={d.id} className="text-stone-300 leading-relaxed italic">
                        "{d.comparison?.experience || d.tagline || d.description}"
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
