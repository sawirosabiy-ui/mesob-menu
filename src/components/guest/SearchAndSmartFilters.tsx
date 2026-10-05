import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Search, X, Flame, Leaf, Sparkles, DollarSign, HeartHandshake } from 'lucide-react';

export const SearchAndSmartFilters: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    toggleDietaryFilter,
    toggleTasteFilter,
    setPriceThreshold,
    togglePopularOnly,
    resetFilters,
    t,
  } = useRestaurant();

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.dietary.length > 0 ||
    filters.taste.length > 0 ||
    filters.maxPrice !== null ||
    filters.popularOnly;

  return (
    <div className="px-4 py-3 bg-stone-950/90 backdrop-blur-md sticky top-0 z-20 border-b border-stone-800/80">
      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-9 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 transition"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scrollable Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-300 hover:bg-red-900/60 transition text-[11px] font-medium"
          >
            <X className="w-3 h-3" />
            <span>{t.clearFilters}</span>
          </button>
        )}

        {/* Dietary: Vegetarian */}
        <button
          onClick={() => toggleDietaryFilter('Vegetarian')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.dietary.includes('Vegetarian')
              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>{t.vegetarian}</span>
        </button>

        {/* Taste: Spicy */}
        <button
          onClick={() => toggleTasteFilter('spicy')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.taste.includes('spicy')
              ? 'bg-rose-600/30 border-rose-500 text-rose-300'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <Flame className="w-3 h-3 text-rose-400" />
          <span>{t.spicy}</span>
        </button>

        {/* Popular */}
        <button
          onClick={togglePopularOnly}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.popularOnly
              ? 'bg-amber-600/30 border-amber-500 text-amber-300'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{t.popular}</span>
        </button>

        {/* Taste: Mild */}
        <button
          onClick={() => toggleTasteFilter('mild')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.taste.includes('mild')
              ? 'bg-sky-600/30 border-sky-500 text-sky-300'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <HeartHandshake className="w-3 h-3 text-sky-400" />
          <span>{t.mild}</span>
        </button>

        {/* Price: Under 600 ETB */}
        <button
          onClick={() => setPriceThreshold(filters.maxPrice === 600 ? null : 600)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.maxPrice === 600
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          <span>{t.under600}</span>
        </button>

        {/* Price: Under 300 ETB */}
        <button
          onClick={() => setPriceThreshold(filters.maxPrice === 300 ? null : 300)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-medium transition ${
            filters.maxPrice === 300
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-stone-700'
          }`}
        >
          <DollarSign className="w-3 h-3" />
          <span>{t.under300}</span>
        </button>
      </div>
    </div>
  );
};
