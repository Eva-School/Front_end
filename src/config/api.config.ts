import { authService } from "@/services/auth.service";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/backend-api";

interface ExtendedRequestInit extends RequestInit {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

const getAccessToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
const getRefreshToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

const buildHeaders = (baseHeaders?: HeadersInit, token?: string | null): Headers => {
  const headers = new Headers(baseHeaders);
  if (headers.get("Content-Type") === "multipart/form-data") {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getErrorMessage = async (res: Response): Promise<string> => {
  let errorMessage = "API request failed";
  const clonedRes = res.clone();
  try {
    const errorData = await res.json().catch(() => null) as
      | { message?: string; title?: string; errors?: Record<string, string[]> }
      | null;

    if (typeof errorData?.message === "string" && errorData.message.trim()) {
      errorMessage = errorData.message;
    } else if (typeof errorData?.title === "string" && errorData.title.trim()) {
      errorMessage = errorData.title;
    } else if (errorData?.errors && typeof errorData.errors === "object") {
      const validationMessages = Object.values(errorData.errors)
        .flat()
        .filter(Boolean)
        .join(" | ");
      if (validationMessages) errorMessage = validationMessages;
    }
  } catch {
    // Keep fallback message.
  }

  if (errorMessage === "API request failed" || errorMessage === "One or more validation errors occurred.") {
    try {
      const text = await clonedRes.text();
      if (text && text.trim()) {
         const match = text.match(/<title>(.*?)<\/title>/);
         if (match && match[1]) {
           errorMessage = match[1];
         } else {
           errorMessage = text.substring(0, 150).replace(/\n/g, ' ') + '...';
         }
      }
    } catch {}
  }

  return `${errorMessage} (HTTP ${res.status})`;
};

const getResponseBody = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? res.json() : null;
};

export const secureFetch = async <T = unknown>(
  url: string,
  options?: ExtendedRequestInit
): Promise<T> => {
  try {
    const requestOptions = { ...(options ?? {}) };
    delete requestOptions._retry;
    const accessToken = getAccessToken();
    const headers = buildHeaders(requestOptions.headers, accessToken);

    const res = await fetch(url, {
      ...requestOptions,
      headers,
    });

    if (res.status === 401 && !options?._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        throw new Error("Session expired. Please sign in again.");
      }

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(async (newToken) => {
          const retryHeaders = buildHeaders(requestOptions.headers, newToken);

          const retryRes = await fetch(url, {
            ...requestOptions,
            headers: retryHeaders,
          });
          if (!retryRes.ok) throw new Error(await getErrorMessage(retryRes));
          return getResponseBody(retryRes) as T;
        });
      }

      isRefreshing = true;
      try {
        await authService.refreshAccessToken();
        const newToken = getAccessToken();
        processQueue(null, newToken);

        const retryHeaders = buildHeaders(requestOptions.headers, newToken);

        const retryRes = await fetch(url, {
          ...requestOptions,
          headers: retryHeaders,
        });
        if (!retryRes.ok) throw new Error(await getErrorMessage(retryRes));
        return getResponseBody(retryRes) as T;
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        throw new Error("Session expired. Please sign in again.");
      } finally {
        isRefreshing = false;
      }
    }

    if (!res.ok) throw new Error(await getErrorMessage(res));
    return getResponseBody(res) as T;
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Network error occurred");
  }
};
