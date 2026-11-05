/* ==========================================================================
   MOTION & SCROLL JOURNEY — Lenis smooth scroll ONLY on desktop fine pointer,
   Arabic-safe word stagger reveals, route progress bar, filling header basket,
   pinned horizontal Best Sellers on desktop (>= 1024px fine pointer), footer
   mega-word fill, magnetic buttons & custom cursor.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, clamp, prefersReducedMotion, isFinePointer } = AT.dom;

  /* ---------------- 1. Arabic-safe word-split reveals ---------------- */
  function splitWords() {
    $$("[data-split], [data-reveal]").forEach((el) => el.classList.add("is-inview"));
  }

  /* ---------------- 2. Scroll journey & pinned Best Sellers ---------------- */
  function initScrollJourney() {
    const header = $("#site-header");
    const basket = $("#header-basket");
    const mega = $("#mega-word");
    const pin = $("#best-pin");
    const track = $("#best-track");

    function updateLayoutMode() {
      if (!pin) return;
      // Disable pinned horizontal scroll-jacking on < 1024px OR touch devices
      const enablePin =
        window.innerWidth >= 1024 &&
        isFinePointer() &&
        !prefersReducedMotion() &&
        !$("#view-home")?.hidden;
      pin.classList.toggle("is-pinned", enablePin);
      if (!enablePin && track) track.style.transform = "";
    }

    function onScroll() {
      const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = clamp(window.scrollY / docH, 0, 1);
      if (header) header.style.setProperty("--scroll-p", p.toFixed(3));
      if (basket) basket.style.setProperty("--fill", p.toFixed(3));

      // Footer mega word fill
      if (mega) {
        const r = mega.getBoundingClientRect();
        const fp = clamp((window.innerHeight - r.top) / (window.innerHeight * 0.75), 0, 1);
        mega.style.setProperty("--word-fill", fp.toFixed(3));
      }

      // Pinned horizontal Best Sellers gallery on desktop fine pointer
      if (pin && track && pin.classList.contains("is-pinned")) {
        const r = pin.getBoundingClientRect();
        const scrollable = pin.offsetHeight - window.innerHeight;
        if (scrollable > 0) {
          const sp = clamp(-r.top / scrollable, 0, 1);
          const maxShift = Math.max(0, track.scrollWidth - window.innerWidth + 96);
          track.style.transform = `translate3d(${(sp * maxShift).toFixed(1)}px, 0, 0)`;
          pin.closest(".best")?.style.setProperty("--best-p", sp.toFixed(2));
        }
      }
    }

    updateLayoutMode();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { updateLayoutMode(); onScroll(); }, { passive: true });
  }

  /* ---------------- 3. Magnetic buttons & custom cursor ---------------- */
  function initPointerPolish() {
    if (!isFinePointer() || prefersReducedMotion()) return;

    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });

    const cur = $("#cursor");
    if (cur) {
      window.addEventListener("pointermove", (e) => {
        cur.classList.add("is-visible");
        cur.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        const overCard = e.target && e.target.closest && e.target.closest(".pcard-stage");
        cur.classList.toggle("is-card", Boolean(overCard));
      }, { passive: true });
    }
  }

  /* ---------------- 4. Smooth scrolling (Lenis ONLY on desktop fine pointer) ---------------- */
  function initLenis() {
    if (!isFinePointer() || prefersReducedMotion() || typeof window.Lenis !== "function") return;
    try {
      const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    } catch (e) { /* graceful fallback to native scroll */ }
  }

  function init() {
    if (prefersReducedMotion()) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
    }
    splitWords();
    initScrollJourney();
    initPointerPolish();
    initLenis();
  }

  AT.motion = { init, splitWords };
})();
