import React from 'react';
import { Dish } from '../../types/mesob';
import { useMesob } from '../../context/MesobContext';
import {
  X,
  Sparkles,
  Flame,
  Info,
  BookOpen,
  Heart,
  CheckCircle2,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface AIFoodGuideSheetProps {
  dish: Dish | null;
  onClose: () => void;
}

export const AIFoodGuideSheet: React.FC<AIFoodGuideSheetProps> = ({ dish, onClose }) => {
  const { addToCart, openDishDetail, formatPrice, t, getLocalizedDishName } = useMesob();

  if (!dish) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-stone-950 border border-amber-900/30 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        {/* Header with AI Brand Indicator */}
        <div className="p-4 sm:p-5 border-b border-stone-800/80 bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {t('aiGuideTitle', 'Structured AI Culinary Guide')}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Instant
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-white leading-tight">
                {getLocalizedDishName(dish)}
              </h3>
              {dish.names && dish.name !== getLocalizedDishName(dish) && (
                <span className="text-xs text-stone-400 block font-normal">{dish.name}</span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-300 transition border border-stone-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Structured Body (PRD Section 6, 7, 8) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* SECTION 1: WHAT IS IT? */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('whatIsIt', 'What is it?')}</span>
            </div>
            <p className="text-stone-200 text-sm leading-relaxed">
              {dish.explanation?.whatIsIt || dish.description}
            </p>
          </div>

          {/* SECTION 2: WHAT TO EXPECT (Concise sensory summary) */}
          {dish.explanation?.whatToExpect && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-200 font-semibold text-xs uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('whatToExpect', 'What to expect')}</span>
              </div>
              <p className="text-amber-100/90 text-sm leading-relaxed font-serif italic">
                "{dish.explanation.whatToExpect}"
              </p>
            </div>
          )}

          {/* SECTION 3: TASTE PROFILE (Visual badge chips) */}
          {dish.explanation?.tasteProfile && dish.explanation.tasteProfile.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-300 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('tasteProfile', 'Taste Profile')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dish.explanation.tasteProfile.map((taste, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-stone-950 border border-amber-500/30 text-amber-300 font-medium text-xs shadow-inner"
                  >
                    {taste}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: KEY INGREDIENTS */}
          {dish.explanation?.keyIngredients && dish.explanation.keyIngredients.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2 text-stone-300 font-semibold text-xs uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('keyIngredients', 'Key Ingredients')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dish.explanation.keyIngredients.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300 text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: CULTURAL NOTE */}
          {dish.explanation?.culturalNote && (
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('culturalNote', 'Cultural Note')}</span>
              </div>
              <p className="text-stone-300 text-xs leading-relaxed">
                {dish.explanation.culturalNote}
              </p>
            </div>
          )}

          {/* SECTION 6: GOOD FOR */}
          {dish.explanation?.goodFor && dish.explanation.goodFor.length > 0 && (
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('goodFor', 'Good For')}</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-300">
                {dish.explanation.goodFor.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* FOOD SAFETY ADVISORY (Special notice for dishes like T'ire Siga) */}
          {dish.allergens?.foodSafetyNotice && (
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-start gap-2.5 text-[11px] text-stone-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {dish.allergens.foodSafetyNotice}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              openDishDetail(dish);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700/80 text-xs font-semibold text-center transition"
          >
            {t('exploreDish', 'View Full Dish Sheet')}
          </button>
          <button
            onClick={() => {
              addToCart(dish, 1);
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-lg transition"
          >
            {t('addToOrder', 'Add to Order')} • {formatPrice(dish.price).primary}
          </button>
        </div>
      </div>
    </div>
  );
};
