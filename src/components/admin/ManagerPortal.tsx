import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  QrCode,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Eye,
  Send,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Flame,
  Salad,
  Sun,
  Printer,
} from 'lucide-react';
import { restaurantRepo } from '../../services/restaurantRepository';
import { MenuImportWizard } from './MenuImportWizard';
import {
  Restaurant,
  Dish,
  Category,
  Table,
  LiveOrder,
  OrderStateStatus,
  AvailabilityStatus,
  SpiceHeatLevel,
  CurrencyCode,
} from '../../types/mesob';

interface ManagerPortalProps {
  onSwitchToGuest?: (restaurantSlug: string, tableToken?: string) => void;
  onSwitchToKitchen?: () => void;
  onSwitchToWaiter?: () => void;
}

type TabType =
  | 'overview'
  | 'menu'
  | 'orders'
  | 'tables'
  | 'availability'
  | 'analytics'
  | 'staff'
  | 'settings'
  | 'import_wizard';

export const ManagerPortal: React.FC<ManagerPortalProps> = ({
  onSwitchToGuest,
  onSwitchToKitchen,
  onSwitchToWaiter,
}) => {
  const [activeRestaurantId, setActiveRestaurantId] = useState<string>(
    restaurantRepo.getActiveRestaurantId()
  );
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Trigger re-render on repo updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = restaurantRepo.subscribe(activeRestaurantId, () => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, [activeRestaurantId]);

  const restaurant = restaurantRepo.getRestaurantById(activeRestaurantId);
  const allRestaurants = restaurantRepo.getAllRestaurants();
  const draftMenu = restaurantRepo.getDraftMenu(activeRestaurantId);
  const publishedMenu = restaurantRepo.getPublishedMenu(activeRestaurantId);
  const tables = restaurantRepo.getTables(activeRestaurantId);
  const orders = restaurantRepo.getOrders(activeRestaurantId);
  const availability = restaurantRepo.getAvailability(activeRestaurantId);
  const analytics = restaurantRepo.getAnalyticsSummary(activeRestaurantId);
  const hasChanges = restaurantRepo.hasUnpublishedChanges(activeRestaurantId);

  // Modals & form state
  const [isEditingDishModalOpen, setIsEditingDishModalOpen] = useState(false);
  const [dishToEdit, setDishToEdit] = useState<Partial<Dish> | null>(null);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [menuViewMode, setMenuViewMode] = useState<'draft' | 'published'>('draft');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('active');

  // New table form
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');

  // Switch restaurant
  const handleSelectRestaurant = (id: string) => {
    setActiveRestaurantId(id);
    restaurantRepo.setActiveRestaurantId(id);
  };

  // Publish draft menu
  const handlePublishMenu = () => {
    if (confirm('Publish all draft changes to the live customer menu?')) {
      restaurantRepo.publishMenu(activeRestaurantId, 'Manager Admin');
    }
  };

  // Add / Edit Dish in Draft
  const handleSaveDish = (dish: Partial<Dish>) => {
    if (!dish.name || !dish.price) {
      alert('Please provide a name and price for the dish.');
      return;
    }

    const fullDish: Dish = {
      id: dish.id || `dish-${Date.now()}`,
      restaurantId: activeRestaurantId,
      name: dish.name,
      description: dish.description || '',
      price: dish.price,
      currency: restaurant?.currency || 'ETB',
      categoryIds: dish.categoryIds && dish.categoryIds.length > 0 ? dish.categoryIds : ['traditional'],
      image: dish.image || '/images/dishes/Tibs.jpg',
      tags: dish.tags || ['Traditional'],
      spiceLevel: dish.spiceLevel || 'mild',
      isFasting: dish.isFasting || false,
      isVegetarian: dish.isFasting || dish.isVegetarian || false,
      isSignature: dish.isSignature || false,
      availability: 'available',
      updatedAt: new Date().toISOString(),
    };

    restaurantRepo.saveDraftDish(activeRestaurantId, fullDish);
    setIsEditingDishModalOpen(false);
    setDishToEdit(null);
  };

  // Delete Dish from Draft
  const handleDeleteDish = (dishId: string) => {
    if (confirm('Remove this dish from the draft menu?')) {
      restaurantRepo.deleteDraftDish(activeRestaurantId, dishId);
    }
  };

  // Quick toggle availability
  const handleSetAvailability = (dishId: string, status: AvailabilityStatus) => {
    restaurantRepo.setDishAvailability(activeRestaurantId, dishId, status);
  };

  // Order status update
  const handleOrderStatusUpdate = (orderId: string, status: OrderStateStatus) => {
    restaurantRepo.updateOrderStatus(activeRestaurantId, orderId, status);
  };

  // Add Table
  const handleCreateNewTable = () => {
    if (!newTableNumber.trim()) return;
    restaurantRepo.createTable(activeRestaurantId, newTableNumber.trim(), newTableName.trim() || undefined);
    setNewTableNumber('');
    setNewTableName('');
    setIsNewTableModalOpen(false);
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold font-display">No Restaurant Selected</h2>
          <p className="text-xs text-stone-400">
            Please create or select an active restaurant to manage.
          </p>
          <button
            onClick={() => setActiveTab('import_wizard')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
          >
            Launch Onboarding Wizard
          </button>
        </div>
      </div>
    );
  }

  const restaurantName =
    typeof restaurant.name === 'string' ? restaurant.name : restaurant.name.en;

  const currentDisplayDishes =
    menuViewMode === 'draft' ? draftMenu.dishes : publishedMenu.dishes;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-900/90 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
            {restaurant.logo || '👑'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-amber-100 leading-tight">
                {restaurantName}
              </h1>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Manager Portal
              </span>
            </div>
            <div className="text-xs text-stone-400 font-mono">
              /r/{restaurant.slug} · Base: {restaurant.currency}
            </div>
          </div>
        </div>

        {/* Tenant Switcher & Quick Role Links */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tenant Selector Dropdown */}
          <select
            value={activeRestaurantId}
            onChange={(e) => {
              if (e.target.value === '__new__') {
                setActiveTab('import_wizard');
              } else {
                handleSelectRestaurant(e.target.value);
              }
            }}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500"
          >
            {allRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {typeof r.name === 'string' ? r.name : r.name.en} ({r.slug})
              </option>
            ))}
            <option value="__new__">+ Create New Restaurant...</option>
          </select>

          {/* Quick jump to Guest View */}
          {onSwitchToGuest && (
            <button
              onClick={() => onSwitchToGuest(restaurant.slug, tables[0]?.token || 't1')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold transition"
              title="Preview menu as a dining guest"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Guest View</span>
            </button>
          )}

          {/* Jump to KDS */}
          {onSwitchToKitchen && (
            <button
              onClick={onSwitchToKitchen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-terracotta-400" />
              <span className="hidden sm:inline">Kitchen (KDS)</span>
            </button>
          )}

          {/* Jump to Waiter Pad */}
          {onSwitchToWaiter && (
            <button
              onClick={onSwitchToWaiter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Waiter Pad</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Body with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-stone-900/60 border-r border-stone-800 p-2 sm:p-4 shrink-0 flex md:flex-col justify-start gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'menu', label: 'Menu & Draft', icon: UtensilsCrossed },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, count: analytics.activeOrders },
            { id: 'tables', label: 'Tables & QR', icon: QrCode },
            { id: 'availability', label: 'Live Stock (86)', icon: Sparkles, count: analytics.unavailableDishesCount },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'staff', label: 'Staff & Roles', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'import_wizard', label: 'Import Wizard', icon: UploadCloud },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isCurrent
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isCurrent
                        ? 'bg-stone-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Unpublished Changes Banner */}
              {hasChanges && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="font-bold text-xs text-amber-200">
                        You have unpublished draft menu edits
                      </div>
                      <div className="text-[11px] text-amber-300/80">
                        Customers are still seeing version {publishedMenu.version}. Click publish to make changes live.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePublishMenu}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Publish Changes Now</span>
                  </button>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <div className="text-xs text-stone-400 flex items-center justify-between">
                    <span>Today's Orders</span>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-100 mt-2">
                    {analytics.ordersToday}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    {analytics.activeOrders} in progress
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <div className="text-xs text-stone-400 flex items-center justify-between">
                    <span>Today's Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-100 mt-2">
                    {analytics.revenueToday.toLocaleString()} {restaurant.currency}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono mt-1">
                    Subtotal + 10% Service
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <div className="text-xs text-stone-400 flex items-center justify-between">
                    <span>Active Tables</span>
                    <QrCode className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-100 mt-2">
                    {analytics.activeTables} / {tables.length}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono mt-1">
                    Seated dining rooms
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <div className="text-xs text-stone-400 flex items-center justify-between">
                    <span>Unavailable (86'd)</span>
                    <Sparkles className="w-4 h-4 text-terracotta-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-stone-100 mt-2">
                    {analytics.unavailableDishesCount}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono mt-1">
                    Dishes currently shut off
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-3">
                  Quick Operational Actions
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('import_wizard')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition shadow"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Import New Menu</span>
                  </button>

                  <button
                    onClick={() => {
                      setDishToEdit({});
                      setIsEditingDishModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 font-semibold text-xs border border-stone-700 transition"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add Dish to Draft</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tables')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    <span>Manage Tables & QRs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('availability')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Live Stock Manager</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>View Orders ({orders.length})</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    Recent Customer & Waiter Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-stone-400">
                    No orders submitted yet for this restaurant.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 flex items-center justify-between flex-wrap gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                          <span className="font-bold text-stone-200 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                            Table {ord.tableNumber}
                          </span>
                          <span className="text-stone-400">
                            {ord.items.map((i) => `${i.quantity}x ${i.dish.name}`).join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-100">
                            {ord.total} {restaurant.currency}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                              ord.status === 'SUBMITTED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : ord.status === 'PREPARING'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : ord.status === 'READY'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : ord.status === 'SERVED'
                                ? 'bg-stone-800 text-stone-400'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MENU & DRAFT MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {/* Draft vs Published Switcher & Publish Button */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-stone-950 p-1 border border-stone-800">
                    <button
                      onClick={() => setMenuViewMode('draft')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        menuViewMode === 'draft'
                          ? 'bg-amber-500 text-stone-950 font-bold shadow'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Draft Menu ({draftMenu.dishes.length})
                    </button>
                    <button
                      onClick={() => setMenuViewMode('published')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        menuViewMode === 'published'
                          ? 'bg-emerald-500 text-stone-950 font-bold shadow'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      Published v{publishedMenu.version} ({publishedMenu.dishes.length})
                    </button>
                  </div>

                  {hasChanges && (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unpublished Edits</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDishToEdit({});
                      setIsEditingDishModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold border border-stone-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Dish</span>
                  </button>

                  <button
                    onClick={handlePublishMenu}
                    disabled={!hasChanges}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-stone-950 font-bold text-xs shadow transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Publish Changes</span>
                  </button>
                </div>
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDisplayDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex gap-3.5 items-start justify-between"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 shrink-0 border border-stone-800">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-sm text-stone-100 truncate">{dish.name}</h4>
                        <span className="font-mono font-bold text-xs text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800 shrink-0">
                          {dish.price} {restaurant.currency}
                        </span>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2">{dish.description}</p>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                        {dish.isFasting && (
                          <span className="bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Fasting / Vegan
                          </span>
                        )}
                        {dish.isSignature && (
                          <span className="bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/40">
                            Signature
                          </span>
                        )}
                        <span className="text-stone-400 capitalize">
                          Spice: {dish.spiceLevel}
                        </span>
                      </div>
                    </div>

                    {menuViewMode === 'draft' && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setDishToEdit(dish);
                            setIsEditingDishModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
                          title="Edit draft dish"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400"
                          title="Delete from draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      orderFilter === 'active' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                    }`}
                  >
                    Active Orders ({orders.filter((o) => !['SERVED', 'CANCELLED', 'REJECTED'].includes(o.status)).length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      orderFilter === 'completed' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                    }`}
                  >
                    Completed ({orders.filter((o) => o.status === 'SERVED').length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      orderFilter === 'all' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                    }`}
                  >
                    All History ({orders.length})
                  </button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-400 bg-stone-900 rounded-2xl border border-stone-800">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => {
                      if (orderFilter === 'active') return !['SERVED', 'CANCELLED', 'REJECTED'].includes(o.status);
                      if (orderFilter === 'completed') return o.status === 'SERVED';
                      return true;
                    })
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-base text-amber-300">
                              {ord.orderNumber}
                            </span>
                            <span className="bg-stone-950 border border-stone-800 px-2 py-0.5 rounded text-xs font-bold text-stone-100">
                              Table {ord.tableNumber}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-stone-100">
                              Total: {ord.total} {restaurant.currency}
                            </span>

                            <div className="flex gap-1">
                              {ord.status === 'SUBMITTED' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(ord.id, 'ACCEPTED')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                                >
                                  Accept
                                </button>
                              )}
                              {ord.status === 'ACCEPTED' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(ord.id, 'PREPARING')}
                                  className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold text-xs"
                                >
                                  Preparing
                                </button>
                              )}
                              {ord.status === 'PREPARING' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(ord.id, 'READY')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs"
                                >
                                  Ready
                                </button>
                              )}
                              {ord.status === 'READY' && (
                                <button
                                  onClick={() => handleOrderStatusUpdate(ord.id, 'SERVED')}
                                  className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs"
                                >
                                  Mark Served
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                              <div>
                                <span className="font-bold text-amber-300 mr-2">{item.quantity}x</span>
                                <span className="text-stone-200">{item.dish.name}</span>
                                {item.specialInstructions && (
                                  <div className="text-[10px] text-amber-400 italic mt-0.5">
                                    "{item.specialInstructions}"
                                  </div>
                                )}
                              </div>
                              <span className="font-mono text-stone-400">
                                {item.dish.price * item.quantity} {restaurant.currency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TABLES & QR MANAGEMENT */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <div>
                  <h3 className="font-bold text-sm text-stone-100">Restaurant Tables & QR Routing</h3>
                  <p className="text-xs text-stone-400">
                    Each table has a permanent token. Scanning directs customers directly to your live menu.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewTableModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Table</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((tbl) => {
                  const url = `/r/${restaurant.slug}/t/${tbl.token}`;

                  return (
                    <div
                      key={tbl.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-center space-y-3"
                    >
                      <div className="w-20 h-20 bg-white p-1.5 rounded-xl mx-auto flex items-center justify-center text-stone-950 shadow-md">
                        <QrCode className="w-16 h-16" />
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-stone-100">{tbl.name}</h4>
                        <div className="text-[11px] font-mono text-amber-400 truncate mt-0.5">
                          {url}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTableForQR(tbl)}
                          className="flex-1 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition"
                        >
                          View QR Card
                        </button>

                        {onSwitchToGuest && (
                          <button
                            onClick={() => onSwitchToGuest(restaurant.slug, tbl.token)}
                            className="flex-1 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                          >
                            Open Guest
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: AVAILABILITY (86-LIST) */}
          {activeTab === 'availability' && (
            <div className="space-y-4">
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <h3 className="font-bold text-sm text-stone-100">1-Tap Live Stock Manager (86-List)</h3>
                <p className="text-xs text-stone-400">
                  Instantly shut off dishes the kitchen ran out of. Changes propagate immediately to all dining guests.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {publishedMenu.dishes.map((dish) => {
                  const status = availability[dish.id]?.status || 'available';

                  return (
                    <div
                      key={dish.id}
                      className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-100 truncate">{dish.name}</div>
                        <div className="text-[11px] text-stone-400 font-mono">
                          {dish.price} {restaurant.currency}
                        </div>
                      </div>

                      {/* 3-State Toggle Pill */}
                      <div className="flex gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0 text-[10px] font-bold">
                        <button
                          onClick={() => handleSetAvailability(dish.id, 'available')}
                          className={`px-2 py-1 rounded-lg transition ${
                            status === 'available'
                              ? 'bg-emerald-500 text-stone-950'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Available
                        </button>

                        <button
                          onClick={() => handleSetAvailability(dish.id, 'temporary_unavailable')}
                          className={`px-2 py-1 rounded-lg transition ${
                            status === 'temporary_unavailable'
                              ? 'bg-amber-500 text-stone-950'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Temp (30m)
                        </button>

                        <button
                          onClick={() => handleSetAvailability(dish.id, 'sold_out')}
                          className={`px-2 py-1 rounded-lg transition ${
                            status === 'sold_out'
                              ? 'bg-red-500 text-stone-950'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          Sold Out
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="text-xs text-stone-400">Total Orders Placed</div>
                  <div className="text-3xl font-bold font-mono text-amber-300 mt-2">
                    {analytics.ordersToday}
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="text-xs text-stone-400">Gross Sales Volume</div>
                  <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">
                    {analytics.revenueToday.toLocaleString()} {restaurant.currency}
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="text-xs text-stone-400">Average Order Value (AOV)</div>
                  <div className="text-3xl font-bold font-mono text-stone-100 mt-2">
                    {analytics.ordersToday > 0
                      ? Math.round(analytics.revenueToday / analytics.ordersToday)
                      : 0}{' '}
                    {restaurant.currency}
                  </div>
                </div>
              </div>

              {/* Top Selling Dishes */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-xs text-stone-300 uppercase tracking-wider">
                  Top Ordered Dishes
                </h3>
                {analytics.topDishes.length === 0 ? (
                  <div className="text-xs text-stone-400">No dishes ordered yet.</div>
                ) : (
                  <div className="space-y-2">
                    {analytics.topDishes.map((d, i) => (
                      <div key={i} className="flex justify-between items-center bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">#{i + 1}</span>
                          <span className="font-bold text-stone-200">{d.name}</span>
                        </div>
                        <div className="font-mono text-stone-300">
                          {d.count} ordered · {d.revenue} {restaurant.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: STAFF & ROLES */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <h3 className="font-bold text-sm text-stone-100">Staff & Role Access</h3>
                <p className="text-xs text-stone-400">
                  Floor waiters use the Waiter Pad. Kitchen expediter uses the Kitchen Display System (KDS).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase">Manager</div>
                  <div className="text-xs text-stone-300">
                    Full control over branding, menu editing, pricing, tables, and analytics.
                  </div>
                  <div className="text-xs font-mono text-stone-400">PIN: 1234 (Demo)</div>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-terracotta-400 uppercase">Kitchen Chef</div>
                  <div className="text-xs text-stone-300">
                    Dedicated ticket queue (New, Preparing, Ready) with audible arrival chimes.
                  </div>
                  <button
                    onClick={onSwitchToKitchen}
                    className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-amber-300"
                  >
                    Open Kitchen Screen
                  </button>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase">Floor Server</div>
                  <div className="text-xs text-stone-300">
                    Rapid table-side POS ordering pad with 1-tap dish counters.
                  </div>
                  <button
                    onClick={onSwitchToWaiter}
                    className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-emerald-300"
                  >
                    Open Waiter Pad
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 max-w-2xl">
              <h3 className="font-bold text-base text-stone-100">Restaurant Settings & Identity</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    defaultValue={restaurantName}
                    onBlur={(e) => {
                      restaurantRepo.saveRestaurant({ ...restaurant, name: e.target.value });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Menu URL Slug</label>
                  <input
                    type="text"
                    defaultValue={restaurant.slug}
                    onBlur={(e) => {
                      restaurantRepo.saveRestaurant({ ...restaurant, slug: e.target.value });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-amber-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Phone</label>
                  <input
                    type="text"
                    defaultValue={restaurant.phone}
                    onBlur={(e) => {
                      restaurantRepo.saveRestaurant({ ...restaurant, phone: e.target.value });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Address</label>
                  <input
                    type="text"
                    defaultValue={typeof restaurant.address === 'string' ? restaurant.address : restaurant.address.en}
                    onBlur={(e) => {
                      restaurantRepo.saveRestaurant({ ...restaurant, address: e.target.value });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ONBOARDING IMPORT WIZARD */}
          {activeTab === 'import_wizard' && (
            <MenuImportWizard
              onComplete={(newId) => {
                setActiveRestaurantId(newId);
                setActiveTab('overview');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT DISH IN DRAFT */}
      {isEditingDishModalOpen && dishToEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-amber-200">
                {dishToEdit.id ? 'Edit Draft Dish' : 'Add New Dish to Draft'}
              </h3>
              <button
                onClick={() => {
                  setIsEditingDishModalOpen(false);
                  setDishToEdit(null);
                }}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={dishToEdit.name || ''}
                  onChange={(e) => setDishToEdit({ ...dishToEdit, name: e.target.value })}
                  placeholder="e.g. Special Lamb Tibs"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Price ({restaurant.currency}) *</label>
                <input
                  type="number"
                  value={dishToEdit.price || ''}
                  onChange={(e) =>
                    setDishToEdit({ ...dishToEdit, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g. 680"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 font-mono text-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={dishToEdit.description || ''}
                  onChange={(e) => setDishToEdit({ ...dishToEdit, description: e.target.value })}
                  placeholder="Tender lamb sautéed with rosemary and sweet onions..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Spice Level</label>
                  <select
                    value={dishToEdit.spiceLevel || 'mild'}
                    onChange={(e) =>
                      setDishToEdit({ ...dishToEdit, spiceLevel: e.target.value as SpiceHeatLevel })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild (Alicha)</option>
                    <option value="medium">Medium</option>
                    <option value="spicy">Spicy (Berbere)</option>
                    <option value="extra-spicy">Extra Spicy (Mitmita)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={dishToEdit.isFasting || false}
                      onChange={(e) =>
                        setDishToEdit({
                          ...dishToEdit,
                          isFasting: e.target.checked,
                          isVegetarian: e.target.checked,
                        })
                      }
                      className="rounded text-amber-500 bg-stone-950 border-stone-800"
                    />
                    <span className="text-stone-300 font-semibold">Fasting / Vegan</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditingDishModalOpen(false);
                  setDishToEdit(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDish(dishToEdit)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow"
              >
                Save to Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TABLE */}
      {isNewTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-amber-200">Create Dining Table</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Table Number *</label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Label Name (Optional)</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Balcony Table 7"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsNewTableModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewTable}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PRINTABLE TABLE QR CARD */}
      {selectedTableForQR && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="font-bold text-xs text-amber-400 uppercase tracking-widest">
                Printable Table QR Card
              </span>
              <button
                onClick={() => setSelectedTableForQR(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl text-stone-950 space-y-3 shadow-inner">
              <div className="text-2xl font-bold font-display">{restaurantName}</div>
              <div className="w-36 h-36 bg-stone-100 p-2 rounded-xl mx-auto flex items-center justify-center border border-stone-300">
                <QrCode className="w-32 h-32 text-stone-900" />
              </div>
              <div>
                <div className="font-bold text-lg">{selectedTableForQR.name}</div>
                <div className="text-[11px] text-stone-600 font-mono">
                  Scan to View Menu & Order
                </div>
              </div>
              <div className="text-[10px] text-stone-500 font-mono border-t border-stone-200 pt-2">
                /r/{restaurant.slug}/t/{selectedTableForQR.token}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
