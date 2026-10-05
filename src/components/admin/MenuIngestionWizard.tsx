import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Dish } from '../../types';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Edit3,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Flame,
} from 'lucide-react';

const mockExtractedDishes: Dish[] = [
  {
    id: 'gomen-besiga',
    name: {
      en: 'Gomen Be Siga (Collards with Prime Beef)',
      am: 'ጎመን በስጋ',
    },
    description: {
      en: 'Braised tender collard greens simmered with succulent beef cubes, garlic, ginger, and spiced clarified butter.',
      am: 'የተመረጠ የበሬ ስጋ ከጎመን፣ ሽንኩርት፣ ነጭ ሽንኩርትና ንጥር ቅቤ ጋር ተቁላልቶ የሚዘጋጅ ተወዳጅ ወጥ።',
    },
    price: 520,
    category: 'traditional',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    tags: ['Traditional', 'Savory', 'Popular'],
    popularity: 'popular',
    isAvailable: true,
    spiceLevel: 'mild',
    explanation: {
      whatIsIt: {
        en: 'A hearty staple combining slow-braised leafy collard greens with tender beef ribs/chunks bathed in spiced clarified butter.',
        am: 'በቅቤና በቅመም የተቁላላ ለስላሳ የጎመንና የበሬ ስጋ ድብልቅ ምግብ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Earthy, buttery, and deeply savory with sweet garlic undertones and no overwhelming chili heat.',
        am: 'የቅቤና የጎመን ውህደት ያለው ለስላሳና እጅግ የሚጣፍጥ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Silky, velvety greens wrapped around fork-tender beef bites. Eaten with warm sourdough injera.',
        am: 'ከለስላሳ የበሬ ስጋ ጋር በጣፋጭ ጎመን የተዘጋጀ ሲሆን በእንጀራ ይበላል።',
      },
    },
    ingredients: {
      en: ['Fresh collard greens', 'Prime beef cubes', 'Niter Kibbeh', 'Garlic & Ginger', 'Onions', 'Cardamom'],
      am: ['ትኩስ ጎመን', 'የበሬ ስጋ', 'ንጥር ቅቤ', 'ነጭ ሽንኩርትና ዝንጅብል', 'ቀይ ሽንኩርት', 'ኮረሪማ'],
    },
    allergens: {
      contains: ['Milk (Dairy in Niter Kibbeh)'],
      potential: [],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Please confirm with restaurant staff if you have a serious allergy.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 480,
      protein: 36,
      carbs: 14,
      fat: 32,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'habesha-beer',
        name: { en: 'Habesha Cold Lager', am: 'ሐበሻ ቢራ' },
        category: 'beverages',
        description: { en: 'Crisp cold Ethiopian beer.', am: 'ቀዝቃዛ ቢራ።' },
        price: 110,
        image: 'https://images.unsplash.com/photo-1608270119854-47ef00155b93?auto=format&fit=crop&w=600&q=80',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'Mild',
      style: { en: 'Braised Greens & Beef', am: 'በስጋ የተቁላላ ጎመን' },
      proteinType: { en: 'Beef & Greens', am: 'የበሬ ስጋ' },
      bestFor: { en: 'Those seeking rich savory flavor without spicy heat', am: 'ቅመም የማይፈልጉ ተመጋቢዎች' },
    },
  },
  {
    id: 'kik-alicha-special',
    name: {
      en: 'Kik Alicha (Turmeric Split Pea Stew)',
      am: 'የክክ አልጫ ወጥ',
    },
    description: {
      en: 'Yellow split peas slow-cooked until meltingly tender in a fragrant mild sauce with golden turmeric, garlic, and ginger.',
      am: 'በሽንኩርት፣ ነጭ ሽንኩርት፣ ዝንጅብልና እርድ ተቁላልቶ የሚዘጋጅ ለስላሳ የክክ አልጫ ወጥ።',
    },
    price: 310,
    category: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
    tags: ['Vegetarian', 'Plant-based', 'Mild'],
    popularity: 'regular',
    isAvailable: true,
    spiceLevel: 'mild',
    explanation: {
      whatIsIt: {
        en: 'A gentle, turmeric-infused golden stew made from hulled yellow split peas.',
        am: 'ከቢጫ ክክ በእርድና በቅመሞች የሚዘጋጅ ቀላልና ለስላሳ የጾም ወጥ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Mild, sweet, earthy, with a soothing herbal turmeric aroma and creamy mouthfeel.',
        am: 'አልጫ የሆነ ጣፋጭና የሽንኩርት መዓዛ ያለው ለስላሳ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Smooth, creamy golden sauce dotted with tender peas. Zero chili burn, great for delicate palates.',
        am: 'ለስላሳና የማያቃጥል ወጥ ሲሆን በእንጀራ ተጠቅልሎ ይበላል።',
      },
    },
    ingredients: {
      en: ['Yellow split peas', 'Turmeric (Ird)', 'Onions', 'Garlic', 'Ginger', 'Sunflower oil'],
      am: ['የክክ ጥራጥሬ', 'እርድ', 'ሽንኩርት', 'ነጭ ሽንኩርት', 'ዝንጅብል', 'ዘይት'],
    },
    allergens: {
      contains: ['Legumes (Yellow split peas)'],
      potential: [],
      disclaimer: {
        en: '100% plant-based and vegan.',
        am: 'ሙሉ በሙሉ ከአትክልትና ጥራጥሬ የተዘጋጀ።',
      },
    },
    nutrition: {
      calories: 340,
      protein: 18,
      carbs: 52,
      fat: 8,
      isEstimate: true,
    },
    pairings: [],
    comparison: {
      spiceLevel: 'Mild',
      style: { en: 'Mild Turmeric Legume Stew', am: 'የክክ አልጫ ወጥ' },
      proteinType: { en: 'Yellow Split Peas', am: 'የክክ ፕሮቲን' },
      bestFor: { en: 'Kids, vegans, and low-spice diets', am: 'የማያቃጥል ለሚፈልጉ' },
    },
  },
];

export const MenuIngestionWizard: React.FC = () => {
  const { addExtractedDishes, language, t } = useRestaurant();

  const [step, setStep] = useState<'upload' | 'extracting' | 'review' | 'published'>('upload');
  const [extractProgress, setExtractProgress] = useState(1);
  const [extractedItems, setExtractedItems] = useState<Dish[]>(mockExtractedDishes);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  const handleStartExtraction = () => {
    setStep('extracting');
    setExtractProgress(1);

    setTimeout(() => setExtractProgress(2), 1200);
    setTimeout(() => setExtractProgress(3), 2400);
    setTimeout(() => {
      setStep('review');
    }, 3600);
  };

  const handleUpdateItem = (id: string, field: keyof Dish, value: any) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handlePublish = () => {
    addExtractedDishes(extractedItems);
    setStep('published');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {[
            { key: 'upload', label: '1. Upload' },
            { key: 'extracting', label: '2. AI Extract' },
            { key: 'review', label: '3. Verify & Edit' },
            { key: 'published', label: '4. Published' },
          ].map((s, idx) => {
            const isCurrent = step === s.key;
            const isDone =
              (s.key === 'upload' && step !== 'upload') ||
              (s.key === 'extracting' && (step === 'review' || step === 'published')) ||
              (s.key === 'review' && step === 'published');

            return (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-500/20'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs hidden sm:inline font-medium ${
                    isCurrent ? 'text-amber-300' : isDone ? 'text-emerald-400' : 'text-stone-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800 text-center space-y-6">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold font-display text-white mb-2">
              {t.uploadTitle}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t.uploadDesc}
            </p>
          </div>

          {/* Drag & Drop Box */}
          <div
            onClick={handleStartExtraction}
            className="border-2 border-dashed border-stone-700 hover:border-amber-500/80 rounded-3xl p-10 bg-stone-950/50 hover:bg-amber-950/10 transition cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition text-amber-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-stone-200">
              {t.dragDropText}
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Supports PDF, PNG, JPG scans up to 25MB
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>{t.useSampleMenu}</span>
            </div>
          </div>

          {/* Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3.5 rounded-2xl bg-stone-950/40 border border-stone-800/80">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                Zero Re-typing
              </span>
              <p className="text-[11px] text-stone-400">
                Extracts dish names, prices in ETB, and grouped categories automatically.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-950/40 border border-stone-800/80">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                Structured Explanations
              </span>
              <p className="text-[11px] text-stone-400">
                Generates cultural flavor profiles, "What to expect", and ingredient tags.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-950/40 border border-stone-800/80">
              <span className="text-xs font-bold text-amber-300 block mb-1">
                Mandatory Verification
              </span>
              <p className="text-[11px] text-stone-400">
                Never auto-publishes unverified data. You review every price & allergen first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AI EXTRACTION IN PROGRESS */}
      {step === 'extracting' && (
        <div className="p-12 rounded-3xl bg-stone-900/60 border border-stone-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold font-display text-white">
              {t.processingAI}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Analyzing layout, font structures, and culinary context...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-md mx-auto space-y-3 text-left text-xs">
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                extractProgress >= 1
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-stone-950/30 border-stone-800 text-stone-500'
              }`}
            >
              {extractProgress > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              )}
              <span>{t.aiStep1}</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                extractProgress >= 2
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-stone-950/30 border-stone-800 text-stone-500'
              }`}
            >
              {extractProgress > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : extractProgress === 2 ? (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-stone-600 shrink-0" />
              )}
              <span>{t.aiStep2}</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                extractProgress >= 3
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-stone-950/30 border-stone-800 text-stone-500'
              }`}
            >
              {extractProgress === 3 ? (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-stone-600 shrink-0" />
              )}
              <span>{t.aiStep3}</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SIDE-BY-SIDE VERIFICATION & EDITING */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-white">
                {t.reviewVerificationTitle}
              </h3>
              <p className="text-xs text-stone-400">
                {t.reviewVerificationDesc}
              </p>
            </div>
            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.publishToLive}</span>
            </button>
          </div>

          <div className="space-y-3">
            {extractedItems.map((dish) => (
              <div
                key={dish.id}
                className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={dish.image}
                      alt={dish.name[language]}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {dish.name[language]}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                          AI Parsed
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                        {dish.description[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-amber-400">
                      {dish.price} {t.currency}
                    </span>
                    <button
                      onClick={() => setIsEditingId(isEditingId === dish.id ? null : dish.id)}
                      className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit Form Drawer if selected */}
                {isEditingId === dish.id && (
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-stone-400 font-medium mb-1">
                        Dish Name (EN)
                      </label>
                      <input
                        type="text"
                        value={dish.name.en}
                        onChange={(e) =>
                          handleUpdateItem(dish.id, 'name', { ...dish.name, en: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 font-medium mb-1">
                        Price ({t.currency})
                      </label>
                      <input
                        type="number"
                        value={dish.price}
                        onChange={(e) =>
                          handleUpdateItem(dish.id, 'price', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Extracted Structured Intelligence Preview */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-amber-400 block mb-0.5">
                      What to expect:
                    </span>
                    <p className="text-stone-300 italic">
                      "{dish.explanation.whatShouldIExpect[language]}"
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-400 block mb-0.5">
                      Extracted Allergens:
                    </span>
                    <p className="text-stone-300">
                      {dish.allergens.contains.length > 0
                        ? dish.allergens.contains.join(', ')
                        : 'None detected'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: PUBLISHED SUCCESS */}
      {step === 'published' && (
        <div className="p-10 rounded-3xl bg-stone-900/60 border border-emerald-500/40 text-center space-y-4 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold font-display text-white">
            {t.publishedSuccess}
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            The {extractedItems.length} verified dishes are now live on the guest menu and ready for discovery.
          </p>

          <button
            onClick={() => setStep('upload')}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            Upload Another Menu Section
          </button>
        </div>
      )}
    </div>
  );
};
