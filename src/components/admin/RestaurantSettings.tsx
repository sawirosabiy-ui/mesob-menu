import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Save, CheckCircle2 } from 'lucide-react';

export const RestaurantSettings: React.FC = () => {
  const { brand, updateBrand, t } = useRestaurant();
  const [formData, setFormData] = useState(brand);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-stone-900/80 border border-stone-800">
        <h2 className="text-xl font-bold font-display text-white mb-1">
          {t.settingsTab}
        </h2>
        <p className="text-xs text-stone-400 mb-6">
          Customize restaurant identity, branding, and table touchpoints.
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 font-medium mb-1">
                Restaurant Name (English)
              </label>
              <input
                type="text"
                value={formData.name.en}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1">
                Restaurant Name (Amharic)
              </label>
              <input
                type="text"
                value={formData.name.am}
                onChange={(e) =>
                  setFormData({ ...formData, name: { ...formData.name, am: e.target.value } })
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-400 font-medium mb-1">
                Tagline / Cultural Mission
              </label>
              <input
                type="text"
                value={formData.tagline.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tagline: { ...formData.tagline, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-400 font-medium mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1">
                Brand Icon / Emoji Logo
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white text-center text-lg"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-400 font-medium mb-1">
                Physical Address (Addis Ababa)
              </label>
              <input
                type="text"
                value={formData.address.en}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Branding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
