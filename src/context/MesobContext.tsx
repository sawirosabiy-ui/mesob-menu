import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Restaurant,
  RestaurantConfig,
  Dish,
  Category,
  Table,
  CartItem,
  OrderState,
  OrderStateStatus,
  LiveOrder,
  AvailabilityStatus,
  DishAvailability,
  Language,
  ThemeMode,
  SmartMenuAction,
  CurrencyCode,
  CurrencyConfig,
  FormattedPrice,
} from '../types/mesob';
import { restaurantRepo } from '../services/restaurantRepository';
import { getMesobTranslation, SUPPORTED_LANGUAGES } from '../i18n/mesobTranslations';
import { orderAudio } from '../utils/orderAudio';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'ETB', symbol: 'ETB', name: 'Ethiopian Birr', nativeName: 'ብር', flag: '🇪🇹', rateFromETB: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', nativeName: 'USD', flag: '🇺🇸', rateFromETB: 1 / 137 },
  { code: 'EUR', symbol: '€', name: 'Euro', nativeName: 'EUR', flag: '🇪🇺', rateFromETB: 1 / 148 },
  { code: 'GBP', symbol: '£', name: 'British Pound', nativeName: 'GBP', flag: '🇬🇧', rateFromETB: 1 / 178 },
];

export interface MesobContextType {
  // Active Restaurant & Multi-Tenant State
  activeRestaurantId: string;
  setActiveRestaurantId: (id: string) => void;
  currentRestaurant: Restaurant;
  allRestaurants: Restaurant[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  activeTableRecord: Table | null;
  diningSessionId: string;
  restaurantNotFound: boolean;
  invalidTableToken: boolean;

  // Config (Derived dynamically from active restaurant & published menu)
  config: RestaurantConfig;

  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Currency
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  currencies: CurrencyConfig[];
  formatPrice: (etbAmount: number, options?: { showBoth?: boolean }) => FormattedPrice;
  convertETB: (etbAmount: number) => number;

  // Language & Internationalization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultVal?: string) => string;
  getLocalizedDishName: (dish: Dish) => string;
  getLocalizedDishTagline: (dish: Dish) => string;
  getLocalizedDishDescription: (dish: Dish) => string;
  getLocalizedCategoryName: (category: Category) => string;
  getLocalizedCategorySubtitle: (category: Category) => string;

  // Routing
  currentPath: string;
  navigateTo: (path: string) => void;
  activeCategoryId: string | null;
  activeDishId: string | null;
  activePairingsDishId: string | null;
  openPairings: (dishId: string) => void;

  // Cart & Order
  cart: CartItem[];
  addToCart: (dish: Dish, quantity?: number, instructions?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  totalItemCount: number;
  orderState: OrderState;
  submitOrder: () => Promise<LiveOrder | null>;
  submitWaiterOrder: (table: string, items: CartItem[], notes?: string) => Promise<LiveOrder>;
  resetOrder: () => void;
  advanceOrderTracking: () => void;

  // Live Dish Availability System (86-List)
  dishAvailability: Record<string, DishAvailability>;
  isDishAvailable: (dishId: string) => boolean;
  getDishAvailability: (dishId: string) => AvailabilityStatus;
  setDishAvailability: (dishId: string, status: AvailabilityStatus, duration?: number | 'today' | 'manual') => void;

  // Live Orders & Staff Queue
  activeOrders: LiveOrder[];
  currentLiveOrder: LiveOrder | null;
  updateOrderStatus: (orderId: string, status: OrderStateStatus, reason?: string) => void;
  acceptOrder: (orderId: string) => void;
  markOrderPreparing: (orderId: string) => void;
  markOrderReady: (orderId: string) => void;
  markOrderServed: (orderId: string) => void;
  payOrder: (orderId: string, method: 'telebirr' | 'cbe_birr' | 'card' | 'cash') => void;
  cancelOrder: (orderId: string, reason?: string) => void;

  // Payment Modal
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;

  // Fallback: Show to Waiter
  isShowWaiterOpen: boolean;
  setIsShowWaiterOpen: (open: boolean) => void;

  // Offline & Low-Connectivity Resilience
  isOnline: boolean;
  toggleOnline: () => void;

  // Modals & Bottom Sheets
  activeDishDetail: Dish | null;
  openDishDetail: (dish: Dish) => void;
  closeDishDetail: () => void;
  activeAIGuideDish: Dish | null;
  openAIGuide: (dish: Dish) => void;
  closeAIGuide: () => void;
  isQRScannerOpen: boolean;
  setIsQRScannerOpen: (open: boolean) => void;
  isSmartMenuOpen: boolean;
  setIsSmartMenuOpen: (open: boolean) => void;
  smartMenuAction: SmartMenuAction | null;
  setSmartMenuAction: (action: SmartMenuAction | null) => void;
  isMoreOpen: boolean;
  setIsMoreOpen: (open: boolean) => void;

  // Comparison
  comparisonDishIds: string[];
  addToComparison: (dishId: string) => void;
  removeFromComparison: (dishId: string) => void;
  clearComparison: () => void;
  isComparisonModalOpen: boolean;
  setIsComparisonModalOpen: (open: boolean) => void;
  comparedDishes: Dish[];

  // Global Search & Discovery
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Dish[];
  activeDiscoveryFilter: string | null;
  setActiveDiscoveryFilter: (tag: string | null) => void;

  // Helpers
  getDishById: (id: string) => Dish | undefined;
  getCategoryById: (id: string) => Category | undefined;

  // Aliases for screen alignment
  currentRoute: string;
  setRoute: (route: string) => void;
  selectedLanguage: Language;
  cartItemCount: number;
  selectedCategory: string;
  selectCategory: (categoryId: string) => void;
  selectDish: (dish: Dish) => void;
  currentOrder: any;
}

const MesobContext = createContext<MesobContextType | undefined>(undefined);

export const MesobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Multi-Tenant Restaurant Selection
  const [activeRestaurantId, setActiveRestaurantIdState] = useState<string>(() =>
    restaurantRepo.getActiveRestaurantId()
  );
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(() =>
    restaurantRepo.getAllRestaurants()
  );
  const [tableNumber, setTableNumberState] = useState<string>('4');
  const [activeTableRecord, setActiveTableRecord] = useState<Table | null>(null);
  const [diningSessionId] = useState<string>(() => `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);
  const [invalidTableToken, setInvalidTableToken] = useState(false);

  // Sync with repository changes
  const [, setRepoVersion] = useState(0);
  useEffect(() => {
    const unsub = restaurantRepo.subscribe(activeRestaurantId, () => {
      setRepoVersion((v) => v + 1);
      setAllRestaurants(restaurantRepo.getAllRestaurants());
    });
    return unsub;
  }, [activeRestaurantId]);

  const currentRestaurant = useMemo(() => {
    const r = restaurantRepo.getRestaurantById(activeRestaurantId);
    return r || allRestaurants[0] || ({} as Restaurant);
  }, [activeRestaurantId, allRestaurants]);

  const setActiveRestaurantId = (id: string) => {
    setActiveRestaurantIdState(id);
    restaurantRepo.setActiveRestaurantId(id);
  };

  // 2. Build Dynamic RestaurantConfig from Published Menu
  const publishedMenu = useMemo(() => {
    return restaurantRepo.getPublishedMenu(activeRestaurantId);
  }, [activeRestaurantId]);

  const config: RestaurantConfig = useMemo(() => {
    const rName =
      typeof currentRestaurant.name === 'string'
        ? currentRestaurant.name
        : currentRestaurant.name?.en || 'MESOB';
    const rDesc =
      typeof currentRestaurant.description === 'string'
        ? currentRestaurant.description
        : currentRestaurant.description?.en || '';
    const rAddr =
      typeof currentRestaurant.address === 'string'
        ? currentRestaurant.address
        : currentRestaurant.address?.en || '';

    return {
      branding: {
        name: rName,
        subtitle: rDesc,
        tagline: rDesc,
        type: 'Cultural Dining',
        logo: currentRestaurant.logo || '👑',
        coverImage: currentRestaurant.coverImage || '/images/dishes/Kitfo.jpg',
        address: rAddr,
        phone: currentRestaurant.phone || '',
        currency: currentRestaurant.currency || 'ETB',
      },
      categories: publishedMenu.categories || [],
      dishes: publishedMenu.dishes || [],
      discoveryPills: [
        { id: 'all', label: 'All Dishes', filterTag: 'All' },
        { id: 'fasting', label: '🥗 Fasting / Vegan', filterTag: 'Fasting' },
        { id: 'spicy', label: '🔥 Spicy (Berbere)', filterTag: 'Spicy' },
        { id: 'meat', label: '🥩 Prime Meat & Tibs', filterTag: 'Meat' },
        { id: 'signature', label: '👑 Chef Signature', filterTag: 'Signature' },
      ],
    };
  }, [currentRestaurant, publishedMenu]);

  // 3. Theme State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mesob_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('mesob_theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('dark');
      body.classList.add('theme-light');
      body.classList.remove('dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
      body.classList.remove('theme-light');
      body.classList.add('dark');
    }
  }, [theme]);

  // 4. Currency State
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('mesob_currency') as CurrencyCode;
      if (saved && ['ETB', 'USD', 'EUR', 'GBP'].includes(saved)) return saved;
    } catch {}
    return (currentRestaurant.currency as CurrencyCode) || 'ETB';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('mesob_currency', c);
    } catch {}
  };

  const convertETB = (etbAmount: number): number => {
    const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
    return Number((etbAmount * current.rateFromETB).toFixed(2));
  };

  const formatPrice = (etbAmount: number): FormattedPrice => {
    const currentCurr = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
    if (currency === 'ETB') {
      return {
        primary: `${etbAmount} ETB`,
        isConverted: false,
        convertedAmount: `${etbAmount} ETB`,
        rawETB: etbAmount,
      };
    }
    const converted = (etbAmount * currentCurr.rateFromETB).toFixed(2);
    return {
      primary: `≈ ${currentCurr.symbol}${converted} ${currentCurr.code}`,
      secondary: `${etbAmount} ETB`,
      isConverted: true,
      convertedAmount: `${currentCurr.symbol}${converted} ${currentCurr.code}`,
      rawETB: etbAmount,
    };
  };

  // 5. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mesob_language') as Language;
      if (saved && ['en', 'am', 'ti', 'om'].includes(saved)) return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mesob_language', lang);
    } catch {}
  };

  const t = useCallback(
    (key: string, defaultVal: string = ''): string => {
      const val = getMesobTranslation(key, language);
      return val !== key ? val : defaultVal || key;
    },
    [language]
  );

  const getLocalizedDishName = useCallback(
    (dish: Dish): string => {
      if (dish.names && dish.names[language]) return dish.names[language]!;
      if (language === 'am' && dish.amharicName) return dish.amharicName;
      if (language === 'ti' && dish.tigrignaName) return dish.tigrignaName;
      if (language === 'om' && dish.oromoName) return dish.oromoName;
      return dish.name;
    },
    [language]
  );

  const getLocalizedDishTagline = useCallback(
    (dish: Dish): string => {
      if (dish.taglines && dish.taglines[language]) return dish.taglines[language]!;
      return dish.tagline || '';
    },
    [language]
  );

  const getLocalizedDishDescription = useCallback(
    (dish: Dish): string => {
      if (dish.descriptions && dish.descriptions[language]) return dish.descriptions[language]!;
      return dish.description;
    },
    [language]
  );

  const getLocalizedCategoryName = useCallback(
    (cat: Category): string => {
      if (cat.names && cat.names[language]) return cat.names[language]!;
      return cat.name;
    },
    [language]
  );

  const getLocalizedCategorySubtitle = useCallback(
    (cat: Category): string => {
      if (cat.subtitles && cat.subtitles[language]) return cat.subtitles[language]!;
      return cat.subtitle || '';
    },
    [language]
  );

  // 6. Live Dish Availability (86-List)
  const dishAvailability = useMemo(() => {
    return restaurantRepo.getAvailability(activeRestaurantId);
  }, [activeRestaurantId]);

  const isDishAvailable = useCallback(
    (dishId: string): boolean => {
      return restaurantRepo.isDishAvailable(activeRestaurantId, dishId);
    },
    [activeRestaurantId]
  );

  const getDishAvailability = useCallback(
    (dishId: string): AvailabilityStatus => {
      const item = dishAvailability[dishId];
      return item ? item.status : 'available';
    },
    [dishAvailability]
  );

  const setDishAvailability = useCallback(
    (dishId: string, status: AvailabilityStatus, duration?: number | 'today' | 'manual') => {
      restaurantRepo.setDishAvailability(activeRestaurantId, dishId, status, duration);
    },
    [activeRestaurantId]
  );

  // 7. Live Orders Queue
  const activeOrders = useMemo(() => {
    return restaurantRepo.getOrders(activeRestaurantId);
  }, [activeRestaurantId]);

  // 8. Offline Resilience State
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const toggleOnline = () => setIsOnline((prev) => !prev);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 9. Routing State
  const [currentPath, setCurrentPath] = useState<string>('/mesob/welcome');
  const [currentRoute, setCurrentRouteState] = useState<string>('welcome');

  const setRoute = (route: string) => {
    setCurrentRouteState(route);
    navigateTo(`/mesob/${route}`);
  };

  const navigateTo = (path: string) => {
    const formatted = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = formatted;
    setCurrentPath(formatted);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL Parser for /r/:restaurantSlug/t/:tableToken and /mesob routes
  useEffect(() => {
    const handleUrlRoute = () => {
      const raw = window.location.hash.replace(/^#/, '') || window.location.pathname;

      // 1. Restaurant + Table canonical route: /r/:restaurantSlug/t/:tableToken
      const rMatch = raw.match(/\/r\/([a-zA-Z0-9_-]+)(?:\/t\/([a-zA-Z0-9_-]+))?/);
      if (rMatch) {
        const slug = rMatch[1];
        const token = rMatch[2];

        const targetRestaurant = restaurantRepo.getRestaurantBySlug(slug);
        if (targetRestaurant) {
          setRestaurantNotFound(false);
          if (targetRestaurant.id !== activeRestaurantId) {
            setActiveRestaurantId(targetRestaurant.id);
          }

          if (token) {
            const tbl = restaurantRepo.getTableByToken(targetRestaurant.id, token);
            if (tbl) {
              setInvalidTableToken(false);
              setActiveTableRecord(tbl);
              setTableNumberState(tbl.tableNumber);
            } else {
              setInvalidTableToken(true);
            }
          }
          setCurrentRouteState('home');
          return;
        } else {
          setRestaurantNotFound(true);
        }
      }

      // 2. Portal / Operational Routes
      if (raw.includes('/portal') || raw.includes('/admin')) {
        setCurrentRouteState('portal');
        return;
      }
      if (raw.includes('/kitchen') || raw.includes('/staff-queue')) {
        setCurrentRouteState('staff-queue');
        return;
      }
      if (raw.includes('/waiter') || raw.includes('/waiter-mode')) {
        setCurrentRouteState('waiter-mode');
        return;
      }
      if (raw.includes('/availability')) {
        setCurrentRouteState('availability');
        return;
      }

      // 3. Mesob Guest Internal Route parsing
      if (raw.includes('welcome')) setCurrentRouteState('welcome');
      else if (raw.includes('home')) setCurrentRouteState('home');
      else if (raw.includes('category')) setCurrentRouteState('category');
      else if (raw.includes('menu')) setCurrentRouteState('menu');
      else if (raw.includes('pairings')) setCurrentRouteState('pairings');
      else if (raw.includes('order')) setCurrentRouteState('order');
      else if (raw.includes('confirmation')) setCurrentRouteState('confirmation');
      else if (raw.includes('receipt')) setCurrentRouteState('receipt');
      else setCurrentRouteState('home');
    };

    window.addEventListener('hashchange', handleUrlRoute);
    handleUrlRoute(); // Initial evaluation
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, [activeRestaurantId]);

  // 10. Cart & Orders
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mesob_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mesob_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (dish: Dish, quantity: number = 1, instructions?: string) => {
    if (!isDishAvailable(dish.id)) {
      alert(`"${dish.name}" is currently sold out and cannot be added to cart.`);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.dish.id === dish.id && item.specialInstructions === instructions
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          id: `item-${dish.id}-${Date.now()}`,
          dish,
          quantity,
          specialInstructions: instructions,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  }, [cart]);

  const cartTotal = cartSubtotal;
  const totalItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Order State
  const [orderState, setOrderState] = useState<OrderState>(() => {
    try {
      const saved = localStorage.getItem('mesob_order_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      items: [],
      tableNumber: '4',
      status: 'idle',
      trackingStep: 'received',
    };
  });

  const currentLiveOrder = useMemo(() => {
    if (orderState.activeLiveOrder) {
      const refreshed = activeOrders.find((o) => o.id === orderState.activeLiveOrder?.id);
      if (refreshed) return refreshed;
    }
    return activeOrders[0] || null;
  }, [orderState.activeLiveOrder, activeOrders]);

  useEffect(() => {
    if (currentLiveOrder) {
      let step: 'received' | 'preparing' | 'ready' | 'served' | 'cancelled' = 'received';
      let est = 'Waiting for confirmation';

      if (currentLiveOrder.status === 'SUBMITTED' || currentLiveOrder.status === 'RECEIVED') {
        step = 'received';
        est = 'Waiting for kitchen confirmation';
      } else if (currentLiveOrder.status === 'ACCEPTED' || currentLiveOrder.status === 'PREPARING') {
        step = 'preparing';
        est = 'Kitchen preparing (12 – 15 min)';
      } else if (currentLiveOrder.status === 'READY') {
        step = 'ready';
        est = 'Order is ready for serving!';
      } else if (currentLiveOrder.status === 'SERVED') {
        step = 'served';
        est = 'Served at table · Ready for payment';
      } else if (currentLiveOrder.status === 'PAID') {
        step = 'served';
        est = 'Paid & Settled';
      }

      setOrderState((prev) => ({
        ...prev,
        items: currentLiveOrder.items,
        tableNumber: currentLiveOrder.tableNumber,
        status: currentLiveOrder.status,
        orderId: currentLiveOrder.orderNumber,
        submittedAt: new Date(currentLiveOrder.createdAt),
        serverAssigned: currentLiveOrder.serverAssigned || 'Dawit T.',
        trackingStep: step,
        estimatedMinutes: est,
        activeLiveOrder: currentLiveOrder,
      }));
    }
  }, [currentLiveOrder]);

  // Order Submission with Anti-Tamper & Offline Protection
  const submitOrder = async (): Promise<LiveOrder | null> => {
    if (cart.length === 0) return null;

    if (!isOnline) {
      setOrderState((prev) => ({
        ...prev,
        errorMessage: 'Offline: Your order has not been sent. Show this screen to your waiter.',
      }));
      throw new Error('OFFLINE_CANNOT_SUBMIT');
    }

    const idempotencyKey = `idemp-${activeRestaurantId}-${tableNumber}-${Date.now()}`;

    const res = restaurantRepo.createOrder({
      restaurantId: activeRestaurantId,
      tableNumber,
      items: cart,
      idempotencyKey,
      type: 'digital_guest',
    });

    if (!res.success || !res.order) {
      const err = res.error || 'Failed to place order';
      setOrderState((prev) => ({ ...prev, errorMessage: err }));
      throw new Error(err);
    }

    const newOrder = res.order;
    orderAudio.playNewOrderChime();

    setOrderState({
      items: [...cart],
      tableNumber,
      status: 'SUBMITTED',
      orderId: newOrder.orderNumber,
      submittedAt: new Date(),
      trackingStep: 'received',
      estimatedMinutes: 'Waiting for kitchen confirmation',
      activeLiveOrder: newOrder,
      errorMessage: undefined,
    });

    setCart([]);
    navigateTo('/mesob/confirmation');
    return newOrder;
  };

  const submitWaiterOrder = async (
    table: string,
    items: CartItem[],
    notes?: string
  ): Promise<LiveOrder> => {
    const res = restaurantRepo.createOrder({
      restaurantId: activeRestaurantId,
      tableNumber: table,
      items,
      notes,
      type: 'waiter_manual',
    });

    if (!res.success || !res.order) {
      throw new Error(res.error || 'Waiter order failed');
    }

    orderAudio.playNewOrderChime();
    return res.order;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStateStatus,
    reason?: string
  ) => {
    restaurantRepo.updateOrderStatus(activeRestaurantId, orderId, status, { rejectionReason: reason });
    orderAudio.playStatusPing();
  };

  const acceptOrder = (orderId: string) => updateOrderStatus(orderId, 'PREPARING');
  const markOrderPreparing = (orderId: string) => updateOrderStatus(orderId, 'PREPARING');
  const markOrderReady = (orderId: string) => updateOrderStatus(orderId, 'READY');
  const markOrderServed = (orderId: string) => updateOrderStatus(orderId, 'SERVED');
  const payOrder = (orderId: string, method: 'telebirr' | 'cbe_birr' | 'card' | 'cash') => {
    restaurantRepo.payOrder(activeRestaurantId, orderId, method);
    orderAudio.playStatusPing();
  };
  const cancelOrder = (orderId: string, reason?: string) => updateOrderStatus(orderId, 'CANCELLED', reason);

  const resetOrder = () => {
    setOrderState({
      items: [],
      tableNumber,
      status: 'idle',
      trackingStep: 'received',
    });
  };

  const advanceOrderTracking = () => {
    if (!currentLiveOrder) return;
    const flow: Record<OrderStateStatus, OrderStateStatus> = {
      CREATED: 'SUBMITTED',
      DRAFT: 'SUBMITTED',
      SUBMITTED: 'PREPARING',
      RECEIVED: 'PREPARING',
      ACCEPTED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: 'PAID',
      PAID: 'PAID',
      CANCELLED: 'CANCELLED',
      REJECTED: 'REJECTED',
    };
    const next = flow[currentLiveOrder.status] || 'SERVED';
    if (next === 'PAID') {
      payOrder(currentLiveOrder.id, 'telebirr');
    } else {
      updateOrderStatus(currentLiveOrder.id, next);
    }
  };

  // Modals & Bottom Sheets
  const [activeDishDetail, setActiveDishDetail] = useState<Dish | null>(null);
  const [activeAIGuideDish, setActiveAIGuideDish] = useState<Dish | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSmartMenuOpen, setIsSmartMenuOpen] = useState(false);
  const [smartMenuAction, setSmartMenuAction] = useState<SmartMenuAction | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isShowWaiterOpen, setIsShowWaiterOpen] = useState(false);
  const [activePairingsDishId, setActivePairingsDishId] = useState<string | null>('doro-wot');
  const [selectedCategoryState, setSelectedCategoryState] = useState<string>('traditional');
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonDishIds, setComparisonDishIds] = useState<string[]>(['doro-wot', 'tibs']);

  const openDishDetail = (dish: Dish) => setActiveDishDetail(dish);
  const closeDishDetail = () => setActiveDishDetail(null);
  const openAIGuide = (dish: Dish) => setActiveAIGuideDish(dish);
  const closeAIGuide = () => setActiveAIGuideDish(null);

  const openPairings = (dishId: string) => {
    setActivePairingsDishId(dishId);
    navigateTo(`/mesob/pairings/${dishId}`);
  };

  const addToComparison = (dishId: string) => {
    setComparisonDishIds((prev) => (prev.includes(dishId) ? prev : [...prev.slice(-1), dishId]));
    setIsComparisonModalOpen(true);
  };

  const removeFromComparison = (dishId: string) => {
    setComparisonDishIds((prev) => prev.filter((id) => id !== dishId));
  };

  const clearComparison = () => setComparisonDishIds([]);

  const comparedDishes = useMemo(() => {
    return comparisonDishIds
      .map((id) => config.dishes.find((d) => d.id === id))
      .filter((d): d is Dish => Boolean(d));
  }, [comparisonDishIds, config.dishes]);

  // Global Search & Discovery Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDiscoveryFilter, setActiveDiscoveryFilter] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return config.dishes.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.amharicName && d.amharicName.includes(q)) ||
        d.description.toLowerCase().includes(q)
    );
  }, [searchQuery, config.dishes]);

  const getDishById = (id: string) => config.dishes.find((d) => d.id === id);
  const getCategoryById = (id: string) => config.categories.find((c) => c.id === id);

  const setTableNumber = (tNum: string) => {
    setTableNumberState(tNum);
    setOrderState((prev) => ({ ...prev, tableNumber: tNum }));
  };

  const selectCategory = (catId: string) => {
    setSelectedCategoryState(catId);
    navigateTo(`/mesob/category/${catId}`);
  };

  const selectDish = (dish: Dish) => openDishDetail(dish);

  const activeCategoryId = useMemo(() => {
    const match = currentPath.match(/(?:\/mesob)?\/category\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }, [currentPath]);

  const activeDishId = useMemo(() => {
    const match = currentPath.match(/(?:\/mesob)?\/dish\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }, [currentPath]);

  const value: MesobContextType = {
    activeRestaurantId,
    setActiveRestaurantId,
    currentRestaurant,
    allRestaurants,
    tableNumber,
    setTableNumber,
    activeTableRecord,
    diningSessionId,
    restaurantNotFound,
    invalidTableToken,
    config,
    theme,
    toggleTheme,
    setTheme,
    currency,
    setCurrency,
    currencies: SUPPORTED_CURRENCIES,
    formatPrice,
    convertETB,
    language,
    setLanguage,
    t,
    getLocalizedDishName,
    getLocalizedDishTagline,
    getLocalizedDishDescription,
    getLocalizedCategoryName,
    getLocalizedCategorySubtitle,
    currentPath,
    navigateTo,
    activeCategoryId,
    activeDishId,
    activePairingsDishId,
    openPairings,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTotal,
    totalItemCount,
    orderState,
    submitOrder,
    submitWaiterOrder,
    resetOrder,
    advanceOrderTracking,
    dishAvailability,
    isDishAvailable,
    getDishAvailability,
    setDishAvailability,
    activeOrders,
    currentLiveOrder,
    updateOrderStatus,
    acceptOrder,
    markOrderPreparing,
    markOrderReady,
    markOrderServed,
    payOrder,
    cancelOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isShowWaiterOpen,
    setIsShowWaiterOpen,
    isOnline,
    toggleOnline,
    activeDishDetail,
    openDishDetail,
    closeDishDetail,
    activeAIGuideDish,
    openAIGuide,
    closeAIGuide,
    isQRScannerOpen,
    setIsQRScannerOpen,
    isSmartMenuOpen,
    setIsSmartMenuOpen,
    smartMenuAction,
    setSmartMenuAction,
    isMoreOpen,
    setIsMoreOpen,
    comparisonDishIds,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isComparisonModalOpen,
    setIsComparisonModalOpen,
    comparedDishes,
    searchQuery,
    setSearchQuery,
    searchResults,
    activeDiscoveryFilter,
    setActiveDiscoveryFilter,
    getDishById,
    getCategoryById,
    currentRoute,
    setRoute,
    selectedLanguage: language,
    cartItemCount: totalItemCount,
    selectedCategory: selectedCategoryState,
    selectCategory,
    selectDish,
    currentOrder: orderState,
  };

  return <MesobContext.Provider value={value}>{children}</MesobContext.Provider>;
};

export const useMesob = (): MesobContextType => {
  const context = useContext(MesobContext);
  if (!context) {
    throw new Error('useMesob must be used within a MesobProvider');
  }
  return context;
};
