import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { ThermalPrinterAnimation } from './ThermalPrinterAnimation';
import { OrderState, CartItem } from '../../types/mesob';
import { mesobDishes } from '../../data/mesobData';

export const DigitalReceiptScreen: React.FC = () => {
  const {
    orderState,
    currentOrder,
    currentLiveOrder,
    setRoute,
    selectedLanguage,
    t,
    tableNumber,
    config,
  } = useMesob();

  // Active view: default to 'printer' so clicking Proceed immediately triggers the thermal printer & sound
  const [activeView, setActiveView] = useState<'printer' | 'card'>('printer');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [printSequenceKey, setPrintSequenceKey] = useState(0);

  // Provide realistic fallback matching reference Screen 10 if navigated without ordering
  const fallbackDishes: CartItem[] = [
    {
      id: 'item-doro',
      dish: config?.dishes?.find((d) => d.id === 'doro-wot') || mesobDishes[0],
      quantity: 1,
    },
    {
      id: 'item-injera',
      dish: config?.dishes?.find((d) => d.id === 'injera') || mesobDishes.find((d) => d.id === 'injera') || mesobDishes[1],
      quantity: 1,
    },
    {
      id: 'item-buna',
      dish: config?.dishes?.find((d) => d.id === 'ethiopian-coffee' || d.id === 'buna') || mesobDishes.find((d) => d.id === 'ethiopian-coffee') || mesobDishes[2],
      quantity: 1,
    },
  ];

  const activeItems =
    currentLiveOrder?.items && currentLiveOrder.items.length > 0
      ? currentLiveOrder.items
      : orderState.items && orderState.items.length > 0
      ? orderState.items
      : fallbackDishes;

  const activeTableNumber = currentLiveOrder?.tableNumber || orderState.tableNumber || tableNumber || '5';
  const activeOrderNum = currentLiveOrder?.orderNumber || orderState.orderId || 'MB3024';
  const activeCreatedAt = currentLiveOrder?.createdAt || (orderState.submittedAt ? orderState.submittedAt.toISOString() : new Date().toISOString());

  const calculatedSubtotal = activeItems.reduce(
    (acc, i) => acc + i.dish.price * i.quantity,
    0
  );
  const calculatedServiceCharge = currentLiveOrder?.serviceCharge ?? Math.round(calculatedSubtotal * 0.05);
  const calculatedTotal = currentLiveOrder?.total ?? (calculatedSubtotal + calculatedServiceCharge);

  const effectiveOrderState: OrderState = {
    items: activeItems,
    tableNumber: activeTableNumber,
    status: currentLiveOrder?.status || 'sent',
    orderId: activeOrderNum,
    submittedAt: new Date(activeCreatedAt),
    serverAssigned: currentLiveOrder?.serverAssigned || orderState.serverAssigned || 'Selamawit T.',
    trackingStep: 'served',
    estimatedMinutes: 'Delivered',
  };

  const order = {
    id: activeOrderNum,
    tableNumber: activeTableNumber,
    items: activeItems,
    status: (currentLiveOrder?.status || 'received') as any,
    trackingStep: 'served' as const,
    subtotal: calculatedSubtotal,
    serviceCharge: calculatedServiceCharge,
    total: calculatedTotal,
    createdAt: activeCreatedAt,
    estimatedMinutes: 'Delivered',
    paymentMethod: currentLiveOrder?.paymentMethod || 'Telebirr',
    paymentStatus: currentLiveOrder?.paymentStatus || 'paid',
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Mesob Ethiopian Restaurant Receipt #${order.id}`,
          text: `Digital Receipt for Table ${order.tableNumber} - Total: ${order.total} ETB`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    selectedLanguage === 'en' ? 'en-US' : 'en-GB',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const handleReplayThermalPrint = () => {
    setActiveView('printer');
    setPrintSequenceKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-stone-200 pb-28 pt-4 px-3 sm:px-4 max-w-md mx-auto relative select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between py-2 mb-3">
        <button
          onClick={() => setRoute('menu')}
          className="w-10 h-10 rounded-full border border-stone-800 bg-obsidian-900/80 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="font-display text-base tracking-widest text-gold-300 uppercase">
          {t('digitalReceipt')}
        </span>

        <button
          onClick={() =>
            setActiveView(activeView === 'printer' ? 'card' : 'printer')
          }
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            activeView === 'printer'
              ? 'border-gold-400 bg-gold-400/20 text-gold-300'
              : 'border-stone-800 bg-obsidian-900/80 text-stone-400 hover:text-white'
          }`}
          title={
            activeView === 'printer'
              ? 'Switch to Luxury Receipt Card'
              : 'Switch to Thermal Printer View'
          }
          aria-label="Toggle receipt view"
        >
          {activeView === 'printer' ? (
            <Receipt className="w-4 h-4" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Segmented View Switcher Pill */}
      <div className="flex items-center p-1 rounded-xl bg-obsidian-900/90 border border-stone-800 mb-4 text-xs">
        <button
          onClick={() => setActiveView('printer')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeView === 'printer'
              ? 'bg-gold-500 text-obsidian-950 shadow-md font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Thermal Printer</span>
        </button>
        <button
          onClick={() => setActiveView('card')}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeView === 'card'
              ? 'bg-gold-500 text-obsidian-950 shadow-md font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Digital Receipt</span>
        </button>
      </div>

      {copiedNotification && (
        <div className="mb-4 bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs px-3 py-2 rounded-lg text-center animate-fade-in">
          Receipt link copied to clipboard!
        </div>
      )}

      {/* VIEW 1: THERMAL PRINTER ANIMATION WITH AUTHENTIC AUDIO */}
      {activeView === 'printer' && (
        <div className="space-y-4 animate-fade-in">
          <ThermalPrinterAnimation
            key={printSequenceKey}
            orderState={effectiveOrderState}
            restaurantName="Mesob Ethiopian Restaurant"
            onOrderMore={() => setRoute('menu')}
            onReturnHome={() => setRoute('home')}
          />

          {/* Quick link to view digital luxury card */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveView('card')}
              className="text-xs text-gold-300/90 hover:text-gold-200 font-medium underline underline-offset-4 flex items-center justify-center gap-1.5 mx-auto"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View Luxury Digital Receipt Card</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: LUXURY DIGITAL RECEIPT PAPER CARD (SCREEN 10) */}
      {activeView === 'card' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Luxury Receipt Paper Card */}
          <div className="bg-[#12100E] border border-gold-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Subtle gold watermarked seal in background */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border-8 border-gold-500/5 pointer-events-none flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-gold-500/5" />
            </div>

            {/* Restaurant Header */}
            <div className="text-center pb-5 border-b border-stone-800/80">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full border border-gold-400/40 flex items-center justify-center bg-gold-500/10">
                <UtensilsCrossed className="w-5 h-5 text-gold-400" />
              </div>
              <h1 className="font-display text-xl tracking-[0.2em] text-gold-200 font-semibold uppercase">
                MESOB
              </h1>
              <p className="text-[10px] tracking-[0.25em] text-stone-400 uppercase mt-0.5">
                ETHIOPIAN RESTAURANT & LOUNGE
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Bole Road · Addis Ababa, Ethiopia
              </p>
              <div className="inline-block mt-3 px-3 py-1 rounded-full border border-stone-800 bg-obsidian-900/90 text-stone-400 text-[11px]">
                {formattedDate}
              </div>
            </div>

            {/* Receipt Metadata Row */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-stone-800/80 text-xs">
              <div>
                <span className="text-stone-500 block text-[10px] uppercase tracking-wider">
                  {t('orderNumber')}
                </span>
                <span className="font-medium text-stone-200 text-sm tracking-wide">
                  #{order.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block text-[10px] uppercase tracking-wider">
                  {t('tableNumber')}
                </span>
                <span className="font-medium text-stone-200 text-sm tracking-wide">
                  {t('table')} {order.tableNumber}
                </span>
              </div>
            </div>

            {/* Itemized Dish List */}
            <div className="py-4 space-y-3.5 border-b border-stone-800/80">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-xs"
                >
                  <div className="pr-3">
                    <div className="font-medium text-stone-200 flex items-center gap-1.5">
                      <span className="text-gold-400 font-semibold">
                        {item.quantity}x
                      </span>
                      <span className="font-display text-sm tracking-wide text-stone-100">
                        {item.dish.name}
                      </span>
                    </div>
                    {item.dish.amharicName && (
                      <span className="text-[10px] text-stone-500 block pl-5">
                        {item.dish.amharicName}
                      </span>
                    )}
                    {item.specialInstructions && (
                      <span className="text-[10px] text-stone-400 italic block pl-5 mt-0.5">
                        Note: {item.specialInstructions}
                      </span>
                    )}
                  </div>
                  <span className="text-stone-300 font-medium whitespace-nowrap">
                    {item.dish.price * item.quantity} ETB
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown (Subtotal, 5% Service, Total) */}
            <div className="py-4 space-y-2 text-xs border-b border-stone-800/80">
              <div className="flex justify-between text-stone-400">
                <span>{t('subtotal')}</span>
                <span>{order.subtotal} ETB</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span className="flex items-center gap-1">
                  {t('serviceCharge')}{' '}
                  <span className="text-[10px] text-stone-500">(5%)</span>
                </span>
                <span>{order.serviceCharge} ETB</span>
              </div>
              <div className="flex justify-between text-stone-100 text-base font-medium pt-2 text-gold-300">
                <span className="font-display tracking-wide">{t('total')}</span>
                <span className="font-semibold text-lg">{order.total} ETB</span>
              </div>
            </div>

            {/* Payment Status Badge */}
            <div className="pt-4 pb-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('paidVia')} Digital Concierge</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-3 italic font-serif">
                "{t('receiptThankYou')}"
              </p>
            </div>

            {/* Ornate Serrated / Perforated Receipt Cut Bottom Edge */}
            <div className="absolute -bottom-1 left-0 right-0 h-2 flex justify-between overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-obsidian-950 transform rotate-45 -translate-y-1.5 flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons: Replay Thermal Print, Download & Share */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-300 font-medium text-xs hover:bg-gold-500/20 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadReceipt')}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-800 bg-obsidian-900 text-stone-200 font-medium text-xs hover:bg-stone-800 active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('share')}</span>
            </button>
          </div>

          {/* Replay Thermal Print Simulation */}
          <button
            onClick={handleReplayThermalPrint}
            className="w-full py-3 px-4 rounded-xl border border-stone-800 bg-obsidian-900/90 hover:border-gold-500/40 text-gold-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Thermal Printer & Sound</span>
          </button>

          {/* Return to Menu Button */}
          <div>
            <button
              onClick={() => setRoute('menu')}
              className="w-full py-3.5 rounded-xl border border-stone-800/80 bg-obsidian-900/60 text-stone-400 text-xs font-medium hover:text-stone-200 hover:border-stone-700 transition-colors"
            >
              {t('backToMenu')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
