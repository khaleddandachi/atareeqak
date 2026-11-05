/* ==========================================================================
   BOOTSTRAP — initializes icons, components, sections, router, motion & PWA.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});

  function boot() {
    AT.hydrateIcons(document);
    AT.ui.initHeader();
    AT.quickview.init();
    AT.cart.init();
    AT.search.init();
    AT.checkout.init();
    AT.hero.init();
    AT.home.init();
    AT.catalogView.init();
    AT.router.init();
    AT.motion.init();

    const yr = document.getElementById("year");
    if (yr) yr.textContent = String(new Date().getFullYear());

    // Register Service Worker for offline shell & PWA installability
    if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(() => { /* ignore on file:// */ });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

