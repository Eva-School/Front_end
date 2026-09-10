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

  const calculateOverallAverage = () => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, g) => acc + (g.percentage ?? 0), 0);
    return Math.round(sum / grades.length);
  };

  const overallAverage = calculateOverallAverage();
  const yearLabel = YEAR_LABELS[displayYear] ?? displayYear;

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
        p: { xs: 2, md: 4 },
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
          backdropFilter: "blur(16px)",
          borderRadius: "24px",
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          p: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Button
            component={Link}
            href="/student"
            startIcon={<ArrowBackIcon sx={{ transform: isRtl ? "rotate(180deg)" : "none" }} />}
            sx={{
              color: "#FFC600",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              px: 2,
              py: 0.8,
              borderRadius: "12px",
              bgcolor: "rgba(255, 198, 0, 0.1)",
              "&:hover": { backgroundColor: "rgba(255, 198, 0, 0.2)" },
            }}
          >
            {t("common.back", "Back to Dashboard")}
          </Button>

          {academicYearName && (
            <Chip
              icon={<DateRangeIcon sx={{ fontSize: 16, color: "#FFC600 !important" }} />}
              label={`Academic Year: ${academicYearName}`}
              size="small"
              sx={{
                color: "#FFC600",
                bgcolor: "rgba(255, 198, 0, 0.1)",
                borderColor: "rgba(255, 198, 0, 0.3)",
              }}
              variant="outlined"
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ color: "white", fontWeight: 800, fontSize: { xs: "22px", md: "28px" } }}>
              Quarter & Coursework Grades
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", mt: 0.5 }}>
              Continuous assessment, quarterly distribution (Q1 - Q4), and linked quizzes
            </Typography>
          </Box>

          <Box
            sx={{
              background: "linear-gradient(135deg, #FFC600 0%, #FFA000 100%)",
              borderRadius: "16px",
              px: 3,
              py: 1.5,
              minWidth: "150px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(255, 198, 0, 0.3)",
            }}
          >
            <Typography sx={{ fontSize: "12px", color: "#1a1a1a", fontWeight: 600, letterSpacing: "0.5px" }}>
              TERM AVERAGE
            </Typography>
            <Typography sx={{ fontSize: "28px", color: "#000", fontWeight: 900 }}>
              {loading ? "..." : `${overallAverage}%`}
            </Typography>
          </Box>
        </Box>

        {/* Term Tabs Switcher */}
        <Box sx={{ mt: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Tabs
            value={selectedTerm}
            onChange={(_, val) => setSelectedTerm(val)}
            sx={{
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
                fontSize: "15px",
                textTransform: "none",
                minHeight: "44px",
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
              <Tab key={tNum} label={`Term ${tNum}`} value={tNum} />
            ))}
          </Tabs>
        </Box>
      </Box>

      {error && (
        <Box sx={{ width: "100%", maxWidth: "1400px", mb: 2 }}>
          <Card sx={{ bgcolor: "rgba(244, 67, 54, 0.15)", border: "1px solid rgba(244, 67, 54, 0.3)", borderRadius: "16px" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography color="error.light" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Grades Table Container */}
      <Box sx={{ width: "100%", maxWidth: "1400px", mb: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#FFC600", mb: 2 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Loading quarter grades...</Typography>
          </Box>
        ) : grades.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: alpha(theme.palette.background.paper, 0.05),
              borderRadius: "20px",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)", mb: 1 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              No quarter grades available yet
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mt: 0.5 }}>
              Grades for Term {selectedTerm} in {yearLabel} will be published once grading is finalized.
            </Typography>
          </Box>
        ) : (
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
                  <TableCell sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Subject
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Q1
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Q2
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Q3
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Q4
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Coursework Total
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Progress
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Quizzes
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((row, index) => {
                  const isExpanded = !!expandedRows[index];
                  const hasQuizzes = row.quizzes && row.quizzes.length > 0;
                  const pct = row.percentage ?? 0;
                  const progressColor =
                    pct >= 85 ? "#66bb6a" : pct >= 65 ? "#42a5f5" : pct >= 50 ? "#ffa726" : "#ef5350";

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
                              sx={{ color: "#FFC600" }}
                            >
                              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                          )}
                        </TableCell>

                        <TableCell sx={{ py: 2 }}>
                          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "white" }}>
                            {row.subject}
                          </Typography>
                          {row.subjectCode && (
                            <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                              {row.subjectCode}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                          {row.quarter1 !== null && row.quarter1 !== undefined ? (
                            <Tooltip title={`Max: ${row.maxQ1 ?? 25}`}>
                              <span>{row.quarter1}</span>
                            </Tooltip>
                          ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                          {row.quarter2 !== null && row.quarter2 !== undefined ? (
                            <Tooltip title={`Max: ${row.maxQ2 ?? 25}`}>
                              <span>{row.quarter2}</span>
                            </Tooltip>
                          ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                          {row.quarter3 !== null && row.quarter3 !== undefined ? (
                            <Tooltip title={`Max: ${row.maxQ3 ?? 25}`}>
                              <span>{row.quarter3}</span>
                            </Tooltip>
                          ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                          {row.quarter4 !== null && row.quarter4 !== undefined ? (
                            <Tooltip title={`Max: ${row.maxQ4 ?? 25}`}>
                              <span>{row.quarter4}</span>
                            </Tooltip>
                          ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>—</Typography>
                          )}
                        </TableCell>

                        <TableCell align="center" sx={{ py: 2 }}>
                          <Chip
                            label={`${row.courseworkTotal ?? row.yourGrade} / ${row.maxQuarter ?? 100}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: "rgba(255, 198, 0, 0.15)",
                              color: "#FFC600",
                              border: "1px solid rgba(255, 198, 0, 0.3)",
                            }}
                          />
                        </TableCell>

                        <TableCell align="center" sx={{ minWidth: "140px", py: 2 }}>
                          <Stack spacing={0.5} alignItems="center">
                            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: progressColor }}>
                              {pct}%
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
                        </TableCell>

                        <TableCell align="center" sx={{ py: 2 }}>
                          {hasQuizzes ? (
                            <Button
                              size="small"
                              onClick={() => toggleRow(index)}
                              startIcon={<QuizIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                color: "#90caf9",
                                textTransform: "none",
                                fontSize: "12px",
                                bgcolor: "rgba(144, 202, 249, 0.1)",
                                borderRadius: "8px",
                                px: 1.5,
                              }}
                            >
                              {row.quizzes?.length} Quizzes
                            </Button>
                          ) : (
                            <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                              None
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expandable Quizzes Sub-Row */}
                      {hasQuizzes && (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ py: 0, px: 3, bgcolor: "rgba(0,0,0,0.2)" }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2 }}>
                                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#FFC600", mb: 1 }}>
                                  Quizzes & Class Assessments for {row.subject}
                                </Typography>
                                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                  {row.quizzes?.map((quiz) => (
                                    <Box
                                      key={quiz.quizId}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: "12px",
                                        bgcolor: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        minWidth: "180px",
                                      }}
                                    >
                                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "white" }}>
                                        {quiz.title}
                                      </Typography>
                                      <Typography sx={{ fontSize: "16px", fontWeight: 800, color: "#66bb6a", mt: 0.5 }}>
                                        {quiz.score !== null && quiz.score !== undefined ? `${quiz.score} / ${quiz.maxScore}` : "Ungraded"}
                                      </Typography>
                                      {quiz.notes && (
                                        <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
                                          Note: {quiz.notes}
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
        )}
      </Box>
    </Box>
  );
}
