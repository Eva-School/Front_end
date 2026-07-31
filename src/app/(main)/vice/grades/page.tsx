'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Stack, Card, Button,
    Divider, Dialog, IconButton, alpha, Skeleton, Chip, Avatar, Alert,
    FormControl, Select, MenuItem, InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { API_BASE_URL, secureFetch } from '@/config/api.config';
import { AcademicYearsAPI, AcademicYearOption } from '@/data/academic-years.api';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
    id: string;
    teacherName: string;
    action: string;
    subject: string;
    className: string;
    level: string;
    timestamp: string;
}

interface DashboardData {
    totalStudents: number;
    totalSubjects: number;
    quarterGradesPending: number;
    finalGradesPending: number;
    lastUpdated: string;
    recentActivity: ActivityItem[];
}

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 15 } },
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string, language: 'en' | 'ar'): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (language === 'ar') {
        if (diff < 60) return 'الآن';
        if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
        if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
        return `منذ ${Math.floor(diff / 86400)} ي`;
    }
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 86400)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
    icon, value, label, color, loading,
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
    loading: boolean;
}) {
    const theme = useTheme();
    return (
        <Card
            component={motion.div}
            variants={itemVariants}
            whileHover={{ y: -6, boxShadow: `0 20px 48px ${alpha(color, 0.22)}` }}
            sx={{
                p: 3,
                borderRadius: '24px',
                backgroundColor: alpha(theme.palette.background.paper, 0.75),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(color, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
                transition: 'box-shadow 0.3s ease',
                flex: 1,
                minWidth: { xs: '100%', sm: '45%', md: '22%' },
            }}
        >
            <Stack spacing={2}>
                <Box
                    sx={{
                        width: 52, height: 52,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff',
                        boxShadow: `0 6px 16px ${alpha(color, 0.4)}`,
                    }}
                >
                    {icon}
                </Box>
                {loading ? (
                    <>
                        <Skeleton variant="text" width="60%" height={40} />
                        <Skeleton variant="text" width="80%" height={20} />
                    </>
                ) : (
                    <>
                        <Typography variant="h4" fontWeight={800} color="text.primary">
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {label}
                        </Typography>
                    </>
                )}
            </Stack>
        </Card>
    );
}

function ActivityRow({ item }: { item: ActivityItem }) {
    const theme = useTheme();
    const { language } = useLanguage();
    const initials = item.teacherName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const levelColor = item.level === 'senior' ? '#8B5CF6' : item.level === 'wheeler' ? '#06B6D4' : '#F59E0B';

    return (
        <Box
            sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 2, borderRadius: '16px',
                transition: 'background 0.2s ease',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
            }}
        >
            <Avatar
                sx={{
                    width: 42, height: 42, fontWeight: 700, fontSize: '0.9rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                }}
            >
                {initials}
            </Avatar>
            <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                    {item.teacherName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {item.action} · <b>{item.subject}</b> · Class {item.className}
                </Typography>
            </Box>
            <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
                <Chip
                    label={item.level}
                    size="small"
                    sx={{
                        fontSize: '0.65rem', fontWeight: 700, height: 20,
                        backgroundColor: alpha(levelColor, 0.12),
                        color: levelColor,
                        border: `1px solid ${alpha(levelColor, 0.25)}`,
                    }}
                />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: '0.7rem' }} />
                    {timeAgo(item.timestamp, language)}
                </Typography>
            </Stack>
        </Box>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ViceGradesDashboard() {
    const theme = useTheme();
    const { language, t } = useLanguage();
    const primary = theme.palette.primary.main;
    const [openTermModal, setOpenTermModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');

    useEffect(() => {
        AcademicYearsAPI.list()
            .then((years) => {
                setAcademicYears(years);
                const active = years.find((y) => y.isActive) || years[0];
                if (active && !selectedYear) {
                    setSelectedYear(active.yearName);
                }
            })
            .catch(() => {});
    }, [selectedYear]);

    useEffect(() => {
        setLoading(true);
        const query = selectedYear ? `?academicYear=${encodeURIComponent(selectedYear)}` : '';
        secureFetch<DashboardData>(`${API_BASE_URL}/vice/grades/dashboard${query}`)
            .then((json) => {
                setData(json);
                setError(null);
            })
            .catch((requestError: unknown) => {
                setData(null);
                setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard data.');
            })
            .finally(() => setLoading(false));
    }, [selectedYear]);

    const kpiCards = [
        { icon: <PeopleAltIcon />, value: data?.totalStudents ?? 0, label: t('viceGrades.totalStudents'), color: primary },
        { icon: <MenuBookIcon />, value: data?.totalSubjects ?? 0, label: t('viceGrades.totalSubjects'), color: '#8B5CF6' },
        { icon: <PendingActionsIcon />, value: data?.quarterGradesPending ?? 0, label: t('viceGrades.quarterPending'), color: '#F59E0B' },
        { icon: <CheckCircleOutlineIcon />, value: data?.finalGradesPending ?? 0, label: t('viceGrades.finalPending'), color: '#10B981' },
    ];

    const glassCard = {
        borderRadius: '28px',
        backgroundColor: alpha(theme.palette.background.paper, 0.75),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: 'hidden',
    };

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
            {/* Decorative background surfaces remain static to avoid perpetual repainting. */}
            <Box
                sx={{
                    position: 'absolute', top: '-15%', right: '-10%',
                    width: '60%', height: '60%',
                    background: `radial-gradient(circle, ${alpha(primary, 0.18)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute', bottom: '5%', left: '-8%',
                    width: '50%', height: '50%',
                    background: `radial-gradient(circle, ${alpha('#8B5CF6', 0.12)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Box
                    component={motion.div}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* ── Header with Academic Year Selector ── */}
                    <Box component={motion.div} variants={itemVariants} sx={{ mb: 5 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" gap={2}>
                            <Stack direction="row" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        width: 52, height: 52,
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${primary}, ${alpha(primary, 0.6)})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 8px 20px ${alpha(primary, 0.4)}`,
                                    }}
                                >
                                    <SchoolIcon sx={{ color: '#fff', fontSize: 26 }} />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="h3"
                                        fontWeight={800}
                                        sx={{
                                            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${primary})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {t('viceGrades.title')}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" fontWeight={500} mt={0.5}>
                                        {t('viceGrades.subtitle')}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Academic Year Selector */}
                            {academicYears.length > 0 && (
                                <FormControl
                                    size="small"
                                    sx={{
                                        minWidth: 200,
                                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                        backdropFilter: 'blur(16px)',
                                        borderRadius: '14px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '14px',
                                            fontWeight: 700,
                                            border: `1px solid ${alpha(primary, 0.3)}`,
                                            '&:hover fieldset': { borderColor: primary },
                                            '&.Mui-focused fieldset': { borderColor: primary },
                                        },
                                    }}
                                >
                                    <InputLabel id="academic-year-select-label" sx={{ fontWeight: 600 }}>
                                        {t('viceSettings.academicYear', 'Academic Year')}
                                    </InputLabel>
                                    <Select
                                        labelId="academic-year-select-label"
                                        value={selectedYear}
                                        label={t('viceSettings.academicYear', 'Academic Year')}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        startAdornment={<CalendarTodayIcon sx={{ fontSize: 18, color: primary, mr: 1 }} />}
                                    >
                                        {academicYears.map((item) => (
                                            <MenuItem key={item.yearName} value={item.yearName} sx={{ fontWeight: item.isActive ? 800 : 500 }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                                                    <span>{item.yearName.replace('-', ' – ')}</span>
                                                    {item.isActive && (
                                                        <Chip label={t('common.active', 'Active')} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', ml: 1 }} />
                                                    )}
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>
                    </Box>

                    {/* ── KPI Cards ── */}
                    <Box
                        component={motion.div}
                        variants={itemVariants}
                        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 5 }}
                    >
                        {kpiCards.map((card, i) => (
                            <KpiCard key={i} {...card} loading={loading} />
                        ))}
                    </Box>

                    {/* ── Main Grid: Action Cards + Recent Activity ── */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                            gap: 3,
                            mb: 3,
                        }}
                    >
                        {/* Action Cards */}
                        <Stack component={motion.div} variants={itemVariants} spacing={3}>
                            {/* Quarter Grades */}
                            <Card
                                component={motion.div}
                                whileHover={{ y: -4, boxShadow: `0 24px 56px ${alpha(primary, 0.18)}` }}
                                sx={{ ...glassCard, p: 3.5, transition: 'box-shadow 0.3s ease' }}
                            >
                                <Stack spacing={2.5}>
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 56, height: 56, borderRadius: '18px', flexShrink: 0,
                                                background: `linear-gradient(135deg, ${primary}, ${alpha(primary, 0.5)})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 8px 20px ${alpha(primary, 0.35)}`,
                                            }}
                                        >
                                            <AssignmentIcon sx={{ color: '#fff', fontSize: 28 }} />
                                        </Box>
                                        <Box flex={1}>
                                            <Typography variant="h5" fontWeight={800} color="text.primary">
                                                {t('viceGrades.quarterGrades')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {t('viceGrades.quarterSubtitle')}
                                            </Typography>
                                        </Box>
                                        {!loading && (
                                            <Chip
                                                label={`${data?.quarterGradesPending} ${t('viceGrades.pending')}`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    bgcolor: alpha('#F59E0B', 0.12),
                                                    color: '#F59E0B',
                                                    border: `1px solid ${alpha('#F59E0B', 0.3)}`,
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.08) }} />

                                    <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                                        {t('viceGrades.quarterDescription')}
                                    </Typography>

                                    <Button
                                        component={Link}
                                        href="/vice/grades/quarter"
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            background: `linear-gradient(45deg, ${primary}, ${alpha(primary, 0.7)})`,
                                            color: theme.palette.primary.contrastText,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderRadius: '14px',
                                            py: 1.5,
                                            boxShadow: `0 6px 20px ${alpha(primary, 0.35)}`,
                                            '&:hover': { boxShadow: `0 10px 30px ${alpha(primary, 0.5)}` },
                                        }}
                                    >
                                        {t('viceGrades.manageQuarter')}
                                    </Button>
                                </Stack>
                            </Card>

                            {/* Final Grades */}
                            <Card
                                component={motion.div}
                                whileHover={{ y: -4, boxShadow: `0 24px 56px ${alpha('#10B981', 0.18)}` }}
                                sx={{ ...glassCard, p: 3.5, transition: 'box-shadow 0.3s ease' }}
                            >
                                <Stack spacing={2.5}>
                                    <Stack direction="row" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 56, height: 56, borderRadius: '18px', flexShrink: 0,
                                                background: `linear-gradient(135deg, #10B981, ${alpha('#10B981', 0.5)})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 8px 20px ${alpha('#10B981', 0.35)}`,
                                            }}
                                        >
                                            <PlaylistAddCheckIcon sx={{ color: '#fff', fontSize: 28 }} />
                                        </Box>
                                        <Box flex={1}>
                                            <Typography variant="h5" fontWeight={800} color="text.primary">
                                                {t('viceGrades.finalGrades')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {t('viceGrades.finalSubtitle')}
                                            </Typography>
                                        </Box>
                                        {!loading && (
                                            <Chip
                                                label={`${data?.finalGradesPending} ${t('viceGrades.pending')}`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    bgcolor: alpha('#10B981', 0.12),
                                                    color: '#10B981',
                                                    border: `1px solid ${alpha('#10B981', 0.3)}`,
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.08) }} />

                                    <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                                        {t('viceGrades.finalDescription')}
                                    </Typography>

                                    <Button
                                        onClick={() => setOpenTermModal(true)}
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            background: `linear-gradient(45deg, #10B981, ${alpha('#10B981', 0.7)})`,
                                            color: '#fff',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderRadius: '14px',
                                            py: 1.5,
                                            boxShadow: `0 6px 20px ${alpha('#10B981', 0.35)}`,
                                            '&:hover': { boxShadow: `0 10px 30px ${alpha('#10B981', 0.5)}` },
                                        }}
                                    >
                                        {t('viceGrades.enterFinal')}
                                    </Button>
                                </Stack>
                            </Card>
                        </Stack>

                        {/* Recent Activity */}
                        <Card
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassCard,
                                p: 3.5,
                                display: 'flex',
                                flexDirection: 'column',
                                height: { xs: 500, md: 560 },
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                                <Typography variant="h6" fontWeight={800} color="text.primary">
                                    {t('viceGrades.recentActivity')}
                                </Typography>
                                {!loading && data?.lastUpdated && (
                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTimeIcon sx={{ fontSize: '0.8rem' }} />
                                        {t('viceGrades.updated')} {timeAgo(data.lastUpdated, language)}
                                    </Typography>
                                )}
                            </Stack>
                            <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.divider, 0.08) }} />

                            <Stack
                                spacing={0.5}
                                flex={1}
                                minHeight={0}
                                overflow="auto"
                                pr={0.75}
                                sx={{
                                    scrollbarWidth: 'thin',
                                    '&::-webkit-scrollbar': { width: 6 },
                                    '&::-webkit-scrollbar-thumb': {
                                        borderRadius: 8,
                                        backgroundColor: alpha(theme.palette.text.secondary, 0.28),
                                    },
                                }}
                            >
                                <>
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <Box key={i} sx={{ display: 'flex', gap: 2, p: 1.5, alignItems: 'center' }}>
                                                <Skeleton variant="circular" width={42} height={42} />
                                                <Box flex={1}>
                                                    <Skeleton variant="text" width="60%" />
                                                    <Skeleton variant="text" width="80%" />
                                                </Box>
                                            </Box>
                                        ))
                                    ) : data?.recentActivity?.length ? (
                                        data.recentActivity.map((item) => (
                                            <ActivityRow key={item.id} item={item} />
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 6 }}>
                                            <Typography color="text.disabled" fontWeight={500}>
                                                {t('viceGrades.noRecentActivity')}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            </Stack>
                        </Card>
                    </Box>
                </Box>
            </Container>

            {/* ── Select Term Modal ── */}
            <Dialog
                open={openTermModal}
                onClose={() => setOpenTermModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '28px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(32px)',
                        border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
                        boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.3)}`,
                        maxWidth: '480px',
                        width: '100%',
                        p: 1,
                    },
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: alpha(theme.palette.common.black, 0.5),
                    },
                }}
            >
                <Box sx={{ p: 3.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" fontWeight={800}>{t('viceGrades.selectSemester')}</Typography>
                        <IconButton
                            onClick={() => setOpenTermModal(false)}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.text.primary, 0.06), borderRadius: '10px' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        {t('viceGrades.selectSemesterDescription')}
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        {[1, 2].map((sem) => (
                            <Button
                                key={sem}
                                component={Link}
                                href={`/vice/grades/final?semester=${sem}`}
                                variant="contained"
                                startIcon={<AssignmentTurnedInIcon />}
                                fullWidth
                                sx={{
                                    background: `linear-gradient(135deg, #10B981, ${alpha('#10B981', 0.6)})`,
                                    color: '#fff',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    borderRadius: '16px',
                                    py: 2,
                                    fontSize: '1rem',
                                    boxShadow: `0 8px 24px ${alpha('#10B981', 0.35)}`,
                                    '&:hover': { boxShadow: `0 12px 32px ${alpha('#10B981', 0.5)}` },
                                }}
                            >
                                {t('viceGrades.semester')} {sem}
                            </Button>
                        ))}
                    </Stack>
                </Box>
            </Dialog>
        </Box>
    );
}
