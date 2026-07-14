"use client";

/**
 * AuthContext
 * ===========
 * Central authentication state manager for the frontend application.
 *
 * Responsibilities:
 * - Store the currently authenticated user (userId, role)
 * - Expose authentication state (isAuthenticated, loading)
 * - Handle login and logout actions
 * - Fetch the current user via `/auth/me` on application startup
 *
 * This context acts as the single source of truth
 * for authentication across the frontend.
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { authService } from "@/services/auth.service";


export type UserRole = "Admin" | "Teacher" | "Student" | "StudentAffairs";

export interface AuthUser {
    userId: number;
    role: UserRole;
    username: string;


}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    
    const refreshUser = async () => {
        try {
            setLoading(true);
            const me = await authService.getMe();
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    
    const login = async (username: string, password: string) => {
        setLoading(true);

        try {
            // Login and get tokens (tokens are stored automatically in authService)
            await authService.login({
                username,
                password,
            });

            // Get user info using the stored token
            const me = await authService.getMe();

            setUser(me);
            return me;
        } finally {
            setLoading(false);
        }
    };

   
    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};
