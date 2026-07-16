"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Box,
    Container,
    Typography,
    Stack,
    Button,
    Card,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

import { Teacher } from "@/types/teacher.types";
import { Class, Subject } from "@/types/subject.types";
import { TeachersAPI } from "@/data/teachers.api";
import { SubjectsAPI } from "@/data/subjects.api";
import { ClassesAPI } from "@/data/classes.api";
import { TeacherAssignmentsAPI, TeacherAssignmentListItem } from "@/data/teacher-assignments.api";
import { AcademicYearsAPI, AcademicYearOption } from "@/data/academic-years.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingRegion from "@/components/a11y/LoadingRegion";
import AccessibleIconButton from "@/components/a11y/AccessibleIconButton";
import { appToast } from "@/hooks/useAppToast";

export default function ViceTeachersPage() {
    const { t } = useLanguage();
    const theme = useTheme();
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);

    const [openAddSubject, setOpenAddSubject] = useState(false);
    const [openAddTeacher, setOpenAddTeacher] = useState(false);
    const [openTeachersList, setOpenTeachersList] = useState(false);

    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
    const [assignments, setAssignments] = useState<TeacherAssignmentListItem[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<TeacherAssignmentListItem | null>(null);

    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");

    // Loading and error states for teacher form
    const [isSavingTeacher, setIsSavingTeacher] = useState(false);
    const [teacherError, setTeacherError] = useState<string | null>(null);
    const [teacherSuccess, setTeacherSuccess] = useState(false);

    // Loading and error states for data fetching
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [isAssigningTeacher, setIsAssigningTeacher] = useState(false);

    const [fetchError, setFetchError] = useState<string | null>(null);
    const [assignmentError, setAssignmentError] = useState<string | null>(null);
    const [assignmentSuccess, setAssignmentSuccess] = useState(false);

    /* ===================== ADD TEACHER FORM ===================== */
    const [teacherForm, setTeacherForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        qualifications: "",
        department: "",
    });

    /* ===================== ADD SUBJECT FORM ===================== */
    const [subjectName, setSubjectName] = useState("");
    const [subjectType, setSubjectType] = useState<"academic" | "competency">(
        "academic"
    );
    const [selectedStage, setSelectedStage] = useState<"junior" | "wheeler" | "senior">("junior");
    const [subjectDialogError, setSubjectDialogError] = useState<string | null>(null);

    const loadAssignments = useCallback(async () => {
        setIsLoadingAssignments(true);
        try {
            setAssignments(await TeacherAssignmentsAPI.list());
        } catch (error) {
            setFetchError(error instanceof Error ? error.message : t("teachers.failedLoadAssignments", "Failed to load teacher assignments."));
        } finally {
            setIsLoadingAssignments(false);
        }
    }, [t]);


    /* ===================== FETCH DATA ===================== */

    useEffect(() => {
        setIsLoadingTeachers(true);
        setFetchError(null);
        TeachersAPI.getAll()
            .then((data) => {
                setTeachers(data);
                setIsLoadingTeachers(false);
            })
            .catch((error) => {
                console.error("Failed to fetch teachers:", error);
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : t("teachers.failedLoadTeachers", "Failed to load teachers. Please try again.")
                );
                setIsLoadingTeachers(false);
            });
    }, [t]);

    useEffect(() => {
        AcademicYearsAPI.list()
            .then(setAcademicYears)
            .catch((error) => setFetchError(error instanceof Error ? error.message : t("teachers.failedLoadAcademicYears", "Failed to load academic years.")));
        void loadAssignments();
    }, [t, loadAssignments]);


    const loadTeachers = async () => {
        setIsLoadingTeachers(true);
        setFetchError(null);
        try {
            const data = await TeachersAPI.getAll();
            setTeachers(data);
        } catch (error) {
            setFetchError(
                error instanceof Error
                    ? error.message
                    : t("teachers.failedLoadTeachers", "Failed to load teachers. Please try again.")
            );
        } finally {
            setIsLoadingTeachers(false);
        }
    };

    useEffect(() => {
        if (!selectedYear || !selectedLevel) {
            setSubjects([]);
            setSelectedSubjectId("");
            return;
        }
        // A subject ID is only valid within its own academic-year and level.
        setSubjects([]);
        setSelectedSubjectId("");
        setIsLoadingSubjects(true);
        let requestIsCurrent = true;
        SubjectsAPI.getByYear(selectedYear, selectedLevel)
            .then((data) => {
                if (!requestIsCurrent) return;
                setSubjects(data);
                setIsLoadingSubjects(false);
            })
            .catch((error) => {
                if (!requestIsCurrent) return;
                console.error("Failed to fetch subjects:", error);
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : t("teachers.failedLoadSubjects", "Failed to load subjects. Please try again.")
                );
                setIsLoadingSubjects(false);
            });
        return () => {
            requestIsCurrent = false;
        };
    }, [selectedYear, selectedLevel, t]);

    useEffect(() => {
        if (!selectedYear || !selectedLevel) {
            setClasses([]);
            setSelectedClassIds([]);
            return;
        }
        setClasses([]);
        setSelectedClassIds([]);
        setIsLoadingClasses(true);
        let requestIsCurrent = true;
        ClassesAPI.getByYear(selectedYear, selectedLevel as "junior" | "wheeler" | "senior" | undefined)
            .then((data) => {
                if (!requestIsCurrent) return;
                setClasses(data);
                setIsLoadingClasses(false);
            })
            .catch((error) => {
                if (!requestIsCurrent) return;
                console.error("Failed to fetch classes:", error);
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : t("teachers.failedLoadClasses", "Failed to load classes. Please try again.")
                );
                setIsLoadingClasses(false);
            });
        return () => {
            requestIsCurrent = false;
        };
    }, [selectedYear, selectedLevel, t]);

    /* ===================== HANDLERS ===================== */
    const toggleClassSelection = (classId: number) => {
        setSelectedClassIds((prev) =>
            prev.includes(classId)
                ? prev.filter((id) => id !== classId)
                : [...prev, classId],
        );
    };

    const handleAssignTeacher = async () => {
        // Validation
        if (!selectedTeacherId || !selectedYear || !selectedSubjectId || selectedClassIds.length === 0) {
            setAssignmentError(t("teachers.fillRequiredFields", "Please fill in all required fields"));
            return;
        }

        setAssignmentError(null);
        setAssignmentSuccess(false);
        setIsAssigningTeacher(true);

        try {
            const teacherIdToAssign = selectedTeacherId;

            if (!teacherIdToAssign) {
                throw new Error(t("teachers.teacherNotSelected", "Teacher is not selected"));
            }

            const normalizedClassIds = selectedClassIds
                .map((id) => Number(id))
                .filter((id) => Number.isInteger(id) && id > 0);

            if (normalizedClassIds.length === 0) {
                throw new Error(t("teachers.selectValidClass", "Please select at least one valid class"));
            }

            const assignmentPayload = {
                teacherId: String(teacherIdToAssign).trim(),
                yearId: String(selectedYear).trim(),
                subjectId: String(selectedSubjectId).trim(),
                classIds: normalizedClassIds,
            };
            if (editingAssignment) {
                await TeacherAssignmentsAPI.replace(assignmentPayload);
            } else {
                await TeacherAssignmentsAPI.create(assignmentPayload);
            }

            setAssignmentSuccess(true);
            appToast.success(editingAssignment ? t("teachers.assignmentUpdated", "Teacher assignment updated successfully!") : t("teachers.assignedSuccess", "Teacher assigned successfully!"));
            // Reset form
            setSelectedTeacherId("");
            setSelectedSubjectId("");
            setSelectedClassIds([]);
            setEditingAssignment(null);
            await loadAssignments();

            // Hide success message after delay
            setTimeout(() => {
                setAssignmentSuccess(false);
            }, 3000);
        } catch (error) {
            console.error("Failed to assign teacher:", error);
            setAssignmentError(
                error instanceof Error
                    ? error.message
                    : t("teachers.failedAssignTeacher", "Failed to assign teacher. Please try again.")
            );
            appToast.error(
                error instanceof Error
                    ? error.message
                    : t("teachers.failedAssignTeacher", "Failed to assign teacher. Please try again.")
            );
        } finally {
            setIsAssigningTeacher(false);
        }
    };

    const handleEditAssignment = (assignment: TeacherAssignmentListItem) => {
        setEditingAssignment(assignment);
        setSelectedTeacherId(String(assignment.teacherId));
        setSelectedYear(assignment.yearName);
        setSelectedLevel(assignment.stage);
        setSelectedSubjectId(String(assignment.subjectId));
        setSelectedClassIds(assignments
            .filter((item) => item.teacherId === assignment.teacherId && item.academicYearId === assignment.academicYearId && item.subjectId === assignment.subjectId && item.isActive)
            .map((item) => item.classId));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSetAssignmentStatus = async (assignment: TeacherAssignmentListItem) => {
        try {
            await TeacherAssignmentsAPI.setStatus(assignment, !assignment.isActive);
            await loadAssignments();
            appToast.success(assignment.isActive ? t("teachers.assignmentDeactivated", "Assignment deactivated.") : t("teachers.assignmentActivated", "Assignment activated."));
        } catch (error) {
            appToast.error(error instanceof Error ? error.message : t("teachers.failedUpdateAssignment", "Failed to update assignment."));
        }
    };

    const handleDeleteAssignment = async (assignment: TeacherAssignmentListItem) => {
        if (!window.confirm(t("teachers.deleteAssignmentConfirm", "Delete this teacher assignment permanently?"))) return;
        try {
            await TeacherAssignmentsAPI.remove(assignment);
            await loadAssignments();
            appToast.success(t("teachers.assignmentDeleted", "Assignment deleted."));
        } catch (error) {
            appToast.error(error instanceof Error ? error.message : t("teachers.failedDeleteAssignment", "Failed to delete assignment."));
        }
    };

    const handleSaveTeacher = async () => {
        // Reset error and success states
        setTeacherError(null);
        setTeacherSuccess(false);

        // Form validation
        if (!teacherForm.firstName.trim()) {
            setTeacherError(t("teachers.firstNameRequired", "First name is required"));
            return;
        }
        if (!teacherForm.lastName.trim()) {
            setTeacherError(t("teachers.lastNameRequired", "Last name is required"));
            return;
        }
        if (!teacherForm.email.trim()) {
            setTeacherError(t("teachers.emailRequired", "Email is required"));
            return;
        }
        if (!teacherForm.phone.trim()) {
            setTeacherError(t("teachers.phoneRequired", "Phone is required"));
            return;
        }
        if (!teacherForm.department.trim()) {
            setTeacherError(t("teachers.departmentRequired", "Department is required"));
            return;
        }
        if (!teacherForm.qualifications.trim()) {
            setTeacherError(t("teachers.qualificationsRequired", "Qualifications are required"));
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(teacherForm.email.trim())) {
            setTeacherError(t("teachers.validEmail", "Please enter a valid email address"));
            return;
        }

        // Phone validation (basic - accepts numbers, spaces, dashes, parentheses)
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        const cleanPhone = teacherForm.phone.replace(/\s/g, "");
        if (cleanPhone.length < 8 || cleanPhone.length > 15) {
            setTeacherError(t("teachers.phoneLength", "Phone number must be between 8 and 15 digits"));
            return;
        }
        if (!phoneRegex.test(teacherForm.phone)) {
            setTeacherError(t("teachers.validPhone", "Please enter a valid phone number"));
            return;
        }

        setIsSavingTeacher(true);
        try {
            // Sanitize inputs before sending
            const sanitizeInput = (input: string) => {
                return input
                    .trim()
                    .replace(/[<>]/g, "") // Remove < and > to prevent XSS
                    .substring(0, 255); // Limit length
            };

            const createdTeacher = await TeachersAPI.create({
                hireDate: new Date().toISOString(),
                department: sanitizeInput(teacherForm.department),
                qualifications: sanitizeInput(teacherForm.qualifications),
                email: teacherForm.email.trim().toLowerCase(),
                role: "Teacher",
                phone: cleanPhone,
                fullName: {
                    firstName: sanitizeInput(teacherForm.firstName),
                    middleName: teacherForm.middleName ? sanitizeInput(teacherForm.middleName) : undefined,
                    lastName: sanitizeInput(teacherForm.lastName),
                },
            });
            setSelectedTeacherId(createdTeacher.id);
            await loadTeachers();

            // Success - reset form and continue to assignment steps
            setTeacherSuccess(true);
            appToast.success(t("teachers.addedSuccess", "Teacher added successfully!"));

            // Reset form
            setTeacherForm({
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                phone: "",
                qualifications: "",
                department: "",
            });

            // Close modal after a short delay to show success message
            setTimeout(() => {
                setOpenAddTeacher(false);
                setTeacherSuccess(false);
            }, 1500);
        } catch (error: unknown) {
            console.error("Failed to create teacher:", error);

            if (error instanceof Error) {
                setTeacherError(error.message);
                appToast.error(error.message);
            } else {
                setTeacherError(t("teachers.failedCreateTeacher", "Failed to create teacher. Please try again."));
                appToast.error(t("teachers.failedCreateTeacher", "Failed to create teacher. Please try again."));
            }
        }
        finally {
            setIsSavingTeacher(false);
        }
    };

    const handleSaveSubject = async () => {
        setSubjectDialogError(null);
        if (!subjectName.trim()) {
            setSubjectDialogError(t("teachers.subjectNameRequired", "Subject name is required"));
            return;
        }
        if (!selectedYear || !selectedStage) {
            setSubjectDialogError(t("teachers.selectAcademicYear", "Please select an academic year and stage"));
            return;
        }
        try {
            // Backend swagger does not accept "type"; encode category in subject name.
            const normalizedSubjectName =
                subjectType === "competency"
                    ? `${subjectName.trim()} (Jadarat)`
                    : subjectName.trim();

            const createdSubject = await SubjectsAPI.create({
                subjectName: normalizedSubjectName,
                yearName: selectedYear,
                stage: selectedStage,
            });

            setOpenAddSubject(false);
            setSubjectName("");
            setSubjectType("academic");
            setSubjectDialogError(null);
            if (selectedLevel === selectedStage) {
                setSubjects(await SubjectsAPI.getByYear(selectedYear, selectedLevel));
                setSelectedSubjectId(String(createdSubject.id));
            }
            appToast.success(t("teachers.saveSubject", "Subject saved!"));
        } catch (error) {
            console.error("Failed to create subject:", error);
            const msg = error instanceof Error ? error.message : t("teachers.failedCreateSubject", "Failed to create subject.");
            setSubjectDialogError(msg);
            appToast.error(msg);
        }
    };

    // Reset form when dialog closes
    const handleCloseTeacherDialog = () => {
        setOpenAddTeacher(false);
        setTeacherForm({
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: "",
            qualifications: "",
            department: "",
        });
        setTeacherError(null);
        setTeacherSuccess(false);
    };

    /* ===================== UI ===================== */

    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary?.main || primary;

    const glassCardSx = {
        p: { xs: 3, md: 4 },
        borderRadius: '24px',
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(24px)',
        border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 16px 50px ${alpha(primary, 0.1)}`,
        }
    };

    const badgeSx = {
        width: 40, height: 40,
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', color: theme.palette.primary.contrastText,
        boxShadow: `0 4px 12px ${alpha(primary, 0.4)}`,
        fontSize: '1.2rem'
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: "100vh",
                bgcolor: theme.palette.background.default,
                overflow: 'hidden',
                py: { xs: 2, md: 4 },
            }}
        >
            {/* Animated Background Gradients */}
            <Box
                component={motion.div}
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                sx={{
                    position: 'absolute', top: '-20%', left: '-10%', width: '120%', height: '120%',
                    background: `radial-gradient(circle at 30% 70%, ${alpha(primary, 0.15)}, transparent 50%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Stack spacing={4}>
                    {/* Header */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                            mb: 2
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${primary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {t("teachers.dashboardTitle")}
                        </Typography>
                        <Button
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            variant="contained"
                            onClick={() => setOpenTeachersList(true)}
                            sx={{
                                background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                color: theme.palette.primary.contrastText,
                                fontWeight: 700,
                                textTransform: "none",
                                borderRadius: '12px',
                                px: 3, py: 1,
                                boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                            }}
                        >
                            {t("teachers.listTeacher")}
                        </Button>
                    </Box>

                    {/* Main Content */}
                    <Box
                        component={motion.div}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <Stack spacing={4}>
                            {/* Step 1 */}
                            <Box component={motion.div} variants={itemVariants}>
                                <Card sx={glassCardSx}>
                                    <Stack spacing={3}>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                                            <Box sx={badgeSx}>1</Box>
                                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                                {t("teachers.selectTeacher")}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: 'center' }}>
                                            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: "100%", sm: 320 }, minWidth: 220 }}>
                                                <InputLabel>{t("teachers.selectTeacher")}</InputLabel>
                                                <Select
                                                    label={t("teachers.selectTeacher")}
                                                    value={selectedTeacherId}
                                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                                    disabled={isLoadingTeachers}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {isLoadingTeachers ? (
                                                        <MenuItem disabled>
                                                            <LoadingRegion />
                                                        </MenuItem>
                                                    ) : teachers.length === 0 ? (
                                                        <MenuItem disabled>{t("teachers.noTeachersAvailable")}</MenuItem>
                                                    ) : (
                                                        teachers.map((t) => (
                                                            <MenuItem key={t.id} value={t.id}>
                                                                {t.fullName}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                            </FormControl>

                                            <Button
                                                component={motion.button}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setOpenAddTeacher(true)}
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                sx={{
                                                    background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                                    color: theme.palette.primary.contrastText,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    borderRadius: '12px',
                                                    px: 3,
                                                    boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                                                }}
                                            >
                                                {t("teachers.addNewTeacher")}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Box>

                            {/* Step 2 */}
                            <Box component={motion.div} variants={itemVariants}>
                                <Card sx={glassCardSx}>
                                    <Stack spacing={3}>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                                            <Box sx={badgeSx}>2</Box>
                                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                                {t("teachers.subjectAssignment")}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: 'center' }}>
                                            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: "100%", sm: 220 }, minWidth: 180 }}>
                                                <InputLabel>{t("students.academicYear")}</InputLabel>
                                                <Select
                                                    label={t("students.academicYear")}
                                                    value={selectedYear}
                                                    onChange={(e) => {
                                                        setSelectedYear(e.target.value);
                                                        setSelectedSubjectId("");
                                                        setSelectedClassIds([]);
                                                    }}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {academicYears.filter((year) => year.isActive).map((year) => (
                                                        <MenuItem key={year.yearName} value={year.yearName}>{year.yearName}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: "100%", sm: 220 }, minWidth: 180 }}>
                                                <InputLabel>{t("teachers.level", "Level")}</InputLabel>
                                                <Select
                                                    label={t("teachers.level", "Level")}
                                                    value={selectedLevel}
                                                    onChange={(e) => {
                                                        setSelectedLevel(e.target.value);
                                                        setSelectedSubjectId("");
                                                        setSelectedClassIds([]);
                                                    }}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <MenuItem value="junior">Junior</MenuItem>
                                                    <MenuItem value="wheeler">Wheeler</MenuItem>
                                                    <MenuItem value="senior">Senior</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <FormControl fullWidth size="small" sx={{ maxWidth: { xs: "100%", sm: 220 }, minWidth: 180 }}>
                                                <InputLabel>{t("teachers.subject")}</InputLabel>
                                                <Select
                                                    label={t("teachers.subject")}
                                                    value={selectedSubjectId}
                                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                                    disabled={isLoadingSubjects || !selectedYear || !selectedLevel}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    {isLoadingSubjects ? (
                                                        <MenuItem disabled>
                                                            <LoadingRegion />
                                                        </MenuItem>
                                                    ) : subjects.length === 0 ? (
                                                        <MenuItem disabled>{t("teachers.noSubjectsAvailable", "No subjects available")}</MenuItem>
                                                    ) : (
                                                        subjects.map((s) => (
                                                            <MenuItem key={s.id} value={s.id}>
                                                                {s.subjectName}
                                                            </MenuItem>
                                                        ))
                                                    )}
                                                </Select>
                                            </FormControl>

                                            <AccessibleIconButton
                                                label={t("teachers.addSubject", "Add subject")}
                                                onClick={() => {
                                                    setSelectedStage((selectedLevel || "junior") as "junior" | "wheeler" | "senior");
                                                    setOpenAddSubject(true);
                                                }}
                                                disabled={!selectedYear || !selectedLevel}
                                                sx={{
                                                    backgroundColor: primary,
                                                    color: theme.palette.primary.contrastText,
                                                    borderRadius: '12px',
                                                    "&:hover": { backgroundColor: theme.palette.primary.dark },
                                                }}
                                            >
                                                <AddIcon />
                                            </AccessibleIconButton>
                                        </Box>
                                    </Stack>
                                </Card>
                            </Box>

                            {/* Step 3 */}
                            <Box component={motion.div} variants={itemVariants}>
                                <Card sx={glassCardSx}>
                                    <Stack spacing={3}>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                                            <Box sx={badgeSx}>3</Box>
                                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                                {t("teachers.assignClasses")}
                                            </Typography>
                                        </Box>

                                        {/* Selection badge */}
                                        {selectedClassIds.length > 0 && (
                                            <Box sx={{
                                                display: 'inline-flex', alignItems: 'center', gap: 1,
                                                bgcolor: alpha(primary, 0.1), color: primary,
                                                px: 2, py: 0.75, borderRadius: '10px',
                                                fontWeight: 700, fontSize: '0.85rem',
                                                border: `1px solid ${alpha(primary, 0.25)}`,
                                            }}>
                                                ✓ {t("teachers.classesSelected", "{count} class(es) selected").replace("{count}", String(selectedClassIds.length))}
                                            </Box>
                                        )}

                                        {isLoadingClasses ? (
                                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                                <CircularProgress color="primary" />
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                                {classes.length === 0 ? (
                                                    <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                                        {t("teachers.noClassesForYear")}
                                                    </Typography>
                                                ) : (
                                                    classes.map((cls) => {
                                                        const isSelected = selectedClassIds.includes(cls.classId);
                                                        return (
                                                            <Button
                                                                component={motion.button}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                key={cls.classId}
                                                                onClick={() => toggleClassSelection(cls.classId)}
                                                                aria-pressed={isSelected}
                                                                aria-label={`${t("students.class")} ${cls.className}`}
                                                                sx={{
                                                                    minWidth: 72,
                                                                    height: 44,
                                                                    px: 2.5,
                                                                    borderRadius: "14px",
                                                                    backgroundColor: isSelected ? primary : alpha(theme.palette.background.default, 0.6),
                                                                    color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: 800,
                                                                    fontSize: '0.9rem',
                                                                    letterSpacing: '0.02em',
                                                                    textTransform: 'none',
                                                                    whiteSpace: 'nowrap',
                                                                    transition: "all 0.25s ease",
                                                                    border: isSelected ? 'none' : `1.5px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                                    boxShadow: isSelected ? `0 6px 18px ${alpha(primary, 0.4)}` : `0 2px 6px ${alpha(theme.palette.common.black, 0.06)}`,
                                                                }}
                                                            >
                                                                {cls.className}
                                                            </Button>
                                                        );
                                                    })
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                </Card>
                            </Box>
                        </Stack>

                        <Box component={motion.div} variants={itemVariants}>
                            <Card sx={glassCardSx}>
                                <Stack spacing={2.5}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight={800}>{t("teachers.savedAssignments", "Saved Teacher Assignments")}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t("teachers.savedAssignmentsDescription", "Assignments below are loaded directly from the academic database.")}</Typography>
                                        </Box>
                                        <Button variant="outlined" onClick={() => void loadAssignments()} disabled={isLoadingAssignments} sx={{ textTransform: "none", borderRadius: 2 }}>
                                            {isLoadingAssignments ? t("common.loading") : t("common.refresh")}
                                        </Button>
                                    </Box>
                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: alpha(primary, 0.1) }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.name")}</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("students.academicYear")}</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.level", "Level")}</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.subject")}</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("students.class")}</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.status", "Status")}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 800 }}>{t("teachers.actions", "Actions")}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assignments.map((assignment) => (
                                                    <TableRow key={`${assignment.teacherId}-${assignment.academicYearId}-${assignment.subjectId}-${assignment.classId}`} hover>
                                                        <TableCell>{assignment.teacherName}</TableCell>
                                                        <TableCell>{assignment.yearName}</TableCell>
                                                        <TableCell>{t(`vice.${assignment.stage}`, assignment.stage)}</TableCell>
                                                        <TableCell>{assignment.subjectName}</TableCell>
                                                        <TableCell>{assignment.className}</TableCell>
                                                        <TableCell>{assignment.isActive ? t("teachers.active", "Active") : t("teachers.inactive", "Inactive")}</TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                <AccessibleIconButton label={t("teachers.editAssignment", "Edit assignment")} onClick={() => handleEditAssignment(assignment)}><EditIcon fontSize="small" /></AccessibleIconButton>
                                                                <AccessibleIconButton label={assignment.isActive ? t("teachers.deactivateAssignment", "Deactivate assignment") : t("teachers.activateAssignment", "Activate assignment")} onClick={() => void handleSetAssignmentStatus(assignment)}>
                                                                    {assignment.isActive ? <PauseCircleOutlineIcon fontSize="small" /> : <PlayCircleOutlineIcon fontSize="small" />}
                                                                </AccessibleIconButton>
                                                                <AccessibleIconButton label={t("teachers.deleteAssignment", "Delete assignment")} onClick={() => void handleDeleteAssignment(assignment)}><DeleteOutlineIcon fontSize="small" /></AccessibleIconButton>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {!isLoadingAssignments && assignments.length === 0 && (
                                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>{t("teachers.noAssignments", "No teacher assignments have been created yet.")}</TableCell></TableRow>
                                                )}
                                                {isLoadingAssignments && (
                                                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Stack>
                            </Card>
                        </Box>

                        {/* Error and Success Messages */}
                        <AnimatePresence>
                            {fetchError && (
                                <Box component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setFetchError(null)}>
                                        {fetchError}
                                    </Alert>
                                </Box>
                            )}
                            {assignmentError && (
                                <Box component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setAssignmentError(null)}>
                                        {assignmentError}
                                    </Alert>
                                </Box>
                            )}
                            {assignmentSuccess && (
                                <Box component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setAssignmentSuccess(false)}>
                                        {t("teachers.assignedSuccess", "Teacher assigned successfully!")}
                                    </Alert>
                                </Box>
                            )}
                        </AnimatePresence>

                        <Box component={motion.div} variants={itemVariants} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <Button
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="contained"
                                size="large"
                                disabled={
                                    !selectedTeacherId ||
                                    !selectedYear ||
                                    !selectedLevel ||
                                    !selectedSubjectId ||
                                    selectedClassIds.length === 0 ||
                                    isAssigningTeacher
                                }
                                onClick={handleAssignTeacher}
                                sx={{
                                    background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                    color: theme.palette.primary.contrastText,
                                    px: { xs: 4, md: 8 },
                                    py: 2,
                                    fontWeight: 800,
                                    fontSize: '1.2rem',
                                    borderRadius: '16px',
                                    boxShadow: `0 8px 24px ${alpha(primary, 0.4)}`,
                                    textTransform: "none",
                                }}
                            >
                                {isAssigningTeacher ? (
                                    <>
                                        <CircularProgress size={24} sx={{ mr: 2, color: 'inherit' }} />
                                        {t("teachers.processing")}
                                    </>
                                ) : (
                                    editingAssignment ? t("teachers.saveAssignmentChanges", "Save Assignment Changes") : t("teachers.createAndAssignTeacher")
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Stack>

                {/* Add Teacher Modal */}
                <Dialog open={openAddTeacher} onClose={handleCloseTeacherDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                        {t("teachers.addNewTeacher")}
                        <AccessibleIconButton
                            label={t("common.closeMenu")}
                            onClick={handleCloseTeacherDialog}
                            sx={{ float: "right", bgcolor: alpha(theme.palette.text.primary, 0.05) }}
                        >
                            <CloseIcon />
                        </AccessibleIconButton>
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={2.5} sx={{ mt: 1, minWidth: { xs: 0, sm: 400 } }}>
                            <Typography variant="body2" color="text.secondary">
                                {t("teachers.requiredFieldsHint", "Fields marked with * are required.")}
                            </Typography>
                            {/* Success Message */}
                            {teacherSuccess && (
                                <Alert severity="success" sx={{ borderRadius: 2 }}>
                                    {t("teachers.addedSuccess", "Teacher added successfully!")}
                                </Alert>
                            )}

                            {/* Error Message */}
                            {teacherError && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>{teacherError}</Alert>
                            )}

                            <TextField
                                label={t("modal.firstName")}
                                placeholder={t("modal.firstName")}
                                value={teacherForm.firstName}
                                onChange={(e) =>
                                    setTeacherForm({ ...teacherForm, firstName: e.target.value })
                                }
                                required
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                                label={t("modal.middleNameOptional")}
                                placeholder={t("modal.middleNameOptional")}
                                value={teacherForm.middleName}
                                onChange={(e) =>
                                    setTeacherForm({ ...teacherForm, middleName: e.target.value })
                                }
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label={t("modal.lastName")}
                                placeholder={t("modal.lastName")}
                                value={teacherForm.lastName}
                                onChange={(e) =>
                                    setTeacherForm({ ...teacherForm, lastName: e.target.value })
                                }
                                required
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label={t("modal.email")}
                                type="email"
                                placeholder={t("modal.email")}
                                value={teacherForm.email}
                                onChange={(e) =>
                                    setTeacherForm({ ...teacherForm, email: e.target.value })
                                }
                                required
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label={t("modal.phone")}
                                placeholder={t("modal.phone")}
                                type="tel"
                                value={teacherForm.phone}
                                onChange={(e) =>
                                    setTeacherForm({ ...teacherForm, phone: e.target.value })
                                }
                                required
                                fullWidth
                                helperText={t("teachers.phoneLength", "Enter phone number (8-15 digits)")}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label={t("teachers.qualifications", "Qualifications")}
                                placeholder={t("teachers.qualifications", "Qualifications")}
                                value={teacherForm.qualifications}
                                onChange={(e) =>
                                    setTeacherForm({
                                        ...teacherForm,
                                        qualifications: e.target.value,
                                    })
                                }
                                multiline
                                rows={3}
                                required
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                            <TextField
                                label={t("students.department")}
                                placeholder={t("teachers.departmentHelp", "Department (must match backend)")}
                                value={teacherForm.department}
                                onChange={(e) =>
                                    setTeacherForm({
                                        ...teacherForm,
                                        department: e.target.value,
                                    })
                                }
                                required
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleSaveTeacher}
                                disabled={isSavingTeacher}
                                fullWidth
                                sx={{
                                    mt: 2,
                                    background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                    color: theme.palette.primary.contrastText,
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    py: 1.5,
                                    boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                                }}
                            >
                                {isSavingTeacher ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
                                        {t("modal.saving")}
                                    </>
                                ) : (
                                    t("teachers.saveTeacher", "Save Teacher")
                                )}
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

                {/* Add Subject Modal */}
                <Dialog open={openAddSubject} onClose={() => setOpenAddSubject(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                    <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                        {t("teachers.addSubject", "Add New Subject")}
                        <AccessibleIconButton
                            label={t("common.closeMenu")}
                            onClick={() => setOpenAddSubject(false)}
                            sx={{ float: "right", bgcolor: alpha(theme.palette.text.primary, 0.05) }}
                        >
                            <CloseIcon />
                        </AccessibleIconButton>
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            {/* Inline error — appears inside dialog, not the page */}
                            {subjectDialogError && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {subjectDialogError}
                                </Alert>
                            )}

                            <TextField
                                label={t("teachers.subjectName", "Subject name")}
                                placeholder="e.g. Mathematics"
                                value={subjectName}
                                onChange={(e) => { setSubjectName(e.target.value); setSubjectDialogError(null); }}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <FormControl fullWidth size="small">
                                <InputLabel>Stage / Level</InputLabel>
                                <Select
                                    label="Stage / Level"
                                    value={selectedStage}
                                    onChange={(e) => setSelectedStage(e.target.value as "junior" | "wheeler" | "senior")}
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value="junior">Junior</MenuItem>
                                    <MenuItem value="wheeler">Wheeler</MenuItem>
                                    <MenuItem value="senior">Senior</MenuItem>
                                </Select>
                            </FormControl>

                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                {t("teachers.sharedSubjectHint", "This subject will be available in every academic year for the selected level.")} <b>{selectedStage}</b>
                            </Alert>

                            <RadioGroup
                                value={subjectType}
                                onChange={(e) =>
                                    setSubjectType(e.target.value as "academic" | "competency")
                                }
                            >
                                <FormControlLabel
                                    value="academic"
                                    control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} />}
                                    label={<Typography fontWeight={600}>{t("teachers.academicSubject", "Academic Subject")}</Typography>}
                                />
                                <FormControlLabel
                                    value="competency"
                                    control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} />}
                                    label={<Typography fontWeight={600}>{t("teachers.competencyJadarat", "Competency (Jadarat)")}</Typography>}
                                />
                            </RadioGroup>

                            <Button
                                variant="contained"
                                onClick={handleSaveSubject}
                                disabled={!subjectName.trim() || !selectedYear}
                                sx={{
                                    background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                    color: theme.palette.primary.contrastText,
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    py: 1.5,
                                    boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                                    '&.Mui-disabled': { opacity: 0.5 },
                                }}
                            >
                                {t("teachers.saveSubject", "Save Subject")}
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>

            </Container>

            <Dialog open={openTeachersList} onClose={() => setOpenTeachersList(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                    {t("teachers.teachersList")}
                    <AccessibleIconButton label={t("common.closeMenu")} onClick={() => setOpenTeachersList(false)} sx={{ float: "right", bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
                        <CloseIcon />
                    </AccessibleIconButton>
                </DialogTitle>
                <DialogContent>
                    <Button
                        variant="outlined"
                        onClick={loadTeachers}
                        sx={{ mb: 3, textTransform: "none", borderColor: theme.palette.divider, color: theme.palette.text.primary, borderRadius: '12px', fontWeight: 600 }}
                    >
                        {t("common.refresh")}
                    </Button>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, bgcolor: 'transparent' }}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: alpha(primary, 0.1) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.id")}</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>{t("teachers.name")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teachers.map((t) => (
                                    <TableRow key={t.id} sx={{ '&:hover': { bgcolor: alpha(primary, 0.05) }, transition: 'background-color 0.2s' }}>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{t.fullName}</TableCell>
                                    </TableRow>
                                ))}
                                {teachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary', fontWeight: 500 }}>{t("teachers.noTeachersAvailable")}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
