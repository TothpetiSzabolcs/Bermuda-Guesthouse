import "dotenv/config";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_ADMIN: ENV_MAIL_ADMIN,
  MAIL_FROM: ENV_MAIL_FROM,
  APP_URL: ENV_APP_URL,
  MAIL_LOGO_PATH: ENV_MAIL_LOGO_PATH,
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

// ----------------------
// ✅ LOGÓ (CID attachment)
// ----------------------
// Ajánlott: backend/assets/BV_logo.png
// Beállítható env-ből is: MAIL_LOGO_PATH=backend/assets/BV_logo.png (vagy abs path)
const DEFAULT_LOGO_CANDIDATES = [
  ENV_MAIL_LOGO_PATH, // ha beállítod
  path.resolve(process.cwd(), "backend/assets/BV_logo.png"),
  path.resolve(process.cwd(), "assets/BV_logo.png"),
  // ha monorepo és a backend mellett ott a frontend is:
  path.resolve(process.cwd(), "frontend/src/assets/BV_logo.png"),
].filter(Boolean);

const LOGO_CID = "bvlogo@bermuda";
const pickExistingPath = (cands) =>
  cands.find((p) => {
    try {
      return p && fs.existsSync(p);
    } catch {
      return false;
    }
  });

const LOGO_PATH = pickExistingPath(DEFAULT_LOGO_CANDIDATES);
if (!LOGO_PATH) {
  console.warn(
    "⚠️ [mailer] Logo not found. Tedd ide: backend/assets/BV_logo.png vagy állítsd be: MAIL_LOGO_PATH",
  );
} else {
  console.log("🖼️ [mailer] Logo path:", LOGO_PATH);
}

const getLogoAttachment = () => {
  if (!LOGO_PATH) return null;
  return {
    filename: "BV_logo.png",
    path: LOGO_PATH,
    cid: LOGO_CID,
  };
};

// ----------------------
// ✅ Üzleti adatok
// ----------------------
const BRAND = {
  name: "Bermuda Vendégház",
  address: "Vése, Zrínyi u. 1, 8721",
};

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

// ✅ ÚJ: attachments támogatás + egységes logo csatolás (ha van)
export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
  kind = "system",
  attachments = [],
}) {
  const raw = normalizeRecipients(to);

  let valid = raw
    .map((x) => String(x || "").trim())
    .filter((x) => isValidEmail(x));

  if (kind === "guest") {
    valid = valid.filter(
      (addr) => !ADMIN_ADDRESSES.some((a) => emailEq(a, addr)),
    );
  }

  if (valid.length === 0) {
    console.warn("⚠️ sendMail skipped (no valid recipient after filters):", {
      to,
      subject,
      kind,
    });
    return null;
  }

  console.log("📮 sendMail:", { kind, to: valid, subject });

  const logoAtt = getLogoAttachment();
  const mergedAttachments = [
    ...(logoAtt ? [logoAtt] : []),
    ...(Array.isArray(attachments) ? attachments : []),
  ];

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: valid.length === 1 ? valid[0] : valid,
    subject,
    text,
    html,
    replyTo: replyTo || MAIL_ADMIN,
    attachments: mergedAttachments,
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

// ----------------------
// ✅ Helper: i18n
// ----------------------
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

      adminActions: "Műveletek:",
      adminConfirm: "Elfogadom",
      adminCancel: "Elutasítom / törlöm",
      adminPaid: "Megjött az utalás",
      adminLinkSingleUse: "(A link egyszer használatos.)",
      adminActionsMissing: "APP_URL vagy token hiányzik (nem készültek linkek)",

      reviewGreeting: "Szia!",
      reviewThanks: `Köszönjük, hogy a Bermuda Vendégházat választottad.`,
      reviewRequest: "Ha van 1 perced, nagyon örülnénk egy rövid értékelésnek:",
      reviewWebsite: "Weboldalon:",
      reviewGoogle: "Google:",
      reviewThanks2: "Köszi szépen!",
      reviewSignature: "Bermuda Vendégház",

      // UI labels
      labelPeriod: "Időszak",
      labelGuests: "Vendégek",
      labelTotal: "Végösszeg",
      labelRooms: "Szobák",
      labelCode: "Foglalási kód",
      labelBooker: "Foglaló",
      labelNote: "Megjegyzés",
      labelPayment: "Fizetés módja",
      pillPending: "Rögzítve",
      pillConfirmed: "Elfogadva",
      pillPaid: "Fizetve",
      pillCancelled: "Elutasítva",
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

      adminActions: "Actions:",
      adminConfirm: "Accept",
      adminCancel: "Decline / Delete",
      adminPaid: "Payment received",
      adminLinkSingleUse: "(This link is single-use.)",
      adminActionsMissing: "APP_URL or token missing (no links created)",

      reviewGreeting: "Hi!",
      reviewThanks: "Thank you for choosing Bermuda Vendégház.",
      reviewRequest:
        "If you have a minute, we'd really appreciate a short review:",
      reviewWebsite: "Website:",
      reviewGoogle: "Google:",
      reviewThanks2: "Thanks a lot!",
      reviewSignature: "Bermuda Vendégház",

      labelPeriod: "Period",
      labelGuests: "Guests",
      labelTotal: "Total",
      labelRooms: "Rooms",
      labelCode: "Booking code",
      labelBooker: "Booker",
      labelNote: "Note",
      labelPayment: "Payment method",
      pillPending: "Received",
      pillConfirmed: "Confirmed",
      pillPaid: "Paid",
      pillCancelled: "Declined",
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

      adminActions: "Aktionen:",
      adminConfirm: "Akzeptieren",
      adminCancel: "Ablehnen / Löschen",
      adminPaid: "Zahlung erhalten",
      adminLinkSingleUse: "(Dieser Link ist einmalig verwendbar.)",
      adminActionsMissing: "APP_URL oder Token fehlt (keine Links erstellt)",

      reviewGreeting: "Hallo!",
      reviewThanks:
        "Vielen Dank, dass Sie sich für das Bermuda Vendégház entschieden haben.",
      reviewRequest:
        "Wenn Sie eine Minute Zeit haben, würden wir uns über eine kurze Bewertung freuen:",
      reviewWebsite: "Webseite:",
      reviewGoogle: "Google:",
      reviewThanks2: "Vielen Dank!",
      reviewSignature: "Bermuda Vendégház",

      labelPeriod: "Zeitraum",
      labelGuests: "Gäste",
      labelTotal: "Gesamt",
      labelRooms: "Zimmer",
      labelCode: "Buchungscode",
      labelBooker: "Bucher",
      labelNote: "Notiz",
      labelPayment: "Zahlungsart",
      pillPending: "Eingegangen",
      pillConfirmed: "Bestätigt",
      pillPaid: "Bezahlt",
      pillCancelled: "Abgelehnt",
    },
  };
  return dict[L] || dict.hu;
};

// ----------------------
// ✅ Utils
// ----------------------
const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const fmtDate = (d, lang = "hu") => {
  const dt = d ? new Date(d) : null;
  if (!dt || !Number.isFinite(dt.getTime())) return "—";
  const locale = lang === "en" ? "en-GB" : lang === "de" ? "de-DE" : "hu-HU";
  return dt.toLocaleDateString(locale);
};

const getRoomName = (room, lang = "hu") => {
  if (!room) return "Room";
  if (typeof room === "string") return room;

  if (room.name) {
    if (typeof room.name === "string") return room.name;
    if (lang === "hu" && room.name.hu) return room.name.hu;
    if (lang === "en" && room.name.en) return room.name.en;
    if (lang === "de" && room.name.de) return room.name.de;
    return room.name.hu || room.name.en || room.name.de || "Room";
  }

  return "Room";
};

const buildReference = (b) => {
  const code = b?.code || "";
  const name = (b?.customer?.name || "").trim();
  return name ? `${code} – ${name}` : code;
};

const paymentMethodLabel = (booking, lang = "hu") => {
  const method = booking?.payment?.method;
  const isTransfer =
    method === "transfer" || booking?.payment?.transferRequested === true;

  if (lang === "hu") {
    if (method === "onsite") return "Helyszínen";
    if (isTransfer) return "Előre utalással";
    return "—";
  }
  if (lang === "de") {
    if (method === "onsite") return "Vor Ort";
    if (isTransfer) return "Überweisung";
    return "—";
  }
  // en
  if (method === "onsite") return "On site";
  if (isTransfer) return "Bank transfer";
  return "—";
};

// ----------------------
// ✅ Egységes EMAIL LAYOUT
// ----------------------
const ui = {
  bg: "#f6f7f9",
  card: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  soft: "#f9fafb",
  greenBg: "#f0fdf4",
  greenBorder: "#bbf7d0",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
  warnBg: "#fffbeb",
  warnBorder: "#fde68a",
  brand: "#0ea5e9",
};

const pillStyle = (tone) => {
  const map = {
    info: "background:#e0f2fe;color:#075985;border:1px solid #bae6fd;",
    ok: "background:#dcfce7;color:#166534;border:1px solid #bbf7d0;",
    bad: "background:#fee2e2;color:#991b1b;border:1px solid #fecaca;",
    warn: "background:#ffedd5;color:#9a3412;border:1px solid #fed7aa;",
  };
  return map[tone] || map.info;
};

const wrapEmail = ({ lang = "hu", title, pillText, pillTone = "info", contentHtml }) => {
  const logoImg = LOGO_PATH
    ? `<img src="cid:${LOGO_CID}" width="42" height="42" alt="${escapeHtml(
        BRAND.name,
      )}" style="display:block;border-radius:10px;" />`
    : "";

  return `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:${ui.bg};font-family:Arial,Helvetica,sans-serif;color:${ui.text};">
    <div style="padding:22px 12px;">
      <div style="max-width:640px;margin:0 auto;background:${ui.card};border:1px solid ${ui.border};border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06);">
        
        <!-- Header -->
        <div style="padding:18px 20px;border-bottom:1px solid ${ui.border};background:linear-gradient(135deg, #ffffff, ${ui.soft});">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:52px;vertical-align:middle;">
                ${logoImg}
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <div style="font-weight:800;font-size:14px;letter-spacing:.2px;color:${ui.text};">${escapeHtml(
                  BRAND.name,
                )}</div>
                <div style="font-size:12px;color:${ui.muted};margin-top:2px;">${escapeHtml(
                  BRAND.address,
                )}</div>
              </td>
              <td style="vertical-align:middle;text-align:right;">
                ${
                  pillText
                    ? `<span style="display:inline-block;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;${pillStyle(
                        pillTone,
                      )}">${escapeHtml(pillText)}</span>`
                    : ""
                }
              </td>
            </tr>
          </table>

          <div style="margin-top:12px;font-size:20px;font-weight:900;line-height:1.2;">${escapeHtml(
            title || "",
          )}</div>
        </div>

        <!-- Content -->
        <div style="padding:18px 20px;line-height:1.55;">
          ${contentHtml || ""}
        </div>

        <!-- Footer -->
        <div style="padding:14px 20px;border-top:1px solid ${ui.border};background:${ui.soft};color:${ui.muted};font-size:12px;">
          ${escapeHtml(BRAND.name)} • ${escapeHtml(BRAND.address)}
        </div>
      </div>

      <div style="max-width:640px;margin:10px auto 0;color:${ui.muted};font-size:11px;line-height:1.4;">
        Ha nem te kezdeményezted ezt a folyamatot, hagyd figyelmen kívül ezt az üzenetet.
      </div>
    </div>
  </body>
</html>`;
};

const kvRow = (label, value) => `
  <tr>
    <td style="padding:10px 12px;border:1px solid ${ui.border};background:${ui.soft};font-weight:700;color:${ui.muted};width:38%;">
      ${escapeHtml(label)}
    </td>
    <td style="padding:10px 12px;border:1px solid ${ui.border};color:${ui.text};">
      ${value}
    </td>
  </tr>
`;

const cardBox = (innerHtml, tone = "soft") => {
  let bg = ui.soft;
  let border = ui.border;
  if (tone === "ok") {
    bg = ui.greenBg;
    border = ui.greenBorder;
  }
  if (tone === "bad") {
    bg = ui.redBg;
    border = ui.redBorder;
  }
  if (tone === "warn") {
    bg = ui.warnBg;
    border = ui.warnBorder;
  }
  return `
    <div style="margin:14px 0;padding:12px;border:1px solid ${border};border-radius:14px;background:${bg};">
      ${innerHtml}
    </div>
  `;
};

const primaryButton = (href, label, tone = "brand") => {
  const bg =
    tone === "ok" ? "#16a34a" : tone === "bad" ? "#dc2626" : tone === "brand" ? ui.brand : "#111827";
  return `
    <a href="${href}"
       style="display:inline-block;background:${bg};color:#fff;text-decoration:none;padding:11px 14px;border-radius:12px;font-weight:800;font-size:13px;">
      ${label}
    </a>
  `;
};

// ----------------------
// ✅ Templates
// ----------------------
export function bookingMailTemplates(b, opts = {}) {
  const lang = (b?.customer?.lang || "hu").toLowerCase();
  const L = tByLang(lang);

  const total = b?.price?.total ?? 0;
  const items = Array.isArray(b?.items) ? b.items : [];
  const payMethod =
    b?.payment?.method ||
    (b?.payment?.transferRequested ? "transfer" : "onsite");
  const isTransfer = payMethod === "transfer";

  const roomsListText = items
    .map((i) => ` - ${getRoomName(i.room, lang)} — ${i.guests} fő`)
    .join("\n");

  const roomsListHtml = items
    .map(
      (i) =>
        `<li style="margin:4px 0;">${escapeHtml(
          getRoomName(i.room, lang),
        )} — <strong>${escapeHtml(String(i.guests))}</strong></li>`,
    )
    .join("");

  const adminToken = String(opts.adminToken || "").trim();
  const canShowActions = !!(APP_URL && adminToken && b?.code);

  const makeAdminActionUrl = (action) => {
    const u = new URL("/api/admin/bookings/action", APP_URL);
    u.searchParams.set("code", b.code);
    u.searchParams.set("action", action);
    u.searchParams.set("token", adminToken);
    return u.toString();
  };

  const confirmUrl = canShowActions ? makeAdminActionUrl("confirm") : "";
  const cancelUrl = canShowActions ? makeAdminActionUrl("cancel") : "";
  const paidUrl =
    canShowActions && isTransfer ? makeAdminActionUrl("paid") : "";

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

  // ---------- Guest: Pending ----------
  const guestText = `${L.titlePending}
${L.labelCode}: ${b.code}
${L.labelPeriod}: ${fmtDate(b.checkIn, lang)} → ${fmtDate(b.checkOut, lang)}
${L.labelGuests}: ${b.guestsTotal} fő
${L.labelTotal}: ${Number(total).toLocaleString("hu-HU")} Ft

${L.labelRooms}:
${roomsListText}

${isTransfer ? L.nextStepsTransfer : L.nextStepsOnsite}
`;

  const guestContentHtml = `
    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow(
        L.labelCode,
        `<strong>${escapeHtml(String(b.code || ""))}</strong>`,
      )}
      ${kvRow(
        L.labelPeriod,
        `<strong>${escapeHtml(fmtDate(b.checkIn, lang))}</strong> → <strong>${escapeHtml(
          fmtDate(b.checkOut, lang),
        )}</strong>`,
      )}
      ${kvRow(L.labelGuests, `<strong>${escapeHtml(String(b.guestsTotal || 0))}</strong>`)}
      ${kvRow(
        L.labelTotal,
        `<strong>${escapeHtml(Number(total).toLocaleString("hu-HU"))} Ft</strong>`,
      )}
      ${kvRow(
        L.labelRooms,
        `<ul style="margin:0;padding-left:18px;">${roomsListHtml}</ul>`,
      )}
    </table>

    ${cardBox(
      `<div style="font-weight:800;margin-bottom:6px;">Teendők</div>
       <div style="color:${ui.text};">${escapeHtml(
         isTransfer ? L.nextStepsTransfer : L.nextStepsOnsite,
       )}</div>`,
      "soft",
    )}
  `;

  const guestHtml = wrapEmail({
    lang,
    title: L.titlePending,
    pillText: L.pillPending,
    pillTone: "info",
    contentHtml: guestContentHtml,
  });

  // ---------- Transfer details block ----------
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

  const transferDetailsHtml = cardBox(
    `
    <div style="font-weight:900;margin-bottom:10px;">${escapeHtml(
      L.transferDetailsTitle,
    )}</div>
    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow(L.beneficiary, `<strong>${escapeHtml(PAYMENT_DETAILS.beneficiary)}</strong>`)}
      ${kvRow(L.bankName, `<strong>${escapeHtml(PAYMENT_DETAILS.bankName)}</strong>`)}
      ${kvRow(L.accountNumber, `<strong>${escapeHtml(PAYMENT_DETAILS.accountNumber)}</strong>`)}
      ${kvRow(L.iban, `<strong>${escapeHtml(PAYMENT_DETAILS.iban)}</strong>`)}
      ${kvRow(L.swift, `<strong>${escapeHtml(PAYMENT_DETAILS.swift)}</strong>`)}
      ${kvRow(L.reference, `<strong>${escapeHtml(reference)}</strong>`)}
    </table>
    <div style="margin-top:8px;color:${ui.muted};font-size:12px;">${escapeHtml(
      L.referenceHint,
    )}</div>
  `,
    "soft",
  );

  // ---------- Guest: Confirmed ----------
  const guestConfirmedText = `${L.titleConfirmed}
${L.labelCode}: ${b.code}
${L.labelPeriod}: ${fmtDate(b.checkIn, lang)} → ${fmtDate(b.checkOut, lang)}
${L.labelGuests}: ${b.guestsTotal} fő
${L.labelTotal}: ${Number(total).toLocaleString("hu-HU")} Ft

${L.labelRooms}:
${roomsListText}

${isTransfer ? L.confirmedTransferIntro : L.confirmedOnsite}

${isTransfer ? transferDetailsText : ""}
`;

  const guestConfirmedContentHtml = `
    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow(
        L.labelCode,
        `<strong>${escapeHtml(String(b.code || ""))}</strong>`,
      )}
      ${kvRow(
        L.labelPeriod,
        `<strong>${escapeHtml(fmtDate(b.checkIn, lang))}</strong> → <strong>${escapeHtml(
          fmtDate(b.checkOut, lang),
        )}</strong>`,
      )}
      ${kvRow(L.labelGuests, `<strong>${escapeHtml(String(b.guestsTotal || 0))}</strong>`)}
      ${kvRow(
        L.labelTotal,
        `<strong>${escapeHtml(Number(total).toLocaleString("hu-HU"))} Ft</strong>`,
      )}
      ${kvRow(
        L.labelRooms,
        `<ul style="margin:0;padding-left:18px;">${roomsListHtml}</ul>`,
      )}
    </table>

    ${cardBox(
      `<div style="font-weight:900;margin-bottom:6px;">${escapeHtml(
        isTransfer ? L.titleConfirmed : L.titleConfirmed,
      )}</div>
       <div>${escapeHtml(isTransfer ? L.confirmedTransferIntro : L.confirmedOnsite)}</div>`,
      "ok",
    )}

    ${isTransfer ? transferDetailsHtml : ""}
  `;

  const guestConfirmedHtml = wrapEmail({
    lang,
    title: L.titleConfirmed,
    pillText: L.pillConfirmed,
    pillTone: "ok",
    contentHtml: guestConfirmedContentHtml,
  });

  // ---------- Guest: Paid ----------
  const guestPaidText = `${L.titlePaid}
${L.labelCode}: ${b.code}
${L.labelPeriod}: ${fmtDate(b.checkIn, lang)} → ${fmtDate(b.checkOut, lang)}
${L.labelGuests}: ${b.guestsTotal} fő
${L.labelTotal}: ${Number(total).toLocaleString("hu-HU")} Ft

${L.paidMsg}

${L.labelRooms}:
${roomsListText}
`;

  const guestPaidContentHtml = `
    ${cardBox(
      `<div style="font-weight:900;margin-bottom:6px;">✅ ${escapeHtml(
        L.titlePaid,
      )}</div>
       <div>${escapeHtml(L.paidMsg)}</div>`,
      "ok",
    )}

    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow(L.labelCode, `<strong>${escapeHtml(String(b.code || ""))}</strong>`)}
      ${kvRow(
        L.labelPeriod,
        `<strong>${escapeHtml(fmtDate(b.checkIn, lang))}</strong> → <strong>${escapeHtml(
          fmtDate(b.checkOut, lang),
        )}</strong>`,
      )}
      ${kvRow(L.labelGuests, `<strong>${escapeHtml(String(b.guestsTotal || 0))}</strong>`)}
      ${kvRow(
        L.labelTotal,
        `<strong>${escapeHtml(Number(total).toLocaleString("hu-HU"))} Ft</strong>`,
      )}
      ${kvRow(
        L.labelRooms,
        `<ul style="margin:0;padding-left:18px;">${roomsListHtml}</ul>`,
      )}
    </table>
  `;

  const guestPaidHtml = wrapEmail({
    lang,
    title: L.titlePaid,
    pillText: L.pillPaid,
    pillTone: "ok",
    contentHtml: guestPaidContentHtml,
  });

  // ---------- Guest: Cancelled ----------
  const guestCancelledText = `${L.titleCancelled}
${L.labelCode}: ${b.code}
${L.labelPeriod}: ${fmtDate(b.checkIn, lang)} → ${fmtDate(b.checkOut, lang)}

${L.cancelledMsg}

${L.labelRooms}:
${roomsListText}
`;

  const guestCancelledContentHtml = `
    ${cardBox(
      `<div style="font-weight:900;margin-bottom:6px;">❌ ${escapeHtml(
        L.titleCancelled,
      )}</div>
       <div>${escapeHtml(L.cancelledMsg)}</div>`,
      "bad",
    )}

    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow(L.labelCode, `<strong>${escapeHtml(String(b.code || ""))}</strong>`)}
      ${kvRow(
        L.labelPeriod,
        `<strong>${escapeHtml(fmtDate(b.checkIn, lang))}</strong> → <strong>${escapeHtml(
          fmtDate(b.checkOut, lang),
        )}</strong>`,
      )}
      ${kvRow(
        L.labelRooms,
        `<ul style="margin:0;padding-left:18px;">${roomsListHtml}</ul>`,
      )}
    </table>
  `;

  const guestCancelledHtml = wrapEmail({
    lang,
    title: L.titleCancelled,
    pillText: L.pillCancelled,
    pillTone: "bad",
    contentHtml: guestCancelledContentHtml,
  });

  // ---------- Admin ----------
  const adminText = `Új foglalás érkezett
Kód: ${b.code}
Időszak: ${fmtDate(b.checkIn, "hu")} → ${fmtDate(b.checkOut, "hu")}
Vendégek: ${b.guestsTotal} fő
Végösszeg: ${Number(total).toLocaleString("hu-HU")} Ft

Foglaló:
- Név: ${b?.customer?.name || "-"}
- Email: ${b?.customer?.email || "-"}

Fizetés módja: ${paymentMethodLabel(b, "hu")}

Szobák:
${roomsListText}

Megjegyzés:
${b?.customer?.note || "-"}

${actionsText}
`;

  const safeNote = escapeHtml(b?.customer?.note || "-");

  const adminActionsHtml = canShowActions
    ? cardBox(
        `
        <div style="font-weight:900;margin-bottom:10px;">${escapeHtml(
          L.adminActions,
        )}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${primaryButton(confirmUrl, `✅ ${escapeHtml(L.adminConfirm)}`, "ok")}
          ${primaryButton(cancelUrl, `❌ ${escapeHtml(L.adminCancel)}`, "bad")}
          ${
            isTransfer
              ? primaryButton(paidUrl, `💰 ${escapeHtml(L.adminPaid)}`, "brand")
              : ""
          }
        </div>
        <div style="margin-top:10px;color:${ui.muted};font-size:12px;">
          ${escapeHtml(L.adminLinkSingleUse)}
        </div>
      `,
        "warn",
      )
    : cardBox(
        `⚠️ <strong>${escapeHtml(L.adminActionsMissing)}</strong>`,
        "warn",
      );

  const adminContentHtml = `
    <table role="presentation" style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;">
      ${kvRow("Kód", `<strong>${escapeHtml(String(b.code || ""))}</strong>`)}
      ${kvRow(
        "Időszak",
        `<strong>${escapeHtml(fmtDate(b.checkIn, "hu"))}</strong> → <strong>${escapeHtml(
          fmtDate(b.checkOut, "hu"),
        )}</strong>`,
      )}
      ${kvRow("Vendégek", `<strong>${escapeHtml(String(b.guestsTotal || 0))}</strong>`)}
      ${kvRow(
        "Végösszeg",
        `<strong>${escapeHtml(Number(total).toLocaleString("hu-HU"))} Ft</strong>`,
      )}
      ${kvRow("Fizetés módja", `<strong>${escapeHtml(paymentMethodLabel(b, "hu"))}</strong>`)}
      ${kvRow(
        "Foglaló",
        `<div><strong>${escapeHtml(b?.customer?.name || "-")}</strong></div>
         <div style="color:${ui.muted};font-size:12px;margin-top:2px;">${escapeHtml(
           b?.customer?.email || "-",
         )}</div>`,
      )}
      ${kvRow(
        "Szobák",
        `<ul style="margin:0;padding-left:18px;">${roomsListHtml}</ul>`,
      )}
      ${kvRow("Megjegyzés", `<div style="white-space:pre-wrap;">${safeNote}</div>`)}
    </table>

    ${adminActionsHtml}
  `;

  const adminHtml = wrapEmail({
    lang: "hu",
    title: "Új foglalás",
    pillText: "ÚJ",
    pillTone: "warn",
    contentHtml: adminContentHtml,
  });

  // ---------- Review request ----------
  const guestReviewText = `${L.reviewGreeting}

${L.reviewThanks}
${L.reviewRequest}

${opts.reviewUrl ? `${L.reviewWebsite} ${opts.reviewUrl}` : ""}
${L.reviewGoogle} ${googleUrl}

${L.reviewThanks2}
${L.reviewSignature}
`;

  const reviewButtons = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
      ${
        opts.reviewUrl
          ? primaryButton(
              opts.reviewUrl,
              `⭐ ${escapeHtml(L.reviewWebsite.replace(":", ""))}`,
              "brand",
            )
          : ""
      }
      ${primaryButton(
        googleUrl,
        `⭐ ${escapeHtml(L.reviewGoogle.replace(":", ""))}`,
        "brand",
      )}
    </div>
  `;

  const guestReviewHtml = wrapEmail({
    lang,
    title: L.subjectGuestReview(b.code),
    pillText: "⭐",
    pillTone: "info",
    contentHtml: `
      <div style="font-size:14px;">
        <p style="margin:0 0 10px;"><strong>${escapeHtml(L.reviewGreeting)}</strong></p>
        <p style="margin:0 0 10px;">${escapeHtml(L.reviewThanks)}</p>
        ${cardBox(
          `<div style="font-weight:900;margin-bottom:6px;">${escapeHtml(
            L.reviewRequest,
          )}</div>
           ${reviewButtons}`,
          "soft",
        )}
        <p style="margin:12px 0 0;color:${ui.muted};">${escapeHtml(
          L.reviewThanks2,
        )}<br/><strong>${escapeHtml(L.reviewSignature)}</strong></p>
      </div>
    `,
  });

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
