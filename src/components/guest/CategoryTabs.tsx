import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Utensils, Flame, Zap, Salad, Sun, Coffee } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-3.5 h-3.5" />,
  Flame: <Flame className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Salad: <Salad className="w-3.5 h-3.5" />,
  Sun: <Sun className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
};

export const CategoryTabs: React.FC = () => {
  const { categories, filters, setActiveCategory, language, dishes } = useRestaurant();

  const getDishCount = (catId: string) => {
    if (catId === 'all') return dishes.filter((d) => !d.isHidden).length;
    return dishes.filter((d) => !d.isHidden && d.category === catId).length;
  };

  return (
    <div className="px-4 py-2 border-b border-stone-800/80 bg-stone-950/60">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = filters.activeCategory === cat.id;
          const count = getDishCount(cat.id);
          const icon = cat.icon ? iconMap[cat.icon] : null;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-stone-900/50 text-stone-400 border border-transparent hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              {icon}
              <span>{cat.name[language]}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-amber-500/30 text-amber-200' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
