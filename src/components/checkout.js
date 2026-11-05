/* ==========================================================================
   CHECKOUT & WHATSAPP ORDER FLOW — sanitizes all inputs via textContent,
   validates Lebanese phone numbers, builds a clean Arabic WhatsApp message,
   opens wa.me/<STORE_NUMBER>, and displays the animated tracking timeline.
   ========================================================================== */
(function () {
  "use strict";
  const AT = (window.AT = window.AT || {});
  const CFG = window.AT_CONFIG;
  const { $, $$, h } = AT.dom;
  const { money } = AT.fmt;

  function syncZones() {
    const sel = $("#co-zone");
    if (!sel) return;
    const active = AT.store.get().zone;
    sel.innerHTML = "";
    AT.catalog.zones.forEach((z) => {
      const opt = h("option", { value: z.id }, `${z.name} (${z.eta})`);
      if (z.id === active) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function open() {
    const sum = AT.store.summary();
    if (sum.count === 0) {
      AT.toast.show("سلتك فاضية! ضيف كم غرض بالأول.", { icon: "basket" });
      return;
    }
    const dlg = $("#checkout");
    if (!dlg) return;
    syncZones();
    AT.cart.renderTotals($("#checkout-totals"), sum, AT.store.get().currency);
    if (!dlg.open) dlg.showModal();
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
  }

  function close() {
    const dlg = $("#checkout");
    if (dlg && dlg.open) dlg.close();
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
  }

  function buildWhatsAppMessage(order) {
    const lines = [
      `*طلب جديد — سوبرماركت ${CFG.STORE_NAME} (طرابلس)*`,
      `رقم الطلب: ${order.id}`,
      `────────────────`,
      `*الزبون:* ${order.name}`,
      `*الهاتف:* ${order.phoneIntl}`,
      `*المنطقة:* ${order.zoneName} (${order.eta})`,
      `*العنوان:* ${order.address}`
    ];
    if (order.notes) lines.push(`*ملاحظات:* ${order.notes}`);
    lines.push(`*طريقة الدفع:* ${order.pay}`);
    lines.push(`────────────────`);
    lines.push(`*المشتريات:*`);
    order.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name} (${it.variant}) × ${it.qty} = ${money(it.totalUSD, "USD")} (${money(it.totalUSD, "LBP")})`);
    });
    lines.push(`────────────────`);
    lines.push(`المجموع الفرعي: ${money(order.subtotalUSD, "USD")} (${money(order.subtotalUSD, "LBP")})`);
    if (order.discountUSD > 0) {
      lines.push(`خصم الكوبون (${order.coupon}): −${money(order.discountUSD, "USD")}`);
    }
    lines.push(`رسوم التوصيل: ${order.feeUSD === 0 ? "مجاناً" : `${money(order.feeUSD, "USD")} (${money(order.feeUSD, "LBP")})`}`);
    lines.push(`*الإجمالي المطلوب:* ${money(order.totalUSD, "LBP")} (${money(order.totalUSD, "USD")})`);
    return lines.join("\n");
  }

  function showSuccess(order, waUrl) {
    const dlg = $("#success");
    if (!dlg) return;
    const art = $("#success-art");
    if (art) art.innerHTML = AT.art.scooter();
    const idEl = $("#success-order-id");
    if (idEl) idEl.textContent = order.id;
    const noteEl = $("#success-note");
    if (noteEl) noteEl.textContent = `التوصيل إلى ${order.zoneName} خلال ${order.eta} تقريباً.`;
    const waBtn = $("#success-wa");
    if (waBtn) waBtn.href = waUrl;

    const steps = $$("#timeline li");
    steps.forEach((li) => li.classList.remove("is-done"));
    steps.forEach((li, idx) => {
      setTimeout(() => li.classList.add("is-done"), 180 + idx * 520);
    });

    if (!dlg.open) dlg.showModal();
    if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
    AT.ui.confetti(dlg);
  }

  function init() {
    const coDlg = $("#checkout");
    const sucDlg = $("#success");
    $$("[data-close-checkout]").forEach((b) => b.addEventListener("click", close));
    $$("[data-close-success]").forEach((b) => b.addEventListener("click", () => {
      sucDlg?.close();
      if (AT.ui && AT.ui.syncBodyLock) AT.ui.syncBodyLock();
    }));

    [coDlg, sucDlg].forEach((dlg) => {
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
    });

    const zoneSelect = $("#co-zone");
    if (zoneSelect) {
      zoneSelect.addEventListener("change", () => {
        AT.store.actions.setZone(zoneSelect.value);
        AT.cart.renderTotals($("#checkout-totals"), AT.store.summary(), AT.store.get().currency);
      });
    }

    const form = $("#checkout-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameIn = $("#co-name");
      const phoneIn = $("#co-phone");
      const addrIn = $("#co-address");
      const notesIn = $("#co-notes");
      const nameErr = $("#co-name-err");
      const phoneErr = $("#co-phone-err");
      const addrErr = $("#co-address-err");

      [nameIn, phoneIn, addrIn].forEach((el) => el && el.classList.remove("is-invalid"));
      [nameErr, phoneErr, addrErr].forEach((el) => { if (el) el.textContent = ""; });

      const name = (nameIn?.value || "").trim();
      const phoneNorm = AT.phone.normalize(phoneIn?.value || "");
      const address = (addrIn?.value || "").trim();
      const notes = (notesIn?.value || "").trim();

      let valid = true;
      if (name.length < 2) {
        valid = false;
        nameIn?.classList.add("is-invalid");
        if (nameErr) nameErr.textContent = "الرجاء إدخال الاسم الكريم.";
      }
      if (!phoneNorm) {
        valid = false;
        phoneIn?.classList.add("is-invalid");
        if (phoneErr) phoneErr.textContent = "أدخل رقم هاتف لبناني صحيح (مثال: 03123456 أو 70123456).";
      }
      if (address.length < 5) {
        valid = false;
        addrIn?.classList.add("is-invalid");
        if (addrErr) addrErr.textContent = "الرجاء كتابة الشارع والبناية والطابق ليوصل الشوفير بسرعة.";
      }
      if (!valid) return;

      const sum = AT.store.summary();
      if (sum.count === 0) return;

      const payRadio = form.querySelector('input[name="pay"]:checked');
      const orderId = "AT-" + String(Math.floor(100000 + Math.random() * 900000));

      const order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        name,
        phone: phoneNorm,
        phoneIntl: AT.phone.intl(phoneNorm),
        zoneId: sum.zone.id,
        zoneName: sum.zone.name,
        eta: sum.zone.eta,
        address,
        notes,
        pay: payRadio ? payRadio.value : "كاش بالليرة اللبنانية",
        coupon: AT.store.get().coupon,
        subtotalUSD: sum.subtotal,
        discountUSD: sum.discount,
        feeUSD: sum.fee,
        totalUSD: sum.total,
        lines: sum.lines.map((l) => ({ id: l.p.id, v: l.v.id, qty: l.qty })),
        items: sum.lines.map((l) => ({ name: l.p.name, variant: l.v.label, qty: l.qty, totalUSD: l.total }))
      };

      const msg = buildWhatsAppMessage(order);
      const waNumber = String(CFG.WHATSAPP_NUMBER || "").replace(/\D/g, "") || "9616220890";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

      AT.store.actions.saveLastOrder({ id: order.id, lines: order.lines });
      AT.store.actions.clearCart();
      close();

      window.open(waUrl, "_blank", "noopener");
      showSuccess(order, waUrl);
    });
  }

  AT.checkout = { init, open, close };
})();
