"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import { useLanguage } from "@/context/LanguageContext";
import { ClassesAPI } from "@/data/classes.api";
import type {
  ClassCohortSummary,
  ClassDetails,
  ClassItem,
  CohortStage,
  CreateClassPayload,
  UpdateClassPayload,
} from "@/types/class-management.types";
import CohortOverviewCards from "@/components/classes/CohortOverviewCards";
import CohortTabsHeader from "@/components/classes/CohortTabsHeader";
import ClassCard from "@/components/classes/ClassCard";
import ClassSettingsModal from "@/components/classes/ClassSettingsModal";
import ClassDeleteDialog from "@/components/classes/ClassDeleteDialog";
import ClassDetailsView from "@/components/classes/ClassDetailsView";

const COHORT_COLORS: Record<CohortStage, string> = {
  junior: "#F59E0B",
  wheeler: "#06B6D4",
  senior: "#8B5CF6",
};

export default function ClassManagementPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Cohort & Class selection from URL query params
  const cohortParam = searchParams.get("cohort") as CohortStage | null;
  const classIdParam = searchParams.get("classId");
  const selectedClassId = classIdParam ? parseInt(classIdParam, 10) : null;

  // Data state
  const [cohortSummaries, setCohortSummaries] = useState<ClassCohortSummary[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);

  // Loading states
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Modal states
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);

  // Notification toast state
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  // Load cohorts overview summary
  const loadCohortsSummary = useCallback(async () => {
    setIsLoadingCohorts(true);
    try {
      const data = await ClassesAPI.getCohortsSummary();
      setCohortSummaries(data);
    } catch (err) {
      console.error("Failed to load cohorts summary:", err);
    } finally {
      setIsLoadingCohorts(false);
    }
  }, []);

  useEffect(() => {
    loadCohortsSummary();
  }, [loadCohortsSummary]);

  // Load classes for active cohort
  const loadCohortClasses = useCallback(async (stage: CohortStage) => {
    setIsLoadingClasses(true);
    try {
      const data = await ClassesAPI.getByYear(undefined, stage);
      setClassesList(data);
    } catch (err) {
      console.error("Failed to load cohort classes:", err);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    if (cohortParam) {
      loadCohortClasses(cohortParam);
    } else {
      setClassesList([]);
    }
  }, [cohortParam, loadCohortClasses]);

  // Load single class details
  const loadClassDetails = useCallback(async (cid: number) => {
    setIsLoadingDetails(true);
    try {
      const data = await ClassesAPI.getDetails(cid);
      setClassDetails(data);
    } catch (err) {
      console.error("Failed to load class details:", err);
      setClassDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetails(selectedClassId);
    } else {
      setClassDetails(null);
    }
  }, [selectedClassId, loadClassDetails]);

  // Navigation handlers
  const handleSelectCohort = (stage: CohortStage) => {
    const params = new URLSearchParams();
    params.set("cohort", stage);
    router.push(`/classes?${params.toString()}`);
  };

  const handleBackToCohorts = () => {
    router.push("/classes");
  };

  const handleOpenClassDetails = (cid: number) => {
    const params = new URLSearchParams();
    if (cohortParam) params.set("cohort", cohortParam);
    params.set("classId", cid.toString());
    router.push(`/classes?${params.toString()}`);
  };

  const handleBackToCohortClasses = () => {
    const params = new URLSearchParams();
    if (cohortParam) params.set("cohort", cohortParam);
    router.push(`/classes?${params.toString()}`);
  };

  // Class CRUD Handlers
  const handleCreateClass = async (payload: CreateClassPayload) => {
    try {
      await ClassesAPI.create(payload);
      setToast({ message: t("classes.classCreatedSuccess"), severity: "success" });
      if (cohortParam) await loadCohortClasses(cohortParam);
      await loadCohortsSummary();
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : t("common.validations.serverError"),
        severity: "error",
      });
      throw err;
    }
  };

  const handleUpdateClass = async (cid: number, payload: UpdateClassPayload) => {
    try {
      await ClassesAPI.update(cid, payload);
      setToast({ message: t("classes.saveSuccess"), severity: "success" });
      if (cohortParam) await loadCohortClasses(cohortParam);
      if (selectedClassId === cid) await loadClassDetails(cid);
      await loadCohortsSummary();
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : t("common.validations.serverError"),
        severity: "error",
      });
      throw err;
    }
  };

  const handleDeleteClass = async (cid: number) => {
    try {
      await ClassesAPI.delete(cid);
      setToast({ message: t("classes.deleteSuccess"), severity: "success" });
      if (cohortParam) await loadCohortClasses(cohortParam);
      await loadCohortsSummary();
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : t("common.validations.serverError"),
        severity: "error",
      });
      throw err;
    }
  };

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classesList.filter((c) => {
      const matchesSearch = c.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        departmentFilter === "ALL" ||
        (c.departmentName && c.departmentName.toUpperCase() === departmentFilter.toUpperCase());
      return matchesSearch && matchesDept;
    });
  }, [classesList, searchQuery, departmentFilter]);

  // Active cohort colors & meta
  const activeColor = cohortParam ? COHORT_COLORS[cohortParam] : theme.palette.primary.main;
  const activeSummary = cohortParam
    ? cohortSummaries.find((s) => s.stage === cohortParam)
    : null;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        py: { xs: 3, md: 5 },
        overflow: "hidden",
      }}
    >
      {/* Decorative Gradient Background Blobs */}
      <Box
        component={motion.div}
        animate={{ scale: [1, 1.06, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          top: "-8%",
          right: "-5%",
          width: "50%",
          height: "50%",
          background: `radial-gradient(circle, ${alpha(activeColor, 0.12)}, transparent 65%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <Box
        component={motion.div}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        sx={{
          position: "absolute",
          bottom: "2%",
          left: "-5%",
          width: "45%",
          height: "45%",
          background: `radial-gradient(circle, ${alpha("#06B6D4", 0.08)}, transparent 65%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Main Header (When on Cohorts Landing) */}
        {!cohortParam && (
          <Box mb={5}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(
                    theme.palette.primary.main,
                    0.65
                  )})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <SchoolIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={900} letterSpacing="-0.02em">
                  {t("classes.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  {t("classes.subtitle")}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: COHORTS LANDING OVERVIEW                                          */}
        {/* ========================================================================= */}
        {!cohortParam && (
          <Box>
            {isLoadingCohorts ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <CohortOverviewCards
                cohorts={cohortSummaries}
                onSelectCohort={handleSelectCohort}
              />
            )}
          </Box>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SELECTED COHORT CLASSES LIST                                      */}
        {/* ========================================================================= */}
        {cohortParam && !selectedClassId && (
          <Box>
            <CohortTabsHeader
              selectedCohort={cohortParam}
              onSelectCohort={handleSelectCohort}
              onBackToCohorts={handleBackToCohorts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              onAddClassClick={() => setIsAddClassOpen(true)}
            />

            {isLoadingClasses ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={36} />
              </Box>
            ) : filteredClasses.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  px: 3,
                  borderRadius: "24px",
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                }}
              >
                <Typography variant="h6" fontWeight={800} color="text.secondary" mb={1}>
                  {t("classes.noClassesFound")}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {t("classes.noClassesSubtitle")}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsAddClassOpen(true)}
                  sx={{ borderRadius: "12px", fontWeight: 700, px: 3 }}
                >
                  {t("classes.createFirstClass")}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                <AnimatePresence>
                  {filteredClasses.map((item) => (
                    <Box key={item.classId}>
                      <ClassCard
                        item={item}
                        cohortColor={activeColor}
                        onOpenDetails={handleOpenClassDetails}
                        onEditSettings={(cls) => setEditingClass(cls)}
                        onDeleteClass={(cls) => setDeletingClass(cls)}
                      />
                    </Box>
                  ))}
                </AnimatePresence>
              </Box>
            )}
          </Box>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SINGLE CLASS DETAILS & ENROLLED STUDENTS                          */}
        {/* ========================================================================= */}
        {cohortParam && selectedClassId && (
          <Box>
            {isLoadingDetails || !classDetails ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={36} />
              </Box>
            ) : (
              <ClassDetailsView
                details={classDetails}
                cohort={cohortParam}
                cohortColor={activeColor}
                onBackToCohortClasses={handleBackToCohortClasses}
                onRefreshDetails={() => loadClassDetails(selectedClassId)}
                onUpdateClassSettings={handleUpdateClass}
              />
            )}
          </Box>
        )}

        {/* Modal: Create Class */}
        <ClassSettingsModal
          open={isAddClassOpen}
          onClose={() => setIsAddClassOpen(false)}
          onSubmitCreate={handleCreateClass}
          cohort={cohortParam || "junior"}
          academicYearName={activeSummary?.academicYearName || "2026-2027"}
        />

        {/* Modal: Edit Class Settings */}
        <ClassSettingsModal
          open={Boolean(editingClass)}
          onClose={() => setEditingClass(null)}
          editingClass={editingClass}
          onSubmitUpdate={handleUpdateClass}
          cohort={cohortParam || "junior"}
          academicYearName={editingClass?.academicYearName || activeSummary?.academicYearName}
        />

        {/* Modal: Delete Class Confirmation */}
        <ClassDeleteDialog
          open={Boolean(deletingClass)}
          onClose={() => setDeletingClass(null)}
          classItem={deletingClass}
          onConfirmDelete={handleDeleteClass}
        />

        {/* Global Toast Message */}
        <Snackbar
          open={Boolean(toast)}
          autoHideDuration={4000}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          {toast ? (
            <Alert
              onClose={() => setToast(null)}
              severity={toast.severity}
              variant="filled"
              sx={{ borderRadius: "14px", fontWeight: 700 }}
            >
              {toast.message}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Container>
    </Box>
  );
}
