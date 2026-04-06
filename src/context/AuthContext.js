"use client";

import {
 createContext,
 useCallback,
 useContext,
 useEffect,
 useMemo,
 useState,
} from "react";
import { authApi, authStorage, parseTokenPayload } from "@/lib/api";

const AuthContext = createContext(null);
const TOKEN_EXPIRY_SKEW_MS = 2000;

function extractUserFromResponse(data) {
 return data?.data?.user || data?.data?.data || null;
}

export function AuthProvider({ children }) {
 const [token, setToken] = useState(null);
 const [user, setUser] = useState(null);
 const [isAuthLoading, setIsAuthLoading] = useState(true);

 const clearAuth = useCallback((source = "unknown") => {
  console.log("[Auth] cleared by:", source);
  authStorage.clearToken();
  authStorage.clearUser();
  setToken(null);
  setUser(null);
 }, []);

 const loginWithAuthData = useCallback(async (data) => {
  const nextToken = data?.token;
  const nextUser = extractUserFromResponse(data);

  if (!nextToken) {
   throw new Error("Authentication token missing from response.");
  }

  authStorage.setToken(nextToken);
  setToken(nextToken);

  if (nextUser) {
   authStorage.setUser(nextUser);
   setUser(nextUser);
   return;
  }

  try {
   const meData = await authApi.getMe(nextToken);
   const meUser = extractUserFromResponse(meData);
   authStorage.setUser(meUser || null);
   setUser(meUser || null);
  } catch {
   const cachedUser = authStorage.getUser();
   setUser(cachedUser || null);
  }
 }, []);

 const logout = useCallback(async () => {
  const currentToken = authStorage.getToken();

  try {
   await authApi.logout(currentToken);
  } catch {
   // Client logout should still proceed even when API logout fails.
  } finally {
   clearAuth("logout");
  }
 }, [clearAuth]);

 useEffect(() => {
  let isMounted = true;

  const restoreSession = async () => {
   const storedToken = authStorage.getToken();

   if (!storedToken || authStorage.isTokenExpired(storedToken)) {
    setToken(null);
    setUser(null);

    if (storedToken && authStorage.isTokenExpired(storedToken)) {
     authStorage.clearToken();
     authStorage.clearUser();
    }

    if (isMounted) setIsAuthLoading(false);
    return;
   }

   if (isMounted) {
    setToken(storedToken);
   }

   const cachedUser = authStorage.getUser();
   if (isMounted && cachedUser) {
    setUser(cachedUser);
   }

   try {
    const meData = await authApi.getMe(storedToken);
    const meUser = extractUserFromResponse(meData);

    if (isMounted) {
     if (meUser) {
      authStorage.setUser(meUser);
      setUser(meUser);
     } else {
      setUser(cachedUser || null);
     }
    }
   } catch (error) {
    if (isMounted) {
     setUser(cachedUser || null);
    }
   } finally {
    if (isMounted) {
     setIsAuthLoading(false);
    }
   }
  };

  restoreSession();

  return () => {
   isMounted = false;
  };
 }, [clearAuth]);

 useEffect(() => {
  if (!token) return;

  const payload = parseTokenPayload(token);
  if (!payload?.exp) return;

  const expiresAtMs = payload.exp * 1000;
  const delayMs = expiresAtMs - Date.now() + TOKEN_EXPIRY_SKEW_MS;

  if (delayMs <= 0) {
   if (authStorage.isTokenExpired(token)) {
    clearAuth("token-expiry-effect");
   }
   return;
  }

  const scheduledToken = token;

  const timeoutId = setTimeout(() => {
   const currentToken = authStorage.getToken();

   // Ignore stale timers created for old tokens.
   if (!currentToken || currentToken !== scheduledToken) {
    return;
   }

   if (authStorage.isTokenExpired(currentToken)) {
    clearAuth("token-expiry-timeout");
   }
  }, delayMs);

  return () => {
   clearTimeout(timeoutId);
  };
 }, [token, clearAuth]);

 const value = useMemo(() => {
  return {
   token,
   user,
   isAuthLoading,
   isAuthenticated: Boolean(token),
   loginWithAuthData,
   logout,
   clearAuth,
  };
 }, [token, user, isAuthLoading, loginWithAuthData, logout, clearAuth]);

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const context = useContext(AuthContext);

 if (!context) {
  throw new Error("useAuth must be used within AuthProvider.");
 }

 return context;
}
