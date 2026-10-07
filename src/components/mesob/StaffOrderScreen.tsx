import React, { useState, useEffect } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  Bell,
  Clock,
  CheckCircle2,
  ChefHat,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  ArrowLeft,
  Utensils,
  Check,
  RotateCcw,
  Store,
} from 'lucide-react';
import { orderAudio } from '../../utils/orderAudio';
import { OrderStateStatus, LiveOrder } from '../../types/mesob';

export const StaffOrderScreen: React.FC = () => {
  const {
    activeOrders,
    updateOrderStatus,
    acceptOrder,
    markOrderPreparing,
    markOrderReady,
    markOrderServed,
    cancelOrder,
    navigateTo,
    setRoute,
    currentRestaurant,
  } = useMesob();

  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready' | 'history'>('new');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Item Sold Out');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // KDS 3-Stage Categorization
  const newOrders = activeOrders.filter(
    (o) => o.status === 'SUBMITTED' || o.status === 'RECEIVED'
  );

  const preparingOrders = activeOrders.filter(
    (o) => o.status === 'ACCEPTED' || o.status === 'PREPARING'
  );

  const readyOrders = activeOrders.filter((o) => o.status === 'READY');

  const historyOrders = activeOrders.filter(
    (o) => o.status === 'PAID' || o.status === 'SERVED' || o.status === 'CANCELLED' || o.status === 'REJECTED'
  );

  // Sound alert trigger when incoming unaccepted changes
  useEffect(() => {
    if (newOrders.length > 0 && soundEnabled) {
      orderAudio.playNewOrderChime();
    }
  }, [newOrders.length, soundEnabled]);

  const handleConfirmReject = (orderId: string) => {
    cancelOrder(orderId, rejectReason);
    setRejectingOrderId(null);
  };

  const getTimeElapsed = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1m ago';
    return `${mins}m ago`;
  };

  const renderOrderCard = (order: LiveOrder) => {
    const isNew = order.status === 'SUBMITTED' || order.status === 'RECEIVED';
    const isAccepted = order.status === 'ACCEPTED';
    const isPreparing = order.status === 'PREPARING';
    const isReady = order.status === 'READY';
    const isServed = order.status === 'SERVED';
    const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';

    return (
      <div
        key={order.id}
        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          isNew
            ? 'border-amber-500/80 bg-stone-900/90 shadow-md shadow-amber-500/10'
            : isReady
            ? 'border-emerald-500/60 bg-emerald-950/20'
            : isPreparing
            ? 'border-blue-500/50 bg-stone-900/80'
            : 'border-stone-800 bg-stone-900/70'
        }`}
      >
        {/* Order Top Bar: Table, Order Number, Time */}
        <div>
          <div className="flex items-start justify-between pb-2 border-b border-stone-800/80">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 font-bold font-mono text-sm">
                Table {order.tableNumber}
              </span>
              <div>
                <span className="font-mono text-xs font-semibold text-stone-200">
                  {order.orderNumber}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeElapsed(order.createdAt)}</span>
                  {order.type === 'waiter_manual' && (
                    <span className="px-1.5 py-0.2 rounded bg-stone-800 text-amber-300 font-sans">
                      Waiter Pad
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block border ${
                isNew
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : isPreparing || isAccepted
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : isReady
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : order.status === 'PAID'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : isServed
                  ? 'bg-stone-800 text-stone-300 border-stone-700'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Items List */}
          <div className="py-2.5 space-y-1.5 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex items-start gap-1.5 flex-1 min-w-0 pr-2">
                  <span className="font-mono font-bold text-amber-400 shrink-0">
                    {item.quantity}×
                  </span>
                  <div>
                    <span className="text-stone-200 font-medium">{item.dish.name}</span>
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-300/90 italic font-mono">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-mono text-stone-400 shrink-0">
                  {item.dish.price * item.quantity} {order.currency || 'ETB'}
                </span>
              </div>
            ))}
            {order.notes && (
              <div className="mt-2 p-2 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-300">
                <strong>Kitchen Note:</strong> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Operational Quick Actions */}
        <div className="pt-2 border-t border-stone-800 flex items-center gap-2 mt-2">
          {/* Action 1: NEW -> ACCEPT or REJECT */}
          {isNew && (
            <>
              <button
                onClick={() => acceptOrder(order.id)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>ACCEPT (START PREP)</span>
              </button>
              <button
                onClick={() => setRejectingOrderId(order.id)}
                className="px-3 py-2.5 rounded-xl bg-stone-900 border border-red-500/30 text-red-300 hover:bg-red-950/40 text-xs font-medium cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {/* Action 2: ACCEPTED -> PREPARING */}
          {isAccepted && (
            <button
              onClick={() => markOrderPreparing(order.id)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>START PREPARING</span>
            </button>
          )}

          {/* Action 3: PREPARING -> READY */}
          {isPreparing && (
            <button
              onClick={() => markOrderReady(order.id)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>MARK READY</span>
            </button>
          )}

          {/* Action 4: READY -> SERVED */}
          {isReady && (
            <button
              onClick={() => markOrderServed(order.id)}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>CONFIRM SERVED</span>
            </button>
          )}

          {(isServed || isCancelled || order.status === 'PAID') && (
            <div className="w-full text-center text-[11px] text-stone-500 font-mono py-1">
              {order.status === 'PAID'
                ? `✓ Paid (${order.paymentMethod?.toUpperCase() || 'PAID'}) & Settled`
                : isServed
                ? '✓ Completed & Served'
                : `✕ Cancelled: ${order.rejectionReason || 'No reason'}`}
            </div>
          )}
        </div>

        {/* Reject Reason Selector Popup */}
        {rejectingOrderId === order.id && (
          <div className="mt-3 p-3 rounded-xl bg-stone-950 border border-red-500/40 space-y-2 text-xs">
            <span className="font-semibold text-red-300 block">Select Rejection Reason:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {['Item Sold Out', 'Kitchen Too Busy', 'Table Error', 'Guest Cancelled'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={`p-1.5 rounded-lg border text-left text-[11px] cursor-pointer ${
                    rejectReason === r
                      ? 'border-red-400 bg-red-950/60 text-white'
                      : 'border-stone-800 text-stone-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="px-2.5 py-1 rounded bg-stone-900 text-stone-400 text-[10px]"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleConfirmReject(order.id)}
                className="px-3 py-1 rounded bg-red-600 text-white text-[10px] font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const restName =
    typeof currentRestaurant?.name === 'string'
      ? currentRestaurant.name
      : currentRestaurant?.name?.en || 'MESOB';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-28 pt-3 px-4 max-w-7xl mx-auto select-none font-sans">
      {/* Top KDS Bar */}
      <div className="flex items-center justify-between py-2 mb-4 border-b border-stone-800 flex-wrap gap-2">
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
            <span>Guest Menu</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="font-display text-lg text-amber-200 font-bold uppercase tracking-wider">
            Kitchen Display System (KDS)
          </h1>
          <span className="text-[10px] text-stone-400 font-mono">
            {restName} · Active Tickets
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => orderAudio.playNewOrderChime()}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-medium"
            title="Test audio chime"
          >
            🔔 Chime Test
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-stone-800 bg-stone-900 text-stone-500'
            }`}
            title={soundEnabled ? 'Audio alerts active' : 'Audio muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Flashing Alert for New Incoming Orders */}
      {newOrders.length > 0 && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-200 animate-pulse flex items-center justify-between shadow-lg shadow-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-300">
                {newOrders.length} New Order{newOrders.length > 1 ? 's' : ''} Received!
              </h3>
              <p className="text-[11px] text-amber-200/90">
                Table {newOrders.map((o) => o.tableNumber).join(', ')} waiting for kitchen confirmation.
              </p>
            </div>
          </div>
          <button
            onClick={() => orderAudio.playNewOrderChime()}
            className="px-2.5 py-1 rounded-lg bg-amber-500/40 border border-amber-400 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/60 cursor-pointer"
          >
            Replay Chime
          </button>
        </div>
      )}

      {/* 3-Column Desktop KDS Layout / Responsive Tabs */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {/* Column 1: NEW */}
        <div className="bg-stone-900/50 border border-amber-500/40 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm text-amber-200 uppercase tracking-wider">
                1. NEW ORDERS
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-amber-500 text-stone-950">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {newOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-500">
                No new incoming tickets.
              </div>
            ) : (
              newOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* Column 2: PREPARING */}
        <div className="bg-stone-900/50 border border-blue-500/40 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="font-bold text-sm text-blue-200 uppercase tracking-wider">
                2. PREPARING
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-blue-500 text-white">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-500">
                No orders currently in preparation.
              </div>
            ) : (
              preparingOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>

        {/* Column 3: READY */}
        <div className="bg-stone-900/50 border border-emerald-500/40 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-sm text-emerald-200 uppercase tracking-wider">
                3. READY TO SERVE
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-emerald-500 text-stone-950">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {readyOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-500">
                No tickets waiting for table delivery.
              </div>
            ) : (
              readyOrders.map((order) => renderOrderCard(order))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Segmented Queue Tabs (for phone screens) */}
      <div className="lg:hidden">
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-900/80 border border-stone-800 rounded-2xl mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'new'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>NEW</span>
            <span className="text-[10px] font-mono">({newOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preparing')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'preparing'
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>PREP</span>
            <span className="text-[10px] font-mono">({preparingOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'ready'
                ? 'bg-emerald-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>READY</span>
            <span className="text-[10px] font-mono">({readyOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'history'
                ? 'bg-stone-800 text-stone-100 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>DONE</span>
            <span className="text-[10px] font-mono">({historyOrders.length})</span>
          </button>
        </div>

        {/* Mobile Filtered List */}
        <div className="space-y-3.5">
          {activeTab === 'new' && (
            newOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                No new incoming tickets.
              </div>
            ) : (
              newOrders.map((order) => renderOrderCard(order))
            )
          )}

          {activeTab === 'preparing' && (
            preparingOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                No orders currently in preparation.
              </div>
            ) : (
              preparingOrders.map((order) => renderOrderCard(order))
            )
          )}

          {activeTab === 'ready' && (
            readyOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                No tickets waiting for delivery.
              </div>
            ) : (
              readyOrders.map((order) => renderOrderCard(order))
            )
          )}

          {activeTab === 'history' && (
            historyOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                No completed orders.
              </div>
            ) : (
              historyOrders.map((order) => renderOrderCard(order))
            )
          )}
        </div>
      </div>
    </div>
  );
};
