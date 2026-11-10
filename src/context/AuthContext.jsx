import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { AuthContext } from './authContext';

const normalizeRole = (value) =>
  String(value || '')
    .replace(/^ROLE_/, '')
    .toUpperCase();

const PUBLIC_AUTH_PATHS = new Set([
  "/login",
  "/verify-email",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
]);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const pathname =
      typeof window === "undefined" ? "" : window.location.pathname;
    if (PUBLIC_AUTH_PATHS.has(pathname)) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    authService
      .me()
      .then((data) => {
        if (active) setUser(data?.user || data?.account || data || null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (values) => {
    const result = await authService.login(values);
    const account =
      result?.user ||
      result?.account ||
      (result?.role ? result : await authService.me());
    const normalizedAccount = account?.user || account;
    setUser(normalizedAccount);
    return normalizedAccount;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const role = normalizeRole(
    user?.role || user?.roles?.[0]?.name || user?.roles?.[0],
  );

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
