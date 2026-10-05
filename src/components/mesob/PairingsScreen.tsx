import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Plus,
  Check,
  Wine,
  Coffee,
  Utensils,
  Flame,
} from 'lucide-react';
import { Dish } from '../../types/mesob';

interface PairingsScreenProps {
  dishId?: string;
}

export const PairingsScreen: React.FC<PairingsScreenProps> = ({ dishId }) => {
  const {
    config,
    activePairingsDishId,
    navigateTo,
    addToCart,
    openDishDetail,
    t,
    getLocalizedDishName,
  } = useMesob();

  const currentDishId = dishId || activePairingsDishId || 'doro-wot';
  const dish = config.dishes.find((d) => d.id === currentDishId) || config.dishes[0];

  const [addedNotice, setAddedNotice] = useState(false);

  // Perfect pairings from dish data or fallback
  const pairings = dish.pairings && dish.pairings.length > 0
    ? dish.pairings
    : [
        {
          dishId: 'tej',
          name: 'Tej (Honey Wine)',
          category: 'Drinks',
          price: 180,
          image: '/images/dishes/Tej.jpg',
          reason: 'Wildflower honey sweetness balances the savory spice reduction.',
        },
        {
          dishId: 'ethiopian-coffee',
          name: 'Ethiopian Coffee',
          category: 'Drinks',
          price: 220,
          image: '/images/dishes/Buna.jpg',
          reason: 'Rich single-origin Sidama beans provide floral berry finish.',
        },
        {
          dishId: 'injera',
          name: 'Injera',
          category: 'Sides',
          price: 80,
          image: '/images/dishes/Injera.jpg',
          reason: 'Tangy sourdough teff flatbread serves as the essential eating vessel.',
        },
      ];

  const alsoPairsWithPills = ['Salad', 'Yebeg Alicha', 'Roasted Veggies', 'Ayib Cheese'];

  const handleAddDishAndPairings = () => {
    // Add primary dish
    addToCart(dish, 1);
    // Add top pairing if exists
    if (pairings[0]) {
      const topPairingDish = config.dishes.find((d) => d.id === pairings[0].dishId);
      if (topPairingDish) addToCart(topPairingDish, 1);
    }
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      navigateTo('/mesob/order');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 pt-4 px-4 sm:px-8 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-white">
            {t('comparePairings', 'Compare / Pairings')}
          </h1>
          <p className="text-[11px] text-stone-400">
            Harmonious culinary combinations curated for this dish
          </p>
        </div>
      </div>

      {/* Featured Dish Card */}
      <div
        onClick={() => openDishDetail(dish)}
        className="p-3.5 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-amber-500/30 hover:border-amber-400/60 transition cursor-pointer flex items-center justify-between group shadow-xl"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-16 h-16 rounded-2xl object-cover border border-amber-500/20 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-mono block">
              Featured Dish
            </span>
            <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-300 transition truncate">
              {getLocalizedDishName(dish)}
            </h3>
            <span className="text-sm font-mono font-bold text-amber-300">
              {dish.price} {t('currency', 'ETB')}
            </span>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition shrink-0" />
      </div>

      {/* Section: Perfect Pairings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-display font-bold text-white">
            {t('perfectPairings', 'Perfect Pairings')}
          </h2>
        </div>

        <div className="space-y-2.5">
          {pairings.map((p, idx) => {
            const pairDish = config.dishes.find((d) => d.id === p.dishId);
            return (
              <div
                key={idx}
                onClick={() => {
                  if (pairDish) openDishDetail(pairDish);
                }}
                className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-700/50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white font-display group-hover:text-amber-300 transition truncate">
                      {p.name}
                    </h4>
                    <span className="text-xs text-amber-400 font-mono font-bold block">
                      {p.price} {t('currency', 'ETB')}
                    </span>
                    <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                      {p.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pairDish) addToCart(pairDish, 1);
                    }}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600 text-stone-300 hover:text-stone-950 transition"
                    title="Add Pairing to Order"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Also pairs well with */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          {t('alsoPairsWell', 'Also pairs well with')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {alsoPairsWithPills.map((pill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-medium hover:border-amber-500/40 transition cursor-default"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Why This Pairing Works Card */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('whyPairing', 'Why this pairing works')}</span>
        </div>
        <p className="text-stone-300 leading-relaxed">
          Ethiopian dining balances bold chili warmth with cooling, fermented, and honeyed counterparts. Pairing {getLocalizedDishName(dish)} with honey wine and freshly roasted Sidama buna creates a complete ritual.
        </p>
      </div>

      {/* Bottom Sticky Action */}
      <div className="pt-2">
        <button
          onClick={handleAddDishAndPairings}
          className="w-full py-4 rounded-full gold-gradient-btn text-stone-950 font-bold text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
        >
          {addedNotice ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t('added', 'Added to Order!')}</span>
            </>
          ) : (
            <>
              <span>{t('addToOrder', 'Add to Order')} +</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
