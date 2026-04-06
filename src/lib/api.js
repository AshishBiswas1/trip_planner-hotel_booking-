const API_BASE_URL =
 process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const TOKEN_STORAGE_KEY = "token";
const TOKEN_COOKIE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";
const TOKEN_EXPIRY_SKEW_MS = 2000;

export const API_ROUTES = {
 user: {
  register: "/user/register",
  login: "/user/login",
  logout: "/user/logout",
  me: "/user/me",
  deleteMe: "/user/deleteMe",
  all: "/user",
  byId: (id) => `/user/${id}`,
 },
 hotel: {
  all: "/hotel",
  bySlug: (slug) => `/hotel/${slug}`,
 },
};

async function apiRequest(route, options = {}) {
 const { method = "GET", body, token, headers = {} } = options;

 const requestHeaders = {
  ...headers,
 };

 if (body) {
  requestHeaders["Content-Type"] = "application/json";
 }

 if (token) {
  requestHeaders.Authorization = `Bearer ${token}`;
 }

 const response = await fetch(`${API_BASE_URL}${route}`, {
  method,
  headers: requestHeaders,
  body: body ? JSON.stringify(body) : undefined,
 });

 const rawResponse = await response.text();
 let data = {};

 if (rawResponse) {
  try {
   data = JSON.parse(rawResponse);
  } catch {
   data = {};
  }
 }

 if (!response.ok) {
  const error = new Error(data.message || "Request failed. Please try again.");
  error.status = response.status;
  throw error;
 }

 return data;
}

function parseTokenPayload(token) {
 try {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
   normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
   "=",
  );
  const decodedPayload = atob(paddedPayload);

  return JSON.parse(decodedPayload);
 } catch {
  return null;
 }
}

function isTokenExpired(token) {
 if (!token) return true;

 const payload = parseTokenPayload(token);
 if (!payload || !payload.exp) return false;

 return payload.exp * 1000 <= Date.now() - TOKEN_EXPIRY_SKEW_MS;
}

const authStorage = {
 getToken() {
  if (typeof window === "undefined") return null;

  try {
   const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
   if (localToken) return localToken;
  } catch {
   // Ignore localStorage access issues and fallback to cookies.
  }

  const cookieValue = document.cookie
   .split("; ")
   .find((row) => row.startsWith(`${TOKEN_COOKIE_KEY}=`));

  return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
 },
 setToken(token) {
  if (typeof window === "undefined") return;

  try {
   localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
   // Ignore localStorage failures and keep cookie-based persistence.
  }

  // 30 days expiry; JWT validation still enforces real token expiry on client.
  document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
 },
 clearToken() {
  if (typeof window === "undefined") return;

  try {
   localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
   // Ignore localStorage failures and clear cookie anyway.
  }

  document.cookie = `${TOKEN_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
 },
 getUser() {
  if (typeof window === "undefined") return null;

  try {
   const storedUser = localStorage.getItem(USER_STORAGE_KEY);
   return storedUser ? JSON.parse(storedUser) : null;
  } catch {
   return null;
  }
 },
 setUser(user) {
  if (typeof window === "undefined") return;

  try {
   if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
   }
  } catch {
   // Ignore localStorage failures for user cache.
  }
 },
 clearUser() {
  if (typeof window === "undefined") return;

  try {
   localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
   // Ignore localStorage failures during cleanup.
  }
 },
 isTokenExpired,
};

export const authApi = {
 register: (payload) =>
  apiRequest(API_ROUTES.user.register, {
   method: "POST",
   body: payload,
  }),
 login: (payload) =>
  apiRequest(API_ROUTES.user.login, {
   method: "POST",
   body: payload,
  }),
 getMe: (token) =>
  apiRequest(API_ROUTES.user.me, {
   method: "GET",
   token,
  }),
 logout: (token) =>
  apiRequest(API_ROUTES.user.logout, {
   method: "GET",
   token,
  }),
};

export {
 API_BASE_URL,
 apiRequest,
 authStorage,
 parseTokenPayload,
 isTokenExpired,
};
