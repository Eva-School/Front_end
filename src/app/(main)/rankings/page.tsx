"use client";

import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, useTheme, alpha,
  Avatar, Chip, CircularProgress, Select, MenuItem,
  FormControl, InputLabel, TextField, InputAdornment,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon   from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon       from "@mui/icons-material/Remove";
import SearchIcon       from "@mui/icons-material/Search";
import SchoolIcon       from "@mui/icons-material/School";
import { API_BASE_URL, secureFetch } from "@/config/api.config";
import { AcademicYearsAPI, AcademicYearOption } from "@/data/academic-years.api";

interface StudentRanking {
  rank: number;
  studentId: string;
  name: string;
  className: string;
  average: number;
  totalGrades: number;
  trend: "up" | "down" | "stable";
  badge?: "gold" | "silver" | "bronze";
}

const BADGE_CONFIG = {
  gold:   { color: "#FFD700", bg: "#fffde7", label: "🥇 1st Place" },
  silver: { color: "#C0C0C0", bg: "#f5f5f5", label: "🥈 2nd Place" },
  bronze: { color: "#CD7F32", bg: "#fff3e0", label: "🥉 3rd Place" },
};

const TREND_ICON = {
  up:     <TrendingUpIcon   sx={{ fontSize: 16, color: "#4CAF50" }} />,
  down:   <TrendingDownIcon sx={{ fontSize: 16, color: "#F44336" }} />,
  stable: <RemoveIcon       sx={{ fontSize: 16, color: "#9E9E9E" }} />,
};

// ─── Podium (top-3 visual) ────────────────────────────────────────────────────
function Podium({ top3 }: { top3: StudentRanking[] }) {
  const theme = useTheme();
  const order = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd
  const heights = [120, 160, 100];
  const medals  = ["🥈", "🥇", "🥉"];
  const colors  = ["#C0C0C0", "#FFD700", "#CD7F32"];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 2,
        py: 4,
        mb: 4,
      }}
    >
      {order.map((student, i) => (
        <Box key={student.studentId} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          {/* Avatar */}
          <Typography sx={{ fontSize: "1.6rem" }}>{medals[i]}</Typography>
          <Avatar
            sx={{
              width: i === 1 ? 64 : 52,
              height: i === 1 ? 64 : 52,
              bgcolor: alpha(colors[i], 0.2),
              color: colors[i],
              fontWeight: 900,
              fontSize: i === 1 ? "1.5rem" : "1.2rem",
              border: `3px solid ${colors[i]}`,
              boxShadow: `0 4px 20px ${alpha(colors[i], 0.4)}`,
            }}
          >
            {student.name.charAt(0)}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              textAlign: "center",
              maxWidth: 90,
              fontSize: i === 1 ? "0.8rem" : "0.72rem",
            }}
          >
            {student.name.split(" ")[0]}
          </Typography>
          <Typography variant="caption" sx={{ color: colors[i], fontWeight: 800, fontSize: "0.85rem" }}>
            {student.average}%
          </Typography>

          {/* Podium block */}
          <Box
            sx={{
              width: i === 1 ? 100 : 82,
              height: heights[i],
              bgcolor: alpha(colors[i], 0.15),
              borderRadius: "10px 10px 0 0",
              border: `2px solid ${alpha(colors[i], 0.4)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontWeight: 900, color: colors[i], fontSize: "1.4rem" }}>
              {student.rank}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Rank Row ─────────────────────────────────────────────────────────────────
function RankRow({ student, index }: { student: StudentRanking; index: number }) {
  const theme   = useTheme();
  const primary = theme.palette.primary.main;
  const badge   = student.badge ? BADGE_CONFIG[student.badge] : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2.5,
        bgcolor: badge
          ? alpha(badge.color, 0.04)
          : index % 2 === 0
          ? alpha(theme.palette.background.paper, 0.6)
          : "transparent",
        border: `1px solid ${badge ? alpha(badge.color, 0.2) : alpha(theme.palette.divider, 0.3)}`,
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: badge ? alpha(badge.color, 0.08) : alpha(primary, 0.04),
          transform: "translateX(4px)",
          boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`,
        },
      }}
    >
      {/* Rank number */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: badge ? alpha(badge.color, 0.15) : alpha(theme.palette.text.secondary, 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 900,
            color: badge ? badge.color : theme.palette.text.secondary,
            fontSize: "0.9rem",
          }}
        >
          {student.rank}
        </Typography>
      </Box>

      {/* Avatar */}
      <Avatar
        sx={{
          width: 38,
          height: 38,
          bgcolor: alpha(primary, 0.12),
          color: primary,
          fontWeight: 700,
          fontSize: "0.85rem",
          flexShrink: 0,
        }}
      >
        {student.name.charAt(0)}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: badge ? 800 : 600,
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {student.name}
          </Typography>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: alpha(badge.color, 0.12),
                color: badge.color,
                fontWeight: 700,
                fontSize: "0.62rem",
                height: 18,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon sx={{ fontSize: 11, color: theme.palette.text.secondary }} />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {student.className}
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.5) }}>
            · {student.totalGrades} grades
          </Typography>
        </Box>
      </Box>

      {/* Trend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
        {TREND_ICON[student.trend]}
      </Box>

      {/* Average */}
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            color: badge ? badge.color : student.average >= 90 ? "#4CAF50" : student.average >= 70 ? primary : theme.palette.text.primary,
          }}
        >
          {student.average}%
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.65rem" }}>
          avg grade
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RankingsPage() {
  const theme   = useTheme();
  const primary = theme.palette.primary.main;

  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [year,     setYear]     = useState("");
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    AcademicYearsAPI.list()
      .then((years) => {
        setAcademicYears(years);
        setYear(years.find((item) => item.isActive)?.yearName ?? years[0]?.yearName ?? "");
        if (years.length === 0) setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!year) return;
    secureFetch<{ rankings?: StudentRanking[] }>(`${API_BASE_URL}/rankings?year=${encodeURIComponent(year)}&limit=20`)
      .then((d) => setRankings(d.rankings ?? []))
      .catch(() => setRankings([]))
      .finally(() => setLoading(false));
  }, [year]);

  const filtered = rankings.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.className.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.filter((r) => r.rank <= 3);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: alpha(primary, 0.12), color: primary,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              Student Rankings
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Top performers across all classes
            </Typography>
          </Box>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={year}
            label="Year"
            onChange={(e) => {
              setLoading(true);
              setYear(e.target.value);
            }}
          >
            {academicYears.map((item) => (
              <MenuItem key={item.yearName} value={item.yearName}>{item.yearName.replace("-", " – ")}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress sx={{ color: primary }} />
        </Box>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                mb: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${alpha(primary, 0.07)} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              <Box sx={{ textAlign: "center", pt: 3 }}>
                <Typography variant="overline" sx={{ color: primary, fontWeight: 700, letterSpacing: 2 }}>
                  TOP PERFORMERS
                </Typography>
              </Box>
              <Podium top3={top3} />
            </Box>
          )}

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search student or class…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                "&:hover fieldset": { borderColor: primary },
                "&.Mui-focused fieldset": { borderColor: primary },
              },
            }}
          />

          {/* Stats bar */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: filtered.length, color: primary },
              { label: "90%+", value: filtered.filter((r) => r.average >= 90).length, color: "#4CAF50" },
              { label: "Trending Up", value: filtered.filter((r) => r.trend === "up").length, color: "#2196F3" },
            ].map((s, i) => (
              <Chip
                key={i}
                label={`${s.label}: ${s.value}`}
                size="small"
                sx={{
                  bgcolor: alpha(s.color, 0.1),
                  color: s.color,
                  fontWeight: 700,
                  border: `1px solid ${alpha(s.color, 0.25)}`,
                }}
              />
            ))}
          </Box>

          {/* List */}
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {filtered.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <SearchIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No students found
                </Typography>
              </Box>
            ) : (
              filtered.map((student, i) => (
                <RankRow key={student.studentId} student={student} index={i} />
              ))
            )}
          </Box>
        </>
      )}
    </Container>
  );
}
