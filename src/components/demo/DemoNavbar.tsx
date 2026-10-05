import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Smartphone,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

export const DemoNavbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    phoneFrameMode,
    setPhoneFrameMode,
    setIsDemoGuideOpen,
    t,
  } = useRestaurant();

  return (
    <nav className="bg-stone-900 border-b border-stone-800 px-4 py-2 flex items-center justify-between z-40 text-xs select-none">
      {/* Brand & Demo Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-white tracking-wide font-display text-base">
            RESTAURANT BUTTON
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-semibold border border-stone-700 hidden sm:inline">
            PRD V1.0 Demo
          </span>
        </div>
      </div>

      {/* Center Switchers: Guest vs Admin */}
      <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
        <button
          onClick={() => setViewMode('guest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            viewMode === 'guest'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.guestExperience}</span>
        </button>

        <button
          onClick={() => setViewMode('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            viewMode === 'admin'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>{t.restaurantAdmin}</span>
        </button>
      </div>

      {/* Right Actions: Phone Frame toggle & 2-min Walkthrough Guide */}
      <div className="flex items-center gap-2">
        {viewMode === 'guest' && (
          <button
            onClick={() => setPhoneFrameMode(!phoneFrameMode)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition text-[11px]"
            title={phoneFrameMode ? 'Switch to Fullscreen View' : 'Switch to Mobile Frame'}
          >
            {phoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{phoneFrameMode ? 'Fullscreen' : 'Phone Frame'}</span>
          </button>
        )}

        <button
          onClick={() => setIsDemoGuideOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs shadow-md transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.demoModeGuide}</span>
          <span className="sm:hidden">Guide</span>
        </button>
      </div>
    </nav>
  );
};
