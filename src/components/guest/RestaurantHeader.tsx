import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Globe, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const RestaurantHeader: React.FC = () => {
  const { brand, activeTable, setActiveTable, language, setLanguage, t } = useRestaurant();
  const [showTableModal, setShowTableModal] = useState(false);

  return (
    <header className="relative bg-stone-950 border-b border-stone-800/80">
      {/* Cover Image with Gradient Vignette */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden">
        <img
          src={brand.coverImage}
          alt={brand.name[language]}
          className="w-full h-full object-cover brightness-75 transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />

        {/* Top Floating Controls inside hero */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Table Badge */}
          <button
            onClick={() => setShowTableModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-md border border-stone-700/60 text-xs font-medium text-amber-300 hover:bg-stone-800 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.table} {activeTable}</span>
            <span className="text-[10px] text-stone-400 ml-0.5">▾</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-stone-900/85 backdrop-blur-md p-1 rounded-full border border-stone-700/60">
            <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                language === 'en'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('am')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                language === 'am'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              አማርኛ
            </button>
          </div>
        </div>
      </div>

      {/* Brand Identity & Info */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{brand.logo}</span>
              <h1 className="text-2xl font-bold font-display tracking-wide text-stone-100">
                {brand.name[language]}
              </h1>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5 font-light">
              {brand.tagline[language]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-stone-400">
          <div className="flex items-center gap-1 truncate max-w-[220px]">
            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{brand.address[language]}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400/90 font-medium shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.scanNfcNotice}</span>
          </div>
        </div>

        {/* Zero Friction Micro-Banner */}
        <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80 flex items-center justify-between text-[11px]">
          <span className="text-stone-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan • Discover • Understand • Decide</span>
          </span>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
            No App • No Login
          </span>
        </div>
      </div>

      {/* Table Change Simulator Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 max-w-xs w-full animate-slide-up shadow-2xl">
            <h3 className="text-base font-semibold text-stone-100 mb-1">
              {t.tableSelector}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Simulate scanning the QR code or tapping the NFC disc at different tables.
            </p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4, 7, 10, 12, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setActiveTable(num);
                    setShowTableModal(false);
                  }}
                  className={`py-2 rounded-lg text-sm font-semibold transition ${
                    activeTable === num
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  #{num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTableModal(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
