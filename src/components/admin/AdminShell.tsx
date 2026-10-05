import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { AdminDashboard } from './AdminDashboard';
import { MenuIngestionWizard } from './MenuIngestionWizard';
import { MenuEditor } from './MenuEditor';
import { RestaurantSettings } from './RestaurantSettings';
import {
  BarChart3,
  UploadCloud,
  Layers,
  Palette,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { setViewMode, brand, language, t } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'analytics' | 'ingestion' | 'editor' | 'settings'>('analytics');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('guest')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Guest Menu</span>
          </button>

          <div className="h-4 w-px bg-stone-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xl">{brand.logo}</span>
            <div>
              <span className="font-display font-bold text-base text-white block leading-none">
                {brand.name[language]}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                Operator Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.analyticsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'ingestion'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.ingestMenuTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'editor'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.menuEditorTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.settingsTab}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'analytics' && <AdminDashboard />}
        {activeTab === 'ingestion' && <MenuIngestionWizard />}
        {activeTab === 'editor' && <MenuEditor />}
        {activeTab === 'settings' && <RestaurantSettings />}
      </main>
    </div>
  );
};
