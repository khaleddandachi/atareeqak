/* ==========================================================================
   COMMAND PALETTE SEARCH — press "/" or tap search. Instant Arabic fuzzy
   results with typo tolerance, category chips, recent & popular searches.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, h } = AT.dom;
  const { money } = AT.fmt;

  const POPULAR = ["لبنة", "خبز", "مكدوس", "زيت زيتون", "بن بالهيل", "بيبسي", "بامية", "عسل"];
  let activeCat = "all";
  let activeIdx = 0;
  let currentList = [];

  function open() {
    const pal = $("#palette");
    const inp = $("#palette-input");
    if (!pal || !inp) return;
    pal.hidden = false;
    renderChips();
    updateResults();
    requestAnimationFrame(() => inp.focus());
  }

  function close() {
    const pal = $("#palette");
    if (pal) pal.hidden = true;
  }

  function renderChips() {
    const wrap = $("#palette-chips");
    if (!wrap) return;
    wrap.innerHTML = "";
    AT.catalog.categories.forEach((cat) => {
      wrap.appendChild(h("button", {
        type: "button",
        class: cat.id === activeCat ? "is-active" : "",
        onclick: () => { activeCat = cat.id; renderChips(); updateResults(); }
      }, cat.name));
    });
  }

  function renderEmptyHints() {
    const box = $("#palette-empty-state");
    const inp = $("#palette-input");
    if (!box) return;
    box.innerHTML = "";
    const recent = AT.store.get().recentSearches || [];
    if (recent.length) {
      box.appendChild(h("div", { class: "pal-hint-group" },
        h("h4", null, "عمليات بحث سابقة"),
        h("div", { class: "pal-tags" },
          recent.map((q) => h("button", {
            type: "button",
            onclick: () => { if (inp) { inp.value = q; updateResults(); } }
          }, q))
        )
      ));
    }
    box.appendChild(h("div", { class: "pal-hint-group" },
      h("h4", null, "الأكثر بحثاً في طرابلس"),
      h("div", { class: "pal-tags" },
        POPULAR.map((q) => h("button", {
          type: "button",
          onclick: () => { if (inp) { inp.value = q; updateResults(); } }
        }, q))
      )
    ));
  }

  function updateResults() {
    const inp = $("#palette-input");
    const listEl = $("#palette-results");
    const emptyEl = $("#palette-empty-state");
    if (!inp || !listEl || !emptyEl) return;

    const q = inp.value.trim();
    const pool = activeCat === "all"
      ? AT.catalog.products
      : AT.catalog.products.filter((p) => p.category === activeCat);

    if (!q && activeCat === "all") {
      renderEmptyHints();
      currentList = pool.filter((p) => p.isBestSeller).slice(0, 6);
    } else {
      emptyEl.innerHTML = "";
      currentList = q ? AT.text.search(pool, q, 12) : pool.slice(0, 12);
    }

    activeIdx = 0;
    listEl.innerHTML = "";

    if (currentList.length === 0) {
      listEl.appendChild(h("li", { style: "padding:1.5rem;text-align:center;color:var(--ink-muted)" },
        `ما لقينا نتيجة لـ «${q}». جرّب كلمة تانية متل: لبنة، مكدوس، قهوة، خبز.`
      ));
      return;
    }

    const cur = AT.store.get().currency;
    currentList.forEach((p, idx) => {
      const li = h("li", {
        class: "pal-item",
        role: "option",
        "aria-selected": String(idx === activeIdx),
        style: `--card-tint:${p.tint}`,
        onclick: () => {
          if (q) AT.store.actions.addRecentSearch(q);
          close();
          AT.quickview.open(p.id);
        }
      },
        h("div", { class: "pal-thumb", html: AT.productArt.mediaHTML(p) }),
        h("div", null,
          h("strong", { style: "font-size:var(--fs-sm);display:block" }, p.name),
          h("small", { style: "color:var(--ink-muted);font-size:0.75rem" }, `${p.categoryLabel} · ${p.unit}`)
        ),
        h("div", { style: "display:flex;align-items:center;gap:0.5rem" },
          h("b", { class: "tnum", style: "font-size:var(--fs-sm)" }, money(p.priceUSD, cur)),
          h("button", {
            type: "button",
            class: "icon-btn",
            "aria-label": `أضف ${p.name}`,
            html: AT.icon("plus", "", 16),
            onclick: (e) => {
              e.stopPropagation();
              if (q) AT.store.actions.addRecentSearch(q);
              AT.store.actions.add(p.id, "1", 1);
              AT.ui.pulseHeaderCart();
              AT.toast.show(`أضفنا «${p.name}» عالسلة`, { icon: "basket" });
            }
          })
        )
      );
      listEl.appendChild(li);
    });
  }

  function init() {
    $$("[data-open-search]").forEach((b) => b.addEventListener("click", open));
    $$("[data-close-search]").forEach((b) => b.addEventListener("click", close));

    const pal = $("#palette");
    const inp = $("#palette-input");
    if (pal) {
      pal.addEventListener("click", (e) => { if (e.target === pal) close(); });
    }
    if (inp) {
      inp.addEventListener("input", updateResults);
      inp.addEventListener("keydown", (e) => {
        const items = $$("#palette-results .pal-item");
        if (e.key === "ArrowDown" && items.length) {
          e.preventDefault();
          activeIdx = (activeIdx + 1) % items.length;
          items.forEach((el, i) => el.setAttribute("aria-selected", String(i === activeIdx)));
          items[activeIdx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp" && items.length) {
          e.preventDefault();
          activeIdx = (activeIdx - 1 + items.length) % items.length;
          items.forEach((el, i) => el.setAttribute("aria-selected", String(i === activeIdx)));
          items[activeIdx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && currentList[activeIdx]) {
          e.preventDefault();
          const chosen = currentList[activeIdx];
          if (inp.value.trim()) AT.store.actions.addRecentSearch(inp.value.trim());
          close();
          AT.quickview.open(chosen.id);
        }
      });
    }

    // Global "/" shortcut to open command palette
    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag)) {
        e.preventDefault();
        open();
      } else if (e.key === "Escape" && pal && !pal.hidden) {
        close();
      }
    });
  }

  AT.search = { init, open, close };
})();

