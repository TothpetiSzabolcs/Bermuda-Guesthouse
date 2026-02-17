import dns from "dns/promises";

/**
 * Validate that the email domain has MX records (= real mail server exists).
 * Falls back to A/AAAA record check if no MX found (some domains serve mail
 * without explicit MX records, per RFC 5321 §5.1).
 *
 * @param {string} email - Full email address
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
export async function validateEmailDomain(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "EMPTY_EMAIL" };
  }

  const parts = email.trim().split("@");
  if (parts.length !== 2 || !parts[1]) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }

  const domain = parts[1].toLowerCase();

  // Quick sanity: domain must have at least one dot and min 2 char TLD
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domain)) {
    return { valid: false, reason: "INVALID_DOMAIN" };
  }

  try {
    // 1) Try MX records first
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) {
      return { valid: true };
    }
  } catch (err) {
    // ENODATA or ENOTFOUND = no MX records, try A/AAAA fallback
    if (err.code !== "ENODATA" && err.code !== "ENOTFOUND") {
      // DNS timeout or other transient error → give benefit of doubt
      console.warn(`DNS MX lookup error for ${domain}:`, err.code);
      return { valid: true };
    }
  }

  try {
    // 2) Fallback: check A or AAAA record (RFC 5321 implicit MX)
    const a = await dns.resolve4(domain);
    if (a && a.length > 0) return { valid: true };
  } catch {
    // no A record
  }

  try {
    const aaaa = await dns.resolve6(domain);
    if (aaaa && aaaa.length > 0) return { valid: true };
  } catch {
    // no AAAA record
  }

  return { valid: false, reason: "NO_MAIL_SERVER" };
}