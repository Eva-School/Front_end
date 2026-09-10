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
  Chip,
  alpha,
  Container,
  Skeleton,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import QuizIcon from "@mui/icons-material/Quiz";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import GradeIcon from "@mui/icons-material/Grade";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { teacherService, Quiz, QuizDetail } from "@/services/teacher.service";
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
  label,
  max,
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

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"quarter" | "quizzes">("quarter");

  // Quarter Grades State
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [grades, setGrades] = useState<Record<string | number, StudentGrades>>({});
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string | number>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  // Quizzes State
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    maxScore: "10",
    quizDate: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Quiz Grading Modal State
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [activeQuizDetail, setActiveQuizDetail] = useState<QuizDetail | null>(null);
  const [loadingQuizDetail, setLoadingQuizDetail] = useState(false);
  const [quizGradesInput, setQuizGradesInput] = useState<Record<number, { score: string; notes: string }>>({});
  const [savingQuizGrades, setSavingQuizGrades] = useState(false);
  const [quizSearchTerm, setQuizSearchTerm] = useState("");

  // Load students for Quarter Grades
  useEffect(() => {
    if (!classId || !subjectId) {
      queueMicrotask(() => {
        setError(t("teacherModule.missingGradeContext"));
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    teacherService
      .getClassStudents(classId, subjectId)
      .then((data) => {
        if (cancelled) return;
        const sts = data.students || [];
        setStudents(sts);
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
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("teacherModule.failedLoadStudents"));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [classId, subjectId, t]);

  // Load Quizzes
  const fetchQuizzes = React.useCallback(async () => {
    if (!classId || !subjectId) return;
    setLoadingQuizzes(true);
    try {
      const data = await teacherService.getQuizzes(classId, subjectId);
      setQuizzes(data);
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoadingQuizzes(false);
    }
  }, [classId, subjectId]);

  useEffect(() => {
    if (activeTab === "quizzes") {
      queueMicrotask(() => {
        void fetchQuizzes();
      });
    }
  }, [activeTab, fetchQuizzes]);

  // Quarter Grades Logic
  const filtered = students.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const enteredCount = students.filter((s) => [s.q1, s.q2, s.q3, s.q4].some((value) => value != null)).length;
  const pendingCount = students.length - enteredCount;
  const avgGrade =
    students.length > 0 && students.some((s) => [s.q1, s.q2, s.q3, s.q4].some((value) => value != null))
      ? (
          students.reduce(
            (acc, s) =>
              acc +
              [s.q1, s.q2, s.q3, s.q4]
                .filter((value): value is number => value != null)
                .reduce((sum, value) => sum + value, 0),
            0
          ) /
          students.reduce((count, s) => count + [s.q1, s.q2, s.q3, s.q4].filter((value) => value != null).length, 0)
        ).toFixed(1)
      : null;

  const getGrade = (id: string | number): StudentGrades => grades[id] ?? { q1: "", q2: "", q3: "", q4: "" };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "passed":
        return t("teacherModule.passed");
      case "failed":
        return t("teacherModule.failed");
      default:
        return t("teacherModule.pending");
    }
  };

  const setStudentGrade = (id: string | number, key: keyof StudentGrades, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [id]: { ...getGrade(id), [key]: value },
    }));
    setSavedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  };

  const handleSave = async (student: TeacherStudent) => {
    setSavingId(student.id);
    const g = getGrade(student.id);
    const q1 = g.q1 !== "" ? Number(g.q1) : undefined;
    const q2 = g.q2 !== "" ? Number(g.q2) : undefined;
    const q3 = g.q3 !== "" ? Number(g.q3) : undefined;
    const q4 = g.q4 !== "" ? Number(g.q4) : undefined;
    try {
      await teacherService.saveStudentGrade({
        classId,
        studentId: student.id,
        subjectId,
        q1,
        q2,
        q3,
        q4,
      });

      setStudents((current) =>
        current.map((item) => (item.id === student.id ? { ...item, q1, q2, q3, q4 } : item))
      );
      setSavedIds((prev) => new Set([...prev, student.id]));
      appToast.success(t("teacherModule.gradesSavedFor", { name: student.name }));
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : t("teacherModule.failedSaveGrade"));
    } finally {
      setSavingId(null);
    }
  };

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
          classId,
          studentId: student.id,
          subjectId,
          q1,
          q2,
          q3,
          q4,
        });
        setStudents((current) =>
          current.map((item) => (item.id === student.id ? { ...item, q1, q2, q3, q4 } : item))
        );
        setSavedIds((prev) => new Set([...prev, student.id]));
        successCount++;
      } catch {
        failedStudents.push(student.name);
      }
    }
    setBulkSaving(false);
    if (successCount > 0) {
      appToast.success(
        t("teacherModule.gradesSavedCount", { count: successCount, total: studentsToSave.length })
      );
    }
    if (failedStudents.length > 0) {
      appToast.error(`Failed to save for: ${failedStudents.join(", ")}`);
    }
  };

  // Quiz Modal Handlers
  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizForm({
      title: "",
      maxScore: "10",
      quizDate: new Date().toISOString().split("T")[0],
      description: "",
    });
    setQuizModalOpen(true);
  };

  const handleOpenEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      maxScore: String(quiz.maxScore),
      quizDate: quiz.quizDate ? quiz.quizDate.split("T")[0] : new Date().toISOString().split("T")[0],
      description: quiz.description || "",
    });
    setQuizModalOpen(true);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizForm.maxScore) return;
    const maxScoreNum = Number(quizForm.maxScore);
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      appToast.error("Max score must be greater than 0.");
      return;
    }

    setSubmittingQuiz(true);
    try {
      if (editingQuiz) {
        await teacherService.updateQuiz(editingQuiz.quizId, {
          title: quizForm.title.trim(),
          maxScore: maxScoreNum,
          quizDate: quizForm.quizDate,
          description: quizForm.description.trim() || undefined,
        });
        appToast.success(t("teacherModule.updateQuizSuccess"));
      } else {
        await teacherService.createQuiz({
          classId: Number(classId),
          subjectId: Number(subjectId),
          title: quizForm.title.trim(),
          maxScore: maxScoreNum,
          quizDate: quizForm.quizDate,
          description: quizForm.description.trim() || undefined,
        });
        appToast.success(t("teacherModule.createQuizSuccess"));
      }
      setQuizModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Error saving quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!window.confirm(t("teacherModule.confirmDeleteQuiz"))) return;
    try {
      await teacherService.deleteQuiz(quiz.quizId);
      appToast.success(t("teacherModule.deleteQuizSuccess"));
      fetchQuizzes();
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Failed to delete quiz.");
    }
  };

  // Grade Quiz Modal Handlers
  const handleOpenGradeQuiz = async (quiz: Quiz) => {
    setGradeModalOpen(true);
    setLoadingQuizDetail(true);
    setQuizSearchTerm("");
    try {
      const detail = await teacherService.getQuizDetail(quiz.quizId);
      setActiveQuizDetail(detail);
      const initInputs: Record<number, { score: string; notes: string }> = {};
      detail.grades.forEach((g) => {
        initInputs[g.studentId] = {
          score: g.score != null ? String(g.score) : "",
          notes: g.notes || "",
        };
      });
      setQuizGradesInput(initInputs);
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Failed to load quiz details.");
      setGradeModalOpen(false);
    } finally {
      setLoadingQuizDetail(false);
    }
  };

  const handleSaveQuizGrades = async () => {
    if (!activeQuizDetail) return;
    const maxScore = activeQuizDetail.quiz.maxScore;

    // Validate inputs
    for (const [, val] of Object.entries(quizGradesInput)) {
      if (val.score !== "") {
        const num = Number(val.score);
        if (isNaN(num) || num < 0) {
          appToast.error(`Invalid score value for student.`);
          return;
        }
        if (num > maxScore) {
          appToast.error(`Score cannot exceed maximum score of ${maxScore}.`);
          return;
        }
      }
    }

    setSavingQuizGrades(true);
    try {
      const gradesToSubmit = Object.entries(quizGradesInput).map(([stId, val]) => ({
        studentId: Number(stId),
        score: val.score !== "" ? Number(val.score) : undefined,
        notes: val.notes.trim() || undefined,
      }));

      const updatedDetail = await teacherService.saveQuizGrades(activeQuizDetail.quiz.quizId, gradesToSubmit);
      setActiveQuizDetail(updatedDetail);
      appToast.success(t("teacherModule.saveQuizGradesSuccess"));
      setGradeModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Failed to save quiz grades.");
    } finally {
      setSavingQuizGrades(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }} dir={dir}>
      <Container maxWidth="xl">
        {/* Header Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Button
            onClick={() => router.push("/teacher/classes")}
            startIcon={<ArrowBackIcon sx={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />}
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            {t("teacherModule.backToClasses")}
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={subject} sx={{ bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 700 }} />
            <Chip label={`${t("teacherModule.class")} ${classId}`} variant="outlined" sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        {/* Tab Selection Bar */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              px: 2,
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                py: 2,
              },
            }}
          >
            <Tab
              label={t("teacherModule.quarterGradesTab")}
              value="quarter"
              icon={<AssessmentIcon />}
              iconPosition="start"
            />
            <Tab
              label={`${t("teacherModule.quizzesTab")} (${quizzes.length})`}
              value="quizzes"
              icon={<QuizIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* TAB 1: QUARTER GRADES */}
        {activeTab === "quarter" && (
          <>
            {/* Stats Overview */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
                gap: 2,
                mb: 4,
              }}
            >
              {[
                { label: t("teacherModule.totalStudents"), val: students.length, icon: PeopleIcon, color: "#2196F3" },
                { label: t("teacherModule.withGrades"), val: enteredCount, icon: CheckCircleIcon, color: "#4CAF50" },
                { label: t("teacherModule.pending"), val: pendingCount, icon: AssessmentIcon, color: "#FF9800" },
                { label: t("teacherModule.quarterAverage"), val: avgGrade ? `${avgGrade}` : "—", icon: EmojiEventsIcon, color: accentColor },
              ].map((stat, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: alpha(stat.color, 0.12),
                      color: stat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <stat.icon />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {stat.val}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Actions Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                placeholder={t("teacherModule.searchStudent")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 280 } }}
              />

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={() =>
                    exportToExcel(students, subject, classId, year, [
                      t("teacherModule.studentName"),
                      "Q1",
                      "Q2",
                      "Q3",
                      "Q4",
                      t("teacherModule.finalGrade"),
                      t("teacherModule.status"),
                    ])
                  }
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  {t("teacherModule.exportGrades")}
                </Button>

                <Button
                  variant="contained"
                  startIcon={bulkSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={bulkSaving || loading}
                  onClick={handleSaveAll}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.8)})`,
                    color: "#000",
                    "&:hover": { filter: "brightness(0.95)" },
                  }}
                >
                  {bulkSaving ? t("teacherModule.savingAll") : t("teacherModule.saveAll")}
                </Button>
              </Box>
            </Paper>

            {/* Error or Loading */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mt: 2 }} />
              </Paper>
            ) : filtered.length === 0 ? (
              <Paper sx={{ p: 6, textCenter: "center", borderRadius: 3, textAlign: "center" }}>
                <Typography color="text.secondary" fontWeight={600}>
                  {searchTerm ? t("teacherModule.noSearchResults") : t("teacherModule.noStudents")}
                </Typography>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(accentColor, 0.08) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{t("teacherModule.studentName")}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>Q1</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>Q2</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>Q3</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>Q4</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>{t("teacherModule.quarterAverage")}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>{t("teacherModule.finalGrade")}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>{t("teacherModule.status")}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>{t("teacherModule.action")}</TableCell>
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
                        entered.length > 0 ? Math.round(entered.reduce((a, b) => a + b, 0) / entered.length) : null;

                      return (
                        <TableRow key={student.id} hover>
                          <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{rowIdx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
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
                            <TableCell key={q} align="center">
                              <QuarterCell
                                label={q.toUpperCase()}
                                value={g[q]}
                                onChange={(v) => setStudentGrade(student.id, q, v)}
                                accentColor={accentColor}
                                max={student[`max${q.toUpperCase()}` as "maxQ1" | "maxQ2" | "maxQ3" | "maxQ4"]}
                              />
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <Typography fontWeight={700} color={accentColor}>
                              {computedTeacherGrade ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600} color="text.secondary">
                              {student.finalGrade ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
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
                              <Typography variant="caption" color="text.disabled">
                                {t("teacherModule.pending")}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </>
        )}

        {/* TAB 2: QUIZZES MANAGEMENT */}
        {activeTab === "quizzes" && (
          <Box>
            {/* Header & Create Quiz Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {t("teacherModule.quizzesList")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("teacherModule.quizzesTab")} - {subject} ({t("teacherModule.class")} {classId})
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateQuiz}
                sx={{
                  fontWeight: 700,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${accentColor}, ${alpha(accentColor, 0.8)})`,
                  color: "#000",
                  "&:hover": { filter: "brightness(0.95)" },
                }}
              >
                {t("teacherModule.createQuiz")}
              </Button>
            </Box>

            {loadingQuizzes ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
                ))}
              </Box>
            ) : quizzes.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
                <QuizIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography variant="h6" fontWeight={700} color="text.secondary">
                  {t("teacherModule.noQuizzesYet")}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateQuiz}
                  sx={{ mt: 2, fontWeight: 700 }}
                >
                  {t("teacherModule.createQuiz")}
                </Button>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                  gap: 3,
                }}
              >
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.quizId}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: `0 8px 24px ${alpha(accentColor, 0.15)}`,
                        borderColor: alpha(accentColor, 0.4),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                          {quiz.title}
                        </Typography>
                        <Chip
                          label={`${t("teacherModule.maxScore")}: ${quiz.maxScore}`}
                          size="small"
                          sx={{ bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 800 }}
                        />
                      </Box>

                      {quiz.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {quiz.description}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          📅 {new Date(quiz.quizDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={quiz.gradedStudentsCount > 0 ? "success.main" : "text.secondary"}>
                          {t("teacherModule.gradedCount")}: {quiz.gradedStudentsCount}/{quiz.totalStudentsCount}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          startIcon={<GradeIcon />}
                          onClick={() => handleOpenGradeQuiz(quiz)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            bgcolor: alpha(accentColor, 0.9),
                            color: "#000",
                            "&:hover": { bgcolor: accentColor },
                          }}
                        >
                          {t("teacherModule.enterQuizGrades")}
                        </Button>
                        <IconButton size="small" onClick={() => handleOpenEditQuiz(quiz)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteQuiz(quiz)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* DIALOG: CREATE / EDIT QUIZ */}
        <Dialog open={quizModalOpen} onClose={() => setQuizModalOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSaveQuiz}>
            <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {editingQuiz ? t("teacherModule.editQuiz") : t("teacherModule.createQuiz")}
              <IconButton size="small" onClick={() => setQuizModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
                <TextField
                  label={t("teacherModule.quizTitle")}
                  required
                  fullWidth
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                />

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <TextField
                    label={t("teacherModule.maxScore")}
                    type="number"
                    required
                    fullWidth
                    inputProps={{ min: 0.5, step: "any" }}
                    value={quizForm.maxScore}
                    onChange={(e) => setQuizForm({ ...quizForm, maxScore: e.target.value })}
                  />
                  <TextField
                    label={t("teacherModule.quizDate")}
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={quizForm.quizDate}
                    onChange={(e) => setQuizForm({ ...quizForm, quizDate: e.target.value })}
                  />
                </Box>

                <TextField
                  label={t("teacherModule.description")}
                  multiline
                  rows={3}
                  fullWidth
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setQuizModalOpen(false)} sx={{ fontWeight: 700 }}>
                {t("teacherModule.action")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submittingQuiz}
                sx={{
                  fontWeight: 700,
                  bgcolor: accentColor,
                  color: "#000",
                  "&:hover": { filter: "brightness(0.95)" },
                }}
              >
                {submittingQuiz ? <CircularProgress size={20} /> : t("teacherModule.save")}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* DIALOG: GRADE QUIZ FOR ALL STUDENTS */}
        <Dialog open={gradeModalOpen} onClose={() => setGradeModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {t("teacherModule.enterQuizGrades")}: {activeQuizDetail?.quiz.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("teacherModule.maxScore")}: {activeQuizDetail?.quiz.maxScore}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setGradeModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {loadingQuizDetail ? (
              <Box sx={{ p: 4, textCenter: "center", display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : !activeQuizDetail ? (
              <Typography sx={{ p: 4 }} color="error">
                Failed to load quiz details.
              </Typography>
            ) : (
              <Box>
                <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                  <TextField
                    size="small"
                    placeholder={t("teacherModule.searchStudent")}
                    value={quizSearchTerm}
                    onChange={(e) => setQuizSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 280 }}
                  />
                </Box>

                <Table>
                  <TableHead sx={{ bgcolor: alpha(accentColor, 0.08) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{t("teacherModule.studentName")}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, width: 140 }}>
                        {t("teacherModule.score")} (/{activeQuizDetail.quiz.maxScore})
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{t("teacherModule.notes")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeQuizDetail.grades
                      .filter((st) => st.studentName.toLowerCase().includes(quizSearchTerm.toLowerCase()))
                      .map((student, idx) => {
                        const inputVal = quizGradesInput[student.studentId] || { score: "", notes: "" };
                        return (
                          <TableRow key={student.studentId} hover>
                            <TableCell sx={{ color: "text.secondary", fontWeight: 600 }}>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{student.studentName}</TableCell>
                            <TableCell align="center">
                              <TextField
                                size="small"
                                type="number"
                                value={inputVal.score}
                                onChange={(e) =>
                                  setQuizGradesInput({
                                    ...quizGradesInput,
                                    [student.studentId]: { ...inputVal, score: e.target.value },
                                  })
                                }
                                inputProps={{
                                  min: 0,
                                  max: activeQuizDetail.quiz.maxScore,
                                  step: "any",
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: 90 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder={t("teacherModule.notes")}
                                value={inputVal.notes}
                                onChange={(e) =>
                                  setQuizGradesInput({
                                    ...quizGradesInput,
                                    [student.studentId]: { ...inputVal, notes: e.target.value },
                                  })
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setGradeModalOpen(false)} sx={{ fontWeight: 700 }}>
              {t("teacherModule.action")}
            </Button>
            <Button
              variant="contained"
              disabled={savingQuizGrades}
              onClick={handleSaveQuizGrades}
              startIcon={savingQuizGrades ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{
                fontWeight: 700,
                bgcolor: accentColor,
                color: "#000",
                "&:hover": { filter: "brightness(0.95)" },
              }}
            >
              {savingQuizGrades ? t("teacherModule.savingAll") : t("teacherModule.saveAll")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
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
