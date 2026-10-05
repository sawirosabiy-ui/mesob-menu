import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Sparkles,
  QrCode,
  Filter,
  Eye,
  Scale,
  Wine,
  UploadCloud,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const DemoGuideModal: React.FC = () => {
  const {
    isDemoGuideOpen,
    setIsDemoGuideOpen,
    setViewMode,
    openDishDetail,
    dishes,
    addToCompare,
    setIsCompareModalOpen,
    toggleDietaryFilter,
    setLanguage,
  } = useRestaurant();

  if (!isDemoGuideOpen) return null;

  const triggerStep = (stepNumber: number) => {
    setIsDemoGuideOpen(false);
    switch (stepNumber) {
      case 1: // Reset & Guest View
        setViewMode('guest');
        break;
      case 2: // Filter Vegetarian
        setViewMode('guest');
        toggleDietaryFilter('Vegetarian');
        break;
      case 3: // Open Doro Wot detail & explanation
        setViewMode('guest');
        const doro = dishes.find((d) => d.id === 'doro-wot');
        if (doro) openDishDetail(doro);
        break;
      case 4: // Compare Doro Wot vs Tibs
        setViewMode('guest');
        addToCompare('doro-wot');
        addToCompare('special-beef-tibs');
        setIsCompareModalOpen(true);
        break;
      case 5: // Switch Language to Amharic
        setLanguage('am');
        break;
      case 6: // Switch to Admin
        setViewMode('admin');
        break;
      default:
        break;
    }
  };

  const steps = [
    {
      num: 1,
      role: 'Guest',
      title: 'Zero-Friction Entry (Scan QR / Tap NFC)',
      desc: 'No app download, no account creation, no password. Instant dining menu opens directly at Table 4.',
      icon: <QrCode className="w-4 h-4 text-amber-400" />,
      actionLabel: 'Go to Guest Menu',
    },
    {
      num: 2,
      role: 'Guest',
      title: 'Intelligent Discovery & Filtering',
      desc: 'Tap visual smart pills like "Vegetarian", "Spicy", or "Under 600 ETB". Menu updates in milliseconds.',
      icon: <Filter className="w-4 h-4 text-emerald-400" />,
      actionLabel: 'Test "Vegetarian" Filter',
    },
    {
      num: 3,
      role: 'Guest',
      title: 'Structured "Explain This Dish"',
      desc: 'NO generic chatbot window. Direct structured cultural insights: "What is it?", "What does it taste like?", and "What to expect" (2 sentences max).',
      icon: <Eye className="w-4 h-4 text-sky-400" />,
      actionLabel: 'Explain Doro Wot',
    },
    {
      num: 4,
      role: 'Guest',
      title: 'Side-by-Side Comparison Matrix',
      desc: 'Compare Doro Wot and Beef Tibs on price, spice heat, preparation style, and calories to make a confident decision.',
      icon: <Scale className="w-4 h-4 text-purple-400" />,
      actionLabel: 'Compare Doro vs Tibs',
    },
    {
      num: 5,
      role: 'Guest',
      title: 'Instant Bilingual Localized Menu',
      desc: 'Switch to Amharic (አማርኛ) or English. 100% of dish details, allergens, headers, and UI elements translate seamlessly.',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      actionLabel: 'Switch to Amharic',
    },
    {
      num: 6,
      role: 'Restaurant',
      title: 'AI Ingestion & Behavioral Telemetry',
      desc: 'Switch to Admin. Upload an existing menu PDF, watch AI optical parsing, verify & publish, then review live telemetry insights.',
      icon: <BarChart3 className="w-4 h-4 text-rose-400" />,
      actionLabel: 'Open Restaurant Admin',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-up space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Restaurant Button — 2-Minute Demo Story
              </h3>
              <p className="text-xs text-stone-400">
                PRD V1.0 Sequence: Scan → Discover → Understand → Decide → Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoGuideOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-stone-900 border border-stone-700 shrink-0 mt-0.5">
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                      {s.role}
                    </span>
                    <h4 className="text-sm font-bold text-stone-100">
                      {s.title}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => triggerStep(s.num)}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition"
              >
                <span>{s.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-stone-500">
          Restaurant Button Demonstration Environment • Fully interactive & responsive
        </div>
      </div>
    </div>
  );
};
