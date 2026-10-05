export type Language = 'en' | 'am' | 'ti' | 'om';

export interface LocalizedString {
  en: string;
  am: string;
  ti?: string;
  om?: string;
}

export interface DishExplanation {
  whatIsIt: LocalizedString;
  whatDoesItTasteLike: LocalizedString;
  whatShouldIExpect: LocalizedString;
}

export interface AllergenInfo {
  contains: string[];
  potential: string[];
  disclaimer?: LocalizedString;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isEstimate: boolean;
}

export interface PairingItem {
  id: string;
  name: LocalizedString;
  category: string;
  description: LocalizedString;
  price: number;
  image: string;
  type: 'goesWellWith' | 'youMightLike';
}

export interface DishComparisonData {
  spiceLevel: 'Mild' | 'Medium' | 'High' | 'Very High';
  style: LocalizedString;
  proteinType: LocalizedString;
  bestFor: LocalizedString;
}

export interface Dish {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number; // in ETB
  category: string;
  image: string;
  tags: string[];
  popularity: 'signature' | 'popular' | 'regular';
  isAvailable: boolean;
  isHidden?: boolean;
  spiceLevel?: 'none' | 'mild' | 'medium' | 'hot' | 'extra-hot';
  explanation: DishExplanation;
  ingredients: {
    en: string[];
    am: string[];
  };
  allergens: AllergenInfo;
  nutrition: NutritionInfo;
  pairings: PairingItem[];
  comparison: DishComparisonData;
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon?: string;
}

export interface RestaurantBrand {
  name: LocalizedString;
  tagline: LocalizedString;
  coverImage: string;
  logo: string;
  currency: string;
  phone: string;
  address: LocalizedString;
  tableNumber: number;
  accentColor: string;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: 'menu_view' | 'dish_view' | 'explain_open' | 'filter_click' | 'compare_action' | 'pairing_click' | 'language_change';
  metadata: {
    dishId?: string;
    dishName?: string;
    filterName?: string;
    comparePair?: string[];
    language?: Language;
    source?: string;
  };
}

export interface FilterState {
  searchQuery: string;
  activeCategory: string;
  dietary: string[]; // 'vegetarian', 'plant-based', 'gluten-free'
  taste: string[]; // 'spicy', 'mild', 'savory', 'sweet'
  maxPrice: number | null; // e.g. 300, 600, 1000
  popularOnly: boolean;
}
