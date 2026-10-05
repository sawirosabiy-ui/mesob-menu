import React, { useState, useRef, useEffect } from "react";
import { useMesob } from "../../context/MesobContext";
import {
  X,
  Sparkles,
  Send,
  Users,
  Flame,
  Salad,
  Plus,
  Minus,
  Check,
  Sun,
  Clock,
  Compass,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  ShoppingBag,
  Info,
  Layers,
} from "lucide-react";
import { Dish } from "../../types/mesob";
import { MesobImage } from "../common/MesobImage";
import { contextEngine } from "../../services/contextEngine";
import { aiConcierge, AIResponse, ConversationTurn } from "../../services/aiConciergeService";
import { triggerAddToCartAnimation } from "../common/FlyToCartOverlay";

interface SmartMenuModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  dishes?: Dish[];
  suggestedFollowUps?: string[];
  isMealCombo?: boolean;
  mealRationale?: string;
  totalPriceETB?: number;
  timestamp: string;
}

export const SmartMenuModal: React.FC<SmartMenuModalProps> = ({ isOpen, onClose }) => {
  const {
    isSmartMenuOpen: contextIsOpen,
    setIsSmartMenuOpen,
    config,
    addToCart,
    updateQuantity,
    removeFromCart,
    cart,
    cartTotal,
    cartItemCount,
    selectDish,
    tableNumber,
    formatPrice,
    getLocalizedDishName,
    t,
  } = useMesob();

  const isModalOpen = isOpen !== undefined ? isOpen : contextIsOpen;
  const handleClose = () => {
    if (onClose) onClose();
    setIsSmartMenuOpen(false);
  };

  const diningContext = contextEngine.getContext();
  const headline = contextEngine.getContextualHeadline();

  // Active view: Conversation or Meal Builder
  const [activeTab, setActiveTab] = useState<"ask" | "builder">("ask");

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "concierge",
      text: `Selam & Welcome to ${config.branding.name} (Table ${tableNumber})! It is currently ${diningContext.temperatureC}°C in Addis Ababa (${diningContext.weatherDescription}).\n\nI can recommend dishes suited for this temperature, curate sharing feasts for your table, pair drinks with your cart, or filter by spice and fasting preferences. How can I assist your table today?`,
      suggestedFollowUps: [
        `Comfort food for ${diningContext.temperatureC}°C`,
        "Feast for 2 people",
        "100% Fasting / Vegan (Yetsom)",
        "Dishes under 500 ETB",
      ],
      timestamp: "Just now",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedDishIds, setAddedDishIds] = useState<Record<string, boolean>>({});

  // Meal builder state
  const [partySize, setPartySize] = useState(2);
  const [fastingOnly, setFastingOnly] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [spicePref, setSpicePref] = useState<"all" | "mild" | "medium" | "spicy">("all");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && activeTab === "ask") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isModalOpen, activeTab]);

  if (!isModalOpen) return null;

  // Dynamic Situation Chips
  const dynamicChips = aiConcierge.getDynamicSituations(config.dishes, cart);

  const handleSendQuery = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsTyping(true);

    const history: ConversationTurn[] = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const response: AIResponse = await aiConcierge.processQuery(
        query,
        config.dishes,
        cart,
        history
      );

      setIsTyping(false);

      const conciergeMsg: ChatMessage = {
        id: `c-${Date.now()}`,
        sender: "concierge",
        text: response.text,
        dishes: response.dishes,
        suggestedFollowUps: response.suggestedFollowUps,
        isMealCombo: response.isMealCombo,
        mealRationale: response.mealRationale,
        totalPriceETB: response.totalPriceETB,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, conciergeMsg]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `c-err-${Date.now()}`,
          sender: "concierge",
          text: "I apologize, I encountered a slight hiccup analyzing the menu. Here are our Chef's signature classics:",
          dishes: config.dishes.filter((d) => d.isSignature).slice(0, 3),
          timestamp: "Just now",
        },
      ]);
    }
  };

  const handleAddDish = (dish: Dish, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      triggerAddToCartAnimation(e.currentTarget, {
        image: dish.image,
        name: getLocalizedDishName(dish),
      });
    }
    addToCart(dish, 1);
    setAddedDishIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedDishIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const handleAddComboToCart = (dishes: Dish[]) => {
    dishes.forEach((d) => {
      addToCart(d, 1);
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `c-combo-added-${Date.now()}`,
        sender: "concierge",
        text: `✨ Added all ${dishes.length} feast items to your Table ${tableNumber} order! You can view and customize quantities in your Table Order.`,
        suggestedFollowUps: ["View Table Order", "Recommend desserts", "Suggest drinks"],
        timestamp: "Just now",
      },
    ]);
  };

  // Filtered dishes for meal builder
  const builderDishes = config.dishes.filter((dish) => {
    if (fastingOnly && !dish.isFasting && dish.category !== "vegetarian") return false;
    if (spicePref === "mild" && dish.spiceLevel !== "mild" && dish.spiceLevel !== "none") return false;
    if (spicePref === "spicy" && dish.spiceLevel !== "spicy" && dish.spiceLevel !== "extra-spicy") return false;
    if (maxBudget && dish.price > maxBudget) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in select-none p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-charcoal-950 border border-stone-800 rounded-t-3xl sm:rounded-3xl flex flex-col h-[92vh] max-h-[840px] shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-stone-800/80 bg-charcoal-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-300 flex items-center justify-center text-charcoal-950 shadow-md">
              <Sparkles className="w-5 h-5 text-charcoal-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-semibold text-gold-200 tracking-wide">
                  ✦ Ask Concierge
                </h2>
                <span className="text-[10px] text-stone-500 font-sans">• Table {tableNumber}</span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono">
                {diningContext.temperatureC}°C · {diningContext.weatherDescription}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-charcoal-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
            aria-label="Close concierge"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle: [ Conversation | Meal Builder ] */}
        <div className="px-4 pt-2.5 pb-2 bg-charcoal-950 flex items-center gap-2 border-b border-stone-800/60">
          <button
            onClick={() => setActiveTab("ask")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ask"
                ? "bg-gold-500/15 border-gold-500/50 text-gold-300 shadow-sm"
                : "bg-charcoal-900 border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>AI Dining Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "builder"
                ? "bg-gold-500/15 border-gold-500/50 text-gold-300 shadow-sm"
                : "bg-charcoal-900 border-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-gold-400" />
            <span>Party Meal Builder</span>
          </button>
        </div>

        {/* Tab 1: Conversational AI Dining Advisor */}
        {activeTab === "ask" && (
          <>
            {/* Dynamic Situation Chips Bar */}
            <div className="px-3 py-2 border-b border-stone-800/80 bg-charcoal-900/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              {dynamicChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(chip.query)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-charcoal-850 border border-stone-700/80 hover:border-gold-500/50 text-stone-300 hover:text-gold-200 transition-colors flex items-center gap-1"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gold-500/20 text-gold-200 border border-gold-500/40 rounded-br-none"
                        : "bg-charcoal-900 border border-stone-800 text-stone-200 rounded-bl-none shadow-md whitespace-pre-line"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-stone-500 mt-1.5 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Combo Meal Rationale & 1-Click Order Button */}
                  {msg.isMealCombo && msg.dishes && (
                    <div className="mt-2.5 w-full max-w-[94%] p-3 rounded-2xl bg-gold-950/30 border border-gold-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gold-300 uppercase tracking-wider">
                          ✦ Curated Table Feast
                        </span>
                        {msg.totalPriceETB && (
                          <span className="text-xs font-mono font-bold text-gold-300">
                            {formatPrice(msg.totalPriceETB).primary}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-300 font-light leading-relaxed">
                        {msg.mealRationale}
                      </p>
                      <button
                        onClick={() => handleAddComboToCart(msg.dishes || [])}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-charcoal-950 text-xs font-bold shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-charcoal-950" />
                        <span>Add All {msg.dishes.length} Dishes to Table Order</span>
                      </button>
                    </div>
                  )}

                  {/* Embedded Interactive Dish Cards */}
                  {msg.dishes && msg.dishes.length > 0 && (
                    <div className="mt-2.5 w-full max-w-[94%] space-y-2">
                      {msg.dishes.map((dish) => {
                        const cartItem = cart.find((item) => item.dish.id === dish.id);
                        const inCartQty = cartItem ? cartItem.quantity : 0;
                        const priceInfo = formatPrice(dish.price);

                        return (
                          <div
                            key={dish.id}
                            onClick={() => selectDish(dish)}
                            className="p-2.5 rounded-2xl bg-charcoal-850 border border-stone-800 hover:border-gold-500/40 flex items-center justify-between gap-3 shadow-md cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-800 bg-charcoal-950">
                                <MesobImage
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  fallbackText={dish.name}
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-display text-xs font-semibold text-stone-100 group-hover:text-gold-200 transition-colors truncate">
                                  {getLocalizedDishName(dish)}
                                </h4>
                                {dish.amharicName && (
                                  <p className="text-[10px] text-gold-400/80 font-serif leading-none truncate">
                                    {dish.amharicName}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs font-bold text-gold-300 font-display">
                                    {priceInfo.primary}
                                  </span>
                                  {dish.isFasting && (
                                    <span className="text-[8px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1 py-0.2 rounded">
                                      Yetsom
                                    </span>
                                  )}
                                  {(dish.spiceLevel === "spicy" || dish.spiceLevel === "extra-spicy") && (
                                    <span className="text-[9px]">🌶️</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Tactile In-Chat Add to Cart / Stepper */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 shrink-0"
                            >
                              {addedDishIds[dish.id] ? (
                                <div className="h-7 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 flex items-center gap-1 text-[10px] font-bold">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Added</span>
                                </div>
                              ) : inCartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-stone-900 border border-amber-500/40 rounded-full p-0.5 shadow-md">
                                  <button
                                    onClick={() => {
                                      if (cartItem) {
                                        if (cartItem.quantity <= 1) {
                                          removeFromCart(cartItem.id);
                                        } else {
                                          updateQuantity(cartItem.id, cartItem.quantity - 1);
                                        }
                                      }
                                    }}
                                    className="w-6 h-6 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center hover:bg-stone-700"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-3.5 text-center font-mono font-bold text-[11px] text-amber-300">
                                    {inCartQty}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (cartItem) {
                                        updateQuantity(cartItem.id, cartItem.quantity + 1);
                                      }
                                    }}
                                    className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center hover:bg-amber-500/30"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleAddDish(dish, e)}
                                  className="h-7 px-2.5 rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-charcoal-950 active:scale-90 transition-all flex items-center gap-1 text-[10px] font-bold shadow-sm"
                                  aria-label={`Add ${dish.name} to cart`}
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[94%]">
                      {msg.suggestedFollowUps.map((promptText, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendQuery(promptText)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 hover:border-gold-500/40 text-stone-300 hover:text-gold-200 transition"
                        >
                          {promptText} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-stone-400 text-xs italic bg-charcoal-900 border border-stone-800 px-3.5 py-2.5 rounded-2xl w-fit">
                  <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
                  <span>Thinking about Addis dining context & table pairings...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-stone-800 bg-charcoal-950">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask anything (e.g. weather comfort, mild meat, pairings)..."
                  className="flex-1 bg-charcoal-900 border border-stone-800 focus:border-gold-500/60 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 placeholder-stone-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-charcoal-950 font-bold transition-all shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* Tab 2: Party Meal Builder (Interactive Feast Generator) */}
        {activeTab === "builder" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-3 p-3.5 rounded-2xl bg-charcoal-900 border border-stone-800">
              <h3 className="font-display text-sm font-semibold text-gold-200">
                Custom Table Feast Builder
              </h3>

              {/* Party Size Selector */}
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Party Size (Guests at Table)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPartySize(num)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        partySize === num
                          ? "bg-gold-500 text-charcoal-950 border-gold-400"
                          : "bg-charcoal-800 border-stone-700 text-stone-300"
                      }`}
                    >
                      {num} {num === 1 ? "guest" : "guests"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fasting & Spice Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFastingOnly(!fastingOnly)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    fastingOnly
                      ? "bg-emerald-950/70 border-emerald-500 text-emerald-300"
                      : "bg-charcoal-800 border-stone-700 text-stone-400"
                  }`}
                >
                  <span>100% Vegan / Fasting</span>
                  <Salad className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <select
                  value={spicePref}
                  onChange={(e) => setSpicePref(e.target.value as any)}
                  className="p-2.5 rounded-xl bg-charcoal-800 border border-stone-700 text-xs text-stone-200 outline-none"
                >
                  <option value="all">Any Spice Level</option>
                  <option value="mild">Mild Only (Alicha)</option>
                  <option value="medium">Medium Heat</option>
                  <option value="spicy">Spicy (Berbere/Mitmita)</option>
                </select>
              </div>

              {/* One-Click Generate Combo Action */}
              <button
                onClick={() => {
                  setActiveTab("ask");
                  handleSendQuery(
                    `Build a recommended feast for ${partySize} guests${
                      fastingOnly ? " (100% Fasting/Vegan)" : ""
                    }${spicePref !== "all" ? ` with ${spicePref} spice` : ""}`
                  );
                }}
                className="w-full py-2.5 px-4 rounded-xl gold-gradient-btn text-charcoal-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Curated Feast with AI</span>
              </button>
            </div>

            {/* Matching Dishes List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Matching Dishes ({builderDishes.length})
                </h4>
              </div>

              <div className="space-y-2">
                {builderDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => selectDish(dish)}
                    className="p-2.5 rounded-2xl bg-charcoal-900/80 border border-stone-800 flex items-center justify-between gap-3 cursor-pointer hover:border-gold-500/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-800">
                        <MesobImage
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          fallbackText={dish.name}
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-display text-xs font-semibold text-stone-100 truncate">
                          {getLocalizedDishName(dish)}
                        </h5>
                        <p className="text-[11px] text-gold-300 font-display">
                          {formatPrice(dish.price).primary}
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 shrink-0"
                    >
                      <button
                        onClick={(e) => handleAddDish(dish, e)}
                        className={`p-2 rounded-xl border transition-all ${
                          addedDishIds[dish.id]
                            ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                            : "bg-gold-500/15 border-gold-500/40 text-gold-300 hover:bg-gold-500 hover:text-charcoal-950 active:scale-90"
                        }`}
                      >
                        {addedDishIds[dish.id] ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
