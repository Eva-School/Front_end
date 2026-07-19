'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import {
    Box, Container, Typography, Stack, Card, alpha, Chip, Skeleton,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    Button, TextField, RadioGroup, FormControlLabel, Radio,
    Alert, Snackbar, CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL, secureFetch } from '@/config/api.config';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MaxQuarterGrades {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
}

interface StudentQuarterGrade {
    studentId: string;
    studentName: string;
    studentCode?: string;
    classId: number | string;
    q1: number | null;
    q2: number | null;
    q3: number | null;
    q4: number | null;
}

type GradeValues = Pick<StudentQuarterGrade, 'q1' | 'q2' | 'q3' | 'q4'>;
type ApiRecord = Record<string, unknown>;

const isApiRecord = (value: unknown): value is ApiRecord =>
    typeof value === 'object' && value !== null;

const getApiList = (value: unknown, keys: string[]): ApiRecord[] => {
    if (Array.isArray(value)) return value.filter(isApiRecord);
    if (!isApiRecord(value)) return [];
    for (const key of keys) {
        const candidate = value[key];
        if (Array.isArray(candidate)) return candidate.filter(isApiRecord);
    }
    return [];
};

const getNumberOrNull = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

const getIdentifier = (value: unknown, fallback: string | number): string | number =>
    typeof value === 'string' || typeof value === 'number' ? value : fallback;

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

function QuarterSubjectGradesContent() {
    const theme = useTheme();
    const { t } = useLanguage();
    const params = useParams();

    const level = typeof params?.level === 'string' ? params.level : 'junior';
    const subjectId = typeof params?.subject === 'string' ? decodeURIComponent(params.subject) : 'subject';
    const meta = LEVEL_META[level] ?? { color: '#F59E0B', emoji: '📚' };
    const primaryColor = meta.color;

    const [department, setDepartment] = useState('om');
    const [classId, setClassId] = useState('all');
    const [availableClasses, setAvailableClasses] = useState<{ id: string | number; name: string }[]>([]);

    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

    const [maxGrades, setMaxGrades] = useState<MaxQuarterGrades>({ q1: 25, q2: 25, q3: 25, q4: 25 });
    const [originalMaxGrades, setOriginalMaxGrades] = useState<MaxQuarterGrades>({ q1: 25, q2: 25, q3: 25, q4: 25 });
    const [students, setStudents] = useState<StudentQuarterGrade[]>([]);
    const [localGrades, setLocalGrades] = useState<Record<string, GradeValues>>({});
    
    const [loading, setLoading] = useState(true);
    const [savingMax, setSavingMax] = useState(false);
    const [savingStudents, setSavingStudents] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'warning' }>({
        open: false, msg: '', severity: 'success',
    });

    const API = API_BASE_URL;

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const classesData = await secureFetch(`${API}/Classes?yearId=${encodeURIComponent(level)}`).catch(() => []);
            const classesList = getApiList(classesData, ['value', 'data']);
            const mappedClasses = classesList.map((c) => ({
                id: getIdentifier(c.classId ?? c.id, ''),
                name: typeof (c.className ?? c.name) === 'string' ? (c.className ?? c.name) as string : `${t('quarterEntry.class')} ${String(c.classId ?? '')}`
            }));
            setAvailableClasses(mappedClasses);

            const params = new URLSearchParams({
                level,
                subjectId: String(Number(subjectId) || 0),
                department,
            });
            if (classId !== 'all') params.set('classId', classId);

            const sheetData = await secureFetch(`${API}/vice/grades/quarter/students?${params.toString()}`);
            const sheet = isApiRecord(sheetData) ? sheetData : {};
            const max = isApiRecord(sheet.maxQuarterGrades) ? sheet.maxQuarterGrades : {};
            const nextMaxGrades: MaxQuarterGrades = {
                q1: getNumberOrNull(max.q1) ?? 25,
                q2: getNumberOrNull(max.q2) ?? 25,
                q3: getNumberOrNull(max.q3) ?? 25,
                q4: getNumberOrNull(max.q4) ?? 25,
            };
            setMaxGrades(nextMaxGrades);
            setOriginalMaxGrades(nextMaxGrades);

            const studentsList = getApiList(sheet, ['students']);
            const formattedStudents: StudentQuarterGrade[] = studentsList.map((s) => ({
                studentId: String(s.studentId ?? s.id),
                studentName: typeof (s.studentName ?? s.fullName ?? s.name) === 'string' ? (s.studentName ?? s.fullName ?? s.name) as string : t('quarterEntry.unknownStudent'),
                studentCode: typeof s.studentCode === 'string' ? s.studentCode : '',
                classId: classId === 'all' ? '' : classId,
                q1: getNumberOrNull(s.q1),
                q2: getNumberOrNull(s.q2),
                q3: getNumberOrNull(s.q3),
                q4: getNumberOrNull(s.q4),
            }));

            setStudents(formattedStudents);

            const initial: Record<string, GradeValues> = {};
            formattedStudents.forEach((s) => { initial[s.studentId] = { q1: s.q1, q2: s.q2, q3: s.q3, q4: s.q4 }; });
            setLocalGrades(initial);

        } catch (error) {
            console.error("Failed to fetch data", error);
            setSnack({ open: true, msg: t('quarterEntry.failedLoad'), severity: 'error' });
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [level, subjectId, department, classId, API, t]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveMaxGrades = async () => {
        setSavingMax(true);
        try {
            await secureFetch(`${API}/vice/grades/quarter/subjects/${subjectId}/max-grades`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maxQuarterGrades: maxGrades }),
            });
            setOriginalMaxGrades(maxGrades);
            setSnack({ open: true, msg: t('quarterEntry.maxSaved'), severity: 'success' });
        } catch {
            setSnack({ open: true, msg: t('quarterEntry.networkError'), severity: 'error' });
        } finally {
            setSavingMax(false);
        }
    };

    const handleSaveStudents = async () => {
        setSavingStudents(true);
        
        // Find modified students
        const modifiedStudents = students.filter(student => {
            const current = localGrades[student.studentId];
            if (!current) return false;
            return (
                current.q1 !== student.q1 ||
                current.q2 !== student.q2 ||
                current.q3 !== student.q3 ||
                current.q4 !== student.q4
            );
        });

        if (modifiedStudents.length === 0) {
            setSavingStudents(false);
            return;
        }

        if (classId === 'all' || !Number.isInteger(Number(classId))) {
            setSnack({ open: true, msg: t('quarterEntry.selectClassWarning'), severity: 'warning' });
            setSavingStudents(false);
            return;
        }

        try {
            await secureFetch(`${API}/vice/grades/quarter/students`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level,
                    subjectId: Number(subjectId),
                    department,
                    classId: Number(classId),
                    students: modifiedStudents.map((student) => {
                        const current = localGrades[student.studentId];
                        return {
                            studentId: student.studentId,
                            q1: current.q1 ?? 0,
                            q2: current.q2 ?? 0,
                            q3: current.q3 ?? 0,
                            q4: current.q4 ?? 0,
                        };
                    }),
                }),
            });
            setSnack({ open: true, msg: t('quarterEntry.studentsSaved', { count: modifiedStudents.length }), severity: 'success' });
            setStudents((previous) => previous.map((student) => ({ ...student, ...localGrades[student.studentId] })));
        } catch {
            setSnack({ open: true, msg: t('quarterEntry.networkError'), severity: 'error' });
        } finally {
            setSavingStudents(false);
        }
    };

    const levelLabel = t(`vice.${level}`, level.charAt(0).toUpperCase() + level.slice(1));
    const subjectLabel = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);

    const isMaxGradesChanged = JSON.stringify(maxGrades) !== JSON.stringify(originalMaxGrades);

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
                            href={`/vice/grades/quarter/${level}`}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
                        >
                            <Box
                                component={motion.div}
                                whileHover={{ x: -4 }}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}
                            >
                                <ArrowBackIcon fontSize="small" />
                                <Typography variant="body2" fontWeight={600} color="inherit">{t('quarterEntry.backToSubjects')}</Typography>
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
                                            {subjectLabel} {t('quarterEntry.setup')}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" gap={1} mt={0.5}>
                                        <Chip
                                            label={meta.emoji + ' ' + levelLabel}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: alpha(meta.color, 0.1), color: meta.color }}
                                        />
                                        <Chip
                                            label={t('viceGrades.quarterGrades')}
                                            size="small"
                                            sx={{ fontWeight: 700, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>

                    <Stack spacing={4}>
                        {/* Max Grades Setup Card (VP Role) */}
                        <Card
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                borderRadius: '24px',
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(primaryColor, 0.3)}`,
                                boxShadow: `0 12px 48px ${alpha(primaryColor, 0.08)}`,
                                p: { xs: 3, md: 4 },
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.05, transform: 'rotate(15deg)' }}>
                                <AutoAwesomeIcon sx={{ fontSize: 200, color: primaryColor }} />
                            </Box>
                            
                            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" mb={3} gap={2}>
                                <Box>
                                    <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
                                        {t('quarterEntry.maxSetup')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500} maxWidth={600}>
                                        {t('quarterEntry.maxSetupDescription')}
                                    </Typography>
                                </Box>
                                <Button
                                    onClick={handleSaveMaxGrades}
                                    disabled={savingMax || !isMaxGradesChanged || isAdmin}
                                    variant="contained"
                                    startIcon={savingMax ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                    sx={{
                                        background: (isMaxGradesChanged && !isAdmin) ? `linear-gradient(45deg, ${primaryColor}, ${alpha(primaryColor, 0.7)})` : alpha(theme.palette.action.disabledBackground, 0.2),
                                        color: (isMaxGradesChanged && !isAdmin) ? '#fff' : theme.palette.text.disabled,
                                        fontWeight: 700, textTransform: 'none',
                                        borderRadius: '12px', px: 3, py: 1.2,
                                        boxShadow: isMaxGradesChanged ? `0 6px 20px ${alpha(primaryColor, 0.35)}` : 'none',
                                        flexShrink: 0,
                                    }}
                                >
                                    {savingMax ? t('common.saving', 'Saving...') : t('quarterEntry.saveMaxGrades')}
                                </Button>
                            </Stack>

                            <Stack direction="row" flexWrap="wrap" gap={3}>
                                {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                                    <Box key={q} sx={{ flex: '1 1 200px' }}>
                                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
                                            {t('quarterEntry.quarter')} {i + 1} — {t('quarterEntry.maxScore')}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            value={maxGrades[q] || ''}
                                            disabled={isAdmin}
                                            onChange={(e) => setMaxGrades({ ...maxGrades, [q]: Number(e.target.value) })}
                                            inputProps={{ min: 1, style: { fontWeight: 800, fontSize: '1.2rem' } }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '16px',
                                                    backgroundColor: alpha(primaryColor, 0.04),
                                                    '& fieldset': { borderColor: alpha(primaryColor, 0.2) },
                                                    '&:hover fieldset': { borderColor: primaryColor },
                                                    '&.Mui-focused fieldset': { borderColor: primaryColor },
                                                },
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Card>

                        {/* Students Filter + Table Card */}
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
                            {/* Filter Bar */}
                            <Box sx={{ px: 4, py: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                                    <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap">
                                        <Typography variant="h6" fontWeight={800} color="text.primary">
                                            {t('quarterEntry.studentRecords')}
                                        </Typography>
                                        
                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                {t('quarterEntry.department')}:
                                            </Typography>
                                            <RadioGroup row value={department} onChange={(e) => setDepartment(e.target.value)}>
                                                {['om', 'sd'].map((dep) => (
                                                    <FormControlLabel
                                                        key={dep} value={dep}
                                                        control={<Radio size="small" sx={{ color: alpha(primaryColor, 0.4), '&.Mui-checked': { color: primaryColor } }} />}
                                                        label={<Typography variant="body2" fontWeight={700} textTransform="uppercase">{dep}</Typography>}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" gap={1.5}>
                                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                {t('quarterEntry.class')}:
                                            </Typography>
                                            <RadioGroup row value={classId} onChange={(e) => setClassId(e.target.value)}>
                                                <FormControlLabel value="all" control={<Radio size="small" sx={{ color: alpha(primaryColor, 0.4), '&.Mui-checked': { color: primaryColor } }} />} label={<Typography variant="body2" fontWeight={700}>{t('quarterEntry.allClasses')}</Typography>} />
                                                {availableClasses.map((cls) => (
                                                    <FormControlLabel 
                                                        key={cls.id} 
                                                        value={String(cls.id)} 
                                                        control={<Radio size="small" sx={{ color: alpha(primaryColor, 0.4), '&.Mui-checked': { color: primaryColor } }} />} 
                                                        label={<Typography variant="body2" fontWeight={700}>{cls.name}</Typography>} 
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </Stack>
                                    </Stack>

                                    <Button
                                        onClick={handleSaveStudents}
                                        disabled={savingStudents || isAdmin}
                                        variant="outlined"
                                        startIcon={savingStudents ? <CircularProgress size={16} /> : <SaveIcon />}
                                        sx={{
                                            fontWeight: 700, textTransform: 'none',
                                            borderColor: alpha(primaryColor, 0.4), color: primaryColor,
                                            borderRadius: '12px', px: 3,
                                            '&:hover': { borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.06) },
                                        }}
                                    >
                                        {savingStudents ? t('common.saving', 'Saving...') : t('quarterEntry.saveStudentGrades')}
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Table */}
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: `linear-gradient(90deg, ${alpha(primaryColor, 0.1)}, ${alpha(meta.color, 0.08)})` }}>
                                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary', border: 'none', py: 2 }}>#</TableCell>
                                            <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary', border: 'none', py: 2 }}>{t('quarterEntry.studentName')}</TableCell>
                                            {(['q1', 'q2', 'q3', 'q4'] as const).map((q, i) => (
                                                <TableCell key={q} align="center" sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary', border: 'none', py: 2 }}>
                                                    {t('quarterEntry.quarter')} {i + 1}
                                                    <Typography component="span" display="block" variant="caption" color="text.secondary" fontWeight={600}>
                                                        {t('quarterEntry.max')}: {originalMaxGrades[q]}
                                                    </Typography>
                                                </TableCell>
                                            ))}
                                            <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'text.primary', border: 'none', py: 2 }}>{t('quarterEntry.status')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <AnimatePresence>
                                            {loading
                                                ? Array.from({ length: 5 }).map((_, i) => (
                                                    <TableRow key={i}>
                                                        {Array.from({ length: 7 }).map((_, j) => (
                                                            <TableCell key={j}><Skeleton variant="text" width={j === 1 ? '80%' : '60%'} /></TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                                : students.length === 0
                                                    ? (
                                                        <TableRow>
                                                            <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                                                <Typography color="text.disabled" fontWeight={500}>
                                                                    {t('quarterEntry.noStudents')}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                    : students.map((student, i) => {
                                                        const isModified = 
                                                            localGrades[student.studentId]?.q1 !== student.q1 ||
                                                            localGrades[student.studentId]?.q2 !== student.q2 ||
                                                            localGrades[student.studentId]?.q3 !== student.q3 ||
                                                            localGrades[student.studentId]?.q4 !== student.q4;

                                                        const hasAnyGrade = 
                                                            localGrades[student.studentId]?.q1 !== null ||
                                                            localGrades[student.studentId]?.q2 !== null ||
                                                            localGrades[student.studentId]?.q3 !== null ||
                                                            localGrades[student.studentId]?.q4 !== null;

                                                        return (
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
                                                                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.disabled', width: 48 }}>{i + 1}</TableCell>
                                                                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                                    {student.studentName}
                                                                    {student.studentCode && (
                                                                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.disabled' }}>
                                                                            ({student.studentCode})
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>

                                                                {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
                                                                    <TableCell key={q} align="center">
                                                                        <TextField
                                                                            type="number"
                                                                            variant="outlined"
                                                                            size="small"
                                                                            value={localGrades[student.studentId]?.[q] ?? ''}
                                                                            disabled={isAdmin}
                                                                            onChange={(e) => {
                                                                                let val = e.target.value === '' ? null : Number(e.target.value);
                                                                                if (val !== null && val > originalMaxGrades[q]) val = originalMaxGrades[q];
                                                                                if (val !== null && val < 0) val = 0;
                                                                                
                                                                                setLocalGrades((prev) => ({
                                                                                    ...prev,
                                                                                    [student.studentId]: { ...prev[student.studentId], [q]: val }
                                                                                }));
                                                                            }}
                                                                            inputProps={{ min: 0, max: originalMaxGrades[q], style: { textAlign: 'center', fontWeight: 700 } }}
                                                                            sx={{
                                                                                width: 80,
                                                                                '& .MuiOutlinedInput-root': {
                                                                                    borderRadius: '10px',
                                                                                    '& fieldset': { borderColor: alpha(primaryColor, 0.25) },
                                                                                    '&:hover fieldset': { borderColor: primaryColor },
                                                                                    '&.Mui-focused fieldset': { borderColor: primaryColor },
                                                                                },
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                ))}

                                                                <TableCell align="center">
                                                                    {isModified ? (
                                                                        <Chip label={t('quarterEntry.unsaved')} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#F59E0B', 0.12), color: '#F59E0B', fontSize: '0.65rem' }} />
                                                                    ) : hasAnyGrade ? (
                                                                        <Chip label={t('quarterEntry.saved')} size="small" sx={{ fontWeight: 700, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontSize: '0.65rem' }} />
                                                                    ) : (
                                                                        <Chip label={t('quarterEntry.empty')} size="small" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.disabled', fontSize: '0.65rem' }} />
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Stack>
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

export default function QuarterSubjectGrades() {
    return (
        <Suspense fallback={<Container sx={{ py: 4 }} />}>
            <QuarterSubjectGradesContent />
        </Suspense>
    );
}
