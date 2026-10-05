import React, { useEffect, useRef } from 'react';
import { useMesob } from '../../context/MesobContext';
import { DishCard } from './DishCard';
import { Search, X, Sparkles, Utensils } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    config,
    navigateTo,
    t,
    getLocalizedCategoryName,
    getLocalizedCategorySubtitle,
  } = useMesob();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const popularSearches = ['Doro Wot', 'Tibs', 'Kitfo', 'Shiro', 'Tej', 'Fasting', 'Spicy', 'Injera', 'Buna'];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 px-4 sm:px-8 max-w-5xl mx-auto pt-6 space-y-6">
      {/* Search Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 block">
          {t('search', 'Global Discovery Search')}
        </span>
        <h1 className="text-3xl font-bold font-display text-white">
          {t('searchPlaceholder', 'Find Any Dish, Spice, or Category')}
        </h1>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder', 'Search dishes, spices, ingredients...')}
          className="w-full pl-12 pr-12 py-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 transition shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Search Chips */}
      {!searchQuery && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
            {t('popular', 'Popular Searches')}
          </span>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 transition"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="pt-6 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block">
              {t('exploreMenuCategories', 'Or Explore All Categories')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigateTo(`/mesob/category/${cat.id}`)}
                  className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition font-display">
                      {getLocalizedCategoryName(cat)}
                    </h4>
                    <p className="text-xs text-stone-400">{getLocalizedCategorySubtitle(cat)}</p>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">
                    {cat.dishIds.length} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800/80 pb-2">
            <span>
              {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} for "{searchQuery}"
            </span>
            {searchResults.length > 0 && (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Result</span>
              </span>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="py-16 text-center">
              <Utensils className="w-10 h-10 text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-300">
                No dishes found matching "{searchQuery}".
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Try searching for "kitfo", "tibs", "shiro", "spicy", or "fasting".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {searchResults.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
