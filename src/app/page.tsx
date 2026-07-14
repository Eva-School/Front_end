"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import SecurityIcon from "@mui/icons-material/Security";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { useLanguage } from "@/context/LanguageContext";

const entrance = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function WorkspacePreview() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const mutedLine = alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.18 : 0.1);

  const rows = [
    { label: "Quarter grades", icon: <CalendarViewMonthIcon fontSize="small" /> },
    { label: "Final assessments", icon: <AssignmentIcon fontSize="small" /> },
    { label: "Performance overview", icon: <BarChartIcon fontSize="small" /> },
  ];

  return (
    <Box
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={entrance}
      transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
      sx={{ position: "relative", width: "100%", maxWidth: 510, mx: "auto", px: { xs: 0.5, sm: 1 } }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          width: "61%",
          height: "86%",
          right: { xs: -5, sm: -18 },
          top: 32,
          border: `1px solid ${alpha(primary, 0.28)}`,
          backgroundColor: alpha(primary, 0.05),
          borderRadius: { xs: "28px 38px 28px 38px", sm: "34px 52px 34px 52px" },
          transform: "rotate(4deg)",
        }}
      />
      <Box
        sx={{
          position: "relative",
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
          borderRadius: { xs: 4, sm: 5 },
          overflow: "hidden",
          background: theme.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.97)}, ${alpha(theme.palette.background.default, 0.86)})`
            : `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.99)}, ${alpha(theme.palette.background.default, 0.82)})`,
          boxShadow: `0 26px 62px ${alpha(theme.palette.common.black, theme.palette.mode === "dark" ? 0.32 : 0.11)}, inset 0 1px 0 ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.06 : 0.8)}`,
          p: { xs: 2.25, sm: 3.25 },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="overline" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.12em", lineHeight: 1 }}>
              ACADEMIC WORKSPACE
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.75, fontWeight: 800 }}>
              One record, clear next steps
            </Typography>
          </Box>
          <Box
            sx={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${alpha(primary, 0.38)}`,
              color: primary,
              borderRadius: 2.5,
              backgroundColor: alpha(primary, 0.07),
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={1.1}>
          {rows.map((row, index) => (
            <Stack
              key={row.label}
              direction="row"
              alignItems="center"
              spacing={1.4}
              sx={{
                minHeight: 58,
                px: 1.5,
                borderRadius: 2.5,
                border: `1px solid ${index === 0 ? alpha(primary, 0.22) : "transparent"}`,
                borderLeft: `3px solid ${index === 0 ? primary : "transparent"}`,
                backgroundColor: index === 0 ? alpha(primary, 0.09) : alpha(theme.palette.background.default, 0.28),
              }}
            >
              <Box sx={{ color: index === 0 ? primary : theme.palette.text.secondary, display: "grid", placeItems: "center" }}>
                {row.icon}
              </Box>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: index === 0 ? 750 : 600 }}>
                {row.label}
              </Typography>
              <Box sx={{ width: { xs: 44, sm: 76 }, height: 6, backgroundColor: mutedLine }} />
            </Stack>
          ))}
        </Stack>

        <Box
          sx={{
            mt: 2.5,
            p: 1.75,
            borderRadius: 2.5,
            border: `1px solid ${alpha(theme.palette.divider, 0.72)}`,
            backgroundColor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.35 : 0.56),
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.7, fontWeight: 700, letterSpacing: "0.05em" }}>
            BUILT FOR FOCUSED REVIEW
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {["Review", "Record", "Understand"].map((label) => (
              <Typography key={label} variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function HomePage() {
  const theme = useTheme();
  const { t } = useLanguage();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const roles = [
    {
      number: "01",
      icon: <PersonIcon fontSize="small" />,
      title: t("home.audience.studentsTitle"),
      description: t("home.audience.studentsDesc"),
    },
    {
      number: "02",
      icon: <MenuBookIcon fontSize="small" />,
      title: t("home.audience.teachersTitle"),
      description: t("home.audience.teachersDesc"),
    },
    {
      number: "03",
      icon: <SecurityIcon fontSize="small" />,
      title: t("home.audience.adminsTitle"),
      description: t("home.audience.adminsDesc"),
    },
  ];

  const capabilities = [
    { number: "01", icon: <CalendarViewMonthIcon />, title: t("home.features.quarterTitle"), detail: t("home.features.quarterDetail") },
    { number: "02", icon: <AssignmentIcon />, title: t("home.features.finalTitle"), detail: t("home.features.finalDetail") },
    { number: "03", icon: <SchoolIcon />, title: t("home.features.jadaratTitle"), detail: t("home.features.jadaratDetail") },
    { number: "04", icon: <MenuBookIcon />, title: t("home.features.yearsTitle"), detail: t("home.features.yearsDetail") },
    { number: "05", icon: <BarChartIcon />, title: t("home.features.averagesTitle"), detail: t("home.features.averagesDetail") },
  ];

  const heroBullets = [t("home.heroBullet1"), t("home.heroBullet2"), t("home.heroBullet3")];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.palette.background.default, color: theme.palette.text.primary, overflow: "hidden" }}>
      <SharedNavbar />

      <Box component="main">
        <Box
          component="section"
          sx={{
            position: "relative",
            py: { xs: 8, md: 12 },
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: { xs: 72, md: 88 },
              right: { xs: "-35%", md: "8%" },
              width: { xs: 330, md: 530 },
              height: { xs: 330, md: 530 },
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(primary, 0.16)} 0%, transparent 68%)`,
              pointerEvents: "none",
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.05fr) minmax(360px, 0.95fr)" }, gap: { xs: 6, md: 8 }, alignItems: "center" }}>
              <Box component={motion.div} initial="hidden" animate="visible" variants={entrance} transition={{ duration: 0.5, ease: "easeOut" }}>
                <Stack direction="row" alignItems="center" spacing={1.1} sx={{ mb: 3 }}>
                  <Box sx={{ width: 30, height: 2, bgcolor: primary }} />
                  <Typography variant="overline" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.14em" }}>
                    ACADEMIC CLARITY
                  </Typography>
                </Stack>

                <Typography component="h1" sx={{ maxWidth: 680, fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4.45rem" }, lineHeight: 0.98, letterSpacing: "-0.055em", fontWeight: 800 }}>
                  {t("home.title")}
                </Typography>
                <Typography variant="h6" sx={{ mt: 3, maxWidth: 560, color: theme.palette.text.secondary, fontWeight: 400, lineHeight: 1.7, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                  {t("home.subtitle")}
                </Typography>

                <Stack spacing={1.2} sx={{ my: 4, maxWidth: 620 }}>
                  {heroBullets.map((bullet) => (
                    <Stack key={bullet} direction="row" spacing={1.25} alignItems="flex-start">
                      <CheckCircleOutlineIcon sx={{ color: primary, fontSize: 20, mt: "2px", flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.65 }}>
                        {bullet}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                  <Button
                    component={Link}
                    href="/login"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      px: 3,
                      py: 1.35,
                      borderRadius: 1.5,
                      bgcolor: primary,
                      color: theme.palette.getContrastText(primary),
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": { bgcolor: alpha(primary, 0.86), boxShadow: "none" },
                    }}
                  >
                    {t("auth.signIn")}
                  </Button>
                  <Button component={Link} href="/about" variant="text" sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, px: 2, py: 1.35, color: theme.palette.text.primary, fontWeight: 750, textTransform: "none" }}>
                    {t("common.about")}
                  </Button>
                </Stack>
              </Box>

              <WorkspacePreview />
            </Box>
          </Container>
        </Box>

        <Container component="section" maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(250px, 0.78fr) minmax(0, 1.22fr)" }, gap: { xs: 4, md: 8 } }}>
            <Box>
              <Typography variant="overline" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.13em" }}>
                PLATFORM ROLES
              </Typography>
              <Typography component="h2" sx={{ mt: 1, fontSize: { xs: "2rem", md: "2.65rem" }, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 800 }}>
                {t("home.audienceTitle")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
                {t("home.audienceSubtitle")}
              </Typography>
            </Box>

            <Box>
              {roles.map((role, index) => (
                <Box key={role.number} sx={{ py: { xs: 2.25, md: 2.7 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.85)}`, borderBottom: index === roles.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.85)}` : "none" }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr)", gap: { xs: 1.5, sm: 2.5 } }}>
                    <Typography variant="caption" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.08em", pt: 0.35 }}>
                      {role.number}
                    </Typography>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ display: "grid", placeItems: "center", color: primary }}>{role.icon}</Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{role.title}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9, lineHeight: 1.7, maxWidth: 620 }}>
                        {role.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>

        <Box component="section" sx={{ py: { xs: 7, md: 10 }, backgroundColor: alpha(secondary, theme.palette.mode === "dark" ? 0.1 : 0.06), borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "flex-end" }, gap: 3, mb: 5 }}>
              <Box>
                <Typography variant="overline" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.13em" }}>
                  ACADEMIC TOOLKIT
                </Typography>
                <Typography component="h2" sx={{ mt: 1, fontSize: { xs: "2rem", md: "2.65rem" }, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 800 }}>
                  {t("home.featuresTitle")}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440, lineHeight: 1.7 }}>
                {t("home.featuresSubtitle")}
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.85)}`, borderLeft: { lg: `1px solid ${alpha(theme.palette.divider, 0.85)}` } }}>
              {capabilities.map((feature) => (
                <Box key={feature.number} component={motion.div} whileHover={{ y: -4 }} transition={{ duration: 0.18 }} sx={{ minHeight: 252, p: 2.5, borderRight: { lg: `1px solid ${alpha(theme.palette.divider, 0.85)}` }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.85)}`, backgroundColor: alpha(theme.palette.background.paper, 0.38), "@media (prefers-reduced-motion: reduce)": { transform: "none !important" } }}>
                  <Typography variant="caption" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.08em" }}>{feature.number}</Typography>
                  <Box sx={{ color: theme.palette.text.primary, mt: 4, mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.65 }}>{feature.detail}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <Container component="section" maxWidth="lg" sx={{ py: { xs: 7, md: 11 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.83fr) minmax(0, 1.17fr)" }, gap: { xs: 4, md: 8 }, alignItems: "start" }}>
            <Box sx={{ position: "sticky", top: 104 }}>
              <Typography variant="overline" sx={{ color: primary, fontWeight: 800, letterSpacing: "0.13em" }}>OUR PURPOSE</Typography>
              <Typography component="h2" sx={{ mt: 1, fontSize: { xs: "2rem", md: "2.65rem" }, lineHeight: 1.04, letterSpacing: "-0.04em", fontWeight: 800 }}>{t("home.goalTitle")}</Typography>
            </Box>
            <Stack spacing={2.25}>
              {[t("home.goal1"), t("home.goal2"), t("home.goal3")].map((paragraph, index) => (
                <Box key={paragraph} sx={{ pl: 2.25, borderLeft: `2px solid ${index === 0 ? primary : alpha(theme.palette.divider, 0.9)}` }}>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>{paragraph}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>

        <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: theme.palette.text.primary, color: theme.palette.background.default }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" }, gap: 4, alignItems: "end" }}>
              <Box>
                <Chip label="SCHOOL GRADING SYSTEM" size="small" sx={{ mb: 2.5, color: theme.palette.background.default, backgroundColor: alpha(theme.palette.background.default, 0.13), fontWeight: 800, letterSpacing: "0.07em" }} />
                <Typography component="h2" sx={{ maxWidth: 670, fontSize: { xs: "2.2rem", md: "3.35rem" }, lineHeight: 1.03, letterSpacing: "-0.045em", fontWeight: 800 }}>{t("home.ctaTitle")}</Typography>
                <Typography variant="body1" sx={{ mt: 2, maxWidth: 550, color: alpha(theme.palette.background.default, 0.72), lineHeight: 1.7 }}>{t("home.ctaSubtitle")}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                <Button component={Link} href="/login" variant="contained" endIcon={<ArrowForwardIcon />} sx={{ px: 3, py: 1.35, borderRadius: 1.5, bgcolor: primary, color: theme.palette.getContrastText(primary), fontWeight: 800, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: alpha(primary, 0.86), boxShadow: "none" } }}>
                  {t("auth.signIn")}
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
