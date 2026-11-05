// ============================================================================
// سوبرماركت عَ طريقك — طرابلس والشمال (A' Tareeqak Supermarket - Tripoli)
// كتالوج المنتجات الرسمية، المونة، القهوة، وعروض الجملة
// ============================================================================

// سعر الصرف المعتمد حصراً: 1 دولار = 89,900 ليرة لبنانية
// Exchange rate moved to src/config.js (single source: window.HARDCODED_EXCHANGE_RATE).

window.CATEGORIES = [
  {
    id: "all",
    name: "جميع الأصناف والرفوف",
    description: "تصفح كامل بضائع ومونة السوبرماركت في طرابلس"
  },
  {
    id: "mouneh",
    name: "قسم المونة اللبنانية",
    description: "مكدوس باذنجان بالجوز، زعتر بلدي، كشك جبلي، وزيت زيتون الكورة البكر"
  },
  {
    id: "hot-beverages",
    name: "ركن القهوة والشاي",
    description: "بن لبناني أصلي بالهيل، مته الخارطة الخضراء، وشاي سيلاني فاخر"
  },
  {
    id: "wholesale",
    name: "عروض الجملة والتوفير",
    description: "صناديق وكراتين كاملة بأسعار مخفضة (بيبسي، حليب، مياه، وشوالات أرز)"
  },
  {
    id: "beverages",
    name: "المشروبات والغازيات",
    description: "عبوات وعلب بيبسي، سفن أب، مستر جوسي ومشروبات الطاقة التجارية"
  },
  {
    id: "sweets",
    name: "الشوكولاتة والحلويات",
    description: "ألواح سنيكرز، كيت كات وشوكولاتة ريماس الفاخرة المغلفة"
  },
  {
    id: "frozen",
    name: "المجمدات والمثلجات",
    description: "أكياس خضار بامية وبازيلاء مثلجة وعلب كرتون برغر بقري نيء مجمد"
  },
  {
    id: "bakery",
    name: "المخبز والأفران",
    description: "أكياس خبز أبيض لبناني طازج يومياً على طريقة 'لبنان الأخضر'"
  },
  {
    id: "dairy",
    name: "الألبان والأجبان البلدية",
    description: "سطول لبنة بلدية طرابلسية، قوالب أجبان مفرغة من الهواء وحليب مبستر"
  },
  {
    id: "pantry",
    name: "المونة والتموين العام",
    description: "شيبس، بزورات، عسل، سمنة، زيت، زبدة، معلبات، ومنظفات"
  }
];

window.PRODUCTS = [
  // ==========================================================================
  // 1. قسم المونة اللبنانية (Lebanese Mouneh) — [قسم جديد]
  // ==========================================================================
  {
    id: "mouneh-makdous-jar",
    name: "مكدوس باذنجان بلدي — مرطبان بزيت الزيتون والجوز",
    category: "mouneh",
    categoryLabel: "قسم المونة اللبنانية",
    unit: "مرطبان زجاجي 650 غرام",
    brand: "مونة الضيعة اللبنانية",
    priceUSD: 4.90,
    oldPriceUSD: 5.75,
    rating: 5.0,
    reviews: 320,
    badge: "مونة بلدية أصيلة",
    badgeType: "baladi",
    photo: null,
    isBestSeller: true,
    isMouneh: true,
    description: "مرطبان مكدوس باذنجان بلدي صغير محشو بالجوز البلدي والفليفلة الحمراء والثوم ومغمور بزيت الزيتون الصافي."
  },
  {
    id: "mouneh-zaatar-pack",
    name: "زعتر بلدي لبناني إكسترا — كيس مفرغ بالسمسم والسماق",
    category: "mouneh",
    categoryLabel: "قسم المونة اللبنانية",
    unit: "كيس فاكيوم محكم 500 غرام",
    brand: "مونة الشمال الأصلية",
    priceUSD: 3.40,
    oldPriceUSD: 3.95,
    rating: 4.9,
    reviews: 285,
    badge: "أعشاب برية جبلية",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    isMouneh: true,
    description: "كيس زعتر بلدي لبناني بري منتقى من أعالي الجبال، مخلوط بالسمسم المحمص الفاخر والسماق البلدي الصافي الحامض."
  },
  {
    id: "mouneh-kishk-pack",
    name: "كشك بلدي بقري نخب أول — كيس كرافت محكم",
    category: "mouneh",
    categoryLabel: "قسم المونة اللبنانية",
    unit: "كيس كرافت مغلق 500 غرام",
    brand: "مؤونة جبال لبنان",
    priceUSD: 4.50,
    oldPriceUSD: 5.20,
    rating: 4.9,
    reviews: 210,
    badge: "مجفف طبيعياً بالشمس",
    badgeType: "baladi",
    photo: null,
    isBestSeller: false,
    isMouneh: true,
    description: "كشك بلدي أصيل محضر من لبن البقر الطازج والبرغل الناعم والمجفف طبيعياً بأشعة الشمس الجبلية."
  },
  {
    id: "mouneh-olive-oil-tin",
    name: "زيت زيتون بكر ممتاز — تنكة معاصر الكورة 4 ليتر",
    category: "mouneh",
    categoryLabel: "قسم المونة اللبنانية",
    unit: "تنكة صفيح معدنية 4 ليتر",
    brand: "معاصر الكورة الخضراء",
    priceUSD: 28.50,
    oldPriceUSD: 33.00,
    rating: 5.0,
    reviews: 460,
    badge: "عصرة أولى ع البارد",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    isMouneh: true,
    description: "تنكة زيت زيتون بكر ممتاز نقي 100% من زيتون بساتين الكورة والشمال، عصرة أولى على البارد بحموضة متدنية جداً."
  },

  // ==========================================================================
  // 2. ركن القهوة والشاي (Coffee & Hot Beverages) — [قسم جديد]
  // ==========================================================================
  {
    id: "hot-bev-lebanese-coffee",
    name: "بن لبناني أصلي بالهيل — باكيت فاكيوم مضغوط",
    category: "hot-beverages",
    categoryLabel: "ركن القهوة والشاي",
    unit: "باكيت فاكيوم 250 غرام",
    brand: "القهوة اللبنانية الفاخرة",
    priceUSD: 3.25,
    oldPriceUSD: 3.80,
    rating: 5.0,
    reviews: 510,
    badge: "تحميص غامق بالهيل",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "باكيت قهوة لبنانية مطحونة ناعماً مع حب الهال الأخضر الفاخر، معبأة بتقنية الفاكيوم للحفاظ على الرائحة الزكية."
  },
  {
    id: "hot-bev-yerba-mate",
    name: "مته الخارطة الخضراء — العبوة الأصلية",
    category: "hot-beverages",
    categoryLabel: "ركن القهوة والشاي",
    unit: "باكيت ورقي 250 غرام",
    brand: "مته الخارطة (Taragui)",
    priceUSD: 1.85,
    oldPriceUSD: 2.20,
    rating: 4.9,
    reviews: 380,
    badge: "الأصلية الأكثر طلباً",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    description: "باكيت مته الخارطة الأرجنتينية الخضراء الأصلية الشهيرة، أوراق طبيعية مجففة غنية بمضادات الأكسدة والنشاط."
  },
  {
    id: "hot-bev-ceylon-tea",
    name: "شاي سيلاني أسود فاخر — علبة صفيح أوراق كاملة",
    category: "hot-beverages",
    categoryLabel: "ركن القهوة والشاي",
    unit: "علبة معدنية فاخرة 400 غرام",
    brand: "بيور سيلان (Pure Ceylon)",
    priceUSD: 3.95,
    oldPriceUSD: 4.60,
    rating: 4.8,
    reviews: 240,
    badge: "أوراق شاي كاملة OP",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "علبة صفيح من أجود أوراق الشاي السيلاني الأسود الكاملة، تمنحك لوناً عنبرياً شفافاً ونكهة شاي غنية ومميزة."
  },

  // ==========================================================================
  // 3. عروض الجملة والتوفير (Wholesale Deals) — [قسم جديد]
  // ==========================================================================
  {
    id: "ws-pepsi-box",
    name: "صندوق جملة: بيبسي كولا كرتونة 24 علبة",
    category: "wholesale",
    categoryLabel: "عروض الجملة",
    unit: "صندوق كرتون كامل (24 × 330 مل)",
    brand: "بيبسي العالمية (PepsiCo)",
    priceUSD: 12.80,
    oldPriceUSD: 15.60,
    rating: 4.9,
    reviews: 340,
    badge: "وفر 20% بالجملة",
    badgeType: "hot",
    photo: null,
    isWholesale: true,
    isBestSeller: true,
    description: "كرتونة بيبسي كولا أصلية مغلفة تحتوي على 24 علبة كانز سعة 330 مل، السعر الأوفر للعائلات والمناسبات."
  },
  {
    id: "ws-milk-crate",
    name: "كرتونة جملة: حليب كامل الدسم 12 لتر",
    category: "wholesale",
    categoryLabel: "عروض الجملة",
    unit: "صندوق شحن 12 عبوة (12 × 1 لتر)",
    brand: "ألبان الشمال المعقمة",
    priceUSD: 15.90,
    oldPriceUSD: 18.60,
    rating: 4.9,
    reviews: 270,
    badge: "توفير العائلة الشهري",
    badgeType: "fresh",
    photo: null,
    isWholesale: true,
    description: "صندوق جملة يحتوي على 12 عبوة كرتون تترا باك بحجم 1 لتر حليب بقر مبستر UHT كامل الدسم، صالح لفترات طويلة."
  },
  {
    id: "ws-water-pack",
    name: "طرد مياه معدنية طبيعية — 12 قنينة كبيرة",
    category: "wholesale",
    categoryLabel: "عروض الجملة",
    unit: "طرد نايلون حراري (12 × 1.5 لتر)",
    brand: "مياه ينابيع لبنان الجبلية",
    priceUSD: 3.90,
    oldPriceUSD: 4.80,
    rating: 5.0,
    reviews: 620,
    badge: "عرض التوفير العائلي",
    badgeType: "hot",
    photo: null,
    isWholesale: true,
    isBestSeller: true,
    description: "طرد مياه شرب معدنية صحية معبأة من ينابيع الجبال اللبنانية، عبوة اقتصادية تحتوي على 12 قنينة سعة 1.5 لتر."
  },
  {
    id: "ws-rice-sack",
    name: "شوال أرز مصري نخب أول — شوال عائلي 5 كغ",
    category: "wholesale",
    categoryLabel: "عروض الجملة",
    unit: "شوال منسوج بمقبض 5 كيلو غرام",
    brand: "تموين طرابلس والشمال",
    priceUSD: 6.50,
    oldPriceUSD: 7.80,
    rating: 4.8,
    reviews: 310,
    badge: "أرز حبة قصيرة مفلفل",
    badgeType: "accent",
    photo: null,
    isWholesale: true,
    description: "شوال أرز مصري فاخر حبّة قصيرة منتقى بعناية ومغسول، مفلفل ولذيذ لجميع الطبخات اللبنانية واليخنات."
  },

  // ==========================================================================
  // 4. BEVERAGES (المشروبات والغازيات)
  // ==========================================================================
  {
    id: "bev-pepsi-can",
    name: "بيبسي كولا — عبوة معدنية أصلية",
    category: "beverages",
    categoryLabel: "المشروبات والغازيات",
    unit: "علبة كانز 330 مل",
    brand: "بيبسي العالمية (PepsiCo)",
    priceUSD: 0.65,
    oldPriceUSD: null,
    rating: 4.9,
    reviews: 320,
    badge: "الأكثر مبيعاً",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "عبوة بيبسي كولا معدنية سعة 330 مل مبردة وجاهزة، نكهة الانتعاش الكلاسيكية بفقاعات غازية منعشة."
  },
  {
    id: "bev-7up-can",
    name: "سفن أب — علبة ليمون غازية منعشة",
    category: "beverages",
    categoryLabel: "المشروبات والغازيات",
    unit: "علبة كانز 330 مل",
    brand: "سفن أب (7UP)",
    priceUSD: 0.65,
    oldPriceUSD: null,
    rating: 4.8,
    reviews: 245,
    badge: "انتعاش الليمون",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    description: "علبة سفن أب المعدنية الخضراء الشهيرة سعة 330 مل، خالية من الكافيين وبنكهة الليمون واللايم الفوار."
  },
  {
    id: "bev-mr-juicy",
    name: "عصير مستر جوسي معبأ — نكهات مشكلة",
    category: "beverages",
    categoryLabel: "المشروبات والغازيات",
    unit: "قنينة زجاجية تجارية 250 مل",
    brand: "مستر جوسي (Mr. Juicy)",
    priceUSD: 0.55,
    oldPriceUSD: 0.70,
    rating: 4.8,
    reviews: 188,
    badge: "مشروب محلي محبوب",
    badgeType: "fresh",
    photo: null,
    isBestSeller: false,
    description: "عبوة عصير مستر جوسي التجارية الشهيرة في طرابلس ولبنان، غنية بنكهات الفواكه ومحكمة الإغلاق."
  },
  {
    id: "bev-xxl-energy",
    name: "مشروب الطاقة إكس إكس إل (XXL Energy)",
    category: "beverages",
    categoryLabel: "المشروبات والغازيات",
    unit: "علبة رفيعة سليم 250 مل",
    brand: "إكس إكس إل إنرجي",
    priceUSD: 0.85,
    oldPriceUSD: 1.00,
    rating: 4.9,
    reviews: 290,
    badge: "طاقة مضاعفة",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "علبة مشروب الطاقة الذهبية XXL الغنية بالفيتامينات والتورين لتحفيز النشاط والتركيز أثناء العمل والسهر."
  },
  {
    id: "bev-dark-blue",
    name: "مشروب الطاقة دارك بلو (Dark Blue Energy)",
    category: "beverages",
    categoryLabel: "المشروبات والغازيات",
    unit: "علبة معدنية زرقاء 250 مل",
    brand: "دارك بلو (Dark Blue)",
    priceUSD: 0.80,
    oldPriceUSD: null,
    rating: 4.7,
    reviews: 165,
    badge: "نكهة قوية",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "مشروب الطاقة دارك بلو الأزرق الصاعق في عبوة ألومنيوم مبردة، يمنحك شحنة سريعة من الانتعاش والحيوية."
  },

  // ==========================================================================
  // 5. SWEETS (الشوكولاتة والحلويات)
  // ==========================================================================
  {
    id: "sweet-snickers",
    name: "شوكولاتة سنيكرز — لوح أصلي مغلّف",
    category: "sweets",
    categoryLabel: "الشوكولاتة والحلويات",
    unit: "لوح مغلّف 50 غرام",
    brand: "سنيكرز (Snickers)",
    priceUSD: 0.95,
    oldPriceUSD: 1.10,
    rating: 5.0,
    reviews: 410,
    badge: "الأكثر طلباً",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "لوح سنيكرز الغني بالنوجا الطرية والكراميل والفول السوداني المحمص المغطى بشوكولاتة الحليب الفاخرة."
  },
  {
    id: "sweet-kitkat",
    name: "شوكولاتة كيت كات — 4 أصابع ويفر",
    category: "sweets",
    categoryLabel: "الشوكولاتة والحلويات",
    unit: "عبوة أصابع ويفر 41.5 غرام",
    brand: "نستله كيت كات (KitKat)",
    priceUSD: 0.90,
    oldPriceUSD: null,
    rating: 4.9,
    reviews: 350,
    badge: "استراحة سريعة",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    description: "العبوة الكلاسيكية الحمراء من كيت كات، أربعة أصابع من الويفر المقرمش المغطى بطبقة سميكة من الشوكولاتة."
  },
  {
    id: "sweet-remas",
    name: "شوكولاتة ريماس — لوح محشو فاخر",
    category: "sweets",
    categoryLabel: "الشوكولاتة والحلويات",
    unit: "لوح شوكولاتة كرتوني 40 غرام",
    brand: "ريماس شوكليت (Remas)",
    priceUSD: 0.75,
    oldPriceUSD: 0.90,
    rating: 4.8,
    reviews: 215,
    badge: "فاخر واقتصادي",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "لوح شوكولاتة ريماس المغلف بإحكام والمحشو بكريمة الكاكاو والبندق الغنية، صناعة معتمدة ومذاق ساحر."
  },

  // ==========================================================================
  // 6. FROZEN FOODS (المجمدات والمثلجات)
  // ==========================================================================
  {
    id: "froz-okra-bag",
    name: "بامية زيرو بلدي — كيس مجمّد تجاري",
    category: "frozen",
    categoryLabel: "المجمدات والمثلجات",
    unit: "كيس فريزر محكم 400 غرام",
    brand: "مؤونة طرابلس والشمال",
    priceUSD: 2.45,
    oldPriceUSD: 2.85,
    rating: 4.9,
    reviews: 280,
    badge: "بامية زيرو نخب أول",
    badgeType: "baladi",
    photo: null,
    isBestSeller: true,
    description: "كيس بامية زيرو بلدية صغيرة الحجم مجمّدة فائقاً لحفظ الطراوة واللون الأخضر، جاهزة مباشرة للطبخ."
  },
  {
    id: "froz-peas-bag",
    name: "بازيلاء خضراء حلوة — كيس مفرّز نخب أول",
    category: "frozen",
    categoryLabel: "المجمدات والمثلجات",
    unit: "كيس مجمدات محكم 400 غرام",
    brand: "ثمار لبنان الخضراء",
    priceUSD: 1.85,
    oldPriceUSD: null,
    rating: 4.8,
    reviews: 195,
    badge: "تجميد فوري IQF",
    badgeType: "fresh",
    photo: null,
    isBestSeller: false,
    description: "كيس بازيلاء خضراء منتقاة ومجمدة بتقنية التجميد الفوري السريع، حبّات متماسكة حلوة المذاق لطبخات الأرز واليخنات."
  },
  {
    id: "froz-burger-box",
    name: "برغر بقري مثلج خام — علبة كرتون 8 أقراص",
    category: "frozen",
    categoryLabel: "المجمدات والمثلجات",
    unit: "علبة كرتون مجمّدة (800 غرام)",
    brand: "ملحمة طرابلس الكبرى",
    priceUSD: 6.95,
    oldPriceUSD: 7.80,
    rating: 4.9,
    reviews: 310,
    badge: "لحم بقري صافي 100%",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "علبة كرتونية تجارية تحتوي على 8 أقراص برغر لحم بقري خام مثلج، مفصولة بأوراق شمعية عازلة ومتبلة بالبهارات الخاصة."
  },

  // ==========================================================================
  // 7. BAKERY (المخبز والأفران)
  // ==========================================================================
  {
    id: "bakery-green-lebanon",
    name: "خبز أبيض لبناني — أكياس 'لبنان الأخضر'",
    category: "bakery",
    categoryLabel: "المخبز والأفران",
    unit: "ربطة نايلون (8 أرغفة كبيرة)",
    brand: "أفران طرابلس — نمط لبنان الأخضر",
    priceUSD: 0.65,
    oldPriceUSD: null,
    rating: 5.0,
    reviews: 640,
    badge: "طازج من الفرن يومياً",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    description: "ربطة الخبز اللبناني الأبيض الشهيرة بالكيس النايلون المطبوع بالأخضر، أرغفة طرية ذات طبقتين تخبز على مدار الساعة."
  },

  // ==========================================================================
  // 8. DAIRY & CHEESE (الألبان والأجبان البلدية)
  // ==========================================================================
  {
    id: "dairy-tripoli-labneh",
    name: "لبنة بلدية مصفّاة — سطل بلاستيك طرابلسي",
    category: "dairy",
    categoryLabel: "الألبان والأجبان",
    unit: "سطل معبأ محكم 500 غرام",
    brand: "ألبان الشمال البلدية",
    priceUSD: 2.95,
    oldPriceUSD: 3.40,
    rating: 5.0,
    reviews: 420,
    badge: "بلدية مكفولة 100%",
    badgeType: "baladi",
    photo: null,
    isBestSeller: true,
    description: "سطل لبنة طرابلسية بلدية مصفاة في القماش من الحليب الطبيعي الكامل الدسم، قوام كريمي متماسك وحموضة بلدية معتدلة."
  },
  {
    id: "dairy-tripoli-cheese",
    name: "جبنة عكاوي وحلوم — قالب مفرغ من الهواء",
    category: "dairy",
    categoryLabel: "الألبان والأجبان",
    unit: "قالب فاكيوم 400 غرام",
    brand: "مزارع طرابلس للأجبان",
    priceUSD: 4.10,
    oldPriceUSD: 4.75,
    rating: 4.9,
    reviews: 260,
    badge: "تغليف فاكيوم محكم",
    badgeType: "fresh",
    photo: null,
    isBestSeller: true,
    description: "قالب جبنة بيضاء بلدية مغلّف بتقنية تفريغ الهواء للحفاظ على نقاوة الطعم والماء الملحي، مثالية للترويقة والشوي."
  },
  {
    id: "dairy-tripoli-milk",
    name: "حليب طازج مبستر كامل الدسم — كرتونة تترا باك",
    category: "dairy",
    categoryLabel: "الألبان والأجبان",
    unit: "عبوة كرتون معقمة 1 لتر",
    brand: "ألبان الشمال المعقمة",
    priceUSD: 1.55,
    oldPriceUSD: 1.80,
    rating: 4.8,
    reviews: 310,
    badge: "مبستر UHT كامل الدسم",
    badgeType: "fresh",
    photo: null,
    isBestSeller: false,
    description: "عبوة حليب بقر مبستر ومعقم بنظام تترا باك بسدادة لولبية عملية، غني بالكالسيوم والفيتامينات الطبيعية."
  },

  // ==========================================================================
  // 9. PANTRY & GENERAL (المونة والتموين العام)
  // ==========================================================================
  {
    id: "pantry-chips",
    name: "شيبس بطاطا مقرمش — كيس ميتاليك تجاري",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "كيس فويل ألومنيوم 120 غرام",
    brand: "كرانش طرابلس",
    priceUSD: 1.10,
    oldPriceUSD: null,
    rating: 4.7,
    reviews: 190,
    badge: "قرمشة استثنائية",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "كيس شيبس بطاطا مقلية طبيعية مقرمشة بملح البحر والخل، في كيس محكم يمنع الرطوبة ويحفظ النكهة طازجة."
  },
  {
    id: "pantry-bzourat",
    name: "بزورات مشكلة محمصة — كيس ميتاليك زيبلوك",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "كيس واقف مفرغ 450 غرام",
    brand: "محامص طرابلس الكبرى",
    priceUSD: 7.90,
    oldPriceUSD: 8.90,
    rating: 5.0,
    reviews: 380,
    badge: "تحميص حطب يومي",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "كيس بزورات لبنانية مشكلة سوبر إكسترا (فستق حلبي، كاجو جامبو، لوز مدخن وبندق مقرمش) في كيس ألومنيوم بسحاب إغلاق."
  },
  {
    id: "pantry-honey",
    name: "عسل جبلي طبيعي صافي — مرطبان زجاجي معبأ",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "مرطبان زجاجي بغطاء ذهبي 500 غرام",
    brand: "مناحل أرز لبنان",
    priceUSD: 8.75,
    oldPriceUSD: 10.00,
    rating: 4.9,
    reviews: 210,
    badge: "عسل حر 100%",
    badgeType: "baladi",
    photo: null,
    isBestSeller: false,
    description: "مرطبان عسل زهرة الليمون والزهور البرية الجبلية الصافي المعبأ بعناية، غير مبستر ومحكم الإغلاق بغطاء معدني."
  },
  {
    id: "pantry-ghee",
    name: "سمنة بقرية بلدية صافية — علبة صفيح معدنية",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "علبة معدنية محكمة 800 غرام",
    brand: "خيرات المونة اللبنانية",
    priceUSD: 10.50,
    oldPriceUSD: 12.00,
    rating: 5.0,
    reviews: 275,
    badge: "سمنة بلدية أصيلة",
    badgeType: "baladi",
    photo: null,
    isBestSeller: true,
    description: "علبة معدنية تراثية من السمنة البقرية النقية 100% برائحتها الزكية، تمنح طبخات الأرز والمفركات طعماً لا يضاهى."
  },
  {
    id: "pantry-oil",
    name: "زيت دوار الشمس النقي — عبوة عائلية بلاستيكية",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "عبوة PET بمقبض 1.8 لتر",
    brand: "شمس الشمال النقية",
    priceUSD: 3.90,
    oldPriceUSD: 4.50,
    rating: 4.8,
    reviews: 340,
    badge: "توفير عائلي",
    badgeType: "hot",
    photo: null,
    isBestSeller: true,
    description: "عبوة بلاستيكية شفافة سعة 1.8 لتر بمقبض يدوي مريح، زيت دوار شمس مكرر خالي من الكوليسترول مثالي للقلي اليومي."
  },
  {
    id: "pantry-butter",
    name: "زبدة بقرية طبيعية — قالب مغلّف قصدير ذهبي",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "قالب فويل قصديري 200 غرام",
    brand: "ألبان لبنان النقية",
    priceUSD: 2.30,
    oldPriceUSD: 2.65,
    rating: 4.8,
    reviews: 180,
    badge: "دسم حليب 82%",
    badgeType: "fresh",
    photo: null,
    isBestSeller: false,
    description: "قالب زبدة طبيعية غير مملحة ملفوف بورق الفويل الذهبي العازل، قوام ناعم وطعم غني للمخبوزات والطبخ الفاخر."
  },
  {
    id: "pantry-corn",
    name: "ذرة حب صفراء حلوة — علبة معدنية معقمة",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "علبة صفيح سهلة الفتح 400 غرام",
    brand: "حصاد المزارع اللبنانية",
    priceUSD: 1.15,
    oldPriceUSD: null,
    rating: 4.7,
    reviews: 145,
    badge: "حبّات ذهبية كاملة",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "علبة معدنية بغطاء سهل الفتح تحتوي على حبوب الذرة الحلوة الذهبية المحفوظة بالماء والملح الخفيف."
  },
  {
    id: "pantry-mushrooms",
    name: "فطر أبيض مقطع شرائح — علبة معدنية معقمة",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "علبة صفيح محكمة 400 غرام",
    brand: "مونة طرابلس التموينية",
    priceUSD: 1.35,
    oldPriceUSD: 1.60,
    rating: 4.7,
    reviews: 130,
    badge: "جاهز للاستعمال",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "علبة فطر شمبنيون مقطع شرائح منتظمة محفوظة بالماء والملح، معقمة وجاهزة للطبخ الفوري في البيتزا والصلصات."
  },
  {
    id: "pantry-cleaner",
    name: "بخاخ منظف ومطهر شامل — عبوة رش تجارية",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "عبوة بخاخ زناد 750 مل",
    brand: "سبارك بريميوم (Spark)",
    priceUSD: 2.80,
    oldPriceUSD: 3.25,
    rating: 4.9,
    reviews: 210,
    badge: "يقضي على 99.9% من الجراثيم",
    badgeType: "hot",
    photo: null,
    isBestSeller: false,
    description: "عبوة بلاستيكية مزودة بمضخة رش بخاخة سعة 750 مل، تركيبة فعالة بالصنوبر والليمون لتطهير الأسطح والأرضيات."
  },
  {
    id: "pantry-personal-care",
    name: "مجموعة العناية بالبشرة النسائية — علبة خارجية مغلقة",
    category: "pantry",
    categoryLabel: "المونة والتموين",
    unit: "علبة كرتونية فاخرة 3 مستحضرات",
    brand: "بوتيك بيروت للعناية",
    priceUSD: 11.50,
    oldPriceUSD: 13.50,
    rating: 4.9,
    reviews: 190,
    badge: "عبوة كرتونية خارجية",
    badgeType: "accent",
    photo: null,
    isBestSeller: false,
    description: "علبة كرتونية تجارية خارجية مغلقة بإحكام تحتوي على روتين ترطيب وعناية نسائي بخلاصة ماء الورد وحمض الهيالورونيك."
  }
];


// ============================================================================
// Hero saving deals. `endsAt` is a FIXED ISO timestamp (Asia/Beirut, +02:00/+03:00)
// so countdowns do not reset on refresh. Update these dates when you run new deals.
// ============================================================================
window.HERO_SAVING_DEALS = [
  {
    id: "deal-mouneh-pack",
    title: "عرض مؤونة البيت الطرابلسي المتكاملة",
    subtitle: "وفّر 25% على حزمة المونة البلدية الأصيلة",
    tag: "عرض محدود",
    discountPct: 25,
    priceUSD: 36.80,
    oldPriceUSD: 49.00,
    endsAt: "2026-11-15T23:59:00+02:00",
    theme: "olive",
    includes: "تنكة زيت زيتون كورة 4 لتر + مكدوس بلدي 650غ + زعتر بلدي 500غ + كشك جبلي 500غ",
    productIds: ["mouneh-olive-oil-tin", "mouneh-makdous-jar", "mouneh-zaatar-pack", "mouneh-kishk-pack"]
  },
  {
    id: "deal-wholesale-beverages",
    title: "توفير الجملة الكبير: كرتونة بيبسي 24 علبة",
    subtitle: "اشترِ بسعر الجملة ووفّر 20% فوراً",
    tag: "سعر الجملة",
    discountPct: 20,
    priceUSD: 12.80,
    oldPriceUSD: 15.60,
    endsAt: "2026-11-10T23:59:00+02:00",
    theme: "tomato",
    includes: "كرتونة كاملة 24 علبة كولا 330 مل مبردة",
    productIds: ["ws-pepsi-box"]
  },
  {
    id: "deal-coffee-morning",
    title: "ركن الصباح: بن لبناني بالهيل ومتّة",
    subtitle: "مجموعة المزاج اللبناني الأصيل بخصم خاص",
    tag: "ركن القهوة",
    discountPct: 15,
    priceUSD: 5.10,
    oldPriceUSD: 6.00,
    endsAt: "2026-11-08T12:00:00+02:00",
    theme: "coffee",
    includes: "باكيت بن لبناني مطحون بالهيل 250غ + متّة خضراء 250غ",
    productIds: ["hot-bev-lebanese-coffee", "hot-bev-yerba-mate"]
  }
];

// ============================================================================
// Delivery zones. `etaMin` drives the ETA, `baseFeeUSD` the fee.
// `map` = hotspot coordinates on the illustrated Tripoli map (viewBox 0 0 600 520).
// ============================================================================
window.TRIPOLI_DELIVERY_ZONES = [
  { id: "tripoli-mina",         name: "طرابلس — الميناء والكورنيش البحري",      short: "الميناء",        eta: "15 دقيقة", etaMin: 15, baseFeeUSD: 1.00, map: { x: 150, y: 150 } },
  { id: "tripoli-tal-zahrieh",  name: "التل، الزاهرية والأسواق القديمة",        short: "التل والزاهرية", eta: "18 دقيقة", etaMin: 18, baseFeeUSD: 1.00, map: { x: 330, y: 200 } },
  { id: "tripoli-maarad-dam",   name: "شارع المعرض، الضم والفرز وبساتين طرابلس", short: "المعرض والضم والفرز", eta: "14 دقيقة", etaMin: 14, baseFeeUSD: 1.25, map: { x: 280, y: 300 } },
  { id: "tripoli-abi-samra",    name: "أبي سمراء، القبة وجبل محسن",            short: "أبي سمراء والقبة", eta: "22 دقيقة", etaMin: 22, baseFeeUSD: 1.50, map: { x: 470, y: 230 } },
  { id: "tripoli-bahsas-maska", name: "البحصاص، راس مسقا ومدخل الكورة",          short: "البحصاص وراس مسقا", eta: "20 دقيقة", etaMin: 20, baseFeeUSD: 1.75, map: { x: 400, y: 390 } },
  { id: "tripoli-qalamoun",     name: "القلمون وأوتوستراد الشمال الساحلي",        short: "القلمون",        eta: "25 دقيقة", etaMin: 25, baseFeeUSD: 2.00, map: { x: 210, y: 460 } }
];

// Customer reviews for the social-proof marquee (text only, initials avatars).
window.CUSTOMER_REVIEWS = [
  { name: "ريم", area: "الميناء", stars: 5, text: "طلبت الساعة 11 بالليل ووصلت الغراض بأقل من ربع ساعة، والخبز بعدو سخن!" },
  { name: "أبو خالد", area: "التل", stars: 5, text: "أسعار واضحة بالليرة والدولار، ما في مفاجآت عند الدفع. يعطيكم العافية." },
  { name: "سارة", area: "الضم والفرز", stars: 5, text: "المكدوس والزعتر طعمة الضيعة فعلاً. صار عندي مونة الشتوية كلها من عندكم." },
  { name: "محمد", area: "أبي سمراء", stars: 4, text: "عرض كرتونة الكولا وفّر علينا كتير بالعزيمة. التوصيل سريع ومرتب." },
  { name: "لينا", area: "المعرض", stars: 5, text: "بدفع بويش موني وبتوصل الطلبية قبل ما خلّص فنجان القهوة." },
  { name: "عمر", area: "القلمون", stars: 5, text: "حتى عالقلمون بيوصلوا بسرعة. التطبيق سهل كتير من التلفون." },
  { name: "هالة", area: "البحصاص", stars: 5, text: "المجمدات بتوصل مثلجة تماماً، والشوفير محترم ولطيف." },
  { name: "جاد", area: "الزاهرية", stars: 4, text: "البحث بيفهم حتى لو كتبت غلط! كتبت «لبنه» ولقاها فوراً." }
];
