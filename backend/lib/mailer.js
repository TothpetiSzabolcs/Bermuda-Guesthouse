import "dotenv/config";
import nodemailer from "nodemailer";

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  MAIL_ADMIN: ENV_MAIL_ADMIN,
  MAIL_FROM: ENV_MAIL_FROM,
} = process.env;

const MAIL_FROM = ENV_MAIL_FROM || (SMTP_USER ? `Bermuda Vendégház <${SMTP_USER}>` : "Bermuda Vendégház <no-reply@bermuda.hu>");
const MAIL_ADMIN = ENV_MAIL_ADMIN || SMTP_USER || "bermudavendeghazvese@gmail.com";

let transporter;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // opcionális: TLS szigorítás
    // tls: { minVersion: "TLSv1.2" }
  });
} else {
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html,
    replyTo: replyTo || MAIL_ADMIN,
  });

  if (info.message) {
    console.log("📧 Mail (dev):\n" + info.message.toString());
  } else {
    console.log("📨 Mail sent via SMTP →", {
      to,
      subject,
      accepted: info.accepted,
      response: info.response,
    });
  }
  return info;
}

const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);

export function bookingMailTemplates(b) {
  const lines = [
    `Foglalási kód: ${b.code}`,
    `Időszak: ${fmtDate(b.checkIn)} → ${fmtDate(b.checkOut)}`,
    `Vendégek: ${b.guestsTotal} fő`,
    `Végösszeg: ${b.price?.total?.toLocaleString?.("hu-HU")} Ft`,
    "",
    "Szobák:",
    ...(b.items || []).map((i) => ` - ${i.room?.name ?? i.room} (${i.guests} fő)`),
  ];

  const text = lines.join("\n");

  const html = `<!doctype html>
<html lang="hu">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0">
        <h2 style="margin:0;font-size:20px;">Foglalás visszaigazolás</h2>
        <div style="color:#666;margin-top:6px">Kód: <strong>${b.code}</strong></div>
      </div>
      <div style="padding:20px 24px;line-height:1.5;color:#222;">
        <p style="margin:0 0 10px;">Időszak: <strong>${fmtDate(b.checkIn)} – ${fmtDate(b.checkOut)}</strong></p>
        <p style="margin:0 0 10px;">Vendégek: <strong>${b.guestsTotal} fő</strong></p>
        <p style="margin:0 0 14px;">Végösszeg: <strong>${(b.price?.total ?? 0).toLocaleString("hu-HU")} Ft</strong></p>
        <div style="margin:12px 0 6px;font-weight:bold;">Szobák:</div>
        <ul style="margin:4px 0 0 18px;padding:0;">
          ${(b.items || []).map(i => `<li>${i.room?.name ?? i.room} — ${i.guests} fő</li>`).join("")}
        </ul>
      </div>
      <div style="padding:14px 24px;background:#fafafa;color:#666;font-size:12px;border-top:1px solid #f0f0f0">
        Bermuda Vendégház • NTAK: MA24095212
      </div>
    </div>
  </body>
</html>`;

  return {
    subjectGuest: `Foglalás rögzítve – ${b.code}`,
    subjectAdmin: `Új foglalás – ${b.code}`,
    text,
    html,
  };
}
