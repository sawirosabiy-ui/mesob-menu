import React from 'react';
import { Dish } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { Sparkles, ArrowRight, Scale, Check, Flame } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const {
    openDishDetail,
    language,
    t,
    comparisonIds,
    toggleCompare,
  } = useRestaurant();

  const isCompared = comparisonIds.includes(dish.id);

  return (
    <div
      onClick={() => openDishDetail(dish)}
      className={`group relative rounded-2xl overflow-hidden luxury-card transition-all duration-300 hover:shadow-xl hover:shadow-black/60 cursor-pointer flex flex-col justify-between ${
        !dish.isAvailable ? 'opacity-65 grayscale' : ''
      }`}
    >
      {/* Top Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-stone-900">
        <img
          src={dish.image}
          alt={dish.name[language]}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center z-10">
          {dish.popularity === 'signature' && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/90 text-stone-950 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{t.chefSignature}</span>
            </span>
          )}
          {dish.spiceLevel === 'hot' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-600/80 text-white backdrop-blur-sm">
              <Flame className="w-2.5 h-2.5" />
              <span>{t.spicy}</span>
            </span>
          )}
          {!dish.isAvailable && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-600">
              {t.soldOut}
            </span>
          )}
        </div>

        {/* Quick Compare Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(dish.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
              isCompared
                ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-700/60'
            }`}
            title={isCompared ? t.inCompare : t.addToCompare}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Price Tag Floating over bottom right of image */}
        <div className="absolute bottom-2.5 right-3 bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-stone-700/60">
          <span className="text-sm font-bold font-mono text-amber-400">
            {dish.price} <span className="text-[10px] font-sans font-normal text-stone-300">{t.currency}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-bold font-display text-stone-100 group-hover:text-amber-300 transition leading-snug">
            {dish.name[language]}
          </h3>

          <p className="text-xs text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {dish.description[language]}
          </p>

          {/* Quick Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {dish.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-800 text-[10px] text-stone-300 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="pt-3.5 mt-3.5 border-t border-stone-800/80 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-medium">
            {dish.nutrition.calories} kcal • {dish.comparison.style[language]}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
            <span>{t.viewDish}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
