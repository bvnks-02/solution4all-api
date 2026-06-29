import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "solution4all-dev-secret";

// Returns true only for a request bearing a cryptographically valid JWT.
// ⚠️ SECURITY: header presence alone must NOT exempt a request — otherwise
// anyone can bypass the limiter by sending an arbitrary `Authorization` header.
const hasValidToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  try {
    jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};

// General API rate limiter - 100 requests per 15 minutes
// Authenticated GET requests (admin panel) are skipped — only mutations and
// unauthenticated requests are rate-limited.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET" && hasValidToken(req),
});

// Auth rate limiter - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form rate limiter - 5 submissions per hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many contact submissions, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Analytics rate limiter - 100 events per minute
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: "Rate limit exceeded for analytics events" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation rate limiter - 5 orders per hour
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many orders, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
