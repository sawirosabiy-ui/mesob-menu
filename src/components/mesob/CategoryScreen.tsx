import React, { useState, useMemo, useRef } from 'react';
import { useMesob } from '../../context/MesobContext';
import { DishCard } from './DishCard';
import { Dish, CategoryId } from '../../types/mesob';
import {
  ArrowLeft,
  Sparkles,
  Search,
  X,
  SlidersHorizontal,
  ShoppingBag,
  ArrowRight,
  Salad,
  Flame,
  UtensilsCrossed,
  Coffee,
  Cake,
  Sun,
  Layers,
  Crown,
  ChevronLeft,
  ChevronRight,
  Grid,
} from 'lucide-react';

// Highly Responsive Sideways Food Slider Track with Arrow Gliders & Touch/Drag Support
const FoodSliderTrack: React.FC<{ dishes: Dish[] }> = ({ dishes }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(dishes.length > 1);

  const checkBounds = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -230 : 230;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkBounds, 300);
    }
  };

  return (
    <div className="relative group/foodtrack w-full">
      {/* Left Glide Control Button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount('left')}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-stone-900/95 border border-gold-500/40 text-gold-300 flex items-center justify-center shadow-xl hover:bg-stone-800 active:scale-90 transition backdrop-blur-md"
          aria-label="Previous dishes"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Sideways Scrollable Racks */}
      <div
        ref={scrollRef}
        onScroll={checkBounds}
        className="flex items-stretch gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain pb-3 pt-1 -mx-2 px-2"
      >
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} layout="carousel" />
        ))}
      </div>

      {/* Right Glide Control Button */}
      {canScrollRight && dishes.length > 1 && (
        <button
          onClick={() => scrollByAmount('right')}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-stone-900/95 border border-gold-500/40 text-gold-300 flex items-center justify-center shadow-xl hover:bg-stone-800 active:scale-90 transition backdrop-blur-md"
          aria-label="Next dishes"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const CategoryScreen: React.FC = () => {
  const {
    config,
    selectedCategory,
    selectCategory,
    setRoute,
    getLocalizedCategoryName,
    formatPrice,
    t,
    cart,
    cartTotal,
    cartItemCount,
    setIsSmartMenuOpen,
  } = useMesob();

  const currentCatId: string = selectedCategory || 'traditional';
  const isAllMode = currentCatId === 'all';
  
  const currentCategory =
    config.categories.find((c) => c.id === currentCatId) || config.categories[0];

  // Local search query for menu view
  const [searchQuery, setSearchQuery] = useState('');
  // Active subfilter chip
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');
  // View mode: 'slider' (sideways horizontal cards) vs 'list' (vertical)
  const [viewMode, setViewMode] = useState<'slider' | 'list'>('slider');

  // Slider container ref for smooth horizontal gliding
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Helper for category icons
  const getCatIcon = (id: string) => {
    switch (id) {
      case 'all':
        return <Grid className="w-3.5 h-3.5 text-gold-300" />;
      case 'traditional':
        return <Flame className="w-3.5 h-3.5 text-terracotta-400" />;
      case 'meat':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-terracotta-500" />;
      case 'drinks':
        return <Coffee className="w-3.5 h-3.5 text-gold-400" />;
      case 'desserts':
        return <Cake className="w-3.5 h-3.5 text-gold-300" />;
      case 'vegetarian':
        return <Salad className="w-3.5 h-3.5 text-olive-400" />;
      case 'breakfast':
        return <Sun className="w-3.5 h-3.5 text-gold-400" />;
      case 'sides':
        return <Layers className="w-3.5 h-3.5 text-stone-300" />;
      case 'specials':
        return <Crown className="w-3.5 h-3.5 text-gold-300" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-gold-400" />;
    }
  };

  // Find all dishes belonging to this category or matching global search
  const categoryDishes = useMemo(() => {
    if (isAllMode) return config.dishes;
    return config.dishes.filter(
      (dish) =>
        dish.category === currentCatId ||
        dish.categoryIds?.includes(currentCatId) ||
        (currentCatId === 'meat' && dish.categoryIds?.includes('meat-grill')) ||
        (currentCatId === 'traditional' &&
          (dish.categoryIds?.includes('traditional') ||
            dish.categoryIds?.includes('ethiopian-classics')))
    );
  }, [config.dishes, currentCatId, isAllMode]);

  // Sub-filter & search matching
  const displayedDishes = useMemo(() => {
    let list = searchQuery.trim() ? config.dishes : categoryDishes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((dish) => {
        const matchName = dish.name.toLowerCase().includes(q);
        const matchAmharic = dish.amharicName && dish.amharicName.includes(q);
        const matchDesc = dish.description.toLowerCase().includes(q);
        const matchTag = dish.tags?.some((t) => t.toLowerCase().includes(q));
        const matchIngredient = dish.explanation?.keyIngredients?.some((i) =>
          i.toLowerCase().includes(q)
        );
        return matchName || matchAmharic || matchDesc || matchTag || matchIngredient;
      });
    }

    if (activeSubFilter === 'all') return list;

    return list.filter((dish) => {
      const currentSubFilterObj = currentCategory.subFilters?.find(
        (sf) => sf.id === activeSubFilter
      );
      if (
        currentSubFilterObj &&
        currentSubFilterObj.tag &&
        currentSubFilterObj.tag !== 'all'
      ) {
        const tagLower = currentSubFilterObj.tag.toLowerCase();
        if (dish.tags?.some((t) => t.toLowerCase() === tagLower)) return true;
      }

      if (activeSubFilter === 'fasting')
        return dish.isFasting || dish.isVegetarian || dish.isPlantBased;
      if (activeSubFilter === 'spicy')
        return (
          dish.spiceLevel === 'spicy' ||
          dish.spiceLevel === 'extra-spicy' ||
          dish.tags?.includes('Spicy')
        );
      if (activeSubFilter === 'mild')
        return dish.spiceLevel === 'mild' || dish.spiceLevel === 'none';
      if (activeSubFilter === 'signature')
        return dish.isSignature || dish.tags?.includes('Popular');
      if (activeSubFilter === 'alcoholic')
        return (
          dish.tags?.includes('Alcoholic') ||
          dish.tags?.includes('Beer') ||
          dish.tags?.includes('Wine')
        );
      if (activeSubFilter === 'traditional')
        return dish.tags?.includes('Traditional');
      if (activeSubFilter === 'hot')
        return (
          dish.tags?.includes('Hot') ||
          dish.tags?.includes('Coffee') ||
          dish.tags?.includes('Tea')
        );
      if (activeSubFilter === 'cold')
        return (
          dish.tags?.includes('Cold') ||
          dish.tags?.includes('Juice') ||
          dish.tags?.includes('Drinks')
        );

      return true;
    });
  }, [categoryDishes, config.dishes, searchQuery, activeSubFilter, currentCategory, isAllMode]);

  // Index of current category for next/prev jumps
  const currentCatIndex = config.categories.findIndex((c) => c.id === currentCatId);
  const nextCat = currentCatIndex >= 0 && currentCatIndex < config.categories.length - 1
    ? config.categories[currentCatIndex + 1]
    : config.categories[0];
  const prevCat = currentCatIndex > 0
    ? config.categories[currentCatIndex - 1]
    : config.categories[config.categories.length - 1];

  return (
    <div className="min-h-screen text-stone-100 pb-32 pt-2 px-4 max-w-md mx-auto select-none relative">
      {/* Top Navigation Row: Back Button, Title, and Dining Advisor entry */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          onClick={() => setRoute('home')}
          className="w-10 h-10 rounded-full border border-stone-800 bg-charcoal-850/80 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-display text-xl text-gold-300 tracking-wider font-semibold uppercase">
          {searchQuery.trim()
            ? `Search (${displayedDishes.length})`
            : isAllMode
            ? 'All Menu Items'
            : getLocalizedCategoryName(currentCategory)}
        </h1>

        <button
          onClick={() => setIsSmartMenuOpen(true)}
          className="w-10 h-10 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center text-gold-300 hover:bg-gold-500/20 transition-colors"
          title="✦ Ask Dining Concierge"
          aria-label="✦ Ask Dining Concierge"
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
        </button>
      </div>

      {/* Live Search Input Bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder', 'Search dishes, spices, ingredients...')}
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-charcoal-850/90 border border-stone-800/90 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-gold-500/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-200"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Prominent "View Table Order • X items" Banner above Category Navigation */}
      {cartItemCount > 0 && (
        <div
          onClick={() => setRoute('order')}
          className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-gold-500/15 to-amber-500/20 border border-gold-400/50 shadow-md flex items-center justify-between cursor-pointer hover:border-gold-400 active:scale-99 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-stone-950 font-bold font-mono text-xs flex items-center justify-center">
              {cartItemCount}
            </span>
            <div>
              <span className="text-xs font-bold text-gold-200 block leading-tight">
                View Table Order • {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Subtotal: {formatPrice(cartTotal).primary}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-gold-300">
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Interactive Mini-Slider Strip for Categories with Left/Right Arrows */}
      {!searchQuery.trim() && (
        <div className="relative mb-3 group/slider">
          {/* Left Glider Button */}
          <button
            onClick={() => scrollSlider('left')}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-stone-900/95 border border-gold-500/30 text-gold-300 flex items-center justify-center shadow-lg hover:bg-stone-800 active:scale-90 transition sm:opacity-90"
            aria-label="Slide left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Scrollable Category Track */}
          <div
            ref={sliderRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-3"
          >
            {/* "All Menu" Option */}
            <button
              onClick={() => {
                setActiveSubFilter('all');
                selectCategory('all');
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isAllMode
                  ? 'bg-gradient-to-r from-gold-500 to-amber-400 text-charcoal-950 font-bold shadow-md shadow-gold-500/20 scale-[1.02]'
                  : 'bg-charcoal-850/90 border border-stone-800 text-stone-300 hover:border-gold-500/40'
              }`}
            >
              {getCatIcon('all')}
              <span>All Dishes</span>
            </button>

            {/* Individual Categories in Slider */}
            {config.categories.map((cat) => {
              const isSelected = !isAllMode && cat.id === currentCatId;
              const dishCount = config.dishes.filter(
                (d) =>
                  d.category === cat.id ||
                  d.categoryIds?.includes(cat.id) ||
                  (cat.id === 'meat' && d.categoryIds?.includes('meat-grill')) ||
                  (cat.id === 'traditional' &&
                    (d.categoryIds?.includes('traditional') ||
                      d.categoryIds?.includes('ethiopian-classics')))
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveSubFilter('all');
                    selectCategory(cat.id);
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-gold-500 to-amber-400 text-charcoal-950 font-bold shadow-md shadow-gold-500/20 scale-[1.02]'
                      : 'bg-charcoal-850/90 border border-stone-800 text-stone-300 hover:border-gold-500/40 hover:text-white'
                  }`}
                >
                  {getCatIcon(cat.id)}
                  <span>{getLocalizedCategoryName(cat)}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-charcoal-950/20 text-charcoal-950'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {dishCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Glider Button */}
          <button
            onClick={() => scrollSlider('right')}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-stone-900/95 border border-gold-500/30 text-gold-300 flex items-center justify-center shadow-lg hover:bg-stone-800 active:scale-90 transition sm:opacity-90"
            aria-label="Slide right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Smart Sub-Filters Row (when single category selected) */}
      {!isAllMode && currentCategory.subFilters && currentCategory.subFilters.length > 0 && !searchQuery.trim() && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mb-1">
          {currentCategory.subFilters.map((sf) => {
            const isActive = activeSubFilter === sf.id;
            return (
              <button
                key={sf.id}
                onClick={() => setActiveSubFilter(sf.id)}
                className={`shrink-0 px-3 py-1 rounded-xl text-[11px] font-medium transition-all ${
                  isActive
                    ? 'border border-gold-400/60 bg-gold-400/20 text-gold-300 font-semibold'
                    : 'border border-stone-800/80 bg-charcoal-850/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                {sf.name || sf.label}
              </button>
            );
          })}
        </div>
      )}

      {/* View Layout Toggle: Sideways Slider vs Vertical List */}
      {!searchQuery.trim() && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium min-w-0">
            <span className="text-gold-300 font-display font-semibold text-sm truncate">
              {isAllMode ? 'All Menu Categories' : getLocalizedCategoryName(currentCategory)}
            </span>
            <span className="text-stone-500 font-mono text-[11px] shrink-0">
              ({displayedDishes.length})
            </span>
          </div>

          <div className="flex items-center gap-1 bg-charcoal-850 border border-stone-800 rounded-full p-0.5 text-[11px] self-start sm:self-auto shrink-0 shadow-sm">
            <button
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all ${
                viewMode === 'slider'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>⇄ Slider</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>☰ List</span>
            </button>
          </div>
        </div>
      )}

      {/* DISHES DISPLAY: SIDEWAYS SLIDER MODE vs LIST MODE */}
      {displayedDishes.length === 0 ? (
        <div className="py-16 text-center text-stone-400 text-xs space-y-2">
          <p className="text-stone-300 font-medium">No dishes found</p>
          <p className="text-stone-500 text-[11px]">
            Try searching for different ingredients like berbere, tibs, or shiro.
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 px-3 py-1 rounded-lg border border-gold-500/30 text-gold-300 text-xs"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : isAllMode && viewMode === 'slider' && !searchQuery.trim() ? (
        /* ALL MENU: Category-by-Category Sideways Sliding Carousels */
        <div className="space-y-6 mt-1">
          {config.categories.map((cat) => {
            const catDishes = config.dishes.filter(
              (d) =>
                d.category === cat.id ||
                d.categoryIds?.includes(cat.id) ||
                (cat.id === 'meat' && d.categoryIds?.includes('meat-grill')) ||
                (cat.id === 'traditional' &&
                  (d.categoryIds?.includes('traditional') ||
                    d.categoryIds?.includes('ethiopian-classics')))
            );

            if (catDishes.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-2">
                {/* Category Header Row */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    {getCatIcon(cat.id)}
                    <h2 className="font-display text-base font-semibold text-stone-100 tracking-wide">
                      {getLocalizedCategoryName(cat)}
                    </h2>
                    <span className="text-[10px] font-mono text-gold-400 bg-gold-500/10 border border-gold-500/20 px-1.5 py-0.2 rounded-full font-bold">
                      {catDishes.length}
                    </span>
                  </div>

                  <button
                    onClick={() => selectCategory(cat.id)}
                    className="text-xs text-gold-400 hover:text-gold-200 font-medium flex items-center gap-0.5"
                  >
                    <span>View Category</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sideways Horizontal Dish Slider */}
                <FoodSliderTrack dishes={catDishes} />
              </div>
            );
          })}
        </div>
      ) : viewMode === 'slider' && !searchQuery.trim() ? (
        /* SINGLE CATEGORY: Sideways Sliding Carousel */
        <div className="space-y-2 mt-1">
          <FoodSliderTrack dishes={displayedDishes} />

          <p className="text-center text-[11px] text-stone-500 flex items-center justify-center gap-1">
            <span>⇄ Swipe or use arrows to explore dishes</span>
          </p>
        </div>
      ) : (
        /* VERTICAL LIST MODE */
        <div className="space-y-3 mt-1">
          {displayedDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} layout="horizontal" />
          ))}
        </div>
      )}

      {/* Bottom Category Quick Navigation (Previous / Next jumps) */}
      {!searchQuery.trim() && !isAllMode && (
        <div className="mt-8 pt-4 border-t border-stone-800/60 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => {
              setActiveSubFilter('all');
              selectCategory(prevCat.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal-850/80 border border-stone-800 text-stone-400 hover:text-stone-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[120px]">
              {getLocalizedCategoryName(prevCat)}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubFilter('all');
              selectCategory(nextCat.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 hover:bg-gold-500/20 font-medium transition"
          >
            <span className="truncate max-w-[120px]">
              {getLocalizedCategoryName(nextCat)}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Cart Quick Banner (when items added) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 inset-x-4 max-w-md mx-auto z-30 animate-slide-up">
          <div
            onClick={() => setRoute('order')}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-espresso-950 via-charcoal-900 to-espresso-950 border border-gold-500/50 shadow-2xl flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-400 text-charcoal-950 flex items-center justify-center font-bold font-mono text-xs shadow-md">
                {cartItemCount}
              </div>
              <div>
                <span className="text-xs font-semibold text-stone-100 block leading-tight">
                  {t('viewOrder', 'View Table Order')}
                </span>
                <span className="text-[11px] text-gold-300 font-display font-semibold">
                  {formatPrice(cartTotal).primary}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-gold-300">
              <span>{t('checkout', 'Review')}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

