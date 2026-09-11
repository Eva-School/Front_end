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
  Chip,
  Stack,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import VerifiedIcon from "@mui/icons-material/Verified";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import ClassIcon from "@mui/icons-material/Class";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentService } from "@/services/student.service";
import type { FinalGradeRow, FinalGradesResponse, StudentProfileData } from "@/types/Student-api/grades";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior (Year 1)",
  wheeler: "Wheeler (Year 2)",
  senior: "Senior (Year 3)",
};

export default function FinalGradesPage() {
  const theme = useTheme();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const { displayYear } = useStudentYear();
  const [data, setData] = useState<FinalGradesResponse | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [gradesRes, profileRes] = await Promise.allSettled([
          studentService.getFinalGrades(displayYear),
          studentService.getStudentProfile(),
        ]);

        if (cancelled) return;

        if (gradesRes.status === "fulfilled" && gradesRes.value) {
          setData(gradesRes.value);
        } else if (gradesRes.status === "rejected") {
          setError(
            gradesRes.reason instanceof Error
              ? gradesRes.reason.message
              : "Failed to load final grades"
          );
        }

        if (profileRes.status === "fulfilled" && profileRes.value) {
          setProfile(profileRes.value);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load transcript");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [displayYear]);

  const yearLabel = YEAR_LABELS[displayYear] ?? displayYear;
  const grades = data?.grades ?? [];
  const availableTerms = Array.from(
    new Set(grades.map((g) => g.termName || (g.termId ? `Term ${g.termId}` : "Term 1")))
  );
  const filteredGrades =
    selectedTermFilter === "all"
      ? grades
      : grades.filter(
          (g) => (g.termName || (g.termId ? `Term ${g.termId}` : "Term 1")) === selectedTermFilter
        );

  const getLetterColor = (letter?: string | null) => {
    const l = (letter || "").toUpperCase();
    if (!l || l === "—" || l === "-") {
      return {
        bg: "rgba(255, 255, 255, 0.08)",
        text: "rgba(255, 255, 255, 0.6)",
        border: "rgba(255, 255, 255, 0.15)",
      };
    }
    if (l.startsWith("A") || l === "EE") {
      return {
        bg: "rgba(255, 198, 0, 0.15)",
        text: "#FFC600",
        border: "rgba(255, 198, 0, 0.35)",
      };
    }
    if (l.startsWith("B") || l === "ME") {
      return {
        bg: "rgba(76, 175, 80, 0.15)",
        text: "#81c784",
        border: "rgba(76, 175, 80, 0.3)",
      };
    }
    if (l.startsWith("C") || l === "GE") {
      return {
        bg: "rgba(33, 150, 243, 0.15)",
        text: "#64b5f6",
        border: "rgba(33, 150, 243, 0.3)",
      };
    }
    if (l.startsWith("D")) {
      return {
        bg: "rgba(255, 152, 0, 0.15)",
        text: "#ffb74d",
        border: "rgba(255, 152, 0, 0.3)",
      };
    }
    return {
      bg: "rgba(244, 67, 54, 0.15)",
      text: "#e57373",
      border: "rgba(244, 67, 54, 0.3)",
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const studentDisplayName = profile
    ? isRtl && profile.nameArabic
      ? profile.nameArabic
      : profile.name
    : "";

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
        "@media print": {
          backgroundImage: "none",
          backgroundColor: "#ffffff",
          color: "#000000",
          p: 0,
          m: 0,
        },
      }}
    >
      {/* ─── PRINT ONLY: OFFICIAL TRANSCRIPT CERTIFICATE ─── */}
      <Box
        sx={{
          display: "none",
          "@media print": {
            display: "block",
            width: "100%",
            maxWidth: "1000px",
            mx: "auto",
            p: 4,
            color: "#000",
          },
        }}
      >
        <Box sx={{ textAlign: "center", pb: 2, borderBottom: "2px solid #000", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
            {t("studentGrades.officialTranscriptHeader", "EVA INTERNATIONAL TECHNICAL SCHOOL")}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5, color: "#333" }}>
            {t("studentGrades.officialTranscriptSub", "Official Certified Academic Transcript")}
          </Typography>
        </Box>

        {/* Student Identity Ledger */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: "6px",
            mb: 3,
            fontSize: "13px",
          }}
        >
          <div><strong>{t("studentGrades.studentName", "Student Name")}:</strong> {studentDisplayName || "—"}</div>
          <div><strong>{t("studentGrades.studentCode", "Student Code")}:</strong> {profile?.studentCode || "—"}</div>
          <div><strong>{t("studentGrades.nationalId", "National ID")}:</strong> {profile?.nationalId || "—"}</div>
          <div><strong>{t("studentGrades.className", "Class / Section")}:</strong> {profile?.className || "—"}</div>
          <div><strong>{t("studentGrades.academicYear", "Academic Year")}:</strong> {data?.academicYearName || yearLabel}</div>
          <div><strong>{t("studentGrades.dateOfIssue", "Date of Issue")}:</strong> {new Date().toLocaleDateString()}</div>
        </Box>

        {/* Formal Grades Ledger */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #000" }}>
              <th style={{ padding: "8px", textAlign: isRtl ? "right" : "left", border: "1px solid #ddd" }}>{t("studentGrades.subject", "Subject")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.term", "Term")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.coursework", "Coursework")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.finalExam", "Final Exam")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.totalMarks", "Total Score")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.letterGrade", "Letter Grade")}</th>
              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{t("studentGrades.status", "Status")}</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: 700 }}>
                  {isRtl && row.subjectArabic ? row.subjectArabic : row.subject}
                </td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{row.termName || `Term ${row.termId}`}</td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{row.courseworkScore ?? "—"}</td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{row.finalExamScore ?? "—"}</td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd", fontWeight: 800 }}>
                  {row.totalScore !== null ? `${row.totalScore} / ${row.maxScore ?? 100}` : "—"}
                </td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd", fontWeight: 800 }}>{row.letterGrade || "—"}</td>
                <td style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>{row.status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Certificate Declaration & Signature Lines */}
        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #ccc" }}>
          <Typography sx={{ fontSize: "11px", color: "#555", fontStyle: "italic", mb: 4, textAlign: "center" }}>
            {t("studentGrades.certifiedNotice", "Official transcript generated by Eva School Grade Management System. Valid only with official institutional stamp and signature.")}
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, textAlign: "center", pt: 2 }}>
            <div>
              <Box sx={{ borderBottom: "1px solid #000", height: "40px", mb: 1 }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>{t("studentGrades.headOfDepartment", "Head of Department")}</Typography>
            </div>
            <div>
              <Box sx={{ borderBottom: "1px solid #000", height: "40px", mb: 1 }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>{t("studentGrades.viceDean", "Vice Dean for Student Affairs")}</Typography>
            </div>
            <div>
              <Box sx={{ border: "1px dashed #999", height: "60px", mb: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "11px" }}>
                {t("studentGrades.officialSeal", "Official Seal")}
              </Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700 }}>{t("studentGrades.schoolPrincipal", "School Principal")}</Typography>
            </div>
          </Box>
        </Box>
      </Box>

      {/* ─── SCREEN UI: LUXURY EXECUTIVE PORTAL ─── */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          "@media print": {
            display: "none",
          },
        }}
      >
        {/* Top Header Card */}
        <Box
          sx={{
            background: alpha(theme.palette.background.paper, 0.08),
            backdropFilter: "blur(18px)",
            borderRadius: { xs: "18px", md: "24px" },
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            p: { xs: 2, sm: 2.5, md: 3.5 },
            mb: 3,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Nav & Quick Actions */}
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

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              {profile?.className && (
                <Chip
                  icon={<ClassIcon sx={{ fontSize: 16 }} />}
                  label={profile.className}
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "12px",
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                />
              )}

              {data?.academicYearName && (
                <Chip
                  icon={<DateRangeIcon sx={{ fontSize: 16, color: "#FFC600 !important" }} />}
                  label={`${t("studentGrades.academicYear", "Academic Year")}: ${data.academicYearName}`}
                  size="small"
                  sx={{
                    color: "#FFC600",
                    bgcolor: "rgba(255, 198, 0, 0.1)",
                    borderColor: "rgba(255, 198, 0, 0.25)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                  variant="outlined"
                />
              )}

              <Button
                variant="outlined"
                startIcon={<PrintIcon sx={{ fontSize: 18 }} />}
                onClick={handlePrint}
                sx={{
                  color: "#FFC600",
                  borderColor: "rgba(255, 198, 0, 0.4)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2,
                  py: 0.8,
                  borderRadius: "12px",
                  bgcolor: "rgba(255, 198, 0, 0.05)",
                  "&:hover": {
                    borderColor: "#FFC600",
                    backgroundColor: "rgba(255, 198, 0, 0.15)",
                  },
                }}
              >
                {t("studentGrades.printTranscript", "Print Transcript")}
              </Button>
            </Stack>
          </Box>

          {/* Title & Subtitle */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: { xs: "20px", sm: "24px", md: "28px" },
                letterSpacing: "-0.5px",
              }}
            >
              {t("studentGrades.finalTitle", "Official Academic Transcript & Final Results")}
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
                "studentGrades.finalSubtitle",
                "Certified subject scores, GPA standing, and vice dean approved records"
              )}
            </Typography>
          </Box>

          {/* 4 Strategic Academic KPI Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {/* 1. Overall Average Tile */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #FFC600 0%, #FFA000 100%)",
                borderRadius: "16px",
                p: 2,
                textAlign: "center",
                boxShadow: "0 6px 20px rgba(255, 198, 0, 0.28)",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "#1a1a1a", fontWeight: 800, letterSpacing: "0.5px" }}>
                {t("studentGrades.overallAverage", "OVERALL AVERAGE")}
              </Typography>
              <Typography
                sx={{
                  fontSize: data?.cumulativeAverage !== null && data?.cumulativeAverage !== undefined ? "26px" : "18px",
                  color: "#000",
                  fontWeight: 900,
                  mt: 0.5,
                  lineHeight: 1.1,
                }}
              >
                {data?.cumulativeAverage !== null && data?.cumulativeAverage !== undefined
                  ? `${data.cumulativeAverage}%`
                  : t("studentGrades.notReleased", "Not Released")}
              </Typography>
            </Box>

            {/* 2. Total Score Tile */}
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.5px" }}>
                {t("studentGrades.totalScore", "TOTAL SCORE")}
              </Typography>
              <Typography
                sx={{
                  fontSize: data?.totalMaxScore && data.totalMaxScore > 0 ? "20px" : "16px",
                  color: "white",
                  fontWeight: 800,
                  mt: 0.5,
                }}
              >
                {data?.totalMaxScore && data.totalMaxScore > 0 ? (
                  <bdi dir="ltr">{data.totalEarnedScore ?? 0} / {data.totalMaxScore}</bdi>
                ) : (
                  t("studentGrades.notReleased", "Not Released")
                )}
              </Typography>
            </Box>

            {/* 3. Standing Tile */}
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.5px" }}>
                {t("studentGrades.standing", "STANDING")}
              </Typography>
              <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center" sx={{ mt: 0.5 }}>
                <EmojiEventsIcon sx={{ fontSize: 18, color: "#FFC600" }} />
                <Typography sx={{ fontSize: "15px", color: "white", fontWeight: 800 }}>
                  {data?.standing === "Not Released"
                    ? t("studentGrades.notReleased", "Not Released")
                    : (data?.standing || t("studentGrades.notReleased", "Not Released")).replace(/\s*\(دور ثان \/ راسب\)/g, "")}
                </Typography>
              </Stack>
            </Box>

            {/* 4. Passed Units Tile */}
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.5px" }}>
                {t("studentGrades.passedUnits", "PASSED UNITS")}
              </Typography>
              <Typography
                sx={{
                  fontSize: data?.totalMaxScore && data.totalMaxScore > 0 ? "20px" : "16px",
                  color: "#81c784",
                  fontWeight: 800,
                  mt: 0.5,
                }}
              >
                {data?.totalMaxScore && data.totalMaxScore > 0 ? (
                  <bdi dir="ltr">{data.passedSubjects} / {data.totalSubjects}</bdi>
                ) : (
                  t("studentGrades.notReleased", "Not Released")
                )}
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Box sx={{ width: "100%", mb: 2.5 }}>
            <Card sx={{ bgcolor: "rgba(244, 67, 54, 0.15)", border: "1px solid rgba(244, 67, 54, 0.3)", borderRadius: "16px" }}>
              <CardContent sx={{ py: 2 }}>
                <Typography color="error.light" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Transcript Content Section */}
        <Box sx={{ width: "100%", mb: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: "#FFC600", mb: 2 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                {t("common.loading", "Loading transcript records...")}
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
                {t("studentGrades.noTranscriptRecords", "No final transcript records available yet")}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mt: 0.5 }}>
                {t("studentGrades.noTranscriptRecordsDesc", "Final course examination scores will be posted after official review and approval.")}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Term Filter Switcher Tabs */}
              {availableTerms.length > 1 && (
                <Box sx={{ mb: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                  <Tabs
                    value={selectedTermFilter}
                    onChange={(_, val) => setSelectedTermFilter(val)}
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
                    <Tab label={t("studentGrades.allTerms", "All Terms (Full Year)")} value="all" />
                    {availableTerms.map((tName) => (
                      <Tab
                        key={tName}
                        label={
                          tName.toLowerCase().includes("1")
                            ? t("studentGrades.term1", "Term 1")
                            : tName.toLowerCase().includes("2")
                            ? t("studentGrades.term2", "Term 2")
                            : tName
                        }
                        value={tName}
                      />
                    ))}
                  </Tabs>
                </Box>
              )}

              {filteredGrades.length === 0 ? (
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
                    {t("studentGrades.noRecordsForFilter", "No transcript records for this selection")}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* ─── 1. Desktop Presentation: Luxury Transcript Table (md+) ─── */}
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
                            <TableCell sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.subjectDetails", "Subject Details")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.term", "Term")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.coursework", "Coursework")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.finalExam", "Final Exam")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.totalMarks", "Total Score")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.letterGrade", "Letter Grade")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.status", "Status")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                              {t("studentGrades.approval", "Approval")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredGrades.map((row, index) => {
                            const letterStyles = getLetterColor(row.letterGrade);
                            const isNotReleased =
                              row.status === "Not Released" ||
                              (row.totalScore === null && row.courseworkScore === null && row.finalExamScore === null) ||
                              (row.status?.toLowerCase().includes("progress") && row.courseworkScore === null && row.finalExamScore === null);
                            const isInProgress = !isNotReleased && (row.status === "In Progress" || row.status?.toLowerCase().includes("progress"));
                            const isPassed = !isNotReleased && !isInProgress && (row.status?.toLowerCase().includes("pass") || (row.percentage ?? 0) >= 50);

                            return (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
                                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  transition: "background-color 0.2s ease",
                                }}
                              >
                                {/* Subject Name & Code */}
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

                                {/* Term */}
                                <TableCell align="center" sx={{ py: 2 }}>
                                  <Chip
                                    label={
                                      (row.termName || `Term ${row.termId}`).toLowerCase().includes("1")
                                        ? t("studentGrades.term1", "Term 1")
                                        : (row.termName || `Term ${row.termId}`).toLowerCase().includes("2")
                                        ? t("studentGrades.term2", "Term 2")
                                        : row.termName || `Term ${row.termId}`
                                    }
                                    size="small"
                                    sx={{
                                      bgcolor: "rgba(255, 255, 255, 0.08)",
                                      color: "rgba(255, 255, 255, 0.9)",
                                      fontWeight: 600,
                                      border: "1px solid rgba(255, 255, 255, 0.15)",
                                      fontSize: "12px",
                                    }}
                                  />
                                </TableCell>

                                {/* Coursework Score */}
                                <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                                  {row.courseworkScore !== null && row.courseworkScore !== undefined ? (
                                    <bdi dir="ltr">{row.courseworkScore}</bdi>
                                  ) : (
                                    <Chip
                                      label={t("studentGrades.notReleased", "Not Released")}
                                      size="small"
                                      sx={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        bgcolor: "rgba(255, 255, 255, 0.05)",
                                        color: "rgba(255, 255, 255, 0.45)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                      }}
                                    />
                                  )}
                                </TableCell>

                                {/* Final Exam Score */}
                                <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                                  {row.finalExamScore !== null && row.finalExamScore !== undefined ? (
                                    <bdi dir="ltr">{row.finalExamScore}</bdi>
                                  ) : (
                                    <Chip
                                      label={t("studentGrades.notReleased", "Not Released")}
                                      size="small"
                                      sx={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        bgcolor: "rgba(255, 255, 255, 0.05)",
                                        color: "rgba(255, 255, 255, 0.45)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                      }}
                                    />
                                  )}
                                </TableCell>

                                {/* Total Score */}
                                <TableCell align="center" sx={{ py: 2 }}>
                                  {isNotReleased ? (
                                    <Chip
                                      label={t("studentGrades.notReleased", "Not Released")}
                                      size="small"
                                      sx={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        bgcolor: "rgba(255, 255, 255, 0.05)",
                                        color: "rgba(255, 255, 255, 0.45)",
                                        border: "1px solid rgba(255, 255, 255, 0.12)",
                                      }}
                                    />
                                  ) : isInProgress ? (
                                    <Box>
                                      <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white" }}>
                                        <bdi dir="ltr">{row.totalScore ?? row.courseworkScore} / {row.maxScore ?? 100}</bdi>
                                      </Typography>
                                      <Typography sx={{ fontSize: "11px", color: "rgba(100, 181, 246, 0.9)", display: "block", mt: 0.25 }}>
                                        {t("studentGrades.courseworkOnly", "Coursework only (Exam pending)")}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Box>
                                      <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white" }}>
                                        <bdi dir="ltr">{row.totalScore} / {row.maxScore ?? 100}</bdi>
                                      </Typography>
                                      <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", mt: 0.25 }}>
                                        <bdi dir="ltr">({row.percentage ?? 0}%)</bdi>
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>

                                {/* Letter Grade Stamp Badge */}
                                <TableCell align="center" sx={{ py: 2 }}>
                                  {isNotReleased ? (
                                    <Chip
                                      label={t("studentGrades.notReleased", "Not Released")}
                                      size="small"
                                      sx={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        bgcolor: "rgba(255, 255, 255, 0.05)",
                                        color: "rgba(255, 255, 255, 0.45)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      label={row.letterGrade || "—"}
                                      size="small"
                                      sx={{
                                        fontWeight: 900,
                                        fontSize: "13px",
                                        bgcolor: letterStyles.bg,
                                        color: letterStyles.text,
                                        border: `1px solid ${letterStyles.border}`,
                                        minWidth: "44px",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                      }}
                                    />
                                  )}
                                </TableCell>

                                {/* Status */}
                                <TableCell align="center" sx={{ py: 2 }}>
                                  {isNotReleased ? (
                                    <Chip
                                      label={t("studentGrades.notReleased", "Not Released")}
                                      size="small"
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: "12px",
                                        bgcolor: "rgba(255, 255, 255, 0.06)",
                                        color: "rgba(255, 255, 255, 0.55)",
                                        border: "1px solid rgba(255, 255, 255, 0.15)",
                                      }}
                                    />
                                  ) : isInProgress ? (
                                    <Chip
                                      label={t("studentGrades.inProgress", "In Progress")}
                                      size="small"
                                      sx={{
                                        fontWeight: 700,
                                        bgcolor: "rgba(33, 150, 243, 0.12)",
                                        color: "#64b5f6",
                                        border: "1px solid rgba(33, 150, 243, 0.25)",
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      label={isPassed ? t("studentGrades.pass", "Pass") : t("studentGrades.fail", "Fail")}
                                      size="small"
                                      sx={{
                                        fontWeight: 700,
                                        bgcolor: isPassed ? "rgba(76, 175, 80, 0.12)" : "rgba(244, 67, 54, 0.12)",
                                        color: isPassed ? "#81c784" : "#e57373",
                                        border: `1px solid ${isPassed ? "rgba(76, 175, 80, 0.25)" : "rgba(244, 67, 54, 0.25)"}`,
                                      }}
                                    />
                                  )}
                                </TableCell>

                                {/* Approval Verification */}
                                <TableCell align="center" sx={{ py: 2 }}>
                                  {row.isApproved ? (
                                    <Tooltip title={t("studentGrades.formallyApproved", "Formally Approved by Vice Dean")}>
                                      <Chip
                                        icon={<VerifiedIcon sx={{ fontSize: 16, color: "#81c784 !important" }} />}
                                        label={t("studentGrades.approved", "Approved")}
                                        size="small"
                                        sx={{
                                          color: "#81c784",
                                          bgcolor: "rgba(76, 175, 80, 0.1)",
                                          borderColor: "rgba(76, 175, 80, 0.2)",
                                          fontWeight: 700,
                                        }}
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  ) : isNotReleased ? (
                                    <Tooltip title={t("studentGrades.notReleasedTooltip", "Subject results have not been released yet")}>
                                      <Chip
                                        label={t("studentGrades.notReleased", "Not Released")}
                                        size="small"
                                        sx={{
                                          color: "rgba(255, 255, 255, 0.4)",
                                          bgcolor: "rgba(255, 255, 255, 0.04)",
                                          borderColor: "rgba(255, 255, 255, 0.1)",
                                        }}
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  ) : isInProgress ? (
                                    <Tooltip title={t("studentGrades.subjectInProgress", "Subject coursework and exams are currently in progress")}>
                                      <Chip
                                        label={t("studentGrades.inProgress", "In Progress")}
                                        size="small"
                                        sx={{
                                          color: "rgba(255, 255, 255, 0.5)",
                                          bgcolor: "rgba(255, 255, 255, 0.05)",
                                          borderColor: "rgba(255, 255, 255, 0.15)",
                                        }}
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title={t("studentGrades.awaitingApproval", "Provisional Result - Awaiting Formal Approval")}>
                                      <Chip
                                        icon={<PendingActionsIcon sx={{ fontSize: 16, color: "#ffa726 !important" }} />}
                                        label={t("studentGrades.provisional", "Provisional")}
                                        size="small"
                                        sx={{
                                          color: "#ffa726",
                                          bgcolor: "rgba(255, 167, 38, 0.1)",
                                          borderColor: "rgba(255, 167, 38, 0.2)",
                                          fontWeight: 700,
                                        }}
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* ─── 2. Mobile Presentation: Responsive Transcript Cards (xs, sm) ─── */}
                  <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 2 }}>
                    {filteredGrades.map((row, index) => {
                      const letterStyles = getLetterColor(row.letterGrade);
                      const isNotReleased =
                        row.status === "Not Released" ||
                        (row.totalScore === null && row.courseworkScore === null && row.finalExamScore === null) ||
                        (row.status?.toLowerCase().includes("progress") && row.courseworkScore === null && row.finalExamScore === null);
                      const isInProgress = !isNotReleased && (row.status === "In Progress" || row.status?.toLowerCase().includes("progress"));
                      const isPassed = !isNotReleased && !isInProgress && (row.status?.toLowerCase().includes("pass") || (row.percentage ?? 0) >= 50);

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
                            {/* Top row: Subject name and Letter Grade Seal badge */}
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

                              {isNotReleased ? (
                                <Chip
                                  label={t("studentGrades.notReleased", "Not Released")}
                                  size="small"
                                  sx={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    bgcolor: "rgba(255, 255, 255, 0.06)",
                                    color: "rgba(255, 255, 255, 0.5)",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label={row.letterGrade || "—"}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: "15px",
                                    bgcolor: letterStyles.bg,
                                    color: letterStyles.text,
                                    border: `1px solid ${letterStyles.border}`,
                                    minWidth: "46px",
                                    height: "30px",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Term & Approval Badge row */}
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                              <Chip
                                label={
                                  (row.termName || `Term ${row.termId}`).toLowerCase().includes("1")
                                    ? t("studentGrades.term1", "Term 1")
                                    : (row.termName || `Term ${row.termId}`).toLowerCase().includes("2")
                                    ? t("studentGrades.term2", "Term 2")
                                    : row.termName || `Term ${row.termId}`
                                }
                                size="small"
                                sx={{
                                  bgcolor: "rgba(255, 255, 255, 0.06)",
                                  color: "rgba(255, 255, 255, 0.8)",
                                  fontWeight: 600,
                                  fontSize: "11px",
                                }}
                              />

                              {row.isApproved ? (
                                <Chip
                                  icon={<VerifiedIcon sx={{ fontSize: 14, color: "#81c784 !important" }} />}
                                  label={t("studentGrades.approved", "Approved")}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(76, 175, 80, 0.1)",
                                    color: "#81c784",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                  }}
                                />
                              ) : isNotReleased ? null : (
                                <Chip
                                  label={t("studentGrades.provisional", "Provisional")}
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(255, 167, 38, 0.1)",
                                    color: "#ffa726",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Stack>

                            {/* Dual Score Split: Coursework vs Final Exam */}
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 1.5,
                                my: 1.5,
                                p: 1.5,
                                borderRadius: "14px",
                                bgcolor: "rgba(0, 0, 0, 0.25)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                              }}
                            >
                              <Box sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                  {t("studentGrades.coursework", "Coursework")}
                                </Typography>
                                <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                  {row.courseworkScore !== null && row.courseworkScore !== undefined ? (
                                    <bdi dir="ltr">{row.courseworkScore}</bdi>
                                  ) : (
                                    <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                  )}
                                </Typography>
                              </Box>

                              <Box sx={{ textAlign: "center", borderLeft: isRtl ? "none" : "1px solid rgba(255,255,255,0.1)", borderRight: isRtl ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                                  {t("studentGrades.finalExam", "Final Exam")}
                                </Typography>
                                <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white", mt: 0.5 }}>
                                  {row.finalExamScore !== null && row.finalExamScore !== undefined ? (
                                    <bdi dir="ltr">{row.finalExamScore}</bdi>
                                  ) : (
                                    <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                                  )}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Total Marks & Progress */}
                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                                <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
                                  {t("studentGrades.totalMarks", "Total Score")}
                                </Typography>
                                {!isNotReleased && (
                                  <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "white" }}>
                                    <bdi dir="ltr">{row.totalScore ?? row.courseworkScore} / {row.maxScore ?? 100}</bdi>
                                  </Typography>
                                )}
                              </Box>

                              {isNotReleased ? (
                                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                                  {t("studentGrades.notReleased", "Not Released")}
                                </Typography>
                              ) : isInProgress ? (
                                <Typography sx={{ fontSize: "11px", color: "rgba(100, 181, 246, 0.9)", mt: 0.25 }}>
                                  {t("studentGrades.courseworkOnly", "Coursework only (Exam pending)")}
                                </Typography>
                              ) : (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(100, Math.max(0, row.percentage ?? 0))}
                                    sx={{
                                      flex: 1,
                                      height: 7,
                                      borderRadius: 4,
                                      bgcolor: "rgba(255,255,255,0.1)",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor: isPassed ? "#81c784" : "#e57373",
                                        borderRadius: 4,
                                      },
                                    }}
                                  />
                                  <Typography sx={{ fontSize: "12px", fontWeight: 800, color: isPassed ? "#81c784" : "#e57373", minWidth: "36px", textAlign: "right" }}>
                                    <bdi dir="ltr">{row.percentage ?? 0}%</bdi>
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Status Bottom Banner */}
                            <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                                {t("studentGrades.status", "Status")}:
                              </Typography>
                              {isNotReleased ? (
                                <Chip
                                  label={t("studentGrades.notReleased", "Not Released")}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    bgcolor: "rgba(255, 255, 255, 0.05)",
                                    color: "rgba(255, 255, 255, 0.5)",
                                  }}
                                />
                              ) : isInProgress ? (
                                <Chip
                                  label={t("studentGrades.inProgress", "In Progress")}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    bgcolor: "rgba(33, 150, 243, 0.12)",
                                    color: "#64b5f6",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label={isPassed ? t("studentGrades.pass", "Pass") : t("studentGrades.fail", "Fail")}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    bgcolor: isPassed ? "rgba(76, 175, 80, 0.12)" : "rgba(244, 67, 54, 0.12)",
                                    color: isPassed ? "#81c784" : "#e57373",
                                  }}
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
