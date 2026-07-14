"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import { API_BASE_URL, secureFetch } from "@/config/api.config";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubjectStat {
  subject: string;
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
  color: string;
}

interface ClassRanking {
  rank: number;
  className: string;
  average: number;
  students: number;
  trend: "up" | "down" | "stable";
}

interface AnalyticsData {
  totalStudents: number;
  averageGrade: number;
  passRate: number;
  topPerformers: number;
  subjectStats: SubjectStat[];
  classRankings: ClassRanking[];
  gradeDistribution: { label: string; count: number; color: string }[];
  monthlyTrend: { month: string; average: number }[];
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.value));

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", height: 160, px: 1 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: d.color, fontSize: "0.65rem" }}>
            {d.value}%
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: `${(d.value / max) * 140}px`,
              borderRadius: "4px 4px 0 0",
              bgcolor: d.color,
              opacity: 0.85,
              transition: "all 0.3s ease",
              "&:hover": { opacity: 1, transform: "scaleY(1.03)", transformOrigin: "bottom" },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.6rem",
              textAlign: "center",
              lineHeight: 1.2,
              maxWidth: 50,
            }}
          >
            {d.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data }: { data: { month: string; average: number }[] }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const W = 400;
  const H = 120;
  const padding = { top: 16, right: 16, bottom: 28, left: 32 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  // A newly created academic year can have no recorded trend yet. Do not
  // construct SVG paths from missing points in that valid empty state.
  const validData = data.filter(
    (item) => typeof item.month === "string" && Number.isFinite(item.average),
  );

  if (validData.length === 0) {
    return (
      <Box
        sx={{
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="body2">No grade trend data is available yet.</Typography>
      </Box>
    );
  }

  const min = Math.min(...validData.map((d) => d.average)) - 5;
  const max = Math.max(...validData.map((d) => d.average)) + 5;

  const points = validData.map((d, i) => ({
    x:
      validData.length === 1
        ? padding.left + chartW / 2
        : padding.left + (i / (validData.length - 1)) * chartW,
    y: padding.top + chartH - ((d.average - min) / (max - min)) * chartH,
    ...d,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD =
    `${pathD} L ${points[points.length - 1].x} ${H - padding.bottom} L ${points[0].x} ${H - padding.bottom} Z`;

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primary} stopOpacity="0.25" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + t * chartH}
            x2={W - padding.right}
            y2={padding.top + t * chartH}
            stroke={theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke={primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={primary} />
            <circle cx={p.x} cy={p.y} r="7" fill={primary} fillOpacity="0.15" />
          </g>
        ))}

        {/* Month labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill={theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
            fontWeight="600"
          >
            {p.month}
          </text>
        ))}

        {/* Y-axis labels */}
        {[min, (min + max) / 2, max].map((v, i) => (
          <text
            key={i}
            x={padding.left - 4}
            y={padding.top + chartH - ((v - min) / (max - min)) * chartH + 4}
            textAnchor="end"
            fontSize="8"
            fill={theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)"}
          >
            {Math.round(v)}
          </text>
        ))}
      </svg>
    </Box>
  );
}

// ─── Donut-style Grade Distribution ──────────────────────────────────────────
function GradeDistributionChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ width: 80, color: theme.palette.text.secondary, fontSize: "0.72rem" }}>
            {d.label}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(d.count / total) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(d.color, 0.12),
                "& .MuiLinearProgress-bar": { bgcolor: d.color, borderRadius: 4 },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ width: 28, textAlign: "right", fontWeight: 700, color: theme.palette.text.primary, fontSize: "0.72rem" }}
          >
            {d.count}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function KPICard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 3,
        p: 2.5,
        border: `1px solid ${alpha(color, 0.18)}`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 12px 32px ${alpha(color, 0.18)}` },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: color,
          borderRadius: "3px 3px 0 0",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color, mb: 0.25 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            {label}
          </Typography>
          {sub && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Analytics Page ──────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [year, setYear] = useState("2024-2025");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    secureFetch<AnalyticsData>(`${API_BASE_URL}/analytics/overview?year=${encodeURIComponent(year)}`)
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((requestError: unknown) => {
        setData(null);
        setError(requestError instanceof Error ? requestError.message : "Analytics data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, [year]);

  const subjectBarData = (data?.subjectStats ?? []).map((s) => ({
    label: s.subject.slice(0, 4),
    value: s.average,
    color: s.color,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(primary, 0.12),
              color: primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChartIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Academic performance overview
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label="● Live Data"
            size="small"
            sx={{ bgcolor: alpha("#4CAF50", 0.12), color: "#4CAF50", fontWeight: 700 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={year}
              label="Academic Year"
              onChange={(e) => {
                setLoading(true);
                setYear(e.target.value);
              }}
            >
              <MenuItem value="2024-2025">2024 – 2025</MenuItem>
              <MenuItem value="2025-2026">2025 – 2026</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : !data ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Analytics are unavailable
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {error ?? "No analytics data is available for this academic year."}
          </Typography>
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2.5,
              mb: 4,
            }}
          >
            <KPICard
              icon={<PeopleIcon />}
              value={String(data!.totalStudents)}
              label="Total Students"
              sub="Enrolled this year"
              color="#2196F3"
            />
            <KPICard
              icon={<TrendingUpIcon />}
              value={`${data!.averageGrade}%`}
              label="School Average"
              sub="All subjects combined"
              color={primary}
            />
            <KPICard
              icon={<AssignmentIcon />}
              value={`${data!.passRate}%`}
              label="Pass Rate"
              sub="Grade 60 and above"
              color="#4CAF50"
            />
            <KPICard
              icon={<EmojiEventsIcon />}
              value={String(data!.topPerformers)}
              label="Top Performers"
              sub="Grade 90 and above"
              color="#E91E63"
            />
          </Box>

          {/* Charts Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Subject Averages Bar */}
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 3,
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                Subject Averages
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 2 }}>
                Average grade per subject
              </Typography>
              <BarChart data={subjectBarData} />
            </Box>

            {/* Monthly Trend Line */}
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 3,
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                Grade Trend
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 2 }}>
                Monthly average progression
              </Typography>
              <LineChart data={data!.monthlyTrend} />
            </Box>
          </Box>

          {/* Bottom Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" },
              gap: 3,
              mb: 4,
            }}
          >
            {/* Grade Distribution */}
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 3,
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                Grade Distribution
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 2.5 }}>
                Students by grade range
              </Typography>
              <GradeDistributionChart data={data!.gradeDistribution} />
            </Box>

            {/* Subject Stats Table */}
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 3,
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                Subject Performance
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: "block", mb: 2 }}>
                Detailed breakdown per subject
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Subject", "Avg", "High", "Pass %"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            color: theme.palette.text.secondary,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            py: 1,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data!.subjectStats.map((s, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: alpha(s.color, 0.04) } }}>
                        <TableCell sx={{ py: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                              {s.subject}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                          <Chip
                            label={`${s.average}%`}
                            size="small"
                            sx={{
                              bgcolor: alpha(s.color, 0.1),
                              color: s.color,
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              height: 20,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                          <Typography variant="caption" sx={{ color: "#4CAF50", fontWeight: 700 }}>
                            {s.highest}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <LinearProgress
                              variant="determinate"
                              value={s.passRate}
                              sx={{
                                width: 44,
                                height: 5,
                                borderRadius: 3,
                                bgcolor: alpha(s.color, 0.12),
                                "& .MuiLinearProgress-bar": { bgcolor: s.color, borderRadius: 3 },
                              }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: "0.68rem" }}>
                              {s.passRate}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Class Rankings */}
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              p: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <SchoolIcon sx={{ color: primary, fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Class Rankings
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {data!.classRankings.map((c) => {
                const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#9E9E9E", "#9E9E9E"];
                const rankColor = rankColors[c.rank - 1] || "#9E9E9E";
                return (
                  <Box
                    key={c.rank}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: alpha(rankColor, 0.05),
                      border: `1px solid ${alpha(rankColor, 0.15)}`,
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: alpha(rankColor, 0.09) },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(rankColor, 0.2),
                        color: rankColor,
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      {c.rank}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {c.className}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {c.students} students
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: rankColor }}>
                        {c.average}%
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: c.trend === "up" ? "#4CAF50" : c.trend === "down" ? "#F44336" : theme.palette.text.secondary,
                          fontWeight: 600,
                        }}
                      >
                        {c.trend === "up" ? "▲ Rising" : c.trend === "down" ? "▼ Falling" : "● Stable"}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={c.average}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: alpha(rankColor, 0.12),
                          "& .MuiLinearProgress-bar": { bgcolor: rankColor, borderRadius: 4 },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}
