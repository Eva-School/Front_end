"use client";
/**
 * LoginPage
 * =========
 * Main authentication entry point for the application.
 */

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    alpha,
    Tooltip,
    IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LanguageIcon from "@mui/icons-material/Language";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeMode } from "@/context/ThemeModeContext";
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
    const { t, toggleLanguage, language } = useLanguage();
    const { mode, toggleMode } = useThemeMode();

    const [currentImage, setCurrentImage] = useState(0);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    // ===== carousel =====
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 6000);

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

        const sanitizedUsername = username.trim();
        const sanitizedPassword = password.trim();

        if (!sanitizedUsername) {
            setError(t("auth.usernameRequired"));
            return;
        }

        if (!sanitizedPassword) {
            setError(t("auth.passwordRequired"));
            return;
        }

        if (sanitizedUsername.length > 100) {
            setError(t("auth.usernameTooLong"));
            return;
        }

        if (sanitizedPassword.length > 200) {
            setError(t("auth.passwordTooLong"));
            return;
        }

        const sanitizeInput = (input: string) => {
            return input.replace(/[<>\"']/g, "");
        };

        try {
            const loggedUser = await login(
                sanitizeInput(sanitizedUsername),
                sanitizedPassword
            );
            const redirectPath = getRedirectPathByRole(loggedUser.role);
            router.replace(redirectPath);
        } catch {
            setError(t("auth.invalidCredentials"));
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: theme.palette.background.default, position: "relative" }}>

            {/* ===== Controls (top-right corner) ===== */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    display: "flex",
                    gap: 1,
                    zIndex: 10,
                }}
            >
                {/* Language Toggle */}
                <Tooltip title={language === "ar" ? "English" : "عربي"} arrow>
                    <IconButton
                        onClick={toggleLanguage}
                        component={motion.button}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        sx={{
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: "blur(10px)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            color: theme.palette.text.primary,
                            borderRadius: "12px",
                            width: 42,
                            height: 42,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        <LanguageIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Dark / Light Mode Toggle */}
                <Tooltip title={mode === "dark" ? t("common.lightMode") : t("common.darkMode")} arrow>
                    <IconButton
                        onClick={toggleMode}
                        component={motion.button}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        sx={{
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: "blur(10px)",
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            color: theme.palette.text.primary,
                            borderRadius: "12px",
                            width: 42,
                            height: 42,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.main,
                            },
                        }}
                    >
                        {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
            {/* Right - Login (Form Section) */}
            <Box
                sx={{
                    width: { xs: "100%", md: "45%" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Animated Background Blob */}
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    sx={{
                        position: "absolute",
                        top: "-20%",
                        left: "-20%",
                        width: "140%",
                        height: "140%",
                        background: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 60%)`,
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                />

                <Box 
                    component={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    sx={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1, px: 3 }}
                >
                    {/* Logos */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 4,
                            mb: 4,
                        }}
                    >
                        {logos.map((src, index) => (
                            <Box
                                key={index}
                                component={motion.img}
                                whileHover={{ scale: 1.1, rotate: index === 0 ? -5 : 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                src={src}
                                alt={`logo-${index}`}
                                sx={{
                                    width: { xs: 120, sm: 140 },
                                    height: { xs: 120, sm: 140 },
                                    objectFit: "contain",
                                    filter: `drop-shadow(0px 8px 16px ${alpha(theme.palette.common.black, 0.1)})`,
                                }}
                            />
                        ))}
                    </Box>

                    {/* Premium Glassmorphic Login Card */}
                    <Card
                        sx={{
                            p: { xs: 3, sm: 5 },
                            borderRadius: "24px",
                            bgcolor: alpha(theme.palette.background.paper, 0.7),
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.1)}`,
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0, left: 0, right: 0, height: "4px",
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`,
                            }
                        }}
                    >
                        <Typography 
                            variant="h3" 
                            mb={1} 
                            sx={{ 
                                fontWeight: 800, 
                                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            {t("auth.adminPortal")}
                        </Typography>

                        <Typography
                            variant="body1"
                            color={theme.palette.text.secondary}
                            mb={4}
                            sx={{ fontWeight: 500 }}
                        >
                            {t("auth.signInSubtitle")}
                        </Typography>

                        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                          <TextField
                              fullWidth
                              label={t("auth.username")}
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              sx={{ 
                                  mb: 3,
                                  "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: alpha(theme.palette.background.default, 0.5),
                                      transition: "all 0.3s ease",
                                      "&:hover": { bgcolor: alpha(theme.palette.background.default, 0.8) },
                                      "&.Mui-focused": { bgcolor: theme.palette.background.paper, boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}` }
                                  }
                              }}
                              autoComplete="username"
                              inputProps={{ maxLength: 100 }}
                          />

                          <TextField
                              fullWidth
                              label={t("auth.password")}
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              sx={{ 
                                  mb: 2,
                                  "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      bgcolor: alpha(theme.palette.background.default, 0.5),
                                      transition: "all 0.3s ease",
                                      "&:hover": { bgcolor: alpha(theme.palette.background.default, 0.8) },
                                      "&.Mui-focused": { bgcolor: theme.palette.background.paper, boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}` }
                                  }
                              }}
                              autoComplete="current-password"
                              inputProps={{ maxLength: 200 }}
                          />

                          <AnimatePresence>
                              {error && (
                                  <Box
                                      component={motion.div}
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                  >
                                      <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem", fontWeight: 600 }}>
                                          {error}
                                      </Typography>
                                  </Box>
                              )}
                          </AnimatePresence>

                          <Button
                              type="submit"
                              fullWidth
                              disabled={loading}
                              component={motion.button}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                  height: 50,
                                  mt: 2,
                                  borderRadius: "12px",
                                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                                  transition: "background-color 0.2s ease",
                                  "&:hover": {
                                      backgroundColor: theme.palette.primary.dark,
                                  },
                              }}
                          >
                              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                                  {loading ? t("auth.signingIn") : t("auth.signIn")}
                              </Typography>
                          </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            textAlign="center"
                            mt={4}
                            color={theme.palette.text.secondary}
                        >
                            {t("auth.noAccount")} <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{t("auth.contactAdmin")}</Typography>
                        </Typography>
                    </Card>
                </Box>
            </Box>

            {/* Left - Carousel (Image Section) */}
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    width: "55%",
                    position: "relative",
                    overflow: "hidden",
                    borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            backgroundImage: `url(${images[currentImage]})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </AnimatePresence>
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background
                            .default, 0.8)} 0%, ${alpha(theme.palette.common.black, 0.4)} 100%)`,
                        zIndex: 1,
                    }}
                />
            </Box>
        </Box>
    );
};

export default LoginPage;
