/* Pure helpers (also used by the Node tests in README) ------------------ */
function isNum(v) { return typeof v === "number" && isFinite(v) && v >= 0; }

function calcEstimate(service, sqft) {
  if (!service) return { ok: false, reason: "Choose a service." };
  if (service.mode === "flat") {
    if (!isNum(service.flatPrice)) return { ok: false, reason: "Price to be confirmed." };
    return { ok: true, total: service.flatPrice, note: "Fixed price for this service." };
  }
  const area = Number(sqft);
  if (!isFinite(area) || area <= 0) return { ok: false, reason: "Enter the property size in square feet." };
  if (!isNum(service.rate)) return { ok: false, reason: "Rate to be confirmed. We will quote you after booking." };
  const raw = service.rate * area;
  const min = isNum(service.minCharge) ? service.minCharge : 0;
  return { ok: true, total: Math.max(raw, min), note: raw < min ? "Minimum charge applied." : "Rate x square feet." };
}

function buildWhatsAppUrl(cfg, d) {
  const lines = [
    "Hello " + cfg.brand.name + ", I would like to book a cleaning.",
    "Name: " + d.name, "Phone: " + d.phone, "Address: " + d.address,
    "Service: " + d.service, "Property size: " + d.size + " sq ft",
    "Preferred date: " + d.date,
"Payment method: " + d.paymentMethod,
...(d.transactionId ? ["Transaction ID: " + d.transactionId] : [])
  ];
  return "https://wa.me/" + cfg.whatsapp.number + "?text=" + encodeURIComponent(lines.join("\n"));
}

function formatMoney(cfg, n) { return cfg.currency + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function priceLabel(cfg, s) {
  if (s.mode === "flat") return isNum(s.flatPrice) ? formatMoney(cfg, s.flatPrice) + " per job" : "Price to be confirmed";
  return isNum(s.rate) ? formatMoney(cfg, s.rate) + " per sq ft" : "Rate to be confirmed";
}

if (typeof module !== "undefined") module.exports = { calcEstimate, buildWhatsAppUrl, priceLabel, formatMoney };

/* Browser UI -------------------------------------------------------------- */
if (typeof document !== "undefined") (function (cfg) {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  document.title = cfg.brand.name + " | " + cfg.brand.tagline;
  document.querySelectorAll("[data-brand]").forEach((e) => (e.textContent = cfg.brand.name));
  $("#tagline").textContent = cfg.brand.tagline;
  $("#phoneLink").textContent = cfg.contact.phoneDisplay;
  $("#phoneLink").href = "tel:" + cfg.contact.phoneDisplay.replace(/[^\d+]/g, "");
  $("#emailLink").textContent = cfg.contact.email;
  $("#emailLink").href = "mailto:" + cfg.contact.email;
  $("#addr").textContent = cfg.contact.address;
  $("#hours").textContent = cfg.contact.hours;
  $("#year").textContent = new Date().getFullYear();
  $("#trust").innerHTML = cfg.trust.map((t) => "<li>" + esc(t) + "</li>").join("");
  $("#serviceGrid").innerHTML = cfg.services.map((s) =>
    '<article class="card"><span class="ico" aria-hidden="true">' + s.icon + "</span><h3>" + esc(s.name) +
    "</h3><p>" + esc(s.desc) + '</p><p class="price' + (priceLabel(cfg, s).includes("confirmed") ? " tbc" : "") + '">' +
    esc(priceLabel(cfg, s)) + '</p>
'<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px">' +
'<a class="btn ghost" href="#book" data-pick="' + esc(s.id) + '">Book this</a>' +
'<a class="btn" href="' + esc(s.id) + '.html">Details</a></div></article>').join("");
  const opts = cfg.services.map((s) => '<option value="' + esc(s.id) + '">' + esc(s.name) + "</option>").join("");
  $("#calcService").innerHTML = opts;
  
  $("#service").innerHTML = '<option value="">Select a service</option>' + opts;
try {
  const selectedService = sessionStorage.getItem("selectedService");

  if (selectedService && cfg.services.some((s) => s.id === selectedService)) {
    $("#service").value = selectedService;
    sessionStorage.removeItem("selectedService");
  }
} catch (e) {}

  const byId = (id) => cfg.services.find((s) => s.id === id);

const paymentMethod = $("#paymentMethod");

  if (paymentMethod) {
function updatePaymentDetails() {
  const method = paymentMethod.value;
  const details = $("#paymentDetails");
  const number = $("#paymentNumber");
  const amount = $("#paymentAmount");
  const transactionId = $("#transactionId");

  const prepaid = method === "bkash" || method === "nagad";
  details.hidden = !prepaid;
  transactionId.required = prepaid;

  if (method === "bkash") {
    number.textContent =
      "Please send money to this bKash number: " +
      cfg.payment.bkashNumber +
      ". After payment, enter your Transaction ID below.";
  } else if (method === "nagad") {
    number.textContent =
      "Please send money to this Nagad number: " +
      cfg.payment.nagadNumber +
      ". After payment, enter your Transaction ID below.";
  } else {
    number.textContent = "";
    amount.textContent = "";
    transactionId.value = "";
    return;
  }

  const service = byId($("#service").value);
  const result = calcEstimate(service, $("#size").value);

  if (!result.ok) {
    amount.textContent = result.reason;
    return;
  }

  const discount = result.total * 0.10;
  const total = result.total - discount;

  amount.textContent =
    "Regular price: " + formatMoney(cfg, result.total) +
    " | Prepaid discount (10%): -" + formatMoney(cfg, discount) +
    " | Total amount to pay: " + formatMoney(cfg, total);
}
    paymentMethod.addEventListener("change", updatePaymentDetails);
$("#service").addEventListener("change", updatePaymentDetails);
$("#size").addEventListener("input", updatePaymentDetails);
updatePaymentDetails();
function updateCalc() {
  const s = byId($("#calcService").value);
  $("#calcSqftWrap").hidden = s && s.mode === "flat";

  const r = calcEstimate(s, $("#calcSqft").value);
  const out = $("#calcResult");
  out.classList.toggle("tbc", !r.ok);

  if (!r.ok) {
    out.innerHTML =
      "<strong>" + esc(r.reason) +
      "</strong><span>No price is shown until a rate is set.</span>";
    return;
  }

  const method = $("#calcPaymentMethod").value;
  const discount = method === "cash" ? 0 : r.total * 0.10;
  const finalTotal = r.total - discount;

  out.innerHTML =
    "<strong>" + esc(formatMoney(cfg, finalTotal)) + "</strong>" +
    (discount > 0
      ? "<span>Regular price: " + esc(formatMoney(cfg, r.total)) +
        "<br>Prepaid discount (10%): -" +
        esc(formatMoney(cfg, discount)) +
        "<br>Estimate after discount. " + esc(r.note) +
        " Final price confirmed by us.</span>"
      : "<span>No discount. Estimate only. " + esc(r.note) +
        " Final price confirmed by us.</span>");
}
["#calcService", "#calcSqft", "#calcPaymentMethod"].forEach((q) =>
  $(q).addEventListener("input", updateCalc)
);

$("#calcBook").addEventListener("click", () => {
  $("#service").value = $("#calcService").value;

  if ($("#calcSqft").value) {
    $("#size").value = $("#calcSqft").value;
  }

  $("#paymentMethod").value = $("#calcPaymentMethod").value;
  $("#paymentMethod").dispatchEvent(new Event("change"));
});
  }
  document.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) $("#service").value = p.dataset.pick;
  });

  $("#date").min = new Date().toISOString().slice(0, 10);
  if (!cfg.whatsapp.configured) $("#waNotice").hidden = false;
  const emailReady = !!cfg.emailForm.accessKey;
  $("#emailBtn").disabled = !emailReady;
  $("#emailNote").textContent = emailReady ? "" : "Email delivery is not set up yet. Use WhatsApp to book.";

  function getData() {
    const f = $("#bookForm");
    if (!f.reportValidity()) return null;
    const s = byId($("#service").value);

    return {
      name: $("#name").value.trim(),
      phone: $("#phone").value.trim(),
      address: $("#address").value.trim(),
      service: s ? s.name : "",
      size: $("#size").value,
      date: $("#date").value,
      paymentMethod: $("#paymentMethod").value === "cash"
        ? "Cash on Service"
        : $("#paymentMethod").value === "bkash"
          ? "bKash Prepayment"
          : "Nagad Prepayment",
      transactionId: $("#transactionId").value.trim()
    };
    }
  const status = (msg, bad) => { const el = $("#status"); el.textContent = msg; el.className = bad ? "err" : "ok"; };

  $("#waBtn").addEventListener("click", () => {
    const d = getData(); if (!d) return;
    window.open(buildWhatsAppUrl(cfg, d), "_blank", "noopener");
    status("WhatsApp opened with your details. Press send in WhatsApp to complete the booking request.");
  });

  $("#emailBtn").addEventListener("click", async () => {
    const d = getData(); if (!d) return;
    $("#emailBtn").disabled = true; status("Sending...");
    try {
      const res = await fetch(cfg.emailForm.endpoint, { method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: cfg.emailForm.accessKey, subject: "New cleaning booking: " + d.service,
          from_name: cfg.brand.name, name: d.name, phone: d.phone, address: d.address, service: d.service,
          property_size_sqft: d.size, preferred_date: d.date }) });
      const j = await res.json();
      if (res.ok && j.success) { status("Booking request sent. We will contact you to confirm."); $("#bookForm").reset(); }
      else status("Could not send your request. Please use WhatsApp or call us.", true);
    } catch (err) { status("Could not send your request. Please use WhatsApp or call us.", true); }
    $("#emailBtn").disabled = false;
  });

  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") { nav.classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false"); } });
})(SITE_CONFIG);
