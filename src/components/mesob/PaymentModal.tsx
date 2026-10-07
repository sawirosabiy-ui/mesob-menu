import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Receipt,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PaymentMethod } from '../../types/mesob';
import { printerAudio } from '../../utils/printerAudio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
}) => {
  const {
    currentLiveOrder,
    payOrder,
    formatPrice,
    setRoute,
    navigateTo,
  } = useMesob();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen || !currentLiveOrder) return null;

  const orderTotal = currentLiveOrder.total;
  const table = currentLiveOrder.tableNumber;
  const orderNumber = currentLiveOrder.orderNumber;

  const paymentOptions: { id: PaymentMethod; name: string; icon: any; note: string; color: string }[] = [
    {
      id: 'telebirr',
      name: 'Telebirr (ቴሌብር)',
      icon: Smartphone,
      note: 'Instant QR / Mobile Wallet',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'cbe_birr',
      name: 'CBE Birr (ንግድ ባንክ)',
      icon: Smartphone,
      note: 'Commercial Bank Mobile',
      color: 'from-purple-600 to-violet-500',
    },
    {
      id: 'card',
      name: 'Debit / Credit Card (POS)',
      icon: CreditCard,
      note: 'Visa, Mastercard, EthSwitch',
      color: 'from-amber-600 to-yellow-500',
    },
    {
      id: 'cash',
      name: 'Cash at Table',
      icon: Banknote,
      note: 'Settle directly with your server',
      color: 'from-emerald-600 to-teal-500',
    },
  ];

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    printerAudio.playStartupClick();

    // Simulated network processing delay
    setTimeout(() => {
      payOrder(currentLiveOrder.id, selectedMethod);
      setIsProcessing(false);
      setPaymentSuccess(true);

      // Auto route to digital receipt after celebration
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
        if (onPaymentComplete) {
          onPaymentComplete();
        } else {
          navigateTo('/mesob/receipt');
        }
      }, 1200);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
      <div className="bg-stone-900 border-2 border-gold-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-slide-up space-y-4 text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              Simulation Mode
            </span>
            <span className="font-display text-sm font-bold text-stone-100">
              Settle Table Bill
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 text-center space-y-1">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-widest block">
            Table {table} · Order #{orderNumber}
          </span>
          <div className="font-display text-3xl font-bold text-gold-300">
            {formatPrice(orderTotal).primary}
          </div>
          <span className="text-[11px] text-stone-500 block">
            Includes food, beverages & 5% service charge
          </span>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block px-1">
            Choose Payment Method:
          </span>

          <div className="grid grid-cols-1 gap-2">
            {paymentOptions.map((opt) => {
              const isSelected = selectedMethod === opt.id;
              const Icon = opt.icon;

              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedMethod(opt.id)}
                  disabled={isProcessing}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-gold-400 bg-gold-500/15 shadow-md scale-[1.01]'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${opt.color} shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-100">{opt.name}</div>
                      <div className="text-[10px] text-stone-400">{opt.note}</div>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-gold-400 bg-gold-400 text-stone-950'
                        : 'border-stone-700'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulation Notice */}
        <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-[10px] text-stone-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Simulated payment advances order to <strong>PAID</strong> and generates your thermal digital receipt.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcessPayment}
          disabled={isProcessing || paymentSuccess}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            paymentSuccess
              ? 'bg-emerald-500 text-stone-950'
              : 'bg-gold-500 hover:bg-gold-400 text-stone-950 shadow-gold-500/20 active:scale-98'
          }`}
        >
          {paymentSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Payment Confirmed! Printing Receipt...</span>
            </>
          ) : isProcessing ? (
            <span>Authorizing Payment...</span>
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              <span>Complete Payment ({formatPrice(orderTotal).primary})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
