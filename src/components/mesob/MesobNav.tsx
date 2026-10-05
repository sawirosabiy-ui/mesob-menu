import React, { useState } from 'react';
import { useMesob } from '../../context/MesobContext';
import {
  Home,
  BookOpen,
  ShoppingBag,
  MoreHorizontal,
  Sparkles,
  Sun,
  Moon,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { MoreSheet } from './MoreSheet';
import { SUPPORTED_LANGUAGES } from '../../i18n/mesobTranslations';

export const MesobNav: React.FC = () => {
  const {
    currentRoute,
    setRoute,
    tableNumber,
    cartItemCount,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    currencies,
    selectedLanguage,
    setLanguage,
    setIsSmartMenuOpen,
    t,
  } = useMesob();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCartBumping, setIsCartBumping] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  // Listen for flying food particle impacts
  React.useEffect(() => {
    const handleImpact = () => {
      setIsCartBumping(true);
      setShowPlusOne(true);
      setTimeout(() => setIsCartBumping(false), 550);
      setTimeout(() => setShowPlusOne(false), 900);
    };

    window.addEventListener('mesob:cart-impact', handleImpact);
    return () => window.removeEventListener('mesob:cart-impact', handleImpact);
  }, []);

  const isHome = currentRoute === 'home' || currentRoute === 'welcome';
  const isMenu = currentRoute === 'menu' || currentRoute === 'category' || currentRoute === 'pairings';
  const isOrder = currentRoute === 'order' || currentRoute === 'confirmation' || currentRoute === 'receipt';

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const currentCurrObj = currencies?.find((c) => c.code === currency) || { code: 'ETB', flag: '🇪🇹' };

  return (
    <>
      {/* Top Header Bar matching Earth & Light palette */}
      <header className="sticky top-0 z-30 bg-charcoal-950/90 backdrop-blur-xl border-b border-stone-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between max-w-md mx-auto w-full">
        {/* Left: Table Indicator / Switcher */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-stone-800 bg-charcoal-850/90 text-stone-300 text-xs font-medium hover:border-gold-500/30 transition-colors"
          title="Change table"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider">{t('table')} {tableNumber}</span>
        </button>

        {/* Center: Gold Serif Brand Logo */}
        <div 
          onClick={() => setRoute('home')}
          className="cursor-pointer text-center group"
        >
          <span className="font-display text-xl font-bold tracking-[0.25em] text-gold-300 group-hover:text-gold-200 transition-colors uppercase">
            MESOB
          </span>
        </div>

        {/* Right Controls: Currency Selector, Theme Toggle & Language Pill */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Compact Currency Selector Dropdown (ETB ▾, USD ▾, EUR ▾, GBP ▾) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCurrencyOpen(!isCurrencyOpen);
                if (isLangOpen) setIsLangOpen(false);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-full border text-xs font-medium transition-all ${
                currency !== 'ETB'
                  ? 'border-gold-500/50 bg-gold-500/15 text-gold-300'
                  : 'border-stone-800 bg-charcoal-850/90 text-stone-300 hover:text-gold-300'
              }`}
              title="Select display currency"
              aria-label="Currency selector"
            >
              <span className="text-xs">{currentCurrObj.flag}</span>
              <span className="text-[10px] font-mono font-bold tracking-tight">{currency}</span>
              <span className="text-[8px] text-stone-500">▾</span>
            </button>

            {isCurrencyOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-charcoal-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 backdrop-blur-xl animate-fade-in">
                <div className="px-3 py-1 text-[9px] uppercase tracking-wider font-semibold text-stone-500 border-b border-stone-800/80">
                  Select Currency
                </div>
                {currencies?.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      currency === curr.code
                        ? 'bg-gold-500/20 text-gold-300 font-semibold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{curr.flag}</span>
                      <div className="text-left">
                        <span className="block text-xs font-medium">{curr.code}</span>
                        <span className="block text-[9px] text-stone-500 leading-none">{curr.name}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 font-medium">
                      {curr.symbol}
                    </span>
                  </button>
                ))}
                <div className="px-3 py-1.5 text-[8.5px] text-stone-500 border-t border-stone-800/80 bg-charcoal-950/50">
                  * Local orders settled in ETB
                </div>
              </div>
            )}
          </div>

          {/* Quick Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-stone-800 bg-charcoal-850/80 flex items-center justify-center text-stone-400 hover:text-gold-300 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                if (isCurrencyOpen) setIsCurrencyOpen(false);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full border border-stone-800 bg-charcoal-850/90 text-stone-300 hover:text-gold-300 text-xs transition-colors"
              aria-label="Language selector"
            >
              <Globe className="w-3 h-3 text-gold-400" />
              <span className="text-[10px] font-semibold uppercase">{currentLangObj.shortLabel}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-charcoal-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-50 py-1 backdrop-blur-xl animate-fade-in">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-gold-500/20 text-gold-300 font-semibold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-stone-500">{lang.shortLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar matching Earth & Light palette */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-charcoal-950/95 backdrop-blur-2xl border-t border-stone-800/80 py-2 safe-area-bottom">
        <div className="max-w-md mx-auto px-6 flex items-center justify-between relative">
          {/* 1. Home Tab */}
          <button
            onClick={() => setRoute('home')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isHome ? 'text-gold-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-full ${isHome ? 'bg-gold-500/10' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span>{t('home')}</span>
          </button>

          {/* 2. Menu Tab */}
          <button
            onClick={() => setRoute('menu')}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isMenu ? 'text-gold-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-full ${isMenu ? 'bg-gold-500/10' : ''}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <span>{t('menu')}</span>
          </button>

          {/* 3. Floating Center: ✦ Ask (Dining Concierge) */}
          <div className="relative -top-3">
            <button
              onClick={() => setIsSmartMenuOpen(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-300 text-charcoal-950 flex items-center justify-center shadow-lg shadow-gold-500/30 hover:scale-105 active:scale-95 transition-transform border-2 border-charcoal-950"
              title="✦ Ask Dining Concierge"
              aria-label="✦ Ask"
            >
              <Sparkles className="w-6 h-6 animate-pulse text-charcoal-950" />
            </button>
            <span className="text-[10px] font-semibold text-gold-300 text-center block mt-0.5 whitespace-nowrap">
              ✦ Ask
            </span>
          </div>

          {/* 4. Cart Tab with live badge, ID for coordinate targeting, & bump effect */}
          <button
            id="mesob-cart-nav-tab"
            onClick={() => setRoute('order')}
            className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
              isOrder ? 'text-gold-300 font-semibold' : 'text-stone-400 hover:text-stone-200'
            } ${isCartBumping ? 'animate-cart-bump' : ''}`}
          >
            {/* Floating +1 Indicator */}
            {showPlusOne && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-400 to-amber-300 text-charcoal-950 font-mono font-bold text-[10px] shadow-lg shadow-gold-500/40 animate-float-plus-one pointer-events-none z-50">
                +1
              </span>
            )}

            <div className="relative">
              <div className={`p-1 rounded-full transition-transform ${isOrder ? 'bg-gold-500/10' : ''}`}>
                <ShoppingBag className={`w-5 h-5 transition-transform ${isCartBumping ? 'text-gold-300 scale-110' : ''}`} />
              </div>
              {cartItemCount > 0 && (
                <span className={`absolute -top-0.5 -right-1 px-1.5 py-0.2 rounded-full bg-gold-400 text-obsidian-950 text-[9px] font-bold font-mono transition-transform ${isCartBumping ? 'scale-125 bg-amber-300' : ''}`}>
                  {cartItemCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          {/* 5. More Tab */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 text-[10px] font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            <div className="p-1">
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span>{t('more')}</span>
          </button>
        </div>
      </nav>

      {/* More Sheet for Settings, Dark/Light, Table NFC, and Receipts */}
      <MoreSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};
