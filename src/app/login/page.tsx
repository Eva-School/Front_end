"use client";
/**
 * LoginPage
 * =========
 * Main authentication entry point for the application.
 *
 * Responsibilities:
 * - Collect user credentials (username, password)
 * - Call the login API to authenticate the user
 * - Redirect the user based on their assigned role
 * - Automatically redirect already authenticated users
 *
 * Security Notes:
 * - No tokens are stored in localStorage or sessionStorage
 * - Authentication relies entirely on HttpOnly cookies
 */

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getRedirectPathByRole } from "@/utils/auth-redirect";

const images = [
    "/Images/login/1.jpg",
    "/Images/login/2.jpg",
    "/Images/login/3.jpg",
    "/Images/login/4.jpg",
    "/Images/login/5.jpg",
    "/Images/login/6.jpg",
    "/Images/login/7.jpg",
    "/Images/login/8.jpg",
    "/Images/login/9.jpg",
    "/Images/login/10.jpg",
];

const logos = [
    "/Images/login/logo.png",
    "/Images/login/logo2.png",
];

const LoginPage = () => {
    const theme = useTheme();
    const router = useRouter();
    const { login, isAuthenticated, user, loading } = useAuth();

    const [currentImage, setCurrentImage] = useState(0);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    // ===== carousel =====
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 9000);

        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
        if (isAuthenticated && user) {
            const path = getRedirectPathByRole(user.role);
            router.replace(path);
        }
    }, [isAuthenticated, user, router]);

    // ===== handlers =====
    const handleLogin = async () => {
        setError(null);

        try {
            const loggedUser = await login(username, password);
            const redirectPath = getRedirectPathByRole(loggedUser.role);
            router.replace(redirectPath);
        } catch (err: any) {
            setError("Invalid username or password");
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex" }}>
            {/* Right - Login */}
            <Box
                sx={{
                    width: { xs: "100%", md: "40%" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ width: "100%", maxWidth: 420 }}>
                    {/* Logos */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 3,
                            mb: 3,
                        }}
                    >
                        {logos.map((src, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={src}
                                alt={`logo-${index}`}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    objectFit: "contain",
                                }}
                            />
                        ))}
                    </Box>

                    {/* Login Card */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: "20px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                        }}
                    >
                        <Typography variant="h2" mb={1}>
                            Admin Portal
                        </Typography>

                        <Typography
                            variant="body2"
                            color={theme.palette.text.secondary}
                            mb={3}
                        >
                            Sign in to access student records and grade management.
                        </Typography>

                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        {error && (
                            <Typography color="error" mb={2}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            disabled={loading}
                            onClick={handleLogin}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                height: 44,
                                borderRadius: "10px",
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            <Typography variant="h3">
                                {loading ? "Signing In..." : "Sign In"}
                            </Typography>
                        </Button>

                        <Typography
                            variant="body2"
                            textAlign="center"
                            mt={3}
                            color={theme.palette.text.secondary}
                        >
                            Don’t have an account?{" "}
                            <strong>Contact your administrator</strong>
                        </Typography>
                    </Card>
                </Box>
            </Box>

            {/* Left - Carousel */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    width: "90%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${images[currentImage]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9))",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
