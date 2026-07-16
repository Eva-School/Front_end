"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { teacherService } from "@/services/teacher.service";
import { CardData } from "@/types/SharedCard";
import Looks3Icon from "@mui/icons-material/Looks3";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior",
  wheeler: "Wheeler",
  senior: "Senior",
};

const getYearIcon = (yearId: string): CardData["icon"] => {
  if (yearId === "wheeler") return LooksTwoIcon;
  if (yearId === "senior") return Looks3Icon;
  return LooksOneIcon;
};

export default function TeacherDashboard() {
  const { displayYear, setCurrentYear } = useStudentYear();
  const { t } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState({ 
    name: "",
    year: "", 
    subtitle: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dashboardRes, profileRes] = await Promise.allSettled([
          teacherService.getTeacherDashboardYears(),
          teacherService.getTeacherProfile(),
        ]);

        if (cancelled) return;

        if (dashboardRes.status === "fulfilled") {
          const teacherCards: CardData[] = dashboardRes.value.map((yearBlock) => ({
            id: yearBlock.yearId,
            title: YEAR_LABELS[yearBlock.yearId]
              ? t(`vice.${yearBlock.yearId}`, YEAR_LABELS[yearBlock.yearId])
              : yearBlock.yearId,
            description: yearBlock.classes.length
              ? yearBlock.classes.map((cls) => cls.className).join(" - ")
              : t("dashboards.noAssignedClasses"),
            href: `/teacher/classes?year=${encodeURIComponent(yearBlock.yearId)}`,
            icon: getYearIcon(yearBlock.yearId),
          }));
          setCards(teacherCards);
        } else {
          setCards([]);
          setError(
            dashboardRes.reason instanceof Error
              ? dashboardRes.reason.message
              : t("dashboards.failedLoadYears")
          );
        }

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setProfile({
            name: profileRes.value.name ?? t("dashboards.teacher"),
            year: profileRes.value.currentAcademicYear
              ? (YEAR_LABELS[profileRes.value.currentAcademicYear]
                  ? t(`vice.${profileRes.value.currentAcademicYear}`, YEAR_LABELS[profileRes.value.currentAcademicYear])
                  : profileRes.value.currentAcademicYear)
              : "",
            subtitle: t("dashboards.manageSubjectsClasses"),
          });
          if (profileRes.value.currentAcademicYear && profileRes.value.currentAcademicYear in YEAR_LABELS) {
            setCurrentYear(profileRes.value.currentAcademicYear as "junior" | "wheeler" | "senior");
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("dashboards.somethingWentWrong"));
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

  return (
    <>
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
          rgba(0, 0, 0, 0.75),
          rgba(5, 5, 10, 0.85)
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
        <Box sx={{ position: "relative", zIndex: 1, p: "10px 15px" }}>
          <Box
            sx={{
              minHeight: "calc(100vh - 64px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DashboardHeader
              name={profile.name}
              year={profile.year || t(`vice.${displayYear}`, YEAR_LABELS[displayYear] || displayYear)}
              subtitle={profile.subtitle || t("dashboards.manageSubjectsClasses")}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress />
                  <Typography color="text.secondary">{t("common.loading")}</Typography>
                </Box>
              ) : (
                <>
                  {error && (
                    <Typography color="warning.main" sx={{ mb: 1 }}>
                      {error}
                    </Typography>
                  )}
                  {!error && cards.length === 0 && (
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {t("dashboards.noAssignedYears")}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: "20px", md: "20px", lg: "33px", xl: "75px" },
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
    </>
  );
}
             
