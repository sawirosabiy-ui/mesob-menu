import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import { 
  X, Globe, Moon, Sun, Smartphone, Info, 
  HelpCircle, Sparkles, Check, ChevronRight, Award,
  Bell, Wifi, MapPin, Clock, Phone, Receipt, Utensils, UserCheck
} from 'lucide-react';
import { Language } from '../../types/mesob';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({ isOpen, onClose }) => {
  const { 
    selectedLanguage, 
    setLanguage, 
    theme, 
    toggleTheme, 
    currency,
    setCurrency,
    currencies,
    tableNumber, 
    setTableNumber,
    config,
    t,
    setRoute
  } = useMesob();

  const [simulatedTable, setSimulatedTable] = useState<string>(String(tableNumber || '5'));
  const [tableSaved, setTableSaved] = useState(false);
  const [serverCalled, setServerCalled] = useState(false);

  if (!isOpen) return null;

  const languages: { code: Language; name: string; native: string; flag: string }[] = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'ti', name: 'Tigrigna', native: 'ትግርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromo', native: 'Afaan Oromoo', flag: '🇪🇹' },
  ];

  const handleSaveTable = () => {
    setTableNumber(String(simulatedTable));
    setTableSaved(true);
    setTimeout(() => setTableSaved(false), 2000);
  };

  const handleCallServer = () => {
    setServerCalled(true);
    setTimeout(() => setServerCalled(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-charcoal-950 border-t border-stone-800 rounded-t-3xl p-6 text-stone-200 max-h-[88vh] overflow-y-auto shadow-2xl relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Pill / Handle */}
        <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mb-4 opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="font-display text-xl text-gold-300 font-semibold tracking-wide">
              {t('more', 'Dining Concierge & Services')}
            </h2>
            <p className="text-xs text-stone-400 font-light">{config.branding.name} · Table {tableNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-charcoal-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Hospitality Actions: Call Server & Wi-Fi */}
        <div className="py-4 border-b border-stone-800/80 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCallServer}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
              serverCalled
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                : 'border-stone-800 bg-charcoal-900/80 text-stone-200 hover:border-gold-500/40 active:scale-95'
            }`}
          >
            <Bell className={`w-5 h-5 ${serverCalled ? 'text-emerald-400 animate-bounce' : 'text-gold-400'}`} />
            <span>{serverCalled ? 'Server Notified!' : 'Call Server / Water'}</span>
          </button>

          <div className="p-3 rounded-2xl border border-stone-800 bg-charcoal-900/80 flex flex-col items-center justify-center gap-1 text-center">
            <Wifi className="w-5 h-5 text-gold-400 mb-0.5" />
            <span className="text-[11px] font-medium text-stone-200">Guest Wi-Fi</span>
            <span className="text-[10px] text-stone-400 font-mono">Mesob_Guest · 2026</span>
          </div>
        </div>

        {/* Section 1: Appearance & Theme */}
        <div className="py-4 border-b border-stone-800/80">
          <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block mb-2.5">
            {t('theme', 'Atmosphere & Theme')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'dark' 
                  ? 'border-gold-500/60 bg-gold-500/15 text-gold-300 shadow-sm font-semibold' 
                  : 'border-stone-800 bg-charcoal-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>{t('darkMode', 'Deep Charcoal (Dark)')}</span>
            </button>
            <button
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                theme === 'light' 
                  ? 'border-gold-500/60 bg-gold-500/15 text-gold-300 shadow-sm font-semibold' 
                  : 'border-stone-800 bg-charcoal-900 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>{t('lightMode', 'Warm Ivory (Light)')}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Currency Preference (ETB, USD, EUR, GBP) */}
        <div className="py-4 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
              Display Currency
            </label>
            <span className="text-[10px] text-stone-500 font-mono">Bill payable in ETB</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currencies?.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  currency === curr.code
                    ? 'border-gold-500/60 bg-gold-500/15 text-gold-200 font-semibold'
                    : 'border-stone-800/80 bg-charcoal-900/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{curr.flag}</span>
                  <div>
                    <span className="text-xs block leading-tight font-medium">{curr.code}</span>
                    <span className="text-[9px] text-stone-500 leading-none">{curr.name}</span>
                  </div>
                </div>
                {currency === curr.code && (
                  <Check className="w-3.5 h-3.5 text-gold-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Language Selector (4 Languages) */}
        <div className="py-4 border-b border-stone-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gold-400" />
            <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
              {t('language', 'Language')}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-gold-500/60 bg-gold-500/15 text-gold-200 font-semibold'
                    : 'border-stone-800/80 bg-charcoal-900/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div>
                  <span className="text-xs block">{lang.native}</span>
                  <span className="text-[10px] text-stone-500 font-light">{lang.name}</span>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-4 h-4 text-gold-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Table / NFC Simulator */}
        <div className="py-4 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-gold-400" />
              <label className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                {t('table', 'Table')} (NFC / QR Simulation)
              </label>
            </div>
            {tableSaved && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Updated
              </span>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mb-3 font-light">
            Tap a table number to simulate an instant NFC table check-in:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {['1', '2', '5', '8', '12', '16', 'VIP-1'].map((num) => (
                <button
                  key={num}
                  onClick={() => setSimulatedTable(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                    simulatedTable === num
                      ? 'border-gold-500 bg-gold-500/20 text-gold-300 font-semibold'
                      : 'border-stone-800 bg-charcoal-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  T-{num}
                </button>
              ))}
            </div>
            <button
              onClick={handleSaveTable}
              className="px-3.5 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs font-bold"
            >
              Set
            </button>
          </div>
        </div>

        {/* Section 4: Staff & Kitchen Operations */}
        <div className="py-4 border-b border-stone-800/80 space-y-2">
          <label className="text-xs uppercase tracking-wider text-gold-400 font-bold block mb-2">
            Staff & Kitchen Tools
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                onClose();
                setRoute('staff-queue');
              }}
              className="w-full p-3 rounded-2xl border border-gold-500/30 bg-gold-500/10 flex items-center justify-between text-stone-200 hover:border-gold-500/60 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-gold-400" />
                <div className="text-left">
                  <span className="font-semibold block">Kitchen Order Queue</span>
                  <span className="text-[10px] text-stone-400">Live incoming orders with sound alerts</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gold-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                setRoute('availability');
              }}
              className="w-full p-3 rounded-2xl border border-stone-800/80 bg-charcoal-900/60 flex items-center justify-between text-stone-300 hover:border-gold-500/40 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <div className="text-left">
                  <span className="font-semibold block">1-Tap Live Availability</span>
                  <span className="text-[10px] text-stone-400">Mark sold-out or snooze dishes</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>

            <button
              onClick={() => {
                onClose();
                setRoute('waiter-mode');
              }}
              className="w-full p-3 rounded-2xl border border-stone-800/80 bg-charcoal-900/60 flex items-center justify-between text-stone-300 hover:border-gold-500/40 text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-gold-400" />
                <div className="text-left">
                  <span className="font-semibold block">Waiter Order Pad</span>
                  <span className="text-[10px] text-stone-400">Table-side fast manual order taker</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Section 5: Quick Navigation to Digital Receipts */}
        <div className="py-4 border-b border-stone-800/80 space-y-2">
          <button
            onClick={() => {
              onClose();
              setRoute('receipt');
            }}
            className="w-full p-3 rounded-2xl border border-stone-800/80 bg-charcoal-900/60 flex items-center justify-between text-stone-300 hover:border-gold-500/40 text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Receipt className="w-4 h-4 text-gold-400" />
              <span>{t('digitalReceipt', 'Digital Thermal Receipt')} (Sample #MB3024)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Section 5: Restaurant Info & Location */}
        <div className="py-4 border-b border-stone-800/80 space-y-2 text-xs text-stone-400 font-light">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{config.branding.address || 'Bole Road, Namibia St, Addis Ababa, Ethiopia'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Open Daily: 11:30 AM – 11:00 PM (Dinner & Cellar)</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gold-400 shrink-0" />
            <span>+251 91 123 4567 / reservations@mesobaddis.com</span>
          </div>
        </div>

        {/* Section 6: Brand Heritage */}
        <div className="pt-4 text-center">
          <div className="inline-flex items-center gap-1 text-[11px] text-gold-400/90 font-serif">
            <Award className="w-3.5 h-3.5" />
            <span>Addis Ababa's Premier Cultural Dining Experience</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Mesob Restaurant Platform · Earth &amp; Light Edition
          </p>
        </div>
      </div>
    </div>
  );
};
