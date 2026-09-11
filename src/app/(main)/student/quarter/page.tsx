"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Collapse,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import QuizIcon from "@mui/icons-material/Quiz";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentService } from "@/services/student.service";
import type { QuarterGradeRow } from "@/types/Student-api/grades";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior (Year 1)",
  wheeler: "Wheeler (Year 2)",
  senior: "Senior (Year 3)",
};

export default function QuarterGradesPage() {
  const theme = useTheme();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const { displayYear } = useStudentYear();
  const [grades, setGrades] = useState<QuarterGradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYearName, setAcademicYearName] = useState<string>("");
  const [availableTerms, setAvailableTerms] = useState<number[]>([1, 2]);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await studentService.getQuarterGrades(displayYear, selectedTerm);
        if (!cancelled) {
          setGrades(res.grades ?? []);
          if (res.academicYearName) setAcademicYearName(res.academicYearName);
          if (res.availableTerms && res.availableTerms.length > 0) {
            setAvailableTerms(res.availableTerms);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load quarter grades");
          setGrades([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [displayYear, selectedTerm]);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const gradedCount = grades.filter((g) => g.percentage !== null && g.percentage !== undefined).length;
  const calculateOverallAverage = () => {
    if (!grades || grades.length === 0) return null;
    const graded = grades.filter((g) => g.percentage !== null && g.percentage !== undefined);
    if (graded.length === 0) return null;
    const sum = graded.reduce((acc, g) => acc + (g.percentage ?? 0), 0);
    return Math.round(sum / graded.length);
  };

  const overallAverage = calculateOverallAverage();
  const yearLabel = YEAR_LABELS[displayYear] ?? displayYear;

  const getProgressColor = (pct: number) => {
    if (pct >= 85) return "#66bb6a";
    if (pct >= 65) return "#42a5f5";
    if (pct >= 50) return "#ffa726";
    return "#ef5350";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `
          linear-gradient(rgba(10, 15, 30, 0.88), rgba(5, 10, 20, 0.94)),
          url('/Images/download 1 (1).png')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: { xs: 1.5, sm: 2.5, md: 4 },
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Top Header Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          background: alpha(theme.palette.background.paper, 0.08),
          backdropFilter: "blur(18px)",
          borderRadius: { xs: "18px", md: "24px" },
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          p: { xs: 2, sm: 2.5, md: 3.5 },
          mb: 3,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Navigation & Academic Year Pill */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Button
            component={Link}
            href="/student"
            startIcon={
              <ArrowBackIcon
                sx={{
                  transform: isRtl ? "rotate(180deg)" : "none",
                  fontSize: 18,
                }}
              />
            }
            sx={{
              color: "#FFC600",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "none",
              px: 2,
              py: 0.8,
              borderRadius: "12px",
              bgcolor: "rgba(255, 198, 0, 0.1)",
              border: "1px solid rgba(255, 198, 0, 0.2)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(255, 198, 0, 0.2)",
                transform: isRtl ? "translateX(2px)" : "translateX(-2px)",
              },
            }}
          >
            {t("studentGrades.backToDashboard", "Back to Dashboard")}
          </Button>

          {academicYearName && (
            <Chip
              icon={<DateRangeIcon sx={{ fontSize: 16, color: "#FFC600 !important" }} />}
              label={`${t("studentGrades.academicYear", "Academic Year")}: ${academicYearName}`}
              size="small"
              sx={{
                color: "#FFC600",
                bgcolor: "rgba(255, 198, 0, 0.1)",
                borderColor: "rgba(255, 198, 0, 0.25)",
                fontWeight: 600,
                fontSize: "12px",
                py: 0.5,
              }}
              variant="outlined"
            />
          )}
        </Box>

        {/* Title, Subtitle and KPI Telemetry Banner */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", lg: "center" },
            flexDirection: { xs: "column", lg: "row" },
            gap: 2.5,
          }}
        >
          <Box sx={{ maxWidth: "700px" }}>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: { xs: "20px", sm: "24px", md: "28px" },
                letterSpacing: "-0.5px",
              }}
            >
              {t("studentGrades.quarterTitle", "Quarter & Coursework Grades")}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: { xs: "13px", md: "14px" },
                mt: 0.75,
                lineHeight: 1.5,
              }}
            >
              {t(
                "studentGrades.quarterSubtitle",
                "Continuous assessment, quarterly distribution (Q1 - Q4), and linked quizzes"
              )}
            </Typography>
          </Box>

          {/* Quick Stats Badges */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* Term Average Tile */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #FFC600 0%, #FFA000 100%)",
                borderRadius: "16px",
                px: 2.5,
                py: 1.5,
                minWidth: "150px",
                textAlign: "center",
                boxShadow: "0 6px 20px rgba(255, 198, 0, 0.28)",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "#1a1a1a", fontWeight: 800, letterSpacing: "0.5px" }}>
                {t("studentGrades.termAverage", "TERM AVERAGE")}
              </Typography>
              <Typography sx={{ fontSize: "26px", color: "#000", fontWeight: 900, lineHeight: 1.1, mt: 0.2 }}>
                {loading ? "..." : overallAverage !== null ? `${overallAverage}%` : t("studentGrades.notReleased", "Not Released")}
              </Typography>
            </Box>

            {/* Graded Courses Ratio */}
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                px: 2.5,
                py: 1.5,
                minWidth: "150px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.5px" }}>
                {t("studentGrades.evaluatedCourses", "EVALUATED COURSES")}
              </Typography>
              <Typography sx={{ fontSize: "22px", color: "#81c784", fontWeight: 800, mt: 0.2 }}>
                <bdi dir="ltr">{loading ? "..." : `${gradedCount} / ${grades.length}`}</bdi>
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Term Tabs Switcher */}
        <Box sx={{ mt: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
          <Tabs
            value={selectedTerm}
            onChange={(_, val) => setSelectedTerm(val)}
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.6)",
                fontWeight: 700,
                fontSize: "14px",
                textTransform: "none",
                minHeight: "44px",
                px: 2.5,
                "&.Mui-selected": {
                  color: "#FFC600",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFC600",
                height: "3px",
                borderRadius: "3px",
              },
            }}
          >
            {availableTerms.map((tNum) => (
              <Tab
                key={tNum}
                label={
                  tNum === 1
                    ? t("studentGrades.term1", "Term 1")
                    : tNum === 2
                    ? t("studentGrades.term2", "Term 2")
                    : `${t("studentGrades.termPrefix", "Term")} ${tNum}`
                }
                value={tNum}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {error && (
        <Box sx={{ width: "100%", maxWidth: "1400px", mb: 2.5 }}>
          <Card sx={{ bgcolor: "rgba(244, 67, 54, 0.15)", border: "1px solid rgba(244, 67, 54, 0.3)", borderRadius: "16px" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography color="error.light" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ width: "100%", maxWidth: "1400px", mb: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#FFC600", mb: 2 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              {t("common.loading", "Loading quarter grades...")}
            </Typography>
          </Box>
        ) : grades.length === 0 ? (
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.05),
              borderRadius: "20px",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 52, color: "rgba(255,255,255,0.3)", mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
              {t("studentGrades.noQuarterGrades", "No quarter grades available yet")}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mt: 0.5 }}>
              {t("studentGrades.noQuarterGradesDesc", {
                term: `${t("studentGrades.termPrefix", "Term")} ${selectedTerm}`,
                year: yearLabel,
              })}
            </Typography>
          </Box>
        ) : (
          <>
            {/* ─── 1. Desktop Presentation: Rich Data Ledger (md+) ─── */}
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "20px",
                  boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
                  bgcolor: alpha(theme.palette.background.paper, 0.12),
                  backdropFilter: "blur(18px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(255, 198, 0, 0.95)" }}>
                      <TableCell sx={{ width: "40px", py: 2 }} />
                      <TableCell sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                        {t("studentGrades.subject", "Subject")}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#000",
                          py: 2,
                          bgcolor: selectedTerm === 1 ? "rgba(0,0,0,0.06)" : "transparent",
                        }}
                      >
                        Q1 {selectedTerm === 1 && <Typography component="span" sx={{ fontSize: "11px", fontWeight: 800, opacity: 0.75 }}>(T1)</Typography>}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#000",
                          py: 2,
                          bgcolor: selectedTerm === 1 ? "rgba(0,0,0,0.06)" : "transparent",
                        }}
                      >
                        Q2 {selectedTerm === 1 && <Typography component="span" sx={{ fontSize: "11px", fontWeight: 800, opacity: 0.75 }}>(T1)</Typography>}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#000",
                          py: 2,
                          bgcolor: selectedTerm === 2 ? "rgba(0,0,0,0.06)" : "transparent",
                        }}
                      >
                        Q3 {selectedTerm === 2 && <Typography component="span" sx={{ fontSize: "11px", fontWeight: 800, opacity: 0.75 }}>(T2)</Typography>}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#000",
                          py: 2,
                          bgcolor: selectedTerm === 2 ? "rgba(0,0,0,0.06)" : "transparent",
                        }}
                      >
                        Q4 {selectedTerm === 2 && <Typography component="span" sx={{ fontSize: "11px", fontWeight: 800, opacity: 0.75 }}>(T2)</Typography>}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                        {t("studentGrades.courseworkTotal", "Coursework Total")}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                        {t("studentGrades.progress", "Progress")}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                        {t("studentGrades.quizzes", "Quizzes")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grades.map((row, index) => {
                      const isExpanded = !!expandedRows[index];
                      const hasQuizzes = row.quizzes && row.quizzes.length > 0;
                      const pct = row.percentage ?? 0;
                      const progressColor = getProgressColor(pct);

                      return (
                        <React.Fragment key={index}>
                          <TableRow
                            sx={{
                              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
                              borderBottom: isExpanded ? "none" : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <TableCell sx={{ py: 2 }}>
                              {hasQuizzes && (
                                <IconButton
                                  size="small"
                                  onClick={() => toggleRow(index)}
                                  sx={{
                                    color: "#FFC600",
                                    bgcolor: isExpanded ? "rgba(255, 198, 0, 0.12)" : "transparent",
                                    "&:hover": { bgcolor: "rgba(255, 198, 0, 0.2)" },
                                  }}
                                >
                                  {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              )}
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "white" }}>
                                {isRtl && row.subjectArabic ? row.subjectArabic : row.subject}
                              </Typography>
                              {row.subjectCode && (
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", mt: 0.25 }}>
                                  {row.subjectCode}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Q1 */}
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: selectedTerm === 1 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                                py: 2,
                                bgcolor: selectedTerm === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                              }}
                            >
                              {row.quarter1 !== null && row.quarter1 !== undefined ? (
                                <Tooltip title={`Max: ${row.maxQ1 ?? 25}`}>
                                  <span><bdi dir="ltr">{row.quarter1}</bdi></span>
                                </Tooltip>
                              ) : (
                                <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                              )}
                            </TableCell>

                            {/* Q2 */}
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: selectedTerm === 1 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                                py: 2,
                                bgcolor: selectedTerm === 1 ? "rgba(255,255,255,0.02)" : "transparent",
                              }}
                            >
                              {row.quarter2 !== null && row.quarter2 !== undefined ? (
                                <Tooltip title={`Max: ${row.maxQ2 ?? 25}`}>
                                  <span><bdi dir="ltr">{row.quarter2}</bdi></span>
                                </Tooltip>
                              ) : (
                                <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                              )}
                            </TableCell>

                            {/* Q3 */}
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: selectedTerm === 2 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                                py: 2,
                                bgcolor: selectedTerm === 2 ? "rgba(255,255,255,0.02)" : "transparent",
                              }}
                            >
                              {row.quarter3 !== null && row.quarter3 !== undefined ? (
                                <Tooltip title={`Max: ${row.maxQ3 ?? 25}`}>
                                  <span><bdi dir="ltr">{row.quarter3}</bdi></span>
                                </Tooltip>
                              ) : (
                                <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                              )}
                            </TableCell>

                            {/* Q4 */}
                            <TableCell
                              align="center"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: selectedTerm === 2 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                                py: 2,
                                bgcolor: selectedTerm === 2 ? "rgba(255,255,255,0.02)" : "transparent",
                              }}
                            >
                              {row.quarter4 !== null && row.quarter4 !== undefined ? (
                                <Tooltip title={`Max: ${row.maxQ4 ?? 25}`}>
                                  <span><bdi dir="ltr">{row.quarter4}</bdi></span>
                                </Tooltip>
                              ) : (
                                <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                              )}
                            </TableCell>

                            {/* Coursework Total */}
                            <TableCell align="center" sx={{ py: 2 }}>
                              {row.courseworkTotal !== null && row.courseworkTotal !== undefined ? (
                                <Chip
                                  label={<bdi dir="ltr">{`${row.courseworkTotal} / ${row.maxQuarter ?? 50}`}</bdi>}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    bgcolor: "rgba(255, 198, 0, 0.15)",
                                    color: "#FFC600",
                                    border: "1px solid rgba(255, 198, 0, 0.3)",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label={t("studentGrades.notReleased", "Not Released")}
                                  size="small"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                    color: "rgba(255, 255, 255, 0.5)",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                  }}
                                />
                              )}
                            </TableCell>

                            {/* Progress */}
                            <TableCell align="center" sx={{ minWidth: "150px", py: 2 }}>
                              {row.percentage !== null && row.percentage !== undefined ? (
                                <Stack spacing={0.5} alignItems="center">
                                  <Typography sx={{ fontSize: "13px", fontWeight: 800, color: progressColor }}>
                                    <bdi dir="ltr">{pct}%</bdi>
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(100, Math.max(0, pct))}
                                    sx={{
                                      width: "100%",
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: "rgba(255,255,255,0.1)",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor: progressColor,
                                        borderRadius: 3,
                                      },
                                    }}
                                  />
                                </Stack>
                              ) : (
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                                  {t("studentGrades.notReleased", "Not Released")}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Quizzes Count Badge */}
                            <TableCell align="center" sx={{ py: 2 }}>
                              {hasQuizzes ? (
                                <Chip
                                  icon={<QuizIcon sx={{ fontSize: 14, color: "#90caf9 !important" }} />}
                                  label={`${row.quizzes?.length} ${t("studentGrades.quizzes", "Quizzes")}`}
                                  size="small"
                                  onClick={() => toggleRow(index)}
                                  clickable
                                  sx={{
                                    bgcolor: "rgba(33, 150, 243, 0.12)",
                                    color: "#90caf9",
                                    border: "1px solid rgba(33, 150, 243, 0.25)",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                />
                              ) : (
                                <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Desktop Expandable Quiz Details */}
                          {hasQuizzes && (
                            <TableRow sx={{ bgcolor: "rgba(0, 0, 0, 0.25)" }}>
                              <TableCell colSpan={9} sx={{ py: 0, px: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ py: 2.5 }}>
                                    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#FFC600", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                      <AssignmentTurnedInIcon sx={{ fontSize: 18 }} />
                                      {t("studentGrades.quizBreakdown", "Quiz & Assignment Breakdown")} ({row.subject})
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                      {row.quizzes!.map((quiz) => (
                                        <Box
                                          key={quiz.quizId}
                                          sx={{
                                            bgcolor: alpha(theme.palette.background.paper, 0.08),
                                            border: "1px solid rgba(255, 255, 255, 0.12)",
                                            borderRadius: "14px",
                                            p: 1.5,
                                            minWidth: "200px",
                                            maxWidth: "320px",
                                            flex: 1,
                                          }}
                                        >
                                          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "white", mb: 0.5 }}>
                                            {quiz.title}
                                          </Typography>
                                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                                              {quiz.quizDate}
                                            </Typography>
                                            <Chip
                                              label={<bdi dir="ltr">{`${quiz.score ?? 0} / ${quiz.maxScore}`}</bdi>}
                                              size="small"
                                              sx={{
                                                fontWeight: 800,
                                                fontSize: "12px",
                                                bgcolor: "rgba(129, 199, 132, 0.15)",
                                                color: "#81c784",
                                                border: "1px solid rgba(129, 199, 132, 0.3)",
                                              }}
                                            />
                                          </Box>
                                          {quiz.notes && (
                                            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", mt: 1, fontStyle: "italic" }}>
                                              {quiz.notes}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Stack>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ─── 2. Mobile Presentation: Responsive Subject Glass Cards (xs, sm) ─── */}
            <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 2 }}>
              {grades.map((row, index) => {
                const isExpanded = !!expandedRows[index];
                const hasQuizzes = row.quizzes && row.quizzes.length > 0;
                const pct = row.percentage ?? 0;
                const progressColor = getProgressColor(pct);

                return (
                  <Card
                    key={index}
                    sx={{
                      borderRadius: "20px",
                      bgcolor: alpha(theme.palette.background.paper, 0.1),
                      backdropFilter: "blur(16px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      overflow: "hidden",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                      {/* Subject Name & Header Pill */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontSize: "16px", fontWeight: 800, color: "white" }}>
                            {isRtl && row.subjectArabic ? row.subjectArabic : row.subject}
                          </Typography>
                          {row.subjectCode && (
                            <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", mt: 0.2 }}>
                              {row.subjectCode}
                            </Typography>
                          )}
                        </Box>

                        <Chip
                          label={`${t("studentGrades.termPrefix", "Term")} ${selectedTerm}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255, 198, 0, 0.12)",
                            color: "#FFC600",
                            fontWeight: 700,
                            fontSize: "11px",
                            border: "1px solid rgba(255, 198, 0, 0.25)",
                          }}
                        />
                      </Box>

                      {/* Milestone Stepper Ribbon: Quarters breakdown */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.5,
                          my: 2,
                          p: 1.5,
                          borderRadius: "14px",
                          bgcolor: "rgba(0, 0, 0, 0.25)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        {selectedTerm === 1 ? (
                          <>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                Q1 (Term 1)
                              </Typography>
                              <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                {row.quarter1 !== null && row.quarter1 !== undefined ? (
                                  <bdi dir="ltr">{row.quarter1} / {row.maxQ1 ?? 25}</bdi>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                )}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "center", borderLeft: isRtl ? "none" : "1px solid rgba(255,255,255,0.1)", borderRight: isRtl ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                Q2 (Term 1)
                              </Typography>
                              <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                {row.quarter2 !== null && row.quarter2 !== undefined ? (
                                  <bdi dir="ltr">{row.quarter2} / {row.maxQ2 ?? 25}</bdi>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                )}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                Q3 (Term 2)
                              </Typography>
                              <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                {row.quarter3 !== null && row.quarter3 !== undefined ? (
                                  <bdi dir="ltr">{row.quarter3} / {row.maxQ3 ?? 25}</bdi>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                )}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "center", borderLeft: isRtl ? "none" : "1px solid rgba(255,255,255,0.1)", borderRight: isRtl ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                Q4 (Term 2)
                              </Typography>
                              <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                {row.quarter4 !== null && row.quarter4 !== undefined ? (
                                  <bdi dir="ltr">{row.quarter4} / {row.maxQ4 ?? 25}</bdi>
                                ) : (
                                  <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                )}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>

                      {/* Coursework Total & Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                          <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                            {t("studentGrades.courseworkTotal", "Coursework Total")}
                          </Typography>
                          {row.courseworkTotal !== null && row.courseworkTotal !== undefined ? (
                            <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#FFC600" }}>
                              <bdi dir="ltr">{`${row.courseworkTotal} / ${row.maxQuarter ?? 50}`}</bdi>
                            </Typography>
                          ) : (
                            <Chip
                              label={t("studentGrades.notReleased", "Not Released")}
                              size="small"
                              sx={{
                                fontSize: "10px",
                                fontWeight: 700,
                                height: "20px",
                                bgcolor: "rgba(255, 255, 255, 0.06)",
                                color: "rgba(255, 255, 255, 0.5)",
                              }}
                            />
                          )}
                        </Box>

                        {row.percentage !== null && row.percentage !== undefined ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, pct))}
                              sx={{
                                flex: 1,
                                height: 7,
                                borderRadius: 4,
                                bgcolor: "rgba(255,255,255,0.1)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: progressColor,
                                  borderRadius: 4,
                                },
                              }}
                            />
                            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: progressColor, minWidth: "36px", textAlign: "right" }}>
                              <bdi dir="ltr">{pct}%</bdi>
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontStyle: "italic", mt: 0.5 }}>
                            {t("studentGrades.notReleased", "Not Released")}
                          </Typography>
                        )}
                      </Box>

                      {/* Quizzes Button & Expandable List */}
                      {hasQuizzes ? (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            onClick={() => toggleRow(index)}
                            startIcon={<QuizIcon sx={{ fontSize: 16 }} />}
                            endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            sx={{
                              borderColor: "rgba(255, 255, 255, 0.15)",
                              color: "rgba(255, 255, 255, 0.85)",
                              fontSize: "12px",
                              fontWeight: 700,
                              py: 0.75,
                              borderRadius: "12px",
                              textTransform: "none",
                              justifyContent: "space-between",
                              "&:hover": {
                                borderColor: "#FFC600",
                                bgcolor: "rgba(255, 198, 0, 0.05)",
                              },
                            }}
                          >
                            <span>
                              {t("studentGrades.quizzes", "Quizzes")} ({row.quizzes?.length})
                            </span>
                          </Button>

                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Stack spacing={1} sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed rgba(255,255,255,0.12)" }}>
                              {row.quizzes!.map((quiz) => (
                                <Box
                                  key={quiz.quizId}
                                  sx={{
                                    bgcolor: "rgba(0, 0, 0, 0.2)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    borderRadius: "12px",
                                    p: 1.5,
                                  }}
                                >
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "white" }}>
                                      {quiz.title}
                                    </Typography>
                                    <Chip
                                      label={<bdi dir="ltr">{`${quiz.score ?? 0} / ${quiz.maxScore}`}</bdi>}
                                      size="small"
                                      sx={{
                                        fontSize: "11px",
                                        fontWeight: 800,
                                        bgcolor: "rgba(129, 199, 132, 0.15)",
                                        color: "#81c784",
                                        height: "22px",
                                      }}
                                    />
                                  </Box>
                                  <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", mt: 0.5 }}>
                                    {quiz.quizDate}
                                  </Typography>
                                  {quiz.notes && (
                                    <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", mt: 0.5, fontStyle: "italic" }}>
                                      {quiz.notes}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Collapse>
                        </Box>
                      ) : (
                        <Box sx={{ pt: 1, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 0.75 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }} />
                          <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                            {t("studentGrades.noQuizzes", "No linked quizzes recorded for this subject")}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
