"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import ClassIcon from "@mui/icons-material/Class";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { mapStudentCardsToSharedCards } from "@/mappers/StudentCards.mapper";
import { studentService } from "@/services/student.service";
import { StudentProfileData } from "@/types/Student-api/grades";
import { CardData } from "@/types/SharedCard";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior",
  senior: "Senior",
  wheeler: "Wheeler",
};

export default function StudentDashboard() {
  const theme = useTheme();
  const { displayYear, setCurrentYear } = useStudentYear();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cardsRes, profileRes] = await Promise.allSettled([
          studentService.getStudentCards(),
          studentService.getStudentProfile(),
        ]);

        if (cancelled) return;

        if (cardsRes.status === "rejected") {
          setError(
            cardsRes.reason instanceof Error
              ? cardsRes.reason.message
              : t("dashboards.somethingWentWrong")
          );
        }
        const cardsData = cardsRes.status === "fulfilled" ? cardsRes.value : [];
        setCards(mapStudentCardsToSharedCards(cardsData));

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setProfile(profileRes.value);
          if (profileRes.value.currentAcademicYear) {
            setCurrentYear(profileRes.value.currentAcademicYear);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t("dashboards.somethingWentWrong")
          );
          setCards([]);
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setCurrentYear, t]);

  const displayName = profile
    ? isRtl && profile.nameArabic
      ? profile.nameArabic
      : profile.name
    : t("dashboards.student");

  const displayYearLabel = profile?.year
    ? profile.year
    : t(`vice.${displayYear}`, YEAR_LABELS[displayYear] || displayYear);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(
              rgba(0, 0, 0, 0.78),
              rgba(5, 5, 12, 0.88)
            ),
            url('/Images/login/3.jpg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, p: { xs: "12px", md: "24px" } }}>
        <Box
          sx={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DashboardHeader
            name={displayName}
            year={displayYearLabel}
            subtitle={profile?.subtitle || t("dashboards.academicOverview")}
          >
            {/* Live Academic Badges Bar */}
            {profile && (
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mb: 4,
                  mt: -2,
                  p: 1.5,
                  borderRadius: "16px",
                  bgcolor: alpha(theme.palette.background.paper, 0.08),
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                }}
              >
                {profile.studentCode && (
                  <Chip
                    icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                    label={profile.studentCode}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      borderColor: "rgba(255,255,255,0.2)",
                      bgcolor: "rgba(255,255,255,0.05)",
                    }}
                  />
                )}

                {profile.className && profile.className !== "Unassigned" && (
                  <Chip
                    icon={<ClassIcon sx={{ fontSize: 16 }} />}
                    label={`${profile.className}${profile.section ? ` - ${profile.section}` : ""}`}
                    size="small"
                    sx={{
                      color: "#90caf9",
                      borderColor: "rgba(144, 202, 249, 0.3)",
                      bgcolor: "rgba(144, 202, 249, 0.1)",
                    }}
                  />
                )}

                {profile.majorName && (
                  <Chip
                    icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                    label={profile.majorName}
                    size="small"
                    sx={{
                      color: "#ce93d8",
                      borderColor: "rgba(206, 147, 216, 0.3)",
                      bgcolor: "rgba(206, 147, 216, 0.1)",
                    }}
                  />
                )}

                {profile.overallPercentage !== null && profile.overallPercentage !== undefined && (
                  <Chip
                    icon={<GradeIcon sx={{ fontSize: 16, color: "#ffd54f !important" }} />}
                    label={`${t("dashboards.average", "Average")}: ${profile.overallPercentage}%`}
                    size="small"
                    sx={{
                      color: "#ffd54f",
                      borderColor: "rgba(255, 213, 79, 0.3)",
                      bgcolor: "rgba(255, 213, 79, 0.1)",
                      fontWeight: 700,
                    }}
                  />
                )}

                {profile.totalCompetencies > 0 && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 16, color: "#81c784 !important" }} />}
                    label={<>Jadarat: <bdi dir="ltr">{`${profile.completedCompetencies}/${profile.totalCompetencies}`}</bdi></>}
                    size="small"
                    sx={{
                      color: "#81c784",
                      borderColor: "rgba(129, 199, 132, 0.3)",
                      bgcolor: "rgba(129, 199, 132, 0.1)",
                    }}
                  />
                )}
              </Stack>
            )}

            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}>
                <CircularProgress sx={{ color: "primary.main" }} />
                <Typography color="text.secondary">{t("common.loading")}</Typography>
              </Box>
            ) : (
              <>
                {error && (
                  <Typography color="warning.main" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                {!error && cards.length === 0 && (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {t("dashboards.noStudentCards")}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: "20px", md: "24px", lg: "32px", xl: "48px" },
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {cards.map((card) => (
                    <SharedCard key={card.id} {...card} />
                  ))}
                </Box>
              </>
            )}
          </DashboardHeader>
        </Box>
      </Box>
    </Box>
  );
}
