"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Stack,
  Container,
  CircularProgress,
  Box,
  Alert,
  Button,
} from "@mui/material";
import { teacherService } from "@/services/teacher.service";
import YearsCard from "../../../../components/TeacherComponents/YearsSection";
import type { TeacherClass } from "@/types/Teacher-api/teacher-api";
import type { YearSection } from "@/types/YearsCard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";


function ClassesContent() {
  const searchParams = useSearchParams();
  const year = searchParams?.get("year") || "junior";
  const subjectId = searchParams?.get("subject");

  const [data, setData] = useState<YearSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      setLoading(true);
      setError(null);
      try {
        const response = await teacherService.getTeacherClasses(
          year,
          subjectId || undefined
        );

        if (cancelled) return;

        // Transform API response to YearSection format
        const transformed: YearSection[] = [
          {
            id: 1,
            title: response.subjectName || "Classes",
            items: response.classes.map((cls: TeacherClass) => ({
              id: typeof cls.id === "string" ? parseInt(cls.id, 10) : cls.id,
              name: cls.className,
            })),
          },
        ];

        setData(transformed);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load classes"
          );
        }
      }
      if (!cancelled) setLoading(false);
    }

    loadClasses();
    return () => {
      cancelled = true;
    };
  }, [year, subjectId]);

  return (
  
       <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/Images/download 1 (1).png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "1300px",
          background: "rgba(50,50,50,0.3)",
          borderRadius: "28px",
          p: 2,
          mt: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
          <Button
            component={Link}
            href="/teacher"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: "#FFC600",
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              padding: "4px 12px",
              "&:hover": { backgroundColor: "rgba(255, 198, 0, 0.1)" },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

       </Box>
      {loading && (
        <Box sx={{ display: "flex", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && data.length === 0 && !error && (
        <Alert severity="info">No classes found for this subject and year.</Alert>
      )}

      {!loading && data.length > 0 && (
        <Stack  spacing={2}>
          {data.map((card) => (
            
            <YearsCard key={card.id} data={card} />
          ))}
        </Stack>
      )}
      </Box>
  
  );
}

export default function ClassesPage() {
  return (
    <Suspense
      fallback={
        <Container sx={{ marginTop: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <ClassesContent />
    </Suspense>
  );
}
