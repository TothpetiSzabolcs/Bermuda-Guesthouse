import crypto from "crypto";

export function makeAdminToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // 64 chars
}

export function hashAdminToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}
