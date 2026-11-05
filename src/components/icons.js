/* ==========================================================================
   ICON SET — one coherent inline-SVG family: 24px grid, 1.75px rounded stroke.
   Usage: AT.icon("cart") -> SVG markup string (decorative, aria-hidden).
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});

  const P = {
    cart: '<path d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
    basket: '<path d="M4 10h16l-1.6 8.1a2 2 0 0 1-2 1.6H7.6a2 2 0 0 1-2-1.6L4 10Z"/><path d="M8.5 10 11 4.5M15.5 10 13 4.5"/><path d="M9.5 13.5v3M14.5 13.5v3M12 13.5v3"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    scooter: '<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.5 17h6.2l2.3-6.5H20M17 10.5 15.5 6H13"/><path d="M3.5 13.5h6l1.5 3.5"/><rect x="3" y="8" width="5.5" height="5" rx="1.2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    location: '<path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    phone: '<path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevL: '<path d="m14.5 6-6 6 6 6"/>',
    chevR: '<path d="m9.5 6 6 6-6 6"/>',
    chevD: '<path d="m6 9.5 6 6 6-6"/>',
    arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    whatsapp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z"/><path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .4-.2.7-.6.9-1.2.6-3.5-.1-5.3-1.9s-2.6-4.1-1.9-5.3Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
    star: '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z"/><path d="M5 19 13 11"/>',
    tag: '<path d="M3.5 12.2V5a1.5 1.5 0 0 1 1.5-1.5h7.2l8.3 8.3a1.5 1.5 0 0 1 0 2.1l-7 7a1.5 1.5 0 0 1-2.1 0l-7.9-8.7Z"/><circle cx="8" cy="8" r="1.4"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11" rx="2.5"/><path d="M16 13.5h1.5"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
    sparkle: '<path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z"/><path d="M19 16.5c.2 1.5.9 2.2 2.4 2.4-1.5.2-2.2.9-2.4 2.4-.2-1.5-.9-2.2-2.4-2.4 1.5-.2 2.2-.9 2.4-2.4Z"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3.5 9h17M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9Zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9Z"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
    cash: '<rect x="3" y="6.5" width="18" height="11" rx="2.2"/><circle cx="12" cy="12" r="2.4"/><path d="M6.5 9.5v5M17.5 9.5v5"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3 10h18M7 15h3"/>',
    mobile: '<rect x="6.5" y="3" width="11" height="18" rx="2.4"/><path d="M10.5 18h3"/>',
    flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.6-8.3 2 1.3 2.6 3.2 2.6 4.6 1-.6 1.8-1.8 2-3.4 2.4 1.9 4.8 4.4 4.8 7.3 0 3.4-2.6 6-6.5 6Z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    box: '<path d="M4 8 12 4l8 4v8.5L12 20l-8-3.5V8Z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-2.5Z"/><path d="m9 12 2 2 4-4"/>',
    route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7H16"/>',
    sort: '<path d="M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3"/>',
    cup: '<path d="M4.5 9h12v5.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9Z"/><path d="M16.5 10.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.5M8 3.5c-.8 1 .8 2-.1 3M12 3.5c-.8 1 .8 2-.1 3"/>',
    jar: '<path d="M8 3.5h8M7 6.5h10"/><path d="M7.5 6.5c-1.5 1.2-2.5 2.6-2.5 4.5v7a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-7c0-1.9-1-3.3-2.5-4.5"/><path d="M8 13h8"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>',
    bread: '<path d="M5 11a3.5 3.5 0 0 1 2-6.4h10a3.5 3.5 0 0 1 2 6.4V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8Z"/><path d="M9.5 10l1.5 2M13.5 10l1.5 2"/>',
    milk: '<path d="M8.5 3.5h7v3l2 3.5V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V10l2-3.5v-3Z"/><path d="M6.5 13h11"/>',
    candy: '<rect x="7" y="8" width="10" height="8" rx="4"/><path d="M7 12 3.5 9v6L7 12ZM17 12l3.5-3v6L17 12Z"/>',
    can: '<path d="M7 5.5c0-1 2.2-1.5 5-1.5s5 .5 5 1.5v13c0 1-2.2 1.5-5 1.5s-5-.5-5-1.5v-13Z"/><path d="M7 8c1.5.8 8.5.8 10 0M7 16c1.5.8 8.5.8 10 0"/>',
    spray: '<path d="M8 10h7v9.5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10Z"/><path d="M9 10V7.5h5V10M9 5.5h7.5l-1.5 2M18.5 4.5h1M18.5 7h1"/>'
  };

  /** Return an inline SVG string. `cls` is appended to the base class. */
  function icon(name, cls, size) {
    const s = size || 24;
    const fill = name === "star" || name === "heartFill" ? ' fill="currentColor"' : ' fill="none"';
    const path = P[name === "heartFill" ? "heart" : name] || P.sparkle;
    return `<svg class="ico${cls ? " " + cls : ""}" width="${s}" height="${s}" viewBox="0 0 24 24"${fill} stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  // Category -> icon mapping (replaces the old emoji icons in data)
  const CATEGORY_ICON = {
    all: "grid", mouneh: "jar", "hot-beverages": "cup", wholesale: "box", beverages: "can",
    sweets: "candy", frozen: "snow", bakery: "bread", dairy: "milk", pantry: "basket"
  };

  AT.icon = icon;
  AT.categoryIcon = (id, cls) => icon(CATEGORY_ICON[id] || "basket", cls);

  /** Hydrate static markup: <span data-icon="cart"></span> -> inline svg. */
  AT.hydrateIcons = function (root) {
    (root || document).querySelectorAll("[data-icon]").forEach((el) => {
      if (el.dataset.iconDone) return;
      el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass);
      el.dataset.iconDone = "1";
    });
  };
})();

