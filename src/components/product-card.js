/* ==========================================================================
   PRODUCT CARD — unified card component with 1:1 stage on category-tinted
   organic blob, dual-currency price tag, discount ribbon, and "أضف للسلة"
   button that morphs into a (- 1 +) stepper when in cart.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { h, isFinePointer, prefersReducedMotion } = AT.dom;
  const { money, otherCur } = AT.fmt;

  function renderAction(p) {
    const qty = AT.store.qtyOf(p.id);
    if (qty > 0) {
      return h("div", { class: "pcard-stepper tnum", role: "group", "aria-label": "الكمية في السلة" },
        h("button", {
          type: "button",
          "aria-label": "إضافة قطعة",
          html: AT.icon("plus", "", 16),
          onclick: (e) => {
            e.stopPropagation();
            AT.store.actions.add(p.id, "1", 1);
            AT.ui.flyToCart(e.currentTarget.closest(".pcard")?.querySelector(".pcard-art"), p);
          }
        }),
        h("span", null, String(qty)),
        h("button", {
          type: "button",
          "aria-label": "إنقاص قطعة",
          html: AT.icon(qty === 1 ? "trash" : "minus", "", 16),
          onclick: (e) => {
            e.stopPropagation();
            AT.store.actions.setQty(p.id + "|1", qty - 1);
          }
        })
      );
    }
    return h("button", {
      type: "button",
      class: "pcard-add",
      "aria-label": `أضف ${p.name} إلى السلة`,
      onclick: (e) => {
        e.stopPropagation();
        const art = e.currentTarget.closest(".pcard")?.querySelector(".pcard-art");
        AT.store.actions.add(p.id, "1", 1);
        AT.ui.flyToCart(art, p);
        AT.toast.show(`أضفنا «${p.name}» عالسلة`, { icon: "basket" });
      }
    }, h("span", { html: AT.icon("plus", "", 16) }), h("span", null, "أضف للسلة"));
  }

  function create(p) {
    const cur = AT.store.get().currency;
    const wished = AT.store.isWished(p.id);

    const wishBtn = h("button", {
      type: "button",
      class: "pcard-wish" + (wished ? " is-active" : ""),
      "aria-label": wished ? "إزالة من المفضلة" : "أضف إلى المفضلة",
      "aria-pressed": String(wished),
      html: AT.icon(wished ? "heartFill" : "heart", "", 18),
      onclick: (e) => {
        e.stopPropagation();
        const now = AT.store.actions.toggleWish(p.id);
        wishBtn.classList.toggle("is-active", now);
        wishBtn.setAttribute("aria-pressed", String(now));
        wishBtn.innerHTML = AT.icon(now ? "heartFill" : "heart", "", 18);
      }
    });

    const stage = h("div", {
      class: "pcard-stage",
      onclick: () => AT.quickview && AT.quickview.open(p.id)
    },
      p.discountPct > 0
        ? h("span", { class: "pcard-ribbon is-sale tnum" }, `−${p.discountPct}%`)
        : (p.badge ? h("span", { class: "pcard-ribbon" }, p.badge) : null),
      wishBtn,
      h("button", {
        type: "button",
        class: "pcard-qv",
        "aria-label": `نظرة سريعة على ${p.name}`,
        html: AT.icon("eye", "", 18),
        onclick: (e) => { e.stopPropagation(); AT.quickview && AT.quickview.open(p.id); }
      }),
      h("div", { class: "pcard-art", html: AT.productArt.mediaHTML(p) })
    );

    const priceBox = h("div", { class: "pcard-price tnum" },
      p.oldPriceUSD ? h("span", { class: "pcard-old" }, money(p.oldPriceUSD, cur)) : null,
      h("span", { class: "pcard-now" }, money(p.priceUSD, cur)),
      h("span", { class: "pcard-sub" }, money(p.priceUSD, otherCur(cur)))
    );

    const actionSlot = h("div", { class: "pcard-action-slot" }, renderAction(p));

    const card = h("article", {
      class: "pcard",
      dataset: { pid: p.id },
      style: `--card-tint:${p.tint}`
    },
      stage,
      h("div", { class: "pcard-body" },
        h("div", { class: "pcard-meta" },
          h("span", null, p.categoryLabel),
          h("span", { class: "pcard-rating tnum" }, h("span", { html: AT.icon("star", "", 13) }), p.rating.toFixed(1))
        ),
        h("h3", { class: "pcard-title" },
          h("a", {
            href: `#/product/${encodeURIComponent(p.id)}`,
            onclick: (e) => {
              e.preventDefault();
              AT.quickview && AT.quickview.open(p.id);
            }
          }, p.name)
        ),
        h("p", { class: "pcard-unit" }, `${p.unit} · ${p.brand}`)
      ),
      h("div", { class: "pcard-foot" }, priceBox, actionSlot)
    );

    // Subtle pointer-follow 3D tilt ONLY on desktop fine pointer
    if (isFinePointer() && !prefersReducedMotion()) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    }

    return card;
  }

  /** Refresh prices and cart steppers on all mounted cards without full re-render. */
  function refreshAll(root = document) {
    const cur = AT.store.get().currency;
    root.querySelectorAll(".pcard[data-pid]").forEach((el) => {
      const p = AT.catalog.byId.get(el.dataset.pid);
      if (!p) return;
      const nowEl = el.querySelector(".pcard-now");
      const subEl = el.querySelector(".pcard-sub");
      const oldEl = el.querySelector(".pcard-old");
      if (nowEl) nowEl.textContent = money(p.priceUSD, cur);
      if (subEl) subEl.textContent = money(p.priceUSD, otherCur(cur));
      if (oldEl && p.oldPriceUSD) oldEl.textContent = money(p.oldPriceUSD, cur);
      const slot = el.querySelector(".pcard-action-slot");
      if (slot) {
        slot.innerHTML = "";
        slot.appendChild(renderAction(p));
      }
      const wishBtn = el.querySelector(".pcard-wish");
      if (wishBtn) {
        const w = AT.store.isWished(p.id);
        wishBtn.classList.toggle("is-active", w);
        wishBtn.setAttribute("aria-pressed", String(w));
        wishBtn.innerHTML = AT.icon(w ? "heartFill" : "heart", "", 18);
      }
    });
  }

  AT.card = { create, refreshAll };
})();
