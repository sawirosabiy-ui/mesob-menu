import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ArrowLeft,
  Plus,
  Minus,
  Check,
  Search,
  CheckCircle2,
  Trash2,
  FileText,
  UserCheck,
  ShoppingBag,
  Clock,
  Store,
  QrCode,
} from 'lucide-react';
import { CartItem, Dish, Table, LiveOrder } from '../../types/mesob';
import { restaurantRepo } from '../../services/restaurantRepository';

type WaiterTab = 'tables' | 'new_order' | 'active_orders';

export const WaiterOrderMode: React.FC = () => {
  const {
    activeRestaurantId,
    config,
    isDishAvailable,
    submitWaiterOrder,
    navigateTo,
    setRoute,
    activeOrders,
    currentRestaurant,
  } = useMesob();

  const [activeTab, setActiveTab] = useState<WaiterTab>('new_order');
  const [selectedTable, setSelectedTable] = useState<string>('1');
  const [items, setItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [submittedOrderNum, setSubmittedOrderNum] = useState<string>('');

  const tables = restaurantRepo.getTables(activeRestaurantId);
  const tableNumbers = tables.length > 0 ? tables.map((t) => t.tableNumber) : ['1', '2', '3', '4', '5'];

  const filteredDishes = config.dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.amharicName && d.amharicName.includes(search))
  );

  const handleAddDish = (dish: Dish) => {
    if (!isDishAvailable(dish.id)) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.dish.id === dish.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: `waiter-item-${dish.id}-${Date.now()}`,
          dish,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQty = (dishId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((i) => {
          if (i.dish.id === dishId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter((i): i is CartItem => Boolean(i));
    });
  };

  const subtotal = items.reduce((acc, i) => acc + i.dish.price * i.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.1);
  const total = subtotal + serviceCharge;

  const handleSubmit = async () => {
    if (items.length === 0) return;
    try {
      const order = await submitWaiterOrder(selectedTable, items, orderNotes);
      setSubmittedOrderNum(order.orderNumber);
      setIsSuccess(true);
      setItems([]);
      setOrderNotes('');
      setTimeout(() => {
        setIsSuccess(false);
      }, 3500);
    } catch (e: any) {
      alert(`Error submitting order: ${e.message}`);
    }
  };

  const restName =
    typeof currentRestaurant?.name === 'string'
      ? currentRestaurant.name
      : currentRestaurant?.name?.en || 'MESOB';

  const tableActiveOrders = activeOrders.filter((o) => o.tableNumber === selectedTable);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 pt-3 px-4 max-w-lg mx-auto select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2 mb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoute('portal')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Manager</span>
          </button>
          <button
            onClick={() => setRoute('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 hover:text-white text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="font-display text-base text-amber-200 font-bold uppercase tracking-wider">
            Waiter Order Pad
          </h1>
          <span className="text-[10px] text-stone-400 font-mono">
            {restName} · Server Fast Entry
          </span>
        </div>

        <button
          onClick={() => setRoute('staff-queue')}
          className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold cursor-pointer"
        >
          KDS Queue
        </button>
      </div>

      {/* 3 Main Waiter Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-stone-900 border border-stone-800 rounded-2xl mb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tables')}
          className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'tables'
              ? 'bg-amber-500 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>TABLES</span>
        </button>

        <button
          onClick={() => setActiveTab('new_order')}
          className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'new_order'
              ? 'bg-amber-500 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NEW ORDER</span>
        </button>

        <button
          onClick={() => setActiveTab('active_orders')}
          className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'active_orders'
              ? 'bg-amber-500 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>ACTIVE ({activeOrders.length})</span>
        </button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200 flex items-center gap-2.5 animate-slide-up shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-emerald-300">
              Order #{submittedOrderNum} Sent to Kitchen!
            </h4>
            <p className="text-[11px] text-emerald-200/90">
              Dispatched for Table {selectedTable}. Check KDS queue.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: TABLES VIEW */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="text-xs text-stone-400">
            Select a table to view active tickets or begin a new order:
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tableNumbers.map((tbl) => {
              const activeCount = activeOrders.filter((o) => o.tableNumber === tbl && !['SERVED', 'CANCELLED', 'REJECTED'].includes(o.status)).length;
              const isSelected = selectedTable === tbl;

              return (
                <button
                  key={tbl}
                  onClick={() => {
                    setSelectedTable(tbl);
                    setActiveTab('new_order');
                  }}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-lg scale-105'
                      : activeCount > 0
                      ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <span className="text-sm font-mono font-bold">Table {tbl}</span>
                  {activeCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
                      {activeCount} active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: NEW ORDER (TABLE-SIDE ORDER PAD) */}
      {activeTab === 'new_order' && (
        <div className="space-y-4">
          {/* Table Selector Quick Bar */}
          <div>
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-1">
              Active Table:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {tableNumbers.map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setSelectedTable(tbl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono shrink-0 transition-all ${
                    selectedTable === tbl
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                      : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-white'
                  }`}
                >
                  T-{tbl}
                </button>
              ))}
            </div>
          </div>

          {/* Current Table Order Summary Tray */}
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-xs font-semibold">
              <span className="text-amber-300 font-bold">
                Table {selectedTable} Tray ({items.reduce((a, i) => a + i.quantity, 0)} items)
              </span>
              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  className="text-stone-500 hover:text-red-400 text-[11px] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                Tap items below to add dishes to Table {selectedTable}'s order.
              </p>
            ) : (
              <div className="py-2 space-y-2">
                {items.map((item) => (
                  <div key={item.dish.id} className="flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="text-stone-200 font-medium truncate block">
                        {item.dish.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {item.dish.price * item.quantity} {item.dish.currency || 'ETB'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 p-0.5 rounded-lg border border-stone-800">
                      <button
                        onClick={() => handleUpdateQty(item.dish.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold font-mono text-amber-300 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.dish.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-xs">
                  <span className="text-stone-400">Total (incl. 10% service):</span>
                  <span className="font-bold font-mono text-amber-300 text-sm">
                    {total} {config.branding.currency}
                  </span>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Kitchen note (e.g. extra spicy, rush, no butter)..."
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Send Table {selectedTable} Order to Kitchen</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Dish Search & Catalog */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dish or category..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredDishes.map((dish) => {
                const available = isDishAvailable(dish.id);
                return (
                  <button
                    key={dish.id}
                    disabled={!available}
                    onClick={() => handleAddDish(dish)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                      available
                        ? 'bg-stone-900/60 border-stone-800 hover:bg-stone-800/80 active:scale-[0.99] cursor-pointer'
                        : 'bg-stone-950/60 border-stone-900 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-stone-200 truncate">
                        {dish.name}
                      </div>
                      <div className="text-[10px] text-stone-400 line-clamp-1">
                        {dish.tagline || dish.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {dish.price} {dish.currency || 'ETB'}
                      </span>
                      {available ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
                          +
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-400 font-mono">Sold Out</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE ORDERS */}
      {activeTab === 'active_orders' && (
        <div className="space-y-3">
          <div className="text-xs text-stone-400">
            Live tickets across dining rooms for {restName}:
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-stone-900 rounded-2xl border border-stone-800">
              No active orders right now.
            </div>
          ) : (
            activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                    <span className="bg-stone-950 px-2 py-0.5 rounded font-bold text-stone-200">
                      Table {ord.tableNumber}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                      ord.status === 'SUBMITTED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : ord.status === 'PREPARING'
                        ? 'bg-blue-500/20 text-blue-300'
                        : ord.status === 'READY'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-1">
                  {ord.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-stone-300">
                      <span>{i.quantity}x {i.dish.name}</span>
                      <span className="font-mono text-stone-400">{i.dish.price * i.quantity} ETB</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-800 flex justify-between font-mono font-bold text-stone-200">
                  <span>Total:</span>
                  <span>{ord.total} ETB</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
