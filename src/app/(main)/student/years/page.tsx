"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, useTheme, alpha } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CategoryCard from "@/components/StudentComponents/CategoryCard";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentService } from "@/services/student.service";
import type { YearOption } from "@/types/Student-api/grades";
import { useLanguage } from "@/context/LanguageContext";

export default function StudentYearsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const { setSelectedYear } = useStudentYear();
  const [years, setYears] = useState<YearOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await studentService.getStudentYears();
        if (!cancelled) setYears(data ?? []);
      } catch (requestError) {
        if (!cancelled) {
          setYears([]);
          setError(requestError instanceof Error ? requestError.message : "Academic years could not be loaded.");
        }
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
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        overflow: "hidden",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Animated Background Gradients */}
      <Box
        component={motion.div}
        animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        sx={{
            position: "absolute",
            top: "-30%",
            left: "-20%",
            width: "150%",
            height: "150%",
            background: `radial-gradient(circle at 40% 40%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 50%),
                         radial-gradient(circle at 70% 60%, ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.1)}, transparent 50%)`,
            zIndex: 0,
            pointerEvents: "none",
        }}
      />

      <Box
        component={motion.div}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        sx={{
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: "blur(24px)",
          borderRadius: "32px",
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.1)}`,
          padding: { xs: 4, md: 6 },
          maxWidth: "1000px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
            variant="h3"
            component={motion.h1}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{
                fontWeight: 800,
                textAlign: "center",
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
            }}
        >
            {t("common.years") || "Academic Years"}
        </Typography>
        
        <Typography
            variant="body1"
            component={motion.p}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            sx={{
                textAlign: "center",
                color: theme.palette.text.secondary,
                mb: 6,
                fontWeight: 500,
            }}
        >
            Select an academic year to view details and progress.
        </Typography>

        <AnimatePresence mode="wait">
            {loading ? (
            <Box 
                component={motion.div}
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                sx={{ display: "flex", justifyContent: "center", py: 8 }}
            >
                <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
            </Box>
            ) : error ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="body1" color="error">{error}</Typography>
            </Box>
            ) : years.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">No academic years are available.</Typography>
            </Box>
            ) : (
            <Box
                component={motion.div}
                key="content"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
                maxWidth: "800px",
                margin: "0 auto",
                }}
            >
                {years.map((category, index) => (
                <CategoryCard
                    key={category.id}
                    number={category.number}
                    title={category.title}
                    onClick={() => handleSelectYear(category.id)}
                    index={index}
                />
                ))}
            </Box>
            )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
