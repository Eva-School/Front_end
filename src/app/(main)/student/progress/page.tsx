"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useStudentYear } from "@/context/StudentYearContext";
import { API_BASE_URL, secureFetch } from "@/config/api.config";

interface SubjectProgress {
  subject: string;
  color: string;
  scores: {
    period: string;
    score: number;
    max: number;
  }[];
}

const SUBJECT_COLORS = [
  "#FFC600", "#4CAF50", "#2196F3", "#E91E63",
  "#9C27B0", "#FF5722", "#00BCD4", "#FF9800",
];

interface StudentProgressApiItem {
  subject: string;
  quarterAverage: number;
  finalExam: number;
}

// ─── Sparkline / Mini Line Chart ─────────────────────────────────────────────
function SubjectSparkline({ data, color }: { data: { period: string; score: number }[]; color: string }) {
  const W = 180;
  const H = 60;
  const padX = 8;
  const padY = 10;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;
  const minVal = Math.min(...data.map((d) => d.score)) - 5;
  const maxVal = Math.max(...data.map((d) => d.score)) + 5;

  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((d.score - minVal) / (maxVal - minVal)) * chartH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - padY} L ${pts[0].x} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60 }}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkGrad-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── Full Comparison Chart ─────────────────────────────────────────────────────
function ComparisonChart({ subjects, selected }: { subjects: SubjectProgress[]; selected: string[] }) {
  const theme = useTheme();
  const filtered = subjects.filter((s) => selected.includes(s.subject));
  if (filtered.length === 0) return null;

  const periods = filtered[0].scores.map((s) => s.period);
  const W = 520;
  const H = 180;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const minVal = 50;
  const maxVal = 100;

  const getPoints = (scores: { period: string; score: number }[]) =>
    scores.map((s, i) => ({
      x: padL + (i / (scores.length - 1)) * chartW,
      y: padT + chartH - ((s.score - minVal) / (maxVal - minVal)) * chartH,
      ...s,
    }));

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          {filtered.map((s) => (
            <linearGradient key={s.subject} id={`cg-${s.subject.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const yPos = padT + t * chartH;
          const yVal = Math.round(maxVal - t * (maxVal - minVal));
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={yPos}
                x2={W - padR}
                y2={yPos}
                stroke={theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
                strokeWidth="1"
              />
              <text
                x={padL - 4}
                y={yPos + 4}
                textAnchor="end"
                fontSize="8"
                fill={theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}
              >
                {yVal}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        {filtered.map((s) => {
          const pts = getPoints(s.scores);
          const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`;
          return (
            <g key={s.subject}>
              <path d={areaPath} fill={`url(#cg-${s.subject.replace(/\s/g, "")})`} />
              <path d={linePath} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill={s.color} />
                  <circle cx={p.x} cy={p.y} r="8" fill={s.color} fillOpacity="0.15" />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={s.color}
                  >
                    {p.score}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Period labels */}
        {periods.map((period, i) => {
          const x = padL + (i / (periods.length - 1)) * chartW;
          return (
            <text
              key={i}
              x={x}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
            >
              {period}
            </text>
          );
        })}
      </svg>
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GradeProgressPage() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { displayYear: year } = useStudentYear();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      secureFetch<StudentProgressApiItem[]>(`${API_BASE_URL}/student/grades/progress?year=${encodeURIComponent(year)}`)
        .then((data) => {
          if (cancelled) return;
          const parsed: SubjectProgress[] = (Array.isArray(data) ? data : []).map((item, index) => ({
            subject: item.subject,
            color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
            scores: [
              { period: "Quarter", score: Number(item.quarterAverage), max: 100 },
              { period: "Final", score: Number(item.finalExam), max: 100 },
            ],
          }));
          setSubjects(parsed);
          setSelected(parsed.slice(0, 3).map((s) => s.subject));
        })
        .catch((requestError: unknown) => {
          if (cancelled) return;
          setSubjects([]);
          setSelected([]);
          setError(requestError instanceof Error ? requestError.message : "Progress data could not be loaded.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [year]);

  const toggleSubject = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const overallAvg = subjects.length
    ? Math.round(
        subjects.flatMap((s) => s.scores.map((sc) => sc.score)).reduce((a, b) => a + b, 0) /
          subjects.flatMap((s) => s.scores).length
      )
    : 0;

  const bestSubject = subjects.length
    ? subjects.reduce((best, s) => {
        const avg = s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length;
        const bestAvg = best.scores.reduce((a, b) => a + b.score, 0) / best.scores.length;
        return avg > bestAvg ? s : best;
      })
    : null;

  const trend =
    subjects.length && subjects[0].scores.length >= 2
      ? subjects[0].scores[subjects[0].scores.length - 1].score -
        subjects[0].scores[0].score
      : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Button
          component={Link}
          href="/student"
          startIcon={<ArrowBackIcon />}
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { color: primary },
          }}
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
            Grade Progress
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Track your performance over time
          </Typography>
        </Box>
        <Chip
          label={year ? year.charAt(0).toUpperCase() + year.slice(1) : "Loading..."}
          sx={{ bgcolor: alpha(primary, 0.12), color: primary, fontWeight: 700 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : error ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Progress is unavailable</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{error}</Typography>
        </Box>
      ) : subjects.length === 0 ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No progress data yet</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Grades for this academic year have not been recorded yet.
          </Typography>
        </Box>
      ) : (
        <>
          {/* KPI Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mb: 4,
            }}
          >
            {[
              {
                icon: <TrendingUpIcon />,
                value: `${overallAvg}%`,
                label: "Overall Average",
                color: primary,
              },
              {
                icon: <EmojiEventsIcon />,
                value: bestSubject?.subject ?? "—",
                label: "Best Subject",
                color: "#4CAF50",
              },
              {
                icon: trend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
                value: `${trend >= 0 ? "+" : ""}${trend}`,
                label: "Progress vs Start",
                color: trend >= 0 ? "#4CAF50" : "#F44336",
              },
            ].map((k, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 3,
                  p: 2.5,
                  border: `1px solid ${alpha(k.color, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: `0 10px 28px ${alpha(k.color, 0.15)}` },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: alpha(k.color, 0.1),
                    color: k.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {k.icon}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: k.color }}>
                    {k.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    {k.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Comparison Chart */}
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              p: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Subject Comparison
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {subjects.map((s) => (
                  <Chip
                    key={s.subject}
                    label={s.subject}
                    size="small"
                    onClick={() => toggleSubject(s.subject)}
                    sx={{
                      bgcolor: selected.includes(s.subject) ? alpha(s.color, 0.15) : "transparent",
                      color: selected.includes(s.subject) ? s.color : theme.palette.text.secondary,
                      border: `1px solid ${selected.includes(s.subject) ? alpha(s.color, 0.4) : alpha(theme.palette.divider, 0.6)}`,
                      fontWeight: selected.includes(s.subject) ? 700 : 400,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: s.color, color: s.color },
                    }}
                  />
                ))}
              </Box>
            </Box>
            <ComparisonChart subjects={subjects} selected={selected} />
          </Box>

          {/* Subject Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            {subjects.map((s) => {
              const avg = Math.round(s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length);
              const latest = s.scores[s.scores.length - 1];
              const first = s.scores[0];
              const delta = latest.score - first.score;

              return (
                <Box
                  key={s.subject}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 3,
                    p: 2.5,
                    border: `1px solid ${alpha(s.color, 0.18)}`,
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: `0 10px 28px ${alpha(s.color, 0.15)}` },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: s.color }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {s.subject}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${avg}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(s.color, 0.1),
                        color: s.color,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    />
                  </Box>
                  <SubjectSparkline data={s.scores} color={s.color} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    {s.scores.map((sc) => (
                      <Box key={sc.period} sx={{ textAlign: "center" }}>
                        <Typography variant="caption" sx={{ color: s.color, fontWeight: 700, fontSize: "0.7rem" }}>
                          {sc.score}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", color: theme.palette.text.secondary, fontSize: "0.65rem" }}>
                          {sc.period}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: delta >= 0 ? "#4CAF50" : "#F44336",
                        fontSize: "0.7rem",
                      }}
                    >
                      {delta >= 0 ? `▲ +${delta}` : `▼ ${delta}`} from Q1
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Container>
  );
}
