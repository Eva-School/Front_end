"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import GroupIcon from "@mui/icons-material/Group";
import { useLanguage } from "@/context/LanguageContext";
import type { ClassItem } from "@/types/class-management.types";

interface ClassCardProps {
  item: ClassItem;
  cohortColor: string;
  onOpenDetails: (classId: number) => void;
  onEditSettings: (item: ClassItem) => void;
  onDeleteClass: (item: ClassItem) => void;
}

export default function ClassCard({
  item,
  cohortColor,
  onOpenDetails,
  onEditSettings,
  onDeleteClass,
}: ClassCardProps) {
  const theme = useTheme();
  const { t, dir } = useLanguage();

  const fillPercent =
    item.capacity > 0
      ? Math.round((item.studentCount / item.capacity) * 100)
      : 0;

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return theme.palette.error.main;
    if (rate >= 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const statusColor = getProgressColor(fillPercent);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px",
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
          p: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: alpha(cohortColor, 0.5),
            boxShadow: `0 16px 36px ${alpha(cohortColor, 0.15)}`,
          },
        }}
      >
        {/* Top Header: Class Name + Department + Action Icons */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary" letterSpacing="-0.01em">
              {item.className}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.8} alignItems="center">
              <Chip
                label={item.departmentName || "General"}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  backgroundColor: alpha(cohortColor, 0.12),
                  color: cohortColor,
                  border: `1px solid ${alpha(cohortColor, 0.3)}`,
                  borderRadius: "8px",
                }}
              />
              <Chip
                label={item.isActive ? t("classes.active") : t("classes.inactive")}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  backgroundColor: item.isActive
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.text.disabled, 0.12),
                  color: item.isActive
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                  borderRadius: "8px",
                }}
              />
            </Stack>
          </Box>

          {/* Edit & Delete Action Buttons */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t("classes.editClass")}>
              <IconButton
                size="small"
                onClick={() => onEditSettings(item)}
                id={`btn-edit-class-${item.classId}`}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.main", backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("classes.deleteClass")}>
              <IconButton
                size="small"
                onClick={() => onDeleteClass(item)}
                id={`btn-delete-class-${item.classId}`}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "error.main", backgroundColor: alpha(theme.palette.error.main, 0.1) },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Capacity & Students Enrolled Stats */}
        <Box sx={{ my: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <GroupIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {t("classes.kpiTotalStudents")}
              </Typography>
            </Stack>
            <Typography variant="subtitle2" fontWeight={800} color={statusColor}>
              {item.studentCount} / {item.capacity} ({fillPercent}%)
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(fillPercent, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(statusColor, 0.14),
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                backgroundColor: statusColor,
              },
            }}
          />

          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <EventSeatIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {item.capacity - item.studentCount > 0
                  ? t("classes.seatsAvailable", { count: item.capacity - item.studentCount })
                  : t("classes.seatsFull")}
              </Typography>
            </Stack>
            {item.academicYearName && (
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {item.academicYearName}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Primary CTA Button */}
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => onOpenDetails(item.classId)}
          id={`btn-view-class-details-${item.classId}`}
          endIcon={
            <ArrowForwardIcon
              sx={{
                fontSize: 16,
                transform: dir === "rtl" ? "rotate(180deg)" : "none",
              }}
            />
          }
          sx={{
            mt: 1,
            borderRadius: "12px",
            py: 1,
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "none",
            borderColor: alpha(theme.palette.divider, 0.3),
            "&:hover": {
              borderColor: cohortColor,
              backgroundColor: alpha(cohortColor, 0.08),
              color: cohortColor,
            },
          }}
        >
          {t("classes.viewDetails")}
        </Button>
      </Card>
    </motion.div>
  );
}
