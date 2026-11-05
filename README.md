# عَ طريقك (A' Tareeqak) — سوبرماركت طرابلس والشمال

موقع التجارة الإلكترونية والتوصيل السريع لسوبرماركت **«عَ طريقك»** في طرابلس والشمال (لبنان).  
مصمّم بالكامل بالعربية (RTL) بأسلوب بصري وتفاعلي حديث مستوحى من شخصية الشعار («حرف العين الراكض» الذي يلحق بسلة المشتريات).

---

## ١. طريقة التشغيل والنشر (How to Run & Deploy)

المشروع مبني بهندسة **Static-First** نظيفة بدون الحاجة الإلزامية لأي خطوة بناء معقدة، ويعمل مباشرة على أي استضافة ثابتة (GitHub Pages / Netlify / Cloudflare Pages / Vercel) أو محلياً:

- **تشغيل فوري بدون أدوات بناء:** افتح `index.html` مباشرة في المتصفح أو عبر أي خادم محلي بسيط.
- **تشغيل مع Vite (اختياري):**
  ```bash
  npm install
  npm run dev
  npm run build
  ```

---

## ٢. تعديل الإعدادات الأساسية (`src/config.js`)

جميع الإعدادات اليومية للمتجر موجودة في ملف واحد فقط: **`src/config.js`**:

| الإعداد | الوصف | القيمة الافتراضية |
|---|---|---|
| `window.HARDCODED_EXCHANGE_RATE` | سعر صرف الدولار مقابل الليرة اللبنانية | `89900` |
| `WHATSAPP_NUMBER` | رقم واتساب الذي يستقبل الطلبات (صيغة دولية بدون `+` أو أصفار بادئة) | `"96162XXXXXX"` |
| `OPEN_HOUR` / `CLOSE_HOUR` | ساعات العمل بتوقيت بيروت (`Asia/Beirut`) | `7` صباحاً حتى `24` منتصف الليل |
| `FREE_DELIVERY_USD` | حد التوصيل المجاني بالدولار | `25` |
| `LBP_ROUNDING` | تقريب الأسعار بالليرة لأقرب ألف | `1000` |
| `COUPONS` | أكواد الخصم التي يرميها حرف «ع» عند الضغط عليه | `{ TAREEQ5: 5, MINA7: 7, ZAATAR10: 10 }` |

---

## ٣. تعديل المنتجات، الأسعار، العروض ومناطق التوصيل (`src/data/products.js`)

- **المنتجات (`window.PRODUCTS`):** كل منتج يحتوي على:
  - `id`: معرّف فريد (مثال: `"mouneh-makdous-jar"`).
  - `name`: اسم المنتج بالعربية.
  - `category`: معرّف القسم (`mouneh`, `hot-beverages`, `wholesale`, `beverages`, `sweets`, `frozen`, `bakery`, `dairy`, `pantry`).
  - `priceUSD`: السعر بالدولار (يُحوّل تلقائياً إلى الليرة حسب سعر الصرف).
  - `oldPriceUSD`: السعر السابق بالدولار لحساب نسبة الخصم تلقائياً.
  - `isBestSeller`: `true` لإظهار المنتج في معرض «الأكثر طلباً».
- **عروض التوفير (`window.HERO_SAVING_DEALS`):** عدّل `endsAt` بصيغة تاريخ ISO ثابتة (مثل `"2026-11-15T23:59:00+02:00"`) حتى لا يعيد العداد التنازلي ضبط نفسه عند تحديث الصفحة.
- **مناطق التوصيل (`window.TRIPOLI_DELIVERY_ZONES`):** عدّل `baseFeeUSD` (رسوم التوصيل بالدولار) و`eta` (الوقت المتوقع) وإحداثيات الدبوس على الخريطة `map: { x, y }`.

---

## ٤. استبدال صور المنتجات بصور حقيقية (Replacing Product Images)

يعرض الموقع افتراضياً رسوماً توضيحية متجهية (SVG) مخصّصة لكل نوع عبوة (مرطبان، تنكة، كيس فاكيوم، كرتونة جملة، قنينة…) خالية من أي علامات تجارية مسجّلة.

لاستبدال أي منتج بصورة حقيقية:
1. ضع صورة المنتج في المجلد: `public/assets/products/<product-id>.webp` (مثال: `public/assets/products/mouneh-makdous-jar.webp`).
2. إما أن تفعّل `AUTO_PRODUCT_PHOTOS: true` في `src/config.js`، أو تحدّد مسار الصورة في `src/data/products.js` عبر الحقل `photo: "public/assets/products/mouneh-makdous-jar.webp"`.
3. في حال عدم وجود ملف الصورة، يعود الموقع تلقائياً للرسم المتجهي دون أي صورة مكسورة.

---

## 5. English Quick Reference

- **Config (`src/config.js`):** Change `WHATSAPP_NUMBER` (e.g. `"96170123456"`), `window.HARDCODED_EXCHANGE_RATE` (`89900`), `OPEN_HOUR` (`7`), `CLOSE_HOUR` (`24`), and `FREE_DELIVERY_USD` (`25`).
- **Catalog Data (`src/data/products.js`):** Edit `window.PRODUCTS`, `window.CATEGORIES`, `window.HERO_SAVING_DEALS` (uses fixed ISO `endsAt` timestamps), and `window.TRIPOLI_DELIVERY_ZONES`.
- **Product Photos (`public/assets/products/`):** Drop `<id>.webp` / `<id>.avif` files into `public/assets/products/` and set `photo` on the product (or flip `AUTO_PRODUCT_PHOTOS: true` in `src/config.js`). Every product gracefully falls back to its custom non-trademarked SVG packaging illustration (`src/components/product-art.js`).
- **Folder Structure:**
  - `index.html` — Semantic RTL shell, SEO meta tags, Open Graph, JSON-LD (`GroceryStore`), PWA hooks.
  - `src/styles/` — `tokens.css`, `base.css`, `components.css`, `sections.css`.
  - `src/components/` — `icons.js` (1.75px rounded stroke SVG icon set), `illustrations.js` (running `ع` mascot, walking basket, scooter, Tripoli map, steam, carton stack), `product-art.js` (24 packaging shape renderers), `ui.js`, `product-card.js`, `cart.js`, `quickview.js`, `search.js`, `checkout.js`.
  - `src/sections/` — `hero.js`, `home.js`, `catalog.js`.
  - `src/motion.js` & `src/router.js` — Word-safe Arabic stagger reveals, scroll progress route, pinned horizontal Best Sellers gallery, View Transitions router.

