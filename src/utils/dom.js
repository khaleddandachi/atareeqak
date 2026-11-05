/* DOM helpers, escaping and small utilities shared by every module. */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});

  /** Escape any string before it is placed inside an HTML template. */
  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ESC[c]);
  }

  /** Remove emoji pictographs from legacy data strings (badges, tags). */
  function stripEmoji(s) {
    return String(s || "")
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /**
   * Safe element factory. Text children are always inserted as text nodes,
   * so user input can never become markup.
   * h("button", { class: "btn", onclick: fn, "aria-label": "..." }, "نص", childEl)
   */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
        else if (k === "class") el.className = v;
        else if (k === "html") el.innerHTML = v; // ONLY for trusted, pre-escaped markup (icons/art)
        else if (k === "dataset") Object.assign(el.dataset, v);
        else el.setAttribute(k, v === true ? "" : v);
      }
    }
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return el;
  }

  /** Parse a trusted HTML template into a DocumentFragment. */
  function frag(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content;
  }

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function debounce(fn, ms) {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }

  /** Deterministic pseudo-random generator (stable decorative layouts). */
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /** Haptic feedback on supported phones. */
  function haptic(ms = 18) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }

  AT.dom = { esc, stripEmoji, $, $$, h, frag, clamp, lerp, debounce, seeded, haptic, prefersReducedMotion, isFinePointer };
})();

