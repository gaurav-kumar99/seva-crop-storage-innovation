import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as api from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // If a token is saved, we must check it with the server before deciding
  // whether the visitor is logged in.
  const [loading, setLoading] = useState(() => Boolean(api.getToken()));

  useEffect(() => {
    if (!api.getToken()) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    api
      .fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch((err) => {
        // Only a 401 means the token is bad. If the server is just
        // unreachable, keep the token so a refresh can recover.
        if (err.status === 401) api.clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // api.js fires this when any protected call returns 401 (expired token).
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("seva:unauthorized", onUnauthorized);
    return () => window.removeEventListener("seva:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(async (phone, password) => {
    try {
      const me = await api.login(phone, password);
      setUser(me);
      return { ok: true, user: me };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (values) => {
    try {
      const me = await api.register(values);
      setUser(me);
      return { ok: true, user: me };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isLoggedIn: Boolean(user), login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
