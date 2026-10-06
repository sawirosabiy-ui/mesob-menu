import React, { useState } from 'react';
import { Dish } from '../../types/mesob';
import { useMesob } from '../../context/MesobContext';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';
import { MesobImage } from '../common/MesobImage';
import { triggerAddToCartAnimation } from '../common/FlyToCartOverlay';

interface DishCardProps {
  dish: Dish;
  layout?: 'horizontal' | 'compact' | 'featured' | 'carousel';
}

export const DishCard: React.FC<DishCardProps> = ({ dish, layout = 'horizontal' }) => {
  const {
    selectDish,
    addToCart,
    updateQuantity,
    removeFromCart,
    cart,
    t,
    formatPrice,
    getLocalizedDishName,
    isDishAvailable,
    dishAvailability,
  } = useMesob();

  const isAvailable = isDishAvailable(dish.id);
  const availabilityOverride = dishAvailability[dish.id];

  const [isJustAdded, setIsJustAdded] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const cartItem = cart.find((item) => item.dish.id === dish.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleCardClick = () => {
    selectDish(dish);
  };

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsCompressing(true);
    setIsJustAdded(true);

    triggerAddToCartAnimation(e.currentTarget, {
      image: dish.image,
      name: getLocalizedDishName(dish),
    });

    addToCart(dish, 1);

    setTimeout(() => setIsCompressing(false), 150);
    setTimeout(() => setIsJustAdded(false), 700);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
      window.dispatchEvent(new CustomEvent('mesob:cart-impact', { detail: { name: dish.name } }));
    } else {
      addToCart(dish, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(cartItem.id);
      } else {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      }
    }
  };

  const displayName = getLocalizedDishName(dish);
  const priceInfo = formatPrice(dish.price);

  const ingredientSubtitle = dish.ingredients 
    ? dish.ingredients.slice(0, 3).map((i: { name: string }) => i.name).join(' · ')
    : (dish.explanation?.keyIngredients?.slice(0, 3).join(' · ') || dish.tags?.slice(0, 2).join(' · ') || 'Authentic Ethiopian recipe');

  // Sideways Carousel Card Layout
  if (layout === 'carousel') {
    return (
      <div
        onClick={handleCardClick}
        className="group relative w-[215px] sm:w-[240px] shrink-0 snap-start rounded-2xl bg-charcoal-850/90 border border-stone-800/90 hover:border-gold-500/50 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-black/60 touch-manipulation select-none h-[280px]"
      >
        {/* Top Image & Badges */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-charcoal-950 border border-stone-800/80">
          <MesobImage
            src={dish.image}
            alt={displayName}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              !isAvailable ? 'opacity-60 grayscale-[30%]' : ''
            }`}
            fallbackText={displayName}
          />
          {!isAvailable ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider shadow-md">
              {availabilityOverride?.label || 'Sold Out'}
            </span>
          ) : dish.isSignature ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold-400 text-charcoal-950 font-bold text-[9px] uppercase tracking-wider shadow-md">
              Signature
            </span>
          ) : null}
          {(dish.spiceLevel === 'spicy' || dish.spiceLevel === 'extra-spicy') && (
            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-charcoal-950/80 backdrop-blur-sm border border-stone-700 flex items-center justify-center text-xs">
              🌶️
            </span>
          )}
        </div>

        {/* Dish Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-semibold text-stone-100 group-hover:text-gold-200 transition-colors truncate">
            {displayName}
          </h3>
          {dish.amharicName && (
            <p className="text-[11px] text-gold-400/80 font-serif leading-none mt-0.5 truncate">
              {dish.amharicName}
            </p>
          )}
          <p className="text-[11px] text-stone-400 line-clamp-2 mt-1.5 font-light leading-relaxed">
            {dish.tagline || ingredientSubtitle}
          </p>
        </div>

        {/* Bottom Price & Actions Row */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/70 flex items-center justify-between gap-2">
          <div>
            <span className="font-display font-bold text-sm text-gold-300 block">
              {priceInfo.primary}
            </span>
            {priceInfo.isConverted && priceInfo.secondary && (
              <span className="text-[10px] text-stone-400 font-sans block leading-none">
                ({priceInfo.secondary})
              </span>
            )}
          </div>

          {/* Add / Stepper Button */}
          <div onClick={(e) => e.stopPropagation()}>
            {!isAvailable ? (
              <span className="h-7 px-2.5 rounded-full bg-stone-900 border border-red-500/40 text-red-300 flex items-center text-[10px] font-bold uppercase tracking-wider">
                Sold Out
              </span>
            ) : isJustAdded ? (
              <div className="h-8 px-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 text-[11px] font-bold shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </div>
            ) : inCartQty > 0 ? (
              <div className="flex items-center gap-1 bg-stone-900/95 border border-amber-500/40 rounded-full p-0.5 shadow-md">
                <button
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-90 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-mono font-bold text-xs text-amber-300">
                  {inCartQty}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/30 active:scale-90 text-amber-300 flex items-center justify-center transition cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className={`h-8 px-3 rounded-full flex items-center gap-1 transition-all duration-200 border border-gold-500/40 bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-charcoal-950 active:scale-90 shadow-md cursor-pointer ${
                  isCompressing ? 'scale-90' : 'scale-100'
                }`}
                aria-label={`Add ${displayName} to cart`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Horizontal List Row Layout
  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl bg-charcoal-850/80 border border-stone-800/80 hover:border-gold-500/40 p-3 sm:p-3.5 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 sm:gap-3.5 shadow-md hover:shadow-black/50"
    >
      {/* Left: Rounded Square Dish Photo */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-stone-800/80 bg-charcoal-950">
        <MesobImage
          src={dish.image}
          alt={displayName}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !isAvailable ? 'opacity-60 grayscale-[30%]' : ''
          }`}
          fallbackText={displayName}
        />
        {!isAvailable ? (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider shadow">
            Sold Out
          </span>
        ) : dish.isSignature ? (
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-gold-400 rounded-bl-lg" />
        ) : null}
      </div>

      {/* Middle: Dish Name, Amharic name, Verified Ingredients, and Price */}
      <div className="flex-1 min-w-0 pr-0.5 sm:pr-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-display text-sm sm:text-base font-medium text-stone-100 group-hover:text-gold-200 transition-colors truncate">
            {displayName}
          </h3>
          {(dish.spiceLevel === 'spicy' || dish.spiceLevel === 'extra-spicy') && (
            <span className="text-[10px] text-terracotta-400 font-bold shrink-0" title="Spicy">
              🌶️
            </span>
          )}
        </div>

        {dish.amharicName && (
          <p className="text-[10px] sm:text-[11px] text-gold-400/80 font-serif leading-none mt-0.5 truncate">
            {dish.amharicName}
          </p>
        )}

        {/* Subtitle / verified ingredient teaser */}
        <p className="text-[10px] sm:text-[11px] text-stone-400 truncate mt-1 font-light">
          {ingredientSubtitle}
        </p>

        {/* Price & Explain CTA Row */}
        <div className="mt-1 sm:mt-1.5 flex flex-wrap items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-semibold text-xs sm:text-sm text-gold-300">
              {priceInfo.primary}
            </span>
            {priceInfo.isConverted && priceInfo.secondary && (
              <span className="text-[9px] sm:text-[10px] text-stone-400 font-sans">
                ({priceInfo.secondary})
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              selectDish(dish);
            }}
            className="text-[9px] sm:text-[10px] text-gold-400/90 hover:text-gold-200 border border-gold-500/25 hover:border-gold-500/50 bg-gold-500/5 hover:bg-gold-500/10 px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer truncate"
          >
            Explain →
          </button>
        </div>
      </div>

      {/* Right: Tactile Add to Cart / Quantity Stepper Control */}
      <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
        {!isAvailable ? (
          <span className="h-7 px-2.5 rounded-full bg-stone-900 border border-red-500/40 text-red-300 flex items-center text-[10px] font-bold uppercase tracking-wider">
            Sold Out
          </span>
        ) : isJustAdded ? (
          <div className="h-8 px-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 text-[11px] font-bold animate-in fade-in zoom-in-95 duration-150 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Added</span>
          </div>
        ) : inCartQty > 0 ? (
          <div className="flex items-center gap-1 bg-stone-900/90 border border-amber-500/40 rounded-full p-0.5 shadow-md">
            <button
              onClick={handleDecrement}
              className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-90 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-5 text-center font-mono font-bold text-xs text-amber-300">
              {inCartQty}
            </span>
            <button
              onClick={handleIncrement}
              className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/30 active:scale-90 text-amber-300 flex items-center justify-center transition cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className={`h-8 px-3 rounded-full flex items-center gap-1.5 transition-all duration-200 border border-gold-500/40 bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-charcoal-950 active:scale-90 shadow-md cursor-pointer ${
              isCompressing ? 'scale-90' : 'scale-100'
            }`}
            aria-label={`Add ${displayName} to cart`}
            title={`Add ${displayName}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold tracking-wide">Add</span>
          </button>
        )}
      </div>
    </div>
  );
};


