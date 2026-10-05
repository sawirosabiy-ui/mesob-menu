import React, { useState } from "react";
import { Dish } from "../../types/mesob";
import { useMesob } from "../../context/MesobContext";
import { X, Send, Sparkles, Plus, Check } from "lucide-react";
import { MesobImage } from "../common/MesobImage";
import { triggerAddToCartAnimation } from "../common/FlyToCartOverlay";

interface DishConversationModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "advisor";
  text: string;
  time: string;
}

export const DishConversationModal: React.FC<DishConversationModalProps> = ({
  dish,
  isOpen,
  onClose,
}) => {
  const { addToCart, getLocalizedDishName, config } = useMesob();

  if (!isOpen || !dish) return null;

  const displayName = getLocalizedDishName(dish);

  // Pre-configured intelligent dish answers based on structured verified data
  const getInitialAdvisorGreeting = () => {
    return `You are asking about ${displayName}. What would you like to know? I can answer questions about ingredients, spice adjustments, fasting compliance, or ideal side pairings.`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "advisor",
      text: getInitialAdvisorGreeting(),
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [inCart, setInCart] = useState(false);

  // Scoped quick question chips specific to this food
  const quickQuestions = [
    `Can ${displayName} be made less spicy?`,
    `What drink pairs best with ${displayName}?`,
    `Is this fasting (Yetsom) compliant?`,
    `What sides go well with this?`,
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");

    // Simulate intelligent contextual scoped response
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("spic") || lower.includes("pepper") || lower.includes("berbere")) {
        if (dish.spiceLevel === "mild" || dish.spiceLevel === "none") {
          reply = `${displayName} is naturally mild with gentle ginger and turmeric aromatics, making it very comfortable for sensitive palates.`;
        } else {
          reply = `${displayName} features authentic slow-simmered Berbere with a bold medium kick. If desired, our kitchen can serve mild Ayib (Ethiopian cottage cheese) on the side to soften the heat.`;
        }
      } else if (lower.includes("fast") || lower.includes("yetsom") || lower.includes("vegan")) {
        if (dish.isFasting || dish.category === "vegetarian") {
          reply = `Yes! ${displayName} is 100% fasting (Yetsom) and vegan compliant, prepared without any butter (niter kibbeh) or animal products.`;
        } else {
          reply = `Note: ${displayName} is prepared with slow-braised meats and spiced clarified butter, so it is non-fasting. For fasting days, we recommend our Shiro Tegabino or Yetsom Beyaynetu platter.`;
        }
      } else if (lower.includes("drink") || lower.includes("pair") || lower.includes("wine")) {
        reply = `For ${displayName}, our traditional Honey Wine (Tej) or a cold St. George Draft balances the spices wonderfully. A hot cup of Sidama Buna coffee is the classic finish.`;
      } else if (lower.includes("side") || lower.includes("injera")) {
        reply = `${displayName} is served with warm, freshly-baked pure Teff Injera. An extra order of Gomen (collard greens) or Ayib cheese makes a delicious addition.`;
      } else {
        reply = `Regarding ${displayName}: It is prepared fresh to order by Chef ${config.branding.name}. It takes approx. 15–20 minutes to prepare and serve hot at your table.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "advisor",
          text: reply,
          time: "Just now",
        },
      ]);
    }, 600);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerAddToCartAnimation(e.currentTarget, {
      image: dish.image,
      name: displayName,
    });
    addToCart(dish, 1);
    setInCart(true);
    setTimeout(() => setInCart(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in select-none p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-charcoal-950 border border-stone-800 rounded-t-3xl sm:rounded-3xl flex flex-col h-[85vh] max-h-[750px] shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Scoped Dish Context */}
        <div className="p-4 border-b border-stone-800/80 bg-charcoal-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-800 shrink-0">
              <MesobImage
                src={dish.image}
                alt={displayName}
                className="w-full h-full object-cover"
                fallbackText={displayName}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <h3 className="font-display text-sm font-semibold text-gold-200 truncate">
                  Ask about {displayName}
                </h3>
              </div>
              <p className="text-[10px] text-stone-400 font-mono">
                Dish Conversation Context · {dish.price} ETB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gold-500/20 text-gold-200 border border-gold-500/40 rounded-br-none"
                    : "bg-charcoal-900 border border-stone-800 text-stone-200 rounded-bl-none shadow-md"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[9px] text-stone-500 mt-1 block text-right">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Dish Question Chips */}
        <div className="px-3 py-2 border-t border-stone-800/80 bg-charcoal-900/40 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-charcoal-850 border border-stone-700/80 hover:border-gold-500/50 text-stone-300 hover:text-gold-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Bottom Input & Add to Order Bar */}
        <div className="p-3 border-t border-stone-800 bg-charcoal-950 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask anything about ${displayName}...`}
              className="flex-1 bg-charcoal-900 border border-stone-800 focus:border-gold-500/60 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 placeholder-stone-500 outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-charcoal-950 font-bold transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Add To Order button */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              inCart
                ? "bg-emerald-950 border border-emerald-500 text-emerald-300"
                : "bg-charcoal-900 border border-gold-500/30 text-gold-300 hover:bg-gold-500/10"
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added to Order!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add {displayName} to Order ({dish.price} ETB)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
