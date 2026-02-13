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

export const MAIL_FROM =
  ENV_MAIL_FROM ||
  (SMTP_USER
    ? `Bermuda Vendégház <${SMTP_USER}>`
    : "Bermuda Vendégház <no-reply@bermuda.hu>");

export const MAIL_ADMIN =
  ENV_MAIL_ADMIN || SMTP_USER || "bermudavendeghazvese@gmail.com";

if (process.env.NODE_ENV === "production" && !ENV_MAIL_ADMIN && !SMTP_USER) {
  console.warn(
    "⚠️ [mailer] PRODUCTION: MAIL_ADMIN nincs beállítva (MAIL_ADMIN / SMTP_USER hiányzik). Admin emailek nem fognak menni!",
  );
}

const APP_URL = String(ENV_APP_URL || "").replace(/\/$/, "");


const PAYMENT_DETAILS = {
  beneficiary: "Bermuda Vendégház",
  bankName: "MBH Bank Nyrt.",
  accountNumber: "50466113-10001356-00000000",
  iban: "HU89 5046 6113 1000 1356 0000 0000",
  swift: "MKKBHUHB",
};

const googleUrl =
  process.env.REVIEW_GOOGLE_URL || "https://example.com/google-review";

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

const normalizeRecipients = (to) => {
  // támogatja: string, tömb, "a@a.com, b@b.com" / "a@a.com; b@b.com"
  const arr = Array.isArray(to) ? to : [to];
  return arr
    .flatMap((x) =>
      String(x || "")
        .split(/[;,]/g)
        .map((p) => p.trim()),
    )
    .filter(Boolean);
};

const emailEq = (a, b) =>
  String(a || "")
    .trim()
    .toLowerCase() ===
  String(b || "")
    .trim()
    .toLowerCase();

const ADMIN_ADDRESSES = [MAIL_ADMIN, ENV_MAIL_ADMIN, SMTP_USER].filter(Boolean);

// ✅ ÚJ: kind = "guest" | "admin" | "system"
export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
  kind = "system",
}) {
  const raw = normalizeRecipients(to);

  let valid = raw
    .map((x) => String(x || "").trim())
    .filter((x) => isValidEmail(x));

  // ✅ Vendég levélből kivágjuk az admin címeket (akkor is, ha véletlenül bekerültek)
  if (kind === "guest") {
    valid = valid.filter(
      (addr) => !ADMIN_ADDRESSES.some((a) => emailEq(a, addr)),
    );
  }

  // ✅ Admin levélből kivágjuk a vendég címeket nem tudjuk, de legalább legyen valid
  // (itt nem szűrünk semmit, csak validálunk)

  if (valid.length === 0) {
    console.warn("⚠️ sendMail skipped (no valid recipient after filters):", {
      to,
      subject,
      kind,
    });
    return null;
  }

  // Debug (hasznos, hogy lásd hova megy)
  console.log("📮 sendMail:", { kind, to: valid, subject });

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: valid.length === 1 ? valid[0] : valid,
    subject,
    text,
    html,
    replyTo: replyTo || MAIL_ADMIN,
  });

  if (info?.message) {
    console.log("📧 Mail (dev):\n" + info.message.toString());
  } else {
    console.log("📨 Mail sent via SMTP →", {
      kind,
      to: valid,
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
      subjectGuestReview: (code) =>
        `Köszönjük, hogy nálunk szállt meg! ⭐ - ${code}`,

      titlePending: "Foglalás visszaigazolás",
      titleConfirmed: "Foglalás elfogadva",
      titlePaid: "Foglalás fizetve",
      titleCancelled: "Foglalás elutasítva",

      nextStepsOnsite:
        "Fizetés a helyszínen történik. A foglalásod visszaigazolásáról hamarosan emailben értesítünk.",
      nextStepsTransfer:
        "Előreutalás választva. A foglalás visszaigazolásában emailben küldjük a pontos utalási adatokat és a további teendőket.",

      confirmedOnsite:
        "A foglalásodat elfogadtuk. Fizetés a helyszínen történik.",
      confirmedTransferIntro:
        "Örömmel visszaigazoljuk a foglalásodat! 😊 Kérjük, az alábbi adatok alapján utald a szállásdíjat:",

      paidMsg:
        "✅ Köszönjük, az összeg megérkezett. A foglalásod fizetett státuszba került — várunk szeretettel a megérkezéskor!",

      cancelledMsg:
        "Sajnáljuk, de a kiválasztott időszakra a foglalást nem tudjuk visszaigazolni. Kérjük, válassz másik dátumot, vagy vedd fel velünk a kapcsolatot — szívesen segítünk alternatívát találni.",

      transferDetailsTitle: "Utalási adatok",
      beneficiary: "Kedvezményezett",
      bankName: "Bank",
      accountNumber: "Bankszámlaszám",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Közlemény",
      referenceHint:
        "Kérjük, a közleményben mindenképp tüntesd fel a foglalási kódot.",

      method: { onsite: "Helyszínen", transfer: "Banki előreutalás" },

      // Admin actions
      adminActions: "Műveletek:",
      adminConfirm: "Elfogadom",
      adminCancel: "Elutasítom / törlöm",
      adminPaid: "Megjött az utalás",
      adminLinkSingleUse: "(A link egyszer használatos.)",
      adminActionsMissing: "APP_URL vagy token hiányzik (nem készültek linkek)",

      // Review request
      reviewGreeting: "Szia!",
      reviewThanks: `Köszönjük, hogy a Bermuda Vendégházat választottad.`,
      reviewRequest: "Ha van 1 perced, nagyon örülnénk egy rövid értékelésnek:",
      reviewWebsite: "Weboldalon:",
      reviewGoogle: "Google:",
      reviewThanks2: "Köszi szépen!",
      reviewSignature: "Bermuda Vendégház",
    },
    en: {
      subjectGuest: (code) => `Booking received – ${code}`,
      subjectAdmin: (code) => `New booking – ${code}`,
      subjectGuestConfirmed: (code) => `Booking confirmed – ${code}`,
      subjectGuestPaid: (code) => `Booking paid – ${code}`,
      subjectGuestCancelled: (code) => `Booking declined – ${code}`,
      subjectGuestReview: (code) =>
        `Thank you for staying with us! ⭐ - ${code}`,

      titlePending: "Booking confirmation",
      titleConfirmed: "Booking confirmed",
      titlePaid: "Booking paid",
      titleCancelled: "Booking declined",

      nextStepsOnsite:
        "Payment will be made on site. We'll confirm your booking shortly via email.",
      nextStepsTransfer:
        "Bank transfer selected. The payment details and next steps will be sent in the booking confirmation email.",

      confirmedOnsite:
        "Your booking has been confirmed. Payment will be made on site.",
      confirmedTransferIntro:
        "We're happy to confirm your booking! 😊 Please use the following details to complete the bank transfer:",

      paidMsg:
        "✅ Thank you — we've received your payment. Your booking is now marked as paid, and we look forward to welcoming you!",

      cancelledMsg:
        "We're sorry, but we're unable to confirm your booking for the selected dates. Please choose different dates, or contact us — we'll be happy to help you find an alternative.",

      transferDetailsTitle: "Bank transfer details",
      beneficiary: "Beneficiary",
      bankName: "Bank",
      accountNumber: "Account number",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Reference",
      referenceHint:
        "Please make sure to include the booking code in the transfer reference.",

      method: { onsite: "On site", transfer: "Bank transfer" },

      // Admin actions
      adminActions: "Actions:",
      adminConfirm: "Accept",
      adminCancel: "Decline / Delete",
      adminPaid: "Payment received",
      adminLinkSingleUse: "(This link is single-use.)",
      adminActionsMissing: "APP_URL or token missing (no links created)",

      // Review request
      reviewGreeting: "Hi!",
      reviewThanks: "Thank you for choosing Bermuda Vendégház.",
      reviewRequest:
        "If you have a minute, we'd really appreciate a short review:",
      reviewWebsite: "Website:",
      reviewGoogle: "Google:",
      reviewThanks2: "Thanks a lot!",
      reviewSignature: "Bermuda Vendégház",
    },
    de: {
      subjectGuest: (code) => `Buchung eingegangen – ${code}`,
      subjectAdmin: (code) => `Neue Buchung – ${code}`,
      subjectGuestConfirmed: (code) => `Buchung bestätigt – ${code}`,
      subjectGuestPaid: (code) => `Buchung bezahlt – ${code}`,
      subjectGuestCancelled: (code) => `Buchung abgelehnt – ${code}`,
      subjectGuestReview: (code) =>
        `Vielen Dank für Ihren Aufenthalt bei uns! ⭐ - ${code}`,

      titlePending: "Buchungsbestätigung",
      titleConfirmed: "Buchung bestätigt",
      titlePaid: "Buchung bezahlt",
      titleCancelled: "Buchung abgelehnt",

      nextStepsOnsite:
        "Die Zahlung erfolgt vor Ort. Die Bestätigung Ihrer Buchung senden wir Ihnen in Kürze per E-Mail.",
      nextStepsTransfer:
        "Überweisung gewählt. Die Zahlungsdaten und weiteren Schritte senden wir Ihnen mit der Buchungsbestätigung per E-Mail.",

      confirmedOnsite:
        "Ihre Buchung wurde bestätigt. Die Zahlung erfolgt vor Ort.",
      confirmedTransferIntro:
        "Wir freuen uns, Ihre Buchung zu bestätigen! 😊 Bitte überweisen Sie den Betrag anhand der folgenden Daten:",

      paidMsg:
        "✅ Vielen Dank — der Betrag ist eingegangen. Ihre Buchung ist nun als bezahlt markiert. Wir freuen uns auf Ihre Anreise!",

      cancelledMsg:
        "Leider können wir Ihre Buchung für den ausgewählten Zeitraum nicht bestätigen. Bitte wählen Sie andere Daten oder kontaktieren Sie uns — wir helfen Ihnen gerne, eine Alternative zu finden.",

      transferDetailsTitle: "Überweisungsdaten",
      beneficiary: "Begünstigter",
      bankName: "Bank",
      accountNumber: "Kontonummer",
      iban: "IBAN",
      swift: "SWIFT / BIC",
      reference: "Verwendungszweck",
      referenceHint:
        "Bitte geben Sie im Verwendungszweck unbedingt den Buchungscode an.",

      method: { onsite: "Vor Ort", transfer: "Überweisung" },

      // Admin actions
      adminActions: "Aktionen:",
      adminConfirm: "Akzeptieren",
      adminCancel: "Ablehnen / Löschen",
      adminPaid: "Zahlung erhalten",
      adminLinkSingleUse: "(Dieser Link ist einmalig verwendbar.)",
      adminActionsMissing: "APP_URL oder Token fehlt (keine Links erstellt)",

      // Review request
      reviewGreeting: "Hallo!",
      reviewThanks:
        "Vielen Dank, dass Sie sich für das Bermuda Vendégház entschieden haben.",
      reviewRequest:
        "Wenn Sie eine Minute Zeit haben, würden wir uns über eine kurze Bewertung freuen:",
      reviewWebsite: "Webseite:",
      reviewGoogle: "Google:",
      reviewThanks2: "Vielen Dank!",
      reviewSignature: "Bermuda Vendégház",
    },
  };
  return dict[L] || dict.hu;
};

const buildReference = (b) => {
  const code = b?.code || "";
  const name = (b?.customer?.name || "").trim();
  return name ? `${code} – ${name}` : code;
};

const paymentMethodHu = (booking) => {
  const method = booking?.payment?.method;
  const isTransfer =
    method === "transfer" || booking?.payment?.transferRequested === true;

  if (method === "onsite") return "Helyszínen";
  if (isTransfer) return "Előre utalással";
  return "—";
};

const fmtDate = (d) => {
  const dt = d ? new Date(d) : null;
  if (!dt || !Number.isFinite(dt.getTime())) return "—";
  return dt.toLocaleDateString("hu-HU");
};

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

  const adminToken = String(opts.adminToken || "").trim();
  const canShowActions = !!(APP_URL && adminToken && b?.code);

  const makeAdminActionUrl = (action) => {
    // ha a backend route-od: /api/admin/bookings/action
    const u = new URL("/api/admin/bookings/action", APP_URL);
    u.searchParams.set("code", b.code);
    u.searchParams.set("action", action);
    u.searchParams.set("token", adminToken);
    return u.toString();
  };

  const confirmUrl = canShowActions ? makeAdminActionUrl("confirm") : "";
  const cancelUrl  = canShowActions ? makeAdminActionUrl("cancel") : "";
  const paidUrl    = canShowActions && isTransfer ? makeAdminActionUrl("paid") : "";

  const actionsHtml = canShowActions
    ? `
    <div style="margin:16px 0 6px;font-weight:bold;">${L.adminActions}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <a href="${confirmUrl}"
         style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        ✅ ${L.adminConfirm}
      </a>

      <a href="${cancelUrl}"
         style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        ❌ ${L.adminCancel}
      </a>

      ${
        isTransfer
          ? `<a href="${paidUrl}"
         style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:bold;">
        💰 ${L.adminPaid}
      </a>`
          : ""
      }
    </div>
    <div style="color:#666;font-size:12px;margin-bottom:6px;">
      ${L.adminLinkSingleUse}
    </div>
  `
    : `
    <div style="margin:16px 0 6px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:10px;">
      ⚠️ ${L.adminActionsMissing}
    </div>
  `;

  const actionsText = canShowActions
    ? `
${L.adminActions} (linkek):
- ${L.adminConfirm}: ${confirmUrl}
- ${L.adminCancel}: ${cancelUrl}
${isTransfer ? `- ${L.adminPaid}: ${paidUrl}` : ""}
${L.adminLinkSingleUse}
`
    : `
${L.adminActions}: ${L.adminActionsMissing}
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
          b.checkIn,
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total,
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
        Bermuda Vendégház • Vése, Zrínyi u. 1, 8721 
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
        PAYMENT_DETAILS.beneficiary,
      )}</strong></div>
      <div><span style="color:#666">${L.bankName}:</span> <strong>${escapeHtml(
        PAYMENT_DETAILS.bankName,
      )}</strong></div>
      <div><span style="color:#666">${
        L.accountNumber
      }:</span> <strong>${escapeHtml(
        PAYMENT_DETAILS.accountNumber,
      )}</strong></div>
      <div><span style="color:#666">${L.iban}:</span> <strong>${escapeHtml(
        PAYMENT_DETAILS.iban,
      )}</strong></div>
      <div><span style="color:#666">${L.swift}:</span> <strong>${escapeHtml(
        PAYMENT_DETAILS.swift,
      )}</strong></div>
      <div style="margin-top:8px;"><span style="color:#666">${
        L.reference
      }:</span> <strong>${escapeHtml(reference)}</strong></div>
      <div style="margin-top:6px;color:#666;font-size:12px;">${escapeHtml(
        L.referenceHint,
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
          b.checkIn,
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total,
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
        Bermuda Vendégház • Vése, Zrínyi u. 1, 8721 
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
          b.checkIn,
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total,
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
        Bermuda Vendégház • Vése, Zrínyi u. 1, 8721 
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
          b.checkIn,
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
        Bermuda Vendégház • Vése, Zrínyi u. 1, 8721 
      </div>
    </div>
  </body>
</html>`;

  const adminText = `Új foglalás érkezett
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

Foglaló:
- Név: ${b?.customer?.name || "-"}
- Email: ${b?.customer?.email || "-"}

Fizetés módja: ${paymentMethodHu(b)}

Szobák:
${roomsListText}

Megjegyzés:
${b?.customer?.note || "-"}

${actionsText}
`;

  const guestReviewText = `${L.reviewGreeting}
  
  ${L.reviewThanks}
  ${L.reviewRequest}
  
  ${opts.reviewUrl ? `${L.reviewWebsite} ${opts.reviewUrl}` : ""}
  ${L.reviewGoogle} ${googleUrl}
  
  ${L.reviewThanks2}
  ${L.reviewSignature}`;

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
          b.checkIn,
        )} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 8px;">Vendégek: <strong>${
          b.guestsTotal
        } fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${Number(
          total,
        ).toLocaleString("hu-HU")} Ft</strong></p>

        <div style="margin:12px 0 6px;font-weight:bold;">Foglaló:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          <li>Név: ${escapeHtml(b?.customer?.name || "-")}</li>
          <li>Email: ${escapeHtml(b?.customer?.email || "-")}</li>
        </ul>

        <div style="margin:12px 0 6px;font-weight:bold;">Fizetés módja:</div>
        <div><strong>${escapeHtml(paymentMethodHu(b))}</strong></div>

        ${actionsHtml}

        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${roomsListHtml}
        </ul>

        <div style="margin:12px 0 6px;font-weight:bold;">Megjegyzés:</div>
        <div style="white-space:pre-wrap">${safeNote}</div>
      </div>

      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • Vése, Zrínyi u. 1, 8721 
      </div>
    </div>
  </body>
</html>`;

  const guestReviewHtml = `<p>${L.reviewGreeting}</p>
  <p>${L.reviewThanks.replace("Bermuda Vendégház", "<strong>Bermuda Vendégház</strong>")}<br/>
  ${L.reviewRequest}</p>
  
  <p>
    ${
      opts.reviewUrl
        ? `<a href="${opts.reviewUrl}" target="_blank" rel="noopener noreferrer">⭐ ${L.reviewWebsite.replace(":", "")}</a><br/>`
        : ""
    }
    <a href="${googleUrl}" target="_blank" rel="noopener noreferrer">⭐ ${L.reviewGoogle.replace(":", "")}</a>
  </p>
  
  <p>${L.reviewThanks2}<br/>${L.reviewSignature}</p>`;

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
      subject: L.subjectGuestReview(b.code),
      text: guestReviewText,
      html: guestReviewHtml,
    },
  };
}
