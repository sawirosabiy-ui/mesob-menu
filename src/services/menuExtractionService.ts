import { Dish, Category, MultilingualText, SpiceHeatLevel } from '../types/mesob';

export interface ExtractedMenuResult {
  categories: Category[];
  dishes: Dish[];
  totalExtracted: number;
  needsReviewCount: number;
  verifiedCount: number;
}

export class MenuExtractionService {
  private static instance: MenuExtractionService;

  public static getInstance(): MenuExtractionService {
    if (!MenuExtractionService.instance) {
      MenuExtractionService.instance = new MenuExtractionService();
    }
    return MenuExtractionService.instance;
  }

  /**
   * Sample real-world menus for quick-load and onboarding demos
   */
  public getSampleRawMenus(): { label: string; text: string }[] {
    return [
      {
        label: 'Addis Ababa Traditional Kitchen (Mixed Items)',
        text: `--- CATEGORY: TRADITIONAL DISHES ---
Doro Wot | 550 ETB
Slow simmered chicken drumstick in spicy berbere sauce with caramelized onions and hard boiled egg.
Tags: Spicy, Signature, Poultry

Special Beef Tibs | 720 ETB
Prime beef cubed tenderloin flash seared with rosemary, sweet red onions and green peppers.
Tags: Meat, Sizzling, Popular

Kitfo Special | 800 ETB
Finely minced lean beef infused with spiced clarified niter kibbeh butter and mitmita. Served with ayib cheese and gomen greens.
Tags: Beef, Spicy, Traditional

Gomen Be Siga | 520 ETB
Tender braised collard greens stewed with beef ribs and ginger.
Tags: Savory, Meat

--- CATEGORY: FASTING & VEGAN (YE'TSOM) ---
Shiro Tegabino | 240 ETB
Spiced chickpea flour slow cooked in a bubbling hot clay pot with garlic and onions.
Tags: Vegetarian, Fasting, Vegan, Popular

Misir Wot | 210 ETB
Red split lentils simmered in rich spicy berbere onion sauce.
Tags: Vegetarian, Fasting, Spicy

Beyaynetu Platter | 420 ETB
Generous combination platter of red lentils, yellow split peas, collards, cabbage and beets served on fresh teff injera.
Tags: Fasting, Vegetarian, Popular, Vegan

--- CATEGORY: DRINKS & COFFEE ---
Traditional Tej Honey Wine | 190 ETB
Authentic home-brewed sweet Ethiopian honey wine.
Tags: Alcohol, Beverage

Single Origin Sidama Coffee | Price unclear
Freshly pan-roasted coffee ceremonially brewed in traditional jebena clay pot.
Tags: Coffee, Hot

Fresh Papaya Mango Juice | 150 ETB
Pure layered fresh tropical fruit juice with fresh lime.
Tags: Beverage, Fresh

House Special Rib Platter | Market Price
Large shared platter of grilled ribs with special seasoning.
Tags: Meat, Sharing`,
      },
      {
        label: 'Habesha Grill House (Meat Centric)',
        text: `--- CATEGORY: GRILLED MEATS ---
Chikina Tibs | 790 ETB
Tender beef tenderloin sautéed with garlic, onions and fresh jalapeños.
Tags: Beef, Popular

Zilzil Tibs | 740 ETB
Long sliced beef strips dry fried crispy with rosemary sprigs.
Tags: Beef, Savory

Lamb Tibs | 680 ETB
Succulent tender lamb cubes pan fried in butter and rosemary.
Tags: Lamb, Meat

Derek Tibs (Crispy) | 690 ETB
Well-done crispy beef cubes served on sizzling clay burner with awaze dipping sauce.
Tags: Beef, Sizzling

Special T-Bone Steak | Price to be determined
Charcoal grilled marinated beef steak.
Tags: Meat, Grill

--- CATEGORY: SIDES & EXTRAS ---
Extra Teff Injera | 70 ETB
Pure brown teff sourdough flatbread.
Tags: Sides, Gluten-Free

Ayib with Gomen | 160 ETB
Fresh mild curd cheese mixed with seasoned collard greens.
Tags: Sides, Dairy`,
      },
    ];
  }

  /**
   * Parses raw unstructured menu text into structured categories & dishes,
   * flagging any ambiguity with 'needs_review'.
   */
  public parseMenuText(rawText: string, restaurantId: string = 'temp'): ExtractedMenuResult {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const categoriesMap: Map<string, Category> = new Map();
    const dishes: Dish[] = [];

    let currentCategoryId = 'general';
    let currentCategoryName = 'Specialties';

    // Ensure default category exists
    categoriesMap.set(currentCategoryId, {
      id: currentCategoryId,
      restaurantId,
      name: currentCategoryName,
      dishIds: [],
    });

    let currentDishPartial: Partial<Dish> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Detect Category Header
      if (
        line.startsWith('---') ||
        line.toLowerCase().startsWith('category:') ||
        line.toLowerCase().startsWith('section:') ||
        line.endsWith('MENU') ||
        (line.startsWith('#') && line.length < 50)
      ) {
        if (currentDishPartial) {
          this.finalizeDish(currentDishPartial, dishes, currentCategoryId, categoriesMap, restaurantId);
          currentDishPartial = null;
        }

        const catName = line
          .replace(/^---|\s*CATEGORY:\s*|\s*SECTION:\s*|---|#/gi, '')
          .trim();

        if (catName) {
          currentCategoryName = catName;
          currentCategoryId = `cat-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          if (!categoriesMap.has(currentCategoryId)) {
            categoriesMap.set(currentCategoryId, {
              id: currentCategoryId,
              restaurantId,
              name: currentCategoryName,
              dishIds: [],
            });
          }
        }
        continue;
      }

      // 2. Detect Dish Name & Price Line (e.g. "Doro Wot | 550 ETB" or "Kitfo - 600" or "Shiro ... 250")
      const priceRegex = /(\b\d{2,5}\b)\s*(etb|birr|\$|€|£)?/i;
      const separatorMatch = line.split(/[|\-–—]/);

      if (
        separatorMatch.length >= 2 ||
        priceRegex.test(line) ||
        line.toLowerCase().includes('price') ||
        line.toLowerCase().includes('unclear')
      ) {
        // Finalize previous dish if any
        if (currentDishPartial) {
          this.finalizeDish(currentDishPartial, dishes, currentCategoryId, categoriesMap, restaurantId);
          currentDishPartial = null;
        }

        const namePart = separatorMatch[0].trim();
        const secondPart = separatorMatch.slice(1).join(' ').trim();

        let extractedPrice: number | null = null;
        let priceUncertain = false;
        let reviewReason: string[] = [];

        // Check if price is stated as unclear
        if (
          secondPart.toLowerCase().includes('unclear') ||
          secondPart.toLowerCase().includes('market') ||
          secondPart.toLowerCase().includes('determined') ||
          secondPart.toLowerCase().includes('ask')
        ) {
          priceUncertain = true;
          reviewReason.push('Price is marked as market price or unclear');
        } else {
          const numMatch = secondPart.match(/\b(\d{2,5})\b/);
          if (numMatch) {
            extractedPrice = parseInt(numMatch[1], 10);
          } else {
            priceUncertain = true;
            reviewReason.push('Could not detect numerical price');
          }
        }

        currentDishPartial = {
          name: namePart,
          price: extractedPrice !== null ? extractedPrice : 0,
          description: '',
          categoryIds: [currentCategoryId],
          tags: [],
          extractionStatus: priceUncertain ? 'needs_review' : 'verified',
          reviewNotes: reviewReason,
        };
        continue;
      }

      // 3. Process Description or Tags for current dish
      if (currentDishPartial) {
        if (line.toLowerCase().startsWith('tags:')) {
          const tags = line
            .replace(/tags:/i, '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
          currentDishPartial.tags = [...(currentDishPartial.tags || []), ...tags];
        } else {
          // It's a description line
          currentDishPartial.description = currentDishPartial.description
            ? `${currentDishPartial.description} ${line}`
            : line;
        }
      }
    }

    // Finalize last dish
    if (currentDishPartial) {
      this.finalizeDish(currentDishPartial, dishes, currentCategoryId, categoriesMap, restaurantId);
    }

    const categories = Array.from(categoriesMap.values()).filter((c) => c.dishIds.length > 0);

    const needsReviewCount = dishes.filter((d) => d.extractionStatus === 'needs_review').length;
    const verifiedCount = dishes.length - needsReviewCount;

    return {
      categories,
      dishes,
      totalExtracted: dishes.length,
      needsReviewCount,
      verifiedCount,
    };
  }

  private finalizeDish(
    dishPart: Partial<Dish>,
    dishes: Dish[],
    categoryId: string,
    categoriesMap: Map<string, Category>,
    restaurantId: string
  ) {
    if (!dishPart.name) return;

    const dishId = `ext-${dishPart.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const reviewNotes: string[] = [...(dishPart.reviewNotes || [])];

    let extractionStatus = dishPart.extractionStatus || 'verified';

    if (!dishPart.price || dishPart.price <= 0) {
      extractionStatus = 'needs_review';
      if (!reviewNotes.includes('Price is missing or zero')) {
        reviewNotes.push('Price is missing or zero');
      }
    }

    if (!dishPart.description || dishPart.description.length < 10) {
      extractionStatus = 'needs_review';
      reviewNotes.push('Short or missing description');
    }

    // Heuristic spice heat level
    const descLower = (dishPart.description || '').toLowerCase();
    const nameLower = dishPart.name.toLowerCase();
    let spiceLevel: SpiceHeatLevel = 'none';

    if (descLower.includes('extra spicy') || descLower.includes('mitmita')) {
      spiceLevel = 'extra-spicy';
    } else if (descLower.includes('spicy') || descLower.includes('berbere') || nameLower.includes('wot')) {
      spiceLevel = 'spicy';
    } else if (descLower.includes('rosemary') || descLower.includes('garlic')) {
      spiceLevel = 'medium';
    } else if (descLower.includes('mild') || descLower.includes('alicha')) {
      spiceLevel = 'mild';
    }

    const isFasting =
      descLower.includes('fasting') ||
      descLower.includes('vegan') ||
      descLower.includes('yetsom') ||
      dishPart.tags?.some((t) => t.toLowerCase().includes('fasting') || t.toLowerCase().includes('vegan'));

    // Image fallback based on keywords
    let image = '/images/dishes/Tibs.jpg';
    if (nameLower.includes('doro')) image = '/images/dishes/Doro_wot.jpg';
    else if (nameLower.includes('kitfo')) image = '/images/dishes/Kitfo.jpg';
    else if (nameLower.includes('shiro') || nameLower.includes('misir')) image = '/images/dishes/Shiro.jpg';
    else if (nameLower.includes('coffee') || nameLower.includes('buna')) image = '/images/dishes/Buna.jpg';
    else if (nameLower.includes('tej') || nameLower.includes('wine')) image = '/images/dishes/Tej.jpg';
    else if (nameLower.includes('injera')) image = '/images/dishes/Injera.jpg';

    const fullDish: Dish = {
      id: dishId,
      restaurantId,
      name: dishPart.name,
      description: dishPart.description || 'Authentic freshly prepared specialty dish.',
      price: dishPart.price || 0,
      currency: 'ETB',
      categoryIds: [categoryId],
      image,
      tags: dishPart.tags && dishPart.tags.length > 0 ? dishPart.tags : ['Traditional'],
      spiceLevel,
      isFasting,
      isVegetarian: isFasting,
      extractionStatus,
      reviewNotes,
      availability: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dishes.push(fullDish);

    // Register in category
    const cat = categoriesMap.get(categoryId);
    if (cat && !cat.dishIds.includes(dishId)) {
      cat.dishIds.push(dishId);
    }
  }
}

export const menuExtractionService = MenuExtractionService.getInstance();
