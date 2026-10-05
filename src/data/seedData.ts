import { Dish, Category, RestaurantBrand, AnalyticsEvent } from '../types';

export const initialRestaurantBrand: RestaurantBrand = {
  name: {
    en: 'Bole Spice & Hearth',
    am: 'ቦሌ ስፓይስ እና ኸርዝ',
  },
  tagline: {
    en: 'Artisanal Ethiopian Dining & Cultural Heritage',
    am: 'ባህላዊ እና ዘመናዊ የኢትዮጵያ የምግብ ጥበብ',
  },
  coverImage: '/images/dishes/Kitfo.jpg',
  logo: '👑',
  currency: 'ETB',
  phone: '+251 91 123 4567',
  address: {
    en: 'Bole Road, Next to Medhane Alem, Addis Ababa',
    am: 'ቦሌ መንገድ፣ ከመድኃኔዓለም ቤተክርስቲያን አጠገብ፣ አዲስ አበባ',
  },
  tableNumber: 4,
  accentColor: '#C23B22',
};

export const initialCategories: Category[] = [
  { id: 'all', name: { en: 'All Dishes', am: 'ሁሉም ምግቦች' }, icon: 'Utensils' },
  { id: 'traditional', name: { en: 'Traditional Wot', am: 'ባህላዊ ወጦች' }, icon: 'Flame' },
  { id: 'sizzling', name: { en: 'Sizzling Tibs', am: 'ጥብሶች' }, icon: 'Zap' },
  { id: 'vegetarian', name: { en: 'Plant & Fasting', am: 'የጾም ምግቦች' }, icon: 'Salad' },
  { id: 'breakfast', name: { en: 'Breakfast & Firfir', am: 'ቁርስ እና ፍርፍር' }, icon: 'Sun' },
  { id: 'beverages', name: { en: 'Coffee & Drinks', am: 'መጠጦች እና ቡና' }, icon: 'Coffee' },
];

export const seedDishes: Dish[] = [
  {
    id: 'doro-wot',
    name: {
      en: 'Doro Wot (Royal Chicken Stew)',
      am: 'ዶሮ ወጥ ከእንቁላል ጋር',
    },
    description: {
      en: 'The crown jewel of Ethiopian cuisine: tender chicken slow-simmered for 6 hours in rich berbere sauce with caramelized red onions, spiced clarified butter (niter kibbeh), and a hard-boiled egg.',
      am: 'በደቃቁ በተከተፈ ሽንኩርት፣ በርበሬ፣ ንጥር ቅቤ እና ቅመማ ቅመም ተቁላልቶ ከሀበሻ ዶሮ እና ከእንቁላል ጋር የሚዘጋጅ ተወዳጅ ባህላዊ ወጥ።',
    },
    price: 580,
    category: 'traditional',
    image: '/images/dishes/Doro_wot.jpg',
    tags: ['Spicy', 'Traditional', 'Popular', 'Chef Signature'],
    popularity: 'signature',
    isAvailable: true,
    spiceLevel: 'hot',
    explanation: {
      whatIsIt: {
        en: 'A legendary Ethiopian chicken stew cooked slowly with hand-ground berbere spices and seasoned clarified butter (niter kibbeh). It is the premier feast dish of Ethiopia, traditionally served at high holidays and celebrations.',
        am: 'በባህላዊ የሀበሻ ቅመማ ቅመም፣ በርበሬ እና ንጥር ቅቤ ተዘጋጅቶ በበዓላት እና በልዩ ድግሶች ላይ የሚቀርብ የኢትዮጵያ አንጋፋ የዶሮ ወጥ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Deeply aromatic, rich, and layered. The sweetness of slow-caramelized red onions balances the bold, earthy heat of berbere pepper, rounded by the herbal fragrance of spiced butter.',
        am: 'በርበሬውና ቅመሙ ከሽንኩርቱ ጣፋጭነት ጋር ተዋህዶ ደስ የሚል መዓዛና መጠነኛ የሚያቃጥል ልዩ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Tender chicken drumstick/thigh drenched in a thick, mahogany-red sauce accompanied by a sauce-permeated hard-boiled egg. Traditionally eaten with sourdough teff injera by tearing pieces with your right hand.',
        am: 'በወጡ የራሰ የዶሮ ስጋና እንቁላል ከለስላሳ የጤፍ እንጀራ ጋር ይቀርባል። በእጅ እየተቆረሰ የሚበላ ልዩ የጋራ ማዕድ ነው።',
      },
    },
    ingredients: {
      en: ['Free-range chicken', 'Red onions (slow caramelized)', 'Berbere chili blend', 'Spiced clarified butter (Niter Kibbeh)', 'Garlic & Ginger paste', 'Hard-boiled egg', 'Korarima (Black cardamom)', 'Mekelesha spice finish'],
      am: ['የሀበሻ ዶሮ', 'ቀይ ሽንኩርት', 'ደለዘ በርበሬ', 'ንጥር ቅቤ', 'ነጭ ሽንኩርትና ዝንጅብል', 'የቀቀለ እንቁላል', 'ኮረሪማ', 'መከለሻ'],
    },
    allergens: {
      contains: ['Milk (Dairy in Niter Kibbeh)', 'Eggs'],
      potential: ['Gluten (if paired with wheat-blend injera instead of 100% pure Teff)'],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Please confirm with restaurant staff if you have a serious allergy.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። ከባድ የአለርጂ ችግር ካለብዎት እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 520,
      protein: 34,
      carbs: 22,
      fat: 26,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'tej-wine',
        name: { en: 'Authentic Tej (Honey Wine)', am: 'ማር ጠጅ' },
        category: 'beverages',
        description: {
          en: 'Naturally fermented pure wild honey with Gesho leaves. The gentle floral sweetness cuts cleanly through the berbere spice.',
          am: 'ከንፁህ የተፈጥሮ ማር እና ከጌሾ ቅጠል የተጠመቀ ጣፋጭ ባህላዊ መጠጥ።',
        },
        price: 180,
        image: '/images/dishes/Tej.jpg',
        type: 'goesWellWith',
      },
      {
        id: 'ethiopian-buna',
        name: { en: 'Traditional Buna Ceremony', am: 'የኢትዮጵያ ባህላዊ ቡና' },
        category: 'beverages',
        description: {
          en: 'Freshly roasted Sidama Arabica beans brewed in a clay jebena with aromatic frankincense smoke.',
          am: 'በጀበና የተፈላ ጥቁር ቡና ከዕጣን መዓዛ እና ከፈንድሻ ጋር።',
        },
        price: 90,
        image: '/images/dishes/Buna.jpg',
        type: 'youMightLike',
      },
    ],
    comparison: {
      spiceLevel: 'High',
      style: { en: 'Slow Stew (Wot)', am: 'የተቁላላ ወጥ' },
      proteinType: { en: 'Chicken & Egg', am: 'ዶሮ እና እንቁላል' },
      bestFor: { en: 'Deep traditional flavor lovers', am: 'ባህላዊና ቅመም የበዛበት ምግብ ለሚወዱ' },
    },
  },
  {
    id: 'special-beef-tibs',
    name: {
      en: 'Special Sizzling Beef Tibs',
      am: 'ልዩ የቁርጥ የበሬ ጥብስ',
    },
    description: {
      en: 'Prime cubed beef tenderloin pan-seared over high heat with fresh rosemary twigs, diced red onions, jalapenos, and clarified garlic butter. Served sizzling in a traditional clay stove (shekla).',
      am: 'በሽንኩርት፣ ቃሪያ፣ ሮዝመሪ (የጥብስ ቅጠል) እና በንጥር ቅቤ በሸክላ ምጣድ ላይ የጋለ ምርጥ የበሬ ስጋ ጥብስ።',
    },
    price: 650,
    category: 'sizzling',
    image: '/images/dishes/Tibs.jpg',
    tags: ['Popular', 'Savory', 'Sizzling'],
    popularity: 'popular',
    isAvailable: true,
    spiceLevel: 'medium',
    explanation: {
      whatIsIt: {
        en: 'A celebratory skillet dish featuring juicy, tender cuts of prime beef flash-sautéed with aromatic herbs, sweet red onions, and hot green peppers.',
        am: 'የተመረጠ የበሬ ስጋ በከፍተኛ ሙቀት በሽንኩርት፣ ቃሪያና ቅመሞች ተጠብሶ ትኩስ ሆኖ በሸክላ የሚቀርብ ተወዳጅ ምግብ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Savory, succulent, and kissed with smoky char. The fresh rosemary brings piney fragrance while raw green chilies lend a sharp, crisp kick.',
        am: 'የተጠበሰ የስጋ መዓዛ፣ የሮዝመሪ ቅጠል ሽታ እና የቃሪያው ቅመም ተስማምተው እጅግ የሚጣፍጥ ጣዕም ይሰጡታል።',
      },
      whatShouldIExpect: {
        en: 'Arrives crackling hot in a clay burner with embers beneath. Juicy cubes of beef coated in seasoned butter juices, accompanied by spicy awaze paste and senafich (mustard dip).',
        am: 'በስሩ ከሰል ካለው የሸክላ ምድጃ ጋር እየተንጣጣ ይመጣል። ከአዋዜ እና ከሰናፍጭ ማባያ ጋር በእንጀራ ይቀርባል።',
      },
    },
    ingredients: {
      en: ['Prime beef tenderloin cubes', 'Fresh rosemary sprigs', 'Diced red onions', 'Sliced green jalapenos', 'Purified spiced butter', 'Fresh garlic cloves', 'Black pepper & sea salt'],
      am: ['የበሬ ስጋ ፍርምባ/ለስላሳ', 'የጥብስ ቅጠል (ሮዝመሪ)', 'ቀይ ሽንኩርት', 'የፈረንጅ ቃሪያ', 'ንጥር ቅቤ', 'ነጭ ሽንኩርት', 'ጨውና ቁንዶ በርበሬ'],
    },
    allergens: {
      contains: ['Milk (Butter - can be ordered with oil for dairy-free)'],
      potential: [],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Please confirm with restaurant staff if you have a serious allergy.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። ከባድ የአለርጂ ችግር ካለብዎት እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 610,
      protein: 46,
      carbs: 8,
      fat: 38,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'habesha-beer',
        name: { en: 'Cold Bedele Special / Habesha Beer', am: 'ቀዝቃዛ ሐበሻ ቢራ' },
        category: 'beverages',
        description: {
          en: 'Crisp, golden lager brewed in Debre Birhan. Carbonation cleanses the savory butter from the palate.',
          am: 'ከጥብስ ጋር የሚስማማ ቀዝቃዛ ቢራ።',
        },
        price: 110,
        image: '/images/dishes/Tej.jpg',
        type: 'goesWellWith',
      },
      {
        id: 'awaze-sauce',
        name: { en: 'Awaze Spicy Paste & Senafich', am: 'አዋዜ እና ሰናፍጭ' },
        category: 'traditional',
        description: {
          en: 'Fiery berbere whipped with tej and garlic, alongside fresh crushed mustard seed dip.',
          am: 'በጠጅና በቅመም የተደባለቀ አዋዜ።',
        },
        price: 50,
        image: '/images/dishes/TereSiga.jpg',
        type: 'youMightLike',
      },
    ],
    comparison: {
      spiceLevel: 'Medium',
      style: { en: 'Pan-Sautéed / Sizzling', am: 'በምጣድ የተጠበሰ' },
      proteinType: { en: 'Beef Tenderloin', am: 'የበሬ ስጋ' },
      bestFor: { en: 'Meat lovers seeking savory, smoky crunch', am: 'የስጋ አፍቃሪዎችና ፈጣን ጥብስ ለሚፈልጉ' },
    },
  },
  {
    id: 'shiro-tegabino',
    name: {
      en: 'Shiro Tegabino (Simmering Clay Pot)',
      am: 'ሽሮ ተጋቢኖ በሸክላ',
    },
    description: {
      en: 'Powdered sun-dried chickpeas slow-whipped with 15 Ethiopian herbs, garlic, and onions into a velvety, aromatic stew. Served bubbling vigorously inside a red earthen clay vessel.',
      am: 'በቅመማ ቅመም በተፈጨ የሽሮ ዱቄት፣ በሽንኩርትና ነጭ ሽንኩርት የሚዘጋጅ በሸክላ ድስት እየተንተከተከ የሚቀርብ ተወዳጅ የጾም ወጥ።',
    },
    price: 320,
    category: 'vegetarian',
    image: '/images/dishes/Shiro.jpg',
    tags: ['Vegetarian', 'Plant-based', 'Comfort Food', 'Fast-Day Favorite'],
    popularity: 'popular',
    isAvailable: true,
    spiceLevel: 'mild',
    explanation: {
      whatIsIt: {
        en: 'Ethiopia’s beloved daily comfort food. Sun-dried chickpeas and broad beans roasted with cumin, coriander, and mild peppers, then whisked in water and aromatics until thick and creamy.',
        am: 'የኢትዮጵያውያን ተወዳጅ የየዕለት ምግብ ሲሆን ከሽምብራና ባቄላ ዱቄት በልዩ ልዩ ቅመሞች ተዘጋጅቶ የሚበስል ለስላሳ ወጥ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Nutty, garlicky, and velvety smooth with a gentle warmth that builds softly without blistering heat.',
        am: 'የሽንኩርትና የነጭ ሽንኩርት ጣዕም ያለው፣ ለስላሳና ቀለል ያለ የሚያረጋጋ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Arrives volcano-hot, bubbling rhythmically inside a dark clay pot topped with a whole fresh jalapeno. Scoop immediately with roll-ups of cool injera.',
        am: 'እየፈላ ትኩስ ሆኖ በሸክላ ድስት ከቃሪያ ጋር ይቀርባል። በቀዝቃዛ እንጀራ እየተጠቀለለ ይበላል።',
      },
    },
    ingredients: {
      en: ['Spiced roasted chickpea flour (Shiro powder)', 'Purified sunflower oil (or Niter Kibbeh upon request)', 'Finely minced red onion', 'Crushed garlic & ginger', 'Whole green chili', 'Pure mountain spring water'],
      am: ['የሽሮ ዱቄት', 'የሱፍ ዘይት (ወይም ቅቤ)', 'የተከተፈ ቀይ ሽንኩርት', 'ነጭ ሽንኩርትና ዝንጅብል', 'ቃሪያ', 'ንጹህ ውሃ'],
    },
    allergens: {
      contains: ['Legumes (Chickpeas / Broad beans)'],
      potential: ['Dairy (only if non-fasting butter version requested)'],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Please confirm with restaurant staff if you have a serious allergy.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። ከባድ የአለርጂ ችግር ካለብዎት እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 380,
      protein: 19,
      carbs: 48,
      fat: 14,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'fresh-salad',
        name: { en: 'Timatim Salata (Tomato & Pepper Salad)', am: 'የቲማቲም ሰላጣ' },
        category: 'vegetarian',
        description: {
          en: 'Crisp diced tomatoes, shallots, and spicy green pepper tossed in a cold lemon-mustard dressing.',
          am: 'በሎሚና ዘይት የተዘጋጀ ትኩስ የቲማቲም ሰላጣ።',
        },
        price: 120,
        image: '/images/dishes/Gomen.jpg',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'Mild',
      style: { en: 'Creamy Legume Stew', am: 'ለስላሳ የጥራጥሬ ወጥ' },
      proteinType: { en: 'Chickpea & Broad Bean', am: 'የሽምብራና ባቄላ ፕሮቲን' },
      bestFor: { en: 'Vegetarians & wholesome comfort dining', am: 'ለአትክልትና ጾም ተመጋቢዎች' },
    },
  },
  {
    id: 'kitfo-special',
    name: {
      en: 'Kitfo Special (Gurage Style)',
      am: 'ልዩ የጉራጌ ክትፎ ከአይብና ጎመን ጋር',
    },
    description: {
      en: 'Hand-minced top-round beef warmed gently with warm herbal spiced butter (niter kibbeh) and fiery mitmita chili. Served with seasoned cottage cheese (ayib) and collard greens (gomen).',
      am: 'በስሱ የተቀቀለ ወይም ጥሬ የበሬ ስጋ በንጥር ቅቤ እና በሚጥሚጣ ተለውሶ ከአይብና ከጎመን ጋር የሚቀርብ የጉራጌ ባህላዊ ምግብ።',
    },
    price: 680,
    category: 'traditional',
    image: '/images/dishes/TereSiga.jpg',
    tags: ['Traditional', 'Popular', 'High Protein', 'Chef Signature'],
    popularity: 'signature',
    isAvailable: true,
    spiceLevel: 'hot',
    explanation: {
      whatIsIt: {
        en: 'The culinary jewel of the Gurage people. Ultra-lean raw or gently warmed minced beef infused with seasoned herbal butter and fiery birds-eye chili powder (mitmita).',
        am: 'የጉራጌ ብሔረሰብ ባህላዊና ክቡር ማዕድ ሲሆን ከላመ የበሬ ስጋ፣ በልዩ ንጥር ቅቤና በሚጥሚጣ የሚዘጋጅ ምግብ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Rich, melt-in-your-mouth velvety beef with a fiery kick of mitmita, calmed instantaneously by cool creamy cheese and herbal butter notes.',
        am: 'በአፍ ውስጥ የሚሟሟ የቅቤ ልስላሴ ያለው፣ የሚጥሚጣው ማቃጠል በአይቡ ቅዝቃዜ የሚበርድበት ልዩ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Can be ordered "Leb-Leb" (gently warmed/rare) or "Tibs-style" (well cooked). Served alongside steamed collard greens, fresh ayib cheese, and kocho (fermented enset flatbread).',
        am: 'ጥሬ፣ ለብለብ ወይም በደንብ የበሰለ ተብሎ ሊታዘዝ ይችላል። ከቆጮ፣ ከአይብና ከጎመን ጋር ይቀርባል።',
      },
    },
    ingredients: {
      en: ['Fresh prime beef top round (minced fine)', 'Infused Niter Kibbeh spiced butter', 'Authentic Mitmita chili powder', 'Ayib (mild Ethiopian cottage cheese)', 'Gomen (braised collard greens)', 'Ground Korarima cardamom'],
      am: ['የተመረጠ የበሬ ቀይ ስጋ', 'ንጥር ቅቤ', 'ሚጥሚጣ', 'አይብ', 'የተቀቀለ ጎመን', 'ኮረሪማ'],
    },
    allergens: {
      contains: ['Milk (Butter and Fresh Ayib Cheese)'],
      potential: [],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Consuming raw or undercooked meat may increase risk of foodborne illness. Please confirm with restaurant staff.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። ጥሬ ስጋ መመገብ የጤና ስጋት ሊኖረው ስለሚችል እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 640,
      protein: 52,
      carbs: 6,
      fat: 45,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'kocho-bread',
        name: { en: 'Authentic Kocho Flatbread', am: 'ባህላዊ የቆጮ ቂጣ' },
        category: 'traditional',
        description: {
          en: 'Traditional Gurage fermented enset flatbread. Earthy texture pairs perfectly with rich kitfo butter.',
          am: 'ከእንሰት የሚዘጋጅ ባህላዊ የጉራጌ ቂጣ።',
        },
        price: 80,
        image: '/images/dishes/Injera.jpg',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'High',
      style: { en: 'Minced Warm/Rare with Butter', am: 'ለብለብ በቅቤ የተለወሰ' },
      proteinType: { en: 'Lean Beef Top-Round', am: 'የበሬ ቀይ ስጋ' },
      bestFor: { en: 'Gourmet seekers of authentic cultural delicacies', am: 'ልዩ የባህል ምግብ ለሚወዱ' },
    },
  },
  {
    id: 'beyaynetu-combo',
    name: {
      en: 'Yetsom Beyaynetu (Fasting Rainbow Platter)',
      am: 'የጾም በያይነቱ (የአትክልት ማዕድ)',
    },
    description: {
      en: 'An exquisite color palette of 8 vegetarian dishes spread across injera: split red lentil wot, yellow split pea stew, collard greens, curried potatoes, beetroot, green beans, and salad.',
      am: 'በእንጀራ ላይ በውበት የተደረደሩ ከ8 በላይ የተለያዩ የአትክልት ወጦች፡ ምስር፣ ክክ፣ አሊቻ፣ ጎመን፣ ቀይ ስር፣ ፎሶሊያና ሰላጣ።',
    },
    price: 460,
    category: 'vegetarian',
    image: '/images/dishes/Beyeaynetu.jpg',
    tags: ['Vegetarian', 'Plant-based', 'Gluten-Free Option', 'Popular'],
    popularity: 'popular',
    isAvailable: true,
    spiceLevel: 'medium',
    explanation: {
      whatIsIt: {
        en: 'Ethiopia’s famous multi-dish plant-based feast developed over millennia of Orthodox Christian fasting traditions. Completely dairy-free, egg-free, and vegan.',
        am: 'በጾም ወቅት የሚቀርብ ሙሉ በሙሉ ከአትክልትና ጥራጥሬ የተዘጋጀ የተለያየ ጣዕምና ቀለም ያለው የኢትዮጵያ ማዕድ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'An exciting contrast of flavors on every bite: spicy red lentils, sweet savory beetroots, earthy garlic-braised greens, and mild creamy turmeric peas.',
        am: 'የተለያየ ጣዕም ያለው ሲሆን አንዱ ቅመም ሲኖረው ሌላው ጣፋጭና ለስላሳ በመሆኑ እጅግ ይጣፍጣል።',
      },
      whatShouldIExpect: {
        en: 'A massive communal plate covered in teff injera with dollops of colorful stews radiating from center. Perfect for sharing or experiencing everything at once.',
        am: 'በሰፊው የእንጀራ ማዕድ ላይ የተደረደሩ የተለያዩ ወጦች በአንድ ላይ ይቀርባሉ። ለጋራ መብላት እጅግ ምቹ ነው።',
      },
    },
    ingredients: {
      en: ['Red lentils (Misir Wot)', 'Yellow split peas (Kik Alicha)', 'Braised collard greens (Gomen)', 'Cumin spiced cabbage & carrots (Atkilt)', 'Pickled beets & potatoes (Key Sir)', 'Green beans & carrots (Fosolia)', 'Fresh injera base'],
      am: ['የምስር ወጥ', 'የክክ አልጫ', 'የተቀቀለ ጎመን', 'የጥቅል ጎመንና ካሮት', 'ቀይ ስር', 'ፎሶሊያ', 'እንጀራ'],
    },
    allergens: {
      contains: ['Legumes (Lentils, Peas)'],
      potential: [],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. 100% plant-based, prepared in dedicated cookware during fasting periods.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። ሙሉ በሙሉ ከእንስሳት ተዋጽኦ ነፃ ነው።',
      },
    },
    nutrition: {
      calories: 560,
      protein: 26,
      carbs: 88,
      fat: 12,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'fresh-lemonade',
        name: { en: 'Addis Fresh Mint Limonata', am: 'ትኩስ ናና ሊሞናታ' },
        category: 'beverages',
        description: {
          en: 'Freshly squeezed Ethiopian lemons with crushed garden mint and raw cane sugar.',
          am: 'ትኩስ የሎሚና የናና መጠጥ።',
        },
        price: 90,
        image: '/images/dishes/Spris_Juice.jpg',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'Medium',
      style: { en: 'Multi-Stew Platter (Vegan)', am: 'የተለያየ የአትክልት ድብልቅ' },
      proteinType: { en: 'Lentils & Chickpeas (Plant)', am: 'የጥራጥሬ ፕሮቲን' },
      bestFor: { en: 'Vegans, vegetarians, and first-time Ethiopian explorers', am: 'የተለያየ ጣዕም በአንድ ላይ ለሚፈልጉ' },
    },
  },
  {
    id: 'key-firfir',
    name: {
      en: 'Siga Firfir (Spiced Beef & Injera Saute)',
      am: 'የስጋ ፍርፍር በበርበሬ',
    },
    description: {
      en: 'Shredded sourdough injera folded into a deep berbere sauce with tender beef strips, seasoned butter, and cardamom until all juices are deeply absorbed. Served hot.',
      am: 'የተቆራረጠ ለስላሳ እንጀራ ከበሬ ስጋ፣ ከበርበሬና ከንጥር ቅቤ ጋር ተቁላልቶ የሚዘጋጅ ተወዳጅ ቁርስና ምሳ።',
    },
    price: 490,
    category: 'breakfast',
    image: '/images/dishes/Kitfo.jpg',
    tags: ['Breakfast', 'Spicy', 'Hearty'],
    popularity: 'regular',
    isAvailable: true,
    spiceLevel: 'hot',
    explanation: {
      whatIsIt: {
        en: 'One of the most comforting dishes in Ethiopia: shredded injera sauteed in rich spiced sauce with bits of dry-aged beef jerky (quanta) or fresh beef cubes.',
        am: 'የተቆረሰ እንጀራ በስጋ መረቅና በበርበሬ ተለውሶ የሚዘጋጅ እጅግ የሚወደድ የኢትዮጵያ ባህላዊ ምግብ ነው።',
      },
      whatDoesItTasteLike: {
        en: 'Savory, spicy, tangy, and profoundly moist. The natural sourdough acidity of the teff balances the spicy, buttery beef reduction.',
        am: 'የእንጀራው መጠነኛ ኮምጣጣነት ከበርበሬው ማቃጠልና ከስጋው ልስላሴ ጋር ተደምሮ ልዩ እርካታ ይሰጣል።',
      },
      whatShouldIExpect: {
        en: 'Served warm with a side of cool plain injera or yogurt to roll up the saucy shredded pieces. Often eaten for weekend brunch or lunch.',
        am: 'ትኩስ ሆኖ ከተጨማሪ እንጀራ ወይም እርጎ ጋር ይቀርባል። ለቁርስና ለምሳ እጅግ ተመራጭ ነው።',
      },
    },
    ingredients: {
      en: ['Torn Teff injera', 'Tender beef cubes', 'Dark Berbere spice blend', 'Red onions', 'Spiced butter (Niter Kibbeh)', 'Garlic & Korarima'],
      am: ['የጤፍ እንጀራ', 'የበሬ ስጋ', 'ደለዘ በርበሬ', 'ቀይ ሽንኩርት', 'ንጥር ቅቤ', 'ነጭ ሽንኩርት'],
    },
    allergens: {
      contains: ['Milk (Butter)', 'Gluten (if mixed flour injera)'],
      potential: [],
      disclaimer: {
        en: 'Ingredients and allergen information may vary. Please confirm with restaurant staff if you have a serious allergy.',
        am: 'የቅመሞችና የአለርጂ መረጃዎች ሊለያዩ ይችላሉ። እባክዎ ከአስተናባሪዎ ጋር ያረጋግጡ።',
      },
    },
    nutrition: {
      calories: 590,
      protein: 38,
      carbs: 62,
      fat: 22,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'spiced-tea',
        name: { en: 'Ethiopian Spiced Tea (Shai)', am: 'የቅመም ሻይ' },
        category: 'beverages',
        description: {
          en: 'Black tea steeped with cinnamon bark, cloves, and crushed green cardamom pods.',
          am: 'በቀረፋና በክረንፉል የፈላ የቅመም ሻይ።',
        },
        price: 50,
        image: '/images/dishes/Tej.jpg',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'High',
      style: { en: 'Sauce-Soaked Injera Saute', am: 'በወጥ የተለወሰ ፍርፍር' },
      proteinType: { en: 'Tender Beef Strips', am: 'የበሬ ስጋ' },
      bestFor: { en: 'High energy brunch and hearty spice lovers', am: 'ለቁርስና ብርታት ለሚሹ' },
    },
  },
  {
    id: 'ethiopian-coffee-ceremony',
    name: {
      en: 'Buna Ceremony (Traditional Coffee)',
      am: 'የኢትዮጵያ ባህላዊ የቡና ስነ-ስርዓት',
    },
    description: {
      en: 'The birthplace of coffee ritual: green Arabica beans hand-washed, roasted over open flames, ground with mortar and pestle, and triple-boiled in a black clay Jebena pot. Served with popcorn.',
      am: 'የቡና መገኛ በሆነችው ኢትዮጵያ የሚዘጋጅ ባህላዊ የቡና ስነ-ስርዓት፡ ተቆልቶ፣ ተወቅጦ በሸክላ ጀበና ተፈልቶ ከዕጣንና ከፈንድሻ ጋር የሚቀርብ።',
    },
    price: 150,
    category: 'beverages',
    image: '/images/dishes/Buna.jpg',
    tags: ['Traditional', 'Beverage', 'Popular', 'Cultural Experience'],
    popularity: 'signature',
    isAvailable: true,
    spiceLevel: 'none',
    explanation: {
      whatIsIt: {
        en: 'An ancient social ritual honoring guests. Involves roasting green heirloom beans in front of the table, offering the fragrant smoke, and slowly steeping the brew in a clay pot called a Jebena.',
        am: 'እንግዳን ለማክበር የሚደረግ ጥንታዊ ማህበራዊ ስነ-ስርዓት ሲሆን ቡናው በእንግዶች ፊት ተቆልቶ፣ ተወቅጦ በጀበና ተፈልቶ ይቀርባል።',
      },
      whatDoesItTasteLike: {
        en: 'Unmatched purity: bold, fruity, notes of wild blueberry, bergamot, and chocolate with zero burnt bitterness. Served black with optional sugar or rue herb (tena adam).',
        am: 'ጥራት ያለው የሀገሬው ቡና ጣዕም፣ የፍራፍሬና የቸኮሌት መዓዛ ያለው ልዩ ጽዱ ጣዕም አለው።',
      },
      whatShouldIExpect: {
        en: 'Served in small handleless ceramic cups (Cini) accompanied by hot salted popcorn and the sweet scent of frankincense and myrrh incense drifting over the grass-strewn table.',
        am: 'በባህል ሲኒ ከትኩስ ፈንድሻና ከዕጣን ጢስ ጋር ይቀርባል።',
      },
    },
    ingredients: {
      en: ['Heirloom Yirgacheffe / Sidama Arabica beans', 'Pure mountain spring water', 'Fresh Tenadam rue herb (optional)', 'Frankincense & myrrh smoke', 'Fresh popped corn'],
      am: ['የይርጋጨፌ/ሲዳማ አረቢካ ቡና', 'ንጹህ ውሃ', 'ጤና አዳም', 'ዕጣን', 'ፈንድሻ'],
    },
    allergens: {
      contains: [],
      potential: [],
      disclaimer: {
        en: 'Contains caffeine. Natural, unadulterated pure roast coffee.',
        am: 'ካፌይን ይዟል። ተፈጥሯዊ የቡና ፍሬ።',
      },
    },
    nutrition: {
      calories: 15,
      protein: 1,
      carbs: 2,
      fat: 0,
      isEstimate: true,
    },
    pairings: [
      {
        id: 'doro-wot',
        name: { en: 'Doro Wot', am: 'ዶሮ ወጥ' },
        category: 'traditional',
        description: { en: 'The ultimate culinary finale after a royal Ethiopian feast.', am: 'ከምግብ በኋላ የሚጠጣ ምርጥ ቡና።' },
        price: 580,
        image: '/images/dishes/Doro_wot.jpg',
        type: 'goesWellWith',
      },
    ],
    comparison: {
      spiceLevel: 'Mild',
      style: { en: 'Artisanal Clay Pot Brew', am: 'በጀበና የተፈላ' },
      proteinType: { en: 'Herbal Beverage', am: 'መጠጥ' },
      bestFor: { en: 'A tranquil cultural conclusion to your meal', am: 'ከምግብ በኋላ ለመዝናናት' },
    },
  },
];

export const initialAnalyticsEvents: AnalyticsEvent[] = [
  { id: 'ev-1', timestamp: Date.now() - 3600000 * 4, type: 'menu_view', metadata: { source: 'qr_table_4' } },
  { id: 'ev-2', timestamp: Date.now() - 3600000 * 3, type: 'dish_view', metadata: { dishId: 'doro-wot', dishName: 'Doro Wot' } },
  { id: 'ev-3', timestamp: Date.now() - 3600000 * 3, type: 'explain_open', metadata: { dishId: 'doro-wot', dishName: 'Doro Wot' } },
  { id: 'ev-4', timestamp: Date.now() - 3600000 * 2.5, type: 'dish_view', metadata: { dishId: 'special-beef-tibs', dishName: 'Special Beef Tibs' } },
  { id: 'ev-5', timestamp: Date.now() - 3600000 * 2, type: 'compare_action', metadata: { comparePair: ['Doro Wot', 'Special Beef Tibs'] } },
  { id: 'ev-6', timestamp: Date.now() - 3600000 * 1.5, type: 'filter_click', metadata: { filterName: 'Vegetarian' } },
  { id: 'ev-7', timestamp: Date.now() - 3600000 * 1.2, type: 'dish_view', metadata: { dishId: 'shiro-tegabino', dishName: 'Shiro Tegabino' } },
  { id: 'ev-8', timestamp: Date.now() - 3600000 * 0.8, type: 'pairing_click', metadata: { dishId: 'doro-wot', filterName: 'Authentic Tej' } },
  { id: 'ev-9', timestamp: Date.now() - 3600000 * 0.4, type: 'language_change', metadata: { language: 'am' } },
];
