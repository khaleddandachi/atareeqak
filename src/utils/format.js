/* Currency formatting, Arabic fuzzy search, Beirut time and phone validation. */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const CFG = window.AT_CONFIG;

  /* ---------------------------- Money ---------------------------- */
  const rate = () => window.HARDCODED_EXCHANGE_RATE || 89900;
  const nf = new Intl.NumberFormat("en-US");

  function toLBP(usd) {
    const step = CFG.LBP_ROUNDING || 1000;
    return Math.round((usd * rate()) / step) * step;
  }
  /** Format a USD amount in the requested (or active) currency. Western digits. */
  function money(usd, cur) {
    cur = cur || (AT.store ? AT.store.get().currency : "LBP");
    if (cur === "USD") return "$" + (Math.round(usd * 100) / 100).toFixed(2);
    return nf.format(toLBP(usd)) + " ل.ل.";
  }
  const otherCur = (cur) => (cur === "USD" ? "LBP" : "USD");

  /* ----------------------- Arabic fuzzy search ----------------------- */
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // tashkeel
      .replace(/\u0640/g, "")                             // tatweel
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[ؤ]/g, "و")
      .replace(/[ئ]/g, "ي")
      .replace(/ء/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Levenshtein distance with early exit (small strings only). */
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        rowMin = Math.min(rowMin, cur[j]);
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  const indexCache = new Map();
  function indexOf(p) {
    if (!indexCache.has(p.id)) {
      const name = normalize(p.name);
      const all = normalize([p.name, p.brand, p.categoryLabel, p.unit, p.description, p.label || ""].join(" "));
      indexCache.set(p.id, { name, all, words: Array.from(new Set(all.split(" "))).filter((w) => w.length > 1) });
    }
    return indexCache.get(p.id);
  }

  /** Score a product against a query (0 = no match). Typo tolerant. */
  function score(p, query) {
    const q = normalize(query);
    if (!q) return 1;
    const idx = indexOf(p);
    let s = 0;
    if (idx.name.includes(q)) s += 100 - idx.name.indexOf(q);
    else if (idx.all.includes(q)) s += 40;
    const tokens = q.split(" ").filter(Boolean);
    let matched = 0;
    tokens.forEach((t) => {
      // tolerate missing "ال" prefix and plural-ish suffixes
      const t2 = t.replace(/^ال/, "");
      if (idx.all.includes(t) || (t2.length > 2 && idx.all.includes(t2))) { matched++; s += 12; return; }
      const max = t2.length >= 7 ? 2 : t2.length >= 4 ? 1 : 0;
      if (!max) return;
      const hit = idx.words.some((w) => {
        const w2 = w.replace(/^ال/, "");
        if (lev(t2, w2, max) <= max) return true;
        // typo inside a prefix of a longer word ("شوكو" ~ "شوكولاته")
        return w2.length > t2.length && lev(t2, w2.slice(0, t2.length), 1) <= 1;
      });
      if (hit) { matched++; s += 6; }
    });
    if (matched < tokens.length) return s >= 40 ? s : 0;
    return s;
  }

  function search(products, query, limit) {
    const res = products
      .map((p) => ({ p, s: score(p, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || b.p.reviews - a.p.reviews)
      .map((r) => r.p);
    return limit ? res.slice(0, limit) : res;
  }

  /* ----------------------- Beirut opening hours ----------------------- */
  function beirutNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: CFG.TIMEZONE, hour12: false, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }).formatToParts(new Date());
    const o = {};
    parts.forEach((x) => (o[x.type] = +x.value));
    if (o.hour === 24) o.hour = 0;
    return o; // { year, month, day, hour, minute, second }
  }
  /** { open, secondsToChange, label } computed from real Beirut time. */
  function storeStatus() {
    const t = beirutNow();
    const secOfDay = t.hour * 3600 + t.minute * 60 + t.second;
    const openS = CFG.OPEN_HOUR * 3600, closeS = CFG.CLOSE_HOUR * 3600;
    const open = secOfDay >= openS && secOfDay < closeS;
    const secondsToChange = open ? closeS - secOfDay : (secOfDay < openS ? openS - secOfDay : 86400 - secOfDay + openS);
    const label = open ? "مفتوح الآن" : (secOfDay < openS ? "مغلق، نفتح اليوم 7:00 صباحاً" : "مغلق، نفتح غداً 7:00 صباحاً");
    return { open, secondsToChange, label };
  }
  function hms(sec) {
    sec = Math.max(0, Math.floor(sec));
    const p = (n) => String(n).padStart(2, "0");
    return `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`;
  }

  /* ----------------------- Lebanese phone numbers ----------------------- */
  /** Returns normalized local number (e.g. "03123456", "70123456", "06123456") or null. */
  function normalizePhone(input) {
    let d = String(input || "").replace(/[\s\-().]/g, "");
    d = d.replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c)); // Arabic-Indic digits
    if (d.startsWith("+961")) d = d.slice(4);
    else if (d.startsWith("00961")) d = d.slice(5);
    else if (d.startsWith("961") && d.length >= 10) d = d.slice(3);
    if (!/^\d+$/.test(d)) return null;
    if (d.length === 7 && /^[1-9]/.test(d) && !/^7|^8/.test(d)) d = "0" + d; // 3xxxxxx / 6xxxxxx
    if (/^(03\d{6}|7[01689]\d{6}|81\d{6}|0[1456789]\d{6})$/.test(d)) return d;
    return null;
  }
  const phoneIntl = (local) => "+961 " + (local.startsWith("0") ? local.slice(1) : local);

  AT.fmt = { money, toLBP, otherCur, rate };
  AT.text = { normalize, search, score };
  AT.time = { storeStatus, hms, beirutNow };
  AT.phone = { normalize: normalizePhone, intl: phoneIntl };
})();
