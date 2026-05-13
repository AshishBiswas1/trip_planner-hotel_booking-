const API_BASE_URL =
 process.env.NEXT_PUBLIC_API_BASE_URL ||
 (process.env.NODE_ENV === "development" ? "http://localhost:8000/api/v1" : "");
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
  forgetPassword: "/user/forgot-password",
  resetPassword: (token) => `/user/reset-password/${token}`,
  logout: "/user/logout",
  me: "/user/me",
  updatePassword: "/user/updateMyPassword",
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
  create: (hotelId) => `/hotel/${hotelId}/rooms`,
 },
 booking: {
  create: (hotelId) => `/booking/book/${hotelId}`,
  me: "/booking/me",
 },
 review: {
  me: "/review/me",
 },
 payment: {
  me: "/booking/my-payments",
 },
 trip: {
  all: "/trip",
  byId: (id) => `/trip/${id}`,
 },
 travel: {
  trainSearch: "/travel/trains/search",
  trainSchedule: "/travel/trains/schedule",
  flightSearch: "/travel/flights/search",
  flightSchedule: "/travel/flights/schedule",
  busSearch: "/travel/buses/search",
  busStops: "/travel/buses/stops",
 },
 ai: {
  estimateTrip: "/ai/estimate-trip",
  ping: "/ai/ping",
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
 const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

 if (!API_BASE_URL) {
  throw new Error(
   "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your frontend environment.",
  );
 }

 // Use the configured `API_BASE_URL` exactly as provided in the environment.
 // There are no runtime URL overrides, tunneling, or mixed-content checks here.

 const requestHeaders = {
  ...headers,
 };

 if (body && !isFormData) {
  requestHeaders["Content-Type"] = "application/json";
 }

 if (token) {
  requestHeaders.Authorization = `Bearer ${token}`;
 }

 // Ensure the effective base URL contains an `/api` segment (e.g. /api/v1)
 // so routes are appended correctly.
 const requestUrl = `${API_BASE_URL.replace(/\/+$/g, "")}${route}`;
 const fetchOptions = {
  method,
  headers: requestHeaders,
  body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
 };

 let response;
 try {
  response = await fetch(requestUrl, fetchOptions);
 } catch (err) {
  const networkError = new Error(
   err?.message ||
    "Network error. Could not reach the API — check your connection or CORS settings.",
  );
  networkError.isNetworkError = true;
  networkError.original = err;
  throw networkError;
 }

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
  const serverMessage =
   data?.message ||
   data?.error ||
   (data?.errors && data.errors[0]?.message) ||
   response.statusText ||
   `Request failed with status ${response.status}`;
  const error = new Error(serverMessage);
  error.status = response.status;
  error.response = data;
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
 forgetPassword: (payload) =>
  apiRequest(API_ROUTES.user.forgetPassword, {
   method: "POST",
   body: payload,
  }),
 resetPassword: (token, payload) =>
  apiRequest(API_ROUTES.user.resetPassword(token), {
   method: "PATCH",
   body: payload,
  }),
 getMe: (token) =>
  apiRequest(API_ROUTES.user.me, {
   method: "GET",
   token,
  }),
 updateMe: (payload, token) =>
  apiRequest(API_ROUTES.user.me, {
   method: "PATCH",
   body: payload,
   token,
  }),
 updatePassword: (payload, token) =>
  apiRequest(API_ROUTES.user.updatePassword, {
   method: "PATCH",
   body: payload,
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
 getMyBookings: (token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.booking.me, {
   method: "GET",
   token,
  }),
};

export const aiApi = {
 estimateTrip: (payload, token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.ai.estimateTrip, {
   method: "POST",
   body: payload,
   token,
  }),
 ping: () => apiRequest(API_ROUTES.ai.ping, { method: "GET" }),
};

export const paymentApi = {
 createTravelPayment: (payload) => {
  const token = authStorage.getToken();
  return apiRequest("/booking/book-travel", {
   method: "POST",
   body: payload,
   token,
  });
 },
 getMyPayments: (token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.payment.me, {
   method: "GET",
   token,
  }),
};

export const reviewApi = {
 getMyReviews: (token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.review.me, {
   method: "GET",
   token,
  }),
 updateReview: (id, payload, token = authStorage.getToken()) =>
  apiRequest(`/review/${id}`, {
   method: "PATCH",
   body: payload,
   token,
  }),
 deleteReview: (id, token = authStorage.getToken()) =>
  apiRequest(`/review/${id}`, {
   method: "DELETE",
   token,
  }),
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
 getUserTrips: (filters = {}, token = authStorage.getToken()) => {
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
 updateTrip: (id, payload, token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.trip.byId(id), {
   method: "PATCH",
   body: payload,
   token,
  }),
 deleteTrip: (id, token = authStorage.getToken()) =>
  apiRequest(API_ROUTES.trip.byId(id), {
   method: "DELETE",
   token,
  }),
};

export const travelApi = {
 searchTrainsByRoute: ({ from, to, travelDate } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.trainSearch}${buildQueryString({ from, to, travelDate })}`,
   {
    method: "GET",
   },
  ),
 getTrainSchedule: ({ trainNo, from, to, travelDate } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.trainSchedule}${buildQueryString({ trainNo, from, to, travelDate })}`,
   {
    method: "GET",
   },
  ),
 searchFlightsByRoute: ({ from, to, travelDate } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.flightSearch}${buildQueryString({ from, to, travelDate })}`,
   {
    method: "GET",
   },
  ),
 getFlightSchedule: ({ flightNo } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.flightSchedule}${buildQueryString({ flightNo })}`,
   {
    method: "GET",
   },
  ),
 searchBusesByRoute: ({ from, to, travelDate } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.busSearch}${buildQueryString({ from, to, travelDate })}`,
   {
    method: "GET",
   },
  ),
 getBusStops: ({ busId, travelDate } = {}) =>
  apiRequest(
   `${API_ROUTES.travel.busStops}${buildQueryString({ busId, travelDate })}`,
   {
    method: "GET",
   },
  ),
};

export {
 API_BASE_URL,
 apiRequest,
 authStorage,
 parseTokenPayload,
 isTokenExpired,
};
