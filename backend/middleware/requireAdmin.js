import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function requireAdmin(req, res, next) {
  const token = req.cookies?.adm;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}