import React, { useState, useEffect, useCallback } from "react";

export interface FlyParticle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  image?: string;
  name?: string;
}

// Global emitter for fly-to-cart animations
type FlyListener = (particle: Omit<FlyParticle, "id" | "targetX" | "targetY">) => void;
const listeners: Set<FlyListener> = new Set();

export const triggerAddToCartAnimation = (
  origin: { x: number; y: number } | DOMRect | HTMLElement,
  dish?: { image?: string; name?: string }
) => {
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (origin instanceof HTMLElement) {
    const rect = origin.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  } else if ("left" in origin && "top" in origin && "width" in origin) {
    startX = origin.left + origin.width / 2;
    startY = origin.top + origin.height / 2;
  } else if ("x" in origin && "y" in origin) {
    startX = origin.x;
    startY = origin.y;
  }

  // Trigger haptic vibration if available on mobile devices
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([15, 30, 20]);
    } catch {
      // ignore
    }
  }

  listeners.forEach((listener) =>
    listener({
      startX,
      startY,
      image: dish?.image,
      name: dish?.name,
    })
  );
};

export const FlyToCartOverlay: React.FC = () => {
  const [particles, setParticles] = useState<FlyParticle[]>([]);

  const handleAddParticle: FlyListener = useCallback(({ startX, startY, image, name }) => {
    // Find target cart button coordinates in bottom nav
    const cartEl = document.getElementById("mesob-cart-nav-tab");
    let targetX = window.innerWidth * 0.7;
    let targetY = window.innerHeight - 35;

    if (cartEl) {
      const rect = cartEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const newParticle: FlyParticle = {
      id: "fly-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      startX,
      startY,
      targetX,
      targetY,
      image,
      name,
    };

    setParticles((prev) => [...prev, newParticle]);

    // Cleanup after animation duration and trigger cart impact event
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      // Dispatch impact event to bump the cart tab
      window.dispatchEvent(new CustomEvent("mesob:cart-impact", { detail: { name } }));
    }, 700);
  }, []);

  useEffect(() => {
    listeners.add(handleAddParticle);
    return () => {
      listeners.delete(handleAddParticle);
    };
  }, [handleAddParticle]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => {
        // Delta distance
        const dx = p.targetX - p.startX;
        const dy = p.targetY - p.startY;
        // Parabolic control peak height
        const peakY = Math.min(p.startY, p.targetY) - 70;

        return (
          <div
            key={p.id}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              transform: `translate(${p.startX}px, ${p.startY}px)`,
              animation: `mesobFlyCurve 680ms cubic-bezier(0.2, 0.8, 0.25, 1) forwards`,
              // Inject CSS custom properties for dynamic coordinates
              ["--startX" as any]: `${p.startX}px`,
              ["--startY" as any]: `${p.startY}px`,
              ["--peakY" as any]: `${peakY}px`,
              ["--targetX" as any]: `${p.targetX}px`,
              ["--targetY" as any]: `${p.targetY}px`,
            }}
          >
            {/* Flying Glowing Food Orb with Golden Halo */}
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              {/* Golden Particle Glow Aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-500 via-amber-400 to-terracotta-500 blur-md opacity-80 animate-pulse scale-150" />

              {/* Central Food / Golden Disc Icon */}
              <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 via-amber-300 to-terracotta-400 shadow-2xl shadow-gold-500/80 flex items-center justify-center overflow-hidden border-2 border-charcoal-950">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name || "Dish"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs font-bold text-charcoal-950">✦</span>
                )}
              </div>

              {/* Sparkle Trail Tail */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gold-400 blur-[2px] opacity-75 animate-ping" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
