import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Sparkles,
  Scale,
  Check,
  AlertTriangle,
  Info,
  Flame,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  Wine,
  Activity,
} from 'lucide-react';

export const DishDetailModal: React.FC = () => {
  const {
    selectedDish,
    closeDishDetail,
    language,
    t,
    comparisonIds,
    toggleCompare,
    trackEvent,
    openDishDetail,
    dishes,
  } = useRestaurant();

  const [isExplainOpen, setIsExplainOpen] = useState(true);

  if (!selectedDish) return null;

  const isCompared = comparisonIds.includes(selectedDish.id);

  const handleToggleExplain = () => {
    const nextState = !isExplainOpen;
    setIsExplainOpen(nextState);
    if (nextState) {
      trackEvent('explain_open', { dishId: selectedDish.id, dishName: selectedDish.name.en });
    }
  };

  const handlePairingClick = (pairingName: string, pairingDishId?: string) => {
    trackEvent('pairing_click', { dishId: selectedDish.id, filterName: pairingName });
    if (pairingDishId) {
      const pairedDish = dishes.find((d) => d.id === pairingDishId);
      if (pairedDish) {
        openDishDetail(pairedDish);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-stone-950 border border-stone-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Sticky Modal Top Bar & Image */}
        <div className="relative h-64 sm:h-72 w-full shrink-0 bg-stone-900">
          <img
            src={selectedDish.image}
            alt={selectedDish.name[language]}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/60" />

          {/* Close Button */}
          <button
            onClick={closeDishDetail}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700/60 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Compare Button */}
          <button
            onClick={() => toggleCompare(selectedDish.id)}
            className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition ${
              isCompared
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : 'bg-stone-900/80 text-stone-200 border border-stone-700/60 hover:bg-stone-800'
            }`}
          >
            {isCompared ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
            <span>{isCompared ? t.inCompare : t.addToCompare}</span>
          </button>

          {/* Price & Name overlay */}
          <div className="absolute bottom-4 inset-x-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/90 text-stone-950">
                {selectedDish.comparison.style[language]}
              </span>
              {selectedDish.spiceLevel === 'hot' && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-600/90 text-white">
                  <Flame className="w-3 h-3" />
                  <span>{t.spicy}</span>
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-2xl font-bold font-display text-white">
                {selectedDish.name[language]}
              </h2>
              <span className="text-xl font-bold font-mono text-amber-400 shrink-0">
                {selectedDish.price} <span className="text-xs font-sans text-stone-300">{t.currency}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-200 text-sm">
          {/* Main Description */}
          <p className="text-stone-300 text-sm leading-relaxed">
            {selectedDish.description[language]}
          </p>

          {/* SECTION: EXPLAIN THIS DISH (PRD Section 8 & 9) */}
          <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-amber-950/20 border border-amber-500/30 overflow-hidden">
            <button
              onClick={handleToggleExplain}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-stone-800/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-200">
                    {t.explainThisDish}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {t.aiExplainSubtitle}
                  </p>
                </div>
              </div>
              <div className="text-stone-400">
                {isExplainOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isExplainOpen && (
              <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-stone-800/60 text-xs">
                {/* What is it? */}
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    {t.whatIsIt}
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {selectedDish.explanation.whatIsIt[language]}
                  </p>
                </div>

                {/* What does it taste like? */}
                <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/60">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    {t.whatDoesItTasteLike}
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {selectedDish.explanation.whatDoesItTasteLike[language]}
                  </p>
                </div>

                {/* What should I expect? (PRD Section 9 - Two sentences max) */}
                <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-600/30">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                    {t.whatShouldIExpect}
                  </span>
                  <p className="text-amber-100/90 leading-relaxed italic font-serif text-sm">
                    "{selectedDish.explanation.whatShouldIExpect[language]}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: INGREDIENTS (PRD Section 10) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-stone-400" />
              <span>{t.ingredientsTitle}</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {((selectedDish.ingredients as Record<string, string[]>)[language] || selectedDish.ingredients.en || []).map((ingredient, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION: ALLERGEN INFORMATION & MANDATORY NOTICE (PRD Section 11) */}
          <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2.5">
            <div className="flex items-center gap-2 text-stone-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {t.allergensTitle}
              </h4>
            </div>

            <div className="text-xs space-y-1">
              <div>
                <span className="font-semibold text-stone-400">{t.containsLabel}: </span>
                <span className="text-stone-200">
                  {selectedDish.allergens.contains.length > 0
                    ? selectedDish.allergens.contains.join(', ')
                    : 'None reported'}
                </span>
              </div>
              {selectedDish.allergens.potential.length > 0 && (
                <div>
                  <span className="font-semibold text-stone-400">{t.potentialLabel}: </span>
                  <span className="text-stone-300">
                    {selectedDish.allergens.potential.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* MANDATORY SUBTLE LEGAL DISCLAIMER */}
            <div className="pt-2 border-t border-stone-800/80 flex items-start gap-2 text-[11px] text-stone-400 leading-normal">
              <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
              <p>
                {selectedDish.allergens.disclaimer
                  ? selectedDish.allergens.disclaimer[language]
                  : t.allergenDisclaimer}
              </p>
            </div>
          </div>

          {/* SECTION: NUTRITION (PRD Section 12) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.nutritionTitle}</span>
              </h4>
              {selectedDish.nutrition.isEstimate && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 text-stone-400 border border-stone-800">
                  {t.nutritionEstimatedBadge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="block text-base font-bold font-mono text-stone-100">
                  {selectedDish.nutrition.calories}
                </span>
                <span className="text-[10px] text-stone-400 uppercase">{t.caloriesLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="block text-base font-bold font-mono text-amber-400">
                  {selectedDish.nutrition.protein}g
                </span>
                <span className="text-[10px] text-stone-400 uppercase">{t.proteinLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="block text-base font-bold font-mono text-stone-100">
                  {selectedDish.nutrition.carbs}g
                </span>
                <span className="text-[10px] text-stone-400 uppercase">{t.carbsLabel}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="block text-base font-bold font-mono text-stone-100">
                  {selectedDish.nutrition.fat}g
                </span>
                <span className="text-[10px] text-stone-400 uppercase">{t.fatLabel}</span>
              </div>
            </div>
          </div>

          {/* SECTION: PAIRINGS (PRD Section 15) */}
          {selectedDish.pairings && selectedDish.pairings.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Wine className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.pairingsTitle}</span>
              </h4>

              <div className="space-y-2">
                {selectedDish.pairings.map((pair) => (
                  <div
                    key={pair.id}
                    onClick={() => handlePairingClick(pair.name.en, pair.id)}
                    className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 transition cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={pair.image}
                      alt={pair.name[language]}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                          {pair.type === 'goesWellWith' ? t.goesWellWith : t.youMightLike}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-300">
                          {pair.price} {t.currency}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-stone-100 group-hover:text-amber-300 transition truncate">
                        {pair.name[language]}
                      </h5>
                      <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                        {pair.description[language]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky CTA */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center gap-3">
          <button
            onClick={() => toggleCompare(selectedDish.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              isCompared
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'bg-stone-900 text-stone-200 border border-stone-800 hover:bg-stone-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isCompared ? t.inCompare : t.addToCompare}</span>
          </button>
          <button
            onClick={closeDishDetail}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition"
          >
            {t.backToMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
