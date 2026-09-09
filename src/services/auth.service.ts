/**
 * authService
 * ===========
 * Authentication API abstraction layer.
 *
 * Responsibilities:
 * - Encapsulate all authentication-related HTTP requests
 * - Handle login, logout, and user retrieval
 * - Manage JWT access tokens and refresh tokens
 * - Handle token refresh automatically
 *
 * This layer decouples UI components
 * from low-level API implementation details.
 */

import { tokenStorage } from "@/utils/token-storage";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(/\/+$/, "");


export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Login response with JWT tokens
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    role: "Admin" | "Teacher" | "Student" | "StudentAffairs";
}

export interface MeResponse {
    userId: number;
    role: "Admin" | "Teacher" | "Student" | "StudentAffairs";
    username: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken?: string; // Optional - some APIs only return new access token
}

/**
 * Login and store tokens
 */
async function login(payload: LoginPayload): Promise<LoginResponse> {
    const trimmedEmail = payload.email.trim();

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: trimmedEmail,
                password: payload.password,
            }),
        });
    } catch {
        throw new Error("NETWORK_ERROR");
    }

    if (!response.ok) {
        if (response.status === 400) {
            throw new Error("INVALID_REQUEST");
        } else if (response.status === 401) {
            throw new Error("INVALID_CREDENTIALS");
        } else if (response.status === 429) {
            throw new Error("RATE_LIMITED");
        } else if (response.status >= 500) {
            throw new Error("SERVER_ERROR");
        }
        throw new Error("INVALID_CREDENTIALS");
    }

    const raw = (await response.json()) as {
        accessToken: string;
        refreshToken?: string;
        role: string;
    };

    // Store tokens
    if (!raw.accessToken || !raw.refreshToken) {
        tokenStorage.clearAll();
        throw new Error("Login response is incomplete. Missing tokens.");
    }

    if (raw.accessToken) {
        tokenStorage.setAccessToken(raw.accessToken);
    }
    if (raw.refreshToken) {
        tokenStorage.setRefreshToken(raw.refreshToken);
    }

    const normalizedRole =
        raw.role === "Student Affairs" || raw.role === "StudentAffairs" ? "StudentAffairs" : raw.role;

    return {
        accessToken: raw.accessToken,
        refreshToken: raw.refreshToken,
        role:
            normalizedRole === "Admin" ||
            normalizedRole === "Teacher" ||
            normalizedRole === "Student" ||
            normalizedRole === "StudentAffairs"
                ? normalizedRole
                : "Student",
    };
}

/**
 * Get current user information
 * Uses access token from storage
 */
async function getMe(): Promise<MeResponse> {
    const accessToken = tokenStorage.getAccessToken();
    
    if (!accessToken) {
        throw new Error("Unauthenticated");
    }

    const response = await fetch(`${API_BASE_URL}/Auth/me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Token expired, try to refresh
            try {
                await refreshAccessToken();
                // Retry the request with new token
                const newToken = tokenStorage.getAccessToken();
                if (newToken) {
                    const retryResponse = await fetch(`${API_BASE_URL}/Auth/me`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${newToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                    if (retryResponse.ok) {
                        return retryResponse.json();
                    }
                }
            } catch {
                // Refresh failed, clear tokens
                tokenStorage.clearAll();
            }
        }
        tokenStorage.clearAll();
        throw new Error("Unauthenticated");
    }

    const raw = (await response.json()) as {
        userId: number;
        role: string;
        username?: string;
    };

    const normalizedRole =
        raw.role === "Student Affairs" || raw.role === "StudentAffairs" ? "StudentAffairs" : raw.role;

    return {
        userId: raw.userId,
        username: raw.username ?? "User",
        role:
            normalizedRole === "Admin" ||
            normalizedRole === "Teacher" ||
            normalizedRole === "Student" ||
            normalizedRole === "StudentAffairs"
                ? normalizedRole
                : "Student",
    };
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
        throw new Error("Session expired. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}/Auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        // Refresh failed, clear all tokens
        tokenStorage.clearAll();
        throw new Error("Token refresh failed");
    }

    const data: RefreshTokenResponse = await response.json();

    // Update tokens
    if (data.accessToken) {
        tokenStorage.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
    }
}

/**
 * Logout and clear tokens
 */
async function logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    
    try {
        // Call logout endpoint if refresh token exists
        if (refreshToken) {
            await fetch(`${API_BASE_URL}/Auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });
        }
    } catch {
        // Ignore errors, continue to clear local tokens
    } finally {
        // Always clear local tokens
        tokenStorage.clearAll();
    }
}

export const authService = {
    login,
    getMe,
    logout,
    refreshAccessToken,
};
