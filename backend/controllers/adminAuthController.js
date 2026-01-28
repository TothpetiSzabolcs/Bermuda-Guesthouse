// controllers/adminAuthController.js
import jwt from "jsonwebtoken";

const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env var");

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  secure: isProd,                 // dev: false, prod: true
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const loginAdmin = (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("adm", token, cookieOpts);
  res.json({ username });
};

export const logoutAdmin = (req, res) => {
  res.clearCookie("adm", cookieOpts);
  res.json({ ok: true });
};
