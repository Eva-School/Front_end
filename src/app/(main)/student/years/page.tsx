"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import CategoryCard from "@/components/StudentComponents/CategoryCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentYearsFallback } from "@/data/Student/years";
import { studentService } from "@/services/student.service";
import type { YearOption } from "@/types/Student-api/grades";

export default function StudentYearsPage() {
  const router = useRouter();
  const { setSelectedYear } = useStudentYear();
  const [years, setYears] = useState<YearOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await studentService.getStudentYears();
        if (!cancelled && data?.length) setYears(data);
        else if (!cancelled) setYears(studentYearsFallback);
      } catch {
        if (!cancelled) setYears(studentYearsFallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSelectYear = (yearId: YearOption["id"]) => {
    setSelectedYear(yearId);
    router.push("/student");
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('/Images/image.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Box
        sx={{
          background: "rgba(88, 107, 170, 0.25)",
          backdropFilter: "blur(2px)",
          borderRadius: "32px",
          boxShadow: "0 8px 32px rgba(77, 82, 161, 0.37)",
          padding: "48px",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
       

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {years.map((category) => (
              <CategoryCard
                key={category.id}
                number={category.number}
                title={category.title}
                onClick={() => handleSelectYear(category.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
