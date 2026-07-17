"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { MeResponse } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: MeResponse["role"][];
    fallbackRoute?: string;
}

export default function RoleGuard({ children, allowedRoles, fallbackRoute = "/login" }: RoleGuardProps) {
    const router = useRouter();
    const t = useTranslations();
    const { user, loading } = useAuth();
    const isAuthorized = user !== null && allowedRoles.includes(user.role);

    if (loading) {
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
                    {t("auth.unauthorizedAccess")}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t("auth.unauthorizedDescription")}
                </Typography>
                <Button variant="contained" onClick={() => router.push(fallbackRoute)}>
                    {t("auth.goToLogin")}
                </Button>
            </Box>
        );
    }

    return <>{children}</>;
}
