import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  ArrowRight,
  Globe,
  Check,
  Sparkles,
  Crown,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/mesobTranslations';

export const WelcomeScreen: React.FC = () => {
  const {
    config,
    navigateTo,
    tableNumber,
    setIsQRScannerOpen,
    setIsSmartMenuOpen,
    language,
    setLanguage,
    t,
    openDishDetail,
  } = useMesob();

  const [isLangOpen, setIsLangOpen] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning', 'Good morning');
    if (hour < 17) return t('goodAfternoon', 'Good afternoon');
    return t('goodEvening', 'Good evening');
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Signature dishes to feature on the welcome screen
  const signatureDishes = config.dishes.filter((d) => d.isSignature || d.isPopular).slice(0, 3);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#0C0A09] text-stone-100 select-none">
      {/* Cinematic Background with Atmospheric Lighting & Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={config.branding.coverImage || '/images/dishes/Kitfo.jpg'}
          alt="Luxury Restaurant Dining"
          className="w-full h-full object-cover object-center brightness-[0.28] contrast-125 scale-105 transform duration-1000"
        />
        {/* Multilayered Luxury Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/80 to-[#0C0A09]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#0C0A09_85%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
      </div>

      {/* Main Container constrained for luxury mobile & centered on desktop */}
      <div className="relative z-10 max-w-md mx-auto w-full flex-1 flex flex-col justify-between p-4 sm:p-6 min-h-screen">
        
        {/* Top Header Bar: Table Indicator & Language Switcher */}
        <header className="flex items-center justify-between pt-2 pb-4">
          {/* Table Badge */}
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 hover:border-amber-400/60 transition shadow-lg shadow-black/60"
            title="Change Table Number"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold tracking-wider">
              {t('table', 'Table')} {tableNumber}
            </span>
            <span className="text-[10px] text-stone-400">• {t('switchTable', 'Switch')}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-amber-500/30 text-xs text-amber-200 hover:border-amber-400/60 transition shadow-lg shadow-black/60"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold font-sans">{currentLangObj.shortLabel}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-stone-900/95 border border-amber-500/30 rounded-2xl shadow-2xl backdrop-blur-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-stone-800">
                  {t('selectLanguage', 'Select Language')}
                </div>
                {SUPPORTED_LANGUAGES.map((langOpt) => (
                  <button
                    key={langOpt.code}
                    onClick={() => {
                      setLanguage(langOpt.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition ${
                      language === langOpt.code
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{langOpt.flag}</span>
                      <span className="font-medium">{langOpt.nativeName}</span>
                    </div>
                    {language === langOpt.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Center Restaurant Branding & Welcome Hero */}
        <div className="flex flex-col items-center justify-center text-center my-auto py-6">
          {/* Subtle Gold Mesob Emblem */}
          <div className="mb-4 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-950/50">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-amber-500/10 blur-sm -z-10" />
          </div>

          {/* Restaurant Name & Tagline */}
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-[0.22em] text-white uppercase drop-shadow-lg">
            {config.branding.name}
          </h1>
          <p className="text-xs sm:text-sm font-sans tracking-[0.3em] text-amber-200/80 uppercase mt-2 font-light">
            {config.branding.subtitle || 'Ethiopian Restaurant & Lounge'}
          </p>

          {/* Subtle Gold Divider */}
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-5" />

          {/* Warm Hospitality Greeting */}
          <div className="space-y-1.5 max-w-xs">
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-stone-100 drop-shadow">
              {getGreeting()},
            </h2>
            <p className="text-xs sm:text-sm text-stone-300/90 font-light leading-relaxed">
              Experience the warmth of Ethiopian hospitality. Authentic recipes, slow-simmered stews, and pure teff injera.
            </p>
          </div>

          {/* Signature Highlights Mini-Cards */}
          {signatureDishes.length > 0 && (
            <div className="w-full mt-6 grid grid-cols-3 gap-2 text-left">
              {signatureDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => openDishDetail(dish)}
                  className="cursor-pointer group relative bg-stone-900/60 hover:bg-stone-900 border border-stone-800/80 hover:border-amber-500/40 rounded-xl p-2 transition-all shadow-md"
                >
                  <div className="w-full h-14 rounded-lg overflow-hidden mb-1.5 bg-stone-950">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-stone-200 truncate group-hover:text-amber-300 transition-colors">
                    {dish.name}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold">
                    {dish.price} ETB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA Actions */}
        <div className="w-full space-y-3 pt-4 pb-4">
          {/* Primary CTA: Explore Menu */}
          <button
            onClick={() => navigateTo('/mesob/home')}
            className="w-full py-4 px-8 rounded-full gold-gradient-btn text-stone-950 text-sm font-bold tracking-wide shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 group transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t('exploreMenu', 'Explore Menu & Order')}</span>
            <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Quick Action: ✦ Ask AI Concierge */}
          <button
            onClick={() => setIsSmartMenuOpen(true)}
            className="w-full py-3 px-6 rounded-full bg-stone-900/80 hover:bg-stone-800/90 border border-amber-500/30 text-amber-200 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>✦ Ask Dining Concierge for Recommendations</span>
          </button>

          {/* Zero-friction Trust Assurance */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-stone-400 font-light tracking-wider uppercase pt-2">
            <span>No App Needed</span>
            <span>•</span>
            <span>Table #{tableNumber}</span>
            <span>•</span>
            <span>Instant Kitchen Sync</span>
          </div>
        </div>

      </div>
    </div>
  );
};
