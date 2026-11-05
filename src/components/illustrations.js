/* ==========================================================================
   BRAND ILLUSTRATIONS — flat, rounded, outline-free shapes matching the logo.
   All functions return trusted SVG strings. Teal parts use currentColor so the
   container's CSS `color` themes them (light / dark mode).
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  /* A sneaker pointing LEFT (characters run toward the left, like the logo). */
  const shoe = (x, y) =>
    `<g transform="translate(${x} ${y})"><path d="M8 -3h-15c-6 0-9 3.5-9 7.5v2h26v-4.5c0-3-1-5-2-5Z" fill="#fff"/><path d="M-16 6.5h26" stroke="#C6D3D8" stroke-width="3" stroke-linecap="round"/><path d="M-3 -1l2 3M1 -1.5l2 3" stroke="#C6D3D8" stroke-width="1.6" stroke-linecap="round"/></g>`;

  /* A leg: group rotated around the hip by CSS (.leg-a / .leg-b). */
  const leg = (cls, hx, hy, len) =>
    `<g class="leg ${cls}" style="transform-origin:${hx}px ${hy}px"><path d="M${hx} ${hy} q 7 ${len * 0.45} 0 ${len}" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>${shoe(hx + 1, hy + len + 3)}</g>`;

  /**
   * The "ع" runner mascot. viewBox 0 0 220 280.
   * Classes for animation: .m-run (whole), .leg-a/.leg-b, .arm-a/.arm-b, .m-drops, .m-speed
   */
  function mascot(opts = {}) {
    const label = opts.label || "شخصية عَ طريقك: حرف العين يركض";
    return `<svg class="mascot-svg" viewBox="0 0 220 280" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
      <g class="m-speed" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".35">
        <path d="M178 120h30M186 140h26M174 160h22"/>
      </g>
      <g class="m-drops" fill="#fff" opacity=".95">
        <path d="M52 52c4-6 6-9 6-12a6 6 0 0 0-12 0c0 3 2 6 6 12Z" transform="rotate(-25 52 46)"/>
        <path d="M74 30c3-4 4-6 4-8a4 4 0 0 0-8 0c0 2 1 4 4 8Z" transform="rotate(-10 74 26)"/>
      </g>
      <g class="m-run">
        ${leg("leg-b", 112, 214, 46)}
        <g class="arm arm-b" style="transform-origin:76px 150px"><path d="M76 150 q-16 6 -26 -4" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></g>
        <path class="m-letter" d="M154 66C138 40 96 42 93 72c-2 24 22 34 50 34M143 106c-42 0-72 20-72 54 0 38 36 56 86 50"
          fill="none" stroke="currentColor" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="m-fatha" d="M118 22 152 10" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
        <g class="arm arm-a" style="transform-origin:150px 132px"><path d="M150 132 q16 -2 24 -14" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></g>
        ${leg("leg-a", 124, 214, 46)}
      </g>
    </svg>`;
  }

  /* --------------------------- Grocery items --------------------------- */
  const items = {
    bread: () => `<g><ellipse cx="50" cy="60" rx="38" ry="22" fill="#E3A35A"/><path d="M14 58c4-16 20-24 36-24s32 8 36 24c-10 6-24 9-36 9s-26-3-36-9Z" fill="#F2BE75"/><path d="M32 46l6 10M48 42l6 11M64 46l6 10" stroke="#C9813B" stroke-width="4" stroke-linecap="round"/></g>`,
    oil: () => `<g><rect x="40" y="8" width="20" height="10" rx="3" fill="#DD4537"/><path d="M42 18h16v10c8 6 12 13 12 22v36a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6V50c0-9 4-16 12-22V18Z" fill="#D9A441"/><path d="M36 52c8-3 20-3 28 0v26H36Z" fill="#FBF7EF"/><path d="M45 60c4 4 6 8 5 12" stroke="#8A9A3B" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M38 32c-2 4-3 10-3 16" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/></g>`,
    olives: () => `<g><path d="M50 22c6 6 6 16 2 24" stroke="#5E6E22" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M52 26c10-6 20-4 26 2-8 6-18 6-26-2Z" fill="#8A9A3B"/><ellipse cx="34" cy="62" rx="14" ry="18" fill="#6E7E2C" transform="rotate(-18 34 62)"/><ellipse cx="62" cy="64" rx="14" ry="18" fill="#8A9A3B" transform="rotate(14 62 64)"/><ellipse cx="48" cy="50" rx="12" ry="15" fill="#A4B24A"/><circle cx="44" cy="45" r="3" fill="#fff" opacity=".5"/></g>`,
    milk: () => `<g><path d="M30 30 40 14h20l10 16v56a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V30Z" fill="#fff"/><path d="M30 30h40L60 14H40Z" fill="#E6EDEF"/><rect x="30" y="48" width="40" height="22" fill="#5E8078"/><path d="M36 60c6-6 12 6 18 0s8-4 10-2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="44" y="8" width="12" height="8" rx="2" fill="#F1A43A"/></g>`,
    tomato: () => `<g><circle cx="50" cy="58" r="30" fill="#DD4537"/><path d="M50 30c-6-6-14-6-18-2 6 2 10 4 12 8-6 0-10 2-12 6 8-2 14-1 18 2 4-3 10-4 18-2-2-4-6-6-12-6 2-4 6-6 12-8-4-4-12-4-18 2Z" fill="#6E8A2C"/><ellipse cx="38" cy="50" rx="6" ry="9" fill="#fff" opacity=".3" transform="rotate(30 38 50)"/></g>`,
    tea: () => `<g><path d="M28 36h44l-5 46a6 6 0 0 1-6 5H39a6 6 0 0 1-6-5Z" fill="#fff" fill-opacity=".9"/><path d="M31 52h38l-3 30a5 5 0 0 1-5 4H39a5 5 0 0 1-5-4Z" fill="#B5542B"/><path d="M28 36h44" stroke="#E6EDEF" stroke-width="4" stroke-linecap="round"/><path d="M44 14c-4 5 4 8 0 14M56 12c-4 5 4 8 0 14" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".8"/><path d="M60 58c6 2 6 10 0 12" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none"/></g>`,
    can: () => `<g><rect x="32" y="18" width="36" height="66" rx="8" fill="#F1A43A"/><rect x="32" y="40" width="36" height="22" fill="#FBF7EF"/><ellipse cx="50" cy="19" rx="18" ry="4" fill="#E6EDEF"/><path d="M38 26v50" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/></g>`,
    lemon: () => `<g><ellipse cx="50" cy="56" rx="30" ry="24" fill="#F4C842" transform="rotate(-20 50 56)"/><path d="M76 40l8-6" stroke="#6E8A2C" stroke-width="4" stroke-linecap="round"/><ellipse cx="40" cy="48" rx="8" ry="5" fill="#fff" opacity=".35" transform="rotate(-20 40 48)"/></g>`
  };
  function grocery(name, cls) {
    return `<svg class="grocery ${cls || ""}" viewBox="0 0 100 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${(items[name] || items.can)()}</svg>`;
  }

  /**
   * Walking basket full of groceries. viewBox 0 0 260 270.
   */
  function basket(opts = {}) {
    const sad = opts.sad;
    const content = sad
      ? `<g class="b-cloud" fill="#fff"><ellipse cx="128" cy="40" rx="34" ry="18"/><circle cx="108" cy="34" r="16"/><circle cx="146" cy="30" r="18"/><path class="b-drop" d="M126 70c4-6 6-9 6-12a6 6 0 0 0-12 0c0 3 2 6 6 12Z" fill="#9FB7C0"/></g>`
      : `<g class="b-goods">
          <g transform="translate(38 54) scale(.82)">${items.bread()}</g>
          <g transform="translate(70 18) scale(.9)">${items.oil()}</g>
          <g transform="translate(96 34) scale(.78)">${items.oil()}</g>
          <g transform="translate(118 44) scale(.95)">${items.olives()}</g>
          <g transform="translate(160 40) scale(.82)">${items.milk()}</g>
          <g transform="translate(130 70) scale(.6)">${items.tomato()}</g>
          <g transform="translate(92 74) scale(.55)">${items.can()}</g>
        </g>`;
    return `<svg class="basket-svg${sad ? " is-sad" : ""}" viewBox="0 0 260 270" role="img" aria-label="${sad ? "سلة فارغة حزينة" : "سلة التسوق تمشي وهي مليئة بالمشتريات"}" xmlns="http://www.w3.org/2000/svg">
      <g class="b-walk">
        ${leg("leg-b", 98, 212, sad ? 30 : 38)}
        ${leg("leg-a", 168, 212, sad ? 30 : 38)}
        ${content}
        <path d="M222 116 244 92" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>
        <path d="M40 112h182l-15 86c-2 10-9 16-19 16H74c-10 0-17-6-19-16Z" fill="currentColor"/>
        <g fill="#C6D3D8"><rect x="80" y="126" width="15" height="40" rx="7.5"/><rect x="108" y="126" width="15" height="40" rx="7.5"/><rect x="136" y="126" width="15" height="40" rx="7.5"/><rect x="164" y="126" width="15" height="40" rx="7.5"/></g>
        <path d="M58 196c40 6 104 6 146 0" stroke="#fff" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  /** Tiny basket used in the sticky header; goods rise with scroll progress (--fill). */
  function headerBasket() {
    return `<svg class="hb-svg" viewBox="0 0 48 44" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <g class="hb-goods">
        <circle cx="15" cy="17" r="5.5" fill="#8A9A3B"/><rect x="21" y="7" width="6" height="14" rx="2" fill="#D9A441"/>
        <circle cx="33" cy="16" r="5.5" fill="#DD4537"/><ellipse cx="24" cy="19" rx="9" ry="4.5" fill="#F2BE75"/>
      </g>
      <path d="M40 18 45 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <path d="M5 18h36l-3.2 17.5a3 3 0 0 1-3 2.5H11.2a3 3 0 0 1-3-2.5Z" fill="currentColor"/>
      <g fill="var(--hb-slot, #C6D3D8)"><rect x="13" y="22" width="3" height="9" rx="1.5"/><rect x="19.5" y="22" width="3" height="9" rx="1.5"/><rect x="26" y="22" width="3" height="9" rx="1.5"/><rect x="32.5" y="22" width="3" height="9" rx="1.5"/></g>
    </svg>`;
  }

  /** Delivery scooter (no rider), facing left. viewBox 0 0 120 90. */
  function scooter() {
    return `<svg class="scooter-svg" viewBox="0 0 120 90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="62" y="14" width="40" height="34" rx="7" fill="#395651"/>
      <text x="82" y="38" text-anchor="middle" font-family="Rubik, sans-serif" font-weight="900" font-size="20" fill="#F1A43A">ع</text>
      <path d="M20 62h58l8-14H50l-8-26h-8" fill="none" stroke="#1F2F2C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M44 48h46c6 0 10 4 10 10v6H38Z" fill="#F1A43A"/>
      <path d="M28 22h14" stroke="#1F2F2C" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="68" r="12" fill="#1F2F2C"/><circle cx="24" cy="68" r="5" fill="#E6EDEF"/>
      <circle cx="92" cy="68" r="12" fill="#1F2F2C"/><circle cx="92" cy="68" r="5" fill="#E6EDEF"/>
      <path class="sc-lines" d="M106 44h12M108 54h10" stroke="#5E8078" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  /** Rising steam: three wavy strands (animated in CSS). */
  function steam() {
    const s = (x, d) => `<path class="steam-s" style="animation-delay:${d}s" d="M${x} 120c-14-16 14-28 0-44s14-28 0-44" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`;
    return `<svg class="steam-svg" viewBox="0 0 120 130" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${s(34, 0)}${s(60, 1.1)}${s(86, 0.5)}</svg>`;
  }

  /** Lebanese coffee: finjan cup on saucer + dalleh pot. viewBox 0 0 320 220. */
  function coffeeSet() {
    return `<svg class="coffee-set" viewBox="0 0 320 220" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="204" rx="140" ry="10" fill="#000" opacity=".18"/>
      <g transform="translate(176 40)">
        <path d="M30 40h60l-6 112a10 10 0 0 1-10 9H46a10 10 0 0 1-10-9Z" fill="#D9A441"/>
        <path d="M24 34h72l-6 14H30Z" fill="#E8BE5E"/>
        <path d="M90 60c40 0 52-10 70-30" fill="none" stroke="#D9A441" stroke-width="9" stroke-linecap="round"/>
        <path d="M30 40c-14-2-22-10-24-20" fill="none" stroke="#E8BE5E" stroke-width="7" stroke-linecap="round"/>
        <path d="M44 70v70" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
      </g>
      <ellipse cx="96" cy="186" rx="70" ry="14" fill="#FBF7EF"/>
      <path d="M56 120h80l-8 50c-1 8-7 12-14 12H78c-7 0-13-4-14-12Z" fill="#FBF7EF"/>
      <ellipse cx="96" cy="120" rx="40" ry="8" fill="#5A3622"/>
      <path d="M62 140c20 8 48 8 68 0" stroke="#F1A43A" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M70 128v40" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  /** A single coffee bean (for the parallax field). */
  const bean = () =>
    `<svg viewBox="0 0 40 52" aria-hidden="true"><ellipse cx="20" cy="26" rx="16" ry="23" fill="currentColor"/><path d="M20 5c-8 12 8 30 0 42" stroke="rgba(0,0,0,.35)" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;

  /** Stack of cartons + a crate (wholesale). viewBox 0 0 300 260. */
  function cartonStack() {
    const box = (x, y, w, hgt, c, label) => `<g transform="translate(${x} ${y})"><rect width="${w}" height="${hgt}" rx="8" fill="${c}"/><rect x="${w / 2 - 9}" width="18" height="${hgt}" fill="#fff" opacity=".22"/><rect x="12" y="${hgt - 30}" width="${w * 0.42}" height="18" rx="5" fill="#FBF7EF"/><text x="${12 + w * 0.21}" y="${hgt - 16}" text-anchor="middle" font-family="Rubik, sans-serif" font-weight="800" font-size="12" fill="#1F2F2C">${label}</text></g>`;
    return `<svg class="carton-stack" viewBox="0 0 300 260" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="150" cy="248" rx="140" ry="10" fill="#000" opacity=".14"/>
      <g class="cs-b1">${box(20, 150, 130, 96, "#C98A3E", "×24")}</g>
      <g class="cs-b2">${box(154, 150, 126, 96, "#B8782F", "×12")}</g>
      <g class="cs-b3">${box(70, 62, 140, 90, "#D9A04F", "جملة")}</g>
      <g class="cs-b4" transform="translate(100 0)">
        <rect width="86" height="64" rx="10" fill="#DD4537"/><g fill="#fff" opacity=".85"><rect x="10" y="10" width="14" height="44" rx="5"/><rect x="29" y="10" width="14" height="44" rx="5"/><rect x="48" y="10" width="14" height="44" rx="5"/><rect x="67" y="10" width="10" height="44" rx="5"/></g>
      </g>
    </svg>`;
  }

  /** Finishing flag for the free-delivery progress. */
  const flag = () =>
    `<svg viewBox="0 0 30 36" aria-hidden="true"><path d="M5 34V3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M6 4h18l-4 6 4 6H6Z" fill="#F1A43A"/><path d="M6 4h6v6H6zM12 10h6v6h-6z" fill="#1F2F2C" opacity=".8"/></svg>`;

  /**
   * Stylized Tripoli & North map (no external API). viewBox 0 0 600 520.
   * Sea on the west (left), Mina peninsula, Abu Ali river, hills to the east.
   */
  function tripoliMap() {
    const g = id("map");
    return `<svg class="map-svg" viewBox="0 0 600 520" role="img" aria-label="خريطة مبسطة لطرابلس والشمال ومناطق التوصيل" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${g}-w" width="40" height="18" patternUnits="userSpaceOnUse"><path d="M2 10c6-6 12-6 18 0s12 6 18 0" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/></pattern>
      </defs>
      <rect width="600" height="520" class="map-sea"/>
      <rect width="600" height="520" fill="url(#${g}-w)"/>
      <path class="map-land" d="M600 0H250c-20 30-30 50-60 60-40 12-90 10-120 40-26 26-6 60 34 70 30 8 40 30 40 60 0 40-30 60-40 100-12 46 10 110 30 190h466Z"/>
      <path class="map-hill" d="M420 120c40-30 110-30 150 0v140c-40 20-100 10-150-20Z"/>
      <path class="map-hill" d="M470 160c30-16 70-14 96 4" fill="none" stroke-width="3"/>
      <path class="map-hill" d="M450 200c40-18 90-16 120 4" fill="none" stroke-width="3"/>
      <path class="map-river" d="M600 150c-60 10-90 40-130 40s-70-30-110-20-40 50-70 70" fill="none" stroke-width="7" stroke-linecap="round"/>
      <g class="map-road" fill="none" stroke-width="9" stroke-linecap="round">
        <path d="M150 150c60 10 110 30 180 50s100 10 140 30"/>
        <path d="M330 200c-20 40-40 70-50 100s40 60 120 90"/>
        <path d="M280 300c-30 50-60 100-70 160"/>
        <path d="M600 330c-80 0-140 20-200 60"/>
      </g>
      <g class="map-island"><ellipse cx="70" cy="60" rx="22" ry="12"/><ellipse cx="40" cy="104" rx="12" ry="7"/><ellipse cx="96" cy="30" rx="10" ry="6"/></g>
      <text class="map-sea-label" x="70" y="330" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="20" font-weight="600">البحر المتوسط</text>
      <text class="map-sea-label" x="60" y="140" font-family="'IBM Plex Sans Arabic', sans-serif" font-size="11">جزر النخيل</text>
      <g class="map-castle" transform="translate(370 168)"><rect x="-14" y="-6" width="28" height="16" rx="2"/><rect x="-14" y="-12" width="6" height="8"/><rect x="-3" y="-12" width="6" height="8"/><rect x="8" y="-12" width="6" height="8"/></g>
    </svg>`;
  }

  AT.art = { mascot, basket, headerBasket, scooter, steam, coffeeSet, bean, cartonStack, flag, tripoliMap, grocery, groceryNames: Object.keys(items) };
})();

