import React from 'react';
import { useMesob } from '../../context/MesobContext';
import { MesobNav } from './MesobNav';
import { WelcomeScreen } from './WelcomeScreen';
import { HomeScreen } from './HomeScreen';
import { CategoryScreen } from './CategoryScreen';
import { PairingsScreen } from './PairingsScreen';
import { OrderScreen } from './OrderScreen';
import { OrderConfirmationScreen } from './OrderConfirmationScreen';
import { DigitalReceiptScreen } from './DigitalReceiptScreen';
import { DishDetailSheet } from './DishDetailSheet';
import { SmartMenuModal } from './SmartMenuModal';
import { FlyToCartOverlay } from '../common/FlyToCartOverlay';
import { ShowWaiterModal } from './ShowWaiterModal';
import { OfflineBanner } from './OfflineBanner';
import { StaffOrderScreen } from './StaffOrderScreen';
import { LiveAvailabilityScreen } from './LiveAvailabilityScreen';
import { WaiterOrderMode } from './WaiterOrderMode';
import { ManagerPortal } from '../admin/ManagerPortal';
import { AlertCircle, Store, RefreshCw } from 'lucide-react';

export const MesobApp: React.FC = () => {
  const {
    currentRoute,
    setRoute,
    activeDishDetail,
    closeDishDetail,
    isSmartMenuOpen,
    setIsSmartMenuOpen,
    restaurantNotFound,
    invalidTableToken,
    allRestaurants,
    setActiveRestaurantId,
  } = useMesob();

  // Error State: Restaurant Slug Not Found
  if (restaurantNotFound) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center space-y-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold font-display text-amber-200">
          Restaurant Not Found
        </h2>
        <p className="text-xs text-stone-400 max-w-sm">
          The restaurant link or table QR code you accessed is not recognized or has expired.
        </p>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] text-stone-400 block font-semibold">
            Choose an active dining room:
          </span>
          <div className="flex flex-col gap-2">
            {allRestaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRestaurantId(r.id);
                  window.location.hash = `/r/${r.slug}/t/t1`;
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-amber-300"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Open {typeof r.name === 'string' ? r.name : r.name.en}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Route: Manager Portal
  if (currentRoute === 'portal') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased">
        <ManagerPortal
          onSwitchToGuest={(slug, token) => {
            window.location.hash = `/r/${slug}/t/${token || 't1'}`;
            setRoute('home');
          }}
          onSwitchToKitchen={() => setRoute('staff-queue')}
          onSwitchToWaiter={() => setRoute('waiter-mode')}
        />
      </div>
    );
  }

  // Screen 1: Welcome Screen displays without standard navbar
  if (currentRoute === 'welcome') {
    return (
      <div className="min-h-screen bg-obsidian-950 text-stone-100 selection:bg-gold-500 selection:text-obsidian-950 font-sans antialiased">
        <OfflineBanner />
        <WelcomeScreen />
        <FlyToCartOverlay />
        <ShowWaiterModal />
      </div>
    );
  }

  // Dedicated full-screen staff/operational modes
  if (currentRoute === 'staff-queue') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-gold-500 selection:text-obsidian-950 font-sans antialiased">
        <OfflineBanner />
        <StaffOrderScreen />
      </div>
    );
  }

  if (currentRoute === 'availability') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-gold-500 selection:text-obsidian-950 font-sans antialiased">
        <OfflineBanner />
        <LiveAvailabilityScreen />
      </div>
    );
  }

  if (currentRoute === 'waiter-mode') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-gold-500 selection:text-obsidian-950 font-sans antialiased">
        <OfflineBanner />
        <WaiterOrderMode />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-stone-100 flex flex-col selection:bg-gold-500 selection:text-obsidian-950 font-sans antialiased">
      {/* Offline banner indicator */}
      <OfflineBanner />

      {/* Invalid Table Token warning if guest used old token */}
      {invalidTableToken && (
        <div className="bg-amber-950/60 border-b border-amber-800/80 px-4 py-1.5 text-center text-[11px] text-amber-200">
          Note: This table code was not recognized. You are browsing the main dining room menu.
        </div>
      )}

      {/* Top Header and Mobile Bottom Tab Bar */}
      <MesobNav />

      {/* Main View Screen Routing matching reference Screens 1-10 */}
      <main className="flex-1 flex flex-col">
        {currentRoute === 'home' && <HomeScreen />}
        {currentRoute === 'menu' && <CategoryScreen />}
        {currentRoute === 'category' && <CategoryScreen />}
        {currentRoute === 'pairings' && <PairingsScreen />}
        {currentRoute === 'order' && <OrderScreen />}
        {currentRoute === 'confirmation' && <OrderConfirmationScreen />}
        {currentRoute === 'receipt' && <DigitalReceiptScreen />}
      </main>

      {/* Screen 4: Dish Detail Sheet */}
      <DishDetailSheet
        dish={activeDishDetail}
        onClose={closeDishDetail}
      />

      {/* Screen 5: Smart Menu AI Modal */}
      <SmartMenuModal
        isOpen={isSmartMenuOpen}
        onClose={() => setIsSmartMenuOpen(false)}
      />

      {/* Table-side Fallback: Show to Waiter Modal */}
      <ShowWaiterModal />

      {/* Global Interactive Fly-to-Cart Particle Animation Overlay */}
      <FlyToCartOverlay />
    </div>
  );
};
