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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { teacherService } from "@/services/teacher.service";
import type { TeacherStudent } from "@/types/Teacher-api/teacher-api";
import { appToast } from "@/hooks/useAppToast";

// ---------- Excel Export ----------
const exportToExcel = (students: TeacherStudent[], subject: string, classId: string, year: string) => {
  const headers = ["Student Name", "Q1", "Q2", "Q3", "Q4", "Teacher Grade", "Final Grade", "Status"];
  const rows = students.map((s) => [
    s.name,
    s.q1 ?? "-",
    s.q2 ?? "-",
    s.q3 ?? "-",
    s.q4 ?? "-",
    s.teacherGrade ?? "-",
    s.finalGrade ?? "-",
    s.status?.toUpperCase() ?? "-",
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
  label,
  accentColor,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  accentColor: string;
}) {
  return (
    <Tooltip title={label} arrow>
      <TextField
        size="small"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ min: 0, max: 100, style: { textAlign: "center", padding: "6px 4px", width: 52 } }}
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

  const classId = searchParams?.get("classId") ?? "";
  const subject = searchParams?.get("subject") ?? "Subject";
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
    if (!classId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    teacherService.getClassStudents(classId).then((data) => {
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
        setError(err instanceof Error ? err.message : "Failed to load students");
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [classId]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const passCount = students.filter((s) => s.status === "pass").length;
  const failCount = students.filter((s) => s.status === "fail").length;
  const avgGrade =
    students.length > 0 && students.some((s) => s.finalGrade != null)
      ? (
          students.reduce((acc, s) => acc + (s.finalGrade ?? 0), 0) /
          students.filter((s) => s.finalGrade != null).length
        ).toFixed(1)
      : null;

  const getGrade = (id: string | number): StudentGrades =>
    grades[id] ?? { q1: "", q2: "", q3: "", q4: "" };

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
    // Teacher grade = average of entered quarters
    const entered = [q1, q2, q3, q4].filter((v) => v !== undefined) as number[];
    const teacherGrade = entered.length > 0 ? Math.round(entered.reduce((a, b) => a + b, 0) / entered.length) : 0;

    try {
      await teacherService.saveStudentGrade(classId, student.id, teacherGrade, {
        q1, q2, q3, q4, subjectId: subjectId || undefined,
      });

      setSavedIds((prev) => new Set([...prev, student.id]));
      appToast.success(`Grades saved for ${student.name}`);

      // Notify Vice Principal
      teacherService.pushNotification({
        type: "grade",
        title: "Grades Updated",
        message: `Teacher updated grades for ${student.name} in ${subject} (Class ${classId}).`,
        priority: "medium",
        targetRole: "Admin",
      });

      // Notify the student (conceptual — same notification system)
      teacherService.pushNotification({
        type: "grade",
        title: "Your grades have been updated",
        message: `Your ${subject} grades have been entered by your teacher.`,
        priority: "high",
        targetRole: "Student",
      });

    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setSavingId(null);
    }
  };

  // Save ALL students at once
  const handleSaveAll = async () => {
    setBulkSaving(true);
    let successCount = 0;
    for (const student of filtered) {
      const g = getGrade(student.id);
      const q1 = g.q1 !== "" ? Number(g.q1) : undefined;
      const q2 = g.q2 !== "" ? Number(g.q2) : undefined;
      const q3 = g.q3 !== "" ? Number(g.q3) : undefined;
      const q4 = g.q4 !== "" ? Number(g.q4) : undefined;
      const entered = [q1, q2, q3, q4].filter((v) => v !== undefined) as number[];
      const teacherGrade = entered.length > 0 ? Math.round(entered.reduce((a, b) => a + b, 0) / entered.length) : 0;
      try {
        await teacherService.saveStudentGrade(classId, student.id, teacherGrade, {
          q1, q2, q3, q4, subjectId: subjectId || undefined,
        });
        setSavedIds((prev) => new Set([...prev, student.id]));
        successCount++;
      } catch {
        // continue with next
      }
    }

    setBulkSaving(false);
    appToast.success(`Saved grades for ${successCount}/${filtered.length} students`);

    // One bulk notification to vice
    if (successCount > 0) {
      teacherService.pushNotification({
        type: "grade",
        title: "Bulk Grade Submission",
        message: `Grades for ${successCount} students in ${subject} (Class ${classId}) have been submitted.`,
        priority: "high",
        targetRole: "Admin",
      });
    }
    setSnackbar(`✅ ${successCount} students' grades saved successfully`);
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
              Back to Classes
            </Button>
            <Box sx={{ flex: 1 }} />
            <Chip
              label={year.charAt(0).toUpperCase() + year.slice(1)}
              sx={{ bgcolor: alpha(accentColor, 0.12), color: accentColor, fontWeight: 700, border: `1px solid ${alpha(accentColor, 0.3)}` }}
            />
            <Chip label={subject} variant="outlined" />
            <Chip label={`Class ${classId}`} variant="outlined" />
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
            Grade Students
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Enter quarter grades for each student. Grades are automatically sent to the Vice Principal.
          </Typography>
        </motion.div>

        {/* Stats Cards */}
        {!loading && !error && students.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 4 }}>
              {[
                { label: "Total Students", value: students.length, icon: <PeopleIcon />, color: accentColor },
                { label: "Passed", value: passCount, icon: <CheckCircleIcon />, color: "#4CAF50" },
                { label: "Failed", value: failCount, icon: <EmojiEventsIcon />, color: "#F44336" },
                { label: "Class Avg", value: avgGrade ?? "—", icon: <NotificationsActiveIcon />, color: "#FF9800" },
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
                placeholder="Search student..."
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
                onClick={() => exportToExcel(students, subject, classId, year)}
                sx={{ fontWeight: 600, textTransform: "none", borderColor: accentColor, color: accentColor, "&:hover": { borderColor: accentColor, bgcolor: alpha(accentColor, 0.06) } }}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                startIcon={bulkSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAll}
                disabled={bulkSaving || filtered.length === 0}
                sx={{
                  fontWeight: 700,
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.7)})`,
                  color: theme.palette.mode === "dark" ? "#000" : "#000",
                  "&:hover": { filter: "brightness(0.9)" },
                }}
              >
                {bulkSaving ? "Saving All..." : `Save All (${filtered.length})`}
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
            {students.length === 0 ? "No students in this class." : "No students match your search."}
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
                    {["#", "Student Name", "Q1", "Q2", "Q3", "Q4", "Teacher Grade", "Final Grade", "Status", "Action"].map((h) => (
                      <TableCell
                        key={h}
                        align={h === "Student Name" || h === "#" ? "left" : "center"}
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
                            />
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography fontWeight={700} color={accentColor}>
                            {computedTeacherGrade ?? (student.teacherGrade ?? "—")}
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
                              label={student.status.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: student.status === "pass" ? alpha("#4CAF50", 0.12) : alpha("#F44336", 0.12),
                                color: student.status === "pass" ? "#4CAF50" : "#F44336",
                                border: `1px solid ${student.status === "pass" ? alpha("#4CAF50", 0.3) : alpha("#F44336", 0.3)}`,
                                fontWeight: 700,
                                fontSize: "0.7rem",
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">Pending</Typography>
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
                            {isSaving ? "..." : isSaved ? "Saved" : "Save"}
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
