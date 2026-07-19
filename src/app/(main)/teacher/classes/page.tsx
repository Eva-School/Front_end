"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Chip,
  alpha,
  useTheme,
  Container,
  Skeleton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { teacherService, SubjectWithClasses } from "@/services/teacher.service";
import { useLanguage } from "@/context/LanguageContext";

const LEVEL_LABEL: Record<string, string> = {
  junior: "Junior",
  wheeler: "Wheeler",
  senior: "Senior",
};

const LEVEL_COLORS: Record<string, string> = {
  junior: "#FFC600",
  wheeler: "#2196F3",
  senior: "#9C27B0",
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

function ClassRow({
  cls,
  year,
  subjectId,
  subjectName,
  accentColor,
  index,
}: {
  cls: { classId: number | string; className: string };
  year: string;
  subjectId: number;
  subjectName: string;
  accentColor: string;
  index: number;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { t, dir } = useLanguage();

  const handleClick = () => {
    const params = new URLSearchParams({
      classId: String(cls.classId),
      subject: subjectName,
      year,
      subjectId: String(subjectId),
    });
    router.push(`/teacher/grade?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          cursor: "pointer",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
          transition: "all 0.2s ease",
          "&:last-child": { borderBottom: "none" },
          "&:hover": {
            bgcolor: alpha(accentColor, 0.07),
            transform: `translateX(${dir === "rtl" ? "-4px" : "4px"})`,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: accentColor,
              boxShadow: `0 0 8px ${alpha(accentColor, 0.6)}`,
            }}
          />
          <Typography fontWeight={600} color="text.primary" fontSize="0.95rem">
            {cls.className}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t("teacherModule.viewStudentsAndGrade")}
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 16, color: accentColor }} />
        </Box>
      </Box>
    </motion.div>
  );
}

function ClassesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useLanguage();
  const year = searchParams?.get("year") || "junior";

  const [subjects, setSubjects] = useState<SubjectWithClasses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stageKey = year.toLowerCase();
  const accentColor = LEVEL_COLORS[stageKey] ?? "#FFC600";
  const levelLabel = LEVEL_LABEL[stageKey] ? t(`vice.${stageKey}`, LEVEL_LABEL[stageKey]) : year;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    teacherService
      .getTeacherClassesGrouped(year)
      .then((data) => {
        if (!cancelled) {
          setSubjects(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("teacherModule.failedLoadClasses"));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [year, t]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top right, ${alpha(accentColor, 0.08)}, transparent 50%),
                     radial-gradient(circle at bottom left, ${alpha(theme.palette.secondary?.main || accentColor, 0.06)}, transparent 50%),
                     ${theme.palette.background.default}`,
        pb: 8,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Back Button & Title */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 5 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/teacher")}
              sx={{
                color: accentColor,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { bgcolor: alpha(accentColor, 0.08) },
              }}
            >
              {t("teacherModule.backToDashboard")}
            </Button>
            <Box sx={{ height: 20, width: 1, bgcolor: alpha(theme.palette.divider, 0.5) }} />
            <Chip
              label={`${levelLabel} ${t("teacherModule.academicYear")}`}
              size="small"
              sx={{ bgcolor: alpha(accentColor, 0.12), color: accentColor, fontWeight: 700, border: `1px solid ${alpha(accentColor, 0.3)}` }}
            />
          </Box>

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${accentColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("teacherModule.yourClasses")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
            {t("teacherModule.selectClassDescription", { year: levelLabel })}
          </Typography>
        </motion.div>

        {/* Loading skeletons */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        )}

        {/* Empty */}
        {!loading && !error && subjects.length === 0 && (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <GroupsIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>{t("teacherModule.noClassesAssigned")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("teacherModule.noClassesAssignedDescription", { year: levelLabel })}
            </Typography>
          </Box>
        )}

        {/* Subject + Classes cards */}
        <AnimatePresence>
          {!loading && !error && subjects.map((subject, idx) => (
            <motion.div
              key={subject.subjectId || idx}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={idx}
              style={{ marginBottom: 24 }}
            >
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${alpha(accentColor, 0.2)}`,
                  backdropFilter: "blur(12px)",
                  background: alpha(theme.palette.background.paper, 0.85),
                  boxShadow: `0 4px 24px ${alpha(accentColor, 0.08)}`,
                }}
              >
                {/* Subject Header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: `linear-gradient(135deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColor, 0.05)})`,
                    borderBottom: `1px solid ${alpha(accentColor, 0.2)}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(accentColor, 0.15),
                      color: accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MenuBookIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={accentColor}>
                      {subject.subjectName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("teacherModule.classCount").replace("{count}", String(subject.classes.length))}
                    </Typography>
                  </Box>
                </Box>

                {/* Classes list */}
                {subject.classes.length === 0 ? (
                  <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">{t("teacherModule.noClassesForSubject")}</Typography>
                  </Box>
                ) : (
                  subject.classes.map((cls, ci) => (
                    <ClassRow
                      key={cls.classId}
                      cls={cls}
                      year={year}
                      subjectId={subject.subjectId}
                      subjectName={subject.subjectName}
                      accentColor={accentColor}
                      index={ci}
                    />
                  ))
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default function ClassesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <CircularProgress />
        </Box>
      }
    >
      <ClassesContent />
    </Suspense>
  );
}
