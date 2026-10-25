import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./tokens.js";

// Augment Express Request with the authenticated user id.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Provider-agnostic: this verifies an app-issued JWT regardless of how the user
// logged in (password now, Google SSO later). Google SSO reuses this unchanged.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
