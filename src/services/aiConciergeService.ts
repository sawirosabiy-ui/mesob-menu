import { Dish, CartItem, FormattedPrice } from '../types/mesob';
import { contextEngine, DiningContext } from './contextEngine';

export type IntentType =
  | 'DISCOVER'
  | 'EXPLAIN_DISH'
  | 'COMPARE'
  | 'RECOMMEND'
  | 'DIETARY'
  | 'ALLERGY'
  | 'BUDGET'
  | 'PAIRING'
  | 'MEAL_BUILD'
  | 'CART_ACTION'
  | 'ORDER_STATUS'
  | 'RESTAURANT_INFO'
  | 'TRANSLATION'
  | 'NUTRITION'
  | 'INGREDIENTS'
  | 'AVAILABILITY'
  | 'GENERAL_CONVERSATION';

export type FactConfidence = 'CONFIRMED' | 'LIKELY' | 'UNKNOWN' | 'CONFLICTING';

export interface AIAction {
  type: 'ADD_TO_CART' | 'SELECT_DISH' | 'NAVIGATE' | 'CLEAR_CART';
  payload?: any;
}

export interface AIResponse {
  intent: IntentType;
  text: string;
  dishes?: Dish[];
  suggestedFollowUps?: string[];
  isMealCombo?: boolean;
  mealRationale?: string;
  totalPriceETB?: number;
  actions?: AIAction[];
  confidence?: FactConfidence;
}

export interface ConversationTurn {
  sender: 'user' | 'concierge';
  text: string;
}

export class AIConciergeService {
  private static instance: AIConciergeService;

  public static getInstance(): AIConciergeService {
    if (!AIConciergeService.instance) {
      AIConciergeService.instance = new AIConciergeService();
    }
    return AIConciergeService.instance;
  }

  // Phonetic & common transliteration normalization for Ethiopian dishes
  private normalizeQuery(q: string): string {
    return q
      .toLowerCase()
      .replace(/dorowot|doro wot|doro wat|doro/g, 'doro-wot')
      .replace(/shirro|shiro wat|shiro tegabino|siro/g, 'shiro')
      .replace(/kefto|kitffo|kitfo/g, 'kitfo')
      .replace(/tibbs|tibs|beef tibs|shekla tibs/g, 'tibs')
      .replace(/beyaynet|beyaynetu|bayenatu|yetsom/g, 'beyaynetu')
      .replace(/fir fir|fitfit|firfir/g, 'firfir')
      .replace(/injira|ingera|enjera/g, 'injera')
      .replace(/buna|coffee|boona/g, 'coffee')
      .replace(/honey wine|tej|tedj/g, 'tej');
  }

  /**
   * Detects the guest's underlying intent following Mesob AI Core Intent Taxonomy
   */
  public detectIntent(rawQuery: string): IntentType {
    const q = rawQuery.toLowerCase();

    if (q.includes('allergy') || q.includes('allergic') || q.includes('nuts') || q.includes('peanut') || q.includes('dairy') || q.includes('gluten') || q.includes('celiac')) {
      return 'ALLERGY';
    }
    if (q.includes('fasting') || q.includes('yetsom') || q.includes('vegan') || q.includes('vegetarian') || q.includes('plant-based') || q.includes('meatless')) {
      return 'DIETARY';
    }
    if (q.includes('vs') || q.includes('compare') || q.includes('difference between') || q.includes('or should i get')) {
      return 'COMPARE';
    }
    if (q.includes('what is') || q.includes('how is') || q.includes('explain') || q.includes('tell me about') || q.includes('what does')) {
      return 'EXPLAIN_DISH';
    }
    if (q.includes('ingredient') || q.includes('what is in') || q.includes('made of') || q.includes('spices used')) {
      return 'INGREDIENTS';
    }
    if (q.includes('calories') || q.includes('protein') || q.includes('nutrition') || q.includes('healthy')) {
      return 'NUTRITION';
    }
    if (q.includes('budget') || q.includes('under') || q.includes('cost') || q.includes('price') || q.includes('cheap') || q.includes('birr') || q.includes('etb')) {
      return 'BUDGET';
    }
    if (q.includes('pair') || q.includes('drink with') || q.includes('what goes with') || q.includes('wine') || q.includes('beer with')) {
      return 'PAIRING';
    }
    if (q.includes('for 2') || q.includes('for 4') || q.includes('for two') || q.includes('for three') || q.includes('for four') || q.includes('sharing') || q.includes('feast') || q.includes('group') || q.includes('family')) {
      return 'MEAL_BUILD';
    }
    if (q.includes('add') || q.includes('remove') || q.includes('cart') || q.includes('order this') || q.includes('put in cart')) {
      return 'CART_ACTION';
    }
    if (q.includes('spicy') || q.includes('mild') || q.includes('recommend') || q.includes('popular') || q.includes('signature') || q.includes('first time') || q.includes('what should i order')) {
      return 'RECOMMEND';
    }
    if (q.includes('weather') || q.includes('temperature') || q.includes('cold') || q.includes('warm') || q.includes('hot outside') || q.includes('lunch') || q.includes('dinner')) {
      return 'DISCOVER';
    }

    return 'GENERAL_CONVERSATION';
  }

  /**
   * Generates dynamic situation chips based on current temperature, time, and table state
   */
  public getDynamicSituations(dishes: Dish[], cart: CartItem[]): { label: string; query: string; icon: string }[] {
    const ctx = contextEngine.getContext();
    const chips: { label: string; query: string; icon: string }[] = [];

    // Weather/temperature chip
    if (ctx.temperatureC <= 18) {
      chips.push({
        label: `🔥 Warm Comfort (${ctx.temperatureC}°C Evening)`,
        query: `What hot, comforting dishes are best for this ${ctx.temperatureC}°C cool evening?`,
        icon: 'flame',
      });
    } else {
      chips.push({
        label: `☀️ Refreshing for ${ctx.temperatureC}°C`,
        query: `What lighter dishes and chilled drinks do you recommend for ${ctx.temperatureC}°C afternoon?`,
        icon: 'sun',
      });
    }

    // Cart-aware pairing chip
    if (cart.length > 0) {
      const topDish = cart[0].dish;
      chips.push({
        label: `🍷 Pairings for ${topDish.name}`,
        query: `What drinks and side dishes pair well with the ${topDish.name} in my cart?`,
        icon: 'sparkles',
      });
    } else {
      chips.push({
        label: '👥 Feast for 2 Guests',
        query: 'Build a balanced communal meal for 2 guests with shared injera, meat, and vegetables.',
        icon: 'users',
      });
    }

    // Vegan/Fasting chip
    chips.push({
      label: '🥗 Fasting / Yetsom (Vegan)',
      query: 'What dishes on the menu are confirmed 100% fasting-friendly (Yetsom)?',
      icon: 'salad',
    });

    // Budget chip
    chips.push({
      label: '💰 Filling under 500 ETB',
      query: 'What are the most satisfying dishes under 500 ETB on this menu?',
      icon: 'dollar',
    });

    // Mild/Non-spicy chip
    chips.push({
      label: '🌿 Mild / Non-Spicy (Alicha)',
      query: 'Which dishes are mild and seasoned with turmeric rather than hot berbere?',
      icon: 'shield',
    });

    return chips;
  }

  /**
   * Main Conversational Reasoning Engine — Mesob AI Core
   */
  public async processQuery(
    rawQuery: string,
    allDishes: Dish[],
    cart: CartItem[],
    history: ConversationTurn[] = []
  ): Promise<AIResponse> {
    const q = rawQuery.toLowerCase();
    const norm = this.normalizeQuery(rawQuery);
    const ctx = contextEngine.getContext();
    const intent = this.detectIntent(rawQuery);

    // Read live dish availability to prevent recommending sold-out items
    let availabilityMap: Record<string, any> = {};
    try {
      const saved = localStorage.getItem('mesob_dish_availability');
      if (saved) availabilityMap = JSON.parse(saved);
    } catch {}

    const isAvailable = (id: string) => {
      const item = availabilityMap[id];
      if (!item) return true;
      return item.status === 'available';
    };

    // Filter available dishes for recommendation pools
    const availableDishes = allDishes.filter((d) => isAvailable(d.id));

    // Check if user is asking about a sold-out item
    const askedSoldOut = allDishes.find(
      (d) =>
        (q.includes(d.name.toLowerCase()) || (d.amharicName && q.includes(d.amharicName))) &&
        !isAvailable(d.id)
    );

    // =========================================================================
    // 1. ALLERGY & SAFETY-FIRST FOOD LOGIC (HIGH PRIORITY)
    // =========================================================================
    if (intent === 'ALLERGY') {
      if (q.includes('gluten') || q.includes('celiac') || q.includes('wheat')) {
        const teffNote = 'Our traditional injera is prepared from fermented teff grain. While teff itself is naturally gluten-free, please confirm with your server if you have severe celiac disease so the kitchen can ensure separate preparation.';
        const dishes = allDishes.filter(d => d.id === 'beyaynetu' || d.id === 'shiro-tegabino' || d.id === 'tibs');
        return {
          intent: 'ALLERGY',
          text: `**Gluten Information:**\n${teffNote}\n\nDishes that are prepared primarily from meat, legumes, and teff injera include:`,
          dishes: dishes.slice(0, 3),
          confidence: 'CONFIRMED',
          suggestedFollowUps: ['Does Shiro contain gluten?', 'Is Teff 100% pure?', 'Ask server to confirm'],
        };
      }

      if (q.includes('dairy') || q.includes('lactose') || q.includes('milk') || q.includes('butter')) {
        const dairyDishes = allDishes.filter(d => d.tags.includes('Meat') || d.id === 'royal-kitfo' || d.id === 'doro-wot');
        const nonDairyDishes = allDishes.filter(d => d.isFasting || d.category === 'vegetarian');
        return {
          intent: 'ALLERGY',
          text: `**Dairy Notice:** Traditional meat dishes and Kitfo are prepared with spiced clarified butter (**Niter Kibbeh**) or served with cottage cheese (**Ayib**).\n\nIf you have a dairy allergy, all **Fasting / Yetsom** dishes are prepared exclusively with vegetable oils and are 100% dairy-free:`,
          dishes: nonDairyDishes.slice(0, 3),
          confidence: 'CONFIRMED',
          suggestedFollowUps: ['Show 100% dairy-free dishes', 'Does Doro Wot have butter?', 'Confirm with staff'],
        };
      }

      if (q.includes('nut') || q.includes('peanut')) {
        return {
          intent: 'ALLERGY',
          text: `**Nut Allergy Notice:** Ethiopian stews primarily use legumes (chickpeas, split peas, lentils), sesame seeds, fenugreek, and spices. Peanuts are not standard in traditional wots, but cross-contact is always possible in commercial kitchens. We recommend confirming with your server.`,
          dishes: allDishes.filter(d => d.id === 'shiro-tegabino' || d.id === 'beyaynetu').slice(0, 2),
          confidence: 'UNKNOWN',
          suggestedFollowUps: ['Tell server about nut allergy', 'What ingredients in Shiro?'],
        };
      }
    }

    // =========================================================================
    // 2. DISH COMPARISON MODE
    // =========================================================================
    if (intent === 'COMPARE') {
      if ((q.includes('doro') && q.includes('tibs')) || (q.includes('wot') && q.includes('tibs'))) {
        const doro = allDishes.find(d => d.id === 'doro-wot');
        const tibs = allDishes.find(d => d.id === 'tibs');
        return {
          intent: 'COMPARE',
          text: `**Doro Wot vs Tibs:**\n\n• **Doro Wot** (${doro ? doro.price : 650} ETB) — Slow-simmered, saucy, and deeply spiced with berbere. Tender chicken and boiled egg. Rich and traditional.\n• **Tibs** (${tibs ? tibs.price : 550} ETB) — Sautéed prime beef cubes with rosemary, onions, and peppers. Meat-forward, savory, and less stew-like.\n\nIf you prefer rich sauce and slow heat, choose **Doro Wot**. If you prefer seared meat and fresh herbs, choose **Tibs**.`,
          dishes: [doro, tibs].filter(Boolean) as Dish[],
          suggestedFollowUps: ['Add Doro Wot to cart', 'Add Tibs to cart', 'Is Tibs spicy?'],
        };
      }

      if (q.includes('kitfo') && (q.includes('tibs') || q.includes('gored'))) {
        const kitfo = allDishes.find(d => d.id === 'royal-kitfo' || d.id === 'kitfo');
        const tibs = allDishes.find(d => d.id === 'tibs');
        return {
          intent: 'COMPARE',
          text: `**Kitfo vs Tibs:**\n\n• **Kitfo** (${kitfo ? kitfo.price : 750} ETB) — Finely minced lean beef warmed with spiced butter (Niter Kibbeh) and mitmita chili. Melt-in-mouth texture, served raw or lightly warmed (Leb-Leb).\n• **Tibs** (${tibs ? tibs.price : 550} ETB) — Sautéed beef chunks seared hot with rosemary and jalapeños. Firm, chewy, and aromatic.`,
          dishes: [kitfo, tibs].filter(Boolean) as Dish[],
          suggestedFollowUps: ['How is Leb-Leb cooked?', 'Add Kitfo to cart', 'Add Tibs to cart'],
        };
      }
    }

    // =========================================================================
    // 3. EXPLAIN DISH / INGREDIENTS
    // =========================================================================
    if (intent === 'EXPLAIN_DISH' || intent === 'INGREDIENTS') {
      if (norm.includes('kitfo')) {
        const kitfo = allDishes.find(d => d.id === 'royal-kitfo' || d.id === 'kitfo') || allDishes[0];
        const ingredients = kitfo.explanation?.keyIngredients?.join(', ') || 'Prime lean beef, niter kibbeh, mitmita chili, cardamom';
        return {
          intent: 'EXPLAIN_DISH',
          text: `**Kitfo** (${kitfo.price} ETB) is a prime Ethiopian culinary delicacy.\n\n• **What it is:** Finely minced lean beef seasoned with warm spiced butter and mitmita.\n• **Ingredients:** ${ingredients}.\n• **Serving Style:** Traditionally served *Tire* (raw) or *Leb-Leb* (lightly warmed) with Ayib cheese and Gomen greens.\n• **Spice:** Medium to spicy from mitmita.`,
          dishes: [kitfo],
          suggestedFollowUps: ['What is Leb-Leb style?', 'Add Royal Kitfo to cart', 'Show mild alternatives'],
        };
      }

      if (norm.includes('doro-wot')) {
        const doro = allDishes.find(d => d.id === 'doro-wot') || allDishes[0];
        const ingredients = doro.explanation?.keyIngredients?.join(', ') || 'Chicken drumstick, hard-boiled egg, caramelized red onions, berbere, niter kibbeh';
        return {
          intent: 'EXPLAIN_DISH',
          text: `**Doro Wot** (${doro.price} ETB) is Ethiopia's celebratory national centerpiece.\n\n• **What it is:** Slow-simmered chicken stew cooked for hours with whole egg in a thick berbere reduction.\n• **Ingredients:** ${ingredients}.\n• **Taste:** Deep, savory, complex heat balanced with caramelized onions.\n• **Spice Level:** Spicy.`,
          dishes: [doro],
          suggestedFollowUps: ['What drink pairs with Doro Wot?', 'Add Doro Wot to cart', 'Show vegetarian stew'],
        };
      }

      if (norm.includes('shiro')) {
        const shiro = allDishes.find(d => d.id === 'shiro-tegabino' || d.id === 'shiro') || allDishes[0];
        return {
          intent: 'EXPLAIN_DISH',
          text: `**Shiro Tegabino** (${shiro.price} ETB) is a comforting roasted chickpea stew.\n\n• **What it is:** Ground chickpea and split-pea flour simmered with garlic, ginger, and cardamom in a clay pot.\n• **Texture:** Thick, velvety, and bubbling hot.\n• **Dietary:** 100% plant-based / Fasting (Yetsom).\n• **Spice Level:** Mild to medium.`,
          dishes: [shiro],
          suggestedFollowUps: ['Is Shiro vegan?', 'Add Shiro Tegabino to cart', 'Show sharing platters'],
        };
      }

      // Dynamic lookup for any newly imported or verified restaurant dish
      const matchedDish = allDishes.find(
        (d) => q.includes(d.name.toLowerCase()) || (d.amharicName && q.includes(d.amharicName))
      );
      if (matchedDish) {
        let ingText = '';
        if (matchedDish.explanation?.keyIngredients && matchedDish.explanation.keyIngredients.length > 0) {
          ingText = matchedDish.explanation.keyIngredients.join(', ');
        } else if (matchedDish.ingredients && matchedDish.ingredients.length > 0) {
          ingText = matchedDish.ingredients.map((i) => i.name).join(', ');
        } else {
          ingText = 'Specific ingredient breakdown is not explicitly recorded on this menu. Please ask your server.';
        }

        return {
          intent: 'EXPLAIN_DISH',
          text: `**${matchedDish.name}** (${matchedDish.price} ${matchedDish.currency || 'ETB'})\n\n• **Description:** ${matchedDish.description}\n• **Ingredients:** ${ingText}\n• **Dietary:** ${matchedDish.isFasting ? 'Confirmed Fasting / Vegan (Yetsom)' : 'Standard preparation'}\n• **Spice Heat:** ${matchedDish.spiceLevel}`,
          dishes: [matchedDish],
          suggestedFollowUps: [`Add ${matchedDish.name} to cart`, 'What drinks pair with this?', 'Show other options'],
        };
      }
    }

    // =========================================================================
    // 4. DIETARY / FASTING / YETSOM
    // =========================================================================
    if (intent === 'DIETARY') {
      const veganDishes = allDishes.filter(d => d.isFasting || d.category === 'vegetarian');
      return {
        intent: 'DIETARY',
        text: `The restaurant has verified **${veganDishes.length} Fasting (Yetsom)** dishes. These are prepared without butter, meat, or animal products using 100% vegetable oils and aromatic spices:\n\n1. **Yetsom Beyaynetu** — Multi-dish sampler of lentils, split peas, collard greens, and cabbage.\n2. **Shiro Tegabino** — Slow-cooked chickpea stew served in a hot clay pot.\n3. **Fasting Firfir** — Shredded injera tossed in spicy berbere sauce.`,
        dishes: veganDishes.slice(0, 3),
        confidence: 'CONFIRMED',
        suggestedFollowUps: ['Is Injera gluten-free?', 'Add Beyaynetu to cart', 'Show cold drinks'],
      };
    }

    // =========================================================================
    // 5. BUDGET MODE (EXACT MENU PRICES ONLY)
    // =========================================================================
    if (intent === 'BUDGET') {
      let targetBudget = 550;
      if (q.includes('600')) targetBudget = 600;
      if (q.includes('400')) targetBudget = 400;
      if (q.includes('300')) targetBudget = 300;
      if (q.includes('1000')) targetBudget = 1000;

      const affordableDishes = allDishes
        .filter(d => d.price <= targetBudget)
        .sort((a, b) => a.price - b.price);

      if (affordableDishes.length === 0) {
        const cheapest = [...allDishes].sort((a, b) => a.price - b.price)[0];
        return {
          intent: 'BUDGET',
          text: `The lowest priced individual dish currently on the menu is **${cheapest.name}** at ${cheapest.price} ETB. Here are our most affordable selections:`,
          dishes: allDishes.slice(0, 2),
          confidence: 'CONFIRMED',
        };
      }

      const topBudget = affordableDishes[0];
      const secondBudget = affordableDishes[1] || affordableDishes[0];

      return {
        intent: 'BUDGET',
        text: `Here are filling, highly satisfying options under ${targetBudget} ETB on this menu:\n\n• **${topBudget.name}** — ${topBudget.price} ETB\n• **${secondBudget.name}** — ${secondBudget.price} ETB\n\nBoth come served with fresh teff injera.`,
        dishes: affordableDishes.slice(0, 3),
        confidence: 'CONFIRMED',
        suggestedFollowUps: [`Add ${topBudget.name} to cart`, 'Show meat options', 'Show drinks under 150 ETB'],
      };
    }

    // =========================================================================
    // 6. MEAL BUILDER & GROUP FEASTS (2, 3, 4+ GUESTS)
    // =========================================================================
    if (intent === 'MEAL_BUILD') {
      let partyCount = 2;
      if (q.includes('3') || q.includes('three')) partyCount = 3;
      if (q.includes('4') || q.includes('four')) partyCount = 4;
      if (q.includes('5') || q.includes('five') || q.includes('group')) partyCount = 5;

      const combo = allDishes.filter(
        d => d.id === 'maheberewi' || d.id === 'beyaynetu' || d.id === 'tibs' || d.id === 'tej-honey-wine'
      );
      const totalPrice = combo.reduce((sum, d) => sum + d.price, 0);

      return {
        intent: 'MEAL_BUILD',
        text: `For **${partyCount} guests**, Ethiopian communal dining centers on sharing a variety of stews on a single large injera platter. I suggest this balanced combination:\n\n• **Maheberewi / Beyaynetu** — Sampler platter with diverse lentils, stews, and greens.\n• **Sizzling Tibs** — Hearty prime beef sautéed with fresh rosemary and peppers.\n• **Artisanal Tej** — Traditional honey wine to complement the spices.\n\nTotal: **${totalPrice} ETB**`,
        dishes: combo,
        isMealCombo: true,
        mealRationale: `Provides 1 centerpiece combination platter, 1 hot sizzling meat dish, and refreshing beverages for a balanced table.`,
        totalPriceETB: totalPrice,
        suggestedFollowUps: ['Add full feast to table order', 'Make it 100% vegetarian', 'What is the spice level?'],
      };
    }

    // =========================================================================
    // 7. CART INTELLIGENCE & PAIRINGS
    // =========================================================================
    if (intent === 'PAIRING' || (cart.length > 0 && q.includes('pair'))) {
      if (cart.length > 0) {
        const topItem = cart[0].dish;
        const isSpicy = cart.some(c => c.dish.spiceLevel === 'spicy' || c.dish.spiceLevel === 'extra-spicy');
        
        let pairings: Dish[] = [];
        let note = '';

        if (isSpicy) {
          note = `Because your order contains spicy berbere dishes (${topItem.name}), traditional Ethiopian pairings focus on cooling the palate and complementing the rich spices:\n\n• **Ayib** (Cottage Cheese) — Light and cooling against chili heat.\n• **Tej** (Honey Wine) — Natural honey sweetness balances savory spice.`;
          pairings = allDishes.filter(d => d.id === 'ayib-cottage-cheese' || d.id === 'tej-honey-wine' || d.id === 'sidama-buna');
        } else {
          note = `To complement your table selection (${topItem.name}), we recommend:\n\n• **Stewed Gomen** (Collard Greens) — Adds freshness and texture.\n• **Sidama Buna** — Single-origin freshly brewed coffee to conclude your meal.`;
          pairings = allDishes.filter(d => d.id === 'gomen-wat' || d.id === 'sidama-buna' || d.id === 'spris-juice');
        }

        return {
          intent: 'PAIRING',
          text: note,
          dishes: pairings.slice(0, 3),
          suggestedFollowUps: ['Add recommended pairings to cart', 'Show dessert options', 'Review cart total'],
        };
      }
    }

    // =========================================================================
    // 8. DISCOVER / WEATHER & TIME CONTEXT
    // =========================================================================
    if (intent === 'DISCOVER') {
      if (ctx.temperatureC <= 18) {
        const warm = allDishes.filter(d => d.id === 'shiro-tegabino' || d.id === 'doro-wot' || d.id === 'tibs');
        return {
          intent: 'DISCOVER',
          text: `Since it's a cooler evening in Addis Ababa (${ctx.temperatureC}°C), slow-cooked clay-pot stews and hot berbere dishes stay warm throughout your meal:\n\n• **Shiro Tegabino** — Bubbling hot roasted chickpea stew.\n• **Doro Wot** — Rich slow-simmered chicken stew with berbere.\n• **Sizzling Tibs** — Seared beef served hot with fresh herbs.`,
          dishes: warm.slice(0, 3),
          suggestedFollowUps: ['Tell me more about Shiro Tegabino', 'What hot drinks do you have?', 'Show mild dishes'],
        };
      } else {
        const light = allDishes.filter(d => d.id === 'spris-juice' || d.id === 'beyaynetu' || d.id === 'gomen-wat');
        return {
          intent: 'DISCOVER',
          text: `For a warm afternoon (${ctx.temperatureC}°C), lighter vegetable platters and freshly blended tropical fruit juices provide energy without feeling heavy:\n\n• **Yetsom Beyaynetu** — Multi-flavor plant-based sampler.\n• **Spris Juice** — Fresh layered avocado and mango juice.\n• **Alicha Tibs** — Mild turmeric-ginger sautéed meat.`,
          dishes: light.slice(0, 3),
          suggestedFollowUps: ['Show cold juices', 'Is Beyaynetu spicy?', 'Order fresh juice'],
        };
      }
    }

    // =========================================================================
    // 9. RECOMMENDATION ENGINE (1 Primary + 2 Alternatives)
    // =========================================================================
    if (intent === 'RECOMMEND') {
      if (q.includes('mild') || q.includes('no spice') || q.includes('not spicy')) {
        const mild = availableDishes.filter(d => d.spiceLevel === 'mild' || d.spiceLevel === 'none');
        const primary = mild[0] || availableDishes[0] || allDishes[0];
        const alt1 = mild[1] || availableDishes[1] || allDishes[1];
        const alt2 = mild[2] || availableDishes[2] || allDishes[2];
        return {
          intent: 'RECOMMEND',
          text: `If you want something mild without chili heat:\n\n**Primary:** **${primary.name}** (${primary.price} ETB) — Flavored with ginger, garlic, and turmeric (**Alicha** style).\n\n**Alternatives:**\n• **${alt1.name}** (${alt1.price} ETB)\n• **${alt2.name}** (${alt2.price} ETB)`,
          dishes: [primary, alt1, alt2].filter(Boolean),
          suggestedFollowUps: [`Add ${primary.name} to cart`, 'Show spicy options', 'What drinks go with this?'],
        };
      }

      // Default 1 primary + 2 alternatives format
      const primary = availableDishes.find(d => d.isSignature) || availableDishes[0] || allDishes[0];
      const alt1 = availableDishes.find(d => d.id === 'tibs') || availableDishes[1] || allDishes[1];
      const alt2 = availableDishes.find(d => d.isFasting || d.category === 'vegetarian') || availableDishes[2] || allDishes[2];

      const soldOutWarning = askedSoldOut
        ? `*Note: ${askedSoldOut.name} is currently sold out in the kitchen today.*\n\n`
        : '';

      return {
        intent: 'RECOMMEND',
        text: `${soldOutWarning}If you are looking for a classic and satisfying choice:\n\n**Primary:** **${primary.name}** (${primary.price} ETB) — Rich, spiced, and Ethiopia's signature dish.\n\n**Alternatives:**\n• **${alt1.name}** (${alt1.price} ETB) — Savory sautéed meat.\n• **${alt2.name}** (${alt2.price} ETB) — Wholesome plant-based option.\n\nIf you tell me your spice or budget preference, I can narrow it down.`,
        dishes: [primary, alt1, alt2].filter(Boolean),
        suggestedFollowUps: [`Add ${primary.name} to cart`, 'Show dishes under 500 ETB', 'Show mild options'],
      };
    }

    // =========================================================================
    // 10. GENERAL FALLBACK (FUZZY MATCH ON ACTUAL MENU DATA)
    // =========================================================================
    const matched = contextEngine.matchDishes(allDishes, rawQuery);
    if (matched.length > 0) {
      return {
        intent: 'DISCOVER',
        text: `Here are dishes from our verified menu matching "${rawQuery}":`,
        dishes: matched.slice(0, 3),
        suggestedFollowUps: ['Filter by mild spice', 'Show drinks', 'Explore full menu'],
      };
    }

    return {
      intent: 'GENERAL_CONVERSATION',
      text: `I can help you choose dishes by spice preference, dietary requirements, table budget, or pairings for Table ${contextEngine.getContext().partySize}. Are you looking for something **light, filling, or traditional**?`,
      dishes: allDishes.filter(d => d.isSignature || d.isPopular).slice(0, 3),
      suggestedFollowUps: ['Show dishes for 2 people', 'Show dishes under 500 ETB', '100% Fasting / Vegan'],
    };
  }
}

export const aiConcierge = AIConciergeService.getInstance();
