'use client';

import { useMemo, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Stack,
    Button,
    Avatar,
    Drawer,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LoginIcon from '@mui/icons-material/Login';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { navbarData } from '@/data/navbar';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useThemeMode } from '@/context/ThemeModeContext';
import AccessibleIconButton from '@/components/a11y/AccessibleIconButton';
import NotificationBell from '@/components/shared/NotificationBell';

const LOGO_SRC = '/Images/login/logo.png';

type NavLink = { label: string; href: string };

export default function SharedNavbar() {
    const theme = useTheme();
    const [openDrawer, setOpenDrawer] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();
    const { t, toggleLanguage } = useLanguage();
    const { mode, toggleMode } = useThemeMode();
    const {
        title,
        subtitle,
        centerLinks: defaultCenterLinks,
        profileHref,
    } = navbarData;


    const handleLogout = async () => {
        await logout();   
        router.replace("/login"); 
    };

    const centerLinks = useMemo<NavLink[]>(() => {
        // Not logged in: keep Home/About.
        if (!user) {
            return defaultCenterLinks
                .filter((l) => l.href !== "/years")
                .map((l) => ({
                    href: l.href,
                    label: l.href === "/" ? t("common.home") : l.href === "/about" ? t("common.about") : l.label,
                }));
        }

        // Logged in: role-based nav (Removed emojis as requested)
        if (user.role === "Student") {
            return [
                { href: "/student", label: t("common.home") },
                { href: "/student/years", label: t("common.years") },
                { href: "/student/progress", label: t("common.progress") },
                { href: "/about", label: t("common.about") },
            ];
        }

        if (user.role === "Teacher") {
            return [
                { href: "/teacher", label: t("common.home") },
                { href: "/rankings", label: t("common.rankings") },
                { href: "/about", label: t("common.about") },
            ];
        }

        if (user.role === "StudentAffairs") {
            return [
                { href: "/vice", label: t("common.home") },
                { href: "/analytics", label: t("common.analytics") },
                { href: "/rankings", label: t("common.rankings") },
                { href: "/about", label: t("common.about") },
            ];
        }

        // Admin or others
        return [
            { href: "/vice/grades", label: t("common.home") },
            { href: "/analytics", label: t("common.analytics") },
            { href: "/rankings", label: t("common.rankings") },
            { href: "/about", label: t("common.about") },
        ];
    }, [defaultCenterLinks, t, user]);

    return (
        <>
            {/* ================= AppBar ================= */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.75),
                    backdropFilter: 'blur(24px)',
                    color: theme.palette.text.primary,
                    borderRadius: '0 0 24px 24px',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0px 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
                    px: { xs: 0.6, md: 2 },
                    transition: 'all 0.3s ease',
                    zIndex: theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar
                    sx={{
                        justifyContent: 'space-between',
                        minHeight: { xs: 64, md: 80 },
                    }}
                >
                    {/* Left */}
                    <Stack direction="row" alignItems="center" spacing={1.5} component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                        <Box
                            component={motion.div}
                            whileHover={{ rotate: 5, scale: 1.05 }}
                        >
                            <Image
                                src={LOGO_SRC}
                                alt="Logo"
                                width={50}
                                height={40}
                                priority
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 800,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Stack>

                    {/* Center (Desktop only) */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        {centerLinks?.map((link) => (
                            <Button
                                key={link.label}
                                component={Link}
                                href={link.href}
                                sx={{
                                    textTransform: 'none',
                                    color: theme.palette.text.primary,
                                    px: 2.5,
                                    py: 1,
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0, left: '50%', transform: 'translateX(-50%)',
                                        width: 0, height: '3px',
                                        backgroundColor: theme.palette.primary.main,
                                        transition: 'width 0.3s ease',
                                        borderRadius: '3px 3px 0 0',
                                    },
                                    '&:hover::before': { width: '80%' },
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    },
                                }}
                            >
                                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                    {link.label}
                                </Typography>
                            </Button>
                        ))}
                    </Stack>

                    {/* Right */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        {/* Notification Bell — desktop */}
                        {user && (
                            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                <NotificationBell />
                            </Box>
                        )}

                        {/* User / Login Button */}
                        {user ? (
                            <Button
                                component={Link}
                                href={profileHref}
                                sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    textTransform: 'none',
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    px: { xs: 1.5, md: 2.5 },
                                    py: 0.8,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    }
                                }}
                            >
                                <Avatar sx={{ width: 30, height: 30, mr: { sm: 1.5 } }} />
                                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>{user.username}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                                        {user.role}
                                    </Typography>
                                </Box>
                            </Button>
                        ) : (
                            <Button
                                component={Link}
                                href="/login"
                                startIcon={<LoginIcon />}
                                sx={{
                                    display: { xs: 'none', sm: 'flex' },
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    px: 3,
                                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                                    }
                                }}
                            >
                                {t("common.login")}
                            </Button>
                        )}

                        {/* Burger Menu (Mobile) */}
                        <AccessibleIconButton
                            label={t("common.openMenu")}
                            onClick={() => setOpenDrawer(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, borderRadius: '12px' }}
                        >
                            <MenuIcon />
                        </AccessibleIconButton>

                        {/* Icons (Desktop) */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            <AccessibleIconButton
                                label={t("common.language")}
                                onClick={toggleLanguage}
                                sx={{
                                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                                    color: theme.palette.text.primary,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }
                                }}
                            >
                                <LanguageIcon fontSize="small" />
                            </AccessibleIconButton>
                            <AccessibleIconButton
                                label={mode === "dark" ? t("common.lightMode") : t("common.darkMode")}
                                onClick={toggleMode}
                                sx={{
                                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                                    color: theme.palette.text.primary,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }
                                }}
                            >
                                {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                            </AccessibleIconButton>
                            {user && (
                                <AccessibleIconButton
                                    label={t("common.logout")}
                                    onClick={handleLogout}
                                    sx={{
                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                        color: theme.palette.error.main,
                                        borderRadius: '12px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText }
                                    }}
                                >
                                    <LogoutIcon fontSize="small" />
                                </AccessibleIconButton>
                            )}
                        </Box>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* ================= Mobile Drawer ================= */}
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{
                    sx: {
                        width: '85%',
                        maxWidth: '360px',
                        height: '100%',
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px 0 0 24px',
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `-10px 0 40px ${alpha(theme.palette.common.black, 0.1)}`,
                    },
                }}
            >
                {/* Drawer Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    px={3}
                    py={3}
                    borderBottom={`1px solid ${alpha(theme.palette.divider, 0.1)}`}
                >
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{t("common.menu")}</Typography>
                    <AccessibleIconButton 
                        label={t("common.closeMenu")} 
                        onClick={() => setOpenDrawer(false)}
                        sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}
                    >
                        <CloseIcon />
                    </AccessibleIconButton>
                </Stack>

                {/* Links */}
                <Stack spacing={1} px={2} py={3}>
                    {centerLinks?.map((link) => (
                        <Button
                            key={link.label}
                            component={Link}
                            href={link.href}
                            onClick={() => setOpenDrawer(false)}
                            sx={{
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                color: theme.palette.text.primary,
                                py: 2,
                                px: 3,
                                borderRadius: '16px',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {link.label}
                            </Typography>
                        </Button>
                    ))}
                    {!user && (
                         <Button
                         component={Link}
                         href="/login"
                         onClick={() => setOpenDrawer(false)}
                         startIcon={<LoginIcon />}
                         sx={{
                             justifyContent: 'flex-start',
                             textTransform: 'none',
                             color: theme.palette.primary.contrastText,
                             backgroundColor: theme.palette.primary.main,
                             py: 2,
                             px: 3,
                             borderRadius: '16px',
                             fontWeight: 700,
                             mt: 2,
                         }}
                     >
                         {t("common.login")}
                     </Button>
                    )}
                </Stack>

                {/* Bottom Actions */}
                <Box mt="auto" px={3} pb={4}>
                    <Stack spacing={2}>
                        <Button
                            onClick={toggleLanguage}
                            startIcon={<LanguageIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderRadius: '16px',
                                p: 2,
                                fontWeight: 600,
                            }}
                        >
                            {t("common.language")}
                        </Button>
                        <Button
                            onClick={toggleMode}
                            startIcon={mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.text.primary, 0.05),
                                color: theme.palette.text.primary,
                                justifyContent: 'flex-start',
                                textTransform: 'none',
                                borderRadius: '16px',
                                p: 2,
                                fontWeight: 600,
                            }}
                        >
                            {mode === "dark" ? t("common.lightMode") : t("common.darkMode")}
                        </Button>
                        {user && (
                            <Button
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    color: theme.palette.error.main,
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    borderRadius: '16px',
                                    p: 2,
                                    fontWeight: 600,
                                }}
                            >
                                {t("common.logout")}
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Drawer>
        </>
    );
}
