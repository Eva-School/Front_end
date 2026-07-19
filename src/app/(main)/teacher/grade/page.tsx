"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Alert,
  Paper,
  useTheme,
  Chip,
  alpha,
  Container,
  Skeleton,
  InputAdornment,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { teacherService } from "@/services/teacher.service";
import type { TeacherStudent } from "@/types/Teacher-api/teacher-api";
import { appToast } from "@/hooks/useAppToast";
import { useLanguage } from "@/context/LanguageContext";

// ---------- Excel Export ----------
const exportToExcel = (students: TeacherStudent[], subject: string, classId: string, year: string, labels: string[]) => {
  const headers = labels;
  const rows = students.map((s) => [
    s.name,
    s.q1 ?? "-",
    s.q2 ?? "-",
    s.q3 ?? "-",
    s.q4 ?? "-",
    s.finalGrade ?? "-",
    s.status ?? "-",
  ]);

  const csvContent = [
    [`Subject: ${subject}`, `Class: ${classId}`, `Level: ${year}`],
    [],
    headers,
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", `${subject}_Class${classId}_grades.csv`);
  link.click();
};

// ---------- Quarter Input Cell ----------
function QuarterCell({
  value,
  onChange,
  label, max,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  accentColor: string;
  max?: number;
}) {
  return (
    <Tooltip title={label} arrow>
      <TextField
        size="small"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ min: 0, max, style: { textAlign: "center", padding: "6px 4px", width: 52 } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: accentColor },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: accentColor },
          },
        }}
      />
    </Tooltip>
  );
}

// ---------- Main Grade Content ----------
interface StudentGrades {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

function GradeContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();

  const classId = searchParams?.get("classId") ?? "";
  const subject = searchParams?.get("subject") ?? t("teacherModule.subject");
  const year = searchParams?.get("year") ?? "junior";
  const subjectId = searchParams?.get("subjectId") ?? "";

  const LEVEL_COLORS: Record<string, string> = {
    junior: "#FFC600",
    wheeler: "#2196F3",
    senior: "#9C27B0",
  };
  const accentColor = LEVEL_COLORS[year] ?? "#FFC600";

  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [grades, setGrades] = useState<Record<string | number, StudentGrades>>({});
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string | number>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Load students
  useEffect(() => {
    if (!classId || !subjectId) {
      setError(t("teacherModule.missingGradeContext"));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    teacherService.getClassStudents(classId, subjectId).then((data) => {
      if (cancelled) return;
      const sts = data.students || [];
      setStudents(sts);
      // Pre-fill grades from API
      const initGrades: Record<string | number, StudentGrades> = {};
      sts.forEach((s) => {
        initGrades[s.id] = {
          q1: s.q1 != null ? String(s.q1) : "",
          q2: s.q2 != null ? String(s.q2) : "",
          q3: s.q3 != null ? String(s.q3) : "",
          q4: s.q4 != null ? String(s.q4) : "",
        };
      });
      setGrades(initGrades);
      setLoading(false);
    }).catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : t("teacherModule.failedLoadStudents"));
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [classId, subjectId, t]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enteredCount = students.filter((s) => [s.q1, s.q2, s.q3, s.q4].some((value) => value != null)).length;
  const pendingCount = students.length - enteredCount;
  const avgGrade =
    students.length > 0 && students.some((s) => [s.q1, s.q2, s.q3, s.q4].some((value) => value != null))
      ? (
          students.reduce((acc, s) => acc + [s.q1, s.q2, s.q3, s.q4].filter((value): value is number => value != null).reduce((sum, value) => sum + value, 0), 0) /
          students.reduce((count, s) => count + [s.q1, s.q2, s.q3, s.q4].filter((value) => value != null).length, 0)
        ).toFixed(1)
      : null;

  const getGrade = (id: string | number): StudentGrades =>
    grades[id] ?? { q1: "", q2: "", q3: "", q4: "" };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "passed": return t("teacherModule.passed");
      case "failed": return t("teacherModule.failed");
      default: return t("teacherModule.pending");
    }
  };

  const setStudentGrade = (id: string | number, key: keyof StudentGrades, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [id]: { ...getGrade(id), [key]: value },
    }));
    // Remove from saved if modified
    setSavedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  // Save a single student's grades
  const handleSave = async (student: TeacherStudent) => {
    setSavingId(student.id);
    const g = getGrade(student.id);
    const q1 = g.q1 !== "" ? Number(g.q1) : undefined;
    const q2 = g.q2 !== "" ? Number(g.q2) : undefined;
    const q3 = g.q3 !== "" ? Number(g.q3) : undefined;
    const q4 = g.q4 !== "" ? Number(g.q4) : undefined;
    try {
      await teacherService.saveStudentGrade({
        classId, studentId: student.id, subjectId, q1, q2, q3, q4,
      });

      setStudents((current) => current.map((item) => item.id === student.id
        ? { ...item, q1, q2, q3, q4 }
        : item));
      setSavedIds((prev) => new Set([...prev, student.id]));
      appToast.success(t("teacherModule.gradesSavedFor", { name: student.name }));

    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("teacherModule.failedSaveGrade"));
    } finally {
      setSavingId(null);
    }
  };

  // Save ALL students at once
  const handleSaveAll = async () => {
    setBulkSaving(true);
    const studentsToSave = filtered.filter((student) => {
      const grade = getGrade(student.id);
      return grade.q1 !== "" || grade.q2 !== "" || grade.q3 !== "" || grade.q4 !== "";
    });
    let successCount = 0;
    const failedStudents: string[] = [];
    for (const student of studentsToSave) {
      const g = getGrade(student.id);
      const q1 = g.q1 !== "" ? Number(g.q1) : undefined;
      const q2 = g.q2 !== "" ? Number(g.q2) : undefined;
      const q3 = g.q3 !== "" ? Number(g.q3) : undefined;
      const q4 = g.q4 !== "" ? Number(g.q4) : undefined;
      try {
        await teacherService.saveStudentGrade({
          classId, studentId: student.id, subjectId, q1, q2, q3, q4,
        });
        setSavedIds((prev) => new Set([...prev, student.id]));
        setStudents((current) => current.map((item) => item.id === student.id
          ? { ...item, q1, q2, q3, q4 }
          : item));
        successCount++;
      } catch {
        failedStudents.push(student.name);
      }
    }

    setBulkSaving(false);
    const summary = t("teacherModule.gradesSavedCount", { count: successCount, total: studentsToSave.length });
    if (failedStudents.length > 0) {
      appToast.error(`${summary}. ${t("teacherModule.failedStudents", "Failed")}: ${failedStudents.join(", ")}`);
    } else if (successCount > 0) {
      appToast.success(summary);
    } else {
      appToast.info(t("teacherModule.noGradesToSave", "No entered grades were available to save."));
    }
    setSnackbar(summary);
  };

  const backUrl = `/teacher/classes?year=${year}`;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top right, ${alpha(accentColor, 0.07)}, transparent 50%),
                     ${theme.palette.background.default}`,
        pb: 8,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(backUrl)}
              sx={{ color: accentColor, fontWeight: 600, textTransform: "none", "&:hover": { bgcolor: alpha(accentColor, 0.08) } }}
            >
              {t("teacherModule.backToClasses")}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Chip
              label={year}
              sx={{ bgcolor: alpha(accentColor, 0.12), color: accentColor, fontWeight: 700, border: `1px solid ${alpha(accentColor, 0.3)}` }}
            />
            <Chip label={subject} variant="outlined" />
            <Chip label={`${t("teacherModule.class")} ${classId}`} variant="outlined" />
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
            {t("teacherModule.gradeStudents")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {t("teacherModule.gradeStudentsDescription")}
          </Typography>
        </motion.div>

        {/* Stats Cards */}
        {!loading && !error && students.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 4 }}>
              {[
                { label: t("teacherModule.totalStudents"), value: students.length, icon: <PeopleIcon />, color: accentColor },
                { label: t("teacherModule.withGrades"), value: enteredCount, icon: <CheckCircleIcon />, color: "#4CAF50" },
                { label: t("teacherModule.pending"), value: pendingCount, icon: <EmojiEventsIcon />, color: "#F44336" },
                { label: t("teacherModule.quarterAverage"), value: avgGrade ?? "—", icon: <AssessmentIcon />, color: "#FF9800" },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: alpha(stat.color, 0.07),
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ color: stat.color, display: "flex" }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color={stat.color}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </motion.div>
        )}

        {/* Toolbar */}
        {!loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                size="small"
                placeholder={t("teacherModule.searchStudent")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <Button
                variant="outlined"
                startIcon={<GetAppIcon />}
                onClick={() => exportToExcel(students, subject, classId, year, [t("teacherModule.studentName"), "Q1", "Q2", "Q3", "Q4", t("teacherModule.finalGrade"), t("teacherModule.status")])}
                sx={{ fontWeight: 600, textTransform: "none", borderColor: accentColor, color: accentColor, "&:hover": { borderColor: accentColor, bgcolor: alpha(accentColor, 0.06) } }}
              >
                {t("teacherModule.exportGrades")}
              </Button>
              <Button
                variant="contained"
                startIcon={bulkSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAll}
                disabled={bulkSaving || filtered.every((student) => {
                  const grade = getGrade(student.id);
                  return grade.q1 === "" && grade.q2 === "" && grade.q3 === "" && grade.q4 === "";
                })}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
                  color: theme.palette.mode === "dark" ? "#000" : "#000",
                  "&:hover": { filter: "brightness(0.9)" },
                }}
              >
                {bulkSaving ? t("teacherModule.savingAll") : `${t("teacherModule.saveAll")} (${filtered.length})`}
              </Button>
            </Box>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {/* Error */}
        {!loading && error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {students.length === 0 ? t("teacherModule.noStudents") : t("teacherModule.noSearchResults")}
          </Alert>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${alpha(accentColor, 0.15)}`,
                boxShadow: `0 4px 24px ${alpha(accentColor, 0.06)}`,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ background: `linear-gradient(90deg, ${alpha(accentColor, 0.15)}, ${alpha(accentColor, 0.05)})` }}>
                    {["#", t("teacherModule.studentName"), "Q1", "Q2", "Q3", "Q4", t("teacherModule.quarterAverage"), t("teacherModule.finalGrade"), t("teacherModule.status"), t("teacherModule.action")].map((h) => (
                      <TableCell
                        key={h}
                        align={h === t("teacherModule.studentName") || h === "#" ? (dir === "rtl" ? "right" : "left") : "center"}
                        sx={{ fontWeight: 800, fontSize: "0.82rem", color: theme.palette.text.primary, py: 2, whiteSpace: "nowrap" }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((student, rowIdx) => {
                    const g = getGrade(student.id);
                    const isSaving = savingId === student.id;
                    const isSaved = savedIds.has(student.id);
                    const entered = [g.q1, g.q2, g.q3, g.q4]
                      .filter((v) => v !== "")
                      .map(Number)
                      .filter((n) => !isNaN(n));
                    const computedTeacherGrade =
                      entered.length > 0
                        ? Math.round(entered.reduce((a, b) => a + b, 0) / entered.length)
                        : null;

                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rowIdx * 0.03 }}
                        style={{ display: "table-row" }}
                      >
                        <TableCell sx={{ color: "text.secondary", fontWeight: 600, py: 1.5 }}>
                          {rowIdx + 1}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                bgcolor: alpha(accentColor, 0.15),
                                color: accentColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.75rem",
                              }}
                            >
                              {student.name.charAt(0).toUpperCase()}
                            </Box>
                            {student.name}
                            {isSaved && <CheckCircleIcon sx={{ fontSize: 16, color: "#4CAF50" }} />}
                          </Box>
                        </TableCell>
                        {(["q1", "q2", "q3", "q4"] as const).map((q) => (
                          <TableCell key={q} align="center" sx={{ py: 1.5 }}>
                            <QuarterCell
                              label={q.toUpperCase()}
                              value={g[q]}
                              onChange={(v) => setStudentGrade(student.id, q, v)}
                              accentColor={accentColor}
                              max={student[`max${q.toUpperCase()}` as "maxQ1" | "maxQ2" | "maxQ3" | "maxQ4"]}
                            />
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography fontWeight={700} color={accentColor}>
                            {computedTeacherGrade ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography fontWeight={600} color="text.secondary">
                            {student.finalGrade ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          {student.status ? (
                            <Chip
                              label={getStatusLabel(student.status)}
                              size="small"
                              sx={{
                                bgcolor: student.status.toLowerCase() === "passed" ? alpha("#4CAF50", 0.12) : alpha(accentColor, 0.12),
                                color: student.status.toLowerCase() === "passed" ? "#4CAF50" : accentColor,
                                border: `1px solid ${student.status.toLowerCase() === "passed" ? alpha("#4CAF50", 0.3) : alpha(accentColor, 0.3)}`,
                                fontWeight: 700,
                                fontSize: "0.7rem",
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">{t("teacherModule.pending")}</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Button
                            size="small"
                            variant={isSaved ? "outlined" : "contained"}
                            disabled={isSaving}
                            onClick={() => handleSave(student)}
                            startIcon={isSaving ? <CircularProgress size={12} /> : isSaved ? <CheckCircleIcon /> : <SaveIcon />}
                            sx={{
                              fontWeight: 700,
                              textTransform: "none",
                              fontSize: "0.75rem",
                              borderRadius: 2,
                              ...(isSaved
                                ? { color: "#4CAF50", borderColor: "#4CAF50" }
                                : {
                                    background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.75)})`,
                                    color: "#000",
                                    border: "none",
                                    "&:hover": { filter: "brightness(0.9)" },
                                  }),
                            }}
                          >
                            {isSaving ? "..." : isSaved ? t("teacherModule.saved") : t("teacherModule.save")}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </motion.div>
        )}
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

export default function GradePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <CircularProgress />
        </Box>
      }
    >
      <GradeContent />
    </Suspense>
  );
}
