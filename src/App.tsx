import React, { useState } from 'react';
import { MesobProvider, useMesob } from './context/MesobContext';
import { MesobApp } from './components/mesob/MesobApp';
import {
  Smartphone,
  Monitor,
  Utensils,
  Sparkles,
  UserCheck,
  Wifi,
  WifiOff,
  Bell,
  Home,
  Sun,
  Moon,
  ShieldCheck,
  Store,
} from 'lucide-react';

const PresenterHeader: React.FC<{
  frameMode: 'responsive' | 'phone';
  setFrameMode: (m: 'responsive' | 'phone') => void;
}> = ({ frameMode, setFrameMode }) => {
  const {
    currentRoute,
    setRoute,
    activeOrders,
    isOnline,
    toggleOnline,
    theme,
    toggleTheme,
    allRestaurants,
    activeRestaurantId,
    setActiveRestaurantId,
    currentRestaurant,
  } = useMesob();

  const unconfirmedOrders = activeOrders.filter(
    (o) => o.status === 'SUBMITTED' || o.status === 'RECEIVED'
  );

  const restName =
    typeof currentRestaurant?.name === 'string'
      ? currentRestaurant.name
      : currentRestaurant?.name?.en || 'MESOB';

  return (
    <div className="bg-stone-950 border-b border-amber-900/40 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] z-50 select-none gap-2">
      {/* Brand & Multi-Tenant Selector */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="font-bold tracking-wider text-amber-200 uppercase font-mono hidden sm:inline">
          MESOB
        </span>

        {/* Tenant Switcher */}
        <select
          value={activeRestaurantId}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              setRoute('portal');
            } else {
              setActiveRestaurantId(e.target.value);
            }
          }}
          className="bg-stone-900 border border-stone-800 rounded-lg px-2 py-0.5 text-[11px] text-amber-300 font-medium focus:outline-none focus:border-amber-500 max-w-[150px] truncate"
          title="Switch Active Restaurant Tenant"
        >
          {allRestaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {typeof r.name === 'string' ? r.name : r.name.en}
            </option>
          ))}
          <option value="__new__">+ New Restaurant...</option>
        </select>
      </div>

      {/* Mode Switcher: Guest | Manager Portal | Staff KDS | Live Stock | Waiter Pad */}
      <div className="flex items-center gap-1 bg-stone-900/90 border border-stone-800 rounded-xl p-0.5 flex-wrap">
        <button
          onClick={() => setRoute('home')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            currentRoute !== 'portal' &&
            currentRoute !== 'staff-queue' &&
            currentRoute !== 'availability' &&
            currentRoute !== 'waiter-mode'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Guest Dining Experience"
        >
          <Home className="w-3 h-3" />
          <span>Guest Menu</span>
        </button>

        <button
          onClick={() => setRoute('portal')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            currentRoute === 'portal'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Restaurant Manager Portal (Menu, Draft, Orders, Tables, QR, Staff)"
        >
          <Store className="w-3 h-3" />
          <span>Manager</span>
        </button>

        <button
          onClick={() => setRoute('staff-queue')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer relative ${
            currentRoute === 'staff-queue'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Kitchen Display System (KDS)"
        >
          <Utensils className="w-3 h-3" />
          <span>Kitchen KDS</span>
          {unconfirmedOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-stone-950 animate-pulse">
              {unconfirmedOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setRoute('waiter-mode')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            currentRoute === 'waiter-mode'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="Waiter Table-side Order Pad"
        >
          <UserCheck className="w-3 h-3" />
          <span className="hidden sm:inline">Waiter Pad</span>
          <span className="sm:hidden">Waiter</span>
        </button>

        <button
          onClick={() => setRoute('availability')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
            currentRoute === 'availability'
              ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          title="1-Tap Dish Stock Availability Manager (86-List)"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden md:inline">Live Stock</span>
          <span className="md:hidden">Stock</span>
        </button>
      </div>

      {/* Network Simulator & Viewport Switcher */}
      <div className="flex items-center gap-2">
        {/* Toggle Online/Offline */}
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
            isOnline
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-amber-500/60 bg-amber-500/20 text-amber-200 font-bold animate-pulse'
          }`}
          title="Simulate network connectivity in Ethiopian dining conditions"
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'Online' : 'Offline Sim'}</span>
        </button>

        {/* Theme Toggle (Warm Cream vs Obsidian Dark) */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-medium transition cursor-pointer ${
            theme === 'light'
              ? 'border-amber-700/40 bg-amber-600/15 text-amber-900 font-semibold'
              : 'border-stone-700 bg-stone-900 text-stone-300 hover:text-white'
          }`}
          title="Toggle between Warm White Cream and Obsidian Dark Theme"
        >
          {theme === 'light' ? (
            <Sun className="w-3 h-3 text-amber-600" />
          ) : (
            <Moon className="w-3 h-3 text-amber-400" />
          )}
          <span>{theme === 'light' ? 'Cream' : 'Dark'}</span>
        </button>

        {/* Viewport: Full Screen vs Mobile Shell */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFrameMode('responsive')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
              frameMode === 'responsive'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span className="hidden sm:inline">Full</span>
          </button>
          <button
            onClick={() => setFrameMode('phone')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
              frameMode === 'phone'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export function App() {
  const [frameMode, setFrameMode] = useState<'responsive' | 'phone'>('responsive');

  return (
    <MesobProvider>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        {/* Top Presenter Bar */}
        <PresenterHeader frameMode={frameMode} setFrameMode={setFrameMode} />

        {/* Viewport Frame Container */}
        <div className="flex-1 flex flex-col">
          {frameMode === 'phone' ? (
            <div className="flex-1 flex items-center justify-center p-3 sm:py-6 bg-stone-900/60">
              <div className="mobile-device-frame bg-stone-950 shadow-2xl flex flex-col border border-stone-800">
                {/* Simulated Phone Speaker / Notch */}
                <div className="hidden sm:flex justify-center pt-2.5 pb-1 bg-stone-950 shrink-0 z-30">
                  <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-950 mr-2" />
                    <div className="w-2 h-2 rounded-full bg-stone-800" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                  <MesobApp />
                </div>
              </div>
            </div>
          ) : (
            <MesobApp />
          )}
        </div>
      </div>
    </MesobProvider>
  );
}

export default App;
