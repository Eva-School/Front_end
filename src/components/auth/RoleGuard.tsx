"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { authService, MeResponse } from "@/services/auth.service";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: MeResponse["role"][];
    fallbackRoute?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackRoute = "/login" }: RoleGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const user = await authService.getMe();
                if (isMounted) {
                    if (allowedRoles.includes(user.role)) {
                        setIsAuthorized(true);
                    } else {
                        setIsAuthorized(false);
                    }
                }
            } catch {
                if (isMounted) {
                    setIsAuthorized(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [allowedRoles]);

    if (isAuthorized === null) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthorized) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" gap={2}>
                <Typography variant="h4" color="error" fontWeight="bold">
                    Unauthorized Access
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    You do not have permission to view this page.
                </Typography>
                <Button variant="contained" onClick={() => router.push(fallbackRoute)}>
                    Go to Login
                </Button>
            </Box>
        );
    }

    return <>{children}</>;
}
