import React, { useState, useEffect, useRef } from 'react';
import { OrderState } from '../../types/mesob';
import {
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { printerAudio } from '../../utils/printerAudio';
import { useMesob } from '../../context/MesobContext';

interface ThermalPrinterAnimationProps {
  orderState: OrderState;
  restaurantName: string;
  onOrderMore: () => void;
  onReturnHome: () => void;
}

type PrintStage =
  | 'idle'           // 0 - 700ms: mechanical pause, motor warmup
  | 'feed-1'         // 700 - 1500ms: 800ms slow deliberate feed of header
  | 'pause-1'        // 1500 - 1720ms: 220ms tiny pause
  | 'feed-2'         // 1720 - 2420ms: 700ms feed of table callout & first dishes
  | 'pause-2'        // 2420 - 2640ms: 220ms tiny pause
  | 'feed-3'         // 2640 - 3310ms: 670ms feed of remaining items & notes
  | 'pause-3'        // 3310 - 3530ms: 220ms tiny pause
  | 'feed-4'         // 3530 - 4200ms: 670ms final feed to 100% (totals, barcode)
  | 'pause-final'    // 4200 - 4600ms: 400ms pause with ticket fully emerged
  | 'cut'            // 4600 - 4900ms: 300ms cutter blade activation
  | 'settled'        // 4900 - 5400ms: 500ms paper separated & settled
  | 'complete';      // 5400ms+: Order Received card appears

export const ThermalPrinterAnimation: React.FC<ThermalPrinterAnimationProps> = ({
  orderState,
  restaurantName,
  onOrderMore,
  onReturnHome,
}) => {
  const { t, getLocalizedDishName } = useMesob();
  const [stage, setStage] = useState<PrintStage>('idle');
  const [isVibrating, setIsVibrating] = useState(false);
  const [cutterActive, setCutterActive] = useState(false);
  const [paperSeparated, setPaperSeparated] = useState(false);
  const [ticketHeight, setTicketHeight] = useState<number>(520);
  const [isMuted, setIsMuted] = useState<boolean>(() => printerAudio.getMuted());

  const ticketRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const scheduleStep = (fn: () => void, delayMs: number) => {
    const timer = setTimeout(fn, delayMs);
    timersRef.current.push(timer);
  };

  // Measure actual height of the receipt dynamically
  useEffect(() => {
    const measure = () => {
      if (ticketRef.current) {
        const h = ticketRef.current.scrollHeight;
        if (h > 150) {
          setTicketHeight(h);
        }
      }
    };
    measure();
    const timer = setTimeout(measure, 60);
    return () => clearTimeout(timer);
  }, [orderState.items]);

  const runSequence = () => {
    clearAllTimers();
    setStage('idle');
    setIsVibrating(false);
    setCutterActive(false);
    setPaperSeparated(false);

    // 1. Startup click & mechanical engage (0ms)
    printerAudio.playStartupClick();

    // 2. Feed 1: Slow deliberate header feed (700ms - 1500ms)
    scheduleStep(() => {
      setStage('feed-1');
      setIsVibrating(true);
      printerAudio.startMotorFeed();
    }, 700);

    // 3. Pause 1 (1500ms): 220ms tiny motor pause
    scheduleStep(() => {
      setStage('pause-1');
      setIsVibrating(false);
      printerAudio.stopMotorFeed();
    }, 1500);

    // 4. Feed 2 (1720ms): 700ms feed (Table callout & first dishes)
    scheduleStep(() => {
      setStage('feed-2');
      setIsVibrating(true);
      printerAudio.startMotorFeed();
    }, 1720);

    // 5. Pause 2 (2420ms): 220ms tiny motor pause
    scheduleStep(() => {
      setStage('pause-2');
      setIsVibrating(false);
      printerAudio.stopMotorFeed();
    }, 2420);

    // 6. Feed 3 (2640ms): 670ms feed (remaining dishes & notes)
    scheduleStep(() => {
      setStage('feed-3');
      setIsVibrating(true);
      printerAudio.startMotorFeed();
    }, 2640);

    // 7. Pause 3 (3310ms): 220ms tiny motor pause
    scheduleStep(() => {
      setStage('pause-3');
      setIsVibrating(false);
      printerAudio.stopMotorFeed();
    }, 3310);

    // 8. Feed 4 (3530ms): 670ms final feed to 100% (totals & barcode)
    scheduleStep(() => {
      setStage('feed-4');
      setIsVibrating(true);
      printerAudio.startMotorFeed();
    }, 3530);

    // 9. Final brief pause before cut (4200ms): motor stops completely
    scheduleStep(() => {
      setStage('pause-final');
      setIsVibrating(false);
      printerAudio.stopMotorFeed();
    }, 4200);

    // 10. Cutter blade action (4600ms): mechanical cutter shear sound
    scheduleStep(() => {
      setStage('cut');
      setCutterActive(true);
      printerAudio.playCutterSound();
    }, 4600);

    // 11. Separation & weighted settling (4900ms): paper flutter/release sound
    scheduleStep(() => {
      setCutterActive(false);
      setPaperSeparated(true);
      setStage('settled');
      printerAudio.playPaperSettle();
    }, 4900);

    // 12. Complete confirmation reveals (5400ms)
    scheduleStep(() => {
      setStage('complete');
    }, 5400);
  };

  useEffect(() => {
    runSequence();

    return () => {
      clearAllTimers();
      printerAudio.cleanup();
    };
  }, []);

  const handleSkip = () => {
    clearAllTimers();
    printerAudio.stopMotorFeed();
    setStage('complete');
    setIsVibrating(false);
    setCutterActive(false);
    setPaperSeparated(true);
  };

  const handleReplay = () => {
    runSequence();
  };

  const handleToggleMute = () => {
    const next = printerAudio.toggleMute();
    setIsMuted(next);
  };

  // Compute paper visibility transform according to physical mechanical feed stage (UPWARD emergence)
  const getPaperTransform = () => {
    if (stage === 'idle') return 'translateY(100%)';
    if (stage === 'feed-1' || stage === 'pause-1') return 'translateY(75%)';
    if (stage === 'feed-2' || stage === 'pause-2') return 'translateY(50%)';
    if (stage === 'feed-3' || stage === 'pause-3') return 'translateY(25%)';
    if (stage === 'feed-4' || stage === 'pause-final' || stage === 'cut') return 'translateY(0%)';
    if (stage === 'settled' || stage === 'complete') return 'translateY(-8px) rotate(-0.5deg)';
    return 'translateY(0%)';
  };

  // Dynamic stepper motor easing
  const getTransitionStyle = () => {
    if (stage === 'feed-1') {
      // First feed: slow, deliberate 800ms feed so user clearly watches ticket begin
      return 'transform 800ms cubic-bezier(0.22, 0.9, 0.35, 1)';
    }
    if (stage === 'feed-2') {
      return 'transform 700ms cubic-bezier(0.25, 0.95, 0.4, 1)';
    }
    if (stage === 'feed-3') {
      return 'transform 670ms cubic-bezier(0.25, 0.95, 0.4, 1)';
    }
    if (stage === 'feed-4') {
      return 'transform 670ms cubic-bezier(0.2, 0.9, 0.3, 1)';
    }
    if (stage === 'settled') {
      return 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1)';
    }
    return 'transform 0ms linear';
  };

  const totalItemCount = orderState.items.reduce(
    (acc, i) => acc + i.quantity,
    0
  );
  const totalAmount = orderState.items.reduce(
    (acc, i) => acc + i.dish.price * i.quantity,
    0
  );

  const formattedTime = orderState.submittedAt
    ? orderState.submittedAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

  const formattedDate = orderState.submittedAt
    ? orderState.submittedAt.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 space-y-4">
      {/* Top Status & Controls */}
      <div className="flex items-center justify-between text-xs px-2">
        <div className="flex items-center gap-2 text-stone-400">
          <Printer className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">
            Kitchen Station 1 • Thermal Expediter
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mute / Unmute Audio Toggle */}
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 font-medium transition px-2 py-0.5 rounded-lg bg-stone-900/80 border border-stone-800"
            title={isMuted ? 'Unmute printer sound' : 'Mute printer sound'}
            aria-label={isMuted ? 'Unmute printer sound' : 'Mute printer sound'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline text-[10px]">
              {isMuted ? 'Muted' : 'Audio'}
            </span>
          </button>

          {stage !== 'complete' ? (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 font-medium transition"
            >
              <span>Skip</span>
              <SkipForward className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 font-medium transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Print</span>
            </button>
          )}
        </div>
      </div>

      {/* PRINTER ENCLOSURE & EMERGENCE STACK */}
      <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
        {/* BACK LAYER: Background shadow & guide frame */}
        <div className="absolute inset-0 bg-stone-950/40 rounded-3xl -z-10 blur-xl" />

        {/* 1. EMERGENCE CHAMBER (The clipped box directly above the slot) */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: `${ticketHeight}px` }}
        >
          {/* RECEIPT PAPER: Anchored to bottom, translates UPWARD */}
          <div
            ref={ticketRef}
            className="absolute bottom-0 inset-x-0 w-full will-change-transform"
            style={{
              transform: getPaperTransform(),
              transition: getTransitionStyle(),
              transformOrigin: 'bottom center',
            }}
          >
            {/* PHYSICAL RECEIPT PAPER */}
            <div className="bg-[#FAF7F2] text-stone-900 rounded-t-xl shadow-2xl shadow-black/80 p-5 font-mono text-[11px] leading-tight select-none border-x border-t border-stone-300 relative">
              {/* Paper Top Serrated Cut Line */}
              <div className="absolute -top-1 inset-x-0 h-2 flex justify-between overflow-hidden opacity-80">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-stone-950 rotate-45 transform -translate-y-1.5 shrink-0"
                  />
                ))}
              </div>

              {/* TICKET HEADER */}
              <div className="text-center pt-1 space-y-1 border-b border-dashed border-stone-400 pb-3">
                <div className="text-base font-black tracking-wider text-stone-950 font-sans">
                  {restaurantName.toUpperCase()}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest bg-stone-900 text-white px-2 py-0.5 rounded inline-block">
                  *** {t('kitchenOrder', 'KITCHEN ORDER')} ***
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-stone-700">
                  <span>{t('orderId', 'ORDER')}: #{orderState.orderId || 'MSB-8491'}</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-700">
                  <span>{t('timeLabel', 'TIME')}: {formattedTime}</span>
                  <span>EXPEDITE</span>
                </div>
              </div>

              {/* TABLE CALLOUT */}
              <div className="py-2.5 my-1.5 border-b border-stone-800 text-center bg-stone-200/60 rounded">
                <span className="text-[10px] text-stone-600 font-bold block">
                  DINE-IN LOCATION
                </span>
                <span className="text-xl font-black text-stone-950 font-sans tracking-wide">
                  {t('table', 'TABLE')} {orderState.tableNumber}
                </span>
                <span className="text-[10px] text-stone-600 block">
                  Server: {orderState.serverAssigned || 'Selamawit T.'}
                </span>
              </div>

              {/* ORDER ITEMS LIST */}
              <div className="py-2 space-y-2">
                <div className="flex justify-between font-bold border-b border-stone-300 pb-1 text-[10px] text-stone-600 uppercase">
                  <span>{t('itemsLabel', 'QTY / ITEM DESCRIPTION')}</span>
                  <span>{t('currency', 'ETB')}</span>
                </div>

                {orderState.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-start justify-between font-bold text-stone-950">
                      <span className="flex-1 pr-2">
                        <span className="text-amber-900 font-black mr-1.5 font-sans">
                          {item.quantity}X
                        </span>
                        <span>{getLocalizedDishName(item.dish).toUpperCase()}</span>
                      </span>
                      <span className="shrink-0 text-stone-800">
                        {item.dish.price * item.quantity} {t('currency', 'ETB')}
                      </span>
                    </div>

                    {/* Modifiers & Notes */}
                    {item.specialInstructions && (
                      <div className="text-[10px] text-stone-600 pl-5 italic">
                        &gt;&gt; NOTE: {item.specialInstructions}
                      </div>
                    )}
                    {item.dish.spiceLevel && item.dish.spiceLevel !== 'none' && (
                      <div className="text-[9px] text-stone-500 pl-5 uppercase">
                        [ SPICE: {item.dish.spiceLevel} ]
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* TICKET TOTALS */}
              <div className="pt-2 border-t border-dashed border-stone-400 space-y-1 text-[11px]">
                <div className="flex justify-between text-stone-700">
                  <span>{t('itemsLabel', 'TOTAL ITEMS')}:</span>
                  <span className="font-bold text-stone-950">
                    {totalItemCount}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-950 text-xs pt-1 border-t border-stone-300">
                  <span>{t('total', 'TOTAL')}:</span>
                  <span>{totalAmount} {t('currency', 'ETB')}</span>
                </div>
              </div>

              {/* FOOTER BARCODE & STATION */}
              <div className="text-center pt-3 border-t border-stone-300 mt-2 space-y-1.5">
                {/* Simulated barcode */}
                <div className="h-7 w-3/4 mx-auto flex items-stretch justify-between px-1 opacity-80">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-stone-900 ${
                        i % 3 === 0
                          ? 'w-1'
                          : i % 2 === 0
                          ? 'w-0.5'
                          : 'w-[1px]'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[9px] text-stone-500 tracking-widest">
                  * {orderState.orderId || 'MSB-8491'} *
                </div>
                <div className="text-[8px] text-stone-400">
                  *** END OF KITCHEN ORDER ***
                </div>
              </div>

              {/* Bottom Paper Serrated Edge */}
              <div className="absolute -bottom-1.5 inset-x-0 h-2 flex justify-between overflow-hidden opacity-90">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-stone-950 rotate-45 transform translate-y-1.5 shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FRONT LAYER: PRINTER FRONT PANEL + OUTPUT SLOT MOUTH (z-30) */}
        <div
          className={`relative z-30 w-full bg-gradient-to-b from-stone-800 via-stone-850 to-stone-900 rounded-2xl border border-stone-700 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 -mt-3 transition-transform duration-75 ${
            isVibrating ? 'animate-printer-hum' : ''
          } ${cutterActive ? 'animate-solenoid-snap' : ''}`}
        >
          {/* Thermal Paper Output Slot Mouth */}
          <div className="relative mx-auto w-full bg-stone-950 rounded-lg border border-stone-800 h-5 flex items-center justify-center overflow-hidden shadow-[inset_0_3px_8px_rgba(0,0,0,0.95)] mb-3">
            {/* Stainless steel tear bar guide teeth */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-stone-600 via-stone-400 to-stone-600 opacity-80" />

            {/* Cutter Blade Flash Line */}
            {cutterActive && (
              <div className="absolute inset-x-0 h-1.5 bg-cyan-300 animate-cutter-flash z-40 shadow-[0_0_12px_#67e8f9]" />
            )}

            {/* Paper feed mouth indicator */}
            <div className="w-5/6 h-0.5 bg-black/90 shadow-[inset_0_1px_3px_rgba(0,0,0,1)]" />
          </div>

          {/* Top Hardware Info & Status LEDs */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[11px] text-stone-300 tracking-wider">
                STAR-KITCHEN // POS-80
              </span>
            </div>

            {/* LED Status Indicators */}
            <div className="flex items-center gap-3">
              {/* Power LED */}
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-[9px] font-mono text-stone-400">PWR</span>
              </div>

              {/* Status / Feed LED */}
              <div className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                    stage === 'complete' || stage === 'settled'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : stage === 'idle'
                      ? 'bg-amber-400/40'
                      : 'bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]'
                  }`}
                />
                <span className="text-[9px] font-mono text-stone-400">
                  {stage === 'complete' || stage === 'settled'
                    ? 'READY'
                    : stage === 'idle'
                    ? 'STANDBY'
                    : 'FEED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION CARD (Reveals after ticket print completes) */}
      <div
        className={`transition-all duration-700 ease-out ${
          stage === 'complete'
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-6 pointer-events-none'
        }`}
      >
        <div className="p-6 rounded-3xl bg-gradient-to-b from-stone-900/95 to-stone-950 border border-emerald-500/40 shadow-2xl text-center space-y-4">
          {/* Green Check Icon */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          {/* Text Required by PRD Section 10 */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
              <span>✓ {t('orderReceived', 'ORDER RECEIVED')}</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              {t('orderSentMessage', 'Your order has been sent to the kitchen.')}
            </h2>
          </div>

          {/* Order ID & Preparing Status */}
          <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
            <span className="text-xs font-mono font-bold text-amber-300">
              {t('orderId', 'Order')} #{orderState.orderId || 'MSB-8491'}
            </span>
            <div className="flex items-center justify-center gap-2 text-stone-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{t('preparingOrder', 'Preparing your order...')}</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-0.5">
              {t('table', 'Table')} {orderState.tableNumber} • Server: {orderState.serverAssigned || 'Selamawit T.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOrderMore}
              className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold transition"
            >
              {t('order', 'Order')} +
            </button>
            <button
              onClick={onReturnHome}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition shadow-md"
            >
              {t('home', 'Return Home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
