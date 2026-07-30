/**
 * getRedirectPathByRole
 * ====================
 * Utility function for role-based routing.
 *
 * Maps each user role to its corresponding
 * default landing page after authentication.
 *
 * Used immediately after login
 * and during session restoration.
 */


import { UserRole } from "@/context/AuthContext";

export function getRedirectPathByRole(role: UserRole): string {
    switch (role) {
        case "Admin":
            return "/admin";

        case "Teacher":
            return "/teacher";

        case "Student":
            return "/student";

        case "StudentAffairs":
            return "/vice";

        default:
            return "/login";
    }
}
