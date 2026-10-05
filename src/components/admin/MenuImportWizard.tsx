import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Store,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { restaurantRepo } from '../../services/restaurantRepository';
import { menuExtractionService, ExtractedMenuResult } from '../../services/menuExtractionService';
import { Restaurant, Dish, Category, Table, CurrencyCode } from '../../types/mesob';

interface MenuImportWizardProps {
  onComplete?: (restaurantId: string) => void;
  onCancel?: () => void;
}

type WizardStep = 'branding' | 'upload' | 'extracting' | 'review' | 'preview_publish' | 'tables_qr';

export const MenuImportWizard: React.FC<MenuImportWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<WizardStep>('branding');

  // Step 1: Restaurant Branding
  const [restName, setRestName] = useState('');
  const [restSlug, setRestSlug] = useState('');
  const [restTagline, setRestTagline] = useState('');
  const [restPhone, setRestPhone] = useState('+251 91 123 4567');
  const [restAddress, setRestAddress] = useState('Bole Road, Addis Ababa');
  const [restCurrency, setRestCurrency] = useState<CurrencyCode>('ETB');
  const [restLogo, setRestLogo] = useState('👑');

  // Step 2: Upload / Input
  const [menuInputText, setMenuInputText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Step 3 & 4: Extraction & Review
  const [extractionResult, setExtractionResult] = useState<ExtractedMenuResult | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(null);

  // Step 5: Created Tables & QR
  const [createdTables, setCreatedTables] = useState<Table[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Auto-fill slug from name
  const handleNameChange = (name: string) => {
    setRestName(name);
    if (!restSlug || restSlug === restName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setRestSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  };

  // Quick load sample menu
  const loadSample = (sampleText: string) => {
    setMenuInputText(sampleText);
    setUploadedFileName('sample_menu_addis.pdf');
  };

  // Run extraction
  const handleStartExtraction = () => {
    if (!menuInputText.trim()) return;

    setStep('extracting');

    setTimeout(() => {
      // Create or get restaurant first
      let rId = createdRestaurantId;
      if (!rId) {
        const slug = restSlug || `rest-${Date.now()}`;
        const newRest = restaurantRepo.createRestaurant({
          name: restName || 'New Heritage Restaurant',
          slug,
          description: restTagline || 'Authentic dining experience',
          phone: restPhone,
          address: restAddress,
          currency: restCurrency,
          logo: restLogo,
        });
        rId = newRest.id;
        setCreatedRestaurantId(newRest.id);
      }

      const result = menuExtractionService.parseMenuText(menuInputText, rId);
      setExtractionResult(result);
      setStep('review');
    }, 900);
  };

  // Save changes to an extracted dish
  const handleSaveDishEdit = (updated: Dish) => {
    if (!extractionResult) return;

    const newDishes = extractionResult.dishes.map((d) => {
      if (d.id === updated.id) {
        // If price and description are good, verify it!
        const isNowVerified = updated.price > 0 && updated.description.length >= 10;
        return {
          ...updated,
          extractionStatus: isNowVerified ? ('verified' as const) : ('needs_review' as const),
          reviewNotes: isNowVerified ? [] : updated.reviewNotes,
        };
      }
      return d;
    });

    const needsReview = newDishes.filter((d) => d.extractionStatus === 'needs_review').length;

    setExtractionResult({
      ...extractionResult,
      dishes: newDishes,
      needsReviewCount: needsReview,
      verifiedCount: newDishes.length - needsReview,
    });

    setEditingDish(null);
  };

  // Commit to Draft Menu & Move to Preview/Publish
  const handleCommitToDraft = () => {
    if (!createdRestaurantId || !extractionResult) return;

    // Save each extracted category and dish into draft menu
    const draftMenu = restaurantRepo.getDraftMenu(createdRestaurantId);

    // Merge categories
    extractionResult.categories.forEach((cat) => {
      if (!draftMenu.categories.some((c) => c.id === cat.id)) {
        draftMenu.categories.push(cat);
      }
    });

    // Add dishes
    extractionResult.dishes.forEach((dish) => {
      restaurantRepo.saveDraftDish(createdRestaurantId, dish);
    });

    setStep('preview_publish');
  };

  // Publish changes to live menu
  const handlePublishMenu = () => {
    if (!createdRestaurantId) return;

    restaurantRepo.publishMenu(createdRestaurantId, 'Onboarding Owner');
    setIsPublished(true);

    // Fetch or create tables
    const tables = restaurantRepo.getTables(createdRestaurantId);
    setCreatedTables(tables);

    setStep('tables_qr');
  };

  // Add a table
  const handleAddTable = () => {
    if (!createdRestaurantId) return;
    const nextNum = String(createdTables.length + 1);
    const tbl = restaurantRepo.createTable(createdRestaurantId, nextNum, `Table ${nextNum}`);
    setCreatedTables([...createdTables, tbl]);
  };

  const currentRestaurant = createdRestaurantId
    ? restaurantRepo.getRestaurantById(createdRestaurantId)
    : null;

  return (
    <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl text-stone-100">
      {/* Stepper Header */}
      <div className="mb-8 border-b border-stone-800 pb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">
              MESOB RESTAURANT ONBOARDING ENGINE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-display mt-0.5">
              Launch Your Digital Restaurant
            </h2>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-stone-400 hover:text-stone-200 text-xs px-3 py-1.5 rounded-lg border border-stone-800"
            >
              Exit Setup
            </button>
          )}
        </div>

        {/* Visual Progress Steps */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto no-scrollbar py-1 text-xs">
          {[
            { key: 'branding', label: '1. Brand' },
            { key: 'upload', label: '2. Upload' },
            { key: 'review', label: '3. Review & Edit' },
            { key: 'preview_publish', label: '4. Publish' },
            { key: 'tables_qr', label: '5. Table QRs' },
          ].map((s) => {
            const isCurrent = step === s.key;
            return (
              <span
                key={s.key}
                className={`px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                  isCurrent
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'bg-stone-800/80 text-stone-400'
                }`}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* STEP 1: BRANDING */}
      {step === 'branding' && (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200 leading-relaxed">
            Enter your restaurant details. MESOB uses this information to personalize your digital menu,
            configure table routing, and set your currency.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={restName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Lucy Ethiopian Restaurant & Lounge"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Menu URL Slug * (e.g. /r/lucy-addis)
              </label>
              <input
                type="text"
                value={restSlug}
                onChange={(e) => setRestSlug(e.target.value)}
                placeholder="lucy-addis"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Brand Icon / Logo Emoji
              </label>
              <div className="flex gap-2">
                {['👑', '🔥', '🍽️', '☕', '🍲', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setRestLogo(emoji)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition ${
                      restLogo === emoji
                        ? 'border-amber-500 bg-amber-500/20 shadow'
                        : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Base Currency
              </label>
              <select
                value={restCurrency}
                onChange={(e) => setRestCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="ETB">ETB - Ethiopian Birr (ብር)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Cuisine Tagline / Subtitle
              </label>
              <input
                type="text"
                value={restTagline}
                onChange={(e) => setRestTagline(e.target.value)}
                placeholder="e.g. Authentic Wood-Fired Stews & Sizzling Clay Pot Delights"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={restPhone}
                onChange={(e) => setRestPhone(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={restAddress}
                onChange={(e) => setRestAddress(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                if (!restName) handleNameChange('Lucy Restaurant & Lounge');
                setStep('upload');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow transition"
            >
              <span>Continue to Menu Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD MENU */}
      {step === 'upload' && (
        <div className="space-y-6">
          <div className="bg-stone-950 border border-dashed border-stone-700 hover:border-amber-500/80 rounded-2xl p-6 sm:p-8 text-center transition">
            <UploadCloud className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h3 className="font-bold text-base text-stone-100">
              Upload Your Menu (PDF, Image, or Text)
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto mt-1 mb-4">
              Upload your restaurant's physical menu scan, photo, or paste your menu text directly below.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold cursor-pointer border border-stone-700 transition">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Choose File (PDF / JPG / PNG / TXT)</span>
              <input
                type="file"
                accept=".txt,.pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      if (text && typeof text === 'string') {
                        setMenuInputText(text);
                      } else {
                        // Image / PDF fallback simulator
                        loadSample(menuExtractionService.getSampleRawMenus()[0].text);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>

            {uploadedFileName && (
              <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Loaded file: {uploadedFileName}</span>
              </div>
            )}
          </div>

          {/* Quick preset templates */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 font-semibold">Or load real sample menu:</span>
            {menuExtractionService.getSampleRawMenus().map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample.text)}
                className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition font-medium"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Menu Content / OCR Transcribed Text:
            </label>
            <textarea
              rows={8}
              value={menuInputText}
              onChange={(e) => setMenuInputText(e.target.value)}
              placeholder="Paste dishes here... (e.g. Doro Wot | 550 ETB, Special Beef Tibs | 720 ETB, Shiro | 240 ETB)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => setStep('branding')}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleStartExtraction}
              disabled={!menuInputText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm shadow transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract Menu Items</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EXTRACTING PROGRESS */}
      {step === 'extracting' && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-bold text-lg text-amber-100 font-display">
            Analyzing Menu Structure & Prices...
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Detecting categories, prices, fasting suitability, spice heat levels, and flagging any uncertain items for review.
          </p>
        </div>
      )}

      {/* STEP 4: REVIEW & EDIT */}
      {step === 'review' && extractionResult && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div>
              <span className="text-xs text-stone-400">Total Items Extracted:</span>
              <div className="text-xl font-bold font-mono text-amber-300">
                {extractionResult.totalExtracted} Dishes in {extractionResult.categories.length} Categories
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{extractionResult.verifiedCount} Verified</span>
              </div>

              {extractionResult.needsReviewCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{extractionResult.needsReviewCount} Needs Review</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-stone-400">
            Click <strong className="text-amber-300">Edit</strong> on any dish to refine its name, price, description, or dietary flags. Items marked <span className="text-amber-400">Needs Review</span> should be checked before publishing.
          </div>

          {/* Dishes List Grouped or Filtered */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {extractionResult.dishes.map((dish) => {
              const needsReview = dish.extractionStatus === 'needs_review';

              return (
                <div
                  key={dish.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    needsReview
                      ? 'bg-amber-950/15 border-amber-700/50'
                      : 'bg-stone-950 border-stone-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm text-stone-100">{dish.name}</span>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                        {dish.price > 0 ? `${dish.price} ETB` : 'No Price'}
                      </span>

                      {needsReview ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Needs Review</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}

                      {dish.isFasting && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400">
                          Fasting / Vegan
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-2">{dish.description}</p>

                    {needsReview && dish.reviewNotes && dish.reviewNotes.length > 0 && (
                      <div className="mt-1 text-[11px] text-amber-400 font-mono">
                        ⚠ {dish.reviewNotes.join(' · ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingDish(dish)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => setStep('upload')}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>

            <button
              onClick={handleCommitToDraft}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow transition"
            >
              <span>Save to Draft Menu & Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SINGLE DISH INLINE */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-amber-200">Edit Extracted Dish</h3>
              <button
                onClick={() => setEditingDish(null)}
                className="text-stone-400 hover:text-white text-xs px-2 py-1"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-300 mb-1">Dish Name</label>
                <input
                  type="text"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Price (ETB) *</label>
                <input
                  type="number"
                  value={editingDish.price || ''}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="e.g. 550"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 font-mono text-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-200"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isFasting || false}
                    onChange={(e) =>
                      setEditingDish({
                        ...editingDish,
                        isFasting: e.target.checked,
                        isVegetarian: e.target.checked,
                      })
                    }
                    className="rounded text-amber-500 bg-stone-950 border-stone-800"
                  />
                  <span className="text-stone-300">Fasting / Vegan (Ye'tsom)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDish.isSignature || false}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, isSignature: e.target.checked })
                    }
                    className="rounded text-amber-500 bg-stone-950 border-stone-800"
                  />
                  <span className="text-stone-300">Chef Signature</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDishEdit(editingDish)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow"
              >
                Save & Mark Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PREVIEW & PUBLISH */}
      {step === 'preview_publish' && (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200">
            <strong>Draft Menu Ready!</strong> The manager can review how customers will view the menu.
            Edits are saved in the <strong>DRAFT</strong> version. Clicking <strong>PUBLISH CHANGES</strong> will make this menu live for table QR codes.
          </div>

          <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{currentRestaurant?.logo || '👑'}</span>
                <div>
                  <h4 className="font-bold text-base text-stone-100">
                    {typeof currentRestaurant?.name === 'string'
                      ? currentRestaurant?.name
                      : currentRestaurant?.name.en}
                  </h4>
                  <span className="text-xs text-stone-400 font-mono">
                    /r/{currentRestaurant?.slug}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Draft Status
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {extractionResult?.dishes.map((dish) => (
                <div key={dish.id} className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex justify-between gap-2">
                  <div>
                    <div className="font-semibold text-xs text-stone-200">{dish.name}</div>
                    <div className="text-[11px] text-stone-400 line-clamp-1">{dish.description}</div>
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 shrink-0">
                    {dish.price} ETB
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => setStep('review')}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              onClick={handlePublishMenu}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow transition"
            >
              <Check className="w-4 h-4" />
              <span>PUBLISH CHANGES TO LIVE MENU</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CREATE TABLES & GENERATE QR */}
      {step === 'tables_qr' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-xs text-emerald-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <strong className="block text-sm font-bold text-emerald-300">
                🎉 Congratulations! Your Menu is Published Live.
              </strong>
              <span>
                Tables and QR codes are generated. Guests can scan to order directly to your kitchen.
              </span>
            </div>
            <button
              onClick={handleAddTable}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Table</span>
            </button>
          </div>

          {/* Tables QR Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1">
            {createdTables.map((tbl) => {
              const guestUrl = `/r/${currentRestaurant?.slug || 'lucy'}/t/${tbl.token}`;

              return (
                <div
                  key={tbl.id}
                  className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-white p-1 rounded-lg mx-auto flex items-center justify-center text-stone-950">
                    <QrCode className="w-12 h-12" />
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-stone-100">{tbl.name}</h5>
                    <div className="text-[11px] font-mono text-amber-400 truncate">
                      {guestUrl}
                    </div>
                  </div>

                  <a
                    href={`#${guestUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open as Guest</span>
                  </a>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-800">
            <button
              onClick={() => {
                if (createdRestaurantId) {
                  restaurantRepo.setActiveRestaurantId(createdRestaurantId);
                }
                if (onComplete) onComplete(createdRestaurantId || '');
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow transition"
            >
              <span>Go to Manager Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
