import { demoRequest, isDemoSession } from "../services/demo.service";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/verify-email",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout",
  "/auth/csrf",
]);

let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));

  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return entry.slice(prefix.length);
  }
}

function unwrapResponse(data) {
  return data && typeof data === "object" && "data" in data ? data.data : data;
}

async function parseResponse(response) {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function ensureCsrfToken() {
  // Spring Security rotates the CSRF token after login and refresh. Fetch the
  // current token for every write so a stale XSRF-TOKEN cookie cannot cause 403.
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new ApiError(
      "Không thể lấy CSRF token. Hãy kiểm tra backend và cấu hình CORS.",
      0,
      error,
    );
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Không thể lấy CSRF token (HTTP ${response.status}).`,
      response.status,
      payload,
    );
  }

  const body = unwrapResponse(payload);
  const token =
    readCookie(CSRF_COOKIE_NAME) ||
    body?.token ||
    body?.csrfToken ||
    payload?.token ||
    payload?.csrfToken ||
    (typeof body === "string" ? body : null);

  if (!token) {
    throw new ApiError(
      "Backend trả về thành công nhưng không tìm thấy CSRF token. Kiểm tra GET /api/v1/auth/csrf.",
      response.status,
      payload,
    );
  }

  return token;
}

function canRefresh(path) {
  const normalizedPath = path.split("?")[0].replace(/\/$/, "");
  return !NO_REFRESH_PATHS.has(normalizedPath);
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api("/auth/refresh", {
      method: "POST",
      retry: false,
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api(
  path,
  { method = "GET", body, headers = {}, signal, retry = true } = {},
) {
  const normalizedMethod = method.toUpperCase();
  if (isDemoSession() && !path.startsWith("/auth/")) {
    return demoRequest(path, { method: normalizedMethod, body });
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    Accept: "application/json",
    ...(isForm || body === undefined
      ? {}
      : { "Content-Type": "application/json" }),
    ...headers,
  };

  if (!SAFE_METHODS.has(normalizedMethod)) {
    const csrfToken = await ensureCsrfToken();
    requestHeaders[CSRF_HEADER_NAME] = csrfToken;
  }

  let response;
  try {
    response = await fetch(url, {
      method: normalizedMethod,
      credentials: "include",
      signal,
      headers: requestHeaders,
      body:
        body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Không kết nối được máy chủ API. Hãy kiểm tra backend tại localhost:8080 và cấu hình CORS.",
      0,
      error,
    );
  }

  if (response.status === 401 && retry && canRefresh(normalizedPath)) {
    try {
      console.log("[Auth] 401 detected, attempting refresh:", normalizedPath);

      await refreshSession();

      return api(path, {
        method: normalizedMethod,
        body,
        headers,
        signal,
        retry: false,
      });
    } catch (refreshError) {
      console.error("[Auth] Refresh failed:", refreshError);
    }
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      data?.message ||
        data?.error ||
        `Yêu cầu thất bại (HTTP ${response.status}).`,
      response.status,
      data,
    );
  }

  return unwrapResponse(data);
}

export const queryString = (values) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const asList = (data) =>
  Array.isArray(data)
    ? data
    : data?.content || data?.items || data?.results || [];
