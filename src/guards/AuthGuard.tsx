"use client";

/**
 * AuthGuard
 * =========
 * Route protection component used to secure pages and layouts.
 *
 * Responsibilities:
 * - Prevent access to unauthenticated users
 * - Enforce role-based access control (RBAC)
 * - Wait for authentication state resolution before rendering
 *
 * Usage:
 * - Wrap protected pages or layouts with this component
 * - Optionally specify allowedRoles for fine-grained access control
 */

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/context/AuthContext";

interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: UserRole[]; 
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
    const router = useRouter();
    const { isAuthenticated, user, loading } = useAuth();

    useEffect(() => {
    
        if (loading) return;


        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

    
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.replace("/login");
        }
    }, [loading, isAuthenticated, user, allowedRoles, router]);

  
    if (loading) return null;

    if (isAuthenticated && user) {
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return null;
        }

        return <>{children}</>;
    }

    return null;
};

export default AuthGuard;
