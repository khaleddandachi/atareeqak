/* ==========================================================================
   STORE — single source of truth with versioned localStorage persistence.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const CFG = window.AT_CONFIG;
  const { stripEmoji } = AT.dom;

  /* --------------------------- Catalog --------------------------- */
  const CATEGORY_TINTS = {
    mouneh: "#E9E2C4", "hot-beverages": "#E8D6C6", wholesale: "#F6D9B0", beverages: "#F4CFC9",
    sweets: "#EBD3C2", frozen: "#D3E4EC", bakery: "#F1E3C8", dairy: "#E3ECEE", pantry: "#E1E8D0", all: "#E6EDEF"
  };

  const products = (window.PRODUCTS || []).map((p) => {
    const old = p.oldPriceUSD && p.oldPriceUSD > p.priceUSD ? p.oldPriceUSD : null;
    return Object.assign({}, p, {
      badge: stripEmoji(p.badge),
      oldPriceUSD: old,
      discountPct: old ? Math.round(((old - p.priceUSD) / old) * 100) : 0,
      tint: CATEGORY_TINTS[p.category] || CATEGORY_TINTS.all,
      photoUrl: p.photo || (CFG.AUTO_PRODUCT_PHOTOS ? `public/assets/products/${p.id}.webp` : null)
    });
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const categories = (window.CATEGORIES || []).map((c) => Object.assign({}, c, { icon: undefined, tint: CATEGORY_TINTS[c.id] }));
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b, "ar"));

  /** Purchase options (size/unit) for a product. */
  function variantsOf(p) {
    if (!p) return [];
    if (p.category === "wholesale") return [{ id: "1", label: "الكرتونة كاملة", mult: 1, off: 0 }];
    if (p.priceUSD >= 10) return [
      { id: "1", label: "قطعة واحدة", mult: 1, off: 0 },
      { id: "2", label: "قطعتان (وفّر 3%)", mult: 2, off: 3 }
    ];
    return [
      { id: "1", label: "حبة واحدة", mult: 1, off: 0 },
      { id: "3", label: "3 حبات (وفّر 5%)", mult: 3, off: 5 },
      { id: "6", label: "6 حبات (وفّر 8%)", mult: 6, off: 8 }
    ];
  }
  const variantOf = (p, vid) => variantsOf(p).find((v) => v.id === vid) || variantsOf(p)[0];
  const unitPrice = (p, v) => p.priceUSD * v.mult * (1 - v.off / 100);

  AT.catalog = {
    products, byId, categories, brands, variantsOf, variantOf, unitPrice,
    deals: window.HERO_SAVING_DEALS || [],
    zones: window.TRIPOLI_DELIVERY_ZONES || [],
    reviews: window.CUSTOMER_REVIEWS || [],
    priceMax: Math.ceil(Math.max(...products.map((p) => p.priceUSD)))
  };

  /* ---------------------------- State ---------------------------- */
  const defaults = () => ({
    version: CFG.STORAGE_VERSION,
    currency: "LBP",
    theme: null, // null = follow system
    zone: AT.catalog.zones[0] ? AT.catalog.zones[0].id : null,
    cart: {}, // { "productId|variantId": qty }
    wishlist: [],
    recentSearches: [],
    lastOrder: null,
    coupon: null,
    coffeeMode: "morning"
  });

  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || "null"); } catch (e) { s = null; }
    if (!s || typeof s !== "object" || s.version !== CFG.STORAGE_VERSION) {
      const base = defaults();
      // Migrate v1 (legacy keys) so old carts are not lost
      try {
        const oldCart = JSON.parse(localStorage.getItem("atareeqak_tripoli_cart") || "{}");
        Object.keys(oldCart).forEach((id) => { if (byId.has(id) && oldCart[id] > 0) base.cart[id + "|1"] = Math.min(99, oldCart[id] | 0); });
        const oc = localStorage.getItem("atareeqak_tripoli_curr");
        if (oc === "USD" || oc === "LBP") base.currency = oc;
        const oz = localStorage.getItem("atareeqak_tripoli_zone");
        if (oz && AT.catalog.zones.some((z) => z.id === oz)) base.zone = oz;
      } catch (e) { /* ignore corrupt legacy data */ }
      return base;
    }
    s = Object.assign(defaults(), s);
    // Drop cart lines whose products no longer exist
    Object.keys(s.cart).forEach((k) => { if (!byId.has(k.split("|")[0]) || !(s.cart[k] > 0)) delete s.cart[k]; });
    s.wishlist = (s.wishlist || []).filter((id) => byId.has(id));
    return s;
  }

  let state = load();
  const subs = new Set();

  function persist() {
    try { localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* quota / private mode */ }
  }
  function set(patch, type) {
    state = Object.assign({}, state, patch);
    persist();
    subs.forEach((fn) => fn(state, type || "update"));
  }

  /* --------------------------- Actions --------------------------- */
  const actions = {
    add(id, vid = "1", qty = 1) {
      if (!byId.has(id)) return;
      const key = id + "|" + vid;
      const cart = Object.assign({}, state.cart);
      cart[key] = Math.min(99, (cart[key] || 0) + qty);
      set({ cart }, "cart:add");
    },
    setQty(key, qty) {
      const cart = Object.assign({}, state.cart);
      if (qty <= 0) delete cart[key]; else cart[key] = Math.min(99, qty);
      set({ cart }, qty <= 0 ? "cart:remove" : "cart:qty");
    },
    remove(key) { actions.setQty(key, 0); },
    restore(key, qty) { const cart = Object.assign({}, state.cart, { [key]: qty }); set({ cart }, "cart:add"); },
    clearCart() { set({ cart: {}, coupon: null }, "cart:clear"); },
    toggleWish(id) {
      const w = state.wishlist.includes(id) ? state.wishlist.filter((x) => x !== id) : state.wishlist.concat(id);
      set({ wishlist: w }, "wishlist");
      return w.includes(id);
    },
    setCurrency(c) { if (c !== state.currency) set({ currency: c }, "currency"); },
    setTheme(t) { set({ theme: t }, "theme"); },
    setZone(z) { if (z !== state.zone) set({ zone: z }, "zone"); },
    setCoffeeMode(m) { set({ coffeeMode: m }, "coffee"); },
    addRecentSearch(q) {
      q = String(q || "").trim().slice(0, 40);
      if (q.length < 2) return;
      set({ recentSearches: [q].concat(state.recentSearches.filter((x) => x !== q)).slice(0, 6) }, "search");
    },
    clearRecentSearches() { set({ recentSearches: [] }, "search"); },
    applyCoupon(code) {
      code = String(code || "").trim().toUpperCase();
      if (!CFG.COUPONS[code]) return false;
      set({ coupon: code }, "coupon");
      return true;
    },
    removeCoupon() { set({ coupon: null }, "coupon"); },
    saveLastOrder(order) { set({ lastOrder: order }, "order"); },
    reorder() {
      if (!state.lastOrder) return 0;
      const cart = Object.assign({}, state.cart);
      let n = 0;
      state.lastOrder.lines.forEach((l) => {
        if (!byId.has(l.id)) return;
        const key = l.id + "|" + l.v;
        cart[key] = Math.min(99, (cart[key] || 0) + l.qty);
        n += l.qty;
      });
      set({ cart }, "cart:add");
      return n;
    }
  };

  /* --------------------------- Selectors --------------------------- */
  function zone() {
    return AT.catalog.zones.find((z) => z.id === state.zone) || AT.catalog.zones[0];
  }
  function lines() {
    return Object.keys(state.cart).map((key) => {
      const [id, vid] = key.split("|");
      const p = byId.get(id);
      const v = variantOf(p, vid);
      const qty = state.cart[key];
      const each = unitPrice(p, v);
      return { key, p, v, qty, each, total: each * qty };
    }).filter((l) => l.p);
  }
  function summary() {
    const ls = lines();
    const count = ls.reduce((a, l) => a + l.qty, 0);
    const subtotal = ls.reduce((a, l) => a + l.total, 0);
    const couponPct = state.coupon ? CFG.COUPONS[state.coupon] || 0 : 0;
    const discount = subtotal * couponPct / 100;
    const z = zone();
    const free = subtotal >= CFG.FREE_DELIVERY_USD;
    const fee = count === 0 || free ? 0 : z.baseFeeUSD;
    return {
      lines: ls, count, subtotal, couponPct, discount, zone: z, free, fee,
      total: count ? subtotal - discount + fee : 0,
      progress: Math.min(1, subtotal / CFG.FREE_DELIVERY_USD),
      remaining: Math.max(0, CFG.FREE_DELIVERY_USD - subtotal)
    };
  }
  const qtyOf = (id) => Object.keys(state.cart).filter((k) => k.startsWith(id + "|")).reduce((a, k) => a + state.cart[k], 0);

  AT.store = {
    get: () => state,
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    actions, zone, lines, summary, qtyOf,
    isWished: (id) => state.wishlist.includes(id)
  };
})();

