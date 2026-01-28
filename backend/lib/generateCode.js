import crypto from "crypto";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBookingCode(prefix = "BM", len = 6) {
  const bytes = crypto.randomBytes(len);
  let body = "";
  for (let i = 0; i < len; i++) body += alphabet[bytes[i] % alphabet.length];
  return `${prefix}-${body}`;
}