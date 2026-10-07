import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  Check,
  Clock,
  Receipt,
  UserCheck,
  AlertCircle,
  ChefHat,
  BellRing,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';

export const OrderConfirmationScreen: React.FC = () => {
  const {
    orderState,
    currentLiveOrder,
    navigateTo,
    advanceOrderTracking,
    t,
    setIsShowWaiterOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
  } = useMesob();

  const activeOrder = currentLiveOrder || orderState.activeLiveOrder;
  const status = activeOrder?.status || orderState.status || 'SUBMITTED';
  const orderId = activeOrder?.orderNumber || orderState.orderId || 'MB101';
  const table = activeOrder?.tableNumber || orderState.tableNumber || '5';
  const items = activeOrder?.items || orderState.items || [];
  const totalAmount = activeOrder?.total || orderState.items.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  ) || 840;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Status mapping
  let headline = 'Order Received!';
  let subheadline = "Waiting for restaurant staff to confirm your order...";
  let statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  let estimatedTime = 'Waiting for confirmation';
  let progressPercent = 20;

  if (status === 'SUBMITTED' || status === 'RECEIVED') {
    headline = 'Order Received';
    subheadline = 'Sent to restaurant staff. Awaiting confirmation...';
    estimatedTime = 'Staff confirming';
    progressPercent = 25;
  } else if (status === 'ACCEPTED') {
    headline = 'Order Accepted';
    subheadline = 'Restaurant staff accepted your order. Kitchen starting preparation.';
    estimatedTime = '12 – 15 min';
    statusBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    progressPercent = 45;
  } else if (status === 'PREPARING') {
    headline = 'Kitchen Preparing';
    subheadline = 'Chefs are currently preparing your fresh Ethiopian dishes.';
    estimatedTime = '8 – 12 min';
    statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    progressPercent = 70;
  } else if (status === 'READY') {
    headline = 'Ready to Serve!';
    subheadline = 'Your dishes are freshly plated and heading to your table.';
    estimatedTime = '1 – 2 min';
    statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    progressPercent = 95;
  } else if (status === 'SERVED') {
    headline = 'Order Served';
    subheadline = 'Dishes served at your table. Settle your bill or enjoy your meal!';
    estimatedTime = 'Served · Ready for payment';
    statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    progressPercent = 100;
  } else if (status === 'PAID') {
    headline = 'Order Paid & Settled';
    subheadline = 'Thank you for dining with Mesob. Your digital receipt is ready.';
    estimatedTime = 'Completed & Paid';
    statusBadge = 'bg-emerald-500 text-stone-950 font-bold border-emerald-400';
    progressPercent = 100;
  } else if (status === 'CANCELLED') {
    headline = 'Order Cancelled';
    subheadline = activeOrder?.rejectionReason || 'Please check with your server at the table.';
    estimatedTime = 'Cancelled';
    statusBadge = 'bg-red-500/20 text-red-300 border-red-500/30';
    progressPercent = 0;
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-stone-100 pb-28 pt-8 px-4 sm:px-8 max-w-md mx-auto flex flex-col justify-between select-none">
      {/* Top Confirmation Checkmark or Icon */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        {/* Ring status graphic */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-gold-400 flex items-center justify-center shadow-gold-glow animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/20 via-gold-600/10 to-transparent flex items-center justify-center">
              {status === 'READY' || status === 'SERVED' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 stroke-[2.5]" />
              ) : status === 'PREPARING' ? (
                <ChefHat className="w-10 h-10 text-gold-300 stroke-[2]" />
              ) : status === 'CANCELLED' ? (
                <AlertCircle className="w-10 h-10 text-red-400 stroke-[2]" />
              ) : (
                <BellRing className="w-10 h-10 text-gold-300 stroke-[2]" />
              )}
            </div>
          </div>
          <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl -z-10" />
        </div>

        {/* Order Status Text */}
        <div className="space-y-1.5 pt-2">
          <h1 className="text-3xl font-display font-bold text-white tracking-wide">
            {headline}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xs mx-auto leading-relaxed">
            {subheadline}
          </p>
        </div>
      </div>

      {/* Order Summary & Time Card */}
      <div className="space-y-5 my-6">
        {/* Order Identifier Pill */}
        <div className="p-4 rounded-2xl bg-obsidian-900/80 border border-gold-500/30 text-center space-y-1 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-mono font-bold block">
              Order #{orderId}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-stone-300 font-medium">
            {t('table', 'Table')} {table} • {itemCount} {t('itemsLabel', 'Items')} • {totalAmount} {t('currency', 'ETB')}
          </p>
        </div>

        {/* Estimated Time */}
        <div className="text-center space-y-1">
          <span className="text-xs text-stone-400 font-light tracking-wide uppercase">
            {t('estimatedTime', 'Estimated status')}
          </span>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 text-gold-400" />
            <span className="text-2xl font-bold font-display text-white">
              {estimatedTime}
            </span>
          </div>
        </div>

        {/* Live Stepper: Received -> Accepted -> Preparing -> Ready */}
        <div className="px-4 py-5 rounded-3xl bg-obsidian-900/60 border border-stone-800 space-y-4">
          <div className="relative flex items-center justify-between">
            {/* Connecting Track Line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-stone-800 -z-0">
              <div
                className="h-full bg-gold-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Step 1: Received */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                  progressPercent >= 25
                    ? 'bg-gold-400 text-obsidian-950 shadow-gold-glow'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-obsidian-950" />
              </div>
              <span className={`text-[10px] font-medium ${progressPercent >= 25 ? 'text-gold-300 font-bold' : 'text-stone-500'}`}>
                Received
              </span>
            </div>

            {/* Step 2: Preparing */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                  progressPercent >= 70
                    ? 'bg-gold-400 text-obsidian-950 shadow-gold-glow'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-obsidian-950" />
              </div>
              <span className={`text-[10px] font-medium ${progressPercent >= 70 ? 'text-gold-300 font-bold' : 'text-stone-500'}`}>
                Preparing
              </span>
            </div>

            {/* Step 3: Ready */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                  progressPercent >= 95
                    ? 'bg-emerald-400 text-obsidian-950 shadow-gold-glow'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-obsidian-950" />
              </div>
              <span className={`text-[10px] font-medium ${progressPercent >= 95 ? 'text-emerald-300 font-bold' : 'text-stone-500'}`}>
                Ready
              </span>
            </div>
          </div>

          {/* Real-time sync note */}
          <div className="pt-1 text-center">
            <span className="text-[11px] text-stone-400 block">
              ⚡ Status updates live when staff changes order state.
            </span>
            <button
              onClick={advanceOrderTracking}
              className="mt-1 text-[10px] text-gold-400 hover:text-gold-300 underline font-mono tracking-wide cursor-pointer"
            >
              Simulate next kitchen step →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2.5 pt-2">
        {/* Settle Bill / Payment CTA when SERVED */}
        {status === 'SERVED' && (
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full py-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-gold-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Bill (Simulated Payment) • {totalAmount} ETB</span>
          </button>
        )}

        {/* View Digital Receipt */}
        {(status === 'PAID' || status === 'SERVED') && (
          <button
            onClick={() => navigateTo('/mesob/receipt')}
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
              status === 'PAID'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
                : 'bg-obsidian-900 border border-stone-800 hover:border-gold-500/50 text-stone-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{status === 'PAID' ? 'View Paid Receipt & Print' : t('viewOrderDetails', 'View Digital Receipt')}</span>
          </button>
        )}

        {/* Table-side Fallback: Show Order to Waiter */}
        {status !== 'PAID' && (
          <button
            onClick={() => setIsShowWaiterOpen(true)}
            className="w-full py-3 rounded-xl bg-obsidian-900 hover:bg-obsidian-850 border border-stone-800 hover:border-gold-500/50 text-stone-200 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-gold-400" />
            <span>Show Order to Waiter / ለአስተናጋጅ አሳይ</span>
          </button>
        )}

        {/* Back to Menu Link */}
        <button
          onClick={() => navigateTo('/mesob/home')}
          className="w-full py-2 text-center text-xs text-stone-400 hover:text-gold-300 transition cursor-pointer"
        >
          {t('backToMenu', 'Back to Menu')}
        </button>
      </div>

      {/* Embedded Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentComplete={() => navigateTo('/mesob/receipt')}
      />
    </div>
  );
};