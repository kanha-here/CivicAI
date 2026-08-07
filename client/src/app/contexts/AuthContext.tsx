import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { neonAuthClient, getNeonJWT } from "../../lib/neon-auth";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: { token: string } | null;
  loading: boolean;
  signUp: (data: { name: string; email: string; password: string; role: string }) => Promise<{ error?: string }>;
  signIn: (data: { email: string; password: string }) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeRole(raw: string | undefined | null): string {
  const r = (raw || "citizen").toLowerCase().trim();
  if (r === "user") return "citizen";
  if (["citizen", "officer", "admin", "super_admin"].includes(r)) return r;
  return "citizen";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const syncUser = useCallback(async () => {
    try {
      let s = null;
      try {
        s = await neonAuthClient.getSession();
      } catch (err) {
        console.warn("getSession error:", err);
      }

      let token: string | null = null;
      try {
        token = await getNeonJWT();
      } catch (err) {
        console.warn("getNeonJWT error:", err);
      }

      if (s?.user || token) {
        if (token) {
          localStorage.setItem("authToken", token);
          setSession({ token });
        }

        if (s?.user) {
          const rawRole = (s.user as any).role || localStorage.getItem("govops_role") || "citizen";
          setUser({
            id: s.user.id,
            name: s.user.name || "",
            email: s.user.email || "",
            role: normalizeRole(rawRole),
            emailVerified: !!s.user.emailVerified,
            image: s.user.image,
          });
        } else if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const rawRole = decoded.role || localStorage.getItem("govops_role") || "citizen";
            setUser({
              id: decoded.sub,
              name: decoded.name || decoded.email?.split("@")[0] || "User",
              email: decoded.email || "",
              role: normalizeRole(rawRole),
              emailVerified: !!decoded.email_verified,
              image: decoded.picture,
            });
          } catch (decodeErr) {
            console.error("JWT Decode error:", decodeErr);
          }
        }
      } else {
        localStorage.removeItem("authToken");
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Session sync error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  const signUp = async (data: { name: string; email: string; password: string; role: string }) => {
    try {
      const { data: authData, error } = await neonAuthClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      if (!error && authData?.user) {
        localStorage.setItem("govops_role", data.role);
        await syncUser();
        return {};
      }
      return { error: error?.message || "Sign up failed" };
    } catch (err: any) {
      return { error: err?.message || "Sign up failed" };
    }
  };

  const signIn = async (data: { email: string; password: string }) => {
    try {
      const { data: authData, error } = await neonAuthClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      if (!error && authData?.user) {
        await syncUser();
        return {};
      }
      return { error: error?.message || "Invalid credentials" };
    } catch (err: any) {
      return { error: err?.message || "Sign in failed" };
    }
  };

  const signInWithGoogle = async () => {
    try {
      await neonAuthClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/auth/callback",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const signOut = async () => {
    await neonAuthClient.signOut();
    localStorage.removeItem("authToken");
    localStorage.removeItem("govops_role");
    setSession(null);
    setUser(null);
    navigate("/");
  };
  
  const verifyOTP = async (email: string, code: string) => {
    try {
      const { error } = await (neonAuthClient as any).verify.email({
        email,
        code,
      });
      if (!error) {
        await syncUser();
        return {};
      }
      return { error: error?.message || "Verification failed" };
    } catch (err: any) {
      return { error: err?.message || "Verification failed" };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      verifyOTP,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
