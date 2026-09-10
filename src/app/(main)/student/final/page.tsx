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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import VerifiedIcon from "@mui/icons-material/Verified";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentService } from "@/services/student.service";
import type { FinalGradeRow, FinalGradesResponse } from "@/types/Student-api/grades";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await studentService.getFinalGrades(displayYear);
        if (!cancelled) {
          setData(res);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load final grades");
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

  const getLetterColor = (letter?: string) => {
    const l = (letter || "").toUpperCase();
    if (l.startsWith("A")) return { bg: "rgba(76, 175, 80, 0.15)", text: "#81c784", border: "rgba(76, 175, 80, 0.3)" };
    if (l.startsWith("B")) return { bg: "rgba(33, 150, 243, 0.15)", text: "#64b5f6", border: "rgba(33, 150, 243, 0.3)" };
    if (l.startsWith("C")) return { bg: "rgba(255, 152, 0, 0.15)", text: "#ffb74d", border: "rgba(255, 152, 0, 0.3)" };
    if (l.startsWith("D")) return { bg: "rgba(255, 193, 7, 0.15)", text: "#ffd54f", border: "rgba(255, 193, 7, 0.3)" };
    return { bg: "rgba(244, 67, 54, 0.15)", text: "#e57373", border: "rgba(244, 67, 54, 0.3)" };
  };

  const handlePrint = () => {
    window.print();
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

          <Button
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "none",
              px: 2,
              py: 0.8,
              borderRadius: "12px",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            Print Transcript
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ color: "white", fontWeight: 800, fontSize: { xs: "22px", md: "28px" } }}>
              Official Academic Transcript & Final Results
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", mt: 0.5 }}>
              {yearLabel} {data?.academicYearName ? `• Academic Year: ${data.academicYearName}` : ""}
            </Typography>
          </Box>

          {/* Academic Standing Cards */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {data?.termGpa !== null && data?.termGpa !== undefined && (
              <Box
                sx={{
                  background: "linear-gradient(135deg, #FFC600 0%, #FFA000 100%)",
                  borderRadius: "16px",
                  px: 2.5,
                  py: 1.2,
                  minWidth: "120px",
                  textAlign: "center",
                  boxShadow: "0 6px 20px rgba(255, 198, 0, 0.3)",
                }}
              >
                <Typography sx={{ fontSize: "11px", color: "#1a1a1a", fontWeight: 700 }}>
                  TERM GPA
                </Typography>
                <Typography sx={{ fontSize: "26px", color: "#000", fontWeight: 900 }}>
                  {data.termGpa.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                px: 2.5,
                py: 1.2,
                minWidth: "140px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                STANDING
              </Typography>
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center" sx={{ mt: 0.5 }}>
                <EmojiEventsIcon sx={{ fontSize: 18, color: "#FFC600" }} />
                <Typography sx={{ fontSize: "15px", color: "white", fontWeight: 800 }}>
                  {data?.standing || "In Progress"}
                </Typography>
              </Stack>
            </Box>

            {data?.cumulativeAverage !== null && data?.cumulativeAverage !== undefined && (
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "16px",
                  px: 2.5,
                  py: 1.2,
                  minWidth: "110px",
                  textAlign: "center",
                }}
              >
                <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                  AVERAGE
                </Typography>
                <Typography sx={{ fontSize: "24px", color: "white", fontWeight: 800, mt: 0.2 }}>
                  {data.cumulativeAverage}%
                </Typography>
              </Box>
            )}
          </Stack>
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

      {/* Transcript Table */}
      <Box sx={{ width: "100%", maxWidth: "1400px", mb: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#FFC600", mb: 2 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Loading transcript records...</Typography>
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
              No final transcript records available yet
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mt: 0.5 }}>
              Final course examination scores will be posted after official review and approval.
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
                  <TableCell sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Subject Details
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Credits
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Coursework
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Final Exam
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Total Score
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: "15px", color: "#000", py: 2 }}>
                    Letter Grade
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Approval
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((row, index) => {
                  const letterStyles = getLetterColor(row.letterGrade);
                  const isPassed = row.status?.toLowerCase().includes("pass") || (row.percentage ?? 0) >= 60;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: "background-color 0.2s ease",
                      }}
                    >
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

                      <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.8)", py: 2 }}>
                        {row.creditHours ?? 3}
                      </TableCell>

                      <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                        {row.courseworkScore ?? row.quarterGrade}
                      </TableCell>

                      <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.9)", py: 2 }}>
                        {row.finalExamScore !== undefined ? row.finalExamScore : "—"}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "white" }}>
                          {row.totalScore ?? row.yourGrade} / {row.maxScore ?? 100}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                          ({row.percentage ?? 0}%)
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip
                          label={row.letterGrade || "—"}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "13px",
                            bgcolor: letterStyles.bg,
                            color: letterStyles.text,
                            border: `1px solid ${letterStyles.border}`,
                            minWidth: "42px",
                          }}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        <Chip
                          label={isPassed ? "Pass" : "Fail"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: isPassed ? "rgba(76, 175, 80, 0.12)" : "rgba(244, 67, 54, 0.12)",
                            color: isPassed ? "#81c784" : "#e57373",
                            border: `1px solid ${isPassed ? "rgba(76, 175, 80, 0.25)" : "rgba(244, 67, 54, 0.25)"}`,
                          }}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2 }}>
                        {row.isApproved ? (
                          <Tooltip title="Formally Approved by Vice Dean">
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: 16, color: "#81c784 !important" }} />}
                              label="Approved"
                              size="small"
                              sx={{
                                color: "#81c784",
                                bgcolor: "rgba(76, 175, 80, 0.1)",
                                borderColor: "rgba(76, 175, 80, 0.2)",
                              }}
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Provisional Result - Awaiting Formal Approval">
                            <Chip
                              icon={<PendingActionsIcon sx={{ fontSize: 16, color: "#ffa726 !important" }} />}
                              label="Provisional"
                              size="small"
                              sx={{
                                color: "#ffa726",
                                bgcolor: "rgba(255, 167, 38, 0.1)",
                                borderColor: "rgba(255, 167, 38, 0.2)",
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
        )}
      </Box>
    </Box>
  );
}
