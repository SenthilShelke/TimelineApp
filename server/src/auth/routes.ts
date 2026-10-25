import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./tokens.js";
import { requireAuth } from "./requireAuth.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login only checks that fields are present/well-formed — never the password
// policy (that would leak rules and block legacy/shorter passwords).
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Shape of the user we return to clients (never includes secrets).
function publicUser(u: { id: string; email: string; displayName: string | null; emailVerified: boolean }) {
  return { id: u.id, email: u.email, displayName: u.displayName, emailVerified: u.emailVerified };
}

/**
 * POST /auth/signup  { email, password }
 * Creates a users row + a 'password' auth_identities row (bcrypt hash).
 */
authRouter.post("/signup", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const secret = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      identities: {
        create: { provider: "password", providerUserId: email, secret },
      },
    },
  });

  const payload = { userId: user.id };
  return res.status(201).json({
    user: publicUser(user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  });
});

/**
 * POST /auth/login  { email, password }
 * Verifies the 'password' identity and mints app tokens.
 */
authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { email, password } = parsed.data;

  const identity = await prisma.authIdentity.findUnique({
    where: { provider_providerUserId: { provider: "password", providerUserId: email } },
    include: { user: true },
  });

  // Generic message to avoid leaking which part was wrong.
  if (!identity || !identity.secret) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await bcrypt.compare(password, identity.secret);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const payload = { userId: identity.user.id };
  return res.json({
    user: publicUser(identity.user),
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  });
});

/**
 * POST /auth/refresh  { refreshToken }  -> { accessToken }
 */
authRouter.post("/refresh", async (req, res) => {
  const schema = z.object({ refreshToken: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "refreshToken is required" });
  }
  try {
    const { userId } = verifyRefreshToken(parsed.data.refreshToken);
    return res.json({ accessToken: signAccessToken({ userId }) });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

/**
 * GET /auth/me  -> { user }   (requires Bearer access token)
 */
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: publicUser(user) });
});
