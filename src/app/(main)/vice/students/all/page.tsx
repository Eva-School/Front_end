"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Stack, Card, RadioGroup, FormControlLabel, Radio,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Paper, CircularProgress, Alert, useTheme, alpha, Button, FormControl, InputLabel,
  MenuItem, Select
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import SchoolIcon from '@mui/icons-material/School';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ViceStudentsAPI } from '@/data/vice-students.api';
import { AcademicYearsAPI, type AcademicYearOption } from '@/data/academic-years.api';
import type { CreateViceStudentPayload, ViceStudent, ViceDepartment, ViceLevel } from '@/types/vice/students';
import { appToast } from '@/hooks/useAppToast';
import EditStudentModal from '@/components/vice/students/EditStudentModal';
import BulkImportModal from '@/components/vice/students/BulkImportModal';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from 'next-intl';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const levelTranslationKeys = {
  junior: 'students.levelJunior',
  wheeler: 'students.levelWheeler',
  senior: 'students.levelSenior',
} as const;

export default function AllStudentsPage() {
  const router = useRouter();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const { dir } = useLanguage();
  const t = useTranslations();
  const BackIcon = dir === 'rtl' ? ArrowForwardIcon : ArrowBackIcon;

  const [students, setStudents] = useState<ViceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingStudent, setEditingStudent] = useState<ViceStudent | null>(null);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  const [departmentFilter, setDepartmentFilter] = useState<ViceDepartment>('OM');
  const [levelFilter, setLevelFilter] = useState<ViceLevel>('junior');
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [academicYearName, setAcademicYearName] = useState('');

  useEffect(() => {
    let active = true;

    void AcademicYearsAPI.list()
      .then((years) => {
        if (!active) return;
        setAcademicYears(years);
        setAcademicYearName((current) => current || years.find((year) => year.isActive)?.yearName || years[0]?.yearName || '');
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : t('students.failedLoadYears'));
      });

    return () => { active = false; };
  }, [t]);

  const fetchStudents = useCallback(async () => {
    if (!academicYearName) {
      setStudents([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await ViceStudentsAPI.list({
        year: levelFilter,
        department: departmentFilter,
        academicYearName,
      });
      setStudents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('students.failedLoadStudents'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [academicYearName, levelFilter, departmentFilter, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchStudents();
    });
  }, [fetchStudents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('students.unassignConfirm'))) return;
    try {
      await ViceStudentsAPI.assignClass(id, null);
      appToast.success(t('students.studentUnassigned'));
      fetchStudents();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : t('students.failedUnassign'));
    }
  };

  const handleEditSubmit = async (payload: CreateViceStudentPayload) => {
    if (!editingStudent) return;
    try {
        await ViceStudentsAPI.update(editingStudent.id, payload);
        appToast.success(t('students.studentUpdated'));
        fetchStudents();
        setEditingStudent(null);
    } catch (e: unknown) {
        throw e; // rethrow to be caught by the modal
    }
  };

  const glassCardSx = {
    p: { xs: 3, md: 4 },
    borderRadius: '24px',
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: 'blur(24px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`,
  };

  return (
    <Box dir={dir} sx={{ position: 'relative', minHeight: '100vh', pb: 8, bgcolor: theme.palette.background.default, overflow: 'hidden' }}>
      {/* Animated BG */}
      <Box
        component={motion.div}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        sx={{
          position: 'absolute', top: '-20%', right: '-10%', width: '100%', height: '100%',
          background: `radial-gradient(circle at 70% 30%, ${alpha(primary, 0.15)}, transparent 50%)`,
          zIndex: 0, pointerEvents: 'none',
        }}
      />

      <Box sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: dir === 'rtl' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <IconButton onClick={() => router.back()} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
              <BackIcon />
            </IconButton>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${primary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('students.allDashboard')}
            </Typography>
          </Box>

          <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
            <Card sx={glassCardSx}>
              <Stack spacing={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 44, height: 44,
                      background: `linear-gradient(135deg, ${primary}, ${theme.palette.secondary?.main || primary})`,
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: theme.palette.primary.contrastText,
                      boxShadow: `0 4px 12px ${alpha(primary, 0.4)}`,
                    }}>
                      <SchoolIcon />
                    </Box>
                    <Typography variant="h5" fontWeight={800}>
                      {t('students.studentsDirectory')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => setIsBulkImportModalOpen(true)}
                      sx={{
                        borderColor: primary,
                        color: primary,
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        px: 2.5,
                      }}
                    >
                      {t('students.importExcel')}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/vice/students/promote')}
                      sx={{
                        background: `linear-gradient(45deg, ${primary}, ${theme.palette.secondary?.main || primary})`,
                        color: '#fff',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        px: 3,
                      }}
                    >
                      {t('students.promoteStudents')}
                    </Button>
                  </Box>
                </Box>

                {/* Filters */}
                <Box sx={{
                  display: 'flex', flexWrap: 'wrap', gap: 4,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="all-students-academic-year-label">{t('students.academicYear')}</InputLabel>
                    <Select
                      labelId="all-students-academic-year-label"
                      value={academicYearName}
                      label={t('students.academicYear')}
                      onChange={(event) => setAcademicYearName(event.target.value)}
                    >
                      {academicYears.map((year) => (
                        <MenuItem key={year.yearName} value={year.yearName}>
                          {year.yearName}{year.isActive ? ` (${t('students.currentYear')})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{t('students.department')}</Typography>
                    <RadioGroup row value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value as ViceDepartment)}>
                      <FormControlLabel value="OM" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.95rem">OM</Typography>} />
                      <FormControlLabel value="SD" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.95rem">SD</Typography>} />
                    </RadioGroup>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{t('students.level')}</Typography>
                    <RadioGroup row value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as ViceLevel)}>
                      {(['junior', 'wheeler', 'senior'] as ViceLevel[]).map((lv) => (
                        <FormControlLabel key={lv} value={lv}
                          control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />}
                          label={<Typography fontWeight={600} fontSize="0.95rem">{t(levelTranslationKeys[lv])}</Typography>}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                </Box>

                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                <TableContainer component={Paper} elevation={0} sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(primary, 0.1) }}>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.studentName')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.studentCode')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.address')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.department')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.academicYear')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>{t('students.class')}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }} align={dir === 'rtl' ? 'left' : 'right'}>{t('students.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                              <CircularProgress color="primary" />
                            </TableCell>
                          </TableRow>
                        ) : students.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                {t('students.noStudentsForFilter')}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          students.map((student) => (
                            <TableRow
                              component={motion.tr}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              key={student.id}
                              sx={{
                                '&:last-child td': { border: 0 },
                                transition: 'background-color 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.8) }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.name}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.studentCode || '-'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 500, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.address || '-'}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: primary, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.department}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.academicYearName || academicYearName}
                              </TableCell>
                              <TableCell sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.className ? (
                                  <Box sx={{
                                    display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '8px',
                                    bgcolor: alpha(theme.palette.success.main, 0.15),
                                    color: theme.palette.success.main,
                                    fontWeight: 700, fontSize: '0.85rem'
                                  }}>
                                    {student.className}
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{t('students.unassigned')}</Typography>
                                )}
                              </TableCell>
                              <TableCell align={dir === 'rtl' ? 'left' : 'right'} sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                <Stack direction="row" spacing={1} justifyContent={dir === 'rtl' ? 'flex-start' : 'flex-end'}>
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingStudent(student)}
                                    sx={{ color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.1) }}
                                    title={t('students.editStudent')}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  {student.className && (
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDelete(student.id)}
                                        sx={{ color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }}
                                        title={t('students.unassignStudent')}
                                      >
                                        <LinkOffIcon fontSize="small" />
                                      </IconButton>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Edit Student Modal */}
      <EditStudentModal
          open={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
          onSubmit={handleEditSubmit}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        year={levelFilter}
        department={departmentFilter}
        academicYearName={academicYearName}
        onSuccess={fetchStudents}
      />
    </Box>
  );
}
