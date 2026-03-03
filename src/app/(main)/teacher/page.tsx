"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { mapTeacherCardsToSharedCards } from "@/mappers/TeacherCards.mapper";
import { teacherService } from "@/services/teacher.service";
import { teacherCardsFallback } from "@/data/Teacher/TeacherCard";
import { CardData } from "@/types/SharedCard";
import type { TeacherSubject } from "@/types/Teacher-api/teacher-api";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior",
  wheeler: "Wheeler",
  senior: "Senior",
};

export default function TeacherDashboard() {
  const { displayYear, setCurrentYear } = useStudentYear();
  const [cards, setCards] = useState<CardData[]>([]);
  const [profile, setProfile] = useState({ 
    name: "Teacher", 
    year: "", 
    subtitle: "Manage your subjects and classes" 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [subjectsRes, profileRes] = await Promise.allSettled([
          teacherService.getTeacherSubjects(),
          teacherService.getTeacherProfile(),
        ]);

        if (cancelled) return;

        const subjectsData: TeacherSubject[] =
          subjectsRes.status === "fulfilled" && subjectsRes.value?.length
            ? subjectsRes.value
            : teacherCardsFallback;
        setCards(mapTeacherCardsToSharedCards(subjectsData));

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setProfile({
            name: profileRes.value.name ?? "Teacher",
            year: profileRes.value.subtitle ?? "",
            subtitle: "Manage your subjects and classes",
          });
          if (profileRes.value.currentAcademicYear) {
            setCurrentYear(profileRes.value.currentAcademicYear);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
          setCards(mapTeacherCardsToSharedCards(teacherCardsFallback));
        }
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [setCurrentYear]);

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
              year={profile.year || YEAR_LABELS[displayYear] || displayYear}
              subtitle={profile.subtitle}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress />
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              ) : (
                <>
                  {error && (
                    <Typography color="warning.main" sx={{ mb: 1 }}>
                      {error} — showing default subjects.
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
             