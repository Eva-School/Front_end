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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CloseIcon from "@mui/icons-material/Close";
import { useStudentYear } from "@/context/StudentYearContext";
import { studentService } from "@/services/student.service";
import type { JadaratGradeRow, JadaratGradesResponse } from "@/types/Student-api/grades";
import { useLanguage } from "@/context/LanguageContext";

const YEAR_LABELS: Record<string, string> = {
  junior: "Junior (Year 1)",
  wheeler: "Wheeler (Year 2)",
  senior: "Senior (Year 3)",
};

export default function JadaratGradesPage() {
  const theme = useTheme();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const { displayYear } = useStudentYear();
  const [data, setData] = useState<JadaratGradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<JadaratGradeRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await studentService.getJadaratGrades(displayYear);
        if (!cancelled) {
          setData(res);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load competencies");
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
  const total = data?.totalCompetencies ?? grades.length;
  const passed = data?.passedCompetencies ?? grades.filter((g) => g.currentStatus?.toLowerCase().includes("pass")).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const getStatusChip = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pass") || s.includes("competent") || s.includes("complete")) {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 16, color: "#81c784 !important" }} />}
          label="Mastered / Pass"
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(76, 175, 80, 0.12)",
            color: "#81c784",
            border: "1px solid rgba(76, 175, 80, 0.25)",
          }}
        />
      );
    }
    if (s.includes("needs") || s.includes("fail") || s.includes("re-attempt")) {
      return (
        <Chip
          icon={<ErrorOutlineIcon sx={{ fontSize: 16, color: "#e57373 !important" }} />}
          label="Re-attempt Required"
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(244, 67, 54, 0.12)",
            color: "#e57373",
            border: "1px solid rgba(244, 67, 54, 0.25)",
          }}
        />
      );
    }
    return (
      <Chip
        label={status || "Under Evaluation"}
        size="small"
        sx={{
          fontWeight: 600,
          bgcolor: "rgba(255, 198, 0, 0.12)",
          color: "#ffd54f",
          border: "1px solid rgba(255, 198, 0, 0.25)",
        }}
      />
    );
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

          {data?.academicYearName && (
            <Chip
              label={`Academic Year: ${data.academicYearName}`}
              size="small"
              sx={{ color: "white", bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          )}
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
              Technical Competencies (Jadarat)
            </Typography>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px", mt: 0.5 }}>
              Vocational competency evaluations, teacher assessments, and attempt history
            </Typography>
          </Box>

          {/* Mastery Stats */}
          <Stack direction="row" spacing={2} flexWrap="wrap">
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
              <Typography sx={{ fontSize: "11px", color: "#1a1a1a", fontWeight: 700 }}>
                MASTERY RATE
              </Typography>
              <Typography sx={{ fontSize: "28px", color: "#000", fontWeight: 900 }}>
                {passRate}%
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                px: 3,
                py: 1.5,
                minWidth: "160px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
                COMPLETED UNITS
              </Typography>
              <Typography sx={{ fontSize: "24px", color: "#81c784", fontWeight: 800, mt: 0.2 }}>
                <bdi dir="ltr">{passed} / {total}</bdi>
              </Typography>
            </Box>
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

      {/* Competencies Table */}
      <Box sx={{ width: "100%", maxWidth: "1400px", mb: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#FFC600", mb: 2 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Loading competency assessments...</Typography>
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
            <WorkspacePremiumIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)", mb: 1 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              No competency records assigned yet
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mt: 0.5 }}>
              Technical competencies for {yearLabel} will appear here once registered by your department.
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
                    Competency Unit
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Current Attempt
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Evaluator
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "14px", color: "#000", py: 2 }}>
                    Attempt History
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((row, index) => {
                  const currentAttemptNum = row.currentAttempt ?? 1;
                  const maxAllowed = row.maxAttempts ?? 3;
                  const hasHistory = row.attemptHistory && row.attemptHistory.length > 0;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>
                        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "white" }}>
                          {row.Jadarat || row.jadarat}
                        </Typography>
                        {row.majorName && (
                          <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                            {row.majorName}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2.5 }}>
                        {getStatusChip(row.currentStatus || row.Your_Attemps)}
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "white" }}>
                          Attempt {currentAttemptNum} of {maxAllowed}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(currentAttemptNum / maxAllowed) * 100}
                          sx={{
                            width: "80px",
                            height: 4,
                            borderRadius: 2,
                            mx: "auto",
                            mt: 0.8,
                            bgcolor: "rgba(255,255,255,0.1)",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: currentAttemptNum >= maxAllowed ? "#e57373" : "#FFC600",
                            },
                          }}
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <PersonIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }} />
                          <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
                            {row.evaluatorName || "Assigned Evaluator"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Button
                          size="small"
                          onClick={() => setSelectedCompetency(row)}
                          startIcon={<HistoryIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            color: "#FFC600",
                            textTransform: "none",
                            fontSize: "12px",
                            bgcolor: "rgba(255, 198, 0, 0.1)",
                            borderRadius: "8px",
                            px: 1.5,
                            "&:hover": { bgcolor: "rgba(255, 198, 0, 0.2)" },
                          }}
                        >
                          {hasHistory ? `${row.attemptHistory!.length} Attempts` : "View Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Attempt History Dialog Modal */}
      <Dialog
        open={!!selectedCompetency}
        onClose={() => setSelectedCompetency(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            bgcolor: "#141a29",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography component="div" variant="h6" sx={{ fontWeight: 800, color: "#FFC600" }}>
              Attempt Evaluation History
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
              {selectedCompetency?.Jadarat}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedCompetency(null)} sx={{ color: "rgba(255,255,255,0.6)" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {selectedCompetency?.attemptHistory && selectedCompetency.attemptHistory.length > 0 ? (
            <Stack spacing={2}>
              {selectedCompetency.attemptHistory.map((attempt) => (
                <Box
                  key={attempt.attemptId}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "white" }}>
                      Attempt #{attempt.attemptNumber}
                    </Typography>
                    {getStatusChip(attempt.result)}
                  </Box>

                  {attempt.evaluatedAt && (
                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                      Evaluation Date: {new Date(attempt.evaluatedAt).toLocaleDateString()}
                    </Typography>
                  )}

                  {attempt.evaluatedByName && (
                    <Typography sx={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
                      Evaluated by: {attempt.evaluatedByName}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                Current Status: {selectedCompetency?.currentStatus || selectedCompetency?.Your_Attemps}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", mt: 1 }}>
                No past evaluation attempts logged for this competency.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setSelectedCompetency(null)}
            sx={{
              color: "#FFC600",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
