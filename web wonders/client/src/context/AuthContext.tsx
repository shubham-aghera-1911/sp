import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, seedApi, setToken, hasToken } from "../lib/api";

interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  major?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, major?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!hasToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.token);
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    }
  }

  async function register(name: string, email: string, password: string, major?: string) {
    setError(null);
    try {
      const data = await authApi.register({ name, email, password, major });
      setToken(data.token);
      setUser(data);
      // Populate a fresh account with sample data so the dashboard isn't empty.
      try {
        await seedApi.run();
      } catch {
        // Non-fatal: user can still add their own data.
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
