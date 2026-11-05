/* ==========================================================================
 * product-art.js — brand-neutral, flat SVG packaging illustrations
 * --------------------------------------------------------------------------
 * Classic browser script (no modules). Exposes:
 *
 *   AT.productArt.render(product, { view: 0|1|2 })  -> SVG markup string
 *   AT.productArt.shapeOf(product)                  -> shape key string
 *   AT.productArt.label(product)                    -> short Arabic pack label
 *
 * view 0 = front, view 1 = tilted variant, view 2 = close-up crop on label.
 *
 * Style rules: flat rounded geometry, no outlines, 1–2 soft white highlights,
 * a subtle dark side shade and a soft ground shadow. All labels are generic
 * (no real brand names, logos or trade dress).
 * ========================================================================== */
(function () {
  'use strict';

  const AT = (window.AT = window.AT || {});

  /* ------------------------------------------------------------------------
   * Constants
   * ---------------------------------------------------------------------- */
  const FONT = "'IBM Plex Sans Arabic','Rubik',sans-serif";
  const GROUND = '#1F2F2C';
  const CREAM = '#FBF7EF';
  const INK = '#2B3A36';
  const METAL = ['#AEB8BC', '#E9EEF0', '#B7C1C5'];

  // Module-wide counter so every render call gets unique gradient/clip ids.
  let counter = 0;

  /* ------------------------------------------------------------------------
   * Small utilities
   * ---------------------------------------------------------------------- */
  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);
  }

  // Round to one decimal to keep markup compact.
  const n1 = (v) => Math.round(v * 10) / 10;

  // Tagged template for path data: rounds every interpolated number.
  function D(strs, ...vals) {
    let out = strs[0];
    vals.forEach((v, i) => {
      out += (typeof v === 'number' ? n1(v) : v) + strs[i + 1];
    });
    return out;
  }

  // Deterministic hash + PRNG so speckles/contents are stable per product.
  function hash(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  // Uniform random point inside an ellipse.
  function inEllipse(r, cx, cy, rx, ry) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    return [cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry];
  }

  /* ------------------------------------------------------------------------
   * SVG primitives (pure string builders)
   * ---------------------------------------------------------------------- */
  const op = (v) => `opacity="${v}"`;

  function rect(x, y, w, h, rx, fill, extra) {
    return `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}"` +
      (rx ? ` rx="${n1(rx)}"` : '') + ` fill="${fill}"` + (extra ? ' ' + extra : '') + '/>';
  }
  function circ(cx, cy, r, fill, extra) {
    return `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r)}" fill="${fill}"` + (extra ? ' ' + extra : '') + '/>';
  }
  function ell(cx, cy, rx, ry, fill, extra) {
    return `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill}"` +
      (extra ? ' ' + extra : '') + '/>';
  }
  function path(d, fill, extra) {
    return `<path d="${d}" fill="${fill}"` + (extra ? ' ' + extra : '') + '/>';
  }
  function stroke(d, color, width, extra) {
    return path(d, 'none', `stroke="${color}" stroke-width="${n1(width)}" stroke-linecap="round" stroke-linejoin="round"` +
      (extra ? ' ' + extra : ''));
  }
  // Soft white highlight pill.
  function shine(x, y, w, h, o) {
    return rect(x, y, w, h, Math.min(w, h) / 2, '#fff', op(o || 0.28));
  }
  // Subtle dark side shade (meant to be used inside a clip group).
  function shade(x, y, w, h, o) {
    return rect(x, y, w, h, 0, '#000', op(o || 0.1));
  }
  // Soft ground shadow under the pack.
  function groundShadow(cx, rx) {
    return ell(cx, 268, rx, Math.max(6, rx * 0.13), GROUND, op(0.12));
  }
  // Live Arabic text, centred, RTL.
  function txt(x, y, size, fill, str, extra) {
    return `<text x="${n1(x)}" y="${n1(y)}" font-family="${FONT}" font-size="${n1(size)}" font-weight="700" ` +
      `fill="${fill}" text-anchor="middle" direction="rtl"` + (extra ? ' ' + extra : '') + `>${esc(str)}</text>`;
  }
  function starD(cx, cy, ro, ri, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2;
      const r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + n1(cx + Math.cos(a) * r) + ' ' + n1(cy + Math.sin(a) * r);
    }
    return d + 'Z';
  }
  function polyD(cx, cy, r, n, rotDeg) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = ((rotDeg || 0) * Math.PI) / 180 + (Math.PI * 2 * i) / n;
      d += (i ? 'L' : 'M') + n1(cx + Math.cos(a) * r) + ' ' + n1(cy + Math.sin(a) * r);
    }
    return d + 'Z';
  }
  // Four-point sparkle.
  function sparkle(cx, cy, s, color, extra) {
    return path(D`M${cx} ${cy - s}Q${cx} ${cy} ${cx + s} ${cy}Q${cx} ${cy} ${cx} ${cy + s}Q${cx} ${cy} ${cx - s} ${cy}Q${cx} ${cy} ${cx} ${cy - s}Z`,
      color, extra);
  }
  // Crimped seal strip (chips / frozen bags / chocolate wrappers).
  function crimp(x, y, w, h, color) {
    let s = rect(x, y, w, h, 4, color) + rect(x, y, w, h, 4, '#000', op(0.12));
    for (let i = x + 5; i < x + w - 3; i += 6) s += rect(i, y + 2, 2, h - 4, 1, '#fff', op(0.22));
    return s;
  }

  /* ------------------------------------------------------------------------
   * Render context: unique ids, defs collection, label focus rect
   * ---------------------------------------------------------------------- */
  function Ctx(p, spec) {
    this.k = ++counter;
    this.p = p;
    this.spec = spec;
    this.pal = spec.pal;
    this.text = spec.label;
    let sub = unitLine(p.unit);
    if (sub && spec.label.indexOf(sub) !== -1) sub = ''; // avoid "أرز 5 كغ / 5 كغ"
    this.sub = sub;
    this.defs = [];
    this.focus = null;
    this.ground = 60;
    this.groundX = 120;
  }
  Ctx.prototype.uid = function (name) {
    return 'pa' + this.k + '-' + name;
  };
  Ctx.prototype.lin = function (name, stops, vertical) {
    const id = this.uid(name);
    const dir = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
    const st = stops.map((c, i) => `<stop offset="${n1((i / (stops.length - 1)) * 100)}%" stop-color="${c}"/>`).join('');
    this.defs.push(`<linearGradient id="${id}" ${dir}>${st}</linearGradient>`);
    return `url(#${id})`;
  };
  Ctx.prototype.clip = function (name, shapeMarkup, inner) {
    const id = this.uid(name);
    this.defs.push(`<clipPath id="${id}">${shapeMarkup}</clipPath>`);
    return `<g clip-path="url(#${id})">${inner}</g>`;
  };

  /* ------------------------------------------------------------------------
   * Unit line ("330 مل", "24 × 330 مل", "5 كغ") — Western digits
   * ---------------------------------------------------------------------- */
  const UNIT_RE = /(\d+(?:[.,]\d+)?)(?:\s*[×xX*]\s*(\d+(?:[.,]\d+)?))?\s*(كيلو\s?غرام|كيلو|كلغ|كغ|غرامات|غرام|غ|مليلتر|ملل|مل|ليتر|لتر)(?![\u0621-\u064A])/;
  const UNIT_NORM = {
    'كيلوغرام': 'كغ', 'كيلو': 'كغ', 'كلغ': 'كغ', 'كغ': 'كغ',
    'غرامات': 'غ', 'غرام': 'غ', 'غ': 'غ',
    'مليلتر': 'مل', 'ملل': 'مل', 'مل': 'مل', 'ليتر': 'لتر', 'لتر': 'لتر'
  };
  function unitLine(unit) {
    const u = String(unit || '')
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x6f0));
    let m = u.match(UNIT_RE);
    if (m) {
      const word = m[3].replace(/\s+/g, '');
      return (m[2] ? m[1] + ' × ' + m[2] : m[1]) + ' ' + (UNIT_NORM[word] || word);
    }
    m = u.match(/(\d+(?:[.,]\d+)?)\s*([\u0621-\u064A]+)/);
    return m ? m[1] + ' ' + m[2] : '';
  }

  /* ------------------------------------------------------------------------
   * Text fitting (approximate glyph width for bold Arabic)
   * ---------------------------------------------------------------------- */
  function emWidth(str) {
    const clean = String(str).replace(/[\u064B-\u0652\u0670]/g, ''); // ignore harakat
    let w = 0;
    for (const ch of clean) w += ch === ' ' ? 0.28 : 0.55;
    return Math.max(w, 0.5);
  }
  function splitTwo(text) {
    const words = text.split(/\s+/);
    if (words.length < 2) return null;
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const m = Math.max(emWidth(a), emWidth(b));
      if (!best || m < best.m) best = { lines: [a, b], m: m };
    }
    return best;
  }
  function fitLines(text, maxW, maxH, maxSize) {
    let size = Math.min(maxSize, maxH / 1.1, maxW / emWidth(text));
    let lines = [text];
    const two = splitTwo(text);
    if (two) {
      const s2 = Math.min(maxSize, maxH / 2.25, maxW / two.m);
      if (s2 > size * 1.12) {
        size = s2;
        lines = two.lines;
      }
    }
    return { lines: lines, size: n1(size) };
  }

  /* ------------------------------------------------------------------------
   * Decorative marks used on label panels
   * ---------------------------------------------------------------------- */
  function leafMark(cx, cy, s, c) {
    return path(D`M${cx} ${cy + s * 0.4}Q${cx - s * 0.5} ${cy - s * 0.9} ${cx - s * 1.9} ${cy - s * 0.5}Q${cx - s * 1.1} ${cy + s * 0.6} ${cx} ${cy + s * 0.4}Z`, c) +
      path(D`M${cx} ${cy + s * 0.4}Q${cx + s * 0.5} ${cy - s * 0.9} ${cx + s * 1.9} ${cy - s * 0.5}Q${cx + s * 1.1} ${cy + s * 0.6} ${cx} ${cy + s * 0.4}Z`, c) +
      circ(cx, cy + s * 0.3, s * 0.32, c);
  }
  function sunMark(cx, cy, s, c) {
    let out = circ(cx, cy, s * 0.6, c);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      out += circ(cx + Math.cos(a) * s * 1.15, cy + Math.sin(a) * s * 1.15, s * 0.17, c);
    }
    return out;
  }
  function snowMark(cx, cy, s, c) {
    let d = '';
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3;
      const dx = Math.cos(a) * s;
      const dy = Math.sin(a) * s;
      d += D`M${cx - dx} ${cy - dy}L${cx + dx} ${cy + dy}`;
    }
    return stroke(d, c, s * 0.32);
  }
  function beanMark(cx, cy, s, c) {
    const one = (x, rot) => {
      const t = `transform="rotate(${rot} ${n1(x)} ${n1(cy)})"`;
      return ell(x, cy, s * 0.62, s * 0.9, c, t) +
        path(D`M${x} ${cy - s * 0.75}Q${x - s * 0.3} ${cy} ${x} ${cy + s * 0.75}`, 'none',
          `stroke="#fff" stroke-opacity=".6" stroke-width="${n1(s * 0.16)}" ${t}`);
    };
    return one(cx - s * 0.8, -25) + one(cx + s * 0.8, 25);
  }
  function deco(kind, cx, cy, s, c) {
    switch (kind) {
      case 'leaf': return leafMark(cx, cy, s, c);
      case 'wave':
        return stroke(D`M${cx - s * 2} ${cy}q${s * 0.5} ${-s * 0.8} ${s} 0t${s} 0t${s} 0t${s} 0`, c, s * 0.42);
      case 'star': return path(starD(cx, cy, s * 1.1, s * 0.5, 8), c);
      case 'sparkle': return sparkle(cx, cy, s * 1.2, c) + sparkle(cx + s * 1.7, cy - s * 0.5, s * 0.6, c);
      case 'drop':
        return path(D`M${cx} ${cy - s * 1.1}C${cx + s * 0.9} ${cy - s * 0.1} ${cx + s * 0.8} ${cy + s * 0.85} ${cx} ${cy + s * 0.85}C${cx - s * 0.8} ${cy + s * 0.85} ${cx - s * 0.9} ${cy - s * 0.1} ${cx} ${cy - s * 1.1}Z`, c);
      case 'hex':
        return path(polyD(cx - s * 1.75, cy, s * 0.7, 6, 30), c) + path(polyD(cx, cy, s, 6, 30), c) +
          path(polyD(cx + s * 1.75, cy, s * 0.7, 6, 30), c);
      case 'sun': return sunMark(cx, cy, s, c);
      case 'snow': return snowMark(cx, cy, s, c);
      case 'bean': return beanMark(cx, cy, s, c);
      case 'grain':
        return [-1, 0, 1].map((k) => ell(cx + k * s, cy, s * 0.32, s * 0.75, c,
          `transform="rotate(${k * 25} ${n1(cx + k * s)} ${n1(cy)})"`)).join('');
      default:
        return [-1.5, 0, 1.5].map((k) => circ(cx + k * s, cy, s * (k ? 0.36 : 0.48), c)).join('');
    }
  }

  /* ------------------------------------------------------------------------
   * Label panel: rounded card + mark + Arabic label + unit line
   * The first panel drawn is remembered as the "focus" for view 2.
   * ---------------------------------------------------------------------- */
  function panel(c, x, y, w, h, o) {
    o = o || {};
    const P = c.pal;
    const ink = P.ink || INK;
    const text = c.text;
    const sub = c.sub;
    if (!c.focus) c.focus = { x: x, y: y, w: w, h: h };
    const rx = o.rx != null ? o.rx : Math.min(14, h * 0.2);
    let s = rect(x, y, w, h, rx, P.panel || CREAM);
    const padX = Math.max(5, w * 0.08);
    const decoH = Math.min(18, h * 0.22);
    const subH = sub ? Math.min(13, Math.max(8, h * 0.15)) : 0;
    const textTop = y + decoH + 1;
    const textH = h - decoH - (sub ? subH + 7 : 6) - 1;
    const fit = fitLines(text, w - padX * 2, textH, o.max || 26);
    const lh = fit.size * 1.12;
    const first = textTop + (textH - lh * fit.lines.length) / 2 + fit.size * 0.82;

    s += deco(c.spec.deco, x + w / 2, y + decoH * 0.58 + 1, decoH * 0.3, P.mark || P.accent);
    fit.lines.forEach((line, i) => {
      s += txt(x + w / 2, first + i * lh, fit.size, ink, line);
    });
    if (sub) {
      const ss = Math.min(subH, (w - padX * 2) / emWidth(sub));
      s += rect(x + w * 0.32, y + h - subH - 7, w * 0.36, 1.2, 0.6, ink, op(0.18));
      s += txt(x + w / 2, y + h - 5 - ss * 0.12, ss, ink, sub, op(0.75));
    }
    return s;
  }

  /* ------------------------------------------------------------------------
   * Small illustrative props reused by shapes
   * ---------------------------------------------------------------------- */
  function eggplant(cx, cy, rot, sc) {
    return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})">` +
      path('M-16 0Q-16-10-2-10Q12-10 20-3Q24 0 20 3Q12 10-2 10Q-16 10-16 0Z', '#4A2549') +
      path('M-12-9Q-21-7-24 0Q-21 7-12 9Q-15 0-12-9Z', '#6E8B3D') +
      rect(-30, -1.5, 8, 3, 1.5, '#6E8B3D') +
      stroke('M-4-1Q6-3 16 0', '#DD4537', 2.4) +
      ell(2, -5.5, 8, 2.2, '#fff', op(0.22)) + '</g>';
  }
  function chip(cx, cy, rot) {
    return `<g transform="translate(${cx} ${cy}) rotate(${rot})">` +
      path('M-16 0Q-14-11 0-11Q15-10 16 0Q14 10 0 11Q-15 10-16 0Z', '#F6CD5E') +
      circ(-5, -3, 1.6, '#D9A441') + circ(6, 3, 1.3, '#D9A441') + ell(-2, -6, 7, 2, '#fff', op(0.35)) + '</g>';
  }
  function okra(x, y, rot) {
    return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">` +
      path('M0-15Q7-7 5 9Q3 16 0 18Q-3 16-5 9Q-7-7 0-15Z', '#5F8F35') +
      rect(-3, -19, 6, 6, 2, '#8DAE4A') + stroke('M0-12V15', '#8DBA55', 1.6) + '</g>';
  }
  function pea(x, y, r) {
    return circ(x, y, r, '#79B04A') + circ(x - r * 0.35, y - r * 0.35, r * 0.35, '#fff', op(0.4));
  }
  function oliveBranch(cx, cy) {
    return `<g transform="translate(${cx} ${cy})">` +
      stroke('M-30 6Q0-6 30 4', CREAM, 2) +
      ell(-18, -2, 8, 3, CREAM, 'transform="rotate(-30 -18 -2)"') +
      ell(0, -6, 8, 3, CREAM, 'transform="rotate(20 0 -6)"') +
      ell(18, -3, 8, 3, CREAM, 'transform="rotate(-20 18 -3)"') +
      ell(-8, 6, 5, 6.5, '#3E4A1A') + ell(10, 7, 5, 6.5, '#4E5D24') + ell(-9, 4, 1.5, 2, '#fff', op(0.4)) + '</g>';
  }
  function cornIcon(cx, cy) {
    let k = '';
    for (let r = -3; r <= 3; r++) for (let q = -1; q <= 1; q++) k += circ(q * 3.6, r * 4.2, 1.5, '#E0A62A');
    return `<g transform="translate(${cx} ${cy}) rotate(-30)">` + ell(0, -2, 8, 17, '#F6C445') + k +
      path('M0 20Q-15 6-9-14Q-4 2 0 20Z', '#8FB04A') + path('M0 20Q15 6 9-14Q4 2 0 20Z', '#A9C35E') + '</g>';
  }
  function mushroomIcon(cx, cy, sc) {
    return `<g transform="translate(${cx} ${cy}) scale(${sc})">` +
      rect(-5, -2, 10, 13, 4, '#F7F0E2') + path('M-16 0Q-16-15 0-15Q16-15 16 0Z', '#F1E6D2') +
      rect(-16, -1.5, 32, 3, 1.5, '#D8C6A6') + ell(-6, -9, 4, 2, '#fff', op(0.5)) + '</g>';
  }
  function gourd(cx, cy) {
    return stroke(D`M${cx + 2} ${cy - 6}L${cx + 13} ${cy - 24}`, '#C3CCD0', 2.6) +
      circ(cx, cy + 4, 13, '#8A5A3A') + rect(cx - 10, cy - 11, 20, 6, 3, '#6E4429') +
      ell(cx, cy - 9, 7, 2.2, '#7DA03F') + ell(cx - 4, cy, 3, 6, '#fff', op(0.2));
  }
  function chocIcon(variant, cx, cy) {
    const C = '#5A3422';
    const L = '#7A4A30';
    let g;
    if (variant === 'wafer') {
      g = rect(-19, -15, 16, 32, 4, C) + rect(3, -15, 16, 32, 4, C) +
        rect(-16, -12, 3, 24, 1.5, L) + rect(6, -12, 3, 24, 1.5, L);
    } else if (variant === 'filled') {
      g = rect(-16, -16, 32, 32, 5, C) +
        path('M-16-2H16V4Q12 10 8 4Q4-2 0 6Q-4 12-8 4Q-12-2-16 4Z', '#F3E2C4') + rect(-1, -16, 2, 14, 1, L);
    } else {
      g = rect(-20, -13, 40, 26, 5, C) + rect(-20, -3, 40, 8, 0, '#E7A447') +
        ell(-9, 1, 3.5, 2.4, '#C98A47') + ell(1, 0, 3.2, 2.2, '#C98A47') + ell(11, 2, 3.4, 2.3, '#C98A47');
    }
    return `<g transform="translate(${cx} ${cy}) rotate(-10)">${g}${rect(-12, -11, 8, 3, 1.5, '#fff', op(0.3))}</g>`;
  }
  function pattyIcon(cx, cy, seed) {
    const r = rng(seed);
    let fat = '';
    for (let i = 0; i < 10; i++) {
      const pt = inEllipse(r, cx, cy - 2, 26, 6);
      fat += circ(pt[0], pt[1], 1 + r() * 0.8, '#F3D3C8');
    }
    return path(D`M${cx - 40} ${cy - 2}L${cx - 30} ${cy - 18}H${cx + 36}L${cx + 40} ${cy + 6}L${cx + 30} ${cy + 18}H${cx - 34}Z`, CREAM, op(0.85)) +
      ell(cx, cy + 3, 34, 11, '#8E3B30') + ell(cx, cy - 1, 32, 9, '#B5523F') + fat;
  }
  function miniCarton(x, yTop, w, col, band) {
    return path(D`M${x} ${yTop + 14}L${x + 5} ${yTop + 4}H${x + w - 5}L${x + w} ${yTop + 14}Z`, '#E2EBF0') +
      rect(x + 4, yTop, w - 8, 5, 1.5, '#E2EBF0') +
      rect(x, yTop + 13, w, 110, 2, col) + rect(x, yTop + 22, w, 9, 0, band) +
      rect(x + 3, yTop + 16, 3, 40, 1.5, '#fff', op(0.6));
  }
  function miniCan(x, y, col) {
    return rect(x + 2, y, 12, 5, 2, '#C3CCD0') + rect(x, y + 4, 16, 30, 4, col) +
      rect(x, y + 14, 16, 6, 0, '#fff', op(0.7)) + rect(x + 3, y + 7, 2.5, 22, 1.2, '#fff', op(0.3));
  }
  function waterBottle(cx, top, base, col, cap) {
    return rect(cx - 6, top, 12, 8, 2.5, cap) + rect(cx - 5, top + 7, 10, 9, 0, col) +
      path(D`M${cx - 5} ${top + 15}Q${cx - 15} ${top + 22} ${cx - 15} ${top + 34}V${base - 5}Q${cx - 15} ${base} ${cx - 10} ${base}H${cx + 10}Q${cx + 15} ${base} ${cx + 15} ${base - 5}V${top + 34}Q${cx + 15} ${top + 22} ${cx + 5} ${top + 15}Z`, col) +
      rect(cx - 10, top + 38, 3, base - top - 52, 1.5, '#fff', op(0.55));
  }
  // Contents visible through a pouch window (zaatar mix / mixed nuts / generic).
  function pouchContents(c, cx, cy, rx, ry) {
    const r = rng(hash(c.p.id || c.text) + 7);
    const kind = c.pal.contents;
    let s = '';
    const at = (x, y, rot) => `transform="rotate(${n1(rot)} ${n1(x)} ${n1(y)})"`;
    if (kind === 'zaatar') {
      for (let i = 0; i < 70; i++) {
        const p = inEllipse(r, cx, cy, rx, ry);
        s += circ(p[0], p[1], 0.9 + r() * 1.2, r() < 0.5 ? '#5F7230' : '#A3B35A');
      }
      for (let i = 0; i < 22; i++) {
        const p = inEllipse(r, cx, cy, rx, ry);
        s += ell(p[0], p[1], 2, 1.1, '#F3E6C0', at(p[0], p[1], r() * 180));
      }
      for (let i = 0; i < 14; i++) {
        const p = inEllipse(r, cx, cy, rx, ry);
        s += circ(p[0], p[1], 1.2, '#9C3A35');
      }
    } else if (kind === 'nuts') {
      for (let i = 0; i < 18; i++) {
        const p = inEllipse(r, cx, cy, rx - 3, ry - 3);
        const t = i % 4;
        const rot = r() * 180;
        if (t === 0) s += ell(p[0], p[1], 5, 3.4, '#E7D3A5', at(p[0], p[1], rot)) + ell(p[0], p[1], 3, 2, '#9DB35A', at(p[0], p[1], rot));
        else if (t === 1) s += ell(p[0], p[1], 5.5, 3.2, '#A0623A', at(p[0], p[1], rot));
        else if (t === 2) s += path('M-5-2Q0-6 5-2Q6 1 3 1Q0-2-3 1Q-6 1-5-2Z', '#EBCB94', `transform="translate(${n1(p[0])} ${n1(p[1])}) rotate(${n1(rot)}) scale(1.2)"`);
        else s += circ(p[0], p[1], 3.6, '#8A5530');
      }
    } else {
      for (let i = 0; i < 30; i++) {
        const p = inEllipse(r, cx, cy, rx, ry);
        s += circ(p[0], p[1], 1.5 + r() * 2, c.pal.accent, op(0.8));
      }
    }
    return s;
  }

  /* ========================================================================
   * Shape renderers — each draws into the 240×300 canvas and calls panel()
   * ====================================================================== */
  const SH = {};

  // 330 ml drink can
  SH.can = function (c) {
    const P = c.pal;
    c.ground = 56;
    const metal = c.lin('metal', METAL);
    let s = rect(68, 70, 104, 186, 12, P.body);
    s += c.clip('body', rect(68, 70, 104, 186, 12, '#000'),
      path('M68 200Q94 186 120 200T172 200V260H68Z', P.accent) +
      circ(88, 226, 3.2, '#fff', op(0.35)) + circ(100, 240, 2, '#fff', op(0.35)) +
      circ(150, 232, 2.6, '#fff', op(0.35)) + circ(138, 246, 1.8, '#fff', op(0.3)) +
      shade(152, 60, 22, 210) + shine(78, 80, 10, 164, 0.3));
    s += path('M74 72L82 56H158L166 72Z', metal) + ell(120, 56, 38, 5.5, '#EEF2F3') +
      rect(108, 51, 24, 8, 4, '#A9B3B8') + rect(113, 53, 8, 4, 2, '#EEF2F3');
    s += path('M70 248H170L163 263Q161 267 154 267H86Q79 267 77 263Z', metal);
    s += panel(c, 78, 102, 84, 82, { max: 24 });
    return s;
  };

  // Slim 250 ml energy can
  SH['slim-can'] = function (c) {
    const P = c.pal;
    c.ground = 40;
    const metal = c.lin('metal', METAL);
    let s = rect(86, 56, 68, 198, 10, P.body);
    s += c.clip('body', rect(86, 56, 68, 198, 10, '#000'),
      path('M86 222L154 176V204L86 250Z', P.accent) +
      path('M86 208L154 162V168L86 214Z', P.accent, op(0.6)) +
      shade(140, 50, 16, 210) + shine(93, 64, 7, 180, 0.3));
    s += path('M90 58L95 44H145L150 58Z', metal) + ell(120, 44, 25, 4, '#EEF2F3') + rect(110, 40, 20, 7, 3.5, '#A9B3B8');
    s += path('M88 246H152L147 262Q145 266 139 266H101Q95 266 93 262Z', metal);
    s += panel(c, 92, 90, 56, 86, { max: 20 });
    return s;
  };

  // Small glass juice bottle
  SH['glass-bottle'] = function (c) {
    const P = c.pal;
    c.ground = 48;
    const d = 'M108 46H132V76Q132 90 146 100Q162 112 162 132V250Q162 266 146 266H94Q78 266 78 250V132Q78 112 94 100Q108 90 108 76Z';
    let s = path(d, '#E3EEEA');
    s += c.clip('glass', path(d, '#000'),
      rect(70, 94, 100, 180, 0, P.body) +
      path('M70 94Q95 88 120 94T170 94V100H70Z', '#fff', op(0.25)) +
      circ(100, 248, 6, '#fff', op(0.3)) + circ(138, 244, 4, '#fff', op(0.25)) +
      shade(146, 40, 24, 230) +
      rect(85, 122, 8, 120, 4, '#fff', op(0.35)) + rect(112, 50, 4, 34, 2, '#fff', op(0.45)));
    s += rect(106, 46, 28, 6, 3, '#fff', op(0.5));
    s += rect(104, 30, 32, 18, 4, P.cap || P.accent);
    for (let x = 109; x < 133; x += 5) s += rect(x, 33, 2, 12, 1, '#fff', op(0.25));
    s += panel(c, 86, 146, 68, 82, { max: 20 });
    return s;
  };

  // PET bottle with moulded handle (cooking oil)
  SH['pet-handle-bottle'] = function (c) {
    const P = c.pal;
    c.ground = 62;
    const d = 'M104 72V52H136V72Q136 80 150 86L164 93Q176 100 176 116V250Q176 266 160 266H80Q64 266 64 250V118Q64 100 78 92L94 84Q104 78 104 72Z' +
      'M146 104H158Q164 104 164 110V138Q164 144 158 144H146Q140 144 140 138V110Q140 104 146 104Z';
    const eo = 'fill-rule="evenodd" clip-rule="evenodd"';
    let s = path(d, P.body, eo);
    s += c.clip('pet', path(d, '#000', eo),
      rect(60, 40, 120, 52, 0, '#FFF6D8', op(0.55)) +
      shade(158, 90, 22, 180) +
      rect(64, 236, 112, 3, 0, '#fff', op(0.35)) + rect(64, 246, 112, 3, 0, '#fff', op(0.35)) +
      shine(72, 112, 9, 116, 0.35));
    s += rect(100, 48, 40, 7, 3.5, P.cap) + rect(98, 30, 44, 20, 5, P.cap);
    for (let x = 103; x < 140; x += 5) s += rect(x, 33, 2, 14, 1, '#fff', op(0.25));
    s += panel(c, 78, 154, 84, 78, { max: 20 });
    return s;
  };

  // Trigger spray bottle (cleaner)
  SH['spray-bottle'] = function (c) {
    const P = c.pal;
    c.ground = 52;
    const T = P.trigger || '#395651';
    const d = 'M96 112Q96 104 104 102H136Q144 104 144 112L158 136Q164 146 164 160V250Q164 266 148 266H92Q76 266 76 250V160Q76 146 82 136Z';
    let s = path(d, P.body);
    s += c.clip('btl', path(d, '#000'),
      path('M76 234Q98 222 120 234T164 234V270H76Z', P.accent) +
      rect(119, 104, 2.5, 140, 1.2, '#fff', op(0.3)) +
      shade(148, 96, 20, 176) + shine(84, 148, 8, 96, 0.32));
    s += rect(100, 88, 40, 18, 4, T);
    for (let x = 105; x < 138; x += 6) s += rect(x, 91, 2, 12, 1, '#fff', op(0.2));
    s += path('M98 90V66Q98 54 110 54H140Q150 54 150 64V90Z', T);
    s += rect(66, 58, 38, 14, 5, T) + rect(60, 60, 9, 10, 3, P.accent);
    s += path('M100 74Q86 78 84 98Q84 106 90 104Q94 92 102 86Z', P.accent);
    s += shine(104, 59, 5, 26, 0.3);
    s += panel(c, 86, 146, 68, 80, { max: 18 });
    return s;
  };

  // Glass jar with stuffed eggplants in oil (makdous)
  SH['glass-jar'] = function (c) {
    const P = c.pal;
    c.ground = 64;
    let s = rect(64, 84, 112, 182, 22, '#E3ECE8');
    s += c.clip('jar', rect(64, 84, 112, 182, 22, '#000'),
      rect(60, 96, 120, 180, 0, P.oil || '#C7B04A', op(0.6)) +
      eggplant(96, 118, -12, 1.15) + eggplant(146, 126, 168, 1.05) + eggplant(122, 104, 6, 0.9) +
      eggplant(96, 236, 10, 1.15) + eggplant(146, 230, 192, 1.1) + eggplant(120, 254, -4, 1) +
      circ(80, 212, 3, '#B07A43') + circ(160, 214, 2.6, '#B07A43') + circ(112, 220, 2.2, '#DD4537') +
      shade(156, 84, 22, 184, 0.08) + rect(72, 98, 8, 150, 4, '#fff', op(0.45)));
    s += rect(70, 80, 100, 10, 5, '#D3DEDA');
    s += rect(70, 54, 100, 30, 8, P.lid || '#DD4537');
    for (let x = 78; x < 166; x += 8) s += rect(x, 58, 3, 22, 1.5, '#000', op(0.08));
    s += rect(76, 57, 88, 4, 2, '#fff', op(0.3));
    s += panel(c, 76, 148, 88, 62, { max: 22 });
    return s;
  };

  // Amber honey jar with gold lid and a drip
  SH['honey-jar'] = function (c) {
    const P = c.pal;
    c.ground = 60;
    const lid = P.lid || '#D9A441';
    let s = rect(68, 90, 104, 176, 26, P.body);
    s += c.clip('jar', rect(68, 90, 104, 176, 26, '#000'),
      ell(108, 196, 40, 72, '#F6C35A', op(0.5)) +
      path(polyD(92, 242, 9, 6, 30), '#fff', op(0.16)) + path(polyD(108, 252, 9, 6, 30), '#fff', op(0.16)) +
      path(polyD(140, 246, 9, 6, 30), '#fff', op(0.16)) +
      shade(152, 90, 22, 180) + rect(76, 104, 8, 140, 4, '#fff', op(0.35)));
    s += rect(72, 62, 96, 30, 9, lid) + rect(78, 65, 84, 5, 2.5, '#fff', op(0.35));
    for (let x = 80; x < 162; x += 7) s += rect(x, 72, 2.5, 14, 1.2, '#000', op(0.08));
    s += rect(70, 88, 100, 7, 3.5, lid) + rect(70, 88, 100, 7, 3.5, '#000', op(0.15));
    // honey drip running from the lid
    s += path('M128 90H160Q164 90 164 94V108Q164 116 158 116Q152 116 152 108V104Q152 100 148 102Q144 104 144 112Q144 128 136 128Q128 128 128 116Z', '#D9861C');
    s += ell(158, 106, 1.6, 3, '#fff', op(0.5)) + ell(136, 118, 1.6, 3.2, '#fff', op(0.5));
    s += panel(c, 80, 146, 80, 66, { max: 22 });
    return s;
  };

  // Tapered tub with lid (labneh)
  SH.tub = function (c) {
    const P = c.pal;
    c.ground = 62;
    const lid = P.lid || '#395651';
    const d = 'M62 118H178L168 254Q167 266 154 266H86Q73 266 72 254Z';
    let s = path(d, P.body);
    s += c.clip('tub', path(d, '#000'),
      path('M58 228Q89 214 120 228T182 228V270H58Z', P.accent) +
      rect(58, 118, 124, 8, 0, '#000', op(0.08)) +
      shade(154, 110, 30, 160, 0.08) + rect(76, 132, 8, 90, 4, '#fff', op(0.6)));
    s += rect(54, 94, 132, 28, 10, lid) + rect(60, 86, 120, 14, 7, lid) + rect(60, 86, 120, 14, 7, '#fff', op(0.18));
    s += rect(176, 108, 18, 10, 5, lid);
    s += shine(66, 100, 108, 4, 0.25);
    s += panel(c, 80, 140, 80, 72, { max: 24 });
    return s;
  };

  // Vacuum-packed cheese block
  SH['vacuum-block'] = function (c) {
    const P = c.pal;
    c.ground = 76;
    let s = rect(44, 110, 152, 152, 24, '#fff', op(0.4)); // clear film
    s += rect(52, 118, 136, 136, 18, P.body);
    const r = rng(hash(c.p.id || 'cheese'));
    let pocks = '';
    for (let i = 0; i < 14; i++) pocks += circ(60 + r() * 120, 124 + r() * 124, 1.5 + r() * 2, '#E3D3AE');
    s += c.clip('blk', rect(52, 118, 136, 136, 18, '#000'),
      pocks + rect(52, 170, 136, 44, 0, P.accent) +
      path('M60 262L112 112H130L78 262Z', '#fff', op(0.22)) +
      stroke('M66 130Q82 140 74 162M168 134Q156 150 166 170M70 236Q90 228 98 244M150 244Q160 232 176 236', '#fff', 2, op(0.6)) +
      shade(166, 110, 24, 150, 0.08));
    s += rect(46, 104, 148, 8, 4, '#fff', op(0.55)) + rect(46, 256, 148, 8, 4, '#fff', op(0.55));
    s += panel(c, 78, 152, 84, 80, { max: 24 });
    return s;
  };

  // Gable-top milk carton
  SH['tetra-carton'] = function (c) {
    const P = c.pal;
    c.ground = 50;
    const roof = 'M76 102L92 66H148L164 102Z';
    let s = path(roof, P.accent) + path(roof, '#fff', op(0.15)) + rect(90, 52, 60, 16, 3, P.accent);
    s += rect(76, 100, 88, 166, 6, P.body);
    s += c.clip('ctn', rect(76, 100, 88, 166, 6, '#000'),
      path('M76 216Q98 204 120 216T164 216V270H76Z', P.accent) +
      rect(76, 100, 88, 4, 0, '#000', op(0.08)) +
      shade(146, 96, 20, 176, 0.09) + shine(83, 110, 7, 148, 0.4));
    s += rect(124, 74, 18, 12, 3, P.cap || '#F1A43A') + rect(122, 84, 22, 5, 2.5, P.cap || '#F1A43A');
    s += panel(c, 84, 118, 72, 84, { max: 22 });
    return s;
  };

  // Pillow foil bag with crimped ends (chips)
  SH['foil-bag'] = function (c) {
    const P = c.pal;
    c.ground = 60;
    const d = 'M70 62Q60 156 70 248H170Q180 156 170 62Z';
    let s = path(d, P.body);
    s += c.clip('bag', path(d, '#000'),
      `<g opacity=".22">${path(starD(120, 140, 62, 40, 14), '#fff')}</g>` +
      path('M58 206L182 160V204L58 250Z', P.accent) +
      chip(96, 222, -20) + chip(130, 232, 18) + chip(150, 206, -6) +
      shade(150, 50, 32, 210) + stroke('M82 74Q74 150 82 236', '#fff', 7, op(0.3)));
    s += crimp(66, 42, 108, 24, P.body) + crimp(66, 244, 108, 22, P.body);
    s += panel(c, 80, 104, 80, 72, { max: 24 });
    return s;
  };

  // Stand-up pouch with zip seal and window
  SH['standup-pouch'] = function (c) {
    const P = c.pal;
    c.ground = 64;
    const d = 'M70 70H170Q174 160 178 248Q178 264 162 264H78Q62 264 62 248Q66 160 70 70Z';
    let s = path(d, P.body);
    s += c.clip('pouch', path(d, '#000'),
      rect(60, 70, 120, 12, 0, '#000', op(0.12)) + rect(60, 82, 120, 2.5, 0, '#fff', op(0.25)) +
      path('M60 236Q120 254 180 236V270H60Z', '#000', op(0.1)) +
      shade(154, 60, 28, 210) + shine(76, 92, 8, 140, 0.3));
    const seal = 'M72 52H168Q172 52 172 56V72H68V56Q68 52 72 52ZM115 61a5 5 0 1 0 10 0a5 5 0 1 0-10 0Z';
    s += path(seal, P.body, 'fill-rule="evenodd"') + path(seal, '#000', 'fill-rule="evenodd" opacity=".12"');
    s += ell(120, 208, 38, 28, CREAM, op(0.9));
    s += c.clip('win', ell(120, 208, 34, 24, '#000'),
      ell(120, 208, 34, 24, P.fill || '#E9D3A8') + pouchContents(c, 120, 208, 34, 24) +
      ell(108, 196, 14, 4, '#fff', op(0.35)));
    s += panel(c, 78, 96, 84, 70, { max: 22 });
    return s;
  };

  // Kraft paper bag with folded top and twine bow
  SH['kraft-bag'] = function (c) {
    const P = c.pal;
    c.ground = 58;
    const d = 'M72 96H168L172 252Q172 264 160 264H80Q68 264 68 252Z';
    let s = path(d, P.body);
    const r = rng(hash(c.p.id || 'kraft'));
    let speck = '';
    for (let i = 0; i < 26; i++) speck += circ(74 + r() * 92, 120 + r() * 140, 0.8 + r() * 1.1, '#7A5530', op(0.28));
    s += c.clip('bag', path(d, '#000'),
      speck + rect(80, 120, 3, 140, 1.5, '#000', op(0.07)) + rect(157, 120, 3, 140, 1.5, '#000', op(0.07)) +
      shade(150, 90, 24, 180, 0.09) + shine(74, 124, 6, 120, 0.22));
    const flap = 'M70 76H170L168 110H72Z';
    s += path(flap, P.body) + path(flap, '#000', op(0.14));
    s += rect(68, 68, 104, 12, 4, P.body) + rect(68, 68, 104, 12, 4, '#fff', op(0.18));
    // twine band + bow
    s += rect(71, 112, 98, 7, 0, P.accent);
    s += path('M118 119L112 132H116L120 122ZM122 119L128 132H124L120 122Z', P.accent);
    s += ell(110, 116, 9, 5, P.accent, 'transform="rotate(-25 110 116)"') +
      ell(130, 116, 9, 5, P.accent, 'transform="rotate(25 130 116)"') +
      circ(120, 116, 4.5, P.accent) + circ(120, 116, 4.5, '#000', op(0.12));
    s += panel(c, 82, 140, 76, 80, { max: 22 });
    return s;
  };

  // Frozen veg bag: window with veg, frost sparkles, snow badge
  SH['freezer-bag'] = function (c) {
    const P = c.pal;
    c.ground = 62;
    const d = 'M68 62Q58 158 68 250H172Q182 158 172 62Z';
    let s = path(d, P.body);
    s += c.clip('bag', path(d, '#000'),
      path('M58 62H182V92Q151 104 120 92T58 92Z', '#fff', op(0.18)) +
      shade(150, 50, 34, 210) + stroke('M80 74Q72 150 80 236', '#fff', 6, op(0.25)));
    s += ell(120, 204, 48, 40, '#fff', op(0.55));
    const r = rng(hash(c.p.id || 'veg'));
    let veg = ell(120, 204, 44, 36, '#EAF4F7');
    if (P.veg === 'okra') {
      for (let i = 0; i < 9; i++) veg += okra(84 + r() * 72, 180 + r() * 50, r() * 360);
    } else {
      for (let i = 0; i < 34; i++) {
        const p = inEllipse(r, 120, 206, 40, 32);
        veg += pea(p[0], p[1], 4 + r() * 1.5);
      }
    }
    s += c.clip('win', ell(120, 204, 44, 36, '#000'), veg + ell(106, 186, 18, 5, '#fff', op(0.45)));
    s += sparkle(82, 162, 5, '#fff', op(0.85)) + sparkle(160, 164, 4, '#fff', op(0.85)) +
      sparkle(150, 80, 3.5, '#fff', op(0.8)) + sparkle(90, 80, 3, '#fff', op(0.8));
    s += circ(160, 236, 12, P.accent) + snowMark(160, 236, 7, '#fff');
    s += crimp(64, 42, 112, 24, P.body) + crimp(64, 246, 112, 22, P.body);
    s += panel(c, 80, 92, 80, 62, { max: 24 });
    return s;
  };

  // Carton box in 3/4 view: 'wide' (burger) or 'tall' (cosmetics set)
  SH['flat-box'] = function (c) {
    const P = c.pal;
    const tall = P.variant === 'tall';
    const g = tall ? { x: 70, y: 84, w: 90, h: 178, d: 16 } : { x: 40, y: 126, w: 136, h: 136, d: 22 };
    c.ground = tall ? 58 : 84;
    c.groundX = g.x + (g.w + g.d) / 2;
    const top = D`M${g.x} ${g.y}L${g.x + g.d} ${g.y - g.d}H${g.x + g.w + g.d}L${g.x + g.w} ${g.y}Z`;
    const side = D`M${g.x + g.w} ${g.y}L${g.x + g.w + g.d} ${g.y - g.d}V${g.y + g.h - g.d}L${g.x + g.w} ${g.y + g.h}Z`;
    let s = path(top, P.body) + path(top, '#fff', op(0.28)) + path(side, P.body) + path(side, '#000', op(0.16));
    s += rect(g.x, g.y, g.w, g.h, 3, P.body);
    const by = g.y + g.h - 40;
    let inner = path(D`M${g.x} ${by}Q${g.x + g.w / 4} ${by - 12} ${g.x + g.w / 2} ${by}T${g.x + g.w} ${by}V${g.y + g.h + 4}H${g.x}Z`, P.accent);
    inner += shine(g.x + 7, g.y + 8, 6, g.h - 16, 0.25);
    if (tall) {
      // three generic product silhouettes (tube, bottle, jar)
      inner += rect(g.x + 18, 214, 14, 40, 5, '#fff', op(0.8)) +
        rect(g.x + 38, 206, 16, 48, 6, '#fff', op(0.8)) + rect(g.x + 41, 198, 10, 10, 3, '#fff', op(0.8)) +
        rect(g.x + 60, 226, 14, 28, 5, '#fff', op(0.8));
    } else {
      inner += pattyIcon(g.x + g.w / 2 - 8, 234, hash(c.p.id || 'patty')) + snowMark(g.x + g.w - 18, 238, 7, '#fff');
    }
    s += c.clip('front', rect(g.x, g.y, g.w, g.h, 3, '#000'), inner);
    s += tall ? panel(c, g.x + 8, g.y + 22, g.w - 16, 80, { max: 20 }) : panel(c, g.x + 12, g.y + 12, g.w - 24, 64, { max: 24 });
    return s;
  };

  // Food tin with paper label, ribs and ring-pull
  SH['tin-can'] = function (c) {
    const P = c.pal;
    c.ground = 58;
    const metal = c.lin('metal', METAL);
    let s = rect(70, 80, 100, 184, 10, metal);
    let inner = '';
    [88, 95, 247, 254].forEach((y) => { inner += rect(70, y, 100, 2, 0, '#000', op(0.1)); });
    inner += rect(70, 102, 100, 136, 0, P.body) + path('M70 206Q95 194 120 206T170 206V238H70Z', P.accent);
    if (P.icon === 'corn') inner += cornIcon(120, 212);
    else if (P.icon === 'mushroom') inner += mushroomIcon(112, 216, 1) + mushroomIcon(138, 224, 0.7);
    else inner += path(starD(120, 216, 11, 5, 8), '#fff', op(0.7));
    inner += shade(150, 76, 22, 192, 0.12) + shine(78, 90, 9, 164, 0.32);
    s += c.clip('tin', rect(70, 80, 100, 184, 10, '#000'), inner);
    s += ell(120, 81, 50, 8, '#E9EEF0') + ell(120, 81, 42, 5.5, '#C3CCD0') +
      ell(110, 80, 9, 3.2, 'none', 'stroke="#98A3A8" stroke-width="2.4"') + rect(117, 78.4, 13, 3.4, 1.7, '#98A3A8');
    s += panel(c, 80, 112, 80, 64, { max: 22 });
    return s;
  };

  // Square tin: tall 4 L oil tin with spout & handle, or 'short' ghee tin
  SH['square-tin'] = function (c) {
    const P = c.pal;
    const short = P.variant === 'short';
    const x0 = short ? 62 : 66;
    const y0 = short ? 120 : 86;
    const w = short ? 116 : 108;
    const h = 264 - y0;
    c.ground = short ? 66 : 62;
    const top = D`M${x0} ${y0 + 2}L${x0 + 14} ${y0 - 14}H${x0 + w - 14}L${x0 + w} ${y0 + 2}Z`;
    let s = path(top, P.body) + path(top, '#fff', op(0.3));
    if (short) {
      s += ell(120, y0 - 6, 30, 5, '#000', op(0.12)) + ell(120, y0 - 7, 26, 3.6, '#E9EEF0');
    } else {
      s += stroke('M124 76Q142 44 160 76', '#9EA9AE', 4);
      s += rect(84, 66, 30, 8, 3, P.accent) + rect(88, 52, 22, 16, 4, P.accent) + rect(88, 52, 22, 16, 4, '#fff', op(0.25));
    }
    s += rect(x0, y0, w, h, 8, P.body);
    let inner = rect(x0, y0 + 12, w, 8, 0, P.accent) + rect(x0, y0 + 10, w, 2.5, 0, '#000', op(0.1)) +
      rect(x0, 252, w, 2.5, 0, '#000', op(0.1)) +
      path(D`M${x0} ${y0 + h - 44}Q${x0 + w / 4} ${y0 + h - 56} ${x0 + w / 2} ${y0 + h - 44}T${x0 + w} ${y0 + h - 44}V270H${x0}Z`, P.accent) +
      shade(x0 + w - 20, y0, 20, h, 0.1) + shine(x0 + 8, y0 + 26, 8, h - 60, 0.28);
    if (short) inner += [-24, -12, 0, 12, 24].map((k) => circ(120 + k, y0 + h - 16, 2.2, '#fff', op(0.6))).join('');
    else inner += oliveBranch(120, 238);
    s += c.clip('tin', rect(x0, y0, w, h, 8, '#000'), inner);
    s += short ? panel(c, x0 + 14, y0 + 28, w - 28, 72, { max: 22 }) : panel(c, 78, 124, 84, 80, { max: 22 });
    return s;
  };

  // Tall round tea tin with gold lid and ornament
  SH['tea-tin'] = function (c) {
    const P = c.pal;
    c.ground = 50;
    let s = rect(78, 92, 84, 172, 10, P.body);
    let dots = '';
    for (let x = 84; x <= 156; x += 8) dots += circ(x, 230, 1.8, P.accent);
    s += c.clip('tin', rect(78, 92, 84, 172, 10, '#000'),
      rect(78, 238, 84, 6, 0, P.accent) + rect(78, 248, 84, 3, 0, P.accent) + dots +
      rect(84, 104, 72, 120, 12, 'none', `stroke="${P.accent}" stroke-width="1.5" opacity=".7"`) +
      shade(146, 88, 18, 180, 0.12) + shine(85, 100, 7, 156, 0.25));
    s += rect(74, 62, 92, 34, 8, P.accent) + rect(74, 62, 92, 34, 8, '#fff', op(0.12)) +
      rect(74, 92, 92, 4, 2, '#000', op(0.18)) + shine(80, 66, 6, 24, 0.4);
    s += panel(c, 88, 116, 64, 98, { rx: 26, max: 20 });
    return s;
  };

  // Paper pack / vacuum brick (coffee, mate)
  SH['paper-pack'] = function (c) {
    const P = c.pal;
    c.ground = 54;
    const top = 'M74 88L82 66H158L166 88Z';
    let s = path(top, P.body) + path(top, '#000', op(0.15)) +
      rect(80, 58, 80, 10, 3, P.body) + rect(80, 58, 80, 10, 3, '#000', op(0.22));
    for (let x = 88; x < 156; x += 8) s += rect(x, 70, 2, 14, 1, '#fff', op(0.12));
    s += rect(74, 86, 92, 178, 6, P.body);
    let inner = path('M74 214Q97 202 120 214T166 214V270H74Z', P.accent) +
      shade(148, 80, 20, 190, 0.1) + shine(81, 96, 7, 160, 0.25);
    inner += P.icon === 'gourd' ? gourd(120, 240) : beanMark(120, 240, 10, P.body);
    s += c.clip('pack', rect(74, 86, 92, 178, 6, '#000'), inner);
    if (P.icon !== 'gourd') s += circ(148, 102, 5, '#000', op(0.22)) + circ(148, 102, 2, '#fff', op(0.35)); // aroma valve
    s += panel(c, 82, 114, 76, 84, { max: 22 });
    return s;
  };

  // Clear bread bag with stacked flatbreads and a green band (generic)
  SH['bread-bag'] = function (c) {
    const P = c.pal;
    c.ground = 74;
    let s = '';
    for (let i = 0; i < 7; i++) {
      const y = 240 - i * 13;
      s += ell(120, y + 3, 64, 20, '#C99A5E') + ell(120, y, 64, 20, i % 2 ? P.body : '#E2B979');
    }
    const ty = 240 - 6 * 13;
    s += ell(120, ty, 60, 18, '#F0D29F');
    const r = rng(hash(c.p.id || 'bread'));
    for (let i = 0; i < 9; i++) {
      const p = inEllipse(r, 120, ty, 50, 13);
      s += ell(p[0], p[1], 3 + r() * 3, 1.6 + r(), '#C88E4E', op(0.55));
    }
    const bag = 'M50 110Q50 86 74 86H96Q104 72 112 64H128Q136 72 144 86H166Q190 86 190 110V246Q190 266 170 266H70Q50 266 50 246Z';
    s += path(bag, '#fff', op(0.28));
    s += c.clip('bag', path(bag, '#000'),
      rect(50, 98, 140, 60, 0, P.accent) + rect(50, 160, 140, 3, 0, P.accent, op(0.6)) +
      stroke('M62 170Q58 210 64 250', '#fff', 6, op(0.45)) + shade(172, 86, 20, 180, 0.06));
    s += path('M112 64L100 46Q113 50 120 58Q127 50 140 46L128 64Z', '#fff', op(0.5));
    s += rect(106, 60, 28, 8, 4, P.accent);
    s += panel(c, 70, 104, 100, 48, { max: 22 });
    return s;
  };

  // Foil-wrapped butter block in 3/4 view
  SH['foil-block'] = function (c) {
    const P = c.pal;
    c.ground = 86;
    c.groundX = 122;
    const top = 'M40 152L62 126H202L180 152Z';
    const side = 'M180 152L202 126V222L180 248Z';
    let s = path(top, P.body) + path(top, '#fff', op(0.32)) + path(side, P.body) + path(side, '#000', op(0.16)) +
      path('M180 152L202 126L196 190Z', '#fff', op(0.12));
    s += rect(40, 150, 140, 98, 4, P.body);
    s += c.clip('front', rect(40, 150, 140, 98, 4, '#000'),
      rect(40, 166, 140, 66, 0, P.accent) +
      stroke('M50 158L64 162L58 170M150 236L164 240L170 232M160 158L172 164', '#fff', 1.6, op(0.55)) +
      shine(46, 156, 6, 86, 0.3));
    s += stroke('M80 136L96 140L108 134M140 132L154 138', '#fff', 1.6, op(0.6));
    s += panel(c, 62, 158, 96, 82, { max: 24 });
    return s;
  };

  // Chocolate bar wrapper (variants: nuts / wafer / filled)
  SH['choc-bar'] = function (c) {
    const P = c.pal;
    c.ground = 56;
    let s = rect(72, 60, 96, 190, 6, P.body);
    s += c.clip('bar', rect(72, 60, 96, 190, 6, '#000'),
      path('M72 190L168 166V180L72 204Z', P.accent) + path('M72 210L168 186V190L72 214Z', P.accent, op(0.6)) +
      chocIcon(P.variant, 120, 228) +
      shade(152, 56, 16, 200, 0.1) + shine(80, 68, 7, 176, 0.3));
    s += crimp(70, 42, 100, 22, P.body) + crimp(70, 246, 100, 22, P.body);
    s += panel(c, 80, 80, 80, 82, { max: 22 });
    return s;
  };

  // Plastic crate with 12 milk cartons (3 rows × 4)
  SH.crate = function (c) {
    const P = c.pal;
    c.ground = 92;
    let s = '';
    const rows = [{ dy: -26, dx: 10, col: '#D5DEE3' }, { dy: -13, dx: 5, col: '#E7EEF1' }, { dy: 0, dx: 0, col: '#F7FAFB' }];
    rows.forEach((row) => {
      for (let i = 0; i < 4; i++) s += miniCarton(48 + i * 36 + row.dx, 104 + row.dy, 30, row.col, P.accent);
    });
    s += rect(36, 148, 168, 118, 10, P.body);
    let inner = rect(96, 158, 48, 12, 6, '#000', op(0.2)) + shade(186, 148, 18, 120, 0.1) + shine(42, 160, 6, 96, 0.2);
    for (let i = 0; i < 6; i++) inner += rect(52 + i * 24, 238, 16, 16, 5, '#000', op(0.14));
    s += c.clip('crate', rect(36, 148, 168, 118, 10, '#000'), inner);
    s += rect(32, 142, 176, 14, 7, P.body) + rect(32, 142, 176, 14, 7, '#fff', op(0.22));
    s += panel(c, 70, 176, 100, 56, { max: 22 });
    return s;
  };

  // Cardboard case of 24 cans
  SH['carton-box'] = function (c) {
    const P = c.pal;
    c.ground = 90;
    const top = 'M40 120L66 94H196L170 120Z';
    const side = 'M170 120L196 94V236L170 262Z';
    let s = path(top, P.body) + path(top, '#fff', op(0.2)) +
      path('M53 107H183', 'none', 'stroke="#000" stroke-opacity=".12" stroke-width="1.5"') +
      path(side, P.body) + path(side, '#000', op(0.16));
    s += path('M100 120L126 94H142L116 120Z', '#EBD6AC', op(0.9)); // tape on top
    // "this side up" arrows on the side face
    s += path('M175 152L179 144L183 152H181V162H177V152Z', '#fff', op(0.5)) +
      path('M185 152L189 144L193 152H191V162H187V152Z', '#fff', op(0.5));
    s += rect(40, 120, 130, 142, 3, P.body);
    let inner = rect(100, 120, 16, 16, 0, '#EBD6AC', op(0.9)) + shade(40, 120, 130, 6, 0.08);
    for (let i = 0; i < 5; i++) inner += miniCan(52 + i * 22, 140, P.accent);
    inner += shine(46, 128, 5, 120, 0.22);
    s += c.clip('front', rect(40, 120, 130, 142, 3, '#000'), inner);
    s += panel(c, 52, 186, 106, 62, { max: 22 });
    return s;
  };

  // Shrink-wrapped pack of 12 water bottles
  SH['shrink-pack'] = function (c) {
    const P = c.pal;
    c.ground = 84;
    const cap = P.cap || '#3B7EA1';
    let s = '';
    const rows = [
      { top: 74, base: 238, dx: 10, col: '#9FCBE0' },
      { top: 84, base: 251, dx: 5, col: '#B2D9EA' },
      { top: 96, base: 264, dx: 0, col: P.body }
    ];
    rows.forEach((r) => {
      for (let i = 0; i < 4; i++) s += waterBottle(66 + i * 34 + r.dx, r.top, r.base, r.col, cap);
    });
    s += rect(44, 66, 156, 202, 22, '#fff', op(0.16));
    s += c.clip('wrap', rect(44, 66, 156, 202, 22, '#000'),
      rect(44, 176, 156, 26, 0, P.accent) +
      stroke('M60 90Q54 170 62 250', '#fff', 7, op(0.4)) + stroke('M178 96Q184 140 180 170', '#fff', 4, op(0.35)));
    s += stroke('M100 76Q100 44 122 44Q144 44 144 76', P.accent, 8);
    s += panel(c, 68, 156, 108, 66, { max: 22 });
    return s;
  };

  // Woven rice sack with handle strap
  SH.sack = function (c) {
    const P = c.pal;
    c.ground = 74;
    const d = 'M56 82Q60 68 74 70Q120 76 166 70Q180 68 184 82L188 248Q188 266 170 266H70Q52 266 52 248Z';
    const weave = c.uid('weave');
    c.defs.push(`<pattern id="${weave}" width="6" height="6" patternUnits="userSpaceOnUse">` +
      '<path d="M0 3H6M3 0V6" stroke="#000" stroke-opacity=".07" stroke-width="1.4"/></pattern>');
    let s = stroke('M96 74Q96 38 120 38Q144 38 144 74', P.accent, 9);
    s += path(d, P.body);
    s += c.clip('sack', path(d, '#000'),
      rect(48, 60, 144, 210, 0, `url(#${weave})`) +
      rect(64, 92, 9, 176, 0, P.accent) + rect(77, 92, 3, 176, 0, P.accent) +
      rect(167, 92, 9, 176, 0, P.accent) + rect(160, 92, 3, 176, 0, P.accent) +
      rect(48, 82, 144, 8, 0, '#000', op(0.07)) +
      path('M58 88H182', 'none', `stroke="${P.accent}" stroke-width="1.8" stroke-dasharray="4 3"`) +
      shade(162, 70, 30, 200, 0.07));
    // rice roundel
    s += circ(120, 232, 20, P.accent);
    [[-8, -6, 30], [4, -8, -20], [10, 2, 40], [-4, 4, -50], [-12, 6, 10], [6, 10, 70], [0, -1, 0]].forEach((g) => {
      s += ell(120 + g[0], 232 + g[1], 4.5, 2, '#fff', `transform="rotate(${g[2]} ${120 + g[0]} ${232 + g[1]})"`);
    });
    s += panel(c, 82, 112, 76, 90, { max: 24 });
    return s;
  };

  /* ========================================================================
   * Product table: id -> shape, neutral label, palette
   * ====================================================================== */
  function S(shape, label, pal, deco) {
    return { shape: shape, label: label, pal: pal, deco: deco };
  }
  const SPECS = {
    // Mouneh
    'mouneh-makdous-jar': S('glass-jar', 'مكدوس', { body: '#E6EEEB', accent: '#8A9A3B', ink: '#4A2549', lid: '#DD4537', oil: '#C7B04A' }, 'leaf'),
    'mouneh-zaatar-pack': S('standup-pouch', 'زعتر بلدي', { body: '#5E7D3A', accent: '#D9A441', ink: '#3E5626', fill: '#7E8E3C', contents: 'zaatar' }, 'leaf'),
    'mouneh-kishk-pack': S('kraft-bag', 'كشك بلدي', { body: '#C9A06C', accent: '#8A9A3B', ink: '#5B3F22' }, 'grain'),
    'mouneh-olive-oil-tin': S('square-tin', 'زيت زيتون', { body: '#6F8130', accent: '#D9A441', ink: '#3F4A1A' }, 'leaf'),
    // Coffee & tea
    'hot-bev-lebanese-coffee': S('paper-pack', 'بن بالهيل', { body: '#4A2C21', accent: '#D9A441', ink: '#4A2C21', icon: 'bean' }, 'bean'),
    'hot-bev-yerba-mate': S('paper-pack', 'متّة', { body: '#6E8E3A', accent: '#F1A43A', ink: '#3F5621', icon: 'gourd' }, 'leaf'),
    'hot-bev-ceylon-tea': S('tea-tin', 'شاي سيلاني', { body: '#7A2E2E', accent: '#D9A441', ink: '#5E2222' }, 'leaf'),
    // Wholesale
    'ws-pepsi-box': S('carton-box', 'كولا ×24', { body: '#C99A62', accent: '#B8322A', ink: '#5A2A1E' }, 'dots'),
    'ws-milk-crate': S('crate', 'حليب ×12', { body: '#3F6F67', accent: '#5B8FA8', ink: '#2B4A45' }, 'drop'),
    'ws-water-pack': S('shrink-pack', 'مياه ×12', { body: '#C4E6F3', accent: '#395651', ink: '#2B4A45', cap: '#3B7EA1' }, 'wave'),
    'ws-rice-sack': S('sack', 'أرز 5 كغ', { body: '#EFE4CC', accent: '#DD4537', ink: '#7A2A22', panel: '#FFFFFF' }, 'grain'),
    // Beverages
    'bev-pepsi-can': S('can', 'كولا', { body: '#B8322A', accent: '#5A2A1E', ink: '#7A1F1A' }, 'dots'),
    'bev-7up-can': S('can', 'ليمون فوّار', { body: '#F4C542', accent: '#8A9A3B', ink: '#4E5A1C' }, 'sun'),
    'bev-mr-juicy': S('glass-bottle', 'عصير فواكه', { body: '#F1A43A', accent: '#DD4537', ink: '#9A3B1E', cap: '#DD4537' }, 'leaf'),
    'bev-xxl-energy': S('slim-can', 'طاقة', { body: '#2E2A3A', accent: '#D9A441', ink: '#2E2A3A' }, 'star'),
    'bev-dark-blue': S('slim-can', 'طاقة زرقاء', { body: '#1F3E73', accent: '#5BC0EB', ink: '#1F3E73' }, 'star'),
    // Sweets
    'sweet-snickers': S('choc-bar', 'فستق وكراميل', { body: '#E58A2E', accent: '#5A3220', ink: '#5A3220', variant: 'nuts' }, 'dots'),
    'sweet-kitkat': S('choc-bar', 'ويفر بالشوكولا', { body: '#395651', accent: '#E9C9A0', mark: '#C9853F', ink: '#395651', variant: 'wafer' }, 'wave'),
    'sweet-remas': S('choc-bar', 'شوكولا محشوة', { body: '#7B3B5A', accent: '#D9A441', ink: '#5E2B45', variant: 'filled' }, 'star'),
    // Frozen
    'froz-okra-bag': S('freezer-bag', 'بامية', { body: '#3F7FA6', accent: '#8A9A3B', ink: '#2A5876', veg: 'okra' }, 'snow'),
    'froz-peas-bag': S('freezer-bag', 'بازيلاء', { body: '#2F6E8F', accent: '#7DB548', ink: '#22536C', veg: 'peas' }, 'snow'),
    'froz-burger-box': S('flat-box', 'برغر خام', { body: '#DD4537', accent: '#F1A43A', ink: '#8E2A20', variant: 'wide' }, 'snow'),
    // Bakery
    'bakery-green-lebanon': S('bread-bag', 'خبز لبناني', { body: '#E7C38A', accent: '#4E8A4A', ink: '#2F5E2D' }, 'wave'),
    // Dairy
    'dairy-tripoli-labneh': S('tub', 'لبنة', { body: '#F4EEE2', accent: '#8A9A3B', ink: '#395651', lid: '#395651', panel: '#FFFFFF' }, 'drop'),
    'dairy-tripoli-cheese': S('vacuum-block', 'عكاوي', { body: '#F5ECD3', accent: '#5B8FA8', ink: '#2F5A73', panel: '#FFFFFF' }, 'dots'),
    'dairy-tripoli-milk': S('tetra-carton', 'حليب طازج', { body: '#D6E6EE', accent: '#4F86B5', ink: '#2C5D85', cap: '#F1A43A', panel: '#FFFFFF' }, 'drop'),
    // Pantry
    'pantry-chips': S('foil-bag', 'شيبس', { body: '#F1A43A', accent: '#DD4537', ink: '#9A3B1E' }, 'star'),
    'pantry-bzourat': S('standup-pouch', 'بزورات', { body: '#7A4A2B', accent: '#D9A441', ink: '#5A3220', fill: '#F1E2C4', contents: 'nuts' }, 'dots'),
    'pantry-honey': S('honey-jar', 'عسل جبلي', { body: '#E39A2B', accent: '#D9A441', ink: '#8A4F12', lid: '#D9A441' }, 'hex'),
    'pantry-ghee': S('square-tin', 'سمنة بلدية', { body: '#E9B949', accent: '#395651', ink: '#395651', variant: 'short' }, 'star'),
    'pantry-oil': S('pet-handle-bottle', 'زيت دوار الشمس', { body: '#F2C641', accent: '#F1A43A', ink: '#8A5A10', cap: '#DD4537' }, 'sun'),
    'pantry-butter': S('foil-block', 'زبدة', { body: '#E3B94E', accent: '#395651', ink: '#395651' }, 'drop'),
    'pantry-corn': S('tin-can', 'ذرة حلوة', { body: '#F4C542', accent: '#5E7D3A', ink: '#4E5A1C', icon: 'corn' }, 'sun'),
    'pantry-mushrooms': S('tin-can', 'فطر', { body: '#E8DCC6', accent: '#7A5A3E', ink: '#5A3F28', icon: 'mushroom', panel: '#FFFFFF' }, 'leaf'),
    'pantry-cleaner': S('spray-bottle', 'منظف شامل', { body: '#5BB5A2', accent: '#F1A43A', ink: '#2B5E54', trigger: '#395651' }, 'sparkle'),
    'pantry-personal-care': S('flat-box', 'عناية بالبشرة', { body: '#F3C9C4', accent: '#B5536B', ink: '#8E3A50', variant: 'tall' }, 'leaf')
  };

  // Default panel mark per shape (used for unknown products).
  const DEFAULT_DECO = {
    can: 'dots', 'slim-can': 'star', 'glass-bottle': 'leaf', 'pet-handle-bottle': 'sun', 'spray-bottle': 'sparkle',
    'glass-jar': 'leaf', 'honey-jar': 'hex', tub: 'drop', 'vacuum-block': 'dots', 'tetra-carton': 'drop',
    'foil-bag': 'star', 'standup-pouch': 'leaf', 'kraft-bag': 'leaf', 'freezer-bag': 'snow', 'flat-box': 'star',
    'tin-can': 'leaf', 'square-tin': 'leaf', 'tea-tin': 'leaf', 'paper-pack': 'bean', 'bread-bag': 'wave',
    'foil-block': 'drop', 'choc-bar': 'dots', crate: 'drop', 'carton-box': 'dots', 'shrink-pack': 'wave', sack: 'grain'
  };

  // Harmonious fallback palettes [body, accent, ink].
  const FALLBACK = [
    ['#395651', '#F1A43A', '#2B4A45'],
    ['#DD4537', '#F1A43A', '#8E2A20'],
    ['#8A9A3B', '#D9A441', '#4E5A1C'],
    ['#F1A43A', '#395651', '#8A4F12'],
    ['#5B8FA8', '#F1A43A', '#2C5D85'],
    ['#D9A441', '#395651', '#6E4A12']
  ];

  // Category / keyword heuristics for products not in SPECS.
  const RULES = [
    [/طاقة|سليم/, 'slim-can'],
    [/كانز|غازي/, 'can'],
    [/عصير|قنينة زجاج/, 'glass-bottle'],
    [/بخاخ|منظف|مطهر/, 'spray-bottle'],
    [/عسل/, 'honey-jar'],
    [/تنكة|سمنة/, 'square-tin'],
    [/زيت/, 'pet-handle-bottle'],
    [/مرطبان|مكدوس|مخلل/, 'glass-jar'],
    [/لبنة|سطل/, 'tub'],
    [/جبن|حلوم|عكاوي/, 'vacuum-block'],
    [/زبدة/, 'foil-block'],
    [/حليب/, 'tetra-carton'],
    [/شيبس|رقائق/, 'foil-bag'],
    [/كرافت|كشك/, 'kraft-bag'],
    [/شاي/, 'tea-tin'],
    [/قهوة|^بن |مت[هة]/, 'paper-pack'],
    [/خبز|أرغفة|ربطة/, 'bread-bag'],
    [/شوكولا|ويفر/, 'choc-bar'],
    [/شوال|أرز|طحين|سكر/, 'sack'],
    [/معلب|علبة صفيح|علبة معدنية|ذرة|فطر|حمص|فول/, 'tin-can'],
    [/برغر|علبة كرتون/, 'flat-box'],
    [/كيس/, 'standup-pouch']
  ];
  const CATEGORY_SHAPE = {
    beverages: 'can', sweets: 'choc-bar', frozen: 'freezer-bag', bakery: 'bread-bag', dairy: 'tub',
    mouneh: 'glass-jar', 'hot-beverages': 'paper-pack', wholesale: 'carton-box', pantry: 'standup-pouch'
  };

  function guessShape(p) {
    const t = (p.name || '') + ' ' + (p.unit || '');
    const cat = p.category || '';
    if (cat === 'wholesale') {
      if (/مياه|ماء/.test(t)) return 'shrink-pack';
      if (/حليب/.test(t)) return 'crate';
      if (/شوال|أرز/.test(t)) return 'sack';
      return 'carton-box';
    }
    if (cat === 'frozen') return /برغر|علبة/.test(t) ? 'flat-box' : 'freezer-bag';
    for (let i = 0; i < RULES.length; i++) if (RULES[i][0].test(t)) return RULES[i][1];
    return CATEGORY_SHAPE[cat] || 'standup-pouch';
  }

  function shortName(name) {
    const words = String(name || '').replace(/[—–\-:،,()'"«»]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).join(' ') || 'منتج';
  }

  function specOf(p) {
    const known = SPECS[String(p.id || '')];
    if (known) {
      return {
        shape: known.shape,
        label: known.label,
        deco: known.deco || DEFAULT_DECO[known.shape] || 'dots',
        pal: Object.assign({ ink: INK }, known.pal)
      };
    }
    const shape = guessShape(p);
    const pair = FALLBACK[hash(String(p.id || '') + (p.name || '')) % FALLBACK.length];
    const t = (p.name || '') + ' ' + (p.unit || '');
    const pal = { body: pair[0], accent: pair[1], ink: pair[2] };
    // a few sensible variant hints for unknown items
    if (shape === 'square-tin' && /سمن/.test(t)) pal.variant = 'short';
    if (shape === 'flat-box' && !/برغر|لحم/.test(t)) pal.variant = 'tall';
    if (shape === 'freezer-bag' && /بامي/.test(t)) pal.veg = 'okra';
    if (shape === 'paper-pack' && /مت[هة]/.test(t)) pal.icon = 'gourd';
    if (shape === 'tin-can' && /ذرة/.test(t)) pal.icon = 'corn';
    if (shape === 'tin-can' && /فطر/.test(t)) pal.icon = 'mushroom';
    return { shape: shape, label: shortName(p.name), deco: DEFAULT_DECO[shape] || 'dots', pal: pal };
  }

  /* ------------------------------------------------------------------------
   * View 2: viewBox cropped around the label panel (4:5 aspect)
   * ---------------------------------------------------------------------- */
  function focusBox(f) {
    f = f || { x: 60, y: 90, w: 120, h: 120 };
    let w = f.w + 44;
    let h = f.h + 44;
    if (w / h > 0.8) h = w / 0.8;
    else w = h * 0.8;
    if (w < 120) {
      w = 120;
      h = 150;
    }
    const cx = f.x + f.w / 2;
    const cy = f.y + f.h / 2;
    return [n1(cx - w / 2), n1(cy - h / 2), n1(w), n1(h)].join(' ');
  }

  /* ------------------------------------------------------------------------
   * Public API
   * ---------------------------------------------------------------------- */
  function render(product, opts) {
    const p = product || {};
    const view = opts && (opts.view === 1 || opts.view === 2) ? opts.view : 0;
    const spec = specOf(p);
    const c = new Ctx(p, spec);
    const draw = SH[spec.shape] || SH['standup-pouch'];
    const art = draw(c);
    const P = spec.pal;
    let viewBox = '0 0 240 300';
    let content;
    if (view === 1) {
      // tilted pack, shadow stays on the ground, plus two tiny floating sparkles
      content = groundShadow(c.groundX + 6, c.ground * 1.06) +
        `<g transform="rotate(-8 120 160)">${art}</g>` +
        sparkle(196, 70, 7, P.accent, op(0.85)) + sparkle(42, 116, 5, P.mark || P.body, op(0.7));
    } else {
      content = groundShadow(c.groundX, c.ground) + art;
      if (view === 2) viewBox = focusBox(c.focus);
    }
    const defs = c.defs.length ? `<defs>${c.defs.join('')}</defs>` : '';
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.name || spec.label)}" ` +
      `class="pa-svg" preserveAspectRatio="xMidYMid meet">${defs}${content}</svg>`;
  }

  function mediaHTML(product, opts) {
    const svg = render(product, opts);
    if (product && product.photoUrl && (!opts || !opts.view)) {
      return `<img src="${esc(product.photoUrl)}" alt="${esc(product.name)}" width="240" height="300" loading="lazy" decoding="async" onerror="this.replaceWith(this.nextElementSibling.content.cloneNode(true))"/><template>${svg}</template>`;
    }
    return svg;
  }

  AT.productArt = {
    render: render,
    mediaHTML: mediaHTML,
    shapeOf: function (product) {
      return specOf(product || {}).shape;
    },
    label: function (product) {
      return specOf(product || {}).label;
    }
  };
})();
