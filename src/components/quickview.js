/* ==========================================================================
   QUICK VIEW & PRODUCT DETAIL — 3-angle SVG gallery, size/unit variants,
   quantity stepper, frequently-bought-together and mobile bottom sheet.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, h } = AT.dom;
  const { money, otherCur } = AT.fmt;

  function buildProductDetailNode(p, opts = {}) {
    let activeView = 0;
    let activeVar = AT.catalog.variantsOf(p)[0];
    let qty = 1;
    const cur = AT.store.get().currency;

    const stage = h("div", {
      class: "qv-stage",
      style: `--card-tint:${p.tint}`,
      html: AT.productArt.render(p, { view: 0 })
    });

    const thumbs = h("div", { class: "qv-thumbs", role: "tablist", "aria-label": "زوايا المنتج" },
      [0, 1, 2].map((v, idx) =>
        h("button", {
          type: "button",
          role: "tab",
          "aria-label": idx === 0 ? "الواجهة الأمامية" : idx === 1 ? "زاوية مائلة" : "ملصق المنتج",
          "aria-selected": String(v === activeView),
          html: AT.productArt.render(p, { view: v }),
          onclick: (e) => {
            activeView = v;
            stage.innerHTML = AT.productArt.render(p, { view: v });
            Array.from(thumbs.children).forEach((b, i) => b.setAttribute("aria-selected", String(i === v)));
            e.stopPropagation();
          }
        })
      )
    );

    const priceNow = h("span", { class: "pcard-now tnum" });
    const priceSub = h("span", { class: "pcard-sub tnum" });
    function syncPrice() {
      const c = AT.store.get().currency;
      const u = AT.catalog.unitPrice(p, activeVar) * qty;
      priceNow.textContent = money(u, c);
      priceSub.textContent = `يعادل ${money(u, otherCur(c))}`;
    }

    const variantsWrap = h("div", { class: "qv-variants", role: "radiogroup", "aria-label": "الحجم / الكمية" },
      AT.catalog.variantsOf(p).map((v) =>
        h("button", {
          type: "button",
          role: "radio",
          "aria-checked": String(v.id === activeVar.id),
          onclick: (e) => {
            activeVar = v;
            Array.from(variantsWrap.children).forEach((b) => b.setAttribute("aria-checked", "false"));
            e.currentTarget.setAttribute("aria-checked", "true");
            syncPrice();
          }
        }, v.label)
      )
    );

    const qtyText = h("span", { class: "tnum" }, "1");
    const qtyStepper = h("div", { class: "qty-pill" },
      h("button", { type: "button", "aria-label": "زيادة", html: AT.icon("plus", "", 16), onclick: () => { qty = Math.min(99, qty + 1); qtyText.textContent = String(qty); syncPrice(); } }),
      qtyText,
      h("button", { type: "button", "aria-label": "تقليل", html: AT.icon("minus", "", 16), onclick: () => { qty = Math.max(1, qty - 1); qtyText.textContent = String(qty); syncPrice(); } })
    );

    // Frequently bought together suggestion
    const companion = AT.catalog.products.find((x) => x.id !== p.id && x.category === p.category) || AT.catalog.products[0];
    const fbtBox = companion ? h("div", { class: "qv-fbt" },
      h("h4", null, "بيشتروها سوا غالباً"),
      h("div", { class: "qv-fbt-row" },
        h("span", null, `+ ${companion.name}`),
        h("button", {
          type: "button",
          class: "btn btn-soft btn-sm tnum",
          onclick: () => {
            AT.store.actions.add(p.id, activeVar.id, qty);
            AT.store.actions.add(companion.id, "1", 1);
            AT.ui.flyToCart(stage, p);
            AT.toast.show(`أضفنا المنتجين سوا عالسلة!`, { icon: "basket" });
            if (opts.onClose) opts.onClose();
          }
        }, `أضف الاثنين (${money(AT.catalog.unitPrice(p, activeVar) * qty + companion.priceUSD, cur)})`)
      )
    ) : null;

    syncPrice();

    return h("div", null,
      opts.onClose ? h("div", { class: "sheet-handle", "aria-hidden": "true" }) : null,
      h("div", { class: "qv-in" },
        h("div", { class: "qv-gallery" }, stage, thumbs),
        h("div", { class: "qv-info" },
          h("div", { class: "qv-head" },
            h("div", null,
              h("span", { class: "eyebrow" }, p.categoryLabel),
              h("h2", { class: "qv-title" }, p.name)
            ),
            opts.onClose ? h("button", { type: "button", class: "icon-btn", "aria-label": "إغلاق", html: AT.icon("close"), onclick: opts.onClose }) : null
          ),
          h("p", { class: "pcard-unit" }, `${p.unit} · ${p.brand} · ★ ${p.rating.toFixed(1)} (${p.reviews} تقييم)`),
          h("p", { class: "qv-desc" }, p.description),
          h("div", null, h("small", { style: "font-weight:700;display:block;margin-bottom:6px" }, "اختر العرض:"), variantsWrap),
          h("div", { style: "display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:0.4rem" },
            h("div", { class: "pcard-price" }, priceNow, priceSub),
            qtyStepper
          ),
          h("button", {
            type: "button",
            class: "btn btn-primary btn-block btn-lg",
            onclick: () => {
              AT.store.actions.add(p.id, activeVar.id, qty);
              AT.ui.flyToCart(stage, p);
              AT.toast.show(`أضفنا «${p.name}» عالسلة`, { icon: "basket" });
              if (opts.onClose) opts.onClose();
            }
          }, h("span", { html: AT.icon("basket") }), h("span", null, "أضف للسلة")),
          fbtBox
        )
      )
    );
  }

  function open(id) {
    const p = AT.catalog.byId.get(id);
    const dlg = $("#quickview");
    if (!p || !dlg) return;
    dlg.innerHTML = "";
    const close = () => {
      dlg.close();
      if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
    };
    dlg.appendChild(buildProductDetailNode(p, { onClose: close }));
    if (!dlg.open) dlg.showModal();
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
  }

  function init() {
    const dlg = $("#quickview");
    if (!dlg) return;
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
    dlg.addEventListener("close", () => {
      if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
    });
    if (AT.ui && AT.ui.attachSheetSwipe) {
      AT.ui.attachSheetSwipe(dlg, () => dlg.close());
    }
  }

  AT.quickview = { init, open, buildProductDetailNode };
})();
