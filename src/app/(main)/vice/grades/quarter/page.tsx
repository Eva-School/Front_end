'use client';

import React from 'react';
import { Box, Container, Typography, Stack, Card, alpha, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 15 } },
};

export default function ViceGradesQuarterPage() {
    const theme = useTheme();
    const { t } = useLanguage();
    const primary = theme.palette.primary.main;
    const levels = [
        { id: 'junior', emoji: '🌱', color: '#F59E0B' },
        { id: 'wheeler', emoji: '⚡', color: '#06B6D4' },
        { id: 'senior', emoji: '🎓', color: '#8B5CF6' },
    ];

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
                animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                sx={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: '55%', height: '55%',
                    background: `radial-gradient(circle, ${alpha(primary, 0.16)}, transparent 65%)`,
                    zIndex: 0, pointerEvents: 'none',
                }}
            />
            <Box
                component={motion.div}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                sx={{
                    position: 'absolute', bottom: '0%', left: '-5%',
                    width: '45%', height: '45%',
                    background: `radial-gradient(circle, ${alpha('#8B5CF6', 0.1)}, transparent 65%)`,
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
                            href="/vice/grades"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
                        >
                            <Box
                                component={motion.div}
                                whileHover={{ x: -4 }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600, fontSize: '0.9rem',
                                    transition: 'color 0.2s',
                                    '&:hover': { color: primary },
                                }}
                            >
                                <ArrowBackIcon fontSize="small" />
                                <Typography variant="body2" fontWeight={600} color="inherit">{t('gradeSelection.backToDashboard')}</Typography>
                            </Box>
                        </Link>

                        <Stack direction="row" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 52, height: 52, borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${primary}, ${alpha(primary, 0.6)})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 8px 20px ${alpha(primary, 0.4)}`,
                                }}
                            >
                                <AssignmentIcon sx={{ color: '#fff', fontSize: 26 }} />
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
                                    {t('viceGrades.quarterGrades')}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight={500} mt={0.5}>
                                    {t('gradeSelection.quarterSubtitle')}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Level Cards */}
                    <Stack spacing={2.5}>
                        {levels.map((level, i) => (
                            <Box
                                key={level.id}
                                component={motion.div}
                                variants={itemVariants}
                                custom={i}
                            >
                                <motion.div
                                    whileHover={{ y: -5, boxShadow: `0 24px 56px ${alpha(level.color, 0.2)}` }}
                                    style={{ display: 'block', borderRadius: 24 }}
                                >
                                    <Link
                                        href={`/vice/grades/quarter/${level.id}`}
                                        style={{ textDecoration: 'none', display: 'block' }}
                                    >
                                    <Card
                                        sx={{
                                            p: 3.5,
                                            borderRadius: '24px',
                                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                            backdropFilter: 'blur(20px)',
                                            border: `1px solid ${alpha(level.color, 0.2)}`,
                                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
                                            cursor: 'pointer',
                                            transition: 'box-shadow 0.3s ease',
                                        }}
                                    >
                                    <Stack direction="row" alignItems="center" spacing={3}>
                                        <Box
                                            sx={{
                                                width: 64, height: 64, borderRadius: '20px',
                                                background: `linear-gradient(135deg, ${level.color}, ${alpha(level.color, 0.5)})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.8rem',
                                                boxShadow: `0 8px 24px ${alpha(level.color, 0.4)}`,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {level.emoji}
                                        </Box>

                                        <Box flex={1}>
                                            <Stack direction="row" alignItems="center" gap={1.5} mb={0.5}>
                                                <Typography variant="h5" fontWeight={800} color="text.primary">
                                                    {t(`vice.${level.id}`)}
                                                </Typography>
                                                <Chip
                                                    label={t('viceGrades.quarterGrades')}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.7rem', fontWeight: 700,
                                                        bgcolor: alpha(level.color, 0.12),
                                                        color: level.color,
                                                        border: `1px solid ${alpha(level.color, 0.25)}`,
                                                    }}
                                                />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {t(`gradeSelection.${level.id}Description`)}
                                            </Typography>
                                        </Box>

                                        <Box
                                            component={motion.div}
                                            whileHover={{ x: 4 }}
                                            sx={{ color: level.color, display: 'flex', alignItems: 'center' }}
                                        >
                                            <ArrowForwardIcon />
                                        </Box>
                                    </Stack>
                                    </Card>
                                    </Link>
                                </motion.div>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
