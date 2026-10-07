export type SpiceHeatLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extra-spicy';

export interface PairingRecommendation {
  dishId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  reason: string; // Explains why this pairing is recommended
}

export interface ComparisonProfile {
  flavor: string;
  texture: string;
  spice: string;
  mainIngredient: string;
  experience: string;
}

export interface DishAIExplanation {
  whatIsIt: string;
  whatToExpect: string;
  tasteProfile: string[]; // e.g. ['Spicy', 'Rich', 'Savory', 'Warm']
  keyIngredients: string[];
  culturalNote: string;
  goodFor: string[]; // e.g. ['Celebrations', 'First-time explorers', 'Sharing']
}

export interface NutritionEstimate {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface AllergenData {
  contains: string[];
  notes?: string;
  foodSafetyNotice?: string;
}

export type Language = 'en' | 'am' | 'ti' | 'om';

export type CurrencyCode = 'ETB' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nativeName: string;
  flag: string;
  rateFromETB: number; // Conversion multiplier from ETB
}

export interface FormattedPrice {
  primary: string; // e.g. "850 ETB" or "≈ $6.20 USD"
  secondary?: string; // e.g. "850 ETB" when converted
  isConverted: boolean;
  convertedAmount: string;
  rawETB: number;
}

export interface MultilingualText {
  en: string;
  am: string;
  ti?: string;
  om?: string;
}

export type CategoryId =
  | 'traditional'
  | 'meat'
  | 'drinks'
  | 'desserts'
  | 'vegetarian'
  | 'breakfast'
  | 'sides'
  | 'specials'
  | string;

export interface CategorySubFilter {
  id: string;
  label: string;
  name?: string;
  names?: MultilingualText;
  tag?: string;
}

export interface Category {
  id: CategoryId;
  restaurantId?: string;
  name: string;
  names?: MultilingualText;
  subtitle?: string;
  subtitles?: MultilingualText;
  icon?: string;
  sortOrder?: number;
  dishIds: string[];
  subFilters?: CategorySubFilter[];
}

export type AvailabilityStatus = 'available' | 'sold_out' | 'temporary_unavailable';

export interface DishAvailability {
  dishId: string;
  status: AvailabilityStatus;
  temporaryUntil?: string; // ISO string, or 'today' | 'manual'
  label?: string;
  updatedAt?: string;
}

export interface Dish {
  id: string;
  restaurantId?: string;
  name: string;
  amharicName?: string;
  tigrignaName?: string;
  oromoName?: string;
  names?: MultilingualText;
  tagline?: string;
  taglines?: MultilingualText;
  description: string;
  descriptions?: MultilingualText;
  price: number; // in base currency (e.g. ETB)
  currency?: CurrencyCode;
  categoryIds: string[]; // category IDs the dish belongs to
  category?: string;
  image: string;
  tags: string[]; // e.g. ['Spicy', 'Traditional', 'Meat', 'Vegetarian', 'Fasting', 'Popular', 'Raw']
  spiceLevel: SpiceHeatLevel;
  popularityRank?: number;
  isPopular?: boolean;
  isFasting?: boolean;
  isVegetarian?: boolean;
  isPlantBased?: boolean;
  isSignature?: boolean;
  ingredients?: { name: string; icon?: string }[];
  explanation?: DishAIExplanation;
  nutrition?: NutritionEstimate;
  allergens?: AllergenData;
  pairings?: PairingRecommendation[];
  comparison?: ComparisonProfile;
  preparationTimeMinutes?: number;
  culturalStory?: string;
  availability?: AvailabilityStatus;
  extractionStatus?: 'verified' | 'needs_review';
  reviewNotes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ThemeMode = 'dark' | 'light';

export type SmartMenuAction =
  | 'explain'
  | 'expect'
  | 'pair'
  | 'compare'
  | 'sharing'
  | 'under600'
  | 'spicy'
  | 'vegetarian'
  | 'choose';

export interface RestaurantBranding {
  name: string;
  subtitle: string;
  subtitles?: MultilingualText;
  tagline: string;
  taglines?: MultilingualText;
  type: string;
  logo: string;
  coverImage: string;
  address: string;
  phone: string;
  currency: string;
}

export interface RestaurantConfig {
  branding: RestaurantBranding;
  categories: Category[];
  dishes: Dish[];
  discoveryPills: {
    id: string;
    label: string;
    filterTag: string;
  }[];
}

// -------------------------------------------------------------
// Core Domain Models for V1 Multi-Tenancy & Restaurant Operations
// -------------------------------------------------------------

export interface Restaurant {
  id: string;
  slug: string;
  name: string | MultilingualText;
  logo: string;
  coverImage: string;
  description: string | MultilingualText;
  phone: string;
  address: string | MultilingualText;
  currency: CurrencyCode;
  languages: Language[];
  timezone: string;
  theme: ThemeMode;
  status: 'active' | 'onboarding' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  name: string;
  token: string;
  isActive: boolean;
  capacity?: number;
  qrCodeUrl?: string;
  createdAt: string;
}

export interface DiningSession {
  id: string;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  startedAt: string;
  status: 'active' | 'completed';
}

export interface MenuVersion {
  version: number;
  restaurantId: string;
  publishedAt?: string;
  publishedBy?: string;
  categories: Category[];
  dishes: Dish[];
}

export type StaffRole = 'manager' | 'kitchen' | 'waiter';

export interface StaffUser {
  id: string;
  restaurantId: string;
  name: string;
  role: StaffRole;
  pin: string;
}

export interface CartItem {
  id: string; // unique item cart key (dishId + options)
  dish: Dish;
  quantity: number;
  specialInstructions?: string;
}

export interface OrderItemSnapshot {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  spiceLevel?: SpiceHeatLevel;
}

export type OrderStateStatus =
  | 'CREATED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'RECEIVED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PAID'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'card' | 'cash';

export interface LiveOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  tableId?: string;
  tableNumber: string;
  sessionId?: string;
  items: CartItem[];
  itemSnapshots?: OrderItemSnapshot[];
  subtotal: number;
  serviceCharge: number;
  tax?: number;
  total: number;
  currency?: CurrencyCode;
  status: OrderStateStatus;
  createdAt: string;
  updatedAt: string;
  type: 'digital_guest' | 'waiter_manual' | 'waiter_verbal';
  notes?: string;
  serverAssigned?: string;
  rejectionReason?: string;
  idempotencyKey?: string;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  paymentStatus?: 'unpaid' | 'paid';
}

export interface OrderState {
  items: CartItem[];
  tableNumber: string;
  status: 'idle' | 'submitting' | 'sent' | OrderStateStatus;
  orderId?: string;
  submittedAt?: Date;
  serverAssigned?: string;
  trackingStep?: 'received' | 'preparing' | 'ready' | 'served' | 'cancelled';
  estimatedMinutes?: string;
  activeLiveOrder?: LiveOrder | null;
  errorMessage?: string;
}

export interface AnalyticsSummary {
  ordersToday: number;
  revenueToday: number;
  activeOrders: number;
  activeTables: number;
  unavailableDishesCount: number;
  topDishes: { name: string; count: number; revenue: number }[];
}

export type MesobRoute =
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'menu' }
  | { name: 'category'; categoryId: string }
  | { name: 'dish'; dishId: string }
  | { name: 'pairings'; dishId: string }
  | { name: 'search'; query?: string }
  | { name: 'order' }
  | { name: 'confirmation' }
  | { name: 'receipt' };
