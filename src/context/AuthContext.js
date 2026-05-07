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
const TOKEN_EXPIRY_SKEW_MS = 0;

function extractUserFromResponse(data) {
 return data?.data?.user || data?.data?.data || null;
}

export function AuthProvider({ children }) {
 const [token, setToken] = useState(null);
 const [user, setUser] = useState(null);
 const [isAuthLoading, setIsAuthLoading] = useState(true);

 const clearAuth = useCallback(() => {
  authStorage.clearToken();
  authStorage.clearUser();
  setToken(null);
  setUser(null);
 }, []);

 const loginWithAuthData = useCallback(
  async (data) => {
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
   } catch (error) {
    if (
     error?.status === 401 ||
     error?.status === 403 ||
     authStorage.isTokenExpired(nextToken)
    ) {
     clearAuth("login-me-unauthorized");
     throw error;
    }

    const cachedUser = authStorage.getUser();
    setUser(cachedUser || null);
   }
  },
  [clearAuth],
 );

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
    clearAuth("restore-invalid-or-expired-token");

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
    if (
     error?.status === 401 ||
     error?.status === 403 ||
     authStorage.isTokenExpired(storedToken)
    ) {
     clearAuth("restore-me-unauthorized");
    } else if (isMounted) {
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

  if (authStorage.isTokenExpired(token)) {
   clearAuth("token-invalid-effect");
   return;
  }

  const payload = parseTokenPayload(token);
  if (!payload?.exp) {
   clearAuth("token-invalid-payload");
   return;
  }

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

 useEffect(() => {
  const validateSessionArtifacts = () => {
   const activeToken = authStorage.getToken();

   if (!activeToken || authStorage.isTokenExpired(activeToken)) {
    clearAuth("session-artifact-validation");
    return;
   }

   setToken((prevToken) =>
    prevToken === activeToken ? prevToken : activeToken,
   );
  };

  validateSessionArtifacts();

  const handleVisibilityChange = () => {
   if (document.visibilityState === "visible") {
    validateSessionArtifacts();
   }
  };

  window.addEventListener("focus", validateSessionArtifacts);
  window.addEventListener("pageshow", validateSessionArtifacts);
  window.addEventListener("storage", validateSessionArtifacts);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
   window.removeEventListener("focus", validateSessionArtifacts);
   window.removeEventListener("pageshow", validateSessionArtifacts);
   window.removeEventListener("storage", validateSessionArtifacts);
   document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
 }, [clearAuth]);

 const value = useMemo(() => {
  return {
   token,
   user,
   isAuthLoading,
   isAuthenticated: Boolean(token) && !authStorage.isTokenExpired(token),
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
