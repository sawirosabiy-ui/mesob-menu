import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Eye,
  Utensils,
  Compass,
  Filter,
  Scale,
  Languages,
  Wine,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { analyticsMetrics, analyticsEvents, brand, language, t } = useRestaurant();

  return (
    <div className="space-y-6">
      {/* Top Banner with Hospitality Telemetry Indicator */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.liveBadge}
            </span>
            <span className="text-xs text-stone-400">
              {brand.name[language]} • Addis Ababa
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            {t.adminTitle}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {t.adminSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-stone-400 block">Total Guest Sessions</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {analyticsMetrics.menuViews.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Grid (PRD Section 23) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Menu Views */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.menuViewsMetric}</span>
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analyticsMetrics.menuViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        {/* Dish Explorations */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.dishViewsMetric}</span>
            <Compass className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analyticsMetrics.dishExplorations.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Avg. 2.4 dishes per guest
          </div>
        </div>

        {/* Top Explored Dish */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.topExploredMetric}</span>
            <Utensils className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 truncate">
            {analyticsMetrics.topExploredDish}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            41% of total detail taps
          </div>
        </div>

        {/* Top Filter */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.topFilterMetric}</span>
            <Filter className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-300 truncate">
            {analyticsMetrics.topFilter}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Fasting & health oriented
          </div>
        </div>

        {/* Most Compared Pair */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.mostComparedMetric}</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-purple-200 truncate">
            {analyticsMetrics.mostComparedPair}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Decision dilemma: Stew vs Grilled
          </div>
        </div>

        {/* Language Split */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.langUsageMetric}</span>
            <Languages className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center gap-3 text-base font-bold font-mono">
            <span className="text-amber-400">EN {analyticsMetrics.languageStats.en}%</span>
            <span className="text-stone-400">/</span>
            <span className="text-blue-400">AM {analyticsMetrics.languageStats.am}%</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Zero mixed text errors
          </div>
        </div>

        {/* Pairing Engagement */}
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium">{t.pairingMetric}</span>
            <Wine className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {analyticsMetrics.pairingEngagement.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-300 mt-1">
            Buna & Honey Wine lead
          </div>
        </div>
      </div>

      {/* SIGNATURE ITEM INTELLIGENCE (PRD Section 24) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/30 via-stone-900/90 to-stone-900 border border-amber-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-white">
                  {t.signatureIntelTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.signatureIntelBadge}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Automated discovery funnel analysis & high-conversion guest signals
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              Flagship Dish Focus
            </span>
            <span className="text-lg font-bold text-amber-300">
              Doro Wot (Royal Stew)
            </span>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              {t.signatureIntelDesc}
            </p>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              Guest Uncertainty Reduction
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">79%</span>
              <span className="text-xs text-stone-400">decision completion</span>
            </div>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Guests who opened "What to expect" spent an average of 42 seconds reading and proceeded without server hesitation.
            </p>
          </div>

          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
            <span className="text-xs font-semibold text-stone-400 block mb-1">
              Attributed Pairing Value
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">+180 ETB</span>
              <span className="text-xs text-stone-400">per table upside</span>
            </div>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Tej honey wine and Buna ceremony pairings triggered a 32% increase in high-margin beverage inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Interaction Stream */}
      <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              {t.liveActivityFeed}
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {analyticsEvents.length} events logged in session
          </span>
        </div>

        <div className="divide-y divide-stone-800/80 max-h-60 overflow-y-auto">
          {analyticsEvents.slice(0, 8).map((ev) => (
            <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-stone-300 capitalize">
                  {ev.type.replace('_', ' ')}:
                </span>
                <span className="text-stone-400">
                  {ev.metadata?.dishName ||
                    ev.metadata?.filterName ||
                    (ev.metadata?.comparePair && ev.metadata.comparePair.join(' vs ')) ||
                    (ev.metadata?.language && `Language switched to ${ev.metadata.language.toUpperCase()}`) ||
                    ev.metadata?.source ||
                    'General interaction'}
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
