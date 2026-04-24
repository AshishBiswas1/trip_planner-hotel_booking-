const API_BASE_URL =
 process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const TOKEN_STORAGE_KEY = "token";
const TOKEN_COOKIE_KEY = "auth_token";
const USER_STORAGE_KEY = "auth_user";
const TOKEN_EXPIRY_SKEW_MS = 0;
const LEGACY_TOKEN_STORAGE_KEYS = ["auth_token", "jwt", "accessToken"];
const LEGACY_USER_STORAGE_KEYS = ["user", "authUser", "currentUser"];

function expireCookie(name, options = "") {
 document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT${options}`;
}

function clearCookieByKnownVariants(name) {
 const variants = [
  "; samesite=lax",
  "; samesite=strict",
  "; samesite=none; secure",
  "",
  "; domain=localhost",
  "; domain=.localhost",
  "; domain=127.0.0.1",
 ];

 variants.forEach((variant) => expireCookie(name, variant));
}

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
  nearby: "/hotel/nearby",
  bySlug: (slug) => `/hotel/${slug}`,
 },
 room: {
  byHotelId: (hotelId) => `/hotel/${hotelId}/rooms`,
  byId: (hotelId, roomId) => `/hotel/${hotelId}/rooms/${roomId}`,
 },
 booking: {
  create: (hotelId) => `/booking/book/${hotelId}`,
 },
 trip: {
  all: "/trip",
  byId: (id) => `/trip/${id}`,
 },
};

function buildQueryString(params = {}) {
 const searchParams = new URLSearchParams();

 Object.entries(params).forEach(([key, value]) => {
  if (value === undefined || value === null || value === "") return;
  searchParams.set(key, String(value));
 });

 const query = searchParams.toString();
 return query ? `?${query}` : "";
}

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
 if (!payload || !payload.exp || typeof payload.exp !== "number") return true;

 const currentTimeSeconds = Math.floor(
  (Date.now() + TOKEN_EXPIRY_SKEW_MS) / 1000,
 );
 return payload.exp <= currentTimeSeconds;
}

function getTokenMaxAgeSeconds(token) {
 const payload = parseTokenPayload(token);
 if (!payload?.exp || typeof payload.exp !== "number") return 0;

 // Keep cookie lifetime aligned to JWT expiry.
 const ttlMs = payload.exp * 1000 - Date.now();
 return Math.max(0, Math.floor(ttlMs / 1000));
}

const authStorage = {
 getToken() {
  if (typeof window === "undefined") return null;

  let localToken = null;
  try {
   localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
   // Ignore localStorage access issues and fallback to cookies.
  }

  const cookieValue = document.cookie
   .split("; ")
   .find((row) => row.startsWith(`${TOKEN_COOKIE_KEY}=`));

  const cookieToken = cookieValue
   ? decodeURIComponent(cookieValue.split("=")[1])
   : null;
  const storedToken = localToken || cookieToken;

  if (!storedToken) return null;

  if (isTokenExpired(storedToken)) {
   this.clearToken();
   this.clearUser();
   return null;
  }

  return storedToken;
 },
 setToken(token) {
  if (typeof window === "undefined") return;

  if (isTokenExpired(token)) {
   this.clearToken();
   this.clearUser();
   return;
  }

  try {
   localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
   // Ignore localStorage failures and keep cookie-based persistence.
  }

  const maxAge = getTokenMaxAgeSeconds(token);
  if (!maxAge) {
   this.clearToken();
   this.clearUser();
   return;
  }

  document.cookie = `${TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
 },
 clearToken() {
  if (typeof window === "undefined") return;

  try {
   localStorage.removeItem(TOKEN_STORAGE_KEY);
   LEGACY_TOKEN_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
   // Ignore localStorage failures and clear cookie anyway.
  }

  clearCookieByKnownVariants(TOKEN_COOKIE_KEY);
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
   LEGACY_USER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
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

export const hotelApi = {
 getAll: (filters = {}) =>
  apiRequest(`${API_ROUTES.hotel.all}${buildQueryString(filters)}`, {
   method: "GET",
  }),
 getNearby: ({ location, distance } = {}) =>
  apiRequest(
   `${API_ROUTES.hotel.nearby}${buildQueryString({ location, distance })}`,
   {
    method: "GET",
   },
  ),
 getBySlug: (slug) =>
  apiRequest(API_ROUTES.hotel.bySlug(slug), {
   method: "GET",
  }),
};

export const roomApi = {
 getByHotelId: (hotelId, filters = {}) => {
  const token = authStorage.getToken();
  return apiRequest(
   `${API_ROUTES.room.byHotelId(hotelId)}${buildQueryString(filters)}`,
   {
    method: "GET",
    token,
   },
  );
 },
 getById: (hotelId, roomId) => {
  const token = authStorage.getToken();
  return apiRequest(API_ROUTES.room.byId(hotelId, roomId), {
   method: "GET",
   token,
  });
 },
};

export const bookingApi = {
 createBooking: (hotelId, payload) => {
  const token = authStorage.getToken();
  return apiRequest(API_ROUTES.booking.create(hotelId), {
   method: "POST",
   body: payload,
   token,
  });
 },
};

export const tripApi = {
 createTrip: (payload) => {
  const token = authStorage.getToken();
  return apiRequest(API_ROUTES.trip.all, {
   method: "POST",
   body: payload,
   token,
  });
 },
 getUserTrips: (filters = {}) => {
  const token = authStorage.getToken();
  return apiRequest(`${API_ROUTES.trip.all}${buildQueryString(filters)}`, {
   method: "GET",
   token,
  });
 },
 getTrip: (id) => {
  const token = authStorage.getToken();
  return apiRequest(API_ROUTES.trip.byId(id), {
   method: "GET",
   token,
  });
 },
};

export {
 API_BASE_URL,
 apiRequest,
 authStorage,
 parseTokenPayload,
 isTokenExpired,
};
