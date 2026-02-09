import "dotenv/config";
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_ADMIN: ENV_MAIL_ADMIN,
  MAIL_FROM: ENV_MAIL_FROM,
  APP_URL: ENV_APP_URL,
} = process.env;

const MAIL_FROM =
  ENV_MAIL_FROM ||
  (SMTP_USER
    ? `Bermuda Vendégház <${SMTP_USER}>`
    : "Bermuda Vendégház <no-reply@bermuda.hu>");

const MAIL_ADMIN =
  ENV_MAIL_ADMIN || SMTP_USER || "bermudavendeghazvese@gmail.com";

const APP_URL = String(ENV_APP_URL || "").replace(/\/$/, "");

// ✅ FIX utalási adatok
const PAYMENT_DETAILS = {
  beneficiary: "Bermuda Vendégház",
  bankName: "MBH Bank Nyrt.",
  accountNumber: "50466113-10001356-00000000",
  iban: "HU89 5046 6113 1000 1356 0000 0000",
  swift: "MKKBHUHB",
};

const googleUrl =
  process.env.REVIEW_GOOGLE_URL || "https://example.com/google-review";
const szallasUrl =
  process.env.REVIEW_SZALLAS_URL || "https://example.com/szallas-review";

let transporter;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

const isValidEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

const fmtDate = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || !Number.isFinite(dt.getTime())) return "—";
  return dt.toLocaleDateString("hu-HU");
};

const getRoomName = (room) => {
  if (!room) return "Szoba";
  if (typeof room === "string") return room;

  if (room.name) {
    if (typeof room.name === "string") return room.name;
    if (room.name.hu) return room.name.hu;
    if (room.name.en) return room.name.en;
    if (room.name.de) return room.name.de;
  }

  return "Szoba";
};

export async function sendMail({ to, subject, text, html, replyTo }) {
  const finalTo = isValidEmail(to) ? to : MAIL_ADMIN;

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: finalTo,
    subject,
    text,
    html,
    replyTo: replyTo || MAIL_ADMIN,
  });

  if (info.message) {
    console.log("📧 Mail (dev):\n" + info.message.toString());
  } else {
    console.log("📨 Mail sent via SMTP →", {
      to: finalTo,
      subject,
      accepted: info.accepted,
      response: info.response,
    });
  }

  return info;
}

const tByLang = (lang = "hu") => {
  const L = (lang || "hu").toLowerCase();
  const dict = {
    hu: {
      subjectGuest: (code) => `Foglalás rögzítve – ${code}`,
      subjectAdmin: (code) => `Új foglalás – ${code}`,
      subjectGuestConfirmed: (code) => `Foglalás elfogadva – ${code}`,
      subjectGuestPaid: (code) => `Foglalás fizetve – ${code}`,
      subjectGuestCancelled: (code) => `Foglalás elutasítva – ${code}`,
      subjectGuestReview : (code) => `Köszönjük, hogy nálunk szállt meg! ⭐ - ${code}`,

      titlePending: "Foglalás visszaigazolás",
      titleConfirmed: "Foglalás elfogadva",
      titlePaid: "Foglalás fizetve",
      titleCancelled: "Foglalás elutasítva",

      nextStepsOnsite:
        "Fizetés a helyszínen. Hamarosan visszaigazolunk emailben.",
      nextStepsTransfer:
        "Előreutalás választva. A pontos utalási információkat és teendőket a visszaigazolásban küldjük.",

      confirmedOnsite:
        "A foglalásodat elfogadtuk. Fizetés a helyszínen történik.",
      confirmedTransferIntro:
        "A foglalásodat elfogadtuk. Kérjük, az alábbi adatok alapján utalj:",

      paidMsg: "✅ Fizetés megérkezett, a foglalás fizetett státuszba került.",

      cancelledMsg:
        "Sajnáljuk, a foglalásodat nem tudtuk elfogadni a kiválasztott időszakra. Kérjük, válassz másik dátumot, vagy írj nekünk és segítünk.",

      transferDetailsTitle: "Utalási adatok",
      beneficiary: "Kedvezményezett",
      bankName: "Bank",
      accountNumber: "Bankszámlaszám",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Közlemény",
      referenceHint:
        "Kérjük a közleménybe írd be a foglalási kódot (és nevet, ha szeretnéd).",

      method: { onsite: "Helyszínen", transfer: "Banki előreutalás" },
    },
    en: {
      subjectGuest: (code) => `Booking received – ${code}`,
      subjectAdmin: (code) => `New booking – ${code}`,
      subjectGuestConfirmed: (code) => `Booking confirmed – ${code}`,
      subjectGuestPaid: (code) => `Booking paid – ${code}`,
      subjectGuestCancelled: (code) => `Booking declined – ${code}`,
      subjectGuestReview: (code) => `Thank you for staying with us! ⭐ - ${code}`,

      titlePending: "Booking confirmation",
      titleConfirmed: "Booking confirmed",
      titlePaid: "Booking paid",
      titleCancelled: "Booking declined",

      nextStepsOnsite:
        "Payment on site. We’ll confirm your request via email soon.",
      nextStepsTransfer:
        "Bank transfer selected. We’ll send the transfer details and next steps in the confirmation email.",

      confirmedOnsite:
        "Your booking has been confirmed. Payment will be made on site.",
      confirmedTransferIntro:
        "Your booking has been confirmed. Please use the following bank transfer details:",

      paidMsg: "✅ Payment received — your booking is now marked as paid.",

      cancelledMsg:
        "Sorry — we couldn’t accept your booking for the selected dates. Please choose different dates, or contact us and we’ll help you.",

      transferDetailsTitle: "Bank transfer details",
      beneficiary: "Beneficiary",
      bankName: "Bank",
      accountNumber: "Account number",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Reference",
      referenceHint:
        "Please include the booking code in the reference (and name if you want).",

      method: { onsite: "On site", transfer: "Bank transfer" },
    },
    de: {
      subjectGuest: (code) => `Buchung eingegangen – ${code}`,
      subjectAdmin: (code) => `Neue Buchung – ${code}`,
      subjectGuestConfirmed: (code) => `Buchung bestätigt – ${code}`,
      subjectGuestPaid: (code) => `Buchung bezahlt – ${code}`,
      subjectGuestCancelled: (code) => `Buchung abgelehnt – ${code}`,
      subjectGuestReview : (code) => `Vielen Dank für Ihren Aufenthalt bei uns! ⭐ - ${code}`,

      titlePending: "Buchungsbestätigung",
      titleConfirmed: "Buchung bestätigt",
      titlePaid: "Buchung bezahlt",
      titleCancelled: "Buchung abgelehnt",

      nextStepsOnsite:
        "Zahlung vor Ort. Wir bestätigen die Anfrage bald per E-Mail.",
      nextStepsTransfer:
        "Überweisung gewählt. Die Zahlungsdaten und nächsten Schritte senden wir in der Bestätigung.",

      confirmedOnsite:
        "Ihre Buchung wurde bestätigt. Die Zahlung erfolgt vor Ort.",
      confirmedTransferIntro:
        "Ihre Buchung wurde bestätigt. Bitte überweisen Sie mit folgenden Daten:",

      paidMsg:
        "✅ Zahlung erhalten — Ihre Buchung ist nun als bezahlt markiert.",

      cancelledMsg:
        "Leider konnten wir Ihre Buchung für die ausgewählten Daten nicht annehmen. Bitte wählen Sie andere Daten oder kontaktieren Sie uns — wir helfen gerne weiter.",

      transferDetailsTitle: "Überweisungsdaten",
      beneficiary: "Begünstigter",
      bankName: "Bank",
      accountNumber: "Kontonummer",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Verwendungszweck",
      referenceHint:
        "Bitte geben Sie den Buchungscode im Verwendungszweck an (und Name, wenn Sie möchten).",

      method: { onsite: "Vor Ort", transfer: "Überweisung" },
    },
  };
  return dict[L] || dict.hu;
};

const buildReference = (b) => {
  const code = b?.code || "";
  const name = (b?.customer?.name || "").trim();
  return name ? `${code} – ${name}` : code;
};

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function bookingMailTemplates(b, opts = {}) {
  const lang = b?.customer?.lang || "hu";
  const L = tByLang(lang);

  const total = b?.price?.total ?? 0;
  const items = Array.isArray(b?.items) ? b.items : [];
  const payMethod =
    b?.payment?.method ||
    (b?.payment?.transferRequested ? "transfer" : "onsite");

  const isTransfer = payMethod === "transfer";

  const roomsListText = items
    .map((i) => ` - ${getRoomName(i.room)} — ${i.guests} fő`)
    .join("\n");

  const roomsListHtml = items
    .map((i) => `<li>${escapeHtml(getRoomName(i.room))} — ${i.guests} fő</li>`)
    .join("");

  // ✅ admin action links (email gombokhoz)
  const adminToken = String(opts.adminToken || "").trim();
  const canShowActions = !!(APP_URL && adminToken && b?.code);

  const confirmUrl = canShowActions
    ? `${APP_URL}/api/admin/bookings/action?code=${encodeURIComponent(
        b.code
      )}&action=confirm&token=${encodeURIComponent(adminToken)}`
    : "";

  const cancelUrl = canShowActions
    ? `${APP_URL}/api/admin/bookings/action?code=${encodeURIComponent(
        b.code
      )}&action=cancel&token=${encodeURIComponent(adminToken)}`
    : "";

  const paidUrl =
    canShowActions && isTransfer
      ? `${APP_URL}/api/admin/bookings/action?code=${encodeURIComponent(
          b.code
        )}&action=paid&token=${encodeURIComponent(adminToken)}`
      : "";

  const actionsHtml = canShowActions
    ? `
    <div style="margin:16px 0 6px;font-weight:bold;">Műveletek:</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <a href="${confirmUrl}"
         style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        ✅ Elfogadom
      </a>

      <a href="${cancelUrl}"
         style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        ❌ Elutasítom / törlöm
      </a>

      ${
        isTransfer
          ? `<a href="${paidUrl}"
         style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        💰 Megjött az utalás
      </a>`
          : ""
      }
    </div>
    <div style="color:#666;font-size:12px;margin-bottom:6px;">
      (A link egyszer használatos.)
    </div>
  `
    : `
    <div style="margin:16px 0 6px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:10px;">
      ⚠️ Admin gombok nem elérhetők (hiányzik az APP_URL vagy a token).
    </div>
  `;

  const actionsText = canShowActions
    ? `
MŰVELETEK (linkek):
- Elfogadom: ${confirmUrl}
- Elutasítom: ${cancelUrl}
${isTransfer ? `- Megjött az utalás: ${paidUrl}` : ""}
(A link egyszer használatos.)
`
    : `
MŰVELETEK: APP_URL vagy token hiányzik (nem készültek linkek)
`;

  // ✅ 1) vendég “pending” mail (azonnal)
  const guestText = `${L.titlePending}
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

Szobák:
${roomsListText}

${isTransfer ? L.nextStepsTransfer : L.nextStepsOnsite}
`;

  const guestHtml = `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">${L.titlePending}</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${
          b.code
        }</strong></div>
      </div>

      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 10px;">Időszak: <strong>${fmtDate(
          b.checkIn
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total
        ).toLocaleString("hu-HU")} Ft</strong></p>

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>

        <div style="margin-top:14px;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;color:#333;">
          ${isTransfer ? L.nextStepsTransfer : L.nextStepsOnsite}
        </div>
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  // ✅ utalási részletek (confirm mailhez)
  const reference = buildReference(b);

  const transferDetailsText = `${L.transferDetailsTitle}
${L.beneficiary}: ${PAYMENT_DETAILS.beneficiary}
${L.bankName}: ${PAYMENT_DETAILS.bankName}
${L.accountNumber}: ${PAYMENT_DETAILS.accountNumber}
${L.iban}: ${PAYMENT_DETAILS.iban}
${L.swift}: ${PAYMENT_DETAILS.swift}
${L.reference}: ${reference}
${L.referenceHint}
`;

  const transferDetailsHtml = `
  <div style="margin-top:12px;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;">
    <div style="font-weight:bold;margin-bottom:8px;">${
      L.transferDetailsTitle
    }</div>
    <div style="line-height:1.6;color:#111;">
      <div><span style="color:#666">${
        L.beneficiary
      }:</span> <strong>${escapeHtml(
    PAYMENT_DETAILS.beneficiary
  )}</strong></div>
      <div><span style="color:#666">${L.bankName}:</span> <strong>${escapeHtml(
    PAYMENT_DETAILS.bankName
  )}</strong></div>
      <div><span style="color:#666">${
        L.accountNumber
      }:</span> <strong>${escapeHtml(
    PAYMENT_DETAILS.accountNumber
  )}</strong></div>
      <div><span style="color:#666">${L.iban}:</span> <strong>${escapeHtml(
    PAYMENT_DETAILS.iban
  )}</strong></div>
      <div><span style="color:#666">${L.swift}:</span> <strong>${escapeHtml(
    PAYMENT_DETAILS.swift
  )}</strong></div>
      <div style="margin-top:8px;"><span style="color:#666">${
        L.reference
      }:</span> <strong>${escapeHtml(reference)}</strong></div>
      <div style="margin-top:6px;color:#666;font-size:12px;">${escapeHtml(
        L.referenceHint
      )}</div>
    </div>
  </div>
`;

  // ✅ 2) vendég “confirmed” mail (elfogadás után)
  const guestConfirmedText = `${L.titleConfirmed}
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

Szobák:
${roomsListText}

${isTransfer ? L.confirmedTransferIntro : L.confirmedOnsite}

${isTransfer ? transferDetailsText : ""}
`;

  const guestConfirmedHtml = `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">${L.titleConfirmed}</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${
          b.code
        }</strong></div>
      </div>

      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 10px;">Időszak: <strong>${fmtDate(
          b.checkIn
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total
        ).toLocaleString("hu-HU")} Ft</strong></p>

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>

        <div style="margin-top:14px;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;color:#333;">
          ${isTransfer ? L.confirmedTransferIntro : L.confirmedOnsite}
        </div>

        ${isTransfer ? transferDetailsHtml : ""}
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  // ✅ 3) vendég “paid” mail (paid után)
  const guestPaidText = `${L.titlePaid}
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

${L.paidMsg}

Szobák:
${roomsListText}
`;

  const guestPaidHtml = `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">${L.titlePaid}</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${
          b.code
        }</strong></div>
      </div>

      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 10px;">Időszak: <strong>${fmtDate(
          b.checkIn
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total
        ).toLocaleString("hu-HU")} Ft</strong></p>

        <div style="margin:14px 0;padding:12px;border:1px solid #bbf7d0;border-radius:10px;background:#f0fdf4;">
          ${escapeHtml(L.paidMsg)}
        </div>

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  // ✅ 4) vendég “cancelled” mail (elutasítás után)
  const guestCancelledText = `${L.titleCancelled}
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}

${L.cancelledMsg}

Szobák:
${roomsListText}
`;

  const guestCancelledHtml = `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">${L.titleCancelled}</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${
          b.code
        }</strong></div>
      </div>

      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 10px;">Időszak: <strong>${fmtDate(
          b.checkIn
        )} – ${fmtDate(b.checkOut)}</strong></p>

        <div style="margin:14px 0;padding:12px;border:1px solid #fecaca;border-radius:10px;background:#fef2f2;">
          ${escapeHtml(L.cancelledMsg)}
        </div>

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  // ✅ admin mail (csak új foglaláskor küldöd)
  const adminText = `Új foglalás érkezett
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

Foglaló:
- Név: ${b?.customer?.name || "-"}
- Email: ${b?.customer?.email || "-"}

Fizetés:
- Mód: ${payMethod}

Szobák:
${roomsListText}

Megjegyzés:
${b?.customer?.note || "-"}

${actionsText}
`;

const guestReviewText = `Szia!
  
  Köszönjük, hogy a Bermuda Vendégházat választottad.
  Ha van 1 perced, nagyon örülnénk egy rövid értékelésnek:
  
  Weboldalon: ${opts.reviewUrl || `${process.env.FRONTEND_URL || 'https://example.com'}/review/write?t=${opts.reviewToken}`}
  Google: ${googleUrl}
  Szállás.hu: ${szallasUrl}
  
  Köszi szépen!
  Bermuda Vendégház`;

  const safeNote = escapeHtml(b?.customer?.note || "-");

  const adminHtml = `<!doctype html>
<html lang="hu">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">Új foglalás</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${
          b.code
        }</strong></div>
      </div>

      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 8px;">Időszak: <strong>${fmtDate(
          b.checkIn
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 8px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total
        ).toLocaleString("hu-HU")} Ft</strong></p>

        <div style="margin:12px 0 6px;font-weight:bold;">Foglaló:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          <li>Név: ${escapeHtml(b?.customer?.name || "-")}</li>
          <li>Email: ${escapeHtml(b?.customer?.email || "-")}</li>
        </ul>

        <div style="margin:12px 0 6px;font-weight:bold;">Fizetés:</div>
        <div>Mód: <strong>${escapeHtml(payMethod)}</strong></div>

        ${actionsHtml}

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>

        <div style="margin:12px 0 6px;font-weight:bold;">Megjegyzés:</div>
        <div style="white-space:pre-wrap">${safeNote}</div>
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  const guestReviewHtml = `<p>Szia!</p>
  <p>Köszönjük, hogy a <strong>Bermuda Vendégházat</strong> választottad.<br/>
  Ha van 1 perced, nagyon örülnénk egy rövid értékelésnek:</p>
  
  <p>
    <a href="${opts.reviewUrl || `${process.env.FRONTEND_URL || 'https://example.com'}/review/write?t=${opts.reviewToken}`}" target="_blank" rel="noopener noreferrer">⭐ Weboldalon értékelés</a><br/>
    <a href="${googleUrl}" target="_blank" rel="noopener noreferrer">⭐ Google értékelés</a><br/>
    <a href="${szallasUrl}" target="_blank" rel="noopener noreferrer">⭐ Szállás.hu értékelés</a>
  </p>
  
  <p>Köszi szépen!<br/>Bermuda Vendégház</p>`;

  return {
    guest: {
      subject: L.subjectGuest(b.code),
      text: guestText,
      html: guestHtml,
    },

    guestConfirmed: {
      subject: L.subjectGuestConfirmed(b.code),
      text: guestConfirmedText,
      html: guestConfirmedHtml,
    },

    guestPaid: {
      subject: L.subjectGuestPaid(b.code),
      text: guestPaidText,
      html: guestPaidHtml,
    },

    guestCancelled: {
      subject: L.subjectGuestCancelled(b.code),
      text: guestCancelledText,
      html: guestCancelledHtml,
    },

    admin: {
      subject: L.subjectAdmin(b.code),
      text: adminText,
      html: adminHtml,
    },
    guestReviewRequest: {
      subject:L.subjectGuestReview(b.code),
      text: guestReviewText,
      html: guestReviewHtml,
    },
  };
}
