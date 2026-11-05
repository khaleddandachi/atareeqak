/* ==========================================================================
   HOME SECTIONS — Deals, Tripoli Delivery Radar, Best Sellers, Curated Bento
   Showcases (Lebanese Mouneh, Coffee & Tea, Wholesale), Categories & Reviews.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, h, seeded } = AT.dom;
  const { money, otherCur } = AT.fmt;

  /* -------------------------- 1. SAVING DEALS -------------------------- */
  function renderDeals() {
    const row = $("#deals-row");
    if (!row) return;
    row.innerHTML = "";
    const cur = AT.store.get().currency;

    AT.catalog.deals.forEach((deal) => {
      const items = (deal.productIds || []).map((id) => AT.catalog.byId.get(id)).filter(Boolean);
      const packPreview = h("div", { class: "deal-pack-row" },
        items.slice(0, 4).map((p) =>
          h("div", { class: "deal-pack-item", html: AT.productArt.mediaHTML(p) })
        )
      );

      const dEl = h("b", { class: "tnum" }, "00");
      const hEl = h("b", { class: "tnum" }, "00");
      const mEl = h("b", { class: "tnum" }, "00");
      const sEl = h("b", { class: "tnum" }, "00");

      const timer = h("div", { class: "deal-timer", dataset: { endsAt: deal.endsAt }, "aria-label": "الوقت المتبقي للعرض" },
        h("div", null, dEl, h("small", null, "يوم")),
        h("div", null, hEl, h("small", null, "ساعة")),
        h("div", null, mEl, h("small", null, "دقيقة")),
        h("div", null, sEl, h("small", null, "ثانية"))
      );

      const card = h("article", { class: "deal-card", dataset: { theme: deal.theme || "olive", dealId: deal.id } },
        h("div", { class: "deal-top" },
          h("span", { class: "eyebrow" }, deal.tag),
          h("span", { class: "deal-off tnum" }, `وفّر ${deal.discountPct}%`)
        ),
        packPreview,
        h("h3", { class: "deal-title" }, deal.title),
        h("p", { class: "deal-includes" }, deal.includes),
        timer,
        h("div", { class: "deal-foot" },
          h("div", { class: "deal-prices tnum" },
            h("del", { dataset: { usdOld: deal.oldPriceUSD } }, money(deal.oldPriceUSD, cur)),
            h("strong", { dataset: { usdNow: deal.priceUSD } }, money(deal.priceUSD, cur))
          ),
          h("button", {
            type: "button",
            class: "btn btn-primary",
            onclick: (e) => {
              (deal.productIds || []).forEach((pid) => AT.store.actions.add(pid, "1", 1));
              AT.ui.flyToCart(e.currentTarget.closest(".deal-card")?.querySelector(".deal-pack-row"), items[0]);
              AT.toast.show(`أضفنا «${deal.title}» بالكامل عالسلة!`, { icon: "gift" });
            }
          }, h("span", { html: AT.icon("basket") }), h("span", null, "أضف للسلة"))
        )
      );
      row.appendChild(card);
    });
  }

  function tickDealTimers() {
    const now = Date.now();
    $$(".deal-timer[data-ends-at]").forEach((el) => {
      const target = Date.parse(el.dataset.endsAt);
      let diff = Math.floor((target - now) / 1000);
      if (diff <= 0) diff = ((diff % 604800) + 604800) % 604800;
      const d = Math.floor(diff / 86400);
      const hrs = Math.floor((diff % 86400) / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      const bs = el.querySelectorAll("b");
      const pad = (n) => String(n).padStart(2, "0");
      if (bs[0]) bs[0].textContent = pad(d);
      if (bs[1]) bs[1].textContent = pad(hrs);
      if (bs[2]) bs[2].textContent = pad(mins);
      if (bs[3]) bs[3].textContent = pad(secs);
    });
  }

  /* -------------------------- 2. DELIVERY RADAR -------------------------- */
  const HQ = { x: 280, y: 300 }; // Al-Maarad HQ on the 600×520 map

  function initRadar() {
    const mapHost = $("#radar-map");
    const listHost = $("#zone-list");
    if (!mapHost || !listHost) return;

    mapHost.innerHTML = AT.art.tripoliMap();
    const svg = mapHost.querySelector("svg");

    // Route path + tappable zone pins (>= 48px touch hit area) inside the SVG
    const routeLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    routeLine.setAttribute("class", "map-route-line");
    svg.appendChild(routeLine);

    AT.catalog.zones.forEach((z) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "map-pin");
      g.setAttribute("role", "button");
      g.setAttribute("tabindex", "0");
      g.setAttribute("aria-label", `اختر منطقة ${z.name} — التوصيل خلال ${z.eta}`);
      g.dataset.zid = z.id;
      g.innerHTML = `
        <circle class="pin-hit" cx="${z.map.x}" cy="${z.map.y}" r="52"></circle>
        <circle class="pin-pulse" cx="${z.map.x}" cy="${z.map.y}" r="16"></circle>
        <circle class="pin-dot" cx="${z.map.x}" cy="${z.map.y}" r="8"></circle>
        <text x="${z.map.x}" y="${z.map.y - 15}" text-anchor="middle">${z.short}</text>
      `;
      g.addEventListener("click", () => AT.store.actions.setZone(z.id));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          AT.store.actions.setZone(z.id);
        }
      });
      svg.appendChild(g);
    });

    // Animated scooter overlay
    const scooterEl = h("div", { class: "map-scooter", html: AT.art.scooter() });
    mapHost.appendChild(scooterEl);

    // Zone pills
    listHost.innerHTML = "";
    AT.catalog.zones.forEach((z) => {
      listHost.appendChild(
        h("button", {
          type: "button",
          role: "radio",
          class: "zone-pill",
          dataset: { zid: z.id },
          "aria-checked": "false",
          onclick: () => AT.store.actions.setZone(z.id)
        }, h("span", { html: AT.icon("location", "", 16) }), h("span", null, z.short))
      );
    });

    function syncRadar() {
      const z = AT.store.zone();
      const cur = AT.store.get().currency;
      $$(".zone-pill", listHost).forEach((b) => {
        b.setAttribute("aria-checked", String(b.dataset.zid === z.id));
      });
      $$(".map-pin", svg).forEach((p) => {
        p.classList.toggle("is-active", p.dataset.zid === z.id);
      });
      const cx = (HQ.x + z.map.x) / 2;
      const cy = Math.min(HQ.y, z.map.y) - 35;
      routeLine.setAttribute("d", `M${HQ.x} ${HQ.y} Q ${cx} ${cy} ${z.map.x} ${z.map.y}`);

      scooterEl.style.left = (z.map.x / 600) * 100 + "%";
      scooterEl.style.top = (z.map.y / 520) * 100 + "%";

      const nameEl = $("#zone-name");
      const feeEl = $("#zone-fee");
      const feeAltEl = $("#zone-fee-alt");
      const etaEl = $("#zone-eta");
      if (nameEl) nameEl.textContent = z.name;
      if (feeEl) feeEl.textContent = money(z.baseFeeUSD, cur);
      if (feeAltEl) feeAltEl.textContent = `يعادل ${money(z.baseFeeUSD, otherCur(cur))}`;
      if (etaEl) etaEl.textContent = z.eta;
    }

    syncRadar();
    AT.store.subscribe(syncRadar);
  }

  /* -------------------------- 3. BEST SELLERS -------------------------- */
  function renderBestSellers() {
    const track = $("#best-track");
    if (!track) return;
    track.innerHTML = "";
    AT.catalog.products
      .filter((p) => p.isBestSeller)
      .forEach((p) => track.appendChild(AT.card.create(p)));

    track.addEventListener("scroll", () => {
      const max = track.scrollWidth - track.clientWidth;
      if (max > 0) {
        const p = Math.min(1, Math.max(0.1, Math.abs(track.scrollLeft) / max));
        track.closest(".best")?.style.setProperty("--best-p", p.toFixed(2));
      }
    }, { passive: true });

    $$('[data-scroll-track="best-track"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.dataset.dir === "next" ? -1 : 1; // RTL: negative scrollLeft scrolls forward (leftward)
        track.scrollBy({ left: dir * 300, behavior: "smooth" });
      });
    });
  }

  /* -------------------------- 4. LEBANESE MOUNEH -------------------------- */
  function renderMouneh() {
    const host = $("#mouneh-shelves");
    if (!host) return;
    host.innerHTML = "";
    AT.catalog.products
      .filter((p) => p.category === "mouneh")
      .forEach((p) => {
        host.appendChild(AT.card.create(p));
      });
  }

  /* -------------------------- 5. COFFEE & TEA -------------------------- */
  function initCoffee() {
    const steamEl = $("#coffee-steam");
    const artEl = $("#coffee-art");
    const beanField = $("#bean-field");
    const menuEl = $("#coffee-menu");
    const block = $("#coffee-block");
    const quote = $("#coffee-quote");

    if (steamEl) steamEl.innerHTML = AT.art.steam();
    if (artEl) artEl.innerHTML = AT.art.coffeeSet();

    if (beanField) {
      const rand = seeded(42);
      beanField.innerHTML = "";
      for (let i = 0; i < 14; i++) {
        beanField.appendChild(
          h("div", {
            class: "bean-item",
            style: `left:${Math.round(rand() * 94)}%;top:${Math.round(rand() * 88)}%;transform:rotate(${Math.round(rand() * 360)}deg)`,
            html: AT.art.bean()
          })
        );
      }
    }

    if (menuEl) {
      menuEl.innerHTML = "";
      AT.catalog.products
        .filter((p) => p.category === "hot-beverages")
        .forEach((p) => {
          menuEl.appendChild(AT.card.create(p));
        });
    }

    $$(".mode-toggle [data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        AT.store.actions.setCoffeeMode(mode);
        if (block) block.dataset.mode = mode;
        $$(".mode-toggle [data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
        if (quote) {
          quote.textContent = mode === "morning"
            ? "«فنجان بالهيل والجيران عالبلكون»"
            : "«إبريق شاي سيلاني ومتّة لسهرة هادية»";
        }
      });
    });
  }

  /* -------------------------- 6. WHOLESALE BENTO -------------------------- */
  function renderWholesale() {
    const bento = $("#ws-bento");
    if (!bento) return;
    bento.innerHTML = "";

    const feature = h("aside", { class: "bento-feature feature-wholesale" },
      h("div", null,
        h("span", { class: "pill pill-orange" }, "توفير العيلة والمحلات"),
        h("div", { class: "bento-big-num tnum", style: "margin-top:0.5rem" }, "−20%"),
        h("h3", { style: "font-size:var(--fs-lg);margin-top:0.35rem" }, "صناديق وطُرود كاملة بسعر الجملة"),
        h("p", { style: "font-size:var(--fs-xs);opacity:0.88;margin-top:0.35rem" }, "وفّر على الميزانية مع الكراتين المختومة والتوصيل السريع لعتبة البيت.")
      ),
      h("div", { class: "bento-stack-art", html: AT.art.cartonStack() }),
      h("a", { href: "#/catalog?cat=wholesale", class: "btn btn-primary", dataset: { nav: "catalog" } },
        h("span", null, "كل عروض الجملة"),
        h("span", { html: AT.icon("arrowL") })
      )
    );

    const itemsWrap = h("div", { class: "bento-items snap-row", id: "ws-items" });
    AT.catalog.products
      .filter((p) => p.category === "wholesale")
      .forEach((p) => {
        itemsWrap.appendChild(AT.card.create(p));
      });

    bento.appendChild(feature);
    bento.appendChild(itemsWrap);
  }

  /* -------------------------- 7. SHOP BY CATEGORY MOSAIC -------------------------- */
  function renderCategoriesMosaic() {
    const host = $("#cat-mosaic");
    if (!host) return;
    host.innerHTML = "";
    AT.catalog.categories.forEach((c) => {
      const count = c.id === "all"
        ? AT.catalog.products.length
        : AT.catalog.products.filter((p) => p.category === c.id).length;
      host.appendChild(
        h("a", {
          class: "cat-tile",
          href: c.id === "all" ? "#/catalog" : `#/catalog?cat=${encodeURIComponent(c.id)}`,
          dataset: { nav: "catalog" },
          style: `--tile-tint:${c.tint}`
        },
          h("div", { class: "cat-tile-top" },
            h("span", { class: "cat-tile-ico", html: AT.categoryIcon(c.id, "", 22) }),
            h("span", { class: "pill tnum" }, `${count} صنف`)
          ),
          h("div", null,
            h("h3", null, c.name),
            h("small", null, c.description)
          )
        )
      );
    });
  }

  /* -------------------------- 8. CUSTOMER REVIEWS -------------------------- */
  function renderReviews() {
    const m1 = $("#rev-marquee-1");
    const m2 = $("#rev-marquee-2");
    if (!m1 || !m2) return;
    const revs = AT.catalog.reviews;
    const makeTrack = (list) =>
      h("div", { class: "marquee-track" },
        [...list, ...list].map((r) =>
          h("article", { class: "rev-card" },
            h("div", { class: "rev-head" },
              h("span", { class: "rev-avatar" }, r.name.charAt(0)),
              h("div", null,
                h("strong", { style: "font-size:var(--fs-xs);display:block" }, r.name),
                h("small", { style: "font-size:0.74rem;color:var(--ink-muted)" }, r.area)
              ),
              h("span", { class: "rev-stars", "aria-label": `${r.stars} نجوم` }, "★".repeat(r.stars))
            ),
            h("p", null, `«${r.text}»`)
          )
        )
      );
    m1.innerHTML = "";
    m2.innerHTML = "";
    m1.appendChild(makeTrack(revs));
    m2.appendChild(makeTrack(revs.slice().reverse()));
  }

  /* Refresh all inline USD price nodes when currency toggles */
  function refreshCurrencyNodes() {
    const cur = AT.store.get().currency;
    $$("[data-usd-now]").forEach((el) => {
      el.textContent = money(parseFloat(el.dataset.usdNow), cur);
    });
    $$("[data-usd-old]").forEach((el) => {
      el.textContent = money(parseFloat(el.dataset.usdOld), cur);
    });
    AT.card.refreshAll();
  }

  function init() {
    renderDeals();
    tickDealTimers();
    setInterval(tickDealTimers, 1000);
    initRadar();
    renderBestSellers();
    renderMouneh();
    initCoffee();
    renderWholesale();
    renderCategoriesMosaic();
    renderReviews();

    AT.store.subscribe((_, type) => {
      if (type === "currency" || type.startsWith("cart") || type === "wishlist") {
        refreshCurrencyNodes();
      }
    });
  }

  AT.home = { init };
})();
