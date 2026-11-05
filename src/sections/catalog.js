/* ==========================================================================
   CATALOG & PRODUCT DETAIL VIEW — filters (price slider, brand, sale, wish),
   sort, active filter chips, FLIP layout animation, loading skeletons,
   animated empty state, and mobile bottom-sheet filter drawer.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, h, prefersReducedMotion } = AT.dom;
  const { money } = AT.fmt;

  const filterState = {
    cat: "all",
    minUSD: 0,
    maxUSD: AT.catalog.priceMax,
    onlySale: false,
    onlyWish: false,
    brands: new Set(),
    sort: "popular"
  };

  function openFilters() {
    const f = $("#filters");
    if (!f) return;
    f.classList.add("is-open");
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
  }

  function closeFilters() {
    const f = $("#filters");
    if (!f) return;
    f.classList.remove("is-open");
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
  }

  function applyRouteParams(params) {
    filterState.cat = params.get("cat") || "all";
    filterState.onlyWish = params.get("wish") === "1";
    filterState.onlySale = params.get("sale") === "1";
    const fWish = $("#f-wish");
    const fSale = $("#f-sale");
    if (fWish) fWish.checked = filterState.onlyWish;
    if (fSale) fSale.checked = filterState.onlySale;
    if (AT.ui && AT.ui.setActiveStickyChip) {
      AT.ui.setActiveStickyChip(filterState.cat);
    }
    renderCategoryChips();
    renderGrid();
  }

  function renderCategoryChips() {
    const row = $("#cat-chips");
    if (!row) return;
    row.innerHTML = "";
    AT.catalog.categories.forEach((c) => {
      const active = c.id === filterState.cat;
      const btn = h("button", {
        type: "button",
        role: "tab",
        "aria-selected": String(active),
        onclick: () => {
          filterState.cat = c.id;
          if (AT.ui && AT.ui.setActiveStickyChip) {
            AT.ui.setActiveStickyChip(c.id);
          }
          renderCategoryChips();
          renderGrid(true);
        }
      }, h("span", { html: AT.categoryIcon(c.id, "", 16) }), h("span", null, c.name));
      row.appendChild(btn);
      if (active) {
        requestAnimationFrame(() => {
          try {
            btn.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", inline: "center", block: "nearest" });
          } catch (e) { /* ignore */ }
        });
      }
    });
  }

  function renderBrands() {
    const host = $("#brand-list");
    if (!host) return;
    host.innerHTML = "";
    AT.catalog.brands.forEach((b) => {
      const cb = h("input", {
        type: "checkbox",
        checked: filterState.brands.has(b),
        onchange: (e) => {
          if (e.target.checked) filterState.brands.add(b);
          else filterState.brands.delete(b);
          renderGrid(true);
        }
      });
      host.appendChild(h("label", { class: "switch" }, cb, h("span", null, b)));
    });
  }

  function renderActiveChips() {
    const wrap = $("#active-chips");
    if (!wrap) return;
    wrap.innerHTML = "";
    const addChip = (label, onClear) => {
      wrap.appendChild(
        h("button", { type: "button", class: "filter-chip", onclick: onClear },
          h("span", null, label),
          h("span", { html: AT.icon("close", "", 13) })
        )
      );
    };
    if (filterState.cat !== "all") {
      const c = AT.catalog.categories.find((x) => x.id === filterState.cat);
      if (c) addChip(c.name, () => {
        filterState.cat = "all";
        if (AT.ui && AT.ui.setActiveStickyChip) AT.ui.setActiveStickyChip("all");
        renderCategoryChips();
        renderGrid(true);
      });
    }
    if (filterState.onlySale) {
      addChip("عليه خصم", () => { filterState.onlySale = false; const el = $("#f-sale"); if (el) el.checked = false; renderGrid(true); });
    }
    if (filterState.onlyWish) {
      addChip("المفضلة", () => { filterState.onlyWish = false; const el = $("#f-wish"); if (el) el.checked = false; renderGrid(true); });
    }
    filterState.brands.forEach((b) => {
      addChip(b, () => { filterState.brands.delete(b); renderBrands(); renderGrid(true); });
    });
  }

  function filteredList() {
    const res = AT.catalog.products.filter((p) => {
      if (filterState.cat !== "all" && p.category !== filterState.cat) return false;
      if (p.priceUSD < filterState.minUSD || p.priceUSD > filterState.maxUSD) return false;
      if (filterState.onlySale && !(p.discountPct > 0)) return false;
      if (filterState.onlyWish && !AT.store.isWished(p.id)) return false;
      if (filterState.brands.size > 0 && !filterState.brands.has(p.brand)) return false;
      return true;
    });

    const s = filterState.sort;
    res.sort((a, b) => {
      if (s === "price-asc") return a.priceUSD - b.priceUSD;
      if (s === "price-desc") return b.priceUSD - a.priceUSD;
      if (s === "rating") return b.rating - a.rating || b.reviews - a.reviews;
      if (s === "discount") return b.discountPct - a.discountPct;
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviews - a.reviews;
    });
    return res;
  }

  function renderGrid(animateFLIP = false) {
    const grid = $("#catalog-grid");
    const titleEl = $("#catalog-title");
    const crumbEl = $("#crumb-current");
    const countEl = $("#catalog-count");
    const reorderBtn = $("#reorder-btn");
    if (!grid) return;

    const catObj = AT.catalog.categories.find((c) => c.id === filterState.cat) || AT.catalog.categories[0];
    if (titleEl) titleEl.textContent = filterState.onlyWish ? "المفضلة" : catObj.name;
    if (crumbEl) crumbEl.textContent = filterState.onlyWish ? "المفضلة" : catObj.name;
    if (reorderBtn) reorderBtn.hidden = !AT.store.get().lastOrder;

    // Record first positions for FLIP animation
    const prevRects = new Map();
    if (animateFLIP && !prefersReducedMotion()) {
      grid.querySelectorAll(".pcard[data-pid]").forEach((el) => {
        prevRects.set(el.dataset.pid, el.getBoundingClientRect());
      });
    }

    const list = filteredList();
    if (countEl) countEl.textContent = `يعرض ${list.length} من أصل ${AT.catalog.products.length} صنفاً`;
    renderActiveChips();

    grid.innerHTML = "";
    if (list.length === 0) {
      grid.appendChild(
        h("div", { class: "cat-empty" },
          h("div", { class: "cat-empty-art", html: AT.art.basket({ sad: true }) }),
          h("h3", null, "ما في أصناف مطابقة لهالفلتر"),
          h("p", { style: "color:var(--ink-muted);font-size:var(--fs-xs);margin-bottom:0.5rem" }, "جرّب توسّع نطاق السعر أو تمسح الفلاتر المختارة لتشوف كل المنتجات."),
          h("button", { type: "button", class: "btn btn-primary", onclick: resetFilters }, "مسح كل الفلاتر")
        )
      );
      return;
    }

    list.forEach((p) => grid.appendChild(AT.card.create(p)));

    // Play FLIP transition
    if (prevRects.size > 0) {
      grid.querySelectorAll(".pcard[data-pid]").forEach((el) => {
        const first = prevRects.get(el.dataset.pid);
        if (!first) return;
        const last = el.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.animate([
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" }
          ], { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        }
      });
    }
  }

  function resetFilters() {
    filterState.cat = "all";
    filterState.minUSD = 0;
    filterState.maxUSD = AT.catalog.priceMax;
    filterState.onlySale = false;
    filterState.onlyWish = false;
    filterState.brands.clear();

    const pMin = $("#price-min");
    const pMax = $("#price-max");
    const fSale = $("#f-sale");
    const fWish = $("#f-wish");
    if (pMin) pMin.value = "0";
    if (pMax) pMax.value = String(AT.catalog.priceMax);
    if (fSale) fSale.checked = false;
    if (fWish) fWish.checked = false;

    if (AT.ui && AT.ui.setActiveStickyChip) AT.ui.setActiveStickyChip("all");
    syncPriceLabels();
    renderCategoryChips();
    renderBrands();
    renderGrid(true);
  }

  function syncPriceLabels() {
    const minVal = $("#price-min-val");
    const maxVal = $("#price-max-val");
    const cur = AT.store.get().currency;
    if (minVal) minVal.textContent = money(filterState.minUSD, cur);
    if (maxVal) maxVal.textContent = money(filterState.maxUSD, cur);
  }

  function renderProductPage(id) {
    const host = $("#view-product");
    if (!host) return;
    const p = AT.catalog.byId.get(id);
    host.innerHTML = "";
    if (!p) {
      host.appendChild(h("div", { class: "wrap" }, h("p", null, "المنتج غير موجود.")));
      return;
    }
    const related = AT.catalog.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    host.appendChild(
      h("div", { class: "wrap" },
        h("nav", { class: "crumbs", "aria-label": "مسار التصفح" },
          h("a", { href: "#/", dataset: { nav: "home" } }, "الرئيسية"),
          h("span", null, "/"),
          h("a", { href: `#/catalog?cat=${encodeURIComponent(p.category)}`, dataset: { nav: "catalog" } }, p.categoryLabel),
          h("span", null, "/"),
          h("span", null, p.name)
        ),
        h("div", { class: "pdp" }, AT.quickview.buildProductDetailNode(p)),
        related.length ? h("section", { style: "margin-top:2.5rem" },
          h("h2", { style: "font-size:var(--fs-xl);margin-bottom:1rem" }, "أصناف مشابهة من نفس الرف"),
          h("div", { class: "grid" }, related.map((r) => AT.card.create(r)))
        ) : null
      )
    );
  }

  function init() {
    const pMin = $("#price-min");
    const pMax = $("#price-max");
    if (pMin && pMax) {
      pMin.max = String(AT.catalog.priceMax);
      pMax.max = String(AT.catalog.priceMax);
      pMin.value = "0";
      pMax.value = String(AT.catalog.priceMax);
      const onRange = () => {
        let a = parseFloat(pMin.value);
        let b = parseFloat(pMax.value);
        if (a > b) [a, b] = [b, a];
        filterState.minUSD = a;
        filterState.maxUSD = b;
        syncPriceLabels();
        renderGrid(true);
      };
      pMin.addEventListener("input", onRange);
      pMax.addEventListener("input", onRange);
    }

    $("#f-sale")?.addEventListener("change", (e) => { filterState.onlySale = e.target.checked; renderGrid(true); });
    $("#f-wish")?.addEventListener("change", (e) => { filterState.onlyWish = e.target.checked; renderGrid(true); });
    $("#f-reset")?.addEventListener("click", resetFilters);
    $("#sort-select")?.addEventListener("change", (e) => { filterState.sort = e.target.value; renderGrid(true); });

    $("#open-filters")?.addEventListener("click", openFilters);
    $$("[data-close-filters]").forEach((b) => b.addEventListener("click", closeFilters));

    const filtersEl = $("#filters");
    if (filtersEl && AT.ui && AT.ui.attachSheetSwipe) {
      AT.ui.attachSheetSwipe(filtersEl, closeFilters);
    }

    $("#reorder-btn")?.addEventListener("click", () => {
      const count = AT.store.actions.reorder();
      if (count > 0) {
        AT.toast.show(`أضفنا ${count} قطع من طلبيتك السابقة عالسلة!`, { icon: "refresh" });
        AT.cart.open();
      }
    });

    syncPriceLabels();
    renderCategoryChips();
    renderBrands();
    renderGrid(false);

    AT.store.subscribe((_, type) => {
      if (type === "currency") syncPriceLabels();
    });
  }

  AT.catalogView = { init, applyRouteParams, renderProductPage };
})();
