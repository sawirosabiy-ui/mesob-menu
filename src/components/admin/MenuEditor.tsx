import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Dish } from '../../types';
import {
  Plus,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Sparkles,
  Flame,
  X,
  Check,
} from 'lucide-react';

export const MenuEditor: React.FC = () => {
  const {
    dishes,
    updateDish,
    toggleSoldOut,
    toggleHideDish,
    addDish,
    language,
    t,
  } = useRestaurant();

  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New dish empty skeleton
  const [newDishForm, setNewDishForm] = useState<Partial<Dish>>({
    name: { en: '', am: '' },
    description: { en: '', am: '' },
    price: 450,
    category: 'traditional',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    tags: ['Traditional', 'Popular'],
    popularity: 'regular',
    isAvailable: true,
    spiceLevel: 'medium',
    ingredients: { en: ['Fresh herbs', 'Spices'], am: ['ቅመሞች'] },
    allergens: { contains: [], potential: [] },
    nutrition: { calories: 450, protein: 25, carbs: 30, fat: 15, isEstimate: true },
    explanation: {
      whatIsIt: { en: 'Authentic house specialty.', am: 'ልዩ የቤቱ ምግብ።' },
      whatDoesItTasteLike: { en: 'Rich and flavorful.', am: 'ጣፋጭና መዓዛ ያለው።' },
      whatShouldIExpect: { en: 'Served hot with injera.', am: 'ትኩስ ሆኖ ከእንጀራ ጋር ይቀርባል።' },
    },
    pairings: [],
    comparison: {
      spiceLevel: 'Medium',
      style: { en: 'House Specialty', am: 'የቤቱ ልዩ ስልት' },
      proteinType: { en: 'Prime Cut', am: 'ስጋ' },
      bestFor: { en: 'Flavor enthusiasts', am: 'ጣፋጭ ምግብ ለሚወዱ' },
    },
  });

  const handleSaveEdit = () => {
    if (editingDish) {
      updateDish(editingDish.id, editingDish);
      setEditingDish(null);
    }
  };

  const handleCreateDish = () => {
    if (!newDishForm.name?.en || !newDishForm.price) return;
    const created: Dish = {
      ...newDishForm,
      id: `dish-${Date.now()}`,
    } as Dish;
    addDish(created);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-stone-900/80 border border-stone-800">
        <div>
          <h2 className="text-xl font-bold font-display text-white">
            {t.menuEditorTab}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time catalog management. Updates appear immediately on guests' mobile screens.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewDish}</span>
        </button>
      </div>

      {/* Menu Table / Cards */}
      <div className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/80 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
              <tr>
                <th className="p-4">{t.dishNameLabel}</th>
                <th className="p-4">{t.categoryLabel}</th>
                <th className="p-4">{t.dishPriceLabel}</th>
                <th className="p-4">{t.statusLabel}</th>
                <th className="p-4 text-right">{t.actionsLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {dishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-stone-800/30 transition">
                  {/* Dish Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={dish.image}
                        alt={dish.name[language]}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {dish.name[language]}
                          </span>
                          {dish.popularity === 'signature' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                              Signature
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400 line-clamp-1">
                          {dish.description[language]}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-4 capitalize text-stone-300 font-medium">
                    {dish.category}
                  </td>

                  {/* Price */}
                  <td className="p-4 font-mono font-bold text-amber-400 text-sm">
                    {dish.price} {t.currency}
                  </td>

                  {/* Availability Status */}
                  <td className="p-4">
                    <button
                      onClick={() => toggleSoldOut(dish.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        dish.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {dish.isAvailable ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>{t.availableText}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>{t.soldOutText}</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => toggleHideDish(dish.id)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition"
                      title={dish.isHidden ? 'Unhide' : 'Hide from guests'}
                    >
                      {dish.isHidden ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingDish(dish)}
                      className="p-1.5 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 transition"
                      title={t.editDish}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display">
                {t.editDish}: {editingDish.name[language]}
              </h3>
              <button
                onClick={() => setEditingDish(null)}
                className="p-1.5 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Dish Name (EN)</label>
                <input
                  type="text"
                  value={editingDish.name.en}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      name: { ...editingDish.name, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Dish Name (Amharic)</label>
                <input
                  type="text"
                  value={editingDish.name.am}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      name: { ...editingDish.name, am: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Price ({t.currency})</label>
                <input
                  type="number"
                  value={editingDish.price}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Category</label>
                <select
                  value={editingDish.category}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                >
                  <option value="traditional">Traditional Wot</option>
                  <option value="sizzling">Sizzling Tibs</option>
                  <option value="vegetarian">Plant & Fasting</option>
                  <option value="breakfast">Breakfast & Firfir</option>
                  <option value="beverages">Coffee & Drinks</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingDish.image}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, image: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1">Description (EN)</label>
                <textarea
                  rows={2}
                  value={editingDish.description.en}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      description: { ...editingDish.description, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                />
              </div>

              {/* What to expect */}
              <div className="sm:col-span-2">
                <label className="block text-amber-300 font-semibold mb-1">
                  What should I expect? (Max 2 sentences)
                </label>
                <textarea
                  rows={2}
                  value={editingDish.explanation.whatShouldIExpect.en}
                  onChange={(e) =>
                    setEditingDish({
                      ...editingDish,
                      explanation: {
                        ...editingDish.explanation,
                        whatShouldIExpect: {
                          ...editingDish.explanation.whatShouldIExpect,
                          en: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-amber-600/40 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => setEditingDish(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Dish Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display">
                {t.addNewDish}
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Dish Name (EN)</label>
                <input
                  type="text"
                  placeholder="e.g. Bozena Shiro"
                  value={newDishForm.name?.en || ''}
                  onChange={(e) =>
                    setNewDishForm({
                      ...newDishForm,
                      name: { en: e.target.value, am: newDishForm.name?.am || e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Price ({t.currency})</label>
                <input
                  type="number"
                  value={newDishForm.price || 400}
                  onChange={(e) =>
                    setNewDishForm({
                      ...newDishForm,
                      price: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Appetizing description..."
                  value={newDishForm.description?.en || ''}
                  onChange={(e) =>
                    setNewDishForm({
                      ...newDishForm,
                      description: { en: e.target.value, am: newDishForm.description?.am || e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateDish}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Create Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
