import React, { useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { RestaurantHeader } from './RestaurantHeader';
import { SearchAndSmartFilters } from './SearchAndSmartFilters';
import { CategoryTabs } from './CategoryTabs';
import { DishCard } from './DishCard';
import { DishDetailModal } from './DishDetailModal';
import { DishComparisonModal } from './DishComparisonModal';
import { FloatingCompareBar } from './FloatingCompareBar';
import { Utensils, RotateCcw } from 'lucide-react';

export const GuestMenu: React.FC = () => {
  const { filteredDishes, resetFilters, t, trackEvent } = useRestaurant();

  useEffect(() => {
    // Record initial menu impression for behavioral analytics
    trackEvent('menu_view', { source: 'qr_guest_session' });
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-stone-950 text-stone-100 pb-20 relative">
      {/* Restaurant Header */}
      <RestaurantHeader />

      {/* Sticky Search & Discovery Filter Bar */}
      <SearchAndSmartFilters />

      {/* Category Scroll Tabs */}
      <CategoryTabs />

      {/* Dishes Feed */}
      <main className="px-4 py-4 flex-1">
        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-3 text-stone-500">
              <Utensils className="w-6 h-6" />
            </div>
            <p className="text-sm text-stone-300 font-medium mb-1">
              {t.noDishesFound}
            </p>
            <p className="text-xs text-stone-500 mb-4">
              Try adjusting your dietary or taste preferences.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-amber-400 hover:text-amber-300 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Elements & Modals */}
      <FloatingCompareBar />
      <DishDetailModal />
      <DishComparisonModal />
    </div>
  );
};
