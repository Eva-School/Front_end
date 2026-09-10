"use client";

import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClassIcon from "@mui/icons-material/Class";
import GroupIcon from "@mui/icons-material/Group";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { useLanguage } from "@/context/LanguageContext";
import type { ClassCohortSummary, CohortStage } from "@/types/class-management.types";

interface CohortOverviewCardsProps {
  cohorts: ClassCohortSummary[];
  onSelectCohort: (stage: CohortStage) => void;
}

const COHORT_CONFIG: Record<
  CohortStage,
  { emoji: string; color: string; gradient: string }
> = {
  junior: {
    emoji: "🌱",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },
  wheeler: {
    emoji: "⚡",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  },
  senior: {
    emoji: "🎓",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
  },
};

export default function CohortOverviewCards({
  cohorts,
  onSelectCohort,
}: CohortOverviewCardsProps) {
  const theme = useTheme();
  const { t, dir } = useLanguage();

  const stages: CohortStage[] = ["junior", "wheeler", "senior"];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 3.5,
      }}
    >
      {stages.map((stageKey, index) => {
        const summary = cohorts.find((c) => c.stage === stageKey) || {
          stage: stageKey,
          stageName: stageKey.toUpperCase(),
          academicYearId: 0,
          academicYearName: "Current",
          classCount: 0,
          totalStudents: 0,
          totalCapacity: 0,
        };

        const config = COHORT_CONFIG[stageKey];
        const occupancyRate =
          summary.totalCapacity > 0
            ? Math.round((summary.totalStudents / summary.totalCapacity) * 100)
            : 0;

        return (
          <Box key={stageKey}>
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              whileHover={{ y: -7 }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: "24px",
                  backgroundColor: alpha(theme.palette.background.paper, 0.85),
                  backdropFilter: "blur(20px)",
                  border: `1.5px solid ${alpha(config.color, 0.25)}`,
                  boxShadow: `0 12px 36px ${alpha(config.color, 0.12)}`,
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    borderColor: config.color,
                    boxShadow: `0 20px 48px ${alpha(config.color, 0.22)}`,
                  },
                }}
              >
                {/* Top Glowing Header Accent */}
                <Box
                  sx={{
                    height: 6,
                    width: "100%",
                    background: config.gradient,
                  }}
                />

                <CardActionArea
                  onClick={() => onSelectCohort(stageKey)}
                  sx={{ p: { xs: 3, sm: 3.5 } }}
                  aria-label={t(`classes.${stageKey}`)}
                >
                  {/* Top Row: Emoji Icon + Year Chip */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2.5}
                  >
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "18px",
                        background: config.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.8rem",
                        boxShadow: `0 8px 24px ${alpha(config.color, 0.35)}`,
                      }}
                    >
                      {config.emoji}
                    </Box>

                    <Chip
                      label={summary.academicYearName || t("classes.active")}
                      size="small"
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        backgroundColor: alpha(config.color, 0.12),
                        color: config.color,
                        border: `1px solid ${alpha(config.color, 0.3)}`,
                        borderRadius: "10px",
                        px: 0.5,
                      }}
                    />
                  </Stack>

                  {/* Title & Subtitle */}
                  <Box mb={2.5}>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="text.primary"
                      letterSpacing="-0.02em"
                      mb={0.5}
                    >
                      {t(`classes.${stageKey}`)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minHeight: 40, lineHeight: 1.45 }}
                    >
                      {t(`classes.${stageKey}Subtitle`)}
                    </Typography>
                  </Box>

                  {/* Metrics Row */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        backgroundColor: alpha(theme.palette.divider, 0.05),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <ClassIcon sx={{ fontSize: 16, color: config.color }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {t("classes.kpiTotalClasses")}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800}>
                        {summary.classCount}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "14px",
                        backgroundColor: alpha(theme.palette.divider, 0.05),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <GroupIcon sx={{ fontSize: 16, color: config.color }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {t("classes.kpiTotalStudents")}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800}>
                        {summary.totalStudents}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Capacity & Occupancy Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={0.8}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <EventSeatIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {t("classes.kpiOccupancy")}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" fontWeight={700} color={config.color}>
                        {summary.totalStudents} / {summary.totalCapacity} ({occupancyRate}%)
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min(occupancyRate, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(config.color, 0.14),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background: config.gradient,
                        },
                      }}
                    />
                  </Box>

                  {/* Action Link Footer */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    spacing={0.5}
                    sx={{
                      color: config.color,
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      pt: 0.5,
                    }}
                  >
                    <span>{t("classes.viewDetails")}</span>
                    <ArrowForwardIcon
                      sx={{
                        fontSize: 18,
                        transform: dir === "rtl" ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </Stack>
                </CardActionArea>
              </Card>
            </motion.div>
          </Box>
        );
      })}
    </Box>
  );
}
