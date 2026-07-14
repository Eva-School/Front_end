'use client';

import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Stack, Card, alpha, Chip, Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { API_BASE_URL, secureFetch } from '@/config/api.config';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 15 } },
};

interface SubjectItem {
    id: string;
    name: string;
    studentsCount?: number;
    gradeType?: 'academic' | 'competency';
}

type ApiRecord = Record<string, unknown>;

const isApiRecord = (value: unknown): value is ApiRecord =>
    typeof value === 'object' && value !== null;

const getApiList = (value: unknown): ApiRecord[] => {
    if (Array.isArray(value)) return value.filter(isApiRecord);
    if (!isApiRecord(value)) return [];
    for (const key of ['value', 'data', 'subjects']) {
        const candidate = value[key];
        if (Array.isArray(candidate)) return candidate.filter(isApiRecord);
    }
    return [];
};

const LEVEL_META: Record<string, { color: string; emoji: string }> = {
    junior:  { color: '#F59E0B', emoji: '🌱' },
    wheeler: { color: '#06B6D4', emoji: '⚡' },
    senior:  { color: '#8B5CF6', emoji: '🎓' },
};

const FALLBACK_SUBJECTS: SubjectItem[] = [
    { id: 'arabic',        name: 'Arabic',        gradeType: 'academic' },
    { id: 'english',       name: 'English',       gradeType: 'academic' },
    { id: 'math',          name: 'Math',          gradeType: 'academic' },
    { id: 'social-studies',name: 'Social Studies',gradeType: 'academic' },
    { id: 'physics',       name: 'Physics',       gradeType: 'academic' },
    { id: 'mechanics',     name: 'Mechanics',     gradeType: 'academic' },
    { id: 'religion',      name: 'Religion',      gradeType: 'academic' },
    { id: 'other',         name: 'Other',         gradeType: 'competency' },
];

export default function SubjectSelectionPage() {
    const theme = useTheme();
    const params = useParams();
    const level = typeof params?.level === 'string' ? params.level : 'junior';
    const meta = LEVEL_META[level] ?? { color: theme.palette.primary.main, emoji: '📚' };

    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);

    const API = API_BASE_URL;

    useEffect(() => {
        secureFetch(`${API}/Subjects?year=${encodeURIComponent(level)}`)
            .then((data) => {
                const list = getApiList(data);
                
                if (list.length > 0) {
                    setSubjects(list.map((s) => ({
                        id: String(s.id ?? s.subjectId),
                        name: typeof (s.subjectName ?? s.name) === 'string' ? (s.subjectName ?? s.name) as string : 'Unknown',
                        gradeType: typeof s.subjectName === 'string' && s.subjectName.toLowerCase().includes('jadarat') ? 'competency' : 'academic'
                    })));
                } else {
                    setSubjects(FALLBACK_SUBJECTS);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch subjects:", error);
                setSubjects(FALLBACK_SUBJECTS);
            })
            .finally(() => setLoading(false));
    }, [level, API]);

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
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                sx={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: '55%', height: '55%',
                    background: `radial-gradient(circle, ${alpha(meta.color, 0.15)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />
            <Box
                component={motion.div}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                sx={{
                    position: 'absolute', bottom: '0', left: '-5%',
                    width: '40%', height: '40%',
                    background: `radial-gradient(circle, ${alpha(meta.color, 0.08)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    component={motion.div}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <Box component={motion.div} variants={itemVariants} sx={{ mb: 5 }}>
                        <Link
                            href="/vice/grades/quarter"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
                        >
                            <Box
                                component={motion.div}
                                whileHover={{ x: -4 }}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}
                            >
                                <ArrowBackIcon fontSize="small" />
                                <Typography variant="body2" fontWeight={600} color="inherit">Back to Levels</Typography>
                            </Box>
                        </Link>

                        <Stack direction="row" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 56, height: 56, borderRadius: '18px',
                                    background: `linear-gradient(135deg, ${meta.color}, ${alpha(meta.color, 0.55)})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem',
                                    boxShadow: `0 8px 24px ${alpha(meta.color, 0.4)}`,
                                }}
                            >
                                {meta.emoji}
                            </Box>
                            <Box>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Typography
                                        variant="h3"
                                        fontWeight={800}
                                        sx={{
                                            background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${meta.color})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {levelLabel}
                                    </Typography>
                                    <Chip
                                        label="Quarter Grades"
                                        size="small"
                                        sx={{
                                            fontWeight: 700, bgcolor: alpha(meta.color, 0.12),
                                            color: meta.color, border: `1px solid ${alpha(meta.color, 0.3)}`,
                                        }}
                                    />
                                </Stack>
                                <Typography variant="body1" color="text.secondary" fontWeight={500} mt={0.5}>
                                    Select a subject to manage quarter grade entries
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Subject Grid */}
                    <Box
                        component={motion.div}
                        variants={containerVariants}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' },
                            gap: 2.5,
                        }}
                    >
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: '20px' }} />
                            ))
                            : subjects.map((subject) => (
                                <Box key={subject.id} component={motion.div} variants={itemVariants}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        style={{ borderRadius: 20 }}
                                    >
                                        <Link
                                            href={`/vice/grades/quarter/${level}/${subject.id}`}
                                            style={{ textDecoration: 'none', display: 'block' }}
                                        >
                                        <Card
                                            sx={{
                                                p: 2.5,
                                                borderRadius: '20px',
                                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                                backdropFilter: 'blur(20px)',
                                                border: `1px solid ${alpha(meta.color, 0.15)}`,
                                                boxShadow: `0 6px 24px ${alpha(theme.palette.common.black, 0.05)}`,
                                                cursor: 'pointer',
                                                transition: 'box-shadow 0.3s ease',
                                                '&:hover': { boxShadow: `0 20px 48px ${alpha(meta.color, 0.2)}` },
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={2.5}>
                                                <Box
                                                    sx={{
                                                        width: 50, height: 50, borderRadius: '16px',
                                                        background: `linear-gradient(135deg, ${meta.color}, ${alpha(meta.color, 0.5)})`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: `0 6px 16px ${alpha(meta.color, 0.35)}`,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <MenuBookIcon sx={{ color: '#fff', fontSize: 22 }} />
                                                </Box>

                                                <Box flex={1}>
                                                    <Typography variant="h6" fontWeight={800} color="text.primary">
                                                        {subject.name}
                                                    </Typography>
                                                    {subject.studentsCount !== undefined && (
                                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                            {subject.studentsCount} students
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {subject.gradeType && (
                                                    <Chip
                                                        label={subject.gradeType === 'competency' ? 'Jadarat' : 'Academic'}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.65rem', fontWeight: 700,
                                                            bgcolor: subject.gradeType === 'competency'
                                                                ? alpha('#8B5CF6', 0.1)
                                                                : alpha(meta.color, 0.1),
                                                            color: subject.gradeType === 'competency' ? '#8B5CF6' : meta.color,
                                                        }}
                                                    />
                                                )}

                                                <Box
                                                    component={motion.div}
                                                    whileHover={{ x: 4 }}
                                                    sx={{ color: alpha(meta.color, 0.7), display: 'flex', alignItems: 'center' }}
                                                >
                                                    <ArrowForwardIcon fontSize="small" />
                                                </Box>
                                            </Stack>
                                        </Card>
                                        </Link>
                                    </motion.div>
                                </Box>
                            ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
