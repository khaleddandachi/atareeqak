/* ==========================================================================
   HERO SECTION — running "ع" mascot, walking basket, orbiting groceries,
   category ticker and the clickable mascot coupon easter egg.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const CFG = window.AT_CONFIG;
  const { $, h, isFinePointer, prefersReducedMotion } = AT.dom;

  const ORBIT_ITEMS = [
    { name: "bread",  x: "8%",  y: "18%", d: 0,    depth: 18 },
    { name: "oil",    x: "86%", y: "16%", d: 0.7,  depth: -22 },
    { name: "olives", x: "14%", y: "68%", d: 1.3,  depth: 14 },
    { name: "milk",   x: "84%", y: "66%", d: 0.4,  depth: -16 },
    { name: "tomato", x: "24%", y: "12%", d: 1.8,  depth: 12 },
    { name: "tea",    x: "74%", y: "78%", d: 1.1,  depth: -12 },
    { name: "lemon",  x: "6%",  y: "44%", d: 2.1,  depth: 20 },
    { name: "can",    x: "91%", y: "42%", d: 1.5,  depth: -18 }
  ];

  function initOrbit() {
    const host = $("#hero-orbit");
    if (!host) return;
    host.innerHTML = "";
    const nodes = ORBIT_ITEMS.map((item) => {
      const el = h("div", {
        class: "orbit-item",
        style: `left:${item.x};top:${item.y};animation-delay:${item.d}s`,
        html: AT.art.grocery(item.name)
      });
      host.appendChild(el);
      return { el, depth: item.depth };
    });

    if (isFinePointer() && !prefersReducedMotion()) {
      const hero = $("#top");
      hero?.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        nodes.forEach(({ el, depth }) => {
          el.style.transform = `translate3d(${(nx * depth).toFixed(1)}px, ${(ny * depth).toFixed(1)}px, 0)`;
        });
      });
    }
  }

  function initMascotEasterEgg() {
    const mascotBtn = $("#hero-mascot");
    if (!mascotBtn) return;
    mascotBtn.innerHTML = AT.art.mascot();

    const codes = Object.keys(CFG.COUPONS || { TAREEQ5: 5 });
    mascotBtn.addEventListener("click", () => {
      mascotBtn.classList.remove("is-dashing");
      void mascotBtn.offsetWidth;
      mascotBtn.classList.add("is-dashing");

      const code = codes[Math.floor(Math.random() * codes.length)];
      const pct = CFG.COUPONS[code];
      AT.store.actions.applyCoupon(code);
      AT.ui.confetti(mascotBtn);
      AT.toast.show(`ركض «ع» وجابلك كود خصم ${pct}%: ${code} (تطبّق تلقائياً عالسلة!)`, {
        icon: "gift",
        duration: 5000
      });
    });
  }

  function initTicker() {
    const track = $("#ticker-track");
    if (!track) return;
    const cats = AT.catalog.categories.filter((c) => c.id !== "all");
    const buildPass = () =>
      cats.map((c) =>
        h("a", {
          class: "ticker-pill",
          href: `#/catalog?cat=${encodeURIComponent(c.id)}`,
          dataset: { nav: "catalog" }
        },
          h("span", { html: AT.categoryIcon(c.id, "", 18) }),
          h("span", null, c.name)
        )
      );
    track.innerHTML = "";
    [...buildPass(), ...buildPass()].forEach((node) => track.appendChild(node));
  }

  function init() {
    const basketEl = $("#hero-basket");
    if (basketEl) basketEl.innerHTML = AT.art.basket();
    const factCount = $("#fact-count");
    if (factCount) factCount.textContent = String(AT.catalog.products.length);

    initMascotEasterEgg();
    initOrbit();
    initTicker();
  }

  AT.hero = { init };
})();

