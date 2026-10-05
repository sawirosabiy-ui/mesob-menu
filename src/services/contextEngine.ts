import { Dish, CartItem } from "../types/mesob";

export interface DiningContext {
  localTime: string;
  hour: number;
  mealPeriod: "breakfast" | "lunch" | "afternoon" | "dinner" | "latenight";
  temperatureC: number;
  weatherCondition: "sunny" | "chilly" | "rainy" | "warm" | "mild";
  weatherDescription: string;
  partySize: number;
  isFastingSeason: boolean;
  budgetLimitETB?: number;
  spiceTolerance: "mild" | "medium" | "spicy" | "all";
  dishesViewed: string[];
  cart: CartItem[];
  cartTotal: number;
}

export class MesobContextEngine {
  private static instance: MesobContextEngine;
  private state: DiningContext;

  private constructor() {
    const now = new Date();
    const hour = now.getHours();
    
    let mealPeriod: DiningContext["mealPeriod"] = "lunch";
    if (hour >= 6 && hour < 11) mealPeriod = "breakfast";
    else if (hour >= 11 && hour < 15) mealPeriod = "lunch";
    else if (hour >= 15 && hour < 18) mealPeriod = "afternoon";
    else if (hour >= 18 && hour < 22) mealPeriod = "dinner";
    else mealPeriod = "latenight";

    let temperatureC = 22;
    let weatherCondition: DiningContext["weatherCondition"] = "warm";
    let weatherDescription = "Pleasant & sunny in Addis Ababa (22°C)";

    if (hour >= 18 || hour < 8) {
      temperatureC = 16;
      weatherCondition = "chilly";
      weatherDescription = "Cool evening breeze in Addis Ababa (16°C)";
    } else if (hour >= 12 && hour < 16) {
      temperatureC = 25;
      weatherCondition = "warm";
      weatherDescription = "Warm afternoon sunshine (25°C)";
    }

    this.state = {
      localTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      hour,
      mealPeriod,
      temperatureC,
      weatherCondition,
      weatherDescription,
      partySize: 2,
      isFastingSeason: false,
      spiceTolerance: "all",
      dishesViewed: [],
      cart: [],
      cartTotal: 0,
    };
  }

  public static getInstance(): MesobContextEngine {
    if (!MesobContextEngine.instance) {
      MesobContextEngine.instance = new MesobContextEngine();
    }
    return MesobContextEngine.instance;
  }

  public getContext(): DiningContext {
    return { ...this.state };
  }

  public updateCart(cart: CartItem[], cartTotal: number) {
    this.state.cart = cart;
    this.state.cartTotal = cartTotal;
  }

  public trackDishView(dishId: string) {
    if (!this.state.dishesViewed.includes(dishId)) {
      this.state.dishesViewed.push(dishId);
    }
  }

  public setPartySize(size: number) {
    this.state.partySize = size;
  }

  public setBudgetLimit(budget?: number) {
    this.state.budgetLimitETB = budget;
  }

  public setFasting(fasting: boolean) {
    this.state.isFastingSeason = fasting;
  }

  public setSpiceTolerance(spice: DiningContext["spiceTolerance"]) {
    this.state.spiceTolerance = spice;
  }

  public getContextualHeadline(): { title: string; subtitle: string; icon: string } {
    const { mealPeriod, weatherCondition, temperatureC, partySize } = this.state;
    
    if (weatherCondition === "chilly") {
      return {
        title: "Warm Comfort for a Cool Evening",
        subtitle: "It is " + temperatureC + "°C outside. Slow-cooked Shiro Tegabino and hot Doro Wot are popular right now.",
        icon: "flame",
      };
    }
    
    if (mealPeriod === "lunch") {
      return {
        title: "Chef Lunch Service",
        subtitle: "Fresh teff injera delivered this morning. Fast table turnaround available.",
        icon: "sun",
      };
    }

    if (partySize >= 2) {
      return {
        title: "Dining for " + partySize + "?",
        subtitle: "Sharing platters (Maheberewi & Beyaynetu) are crafted for communal dining.",
        icon: "users",
      };
    }

    return {
      title: "Welcome to Mesob",
      subtitle: "Elevated Ethiopian culinary tradition at your table.",
      icon: "sparkles",
    };
  }

  public matchDishes(dishes: Dish[], query?: string): Dish[] {
    let result = [...dishes];

    if (this.state.isFastingSeason) {
      result = result.filter(d => d.isFasting || d.category === "vegetarian");
    }

    if (this.state.spiceTolerance === "mild") {
      result = result.filter(d => d.spiceLevel === "mild" || d.spiceLevel === "none");
    }

    if (this.state.budgetLimitETB && this.state.budgetLimitETB > 0) {
      result = result.filter(d => d.price <= this.state.budgetLimitETB!);
    }

    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) ||
        d.amharicName?.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.ingredients?.some(i => i.name.toLowerCase().includes(q))
      );
    }

    return result;
  }
}

export const contextEngine = MesobContextEngine.getInstance();
