"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  alpha,
  Box,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const easeOut: Easing = "easeOut";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: easeOut } },
};

interface AdminCard {
  id: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  exclusive?: boolean;
}

const ADMIN_CARDS: AdminCard[] = [
  {
    id: "students",
    icon: <PeopleIcon fontSize="large" />,
    href: "/vice/students",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "teachers",
    icon: <SchoolIcon fontSize="large" />,
    href: "/vice/teachers",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "quarterGrades",
    icon: <CalendarViewMonthIcon fontSize="large" />,
    href: "/vice/grades",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "finalGrades",
    icon: <AssignmentTurnedInIcon fontSize="large" />,
    href: "/vice/grades/final",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    exclusive: true,
  },
  {
    id: "settings",
    icon: <SettingsIcon fontSize="large" />,
    href: "/vice/settings",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "rankings",
    icon: <BarChartIcon fontSize="large" />,
    href: "/rankings",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
];

export default function AdminDashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isDark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        mt: { xs: "-64px", md: "-80px" },
        pt: { xs: "64px", md: "80px" },
        background: isDark
          ? `linear-gradient(160deg,
              ${alpha("#0f0c29", 0.97)} 0%,
              ${alpha("#302b63", 0.97)} 50%,
              ${alpha("#24243e", 0.97)} 100%)`
          : `linear-gradient(160deg,
              ${alpha("#1a1a2e", 0.95)} 0%,
              ${alpha("#16213e", 0.95)} 50%,
              ${alpha("#0f3460", 0.95)} 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: -120,
          left: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(primary, 0.18)} 0%, transparent 70%)`,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha("#764ba2", 0.15)} 0%, transparent 70%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 5, md: 8 } }}>
        {/* ── Header ── */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          sx={{ mb: { xs: 6, md: 8 }, textAlign: "center" }}
        >
          {/* Icon badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: `0 12px 40px ${alpha("#667eea", 0.45)}`,
              mb: 3,
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 42, color: "#fff" }} />
          </Box>

          {/* Greeting chip */}
          {user?.username && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label={`${t("dashboards.welcome", { name: user.username })}`}
                sx={{
                  bgcolor: alpha("#fff", 0.1),
                  color: alpha("#fff", 0.85),
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${alpha("#fff", 0.15)}`,
                }}
              />
            </Box>
          )}

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "2.2rem", sm: "3rem", md: "3.6rem" },
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#fff",
              mb: 1.5,
            }}
          >
            {t("dashboards.admin")}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: alpha("#fff", 0.6),
              fontWeight: 400,
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            {t("dashboards.adminSubtitle")}
          </Typography>

          {/* Decorative divider */}
          <Box
            sx={{
              mt: 3,
              mx: "auto",
              width: 56,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #667eea, #764ba2)",
            }}
          />
        </Box>

        {/* ── Cards Grid ── */}
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {ADMIN_CARDS.map((card) => {
            const title = t(`dashboards.adminCards.${card.id}.title`);
            const description = t(`dashboards.adminCards.${card.id}.description`);

            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                style={{ "@media (prefers-reduced-motion: reduce)": { transform: "none" } } as React.CSSProperties}
              >
                <Box
                  component={Link}
                  href={card.href}
                  id={`admin-card-${card.id}`}
                  aria-label={title}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: `1px solid ${alpha("#fff", card.exclusive ? 0.22 : 0.1)}`,
                    background: alpha("#fff", 0.05),
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: card.exclusive
                      ? `0 8px 32px ${alpha("#43e97b", 0.22)}, 0 0 0 1px ${alpha("#43e97b", 0.2)}`
                      : `0 8px 32px ${alpha("#000", 0.25)}`,
                    transition: "box-shadow 0.25s ease, border-color 0.25s ease",
                    "&:hover": {
                      boxShadow: `0 16px 48px ${alpha("#000", 0.38)}`,
                      borderColor: alpha("#fff", 0.25),
                    },
                    p: { xs: 3, md: 3.5 },
                  }}
                >
                  {/* Card gradient accent bar */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: card.gradient,
                    }}
                  />

                  {/* Exclusive badge */}
                  {card.exclusive && (
                    <Chip
                      label="Admin only"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: alpha("#43e97b", 0.18),
                        color: "#43e97b",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        height: 22,
                        border: `1px solid ${alpha("#43e97b", 0.35)}`,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      mb: 2.5,
                      boxShadow: `0 4px 20px ${alpha("#000", 0.3)}`,
                    }}
                  >
                    {card.icon}
                  </Box>

                  {/* Text */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      fontWeight: 800,
                      mb: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha("#fff", 0.58),
                      lineHeight: 1.65,
                      mb: 3,
                    }}
                  >
                    {description}
                  </Typography>

                  {/* CTA arrow */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ color: alpha("#fff", 0.55) }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, letterSpacing: "0.04em", fontSize: "0.75rem" }}
                    >
                      OPEN
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Stack>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
