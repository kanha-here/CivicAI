// Simple email/password auth client.
// This replaces the previous Neon Auth (cloud) integration with calls to our
// own backend, so the app no longer depends on any external auth token
// provider. The exported shape (neonAuthClient, getNeonJWT) is kept
// identical so no other file (AuthContext, pages, etc.) needs to change.

type AuthError = { message: string; code?: string };
type AuthResult<T> = { data: T | null; error: AuthError | null };
type SessionData = {
  session?: { token?: string | null } | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    emailVerified?: boolean | null;
    image?: string | null;
  } | null;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_BASE = `${API_BASE_URL.replace(/\/+$/, "")}/simple-auth`;
const TOKEN_KEY = "authToken";

function authUrl(path: string) {
  return `${AUTH_BASE}${path}`;
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<AuthResult<T>> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(authUrl(path), {
    ...init,
    headers,
  });
  const payload = await response.json().catch(() => null);
  const jwt = response.headers.get("set-auth-jwt");

  if (!response.ok) {
    return {
      data: null,
      error: {
        message: payload?.message || payload?.error || `Authentication request failed (${response.status})`,
        code: payload?.code,
      },
    };
  }

  if (jwt && payload?.session) {
    payload.session.token = jwt;
    try {
      localStorage.setItem(TOKEN_KEY, jwt);
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }
  return { data: payload as T, error: null };
}

async function getSession() {
  const token = getStoredToken();
  if (!token) return null;

  const response = await fetch(authUrl("/get-session"), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) return null;
  if (payload?.session) payload.session.token = token;

  return payload as SessionData;
}

export const neonAuthClient = {
  getSession,
  signUp: {
    email: (data: { email: string; password: string; name: string }) =>
      authRequest<SessionData>("/sign-up/email", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  signIn: {
    email: (data: { email: string; password: string }) =>
      authRequest<SessionData>("/sign-in/email", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    social: async (data: { provider: string; callbackURL: string }) => {
      // No external OAuth provider is configured in this local setup.
      return {
        data: null,
        error: { message: "Social sign-in is not available in this environment" },
      } as AuthResult<{ url?: string }>;
    },
  },
  signOut: () => authRequest("/sign-out", { method: "POST" }),
  verify: {
    email: (data: { email: string; code: string }) =>
      authRequest<SessionData>("/email-otp/verify-email", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};

export async function getNeonJWT() {
  const token = getStoredToken();
  if (!token) return null;
  // Validate the token is still accepted by the backend before trusting it.
  const session = await getSession();
  if (!session) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return token;
}
