import React from 'react';
import { useMesob } from '../../context/MesobContext';
import { X, CheckCircle2, UserCheck, Utensils, MessageSquare } from 'lucide-react';

export const ShowWaiterModal: React.FC = () => {
  const {
    isShowWaiterOpen,
    setIsShowWaiterOpen,
    cart,
    cartTotal,
    tableNumber,
    clearCart,
    navigateTo,
    formatPrice,
    getLocalizedDishName,
    activeOrders,
    updateOrderStatus,
  } = useMesob();

  if (!isShowWaiterOpen) return null;

  const serviceCharge = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + serviceCharge;

  const handleConfirmPlaced = () => {
    // If cart is empty, simply close
    if (cart.length === 0) {
      setIsShowWaiterOpen(false);
      return;
    }

    const orderNum = String(Math.floor(100 + Math.random() * 900));
    const nowIso = new Date().toISOString();

    const verbalOrder = {
      id: `ORD-VERBAL-${Date.now()}`,
      orderNumber: orderNum,
      tableNumber,
      items: [...cart],
      subtotal: cartTotal,
      serviceCharge,
      total: finalTotal,
      status: 'SUBMITTED' as const,
      createdAt: nowIso,
      updatedAt: nowIso,
      type: 'waiter_verbal' as const,
      notes: 'Order placed verbally directly with waiter at table',
      serverAssigned: 'Assigned Waiter',
    };

    // Store in active orders
    try {
      const existing = JSON.parse(localStorage.getItem('mesob_live_orders') || '[]');
      localStorage.setItem('mesob_live_orders', JSON.stringify([verbalOrder, ...existing]));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    clearCart();
    setIsShowWaiterOpen(false);
    navigateTo('/mesob/confirmation');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border-2 border-gold-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-slide-up space-y-5 text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-5 h-5 text-gold-400" />
            <span>Show to Waiter / ለጋባዥዎ ያሳዩ</span>
          </div>
          <button
            onClick={() => setIsShowWaiterOpen(false)}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Table & Total Badge */}
        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-gold-400 uppercase tracking-widest block font-semibold">
              Table / ጠረጴዛ
            </span>
            <span className="text-3xl font-display font-bold text-gold-300">
              {tableNumber}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
              Total / ድምር
            </span>
            <span className="text-2xl font-bold font-mono text-gold-300">
              {finalTotal} <span className="text-sm font-sans font-normal text-gold-400">ETB</span>
            </span>
            <span className="text-[10px] text-stone-400 block">incl. 5% service</span>
          </div>
        </div>

        {/* High-Contrast Large Item List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-6 text-stone-400 text-sm">
              Your cart is currently empty.
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 rounded-xl bg-obsidian-950 border border-stone-800 flex items-start justify-between gap-3 shadow-inner"
              >
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gold-500 text-obsidian-950 font-bold text-base flex items-center justify-center shrink-0">
                    {item.quantity}×
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-stone-100">
                      {getLocalizedDishName(item.dish)}
                    </h4>
                    {item.dish.amharicName && (
                      <p className="text-xs text-gold-400/90 font-serif">
                        {item.dish.amharicName}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span>{item.specialInstructions}</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm font-mono text-stone-300 font-semibold shrink-0">
                  {item.dish.price * item.quantity} ETB
                </span>
              </div>
            ))
          )}
        </div>

        {/* Friendly guidance note */}
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-400 text-center leading-relaxed">
          <p>
            Hold this screen up to your server. They will record your order instantly at your table.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleConfirmPlaced}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-obsidian-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark as Placed with Waiter</span>
          </button>
          <button
            onClick={() => setIsShowWaiterOpen(false)}
            className="w-full py-2.5 rounded-xl border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
