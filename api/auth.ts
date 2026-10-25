import { apiRequest } from "./client";
import { saveTokens, clearTokens, getAccessToken } from "./tokenStore";
import type { AuthUser } from "./types";

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function signup(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

// Returns the current user if a valid token exists, else null.
// Used by the app launch gate to decide Login vs Home.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const data = await apiRequest<{ user: AuthUser }>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}
