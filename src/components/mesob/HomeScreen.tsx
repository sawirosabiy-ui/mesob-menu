import React from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Salad,
  Coffee,
  UtensilsCrossed,
  Cake,
  Sun,
  Layers,
  Star,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { CategoryId } from '../../types/mesob';
import { MesobImage } from '../common/MesobImage';

export const HomeScreen: React.FC = () => {
  const {
    config,
    setRoute,
    selectCategory,
    selectDish,
    setIsSmartMenuOpen,
    formatPrice,
    t,
    getLocalizedCategoryName,
    getLocalizedDishName,
    getLocalizedDishTagline,
    tableNumber,
    theme,
  } = useMesob();

  // Find Today's Special: Doro Wot or first signature dish
  const specialDish =
    config.dishes.find((d) => d.id === 'doro-wot' || d.isSignature) || config.dishes[0];

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning', 'Good morning');
    if (hour < 17) return t('goodAfternoon', 'Good afternoon');
    return t('goodEvening', 'Good evening');
  };

  // Helper for category icon with Earth & Light styling
  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'traditional':
        return <Flame className="w-5 h-5 text-terracotta-400" />;
      case 'meat':
        return <UtensilsCrossed className="w-5 h-5 text-terracotta-500" />;
      case 'drinks':
        return <Coffee className="w-5 h-5 text-gold-400" />;
      case 'desserts':
        return <Cake className="w-5 h-5 text-gold-300" />;
      case 'vegetarian':
        return <Salad className="w-5 h-5 text-olive-400" />;
      case 'breakfast':
        return <Sun className="w-5 h-5 text-gold-400" />;
      case 'sides':
        return <Layers className="w-5 h-5 text-stone-300" />;
      case 'specials':
        return <Star className="w-5 h-5 text-gold-300" />;
      default:
        return <Flame className="w-5 h-5 text-gold-400" />;
    }
  };

  return (
    <div className="min-h-screen text-stone-100 pb-28 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Hospitality Hero Welcome Banner */}
      <section className="pt-2 pb-5 text-center relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-espresso-900/60 border border-gold-500/20 text-[11px] text-gold-300 font-medium tracking-wider uppercase mb-3 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{config.branding.name}</span>
          <span className="text-stone-500">•</span>
          <span>{t('table', 'Table')} {tableNumber}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-stone-100 tracking-wide font-normal leading-tight">
          {getGreeting()},
          <br />
          <span className="italic font-display font-light text-gold-300">
            Welcome to {config.branding.name}
          </span>
        </h1>
        <p className="text-xs text-stone-400 mt-2 font-light tracking-wide max-w-xs mx-auto leading-relaxed">
          {config.branding.tagline || 'An elevated Ethiopian dining experience at your table. Pure teff injera, slow-cooked stews & Sidama single-origin buna.'}
        </p>

        {/* Primary CTA: Explore Menu Button */}
        <div className="mt-4">
          <button
            onClick={() => setRoute('menu')}
            className="w-full py-3.5 px-6 rounded-2xl gold-gradient-btn text-charcoal-950 text-sm font-bold tracking-wide shadow-lg shadow-black/40 flex items-center justify-center gap-2 group transition-all transform active:scale-[0.98]"
          >
            <span>{t('exploreMenu', 'Explore Menu')}</span>
            <ArrowRight className="w-4 h-4 text-charcoal-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* 8-Category Visual Grid */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="font-display text-base tracking-wider uppercase text-stone-200 font-semibold">
            {t('exploreCategories', 'Categories')}
          </h2>
          <button
            onClick={() => setRoute('menu')}
            className="text-xs text-gold-400 hover:text-gold-300 font-medium flex items-center gap-0.5"
          >
            <span>{t('all', 'All')}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {config.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                selectCategory(cat.id);
                setRoute('category');
              }}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border border-stone-800/80 bg-charcoal-850/70 hover:border-gold-500/40 hover:bg-charcoal-800 active:scale-95 transition-all group"
            >
              <div className="w-10 h-10 rounded-full border border-stone-800 bg-charcoal-900 flex items-center justify-center mb-1.5 group-hover:border-gold-500/50 group-hover:scale-105 transition-all shadow-inner">
                {getCategoryIcon(cat.id)}
              </div>
              <span className="text-[11px] font-medium text-stone-300 group-hover:text-gold-200 text-center tracking-tight leading-tight line-clamp-1">
                {getLocalizedCategoryName(cat)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Dietary Quick Fast-Tracks (Fasting/Vegan, Sizzling Meats, Buna Ceremony) */}
      <section className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              selectCategory('vegetarian');
              setRoute('category');
            }}
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-olive-700/20 border border-olive-500/30 text-olive-300 hover:border-olive-400 text-xs font-medium transition-all"
          >
            <Salad className="w-4 h-4 text-olive-400" />
            <span>Fasting / Yetsom (Vegan)</span>
          </button>

          <button
            onClick={() => {
              selectCategory('meat');
              setRoute('category');
            }}
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-terracotta-800/20 border border-terracotta-500/30 text-terracotta-300 hover:border-terracotta-400 text-xs font-medium transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 text-terracotta-400" />
            <span>Sizzling &amp; Grilled Meats</span>
          </button>

          <button
            onClick={() => {
              selectCategory('drinks');
              setRoute('category');
            }}
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-900/20 border border-gold-500/30 text-gold-300 hover:border-gold-400 text-xs font-medium transition-all"
          >
            <Coffee className="w-4 h-4 text-gold-400" />
            <span>Sidama Buna &amp; Tej</span>
          </button>
        </div>
      </section>

      {/* Today's Special Card */}
      {specialDish && (
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
              <h2 className="font-display text-lg tracking-wider uppercase text-gold-200 font-semibold">
                {t('todaysSpecial', "Today's Special")}
              </h2>
            </div>
            <button
              onClick={() => setRoute('menu')}
              className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-medium"
            >
              <span>{t('viewFullMenu', 'View Full Menu')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Special Dish Feature Card */}
          <div
            onClick={() => selectDish(specialDish)}
            className="group relative rounded-3xl overflow-hidden border border-stone-800/90 bg-charcoal-850 cursor-pointer shadow-xl hover:border-gold-500/40 transition-all"
          >
            {/* Card Hero Image */}
            <div className="h-52 w-full overflow-hidden relative">
              <MesobImage
                src={specialDish.image}
                alt={specialDish.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                fallbackText={getLocalizedDishName(specialDish)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent pointer-events-none" />

              {/* Signature Tag */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-charcoal-950/85 backdrop-blur-md border border-gold-500/40 text-[10px] uppercase font-bold tracking-wider text-gold-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>Chef's Signature</span>
                </span>
              </div>

              {/* Price Pill */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full bg-charcoal-950/85 backdrop-blur-md border border-stone-700 text-xs font-semibold text-gold-300">
                  {formatPrice(specialDish.price).primary}
                </span>
              </div>
            </div>

            {/* Dish Information */}
            <div className="p-4 pt-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-medium text-stone-100 group-hover:text-gold-200 transition-colors">
                    {getLocalizedDishName(specialDish)}
                  </h3>
                  {specialDish.amharicName && (
                    <span className="text-xs text-gold-400/80 font-serif">
                      {specialDish.amharicName}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-400 line-clamp-2 mt-1.5 font-light leading-relaxed">
                {specialDish.description}
              </p>

              {/* Verified Teaser & Pairing Footer */}
              <div className="mt-3.5 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <span className="text-gold-400 font-medium">Pairing:</span>
                  <span>Honey Wine (Tej)</span>
                </div>
                <span className="text-gold-400 text-xs font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subtle ✦ Ask Dining Concierge Banner (Non-dominant & contextual) */}
      <section className="mb-6">
        <div
          onClick={() => setIsSmartMenuOpen(true)}
          className="p-4 rounded-2xl border border-gold-500/30 bg-gradient-to-r from-charcoal-900 via-espresso-950/50 to-charcoal-900 flex items-center justify-between cursor-pointer hover:border-gold-500/60 active:scale-98 transition-all shadow-lg shadow-black/30 group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-300 flex items-center justify-center text-charcoal-950 shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-charcoal-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gold-200 tracking-wide">
                  ✦ Ask Dining Concierge
                </span>
                <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Optional
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 truncate font-light">
                Ask about what to order, budget, mild dishes, or group platters →
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gold-400 shrink-0 ml-2" />
        </div>
      </section>

      {/* Curated Recommendations Showcase */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-display text-base tracking-wider uppercase text-stone-200 font-semibold">
            {t('curatedExperience', 'Curated Classics')}
          </h3>
          <button
            onClick={() => setRoute('menu')}
            className="text-xs text-gold-400 hover:text-gold-300 font-medium"
          >
            {t('viewAll', 'View all')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {config.dishes
            .filter((d) => d.id === 'tibs' || d.id === 'royal-kitfo')
            .map((dish) => (
              <div
                key={dish.id}
                onClick={() => selectDish(dish)}
                className="rounded-2xl border border-stone-800 bg-charcoal-850/70 p-3 cursor-pointer hover:border-gold-500/40 transition-all group"
              >
                <div className="h-28 w-full rounded-xl overflow-hidden mb-2 relative">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-charcoal-950/80 backdrop-blur-sm text-[10px] font-semibold text-gold-300">
                    {formatPrice(dish.price).primary}
                  </div>
                </div>
                <h4 className="font-display text-sm font-medium text-stone-200 group-hover:text-gold-200 line-clamp-1">
                  {getLocalizedDishName(dish)}
                </h4>
                <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5 font-serif">
                  {dish.amharicName}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
