import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Dish,
  Category,
  RestaurantBrand,
  AnalyticsEvent,
  FilterState,
  Language,
} from '../types';
import {
  initialRestaurantBrand,
  initialCategories,
  seedDishes,
  initialAnalyticsEvents,
} from '../data/seedData';
import { getTranslation } from '../i18n/translations';

interface RestaurantContextType {
  // Brand & Config
  brand: RestaurantBrand;
  updateBrand: (brand: Partial<RestaurantBrand>) => void;
  activeTable: number;
  setActiveTable: (table: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: ReturnType<typeof getTranslation>;

  // Menu Data
  categories: Category[];
  dishes: Dish[];
  updateDish: (id: string, updates: Partial<Dish>) => void;
  toggleSoldOut: (id: string) => void;
  toggleHideDish: (id: string) => void;
  addDish: (dish: Dish) => void;
  addExtractedDishes: (dishes: Dish[]) => void;

  // Filters & Search
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (catId: string) => void;
  toggleDietaryFilter: (tag: string) => void;
  toggleTasteFilter: (tag: string) => void;
  setPriceThreshold: (maxPrice: number | null) => void;
  togglePopularOnly: () => void;
  resetFilters: () => void;
  filteredDishes: Dish[];

  // Modals & Details
  selectedDish: Dish | null;
  openDishDetail: (dish: Dish) => void;
  closeDishDetail: () => void;

  // Comparison
  comparisonIds: string[];
  addToCompare: (dishId: string) => void;
  removeFromCompare: (dishId: string) => void;
  toggleCompare: (dishId: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  comparedDishes: Dish[];

  // Analytics & Telemetry
  analyticsEvents: AnalyticsEvent[];
  trackEvent: (type: AnalyticsEvent['type'], metadata?: AnalyticsEvent['metadata']) => void;
  analyticsMetrics: {
    menuViews: number;
    dishExplorations: number;
    topExploredDish: string;
    topFilter: string;
    mostComparedPair: string;
    languageStats: { en: number; am: number };
    pairingEngagement: number;
  };

  // Demo Shell
  viewMode: 'guest' | 'admin';
  setViewMode: (mode: 'guest' | 'admin') => void;
  phoneFrameMode: boolean;
  setPhoneFrameMode: (framed: boolean) => void;
  isDemoGuideOpen: boolean;
  setIsDemoGuideOpen: (open: boolean) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const initialFilters: FilterState = {
  searchQuery: '',
  activeCategory: 'all',
  dietary: [],
  taste: [],
  maxPrice: null,
  popularOnly: false,
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<RestaurantBrand>(initialRestaurantBrand);
  const [activeTable, setActiveTable] = useState<number>(4);
  const [language, setLanguageState] = useState<Language>('en');
  const [categories] = useState<Category[]>(initialCategories);
  const [dishes, setDishes] = useState<Dish[]>(seedDishes);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(initialAnalyticsEvents);
  const [viewMode, setViewMode] = useState<'guest' | 'admin'>('guest');
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);

  const t = useMemo(() => getTranslation(language), [language]);

  const trackEvent = (type: AnalyticsEvent['type'], metadata: AnalyticsEvent['metadata'] = {}) => {
    const newEvent: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      type,
      metadata,
    };
    setAnalyticsEvents((prev) => [newEvent, ...prev]);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    trackEvent('language_change', { language: lang });
  };

  const updateBrand = (updates: Partial<RestaurantBrand>) => {
    setBrand((prev) => ({ ...prev, ...updates }));
  };

  const updateDish = (id: string, updates: Partial<Dish>) => {
    setDishes((prev) =>
      prev.map((dish) => (dish.id === id ? { ...dish, ...updates } : dish))
    );
  };

  const toggleSoldOut = (id: string) => {
    setDishes((prev) =>
      prev.map((dish) =>
        dish.id === id ? { ...dish, isAvailable: !dish.isAvailable } : dish
      )
    );
  };

  const toggleHideDish = (id: string) => {
    setDishes((prev) =>
      prev.map((dish) =>
        dish.id === id ? { ...dish, isHidden: !dish.isHidden } : dish
      )
    );
  };

  const addDish = (dish: Dish) => {
    setDishes((prev) => [dish, ...prev]);
  };

  const addExtractedDishes = (newDishes: Dish[]) => {
    setDishes((prev) => [...newDishes, ...prev]);
  };

  // Filter setters
  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const setActiveCategory = (catId: string) => {
    setFilters((prev) => ({ ...prev, activeCategory: catId }));
  };

  const toggleDietaryFilter = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.dietary.includes(tag);
      const nextDietary = exists
        ? prev.dietary.filter((t) => t !== tag)
        : [...prev.dietary, tag];
      if (!exists) {
        trackEvent('filter_click', { filterName: tag });
      }
      return { ...prev, dietary: nextDietary };
    });
  };

  const toggleTasteFilter = (tag: string) => {
    setFilters((prev) => {
      const exists = prev.taste.includes(tag);
      const nextTaste = exists
        ? prev.taste.filter((t) => t !== tag)
        : [...prev.taste, tag];
      if (!exists) {
        trackEvent('filter_click', { filterName: tag });
      }
      return { ...prev, taste: nextTaste };
    });
  };

  const setPriceThreshold = (maxPrice: number | null) => {
    setFilters((prev) => ({ ...prev, maxPrice }));
    if (maxPrice !== null) {
      trackEvent('filter_click', { filterName: `Under ${maxPrice} ETB` });
    }
  };

  const togglePopularOnly = () => {
    setFilters((prev) => {
      const nextVal = !prev.popularOnly;
      if (nextVal) trackEvent('filter_click', { filterName: 'Popular' });
      return { ...prev, popularOnly: nextVal };
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Compare handlers
  const addToCompare = (dishId: string) => {
    if (comparisonIds.length >= 3) return;
    if (!comparisonIds.includes(dishId)) {
      const next = [...comparisonIds, dishId];
      setComparisonIds(next);
      if (next.length >= 2) {
        const dishNames = next
          .map((id) => dishes.find((d) => d.id === id)?.name.en || id)
          .filter(Boolean);
        trackEvent('compare_action', { comparePair: dishNames });
      }
    }
  };

  const removeFromCompare = (dishId: string) => {
    setComparisonIds((prev) => prev.filter((id) => id !== dishId));
  };

  const toggleCompare = (dishId: string) => {
    if (comparisonIds.includes(dishId)) {
      removeFromCompare(dishId);
    } else {
      addToCompare(dishId);
    }
  };

  const clearCompare = () => {
    setComparisonIds([]);
  };

  const openDishDetail = (dish: Dish) => {
    setSelectedDish(dish);
    trackEvent('dish_view', { dishId: dish.id, dishName: dish.name.en });
  };

  const closeDishDetail = () => {
    setSelectedDish(null);
  };

  // Filtered dishes memo
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (dish.isHidden) return false;

      // Category filter
      if (filters.activeCategory !== 'all' && dish.category !== filters.activeCategory) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesEn = dish.name.en.toLowerCase().includes(q) || dish.description.en.toLowerCase().includes(q);
        const matchesAm = dish.name.am.includes(q) || dish.description.am.includes(q);
        const matchesIng =
          dish.ingredients.en.some((i) => i.toLowerCase().includes(q)) ||
          dish.ingredients.am.some((i) => i.includes(q));
        if (!matchesEn && !matchesAm && !matchesIng) return false;
      }

      // Dietary filters (e.g., 'Vegetarian', 'Plant-Based', 'Gluten-Free Option')
      if (filters.dietary.length > 0) {
        const hasAllDietary = filters.dietary.every((dTag) =>
          dish.tags.some((t) => t.toLowerCase().includes(dTag.toLowerCase()))
        );
        if (!hasAllDietary) return false;
      }

      // Taste filters (e.g. 'Spicy', 'Mild', 'Savory')
      if (filters.taste.length > 0) {
        const matchesTaste = filters.taste.some((tTag) => {
          if (tTag === 'spicy') return dish.spiceLevel === 'hot' || dish.spiceLevel === 'medium' || dish.tags.includes('Spicy');
          if (tTag === 'mild') return dish.spiceLevel === 'mild' || dish.spiceLevel === 'none';
          if (tTag === 'savory') return dish.tags.includes('Savory');
          return true;
        });
        if (!matchesTaste) return false;
      }

      // Price filter
      if (filters.maxPrice !== null && dish.price > filters.maxPrice) {
        return false;
      }

      // Popular filter
      if (filters.popularOnly && dish.popularity === 'regular') {
        return false;
      }

      return true;
    });
  }, [dishes, filters]);

  const comparedDishes = useMemo(() => {
    return comparisonIds
      .map((id) => dishes.find((d) => d.id === id))
      .filter((d): d is Dish => Boolean(d));
  }, [comparisonIds, dishes]);

  // Analytics aggregation
  const analyticsMetrics = useMemo(() => {
    const menuViews = 1248 + analyticsEvents.filter((e) => e.type === 'menu_view').length;
    const dishExplorations = 842 + analyticsEvents.filter((e) => e.type === 'dish_view' || e.type === 'explain_open').length;

    // Count dish views
    const dishCounts: Record<string, number> = { 'Doro Wot': 342, 'Special Sizzling Beef Tibs': 210, 'Shiro Tegabino': 185 };
    analyticsEvents.forEach((ev) => {
      if (ev.metadata?.dishName) {
        dishCounts[ev.metadata.dishName] = (dishCounts[ev.metadata.dishName] || 0) + 1;
      }
    });
    const topExploredDish = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Doro Wot';

    // Top filter
    const filterCounts: Record<string, number> = { Vegetarian: 142, Spicy: 98, 'Under 600 ETB': 87 };
    analyticsEvents.forEach((ev) => {
      if (ev.type === 'filter_click' && ev.metadata?.filterName) {
        filterCounts[ev.metadata.filterName] = (filterCounts[ev.metadata.filterName] || 0) + 1;
      }
    });
    const topFilter = Object.entries(filterCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Vegetarian';

    // Language stats
    let amCount = 28;
    let enCount = 72;
    analyticsEvents.forEach((ev) => {
      if (ev.type === 'language_change') {
        if (ev.metadata?.language === 'am') amCount += 1;
        else enCount += 1;
      }
    });
    const totalLang = amCount + enCount;
    const languageStats = {
      en: Math.round((enCount / totalLang) * 100),
      am: Math.round((amCount / totalLang) * 100),
    };

    // Pairing clicks
    const pairingEngagement = 184 + analyticsEvents.filter((e) => e.type === 'pairing_click').length;

    return {
      menuViews,
      dishExplorations,
      topExploredDish,
      topFilter,
      mostComparedPair: 'Tibs vs Doro Wot',
      languageStats,
      pairingEngagement,
    };
  }, [analyticsEvents]);

  return (
    <RestaurantContext.Provider
      value={{
        brand,
        updateBrand,
        activeTable,
        setActiveTable,
        language,
        setLanguage,
        t,
        categories,
        dishes,
        updateDish,
        toggleSoldOut,
        toggleHideDish,
        addDish,
        addExtractedDishes,
        filters,
        setSearchQuery,
        setActiveCategory,
        toggleDietaryFilter,
        toggleTasteFilter,
        setPriceThreshold,
        togglePopularOnly,
        resetFilters,
        filteredDishes,
        selectedDish,
        openDishDetail,
        closeDishDetail,
        comparisonIds,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        comparedDishes,
        analyticsEvents,
        trackEvent,
        analyticsMetrics,
        viewMode,
        setViewMode,
        phoneFrameMode,
        setPhoneFrameMode,
        isDemoGuideOpen,
        setIsDemoGuideOpen,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
