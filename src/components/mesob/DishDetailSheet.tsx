import React, { useState } from 'react';
import { Dish } from '../../types/mesob';
import { useMesob } from '../../context/MesobContext';
import {
  X,
  Sparkles,
  Plus,
  Minus,
  Check,
  Flame,
  ArrowRight,
  ShieldCheck,
  Wine,
  MessageCircle,
} from 'lucide-react';
import { MesobImage } from '../common/MesobImage';
import { DishConversationModal } from './DishConversationModal';
import { triggerAddToCartAnimation } from '../common/FlyToCartOverlay';

interface DishDetailSheetProps {
  dish: Dish | null;
  onClose: () => void;
}

export const DishDetailSheet: React.FC<DishDetailSheetProps> = ({ dish, onClose }) => {
  const {
    addToCart,
    openPairings,
    formatPrice,
    t,
    getLocalizedDishName,
    getLocalizedDishDescription,
  } = useMesob();

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isDishChatOpen, setIsDishChatOpen] = useState(false);

  if (!dish) return null;

  const displayName = getLocalizedDishName(dish);
  const displayDescription = getLocalizedDishDescription(dish);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Launch fly-to-cart particle
    triggerAddToCartAnimation(e.currentTarget, {
      image: dish.image,
      name: displayName,
    });
    addToCart(dish, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 650);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in select-none"
        onClick={onClose}
      >
        <div 
          className="bg-obsidian-950 border border-stone-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Hero Image matching reference */}
          <div className="relative h-60 w-full shrink-0 bg-obsidian-900 overflow-hidden">
            <MesobImage
              src={dish.image}
              alt={displayName}
              className="w-full h-full object-cover"
              fallbackText={displayName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/30 to-black/50 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-obsidian-950/80 hover:bg-obsidian-900 text-stone-300 backdrop-blur-md border border-stone-800 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges on Hero Image */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              {dish.isSignature && (
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-semibold uppercase tracking-wider">
                  Signature
                </span>
              )}
              {(dish.spiceLevel === 'spicy' || dish.spiceLevel === 'extra-spicy') && (
                <span className="px-2.5 py-0.5 rounded-full bg-berbere-500/20 border border-berbere-500/40 text-berbere-300 text-[10px] font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-berbere-400" />
                  <span>Spicy</span>
                </span>
              )}
              {dish.isFasting && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
                  Fasting (Vegan)
                </span>
              )}
            </div>
          </div>

          {/* Sheet Body Container: Warm Cream/White Readability Card */}
          <div className="bg-[#FAF7F2] text-stone-900 p-5 overflow-y-auto space-y-4 rounded-b-none sm:rounded-b-3xl">
            {/* Header Title & Price */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900 leading-tight">
                  {displayName}
                </h2>
                {dish.amharicName && (
                  <span className="text-xs text-amber-800 font-serif font-medium block mt-0.5">
                    {dish.amharicName}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-display text-2xl font-bold text-amber-900">
                  {formatPrice(dish.price).primary}
                </span>
                {formatPrice(dish.price).isConverted && (
                  <span className="text-[11px] text-stone-600 font-sans block mt-0.5">
                    ({dish.price} ETB)
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-700 leading-relaxed font-normal">
              {displayDescription}
            </p>

            {/* Verified Information Badge */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-stone-200/90 text-[11px] text-stone-700 shadow-xs">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Restaurant Verified Recipe</span>
              </span>
              <span className="text-[10px] text-amber-900 font-mono font-bold">
                {dish.isFasting ? 'Yetsom Compliant' : 'Traditional Stew'}
              </span>
            </div>

            {/* Nutrition Stat Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-stone-600 uppercase tracking-wider font-semibold px-0.5">
                <span>Nutritional Profile</span>
                <span className="text-stone-500 font-mono font-medium">Authentic Ethiopian Recipe</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center py-1">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <span className="block text-sm font-bold font-mono text-stone-900">
                    {dish.nutrition?.calories || 420}
                  </span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wide font-medium">
                    Calories
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <span className="block text-sm font-bold font-mono text-amber-800">
                    {dish.nutrition?.proteinGrams || 28}g
                  </span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wide font-medium">
                    Protein
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <span className="block text-sm font-bold font-mono text-stone-800">
                    {dish.nutrition?.fatGrams || 18}g
                  </span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wide font-medium">
                    Fat
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <span className="block text-sm font-bold font-mono text-stone-800">
                    {dish.nutrition?.carbsGrams || 32}g
                  </span>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wide font-medium">
                    Carbs
                  </span>
                </div>
              </div>
            </div>

            {/* Section: What to expect */}
            {dish.explanation?.whatToExpect && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900 block">
                  {t('whatToExpect')}
                </span>
                <p className="text-xs text-stone-800 italic font-serif leading-relaxed">
                  "{dish.explanation.whatToExpect}"
                </p>
              </div>
            )}

            {/* Section: What's inside (Ingredients as pure readable structured text list) */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-700 block">
                {t('ingredients')} • Structured Ingredients
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(dish.ingredients?.map((i: { name: string }) => i.name) ||
                  dish.explanation?.keyIngredients ||
                  ['Berbere', 'Pure Teff Injera', 'Garlic', 'Ginger', 'Cardamom']
                ).map((ing: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300/80 text-xs text-stone-800 font-medium shadow-xs"
                  >
                    • {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Scoped Dish Conversation Trigger: "Ask about this dish" */}
            <div 
              onClick={() => setIsDishChatOpen(true)}
              className="p-3.5 rounded-2xl border border-amber-300 bg-white hover:bg-amber-50/60 cursor-pointer flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Ask about {displayName} →
                  </span>
                  <span className="text-[10px] text-stone-600">
                    Ask about spices, teff injera, substitutions &amp; pairings
                  </span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>

            {/* Perfect Pairings CTA Card */}
            <div 
              onClick={() => {
                onClose();
                openPairings(dish.id);
              }}
              className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 bg-white cursor-pointer flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-amber-800">
                  <Wine className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-900 block">
                    Sommelier Pairings
                  </span>
                  <span className="text-[10px] text-stone-600">
                    See matching wines, tej, buna &amp; side dishes
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-500" />
            </div>
          </div>

        {/* Bottom Sticky Action: Quantity selector & Add to Order Button matching reference */}
        <div className="p-4 border-t border-stone-800 bg-obsidian-950 flex items-center gap-3">
          {/* Quantity Selector [- 1 +] */}
          <div className="flex items-center border border-stone-800 bg-obsidian-900 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-mono font-semibold text-sm text-stone-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary CTA: "Add to Order • [Price] ETB" */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              addedNotice
                ? 'bg-emerald-500 text-obsidian-950'
                : 'bg-gold-500 hover:bg-gold-400 text-obsidian-950 shadow-lg shadow-gold-500/20 active:scale-98'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Order</span>
              </>
            ) : (
              <>
                <span>{t('addToOrder')} •</span>
                <span className="font-mono text-xs sm:text-sm">{formatPrice(dish.price * quantity).primary}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Dedicated Scoped Dish Conversation Context */}
    <DishConversationModal
      dish={dish}
      isOpen={isDishChatOpen}
      onClose={() => setIsDishChatOpen(false)}
    />
  </>
  );
};