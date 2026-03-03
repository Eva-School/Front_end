/**
 * authService
 * ===========
 * Authentication API abstraction layer.
 *
 * Responsibilities:
 * - Encapsulate all authentication-related HTTP requests
 * - Handle login, logout, and user retrieval
 * - Ensure credentials are sent with every request
 *
 * This layer decouples UI components
 * from low-level API implementation details.
 */

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "/api";


export interface LoginPayload {
    username: string;
    password: string;
}


export interface LoginResponse {
    role: "Admin" | "Teacher" | "Student";
}

export interface MeResponse {
    userId: number;
    role: "Admin" | "Teacher" | "Student";
}


async function login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
     
        throw new Error("Invalid username or password");
    }

    return response.json();
}


async function getMe(): Promise<MeResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Unauthenticated");
    }

    return response.json();
}

async function logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }
}

export const authService = {
    login,
    getMe,
    logout,
};
