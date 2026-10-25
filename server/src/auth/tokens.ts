import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
const ACCESS_TTL = (process.env.ACCESS_TOKEN_TTL ?? "15m") as SignOptions["expiresIn"];
const REFRESH_TTL = (process.env.REFRESH_TOKEN_TTL ?? "30d") as SignOptions["expiresIn"];

export type TokenPayload = { userId: string };

// App-issued tokens. Login METHOD (password now, Google later) does not matter —
// every login path mints these same tokens, and every protected route trusts them.
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
