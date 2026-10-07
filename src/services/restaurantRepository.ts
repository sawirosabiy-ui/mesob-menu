import {
  Restaurant,
  Table,
  MenuVersion,
  Dish,
  Category,
  LiveOrder,
  CartItem,
  OrderItemSnapshot,
  DishAvailability,
  AvailabilityStatus,
  OrderStateStatus,
  AnalyticsSummary,
  CurrencyCode,
  ThemeMode,
} from '../types/mesob';
import { mesobDishes, mesobCategories, mesobRestaurantConfig } from '../data/mesobData';

const STORAGE_KEYS = {
  RESTAURANTS: 'mesob_v1_restaurants',
  TABLES: 'mesob_v1_tables',
  MENUS_DRAFT: 'mesob_v1_menus_draft',
  MENUS_PUBLISHED: 'mesob_v1_menus_published',
  ORDERS: 'mesob_v1_orders',
  AVAILABILITY: 'mesob_v1_availability',
  ACTIVE_RESTAURANT_ID: 'mesob_v1_active_restaurant_id',
};

// Safe storage wrapper for browser and headless/SSR environments
const memoryStore: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage.getItem(key);
      }
    } catch {}
    return key in memoryStore ? memoryStore[key] : null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(key, value);
        return;
      }
    } catch {}
    memoryStore[key] = String(value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(key);
        return;
      }
    } catch {}
    delete memoryStore[key];
  },
};

type Listener = () => void;

class RestaurantRepository {
  private static instance: RestaurantRepository;
  private listeners: Map<string, Set<Listener>> = new Map();
  private submitLocks: Set<string> = new Set(); // in-flight idempotency locks

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): RestaurantRepository {
    if (!RestaurantRepository.instance) {
      RestaurantRepository.instance = new RestaurantRepository();
    }
    return RestaurantRepository.instance;
  }

  // -------------------------------------------------------------
  // Subscription System
  // -------------------------------------------------------------
  public subscribe(restaurantId: string, listener: Listener): () => void {
    if (!this.listeners.has(restaurantId)) {
      this.listeners.set(restaurantId, new Set());
    }
    this.listeners.get(restaurantId)!.add(listener);

    return () => {
      this.listeners.get(restaurantId)?.delete(listener);
    };
  }

  public notify(restaurantId: string) {
    const list = this.listeners.get(restaurantId);
    if (list) {
      list.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('Error in repository listener:', e);
        }
      });
    }
  }

  // -------------------------------------------------------------
  // Seed Initialization
  // -------------------------------------------------------------
  private ensureInitialized() {
    try {
      const storedRestaurants = safeStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      if (storedRestaurants) {
        return; // Already initialized
      }
    } catch {}

    const now = new Date().toISOString();

    // Default Primary Restaurant (Bole Spice & Hearth)
    const primaryId = 'rest-bole-spice';
    const primaryRestaurant: Restaurant = {
      id: primaryId,
      slug: 'bole-spice',
      name: {
        en: 'Bole Spice & Hearth',
        am: 'ቦሌ ስፓይስ እና ኸርዝ',
        ti: 'ቦሌ ስፓይስን ኸርዝን',
        om: 'Bole Ispeesii fi Iddoo Aadaa',
      },
      logo: '👑',
      coverImage: '/images/dishes/Kitfo.jpg',
      description: {
        en: 'Authentic communal Ethiopian dining, ceremonial stews, prime tibs, and artisanal heritage flavors.',
        am: 'ባህላዊ እና ዘመናዊ የኢትዮጵያ የምግብ ጥበብ፣ ንጥር ቅቤ እና ባህላዊ ወጦች።',
        ti: 'ባህላዊ ናይ ሃበሻ መግቢ ብፅሬት ዝቐርበሉ ፍሉይ ቦታ።',
        om: 'Nyaata aadaa Itoophiyaa qulqullina olaanaadhaan kan dhihaatu.',
      },
      phone: '+251 91 123 4567',
      address: {
        en: 'Bole Road, Next to Medhane Alem Cathedral, Addis Ababa',
        am: 'ቦሌ መንገድ፣ ከመድኃኔዓለም ካቴድራል አጠገብ፣ አዲስ አበባ',
      },
      currency: 'ETB',
      languages: ['en', 'am', 'ti', 'om'],
      timezone: 'Africa/Addis_Ababa',
      theme: 'dark',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    // Primary Tables (1 to 8)
    const primaryTables: Table[] = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
      id: `tbl-${primaryId}-${num}`,
      restaurantId: primaryId,
      tableNumber: String(num),
      name: `Table ${num}`,
      token: `t${num}`,
      isActive: true,
      capacity: num <= 2 ? 2 : num <= 6 ? 4 : 8,
      createdAt: now,
    }));

    // Primary Dishes & Categories with restaurantId assigned
    const seededDishes: Dish[] = mesobDishes.map((d) => ({
      ...d,
      restaurantId: primaryId,
      availability: 'available',
      extractionStatus: 'verified',
    }));

    const seededCategories: Category[] = mesobCategories.map((c) => ({
      ...c,
      restaurantId: primaryId,
    }));

    const primaryMenu: MenuVersion = {
      version: 1,
      restaurantId: primaryId,
      publishedAt: now,
      publishedBy: 'System Admin',
      categories: seededCategories,
      dishes: seededDishes,
    };

    // Secondary Restaurant for multi-tenancy verification
    const secondaryId = 'rest-abyssinia';
    const secondaryRestaurant: Restaurant = {
      id: secondaryId,
      slug: 'abyssinia-grill',
      name: {
        en: 'Abyssinia Charcoal & Grill',
        am: 'አቢሲኒያ ከሰል እና ጥብስ',
        ti: 'ኣቢሲንያ ጥብሲ',
        om: 'Abisiiniyaa Tibsii',
      },
      logo: '🔥',
      coverImage: '/images/dishes/Tibs.jpg',
      description: {
        en: 'Specializing in prime tenderloin tibs, charcoal roasted meats, and traditional clay stove delights.',
        am: 'በከሰል የሚጠበሱ ልዩ የበሬ እና የበግ ስጋዎች እንዲሁም ባህላዊ የሸክላ ጥብሶች።',
      },
      phone: '+251 92 888 9900',
      address: {
        en: 'Kazanchis, Behind UNECA, Addis Ababa',
        am: 'ካዛንቺስ፣ ከኢኮኖሚ ኮሚሽን ጀርባ፣ አዲስ አበባ',
      },
      currency: 'ETB',
      languages: ['en', 'am'],
      timezone: 'Africa/Addis_Ababa',
      theme: 'dark',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const secondaryTables: Table[] = [1, 2, 3, 4].map((num) => ({
      id: `tbl-${secondaryId}-${num}`,
      restaurantId: secondaryId,
      tableNumber: String(num),
      name: `Grill Table ${num}`,
      token: `g${num}`,
      isActive: true,
      capacity: 4,
      createdAt: now,
    }));

    // Subset of grill dishes for secondary restaurant
    const secondaryDishes: Dish[] = seededDishes
      .filter((d) => ['tibs', 'kitfo', 'injera', 'ethiopian-coffee', 'habesha-beer'].includes(d.id))
      .map((d) => ({
        ...d,
        id: `${d.id}-aby`,
        restaurantId: secondaryId,
        price: d.price + 50, // Slight price difference to demonstrate tenant isolation
      }));

    const secondaryCategories: Category[] = [
      {
        id: 'grill-specials',
        restaurantId: secondaryId,
        name: 'Sizzling Meat & Grill',
        names: { en: 'Sizzling Meat & Grill', am: 'የከሰል ጥብሶች' },
        dishIds: secondaryDishes.map((d) => d.id),
      },
    ];

    const secondaryMenu: MenuVersion = {
      version: 1,
      restaurantId: secondaryId,
      publishedAt: now,
      publishedBy: 'System Admin',
      categories: secondaryCategories,
      dishes: secondaryDishes,
    };

    // Initial Orders for primary restaurant
    const initialOrders: LiveOrder[] = [
      {
        id: `ord-${Date.now() - 1000 * 60 * 12}`,
        orderNumber: 'MES-101',
        restaurantId: primaryId,
        tableNumber: '4',
        items: [
          { id: 'item-1', dish: seededDishes[0], quantity: 1, specialInstructions: 'Medium spicy please' },
          { id: 'item-2', dish: seededDishes[1], quantity: 1 },
        ],
        subtotal: 1280,
        serviceCharge: 128,
        total: 1408,
        status: 'PREPARING',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: 'digital_guest',
        serverAssigned: 'Dawit T.',
      },
      {
        id: `ord-${Date.now() - 1000 * 60 * 3}`,
        orderNumber: 'MES-102',
        restaurantId: primaryId,
        tableNumber: '2',
        items: [
          { id: 'item-3', dish: seededDishes[1], quantity: 2, specialInstructions: 'Extra rosemary' },
        ],
        subtotal: 1400,
        serviceCharge: 140,
        total: 1540,
        status: 'SUBMITTED',
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        type: 'digital_guest',
      },
    ];

    try {
      safeStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify([primaryRestaurant, secondaryRestaurant]));
      safeStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify([...primaryTables, ...secondaryTables]));
      safeStorage.setItem(
        STORAGE_KEYS.MENUS_PUBLISHED,
        JSON.stringify({ [primaryId]: primaryMenu, [secondaryId]: secondaryMenu })
      );
      safeStorage.setItem(
        STORAGE_KEYS.MENUS_DRAFT,
        JSON.stringify({ [primaryId]: primaryMenu, [secondaryId]: secondaryMenu })
      );
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, primaryId);
    } catch (e) {
      console.error('Failed to seed localStorage:', e);
    }
  }

  // -------------------------------------------------------------
  // Restaurant CRUD & Tenant Isolation
  // -------------------------------------------------------------
  public getAllRestaurants(): Restaurant[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getRestaurantById(id: string): Restaurant | null {
    const list = this.getAllRestaurants();
    return list.find((r) => r.id === id) || null;
  }

  public getRestaurantBySlug(slug: string): Restaurant | null {
    const list = this.getAllRestaurants();
    return list.find((r) => r.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  public getActiveRestaurantId(): string {
    try {
      const id = safeStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
      if (id) return id;
    } catch {}
    const all = this.getAllRestaurants();
    return all[0]?.id || 'rest-bole-spice';
  }

  public setActiveRestaurantId(id: string) {
    try {
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, id);
    } catch {}
    this.notify(id);
  }

  public saveRestaurant(restaurant: Restaurant) {
    const list = this.getAllRestaurants();
    const index = list.findIndex((r) => r.id === restaurant.id);
    restaurant.updatedAt = new Date().toISOString();
    if (index >= 0) {
      list[index] = restaurant;
    } else {
      list.push(restaurant);
    }
    safeStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(list));
    this.notify(restaurant.id);
  }

  public createRestaurant(input: {
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    address?: string;
    currency?: CurrencyCode;
    logo?: string;
  }): Restaurant {
    const now = new Date().toISOString();
    const id = `rest-${Date.now()}`;
    const newRestaurant: Restaurant = {
      id,
      slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: input.name.trim(),
      logo: input.logo || '🍽️',
      coverImage: '/images/dishes/Tibs.jpg',
      description: input.description || '',
      phone: input.phone || '',
      address: input.address || '',
      currency: input.currency || 'ETB',
      languages: ['en', 'am'],
      timezone: 'Africa/Addis_Ababa',
      theme: 'dark',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAllRestaurants();
    all.push(newRestaurant);
    safeStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(all));

    // Provision empty draft and published menus
    const emptyMenu: MenuVersion = {
      version: 1,
      restaurantId: id,
      publishedAt: now,
      publishedBy: 'Manager',
      categories: [
        {
          id: 'cat-main',
          restaurantId: id,
          name: 'Main Courses',
          names: { en: 'Main Courses', am: 'ዋና ምግቦች' },
          dishIds: [],
        },
      ],
      dishes: [],
    };

    const drafts = this.getAllDraftMenus();
    drafts[id] = emptyMenu;
    safeStorage.setItem(STORAGE_KEYS.MENUS_DRAFT, JSON.stringify(drafts));

    const pubs = this.getAllPublishedMenus();
    pubs[id] = emptyMenu;
    safeStorage.setItem(STORAGE_KEYS.MENUS_PUBLISHED, JSON.stringify(pubs));

    // Provision default tables
    this.createTable(id, '1', 'Table 1');
    this.createTable(id, '2', 'Table 2');
    this.createTable(id, '3', 'Table 3');

    this.setActiveRestaurantId(id);
    return newRestaurant;
  }

  // -------------------------------------------------------------
  // Table Management
  // -------------------------------------------------------------
  public getAllTables(): Table[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.TABLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getTables(restaurantId: string): Table[] {
    return this.getAllTables().filter((t) => t.restaurantId === restaurantId);
  }

  public getTableByToken(restaurantId: string, token: string): Table | null {
    const tables = this.getTables(restaurantId);
    return (
      tables.find(
        (t) =>
          t.token.toLowerCase() === token.toLowerCase() ||
          t.tableNumber.toLowerCase() === token.toLowerCase() ||
          t.id === token
      ) || null
    );
  }

  public createTable(restaurantId: string, tableNumber: string, name?: string): Table {
    const tables = this.getAllTables();
    const token = `t${tableNumber.replace(/[^0-9a-zA-Z]/g, '')}`;
    const newTable: Table = {
      id: `tbl-${restaurantId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      restaurantId,
      tableNumber,
      name: name || `Table ${tableNumber}`,
      token,
      isActive: true,
      capacity: 4,
      createdAt: new Date().toISOString(),
    };
    tables.push(newTable);
    safeStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    this.notify(restaurantId);
    return newTable;
  }

  public updateTable(tableId: string, updates: Partial<Table>) {
    const tables = this.getAllTables();
    const idx = tables.findIndex((t) => t.id === tableId);
    if (idx >= 0) {
      tables[idx] = { ...tables[idx], ...updates };
      safeStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      this.notify(tables[idx].restaurantId);
    }
  }

  public deleteTable(tableId: string) {
    const tables = this.getAllTables();
    const target = tables.find((t) => t.id === tableId);
    if (target) {
      const filtered = tables.filter((t) => t.id !== tableId);
      safeStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(filtered));
      this.notify(target.restaurantId);
    }
  }

  // -------------------------------------------------------------
  // Draft vs Published Menu Versioning
  // -------------------------------------------------------------
  private getAllDraftMenus(): Record<string, MenuVersion> {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.MENUS_DRAFT);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private getAllPublishedMenus(): Record<string, MenuVersion> {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.MENUS_PUBLISHED);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public getDraftMenu(restaurantId: string): MenuVersion {
    const drafts = this.getAllDraftMenus();
    if (drafts[restaurantId]) {
      return drafts[restaurantId];
    }
    // Fallback to published if draft doesn't exist
    const published = this.getPublishedMenu(restaurantId);
    return JSON.parse(JSON.stringify(published));
  }

  public getPublishedMenu(restaurantId: string): MenuVersion {
    const pubs = this.getAllPublishedMenus();
    if (pubs[restaurantId]) {
      return pubs[restaurantId];
    }
    // Return empty fallback
    return {
      version: 1,
      restaurantId,
      categories: [],
      dishes: [],
    };
  }

  public saveDraftMenu(restaurantId: string, menu: MenuVersion) {
    const drafts = this.getAllDraftMenus();
    drafts[restaurantId] = menu;
    safeStorage.setItem(STORAGE_KEYS.MENUS_DRAFT, JSON.stringify(drafts));
    this.notify(restaurantId);
  }

  public saveDraftDish(restaurantId: string, dish: Dish) {
    const draft = this.getDraftMenu(restaurantId);
    const existingIndex = draft.dishes.findIndex((d) => d.id === dish.id);
    dish.restaurantId = restaurantId;
    dish.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      draft.dishes[existingIndex] = dish;
    } else {
      draft.dishes.push(dish);
    }

    // Ensure category includes dishId
    if (dish.categoryIds && dish.categoryIds.length > 0) {
      dish.categoryIds.forEach((catId) => {
        const cat = draft.categories.find((c) => c.id === catId);
        if (cat && !cat.dishIds.includes(dish.id)) {
          cat.dishIds.push(dish.id);
        }
      });
    }

    this.saveDraftMenu(restaurantId, draft);
  }

  public deleteDraftDish(restaurantId: string, dishId: string) {
    const draft = this.getDraftMenu(restaurantId);
    draft.dishes = draft.dishes.filter((d) => d.id !== dishId);
    draft.categories.forEach((cat) => {
      cat.dishIds = cat.dishIds.filter((id) => id !== dishId);
    });
    this.saveDraftMenu(restaurantId, draft);
  }

  public publishMenu(restaurantId: string, publishedBy: string = 'Manager'): MenuVersion {
    const draft = this.getDraftMenu(restaurantId);
    const published = this.getPublishedMenu(restaurantId);

    const newVersion: MenuVersion = {
      ...JSON.parse(JSON.stringify(draft)),
      version: (published.version || 1) + 1,
      publishedAt: new Date().toISOString(),
      publishedBy,
    };

    const pubs = this.getAllPublishedMenus();
    pubs[restaurantId] = newVersion;
    safeStorage.setItem(STORAGE_KEYS.MENUS_PUBLISHED, JSON.stringify(pubs));

    // Also sync draft version number
    draft.version = newVersion.version;
    this.saveDraftMenu(restaurantId, draft);

    this.notify(restaurantId);
    return newVersion;
  }

  public hasUnpublishedChanges(restaurantId: string): boolean {
    const draft = this.getDraftMenu(restaurantId);
    const pub = this.getPublishedMenu(restaurantId);

    if (draft.dishes.length !== pub.dishes.length) return true;
    if (draft.categories.length !== pub.categories.length) return true;

    // Check if any dish differs in price, name, or description
    for (const dDish of draft.dishes) {
      const pDish = pub.dishes.find((p) => p.id === dDish.id);
      if (!pDish) return true;
      if (pDish.price !== dDish.price) return true;
      if (pDish.name !== dDish.name) return true;
      if (pDish.description !== dDish.description) return true;
    }

    return false;
  }

  // -------------------------------------------------------------
  // Live Availability (86-List)
  // -------------------------------------------------------------
  public getAllAvailability(): Record<string, Record<string, DishAvailability>> {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.AVAILABILITY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public getAvailability(restaurantId: string): Record<string, DishAvailability> {
    const all = this.getAllAvailability();
    return all[restaurantId] || {};
  }

  public isDishAvailable(restaurantId: string, dishId: string): boolean {
    const availMap = this.getAvailability(restaurantId);
    const item = availMap[dishId];
    if (!item) return true;
    return item.status === 'available';
  }

  public setDishAvailability(
    restaurantId: string,
    dishId: string,
    status: AvailabilityStatus,
    duration?: number | 'today' | 'manual'
  ) {
    const all = this.getAllAvailability();
    if (!all[restaurantId]) {
      all[restaurantId] = {};
    }

    const availObj: DishAvailability = {
      dishId,
      status,
      temporaryUntil:
        duration === 'today'
          ? 'today'
          : typeof duration === 'number'
          ? new Date(Date.now() + duration * 60 * 1000).toISOString()
          : undefined,
      updatedAt: new Date().toISOString(),
    };

    all[restaurantId][dishId] = availObj;
    safeStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(all));
    this.notify(restaurantId);
  }

  // -------------------------------------------------------------
  // Live Order System & Anti-Tamper Pricing
  // -------------------------------------------------------------
  public getAllOrders(): LiveOrder[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getOrders(restaurantId: string): LiveOrder[] {
    return this.getAllOrders().filter((o) => o.restaurantId === restaurantId);
  }

  public getOrderById(restaurantId: string, orderId: string): LiveOrder | null {
    const orders = this.getOrders(restaurantId);
    return orders.find((o) => o.id === orderId) || null;
  }

  /**
   * Places an order with strict server-side price validation,
   * live stock availability checking, and duplicate prevention.
   */
  public createOrder(input: {
    restaurantId: string;
    tableNumber: string;
    tableId?: string;
    sessionId?: string;
    items: CartItem[];
    notes?: string;
    type?: 'digital_guest' | 'waiter_manual' | 'waiter_verbal';
    idempotencyKey?: string;
  }): { success: boolean; order?: LiveOrder; error?: string } {
    const { restaurantId, tableNumber, items, notes, type = 'digital_guest', idempotencyKey } = input;

    // 1. Duplicate check with idempotency key
    if (idempotencyKey) {
      if (this.submitLocks.has(idempotencyKey)) {
        return { success: false, error: 'Order is currently being placed. Please do not duplicate.' };
      }
      this.submitLocks.add(idempotencyKey);

      // Check if already placed
      const existing = this.getAllOrders().find((o) => o.idempotencyKey === idempotencyKey);
      if (existing) {
        this.submitLocks.delete(idempotencyKey);
        return { success: true, order: existing };
      }
    }

    try {
      // 2. Validate restaurant
      const restaurant = this.getRestaurantById(restaurantId);
      if (!restaurant) {
        return { success: false, error: 'Restaurant not found or inactive.' };
      }

      // 3. Validate items count
      if (!items || items.length === 0) {
        return { success: false, error: 'Cannot submit an empty order.' };
      }

      // 4. Validate published menu & real prices (anti-tamper)
      const publishedMenu = this.getPublishedMenu(restaurantId);
      let calculatedSubtotal = 0;
      const itemSnapshots: OrderItemSnapshot[] = [];
      const verifiedCartItems: CartItem[] = [];

      for (const item of items) {
        const dishId = item.dish.id;
        const verifiedDish = publishedMenu.dishes.find((d) => d.id === dishId);

        if (!verifiedDish) {
          return {
            success: false,
            error: `Dish "${item.dish.name}" is no longer on the published menu. Please refresh.`,
          };
        }

        // 5. Validate availability
        if (!this.isDishAvailable(restaurantId, dishId)) {
          return {
            success: false,
            error: `"${verifiedDish.name}" is currently sold out. Please remove it from your cart.`,
          };
        }

        // Use strictly server-side / published verified price
        const verifiedPrice = verifiedDish.price;
        calculatedSubtotal += verifiedPrice * item.quantity;

        itemSnapshots.push({
          dishId: verifiedDish.id,
          name: verifiedDish.name,
          price: verifiedPrice,
          quantity: item.quantity,
          notes: item.specialInstructions,
          spiceLevel: verifiedDish.spiceLevel,
        });

        verifiedCartItems.push({
          ...item,
          dish: verifiedDish,
        });
      }

      const serviceCharge = Math.round(calculatedSubtotal * 0.1);
      const total = calculatedSubtotal + serviceCharge;

      const orderNumber = `MES-${Math.floor(100 + Math.random() * 900)}`;
      const orderId = `ord-${Date.now()}`;
      const now = new Date().toISOString();

      const newOrder: LiveOrder = {
        id: orderId,
        orderNumber,
        restaurantId,
        tableId: input.tableId,
        tableNumber,
        sessionId: input.sessionId,
        items: verifiedCartItems,
        itemSnapshots,
        subtotal: calculatedSubtotal,
        serviceCharge,
        total,
        currency: restaurant.currency,
        status: 'SUBMITTED',
        createdAt: now,
        updatedAt: now,
        type,
        notes,
        idempotencyKey,
        paymentStatus: 'unpaid',
      };

      const allOrders = this.getAllOrders();
      allOrders.unshift(newOrder); // newest first
      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));

      if (idempotencyKey) {
        this.submitLocks.delete(idempotencyKey);
      }

      this.notify(restaurantId);
      return { success: true, order: newOrder };
    } finally {
      if (idempotencyKey) {
        this.submitLocks.delete(idempotencyKey);
      }
    }
  }

  public updateOrderStatus(
    restaurantId: string,
    orderId: string,
    status: OrderStateStatus,
    extra?: { serverAssigned?: string; rejectionReason?: string }
  ) {
    const allOrders = this.getAllOrders();
    const idx = allOrders.findIndex((o) => o.id === orderId && o.restaurantId === restaurantId);

    if (idx >= 0) {
      allOrders[idx] = {
        ...allOrders[idx],
        status,
        updatedAt: new Date().toISOString(),
        ...(extra?.serverAssigned ? { serverAssigned: extra.serverAssigned } : {}),
        ...(extra?.rejectionReason ? { rejectionReason: extra.rejectionReason } : {}),
      };

      safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
      this.notify(restaurantId);
    }
  }

  /**
   * Advances order status to PAID, recording simulated payment method and timestamp
   */
  public payOrder(
    restaurantId: string,
    orderId: string,
    method: 'telebirr' | 'cbe_birr' | 'card' | 'cash'
  ): { success: boolean; order?: LiveOrder; error?: string } {
    const allOrders = this.getAllOrders();
    const idx = allOrders.findIndex((o) => o.id === orderId && o.restaurantId === restaurantId);

    if (idx < 0) {
      return { success: false, error: 'Order not found' };
    }

    const now = new Date().toISOString();
    allOrders[idx] = {
      ...allOrders[idx],
      status: 'PAID',
      paymentStatus: 'paid',
      paymentMethod: method,
      paidAt: now,
      updatedAt: now,
    };

    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
    this.notify(restaurantId);
    return { success: true, order: allOrders[idx] };
  }

  // -------------------------------------------------------------
  // Analytics Summary
  // -------------------------------------------------------------
  public getAnalyticsSummary(restaurantId: string): AnalyticsSummary {
    const orders = this.getOrders(restaurantId);
    const tables = this.getTables(restaurantId);
    const avail = this.getAvailability(restaurantId);

    const activeOrders = orders.filter((o) => !['PAID', 'SERVED', 'CANCELLED', 'REJECTED'].includes(o.status));
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED');

    const revenueToday = validOrders.reduce((sum, o) => sum + o.total, 0);

    const activeTableNumbers = new Set(activeOrders.map((o) => o.tableNumber));
    const unavailableCount = Object.values(avail).filter((a) => a.status !== 'available').length;

    // Tally dish counts
    const dishTally: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (o.status !== 'CANCELLED' && o.status !== 'REJECTED') {
        o.items.forEach((item) => {
          const name = item.dish.name;
          if (!dishTally[name]) {
            dishTally[name] = { name, count: 0, revenue: 0 };
          }
          dishTally[name].count += item.quantity;
          dishTally[name].revenue += item.dish.price * item.quantity;
        });
      }
    });

    const topDishes = Object.values(dishTally)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ordersToday: orders.length,
      revenueToday,
      activeOrders: activeOrders.length,
      activeTables: activeTableNumbers.size,
      unavailableDishesCount: unavailableCount,
      topDishes,
    };
  }
}

export const restaurantRepo = RestaurantRepository.getInstance();
