import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  UserCheck,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';
import { printerAudio } from '../../utils/printerAudio';

export const OrderScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    tableNumber,
    submitOrder,
    setRoute,
    config,
    addToCart,
    formatPrice,
    currency,
    t,
    getLocalizedDishName,
    isDishAvailable,
    isOnline,
    setIsShowWaiterOpen,
  } = useMesob();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if any items in the cart are sold out
  const soldOutItemsInCart = cart.filter((item) => !isDishAvailable(item.dish.id));
  const hasSoldOutItems = soldOutItemsInCart.length > 0;

  // Bill breakdown with 5% service charge matching reference Screens 8, 9 & 10
  const serviceCharge = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + serviceCharge;

  const subtotalFormatted = formatPrice(cartTotal);
  const serviceFormatted = formatPrice(serviceCharge);
  const finalTotalFormatted = formatPrice(finalTotal);

  const handleSendOrder = async () => {
    if (hasSoldOutItems) {
      setErrorMessage('Please remove sold out items from your cart before sending your order.');
      return;
    }
    if (!isOnline) {
      setErrorMessage('Your order has not been sent. You are currently in offline mode.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      // Warm up and play startup mechanical impulse on user gesture
      printerAudio.playStartupClick();
      await submitOrder();
    } catch (err: any) {
      console.error('Order submit error:', err);
      if (err.message === 'OFFLINE_CANNOT_SUBMIT') {
        setErrorMessage('Your order has not been sent. Network connection unavailable.');
      } else if (err.message && err.message.startsWith('SOLD_OUT_ITEMS:')) {
        const itemNames = err.message.replace('SOLD_OUT_ITEMS:', '');
        setErrorMessage(`The kitchen just sold out of: ${itemNames}. Please adjust your cart.`);
      } else {
        setErrorMessage(err.message || 'Your order has not been sent. Unable to connect to kitchen.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to load exact sample order matching reference:
  // Doro Wot (580 ETB) + Injera (80 ETB) + Coffee/Buna (220 ETB) = 880 ETB subtotal, Total 924 ETB
  const handleLoadSampleOrder = () => {
    clearCart();
    const doro = config.dishes.find((d) => d.id === 'doro-wot');
    const injera = config.dishes.find((d) => d.id === 'injera');
    const buna = config.dishes.find((d) => d.id === 'buna');
    if (doro) addToCart(doro, 1);
    if (injera) addToCart(injera, 1);
    if (buna) addToCart(buna, 1);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-stone-100 pb-28 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Top Header Row matching Screen 8 */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={() => setRoute('menu')}
          className="w-10 h-10 rounded-full border border-stone-800 bg-obsidian-900/80 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-xl text-gold-300 tracking-wider font-semibold uppercase">
            {t('yourOrder')}
          </h1>
          <span className="text-[11px] text-stone-400 font-mono">
            {t('table')} {tableNumber}
          </span>
        </div>
        {cart.length > 0 ? (
          <button
            onClick={clearCart}
            className="w-10 h-10 rounded-full border border-stone-800 bg-obsidian-900/80 flex items-center justify-center text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Clear Cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-300">Offline / Low Connectivity</span>
            <span>Digital submission is temporarily paused. Use <strong>Show to Waiter</strong> below to place your order directly.</span>
          </div>
        </div>
      )}

      {/* Sold Out Alert Banner */}
      {hasSoldOutItems && (
        <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-semibold block text-red-300">Items Sold Out in Kitchen</span>
            <span>
              {soldOutItemsInCart.map((i) => i.dish.name).join(', ')} is currently unavailable. Please remove it from your cart to proceed.
            </span>
          </div>
        </div>
      )}

      {/* Error Message with Offline Action Fallbacks */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-red-950/70 border border-red-500/60 text-xs text-red-200 space-y-2.5 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-semibold text-red-100">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-stone-400 hover:text-stone-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSendOrder}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-[11px] transition shadow"
            >
              Retry Order
            </button>
            <button
              onClick={() => setIsShowWaiterOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] transition shadow"
            >
              Show to Waiter
            </button>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="py-16 px-6 rounded-3xl bg-obsidian-900/40 border border-stone-800/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-obsidian-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-600">
            <ShoppingBag className="w-7 h-7 text-gold-400/40" />
          </div>
          <div>
            <h3 className="font-display text-xl font-medium text-stone-200">
              {t('emptyOrderTitle')}
            </h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              {t('emptyOrderSubtitle')}
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            <button
              onClick={() => setRoute('menu')}
              className="py-3 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-semibold shadow-md shadow-gold-500/20 transition-all cursor-pointer"
            >
              {t('viewFullMenu')}
            </button>
            <button
              onClick={handleLoadSampleOrder}
              className="py-2.5 px-4 rounded-xl border border-stone-800 bg-obsidian-900 text-gold-300 text-xs font-medium hover:border-gold-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Reference Sample Order</span>
            </button>
          </div>
        </div>
      ) : (
        /* Cart List and Bill Breakdown matching reference Screen 8 */
        <div className="space-y-4">
          {/* Cart Item Rows */}
          <div className="space-y-2.5">
            {cart.map((item) => {
              const isAvailable = isDishAvailable(item.dish.id);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl bg-obsidian-900/80 border transition-all ${
                    !isAvailable
                      ? 'border-red-500/60 bg-red-950/20'
                      : 'border-stone-800/80'
                  } flex items-center justify-between gap-3 shadow-sm`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.dish.image}
                      alt={item.dish.name}
                      className={`w-14 h-14 rounded-xl object-cover shrink-0 border ${
                        !isAvailable ? 'border-red-500/40 opacity-60' : 'border-stone-800'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-sm font-medium text-stone-100 truncate">
                          {getLocalizedDishName(item.dish)}
                        </h4>
                        {!isAvailable && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider shrink-0">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xs text-gold-300 font-semibold block">
                          {formatPrice(item.dish.price * item.quantity).primary}
                        </span>
                        {formatPrice(item.dish.price).isConverted && (
                          <span className="text-[10px] text-stone-400">
                            ({item.dish.price * item.quantity} ETB)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls [- 1 +] or Remove if Sold Out */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-stone-800 bg-obsidian-950 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-semibold text-xs text-stone-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={!isAvailable}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add more items button matching reference */}
          <button
            onClick={() => setRoute('menu')}
            className="w-full py-2.5 rounded-xl border border-dashed border-stone-800 hover:border-gold-500/40 text-stone-400 hover:text-gold-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add more items</span>
          </button>

          {/* Financial Breakdown Card */}
          <div className="p-4 rounded-2xl bg-obsidian-900/60 border border-stone-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-stone-400">
              <span>{t('subtotal')}</span>
              <div className="text-right">
                <span className="text-stone-200 font-medium">{subtotalFormatted.primary}</span>
                {subtotalFormatted.isConverted && (
                  <span className="text-[10px] text-stone-500 block">({cartTotal} ETB)</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-stone-400">
              <span className="flex items-center gap-1">
                {t('serviceCharge')} <span className="text-[10px] text-stone-500">(5%)</span>
              </span>
              <div className="text-right">
                <span className="text-stone-200">{serviceFormatted.primary}</span>
                {serviceFormatted.isConverted && (
                  <span className="text-[10px] text-stone-500 block">({serviceCharge} ETB)</span>
                )}
              </div>
            </div>
            <div className="pt-2.5 border-t border-stone-800 flex items-baseline justify-between text-stone-100">
              <div>
                <span className="font-display text-base tracking-wide text-gold-200 font-medium block">
                  {t('total')}
                </span>
                {finalTotalFormatted.isConverted && (
                  <span className="text-[10px] text-stone-400 block font-sans">
                    Settled at table: {finalTotal} ETB
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-display text-gold-300 block">
                  {finalTotalFormatted.primary}
                </span>
                {finalTotalFormatted.isConverted && (
                  <span className="text-xs font-mono text-stone-400 font-normal">
                    {finalTotal} ETB
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Currency Info Note */}
          {currency !== 'ETB' && (
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 text-center">
              💡 Foreign currency is shown for your convenience. Your physical or POS payment will be in Ethiopian Birr ({finalTotal} ETB).
            </div>
          )}

          {/* DUAL PATH CHECKOUT CTAs */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Action: Send Order to Kitchen */}
            <button
              onClick={handleSendOrder}
              disabled={isSubmitting || hasSoldOutItems}
              className="w-full py-4 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-lg shadow-gold-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Sending to Kitchen...</span>
              ) : hasSoldOutItems ? (
                <span>Remove Sold Out Items</span>
              ) : (
                <>
                  <span>Send Order to Kitchen ({finalTotalFormatted.primary})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Secondary Action: Show to Waiter (Verbal/Offline Fallback) */}
            <button
              onClick={() => setIsShowWaiterOpen(true)}
              className="w-full py-3.5 px-5 rounded-xl border border-stone-800 bg-obsidian-900/90 hover:bg-obsidian-800 text-stone-200 hover:text-gold-300 text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-gold-400" />
              <span>Show to Waiter / ለጋባዥዎ ያሳዩ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};