"use client";

import React, { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE_URL, secureFetch } from "@/config/api.config";
import type {
  ClassDetails,
  ClassItem,
  ClassStudent,
  CohortStage,
  UpdateClassPayload,
} from "@/types/class-management.types";
import ClassStudentTable from "./ClassStudentTable";
import AddStudentToClassModal from "./AddStudentToClassModal";
import EditClassStudentModal from "./EditClassStudentModal";
import ClassSettingsModal from "./ClassSettingsModal";

interface ClassDetailsViewProps {
  details: ClassDetails;
  cohort: CohortStage;
  cohortColor: string;
  onBackToCohortClasses: () => void;
  onRefreshDetails: () => Promise<void>;
  onUpdateClassSettings: (classId: number, payload: UpdateClassPayload) => Promise<void>;
}

export default function ClassDetailsView({
  details,
  cohort,
  cohortColor,
  onBackToCohortClasses,
  onRefreshDetails,
  onUpdateClassSettings,
}: ClassDetailsViewProps) {
  const theme = useTheme();
  const { t, dir } = useLanguage();

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ClassStudent | null>(null);
  const [isClassSettingsOpen, setIsClassSettingsOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Statistics
  const boysCount = details.students.filter((s) => s.gender.toLowerCase() === "male").length;
  const girlsCount = details.students.filter((s) => s.gender.toLowerCase() === "female").length;
  const fillRate = details.capacity > 0 ? Math.round((details.studentCount / details.capacity) * 100) : 0;
  const availableSeats = Math.max(0, details.capacity - details.studentCount);

  // Handle unassign student
  const handleUnassignStudent = async (student: ClassStudent) => {
    try {
      await secureFetch(`${API_BASE_URL}/vice/students/${student.studentId}/class`, {
        method: "PATCH",
        body: JSON.stringify({ classId: null }),
      });
      setFeedbackMsg({ type: "success", text: t("classes.unassignSuccess") });
      await onRefreshDetails();
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : t("common.validations.serverError"),
      });
    }
  };

  // Handle delete student permanently
  const handleDeleteStudent = async (student: ClassStudent) => {
    try {
      await secureFetch(`${API_BASE_URL}/vice/students/${student.studentId}`, {
        method: "DELETE",
      });
      setFeedbackMsg({ type: "success", text: t("classes.deleteSuccess") });
      await onRefreshDetails();
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : t("common.validations.serverError"),
      });
    }
  };

  // Handle remove teacher assignment
  const handleRemoveTeacherAssignment = async (teacherId: number, subjectId: number) => {
    try {
      await secureFetch(`${API_BASE_URL}/teacherassignments`, {
        method: "DELETE",
        body: JSON.stringify({
          teacherId,
          classId: details.classId,
          subjectId,
        }),
      });
      setFeedbackMsg({ type: "success", text: t("classes.deleteSuccess") });
      await onRefreshDetails();
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : t("common.validations.serverError"),
      });
    }
  };

  // ClassItem proxy for settings modal
  const classItemProxy: ClassItem = {
    classId: details.classId,
    className: details.className,
    departmentName: details.departmentName,
    capacity: details.capacity,
    studentCount: details.studentCount,
    isActive: details.isActive,
    academicYearName: details.academicYearName,
  };

  return (
    <Box>
      {/* Breadcrumbs Row */}
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
        >
          <Button
            onClick={onBackToCohortClasses}
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
            {t(`classes.${cohort}`)}
          </Button>
          <Typography color="text.primary" fontWeight={700}>
            {details.className}
          </Typography>
        </Breadcrumbs>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<SettingsIcon />}
          onClick={() => setIsClassSettingsOpen(true)}
          id="btn-open-class-settings-dialog"
          sx={{
            borderRadius: "12px",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          {t("classes.editClass")}
        </Button>
      </Stack>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <Alert
          severity={feedbackMsg.type}
          onClose={() => setFeedbackMsg(null)}
          sx={{ mb: 3, borderRadius: "14px" }}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Class Overview Header Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "24px",
          p: { xs: 3, sm: 4 },
          mb: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${alpha(cohortColor, 0.25)}`,
          boxShadow: `0 12px 36px ${alpha(cohortColor, 0.1)}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Typography variant="h4" fontWeight={900} letterSpacing="-0.02em">
                {details.className}
              </Typography>
              <Chip
                label={details.departmentName || "OM"}
                sx={{
                  fontWeight: 800,
                  borderRadius: "10px",
                  backgroundColor: alpha(cohortColor, 0.15),
                  color: cohortColor,
                }}
              />
              <Chip
                label={details.isActive ? t("classes.active") : t("classes.inactive")}
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: "8px",
                  backgroundColor: details.isActive
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.text.disabled, 0.12),
                  color: details.isActive
                    ? theme.palette.success.main
                    : theme.palette.text.secondary,
                }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {t(`classes.${cohort}`)} • {details.academicYearName || "Current Academic Year"}
            </Typography>
          </Box>

          {/* Quick Capacity Visualizer */}
          <Box sx={{ width: { xs: "100%", md: 320 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t("classes.kpiOccupancy")}
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color={cohortColor}>
                {details.studentCount} / {details.capacity} ({fillRate}%)
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(fillRate, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: alpha(cohortColor, 0.14),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  backgroundColor: cohortColor,
                },
              }}
            />
          </Box>
        </Stack>
      </Card>

      {/* KPI Cards Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          gap: 2.5,
          mb: 4,
        }}
      >
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <GroupIcon sx={{ fontSize: 18, color: cohortColor }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t("classes.kpiTotalStudents")}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={900}>
              {details.studentCount}
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <EventSeatIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t("classes.capacity")}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={900}>
              {details.capacity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {availableSeats} seats open
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <MaleIcon sx={{ fontSize: 18, color: "#3B82F6" }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t("classes.male")}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={900} color="#3B82F6">
              {boysCount}
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <FemaleIcon sx={{ fontSize: 18, color: "#EC4899" }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {t("classes.female")}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={900} color="#EC4899">
              {girlsCount}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Assigned Teachers Section */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <SchoolIcon sx={{ color: cohortColor }} />
          <Typography variant="h6" fontWeight={800}>
            {t("classes.assignedTeachers")} ({details.teachers.length})
          </Typography>
        </Stack>

        {details.teachers.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              backgroundColor: alpha(theme.palette.divider, 0.03),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("classes.noTeachersAssigned")}
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {details.teachers.map((tItem) => (
              <Box key={`${tItem.teacherId}-${tItem.subjectId}`}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(cohortColor, 0.15),
                        color: cohortColor,
                        fontWeight: 700,
                      }}
                    >
                      {tItem.teacherName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {tItem.teacherName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Subject: {tItem.subjectName}
                      </Typography>
                    </Box>
                  </Stack>

                  <Tooltip title="Remove Teacher Assignment">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        handleRemoveTeacherAssignment(tItem.teacherId, tItem.subjectId)
                      }
                      id={`btn-remove-teacher-${tItem.teacherId}-${tItem.subjectId}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Enrolled Students Table Section */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <GroupIcon sx={{ color: cohortColor }} />
          <Typography variant="h6" fontWeight={800}>
            {t("classes.enrolledStudents")} ({details.students.length})
          </Typography>
        </Stack>

        <ClassStudentTable
          students={details.students}
          className={details.className}
          onAddStudentClick={() => setIsAddStudentOpen(true)}
          onEditStudent={(s) => setEditingStudent(s)}
          onUnassignStudent={handleUnassignStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      </Box>

      {/* Modal: Add Student */}
      <AddStudentToClassModal
        open={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        classId={details.classId}
        className={details.className}
        cohort={cohort}
        department={details.departmentName || "OM"}
        academicYearName={details.academicYearName}
        onStudentAdded={onRefreshDetails}
      />

      {/* Modal: Edit Student */}
      <EditClassStudentModal
        open={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        cohort={cohort}
        department={details.departmentName || "OM"}
        classId={details.classId}
        onStudentUpdated={onRefreshDetails}
      />

      {/* Modal: Class Settings */}
      <ClassSettingsModal
        open={isClassSettingsOpen}
        onClose={() => setIsClassSettingsOpen(false)}
        editingClass={classItemProxy}
        cohort={cohort}
        academicYearName={details.academicYearName}
        onSubmitUpdate={async (cid, payload) => {
          await onUpdateClassSettings(cid, payload);
          await onRefreshDetails();
        }}
      />
    </Box>
  );
}
