/* ==========================================================================
   CART DRAWER — persistent cart, swipe-to-remove, swipe-down bottom sheet on
   mobile, free-delivery mascot race, sad-basket empty state, and dual totals.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, h } = AT.dom;
  const { money, otherCur } = AT.fmt;

  let wasFree = false;

  function open() {
    const d = $("#cart-drawer");
    const s = $("#cart-scrim");
    const btn = $("#cart-btn");
    if (!d || !s) return;
    s.hidden = false;
    requestAnimationFrame(() => {
      s.classList.add("is-open");
      d.classList.add("is-open");
      d.setAttribute("aria-hidden", "false");
      if (btn) btn.setAttribute("aria-expanded", "true");
      if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
      d.focus();
    });
  }

  function close() {
    const d = $("#cart-drawer");
    const s = $("#cart-scrim");
    const btn = $("#cart-btn");
    if (!d || !s) return;
    s.classList.remove("is-open");
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
    setTimeout(() => { s.hidden = true; }, 320);
  }

  function attachSwipe(row, onRemove) {
    let sx = 0, dx = 0;
    row.addEventListener("touchstart", (e) => {
      sx = e.touches[0].clientX;
      dx = 0;
    }, { passive: true });
    row.addEventListener("touchmove", (e) => {
      dx = e.touches[0].clientX - sx;
      if (Math.abs(dx) > 12) {
        row.style.transform = `translateX(${dx * 0.65}px)`;
        row.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / 220));
      }
    }, { passive: true });
    row.addEventListener("touchend", () => {
      if (Math.abs(dx) > 95) {
        onRemove();
      } else {
        row.style.transform = "";
        row.style.opacity = "";
      }
    });
  }

  function renderTotals(targetEl, sum, cur) {
    if (!targetEl) return;
    targetEl.innerHTML = "";
    const row = (label, val, cls) => h("div", { class: cls || "" }, h("dt", null, label), h("dd", { class: "tnum" }, val));
    targetEl.appendChild(row("مجموع الأصناف", money(sum.subtotal, cur)));
    if (sum.discount > 0) {
      targetEl.appendChild(row(`خصم الكوبون (${AT.store.get().coupon} −${sum.couponPct}%)`, "−" + money(sum.discount, cur)));
    }
    targetEl.appendChild(row(`التوصيل (${sum.zone.short})`, sum.free ? "مجاناً!" : money(sum.fee, cur)));

    const grand = h("div", { class: "tot-grand" },
      h("dt", null, "الإجمالي"),
      h("dd", { class: "tnum" },
        money(sum.total, cur),
        h("span", { class: "tot-dual tnum" }, `يعادل ${money(sum.total, otherCur(cur))}`)
      )
    );
    targetEl.appendChild(grand);
  }

  function render() {
    const st = AT.store.get();
    const sum = AT.store.summary();
    const cur = st.currency;

    const countEl = $("#drawer-count");
    if (countEl) countEl.textContent = sum.count ? `${sum.count} قطع` : "فارغة";

    // Free delivery progress track
    const track = $("#free-track");
    const freeText = $("#free-text");
    if (track && freeText) {
      track.style.setProperty("--free-p", sum.progress.toFixed(3));
      track.classList.toggle("is-free", sum.free && sum.count > 0);
      if (sum.count === 0) {
        freeText.textContent = "التوصيل مجاني لكل طلبية فوق 25$ في طرابلس!";
      } else if (sum.free) {
        freeText.textContent = "مبروك! وصلت لخط النهاية — التوصيل صار مجاني بالكامل!";
        if (!wasFree) AT.ui.confetti(track);
      } else {
        freeText.textContent = `بعد بدك ${money(sum.remaining, cur)} لتوصل للتوصيل المجاني!`;
      }
      wasFree = sum.free && sum.count > 0;
    }

    const body = $("#drawer-body");
    const foot = $("#drawer-foot");
    if (!body || !foot) return;
    body.innerHTML = "";

    if (sum.lines.length === 0) {
      foot.hidden = true;
      body.appendChild(
        h("div", { class: "cart-empty" },
          h("div", { class: "cart-empty-art", html: AT.art.basket({ sad: true }) }),
          h("h3", null, "السلة فاضية وزعلانة!"),
          h("p", null, "عبيها من أطيب مونة، قهوة وغراض البيت وخلّيها تركض لعندك."),
          h("button", {
            type: "button",
            class: "btn btn-primary",
            onclick: () => { close(); AT.router && AT.router.go("/catalog"); }
          }, "تصفّح الأصناف")
        )
      );
      return;
    }

    foot.hidden = false;
    sum.lines.forEach((line) => {
      const removeWithUndo = () => {
        const savedQty = line.qty;
        AT.store.actions.remove(line.key);
        AT.toast.show(`شِلنا «${line.p.name}» من السلة`, {
          icon: "trash",
          actionLabel: "تراجع",
          onAction: () => AT.store.actions.restore(line.key, savedQty)
        });
      };

      const el = h("div", { class: "cart-line", style: `--card-tint:${line.p.tint}` },
        h("div", { class: "cart-line-thumb", html: AT.productArt.mediaHTML(line.p) }),
        h("div", { class: "cart-line-info" },
          h("h4", null, line.p.name),
          h("small", null, `${line.v.label} · ${line.p.unit}`),
          h("div", { class: "cart-line-price tnum" }, money(line.total, cur))
        ),
        h("div", { class: "cart-line-ctrl" },
          h("div", { class: "qty-pill tnum" },
            h("button", {
              type: "button",
              "aria-label": "زيادة الكمية",
              html: AT.icon("plus", "", 14),
              onclick: () => AT.store.actions.setQty(line.key, line.qty + 1)
            }),
            h("span", null, String(line.qty)),
            h("button", {
              type: "button",
              "aria-label": "تقليل الكمية",
              html: AT.icon(line.qty === 1 ? "trash" : "minus", "", 14),
              onclick: () => line.qty === 1 ? removeWithUndo() : AT.store.actions.setQty(line.key, line.qty - 1)
            })
          )
        )
      );
      attachSwipe(el, removeWithUndo);
      body.appendChild(el);
    });

    renderTotals($("#drawer-totals"), sum, cur);
  }

  function init() {
    const runner = $("#free-runner");
    const flag = $("#free-flag");
    if (runner) runner.innerHTML = AT.art.mascot({ label: "عدّاء التوصيل المجاني" });
    if (flag) flag.innerHTML = AT.art.flag();

    $("#cart-btn")?.addEventListener("click", open);
    $$("[data-open-cart]").forEach((b) => b.addEventListener("click", open));
    $$("[data-close-cart]").forEach((b) => b.addEventListener("click", close));
    $("#cart-scrim")?.addEventListener("click", close);

    const drawerEl = $("#cart-drawer");
    if (drawerEl && AT.ui && AT.ui.attachSheetSwipe) {
      AT.ui.attachSheetSwipe(drawerEl, close);
    }

    $("#coupon-apply")?.addEventListener("click", () => {
      const inp = $("#coupon-input");
      if (!inp) return;
      const code = inp.value.trim().toUpperCase();
      if (AT.store.actions.applyCoupon(code)) {
        AT.toast.show(`تم تفعيل كود الخصم ${code}!`, { icon: "gift" });
        inp.value = "";
      } else {
        AT.toast.show("الكود غير صحيح. جرّب تضغط على حرف العين الراكض لتربح كود!", { icon: "tag" });
      }
    });

    $("#checkout-btn")?.addEventListener("click", () => {
      close();
      AT.checkout && AT.checkout.open();
    });

    render();
    AT.store.subscribe(render);
  }

  AT.cart = { init, open, close, renderTotals };
})();
