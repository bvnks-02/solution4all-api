import rateLimit from "express-rate-limit";

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
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
