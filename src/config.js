/* ==========================================================================
   STORE CONFIGURATION — the only file most owners ever need to edit.
   (Products / zones / deals live in src/data/products.js)
   ========================================================================== */

// Exchange rate: 1 USD = 89,900 LBP. Prices in data are stored in USD.
window.HARDCODED_EXCHANGE_RATE = 89900;

window.AT_CONFIG = {
  STORE_NAME: "عَ طريقك",
  // WhatsApp number that receives orders: international format, digits only, no "+".
  // Example: 9616XXXXXXX (Tripoli landline) or 9617XXXXXXX (mobile). REPLACE the placeholder.
  WHATSAPP_NUMBER: "96162XXXXXX",
  PHONE_DISPLAY: "+961 6 220 890",
  TIMEZONE: "Asia/Beirut",
  OPEN_HOUR: 7,      // 07:00
  CLOSE_HOUR: 24,    // 24:00 = midnight
  FREE_DELIVERY_USD: 25,
  LBP_ROUNDING: 1000, // round LBP display to the nearest 1,000
  // When true, every product first tries public/assets/products/<id>.webp and
  // falls back to the generated illustration if the file is missing.
  AUTO_PRODUCT_PHOTOS: false,
  // Easter-egg coupons dropped by the running mascot (code -> % off subtotal).
  COUPONS: { "TAREEQ5": 5, "MINA7": 7, "ZAATAR10": 10 },
  STORAGE_KEY: "atareeqak:store",
  STORAGE_VERSION: 2
};

