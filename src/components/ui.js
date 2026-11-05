/* ==========================================================================
   UI PRIMITIVES — toasts, fly-to-cart arc, confetti, live Beirut status bar,
   sticky category chips strip, bottom-sheet swipe-down, and header bar.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, h, haptic, prefersReducedMotion } = AT.dom;
  const { money } = AT.fmt;
  const { storeStatus, hms } = AT.time;

  /* ---------------------------- Body Scroll Lock ---------------------------- */
  function syncBodyLock() {
    const anyOpen =
      $("#cart-drawer")?.classList.contains("is-open") ||
      $("#filters")?.classList.contains("is-open") ||
      Boolean($("#quickview")?.open) ||
      Boolean($("#checkout")?.open) ||
      Boolean($("#success")?.open) ||
      ($("#palette") && !$("#palette").hidden);
    document.body.classList.toggle("is-locked", Boolean(anyOpen));
  }

  /* ------------------ Bottom-sheet swipe-down to close ------------------ */
  function attachSheetSwipe(panelEl, onClose) {
    if (!panelEl || panelEl.dataset.swipeBound) return;
    panelEl.dataset.swipeBound = "1";
    let startY = 0;
    let dy = 0;
    let tracking = false;

    panelEl.addEventListener("touchstart", (e) => {
      if (window.innerWidth >= 960) return;
      const handle = e.target.closest(".sheet-handle, .drawer-head, .sheet-head, .filters-head, .qv-head");
      if (!handle && panelEl.scrollTop > 4) return;
      startY = e.touches[0].clientY;
      dy = 0;
      tracking = true;
    }, { passive: true });

    panelEl.addEventListener("touchmove", (e) => {
      if (!tracking) return;
      dy = e.touches[0].clientY - startY;
      if (dy > 8) {
        panelEl.style.transition = "none";
        panelEl.style.transform = `translateY(${Math.min(dy * 0.85, 340)}px)`;
      }
    }, { passive: true });

    panelEl.addEventListener("touchend", () => {
      if (!tracking) return;
      tracking = false;
      panelEl.style.transition = "";
      if (dy > 85) {
        panelEl.style.transform = "";
        onClose();
      } else {
        panelEl.style.transform = "";
      }
    });
  }

  /* ---------------------------- Toasts ---------------------------- */
  function toast(message, opts = {}) {
    const host = $("#toasts");
    if (!host) return;
    const item = h("div", { class: "toast", role: "status" },
      h("span", { html: AT.icon(opts.icon || "sparkle") }),
      h("span", null, message)
    );
    if (opts.actionLabel && typeof opts.onAction === "function") {
      item.appendChild(h("button", {
        type: "button",
        onclick: () => { opts.onAction(); item.remove(); }
      }, opts.actionLabel));
    }
    host.appendChild(item);
    setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";
      item.style.transition = "0.25s";
      setTimeout(() => item.remove(), 260);
    }, opts.duration || 3400);
  }

  /* ------------------------ Fly-to-cart arc ------------------------ */
  function pulseHeaderCart() {
    const btn = $("#cart-btn");
    const cnt = $("#cart-count");
    if (btn) {
      btn.classList.remove("is-bouncing");
      void btn.offsetWidth;
      btn.classList.add("is-bouncing");
    }
    if (cnt) {
      cnt.classList.remove("is-pop");
      void cnt.offsetWidth;
      cnt.classList.add("is-pop");
    }
  }

  function flyToCart(sourceEl, product) {
    haptic(18);
    const target = $("#cart-btn") || $(".bn-cart");
    if (!sourceEl || !target || prefersReducedMotion()) {
      pulseHeaderCart();
      return;
    }
    const sr = sourceEl.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const clone = h("div", {
      class: "fly-clone",
      html: AT.productArt.render(product)
    });
    clone.style.left = sr.left + sr.width / 2 - 34 + "px";
    clone.style.top = sr.top + sr.height / 2 - 34 + "px";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      const dx = tr.left + tr.width / 2 - (sr.left + sr.width / 2);
      const dy = tr.top + tr.height / 2 - (sr.top + sr.height / 2);
      clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.22) rotate(-18deg)`;
      clone.style.opacity = "0.2";
    });
    setTimeout(() => {
      clone.remove();
      pulseHeaderCart();
    }, 620);
  }

  /* ------------------------ Confetti burst ------------------------ */
  function confetti(originEl) {
    if (prefersReducedMotion()) return;
    const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: 120, width: 0, height: 0 };
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ["#F1A43A", "#DD4537", "#8A9A3B", "#395651", "#D9A441"];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("span");
      const angle = (Math.PI * 2 * i) / 22;
      const dist = 45 + Math.random() * 75;
      p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:8px;height:8px;border-radius:2px;background:${colors[i % colors.length]};pointer-events:none;z-index:999;transition:transform .75s cubic-bezier(.16,1,.3,1),opacity .75s;`;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate3d(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 20}px, 0) rotate(${i * 40}deg)`;
        p.style.opacity = "0";
      });
      setTimeout(() => p.remove(), 780);
    }
  }

  /* ------------------ Live Beirut opening-hours bar ------------------ */
  function initStatusBar() {
    const pill = $("#status-pill");
    const label = $("#status-label");
    const heroStatus = $("#hero-status");
    const cntLabel = $("#status-count-label");
    const cnt = $("#status-count");

    const radarPill = $("#radar-live-pill");
    const radarLabel = $("#radar-live-text") || $("#radar-live-label");
    const radarCnt = $("#radar-live-timer") || $("#radar-live-countdown");

    function tick() {
      const st = storeStatus();
      const timeStr = hms(st.secondsToChange);
      if (pill) pill.classList.toggle("is-closed", !st.open);
      if (label) label.textContent = st.label;
      if (heroStatus) heroStatus.textContent = st.open ? "مفتوح الآن بطرابلس" : st.label;
      if (cntLabel) cntLabel.textContent = st.open ? "يغلق بعد" : "يفتح بعد";
      if (cnt) cnt.textContent = timeStr;

      if (radarPill) radarPill.classList.toggle("is-closed", !st.open);
      if (radarLabel) radarLabel.textContent = st.open ? "مفتوح للتوصيل الآن" : st.label;
      if (radarCnt) radarCnt.textContent = `${st.open ? "يغلق بعد" : "يفتح بعد"} ${timeStr}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------ Sticky Horizontal Category Chips ------------------ */
  function setActiveStickyChip(catId) {
    const track = $("#sticky-cats-track");
    if (!track) return;
    $$(".sticky-cat-chip", track).forEach((btn) => {
      const active = btn.dataset.catId === catId;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
      if (active) {
        try {
          btn.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", inline: "center", block: "nearest" });
        } catch (e) { /* ignore */ }
      }
    });
  }

  function initStickyCategoryStrip() {
    const track = $("#sticky-cats-track");
    if (!track || !AT.catalog) return;
    track.innerHTML = "";

    AT.catalog.categories.forEach((cat) => {
      const btn = h("button", {
        type: "button",
        class: "sticky-cat-chip" + (cat.id === "all" ? " is-active" : ""),
        dataset: { catId: cat.id },
        "aria-selected": String(cat.id === "all"),
        onclick: () => {
          setActiveStickyChip(cat.id);
          // If on home and a dedicated curated section exists, scroll smoothly or open catalog
          const sectionMap = {
            mouneh: "#mouneh",
            "hot-beverages": "#coffee",
            wholesale: "#wholesale"
          };
          const homeVisible = !$("#view-home")?.hidden;
          const targetSel = sectionMap[cat.id];
          if (homeVisible && targetSel && $(targetSel)) {
            $(targetSel).scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
          } else {
            const hash = cat.id === "all" ? "#/catalog" : `#/catalog?cat=${encodeURIComponent(cat.id)}`;
            location.hash = hash;
          }
        }
      },
        h("span", { html: AT.categoryIcon(cat.id, "", 16) }),
        h("span", null, cat.name)
      );
      track.appendChild(btn);
    });
  }

  /* ------------------ Responsive Footer Accordions ------------------ */
  function syncFooterAccordions() {
    const isDesktop = window.innerWidth >= 768;
    $$("#footer details.f-acc").forEach((det) => {
      if (isDesktop) {
        det.setAttribute("open", "");
      } else if (!det.dataset.userToggled) {
        det.removeAttribute("open");
      }
    });
  }

  /* ------------------ Header & global controls ------------------ */
  function syncHeader() {
    const st = AT.store.get();
    const sum = AT.store.summary();

    // Currency buttons
    const curWrap = $(".cur-toggle");
    if (curWrap) {
      curWrap.dataset.active = st.currency;
      $$("[data-cur]", curWrap).forEach((b) => {
        b.setAttribute("aria-checked", String(b.dataset.cur === st.currency));
      });
    }

    // Cart counts & total
    const cCount = $("#cart-count");
    const cTotal = $("#cart-total");
    const bnCount = $("#bn-count");
    if (cCount) cCount.textContent = String(sum.count);
    if (bnCount) bnCount.textContent = String(sum.count);
    if (cTotal) cTotal.textContent = money(sum.total, st.currency);

    // Wishlist badge
    const wishBadge = $("#wish-count");
    if (wishBadge) {
      wishBadge.hidden = st.wishlist.length === 0;
      wishBadge.textContent = String(st.wishlist.length);
    }
  }

  function initHeader() {
    const hb = $("#header-basket");
    if (hb) hb.innerHTML = AT.art.headerBasket();

    // Currency switch
    $$(".cur-toggle [data-cur]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cur = btn.dataset.cur;
        AT.store.actions.setCurrency(cur);
        toast(cur === "LBP" ? "الأسعار الآن بالليرة اللبنانية (1$ = 89,900 ل.ل.)" : "الأسعار الآن بالدولار الأمريكي ($)", { icon: "wallet" });
      });
    });

    // Theme toggle
    const themeBtn = $("#theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", cur);
        AT.store.actions.setTheme(cur);
      });
    }

    // WhatsApp direct links in footer & bottom nav
    const waUrl = `https://wa.me/${window.AT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحبا عَ طريقك! بدي استفسر عن طلبية بطرابلس.")}`;
    const fWa = $("#footer-wa");
    const bnWa = $("#bn-wa");
    if (fWa) fWa.href = waUrl;
    if (bnWa) bnWa.href = waUrl;

    // Footer accordion behavior on mobile vs desktop
    $$("#footer details.f-acc").forEach((det) => {
      det.addEventListener("toggle", () => {
        if (window.innerWidth < 768) det.dataset.userToggled = "1";
      });
    });
    syncFooterAccordions();
    window.addEventListener("resize", syncFooterAccordions, { passive: true });

    initStatusBar();
    initStickyCategoryStrip();
    syncHeader();
    AT.store.subscribe(syncHeader);
  }

  AT.toast = { show: toast };
  AT.ui = {
    flyToCart,
    pulseHeaderCart,
    confetti,
    initHeader,
    syncHeader,
    setActiveStickyChip,
    attachSheetSwipe,
    syncBodyLock
  };
})();
