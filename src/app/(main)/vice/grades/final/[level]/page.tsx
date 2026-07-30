'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import {
    Box, Container, Typography, Stack, Card, alpha, Chip, Skeleton,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    Button, TextField, RadioGroup, FormControlLabel, Radio, Divider,
    Alert, Snackbar, CircularProgress, Select, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SaveIcon from '@mui/icons-material/Save';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LockIcon from '@mui/icons-material/Lock';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { API_BASE_URL, secureFetch } from '@/config/api.config';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface StudentGrade {
    studentId: string;
    studentName: string;
    studentCode: string;
    className: string;
    score: number | null;
}

interface GradesResponse {
    students: StudentGrade[];
    subjectName?: string;
    maxScore?: number;
    status: 'draft' | 'submitted' | 'approved';
}

interface ClassOption {
    id: string;
    name: string;
}

// ─── Meta ────────────────────────────────────────────────────────────────────

const LEVEL_META: Record<string, { color: string; emoji: string }> = {
    junior:  { color: '#F59E0B', emoji: '🌱' },
    wheeler: { color: '#06B6D4', emoji: '⚡' },
    senior:  { color: '#8B5CF6', emoji: '🎓' },
};

// ─── Item Variants ────────────────────────────────────────────────────────────

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 15 } },
};

// ─── Content ──────────────────────────────────────────────────────────────────

function FinalGradesDashboardContent() {
    const theme = useTheme();
    const params = useParams();
    const searchParams = useSearchParams();

    const level = typeof params?.level === 'string' ? params.level : 'junior';
    const semester = searchParams?.get('semester') || '1';
    const meta = LEVEL_META[level] ?? { color: '#10B981', emoji: '🎓' };
    const primaryColor = '#10B981';

    const { user } = useAuth();
    const { t } = useLanguage();
    const isAdmin = user?.role === 'Admin';

    const [department, setDepartment] = useState('om');
    const [classFilter, setClassFilter] = useState('all');
    const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([]);
    const [status, setStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [localGrades, setLocalGrades] = useState<Record<string, number | null>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [approving, setApproving] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
        open: false, msg: '', severity: 'success',
    });

    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [availableSubjects, setAvailableSubjects] = useState<Array<{ id: string; name: string }>>([]);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    const API = API_BASE_URL;

    useEffect(() => {
        async function fetchSubjects() {
            setSubjectsLoading(true);
            try {
                const data = await secureFetch<Array<{ id?: string | number; subjectId?: string | number; subjectName?: string; name?: string }>>(
                    `${API}/Subjects?year=${encodeURIComponent(level)}`
                );
                const list = (Array.isArray(data) ? data : []).flatMap((s) => {
                    const id = s.id ?? s.subjectId;
                    const name = s.subjectName ?? s.name;
                    return id === undefined || !name ? [] : [{ id: String(id), name }];
                });
                setAvailableSubjects(list);
                if (list.length > 0) {
                    setSubjectFilter(list[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
                setAvailableSubjects([]);
            } finally {
                setSubjectsLoading(false);
            }
        }
        fetchSubjects();
    }, [level, API]);

    const loadGrades = useCallback(async () => {
        if (!subjectFilter) {
            setGrades([]);
            return;
        }
        setLoading(true);
        try {
            const classData = await secureFetch<Array<{ classId?: string | number; id?: string | number; className?: string; name?: string }>>(
                `${API}/Classes?yearId=${encodeURIComponent(level)}`
            ).catch(() => []);
            setAvailableClasses(classData.flatMap((item) => {
                const id = item.classId ?? item.id;
                const name = item.className ?? item.name;
                return id === undefined || !name ? [] : [{ id: String(id), name }];
            }));

            const query = new URLSearchParams({ level, semester, department, subjectId: subjectFilter });
            if (classFilter !== 'all') query.set('classId', classFilter);
            const data = await secureFetch<GradesResponse>(
                `${API}/vice/grades/final/students?${query.toString()}`
            ) as GradesResponse | null;
            const list = data?.students ?? [];
            setGrades(list);
            setStatus(data?.status ?? 'draft');
            const initial: Record<string, number | null> = {};
            list.forEach((student) => { initial[student.studentId] = student.score; });
            setLocalGrades(initial);
        } catch (error) {
            setGrades([]);
            setStatus('draft');
            setAvailableClasses([]);
            setLocalGrades({});
            setSnack({
                open: true,
                msg: error instanceof Error ? error.message : 'Unable to load final grades.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [level, semester, department, classFilter, subjectFilter, API]);

    useEffect(() => {
        queueMicrotask(() => {
            void loadGrades();
        });
    }, [loadGrades]);

    const handleSave = async () => {
        setSaving(true);
        if (classFilter === 'all' || !Number.isInteger(Number(classFilter))) {
            setSnack({ open: true, msg: 'Select one class before saving grades.', severity: 'error' });
            setSaving(false);
            return;
        }
        if (!subjectFilter) {
            setSnack({ open: true, msg: 'Select a subject before saving grades.', severity: 'error' });
            setSaving(false);
            return;
        }
        const payload = {
            level,
            semester: Number(semester),
            department,
            classId: Number(classFilter),
            subjectId: Number(subjectFilter),
            grades: Object.entries(localGrades)
                .filter(([, score]) => score !== null)
                .map(([studentId, score]) => ({ studentId, score })),
        };
        try {
            await secureFetch(`${API}/vice/grades/final/students`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            setSnack({ open: true, msg: 'Grades saved successfully!', severity: 'success' });
        } catch {
            setSnack({ open: true, msg: 'Network error. Please try again.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!subjectFilter) {
            setSnack({ open: true, msg: 'Select a subject before submitting grades.', severity: 'error' });
            return;
        }
        setSubmitting(true);
        try {
            await secureFetch(`${API}/vice/grades/final/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, semester: Number(semester), department, classId: classFilter === 'all' ? null : Number(classFilter), subjectId: Number(subjectFilter) }),
            });
            setSnack({ open: true, msg: 'Grades submitted for approval!', severity: 'success' });
            setStatus('submitted');
        } catch {
            setSnack({ open: true, msg: 'Network error.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (!subjectFilter) {
            setSnack({ open: true, msg: 'Select a subject before approving grades.', severity: 'error' });
            return;
        }
        setApproving(true);
        try {
            await secureFetch(`${API}/admin/grades/final/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, semester: Number(semester), department, classId: classFilter === 'all' ? null : classFilter, subjectId: Number(subjectFilter) }),
            });
            setSnack({ open: true, msg: 'Grades approved and locked successfully!', severity: 'success' });
            setStatus('approved');
        } catch {
            setSnack({ open: true, msg: 'Network error.', severity: 'error' });
        } finally {
            setApproving(false);
        }
    };

    const isLocked = status === 'approved' || (status === 'submitted' && !isAdmin) || (isAdmin && status === 'draft');
    const canSubmit = !isAdmin && status === 'draft';
    const canApprove = isAdmin && status === 'submitted';

    const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                bgcolor: theme.palette.background.default,
                overflow: 'hidden',
                py: { xs: 3, md: 5 },
            }}
        >
            {/* Blobs */}
            <Box
                component={motion.div}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                sx={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: '50%', height: '50%',
                    background: `radial-gradient(circle, ${alpha(primaryColor, 0.14)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    component={motion.div}
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                >
                    {/* Header */}
                    <Box component={motion.div} variants={itemVariants} sx={{ mb: 4 }}>
                        <Link
                            href={`/vice/grades/final?semester=${semester}`}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
                        >
                            <Box
                                component={motion.div}
                                whileHover={{ x: -4 }}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}
                            >
                                <ArrowBackIcon fontSize="small" />
                                <Typography variant="body2" fontWeight={600} color="inherit">{t('gradeSelection.backToLevels', 'Back to Levels')}</Typography>
                            </Box>
                        </Link>

                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        width: 52, height: 52, borderRadius: '16px', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${primaryColor}, ${alpha(primaryColor, 0.6)})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
                                    }}
                                >
                                    <SchoolIcon sx={{ color: '#fff', fontSize: 26 }} />
                                </Box>
                                <Box>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <Typography
                                            variant="h3"
                                            fontWeight={800}
                                            sx={{
                                                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${primaryColor})`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            {t(`vice.${level.toLowerCase()}`, levelLabel)} — {t('viceGrades.finalGrades', 'Final Grades')}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" gap={1} mt={0.5}>
                                        <Chip
                                            label={`${t('viceGrades.semester', 'Semester')} ${semester}`}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}
                                        />
                                        <Chip
                                            label={meta.emoji + ' ' + t(`vice.${level.toLowerCase()}`, levelLabel)}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: alpha(meta.color, 0.1), color: meta.color }}
                                        />
                                        <Chip
                                            label={status.toUpperCase()}
                                            size="small"
                                            icon={status === 'approved' ? <LockIcon style={{ fontSize: 14 }} /> : status === 'submitted' ? <FilterListIcon style={{ fontSize: 14 }} /> : undefined}
                                            sx={{ 
                                                fontWeight: 700, 
                                                bgcolor: status === 'approved' ? alpha('#10B981', 0.1) : status === 'submitted' ? alpha('#F59E0B', 0.1) : alpha(theme.palette.text.disabled, 0.1),
                                                color: status === 'approved' ? '#10B981' : status === 'submitted' ? '#F59E0B' : theme.palette.text.disabled
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction="row" gap={1.5}>
                                {canSubmit && (
                                    <>
                                        <Button
                                            onClick={handleSave}
                                            disabled={saving}
                                            variant="outlined"
                                            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                            sx={{
                                                fontWeight: 700, textTransform: 'none',
                                                borderColor: alpha(primaryColor, 0.4), color: primaryColor,
                                                borderRadius: '12px', px: 3,
                                                '&:hover': { borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.06) },
                                            }}
                                        >
                                            {saving ? t('common.saving', 'Saving...') : t('viceGrades.saveDraft', 'Save Draft')}
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            variant="contained"
                                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <AssignmentTurnedInIcon />}
                                            sx={{
                                                background: `linear-gradient(45deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})`,
                                                color: '#fff', fontWeight: 700, textTransform: 'none',
                                                borderRadius: '12px', px: 3,
                                                boxShadow: `0 6px 20px ${alpha(primaryColor, 0.35)}`,
                                            }}
                                        >
                                            {submitting ? t('common.submitting', 'Submitting...') : t('viceGrades.submitForApproval', 'Submit for Approval')}
                                        </Button>
                                    </>
                                )}
                                {canApprove && (
                                    <Button
                                        onClick={handleApprove}
                                        disabled={approving}
                                        variant="contained"
                                        startIcon={approving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                                        sx={{
                                            background: `linear-gradient(45deg, #10B981, ${alpha('#10B981', 0.7)})`,
                                            color: '#fff', fontWeight: 700, textTransform: 'none',
                                            borderRadius: '12px', px: 3,
                                            boxShadow: `0 6px 20px ${alpha('#10B981', 0.35)}`,
                                        }}
                                    >
                                        {approving ? t('common.approving', 'Approving...') : t('viceGrades.approveAndLock', 'Approve & Lock Grades')}
                                    </Button>
                                )}
                                {status === 'approved' && (
                                    <Chip 
                                        icon={<LockIcon style={{ fontSize: 16 }} />}
                                        label="Locked & Finalized" 
                                        sx={{ p: 2, height: 42, borderRadius: '12px', fontWeight: 800, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }} 
                                    />
                                )}
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Filter + Table Card */}
                    <Card
                        component={motion.div}
                        variants={itemVariants}
                        sx={{
                            borderRadius: '28px',
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                            boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.08)}`,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Department Filter Bar */}
                        <Box sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                    {t('viceGrades.studentsList', 'Students List')}
                                </Typography>
                                <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap">
                                    {/* Subject Filter */}
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {t('viceGrades.selectSubject', 'Select Subject')}:
                                        </Typography>
                                        {subjectsLoading ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <Select
                                                size="small"
                                                value={subjectFilter}
                                                onChange={(e) => setSubjectFilter(e.target.value)}
                                                sx={{
                                                    minWidth: 160,
                                                    borderRadius: '12px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: alpha(primaryColor, 0.25),
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: primaryColor,
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: primaryColor,
                                                    },
                                                }}
                                            >
                                                {availableSubjects.map((sub) => (
                                                    <MenuItem key={sub.id} value={sub.id}>
                                                        {sub.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    </Stack>

                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {t('viceGrades.department', 'Department')}:
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                        >
                                            {['om', 'sd'].map((dep) => (
                                                <FormControlLabel
                                                    key={dep}
                                                    value={dep}
                                                    control={
                                                        <Radio
                                                            size="small"
                                                            sx={{
                                                                color: alpha(primaryColor, 0.4),
                                                                '&.Mui-checked': { color: primaryColor },
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" fontWeight={700} textTransform="uppercase">
                                                            {dep}
                                                        </Typography>
                                                    }
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            {t('viceGrades.class', 'Class')}:
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="all"
                                                control={<Radio size="small" sx={{ color: alpha(primaryColor, 0.4), '&.Mui-checked': { color: primaryColor } }} />}
                                                label={<Typography variant="body2" fontWeight={700}>ALL</Typography>}
                                            />
                                            {availableClasses.map((cls) => (
                                                <FormControlLabel
                                                    key={cls.id}
                                                    value={cls.id}
                                                    control={<Radio size="small" sx={{ color: alpha(primaryColor, 0.4), '&.Mui-checked': { color: primaryColor } }} />}
                                                    label={<Typography variant="body2" fontWeight={700}>{cls.name}</Typography>}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.06) }} />

                        {/* Table */}
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            background: `linear-gradient(90deg, ${alpha(primaryColor, 0.1)}, ${alpha(meta.color, 0.08)})`,
                                        }}
                                    >
                                        {['#', t('common.studentName', 'Student Name'), t('common.code', 'Code'), t('teachers.class', 'Class'), `${t('viceGrades.semester', 'Semester')} ${semester} - ${t('common.score', 'Score')}`, t('common.status', 'Status')].map((h) => (
                                            <TableCell
                                                key={h}
                                                align={h === '#' ? 'center' : 'left'}
                                                sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary', border: 'none', py: 2 }}
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <AnimatePresence>
                                        {loading
                                            ? Array.from({ length: 5 }).map((_, i) => (
                                                <TableRow key={i}>
                                                    {Array.from({ length: 6 }).map((_, j) => (
                                                        <TableCell key={j}>
                                                            <Skeleton variant="text" width="80%" />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                            : grades.length === 0
                                                ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                            <Typography color="text.disabled" fontWeight={500}>
                                                                {t('viceGrades.noStudents', 'No students found for this selection')}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                                : grades.map((student, i) => (
                                                    <TableRow
                                                        key={student.studentId}
                                                        component={motion.tr}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        sx={{
                                                            '&:hover': { bgcolor: alpha(primaryColor, 0.04) },
                                                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                                                            transition: 'background 0.2s',
                                                        }}
                                                    >
                                                        <TableCell align="center" sx={{ fontWeight: 700, color: 'text.disabled', width: 48 }}>
                                                            {i + 1}
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                            {student.studentName}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={student.studentCode}
                                                                size="small"
                                                                sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(theme.palette.text.primary, 0.06) }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={student.className}
                                                                size="small"
                                                                sx={{ fontWeight: 700, bgcolor: alpha(meta.color, 0.1), color: meta.color }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                type="number"
                                                                variant="outlined"
                                                                size="small"
                                                                value={localGrades[student.studentId] ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? null : Number(e.target.value);
                                                                    setLocalGrades((prev) => ({ ...prev, [student.studentId]: val }));
                                                                }}
                                                                disabled={isLocked}
                                                                inputProps={{ min: 0, max: 100, style: { textAlign: 'center', fontWeight: 700 } }}
                                                                sx={{
                                                                    width: 90,
                                                                    '& .MuiOutlinedInput-root': {
                                                                        borderRadius: '12px',
                                                                        '& fieldset': { borderColor: isLocked ? alpha(theme.palette.divider, 0.1) : alpha(primaryColor, 0.25) },
                                                                        '&:hover fieldset': { borderColor: isLocked ? alpha(theme.palette.divider, 0.1) : primaryColor },
                                                                        '&.Mui-focused fieldset': { borderColor: isLocked ? alpha(theme.palette.divider, 0.1) : primaryColor },
                                                                        bgcolor: isLocked ? alpha(theme.palette.action.disabledBackground, 0.05) : 'transparent'
                                                                    },
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {localGrades[student.studentId] !== null
                                                                && localGrades[student.studentId] !== undefined
                                                                && localGrades[student.studentId] !== student.score ? (
                                                                <Chip
                                                                    label={t('viceGrades.unsaved', 'Unsaved')}
                                                                    size="small"
                                                                    sx={{ fontWeight: 700, bgcolor: alpha('#F59E0B', 0.12), color: '#F59E0B', fontSize: '0.65rem' }}
                                                                />
                                                            ) : localGrades[student.studentId] !== null ? (
                                                                <Chip
                                                                    label={t('viceGrades.saved', 'Saved')}
                                                                    size="small"
                                                                    sx={{ fontWeight: 700, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontSize: '0.65rem' }}
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label={t('viceGrades.empty', 'Empty')}
                                                                    size="small"
                                                                    sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.disabled', fontSize: '0.65rem' }}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!loading && grades.length > 0 && (
                            <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
                                <Alert
                                    severity={status === 'approved' ? 'success' : status === 'submitted' ? 'warning' : 'info'}
                                    sx={{ borderRadius: '16px', fontWeight: 500 }}
                                >
                                    {status === 'approved' 
                                        ? 'These grades have been approved and locked by the Admin. No further changes are allowed.'
                                        : status === 'submitted'
                                            ? isAdmin ? 'Grades have been submitted for your review. Click "Approve & Lock" to finalize them.' : 'Grades have been submitted and are pending Admin approval.'
                                            : isAdmin ? 'You are viewing a draft grade sheet. Admin cannot edit raw scores.' : 'After entering all grades, click Save Draft to keep progress, then Submit for Approval to finalize.'
                                    }
                                </Alert>
                            </Box>
                        )}
                    </Card>
                </Box>
            </Container>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} sx={{ borderRadius: '16px', fontWeight: 600 }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default function FinalGradesDashboard() {
    return (
        <Suspense fallback={<Container sx={{ py: 4 }} />}>
            <FinalGradesDashboardContent />
        </Suspense>
    );
}
