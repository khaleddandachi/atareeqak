/* ==========================================================================
   ROUTER — hash-based routing (#/, #/catalog, #/product/:id) with View
   Transitions API support and smooth section anchor scrolling.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const { $, $$, prefersReducedMotion } = AT.dom;

  function switchView(fn) {
    if (document.startViewTransition && !prefersReducedMotion()) {
      document.startViewTransition(fn);
    } else {
      fn();
    }
  }

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "") || "/";
    const [path, qs] = raw.split("?");
    return { path: path || "/", params: new URLSearchParams(qs || "") };
  }

  function handleRoute() {
    const { path, params } = parseHash();
    const vHome = $("#view-home");
    const vCat = $("#view-catalog");
    const vProd = $("#view-product");

    // In-page anchor on home (e.g. #deals, #mouneh, #radar)
    if (!path.startsWith("/")) {
      const target = document.getElementById(path);
      if (target) {
        if (vHome?.hidden) {
          vHome.hidden = false;
          if (vCat) vCat.hidden = true;
          if (vProd) vProd.hidden = true;
        }
        target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
      return;
    }

    switchView(() => {
      if (path.startsWith("/catalog")) {
        if (vHome) vHome.hidden = true;
        if (vProd) vProd.hidden = true;
        if (vCat) vCat.hidden = false;
        AT.catalogView?.applyRouteParams(params);
        window.scrollTo({ top: 0, behavior: "instant" });
      } else if (path.startsWith("/product/")) {
        const pid = decodeURIComponent(path.slice("/product/".length));
        if (vHome) vHome.hidden = true;
        if (vCat) vCat.hidden = true;
        if (vProd) vProd.hidden = false;
        AT.catalogView?.renderProductPage(pid);
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        if (vHome) vHome.hidden = false;
        if (vCat) vCat.hidden = true;
        if (vProd) vProd.hidden = true;
      }

      // Sync bottom nav active state
      const activeTab = path.startsWith("/catalog") ? "catalog" : "home";
      $$(".bottom-nav [data-tab]").forEach((a) => {
        a.classList.toggle("is-active", a.dataset.tab === activeTab);
      });
    });
  }

  function go(route) {
    window.location.hash = route.startsWith("#") ? route : "#" + route;
  }

  function init() {
    window.addEventListener("hashchange", handleRoute);

    // Smooth scroll links (#deals, #radar, #mouneh, etc.)
    document.addEventListener("click", (e) => {
      const link = e.target && e.target.closest && e.target.closest("[data-scroll]");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#") && !href.startsWith("#/")) {
        e.preventDefault();
        const id = href.slice(1);
        const vHome = $("#view-home");
        if (vHome && vHome.hidden) {
          window.location.hash = "#/";
          setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
        } else {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
      }
    });

    handleRoute();
  }

  AT.router = { init, go };
})();

