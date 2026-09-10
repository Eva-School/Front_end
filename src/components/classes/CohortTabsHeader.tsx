"use client";

import React from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLanguage } from "@/context/LanguageContext";
import type { CohortStage } from "@/types/class-management.types";

interface CohortTabsHeaderProps {
  selectedCohort: CohortStage;
  onSelectCohort: (stage: CohortStage) => void;
  onBackToCohorts: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  onAddClassClick: () => void;
}

const COHORT_TABS: { stage: CohortStage; emoji: string; color: string }[] = [
  { stage: "junior", emoji: "🌱", color: "#F59E0B" },
  { stage: "wheeler", emoji: "⚡", color: "#06B6D4" },
  { stage: "senior", emoji: "🎓", color: "#8B5CF6" },
];

export default function CohortTabsHeader({
  selectedCohort,
  onSelectCohort,
  onBackToCohorts,
  searchQuery,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  onAddClassClick,
}: CohortTabsHeaderProps) {
  const theme = useTheme();
  const { t, dir } = useLanguage();

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumb + Add Class Row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Breadcrumbs
          separator={
            <NavigateNextIcon
              fontSize="small"
              sx={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }}
            />
          }
          aria-label="breadcrumb"
        >
          <Button
            onClick={onBackToCohorts}
            startIcon={<ArrowBackIcon fontSize="small" sx={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />}
            sx={{
              p: 0,
              minWidth: "auto",
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 600,
              "&:hover": { color: "primary.main", background: "none" },
            }}
          >
            {t("classes.backToCohorts")}
          </Button>
          <Typography color="text.primary" fontWeight={700}>
            {t(`classes.${selectedCohort}`)}
          </Typography>
        </Breadcrumbs>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddClassClick}
          id="btn-add-new-class"
          sx={{
            borderRadius: "12px",
            px: 2.5,
            py: 1,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          {t("classes.addClass")}
        </Button>
      </Stack>

      {/* Cohort Tabs & Search Controls */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          p: 1.5,
          borderRadius: "20px",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
        }}
      >
        {/* Cohort Switcher Pills */}
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: { xs: 1, sm: 0 } }}>
          {COHORT_TABS.map((tab) => {
            const isSelected = selectedCohort === tab.stage;
            return (
              <Button
                key={tab.stage}
                onClick={() => onSelectCohort(tab.stage)}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  backgroundColor: isSelected
                    ? alpha(tab.color, 0.15)
                    : "transparent",
                  color: isSelected ? tab.color : "text.secondary",
                  border: isSelected
                    ? `1.5px solid ${alpha(tab.color, 0.4)}`
                    : "1.5px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(tab.color, 0.1),
                    color: tab.color,
                  },
                }}
              >
                <Box component="span" sx={{ mr: dir === "rtl" ? 0 : 1, ml: dir === "rtl" ? 1 : 0 }}>
                  {tab.emoji}
                </Box>
                {t(`classes.${tab.stage}`)}
              </Button>
            );
          })}
        </Stack>

        {/* Filter & Search Bar */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Department Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={departmentFilter}
              onChange={(e) => onDepartmentChange(e.target.value)}
              displayEmpty
              id="select-department-filter"
              sx={{
                borderRadius: "12px",
                backgroundColor: alpha(theme.palette.divider, 0.04),
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              <MenuItem value="ALL">{t("classes.allDepartments")}</MenuItem>
              <MenuItem value="OM">OM (Operations)</MenuItem>
              <MenuItem value="SD">SD (Software)</MenuItem>
            </Select>
          </FormControl>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder={t("classes.searchClasses")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="input-search-classes"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 240 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: alpha(theme.palette.divider, 0.04),
              },
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
