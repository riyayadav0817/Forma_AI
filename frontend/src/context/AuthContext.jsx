/* eslint-disable react-refresh/only-export-components --
   This file intentionally exports both the AuthProvider component and
   the useAuth hook together — see the same note in components/Toast.jsx. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, SESSION_EXPIRED_EVENT } from "../api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("forma_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("forma_token")
  );
  const [user, setUser] = useState(readStoredUser);
  // "checking" until we've confirmed the stored token (if any) is still valid.
  const [status, setStatus] = useState("checking");

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem("forma_token", nextToken);
    localStorage.setItem("forma_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem("forma_token");
    localStorage.removeItem("forma_user");
    setToken(null);
    setUser(null);
  }, []);

  // Validate any stored token once, on first load.
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setStatus("guest");
        return;
      }

      try {
        const result = await api.me();
        if (!cancelled) {
          setUser(result.user);
          localStorage.setItem(
            "forma_user",
            JSON.stringify(result.user)
          );
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setStatus("guest");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If any API call comes back 401, drop the session everywhere.
  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      setStatus("guest");
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [clearSession]);

  const login = async (email, password) => {
    const result = await api.login(email, password);
    persistSession(result.token, result.user);
    setStatus("authenticated");
    return result.user;
  };

  const register = async (name, email, password) => {
    const result = await api.register(name, email, password);
    persistSession(result.token, result.user);
    setStatus("authenticated");
    return result.user;
  };

  const logout = () => {
    clearSession();
    setStatus("guest");
  };

  const value = {
    user,
    token,
    isAuthenticated: status === "authenticated",
    isChecking: status === "checking",
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
