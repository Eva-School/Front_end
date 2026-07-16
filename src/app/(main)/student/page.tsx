"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { mapStudentCardsToSharedCards } from "@/mappers/StudentCards.mapper";
import { studentService } from "@/services/student.service";
import { CardData } from "@/types/SharedCard";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior",
  senior: "Senior",
  wheeler: "Wheeler",
};

export default function StudentDashboard() {
  const { displayYear, setCurrentYear } = useStudentYear();
  const { t } = useLanguage();
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState({ name: "", year: "", subtitle: "" });
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
          setError(cardsRes.reason instanceof Error ? cardsRes.reason.message : t("dashboards.somethingWentWrong"));
        }
        const cardsData = cardsRes.status === "fulfilled" ? cardsRes.value : [];
        setCards(mapStudentCardsToSharedCards(cardsData));

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setProfile({
            name: profileRes.value.name ?? t("dashboards.student"),
            year: profileRes.value.year ?? "",
            subtitle: profileRes.value.subtitle ?? t("dashboards.academicOverview"),
          });
          if (profileRes.value.currentAcademicYear) {
            setCurrentYear(profileRes.value.currentAcademicYear);
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
              subtitle={profile.subtitle || t("dashboards.academicOverview")}
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
                      {t("dashboards.noStudentCards")}
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
