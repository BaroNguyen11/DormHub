import { demoRequest, isDemoSession } from "../services/demo.service";
import { toast } from "sonner";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/verify-email",
  "/auth/send-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout",
  "/auth/csrf",
]);

let refreshPromise = null;
let redirectingToLogin = false;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function formatValidationErrors(payload) {
  const value = payload?.errors ?? payload?.message;
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.message || item?.defaultMessage || item?.error,
      )
      .filter(Boolean)
      .join(" · ");
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .filter((item) => typeof item === "string" && item.trim())
      .join(" · ");
  }
  return typeof value === "string" ? value : "";
}

function clearLocalAuthTokens() {
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      for (const key of [
        "token",
        "accessToken",
        "refreshToken",
        "jwt",
        "authToken",
      ]) {
        storage.removeItem(key);
      }
    }
  } catch {
    // Session cookies are the primary auth mechanism in this app.
  }
}

function notifyApiError(error, path) {
  const status = error?.status;
  const authPath = path.split("?")[0].replace(/\/$/, "");
  if (status === 0 || !status) {
    toast.error(
      "Không thể kết nối với Backend. Vui lòng kiểm tra lại dịch vụ Server!",
    );
    return;
  }

  const payload = error?.details;
  switch (status) {
    case 400:
      toast.error(
        formatValidationErrors(payload) ||
          error.message ||
          "Dữ liệu gửi lên không hợp lệ.",
      );
      break;
    case 409:
      toast.error(
        payload?.message ||
          error.message ||
          "Dữ liệu (Email/Tên đăng nhập/SĐT) đã tồn tại trong hệ thống!",
      );
      break;
    case 401:
      if (authPath === "/auth/me" || authPath === "/auth/refresh") {
        if (typeof window !== "undefined") clearLocalAuthTokens();
        break;
      }
      if (authPath === "/auth/login") {
        toast.error(
          payload?.message ||
            error.message ||
            "Thông tin đăng nhập không hợp lệ.",
        );
        break;
      }
      if (redirectingToLogin) break;
      toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
      if (typeof window !== "undefined") {
        redirectingToLogin = true;
        clearLocalAuthTokens();
        if (window.location.pathname !== "/login")
          window.location.assign("/login");
      }
      break;
    case 403:
      toast.error("Bạn không có quyền thực hiện chức năng này!");
      break;
    case 404:
      toast.error("Không tìm thấy đường dẫn API hoặc dữ liệu yêu cầu!");
      break;
    case 500:
      toast.error("Lỗi hệ thống máy chủ (Lỗi 500). Vui lòng thử lại sau!");
      break;
    default:
      toast.error(error.message || `Yêu cầu thất bại (HTTP ${status}).`);
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

  // Empty response
  if (!raw) return null;

  // Backend bug: trả về string "undefined" hoặc "null"
  if (raw === "undefined" || raw === "null") {
    console.warn(
      "⚠️ Backend trả về string 'undefined' hoặc 'null' - treating as null",
    );
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Nếu không parse được JSON, trả về raw string
    console.warn("⚠️ Response không phải JSON:", raw.substring(0, 100));
    return raw;
  }
}

async function ensureCsrfToken() {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/csrf`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new ApiError("Không thể lấy CSRF token.", 0, error);
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(payload?.message || `Lỗi CSRF (HTTP ${response.status})`, response.status, payload);
  }

  const body = unwrapResponse(payload);
  
  const token =
    body?.token ||
    body?.csrfToken ||
    payload?.token ||
    payload?.csrfToken ||
    readCookie(CSRF_COOKIE_NAME) ||
    (typeof body === "string" ? body : null);

  if (!token) {
    throw new ApiError("Không tìm thấy CSRF token trong response /auth/csrf", response.status, payload);
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
      notify: false,
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api(
  path,
  {
    method = "GET",
    body,
    headers = {},
    signal,
    retry = true,
    notify = true,
    successMessage,
  } = {},
) {
  const rawPath = typeof path === "string" ? path.trim() : "";
  if (
    !rawPath ||
    rawPath.toLowerCase().includes("null") ||
    rawPath.toLowerCase().includes("undefined")
  ) {
    console.warn("[API] Đã chặn request do endpoint không hợp lệ:", path);
    throw new ApiError("Endpoint API không hợp lệ.", 0, { path });
  }
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  const normalizedMethod = method.toUpperCase();
  if (isDemoSession() && !normalizedPath.startsWith("/auth/")) {
    return demoRequest(normalizedPath, { method: normalizedMethod, body });
  }

  const endpoint = normalizedPath;
  const url = `${API_BASE_URL}${endpoint}`;
  if (
    !url ||
    url.toLowerCase().includes("null") ||
    url.toLowerCase().includes("undefined")
  ) {
    console.warn("[API] Đã chặn request do URL không hợp lệ:", url);
    throw new ApiError("URL API không hợp lệ.", 0, { url });
  }
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    Accept: "application/json",
    ...(isForm || body === undefined
      ? {}
      : { "Content-Type": "application/json" }),
    ...headers,
  };

  if (!SAFE_METHODS.has(normalizedMethod)) {
    try {
      const csrfToken = await ensureCsrfToken();
      requestHeaders[CSRF_HEADER_NAME] = csrfToken;
    } catch (error) {
      if (notify) notifyApiError(error, normalizedPath);
      throw error;
    }
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
    const apiError = new ApiError(
      "Không thể kết nối với Backend. Vui lòng kiểm tra lại dịch vụ Server!",
      0,
      error,
    );
    if (notify) notifyApiError(apiError, normalizedPath);
    throw apiError;
  }

  if (response.status === 401 && retry && canRefresh(normalizedPath)) {
    try {
      console.log("[Auth] 401 detected, attempting refresh:", normalizedPath);

      await refreshSession();

      return api(endpoint, {
        method: normalizedMethod,
        body,
        headers,
        signal,
        retry: false,
        notify,
        successMessage,
      });
    } catch (refreshError) {
      console.error("[Auth] Refresh failed:", refreshError);
    }
  }

  if (
    response.status === 401 &&
    ["/auth/me", "/auth/refresh"].includes(normalizedPath)
  ) {
    clearLocalAuthTokens();
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const apiError = new ApiError(
      data?.message ||
        data?.error ||
        `Yêu cầu thất bại (HTTP ${response.status}).`,
      response.status,
      data,
    );
    if (notify) notifyApiError(apiError, normalizedPath);
    throw apiError;
  }

  // if (
  //   notify &&
  //   response.ok &&
  //   ((successMessage && [200, 201, 204].includes(response.status)) ||
  //     ([200, 201].includes(response.status) && data?.message))
  // ) {
  //   toast.success(successMessage || data.message);
  // }
  if (normalizedPath === "/auth/login" && response.ok)
    redirectingToLogin = false;

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
