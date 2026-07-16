'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Typography, Stack, Button, Card,
  MenuItem, Select, FormControl, InputLabel, TextField,
  RadioGroup, FormControlLabel, Radio, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, useTheme, alpha, Checkbox,
  Chip, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AddStudentModal from '@/components/vice/students/AddStudentModal';
import { ClassesAPI } from '@/data/classes.api';
import { ViceStudentsAPI } from '@/data/vice-students.api';
import { AcademicYearsAPI, type AcademicYearOption } from '@/data/academic-years.api';
import type { Class } from '@/types/subject.types';
import type { ViceDepartment, ViceLevel, ViceStudent } from '@/types/vice/students';
import { useLanguage } from '@/context/LanguageContext';
import LoadingRegion from '@/components/a11y/LoadingRegion';
import { appToast } from '@/hooks/useAppToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

export default function ViceStudentsPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary?.main || primary;

  // Modal state
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Filters
  const [academicYear, setAcademicYear] = useState<string>('');
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [department, setDepartment] = useState<ViceDepartment>('OM');
  const [level, setLevel] = useState<ViceLevel>('junior');

  // Classes
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Create class
  const [className, setClassName] = useState('');
  const [creatingClass, setCreatingClass] = useState(false);
  const [creatingClassError, setCreatingClassError] = useState<string | null>(null);

  // Pool students (no class assigned)
  const [poolStudents, setPoolStudents] = useState<ViceStudent[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  // Selection for assigning to class
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const canCreateClass = useMemo(
    () => !!academicYear && !!department && !!className.trim(),
    [className, department, academicYear]
  );

  useEffect(() => {
    let active = true;
    void AcademicYearsAPI.list()
      .then((years) => {
        if (!active) return;
        queueMicrotask(() => {
          setAcademicYears(years);
          setAcademicYear((current) => current || years.find((year) => year.isActive)?.yearName || years[0]?.yearName || '');
        });
      })
      .catch(() => {
        if (active) appToast.error(t('academicYears.loadFailed', 'Unable to load academic years.'));
      });

    return () => { active = false; };
  }, [t]);

  /* ── Load Classes ── */
  const loadClasses = useCallback(async () => {
    if (!academicYear) {
      setClasses([]);
      return;
    }
    setClassesError(null);
    setClassesLoading(true);
    try {
      const data = await ClassesAPI.getByYear(academicYear, level);
      setClasses(data);
    } catch (e: unknown) {
      setClassesError(e instanceof Error ? e.message : t('students.failedLoadClasses', 'Failed to load classes'));
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, [academicYear, level, t]);

  /* ── Load Pool Students (unassigned — no classId) ── */
  const loadPoolStudents = useCallback(async () => {
    setPoolError(null);
    setPoolLoading(true);
    try {
      const data = await ViceStudentsAPI.list({ year: level, department, unassigned: true });
      setPoolStudents(data);
    } catch (e: unknown) {
      setPoolError(e instanceof Error ? e.message : t('students.failedLoadStudents', 'Failed to load students'));
      setPoolStudents([]);
    } finally {
      setPoolLoading(false);
    }
    setSelectedStudentIds(new Set());
  }, [level, department, t]);

  useEffect(() => {
    loadClasses();
    setSelectedClassId(null);
  }, [academicYear, loadClasses]);

  useEffect(() => {
    loadPoolStudents();
  }, [level, department, loadPoolStudents]);

  /* ── Create Class ── */
  const handleCreateClass = async () => {
    setCreatingClassError(null);
    if (!canCreateClass) {
      setCreatingClassError(t('students.fillClassFields', 'Please fill required class fields'));
      return;
    }
    setCreatingClass(true);
    try {
      const created = await ClassesAPI.create({ yearId: academicYear, stage: level, department, className: className.trim() });
      setClassName('');
      await loadClasses();
      setSelectedClassId(created.classId);
      appToast.success(t('students.classCreated', 'Class created!'));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('students.failedCreateClass', 'Failed to create class');
      setCreatingClassError(msg);
      appToast.error(msg);
    } finally {
      setCreatingClass(false);
    }
  };

  /* ── Toggle student selection ── */
  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === poolStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(poolStudents.map((s) => s.id)));
    }
  };

  /* ── Assign selected students to class ── */
  const handleAssignToClass = async () => {
    if (!selectedClassId) {
      appToast.error(t('modal.pleaseSelectClassFirst', 'Please select a class first'));
      return;
    }
    if (selectedStudentIds.size === 0) {
      appToast.error('Please select at least one student');
      return;
    }
    setAssigning(true);
    try {
      await Promise.all(
        Array.from(selectedStudentIds).map((id) =>
          ViceStudentsAPI.assignClass(id, selectedClassId)
        )
      );
      appToast.success(`${selectedStudentIds.size} student(s) assigned to class!`);
      setSelectedStudentIds(new Set());
      await loadPoolStudents();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : 'Failed to assign students');
    } finally {
      setAssigning(false);
    }
  };

  /* ── Shared styles ── */
  const glassCardSx = {
    p: 4,
    borderRadius: '24px',
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: 'blur(24px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
    boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.08)}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 16px 50px ${alpha(primary, 0.1)}`,
    },
  };

  const badgeSx = {
    width: 40, height: 40,
    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
    borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', color: theme.palette.primary.contrastText,
    boxShadow: `0 4px 12px ${alpha(primary, 0.4)}`,
    fontSize: '1.2rem',
  };

  return (
    <>
      <Box sx={{ position: 'relative', minHeight: '100vh', paddingBottom: 4, bgcolor: theme.palette.background.default, overflow: 'hidden' }}>
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
            {/* Page Title */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              sx={{ mb: 6 }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${primary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('students.studentsManagement')}
              </Typography>
            </Box>

            <Box
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <Stack spacing={4}>
                {/* ── Step 1: Create New Class ── */}
                <Box component={motion.div} variants={itemVariants}>
                  <Card sx={glassCardSx}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={badgeSx}>1</Box>
                        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                          {t('students.createNewClass')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <FormControl fullWidth size="small" sx={{ maxWidth: 200 }}>
                          <InputLabel>Academic Year</InputLabel>
                          <Select label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(String(e.target.value))} disabled={academicYears.length === 0} sx={{ borderRadius: 2 }}>
                            {academicYears.map((year) => <MenuItem key={year.yearName} value={year.yearName}>{year.yearName}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={{ maxWidth: 200 }}>
                          <InputLabel>Level</InputLabel>
                          <Select label="Level" value={level} onChange={(e) => setLevel(e.target.value as ViceLevel)} sx={{ borderRadius: 2 }}>
                            <MenuItem value="junior">Junior</MenuItem>
                            <MenuItem value="wheeler">Wheeler</MenuItem>
                            <MenuItem value="senior">Senior</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={{ maxWidth: 200 }}>
                          <InputLabel>{t('students.department')}</InputLabel>
                          <Select label={t('students.department')} value={department} onChange={(e) => setDepartment(e.target.value as ViceDepartment)} sx={{ borderRadius: 2 }}>
                            <MenuItem value="OM">OM</MenuItem>
                            <MenuItem value="SD">SD</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label={t('students.className')}
                          size="small"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          sx={{ borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleCreateClass}
                          disabled={creatingClass}
                          sx={{
                            background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            borderRadius: '12px',
                            px: 3, py: 1,
                            boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                          }}
                        >
                          {creatingClass ? t('students.creating') : t('students.createClass')}
                        </Button>
                      </Box>
                      {creatingClassError && <Alert severity="error" sx={{ borderRadius: 2 }}>{creatingClassError}</Alert>}
                    </Stack>
                  </Card>
                </Box>

                {/* ── Step 2: Select Class ── */}
                <Box component={motion.div} variants={itemVariants}>
                  <Card sx={glassCardSx}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={badgeSx}>2</Box>
                        <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                          {t('students.selectClass')}
                        </Typography>
                      </Box>
                      <Box sx={{ maxWidth: 400 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('students.selectClass')}</InputLabel>
                          <Select
                            label={t('students.selectClass')}
                            value={selectedClassId ?? ''}
                            onChange={(e) => setSelectedClassId(Number(e.target.value))}
                            disabled={classesLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            {classesLoading ? (
                              <MenuItem disabled><LoadingRegion /></MenuItem>
                            ) : classes.length === 0 ? (
                              <MenuItem disabled>{t('teachers.noClassesForYear')}</MenuItem>
                            ) : (
                              classes.map((c) => (
                                <MenuItem key={c.classId} value={c.classId}>{c.className}</MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        {classesError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{classesError}</Alert>}
                        {selectedClassId && (
                          <Chip
                            label={`Selected: ${classes.find(c => c.classId === selectedClassId)?.className ?? selectedClassId}`}
                            sx={{ mt: 1.5, fontWeight: 700, bgcolor: alpha(primary, 0.12), color: primary, borderRadius: '10px' }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* ── Step 3: Student Management ── */}
                <Box component={motion.div} variants={itemVariants}>
                  <Card sx={{ ...glassCardSx, mb: 4 }}>
                    <Stack spacing={4}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={badgeSx}>3</Box>
                          <Box>
                            <Typography variant="h5" fontWeight={800}>
                              {t('students.studentManagement')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Students without a class assignment — select to assign
                            </Typography>
                          </Box>
                        </Box>
                        {/* Add New Student — no classId, goes into pool */}
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setIsAddStudentModalOpen(true)}
                          sx={{
                            background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            borderRadius: '12px',
                            boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                          }}
                        >
                          {t('students.addNewStudent')}
                        </Button>
                      </Box>

                      {/* Filters */}
                      <Box
                        sx={{
                          display: 'flex', gap: 6, flexWrap: 'wrap',
                          bgcolor: alpha(theme.palette.background.default, 0.5),
                          p: 2, borderRadius: 3,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>ACADEMIC YEAR</Typography>
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select value={academicYear} onChange={(e) => setAcademicYear(String(e.target.value))} disabled={academicYears.length === 0} sx={{ borderRadius: 2 }}>
                              {academicYears.map((year) => <MenuItem key={year.yearName} value={year.yearName}>{year.yearName}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Box>
                        <Box>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>DEPARTMENT</Typography>
                          <RadioGroup row value={department} onChange={(e) => setDepartment(e.target.value as ViceDepartment)}>
                            <FormControlLabel value="OM" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.9rem">OM</Typography>} />
                            <FormControlLabel value="SD" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.9rem">SD</Typography>} />
                          </RadioGroup>
                        </Box>
                        <Box>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>LEVEL</Typography>
                          <RadioGroup row value={level} onChange={(e) => setLevel(e.target.value as ViceLevel)}>
                            {(['junior', 'wheeler', 'senior'] as ViceLevel[]).map((lv) => (
                              <FormControlLabel key={lv} value={lv}
                                control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />}
                                label={<Typography fontWeight={600} fontSize="0.9rem" sx={{ textTransform: 'capitalize' }}>{lv}</Typography>}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      </Box>

                      {/* Selection summary */}
                      {selectedStudentIds.size > 0 && (
                        <Box
                          component={motion.div}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            bgcolor: alpha(primary, 0.08),
                            borderRadius: 3,
                            border: `1px solid ${alpha(primary, 0.2)}`,
                          }}
                        >
                          <AssignmentIndIcon sx={{ color: primary }} />
                          <Typography fontWeight={700} color="primary.main">
                            {selectedStudentIds.size} student{selectedStudentIds.size > 1 ? 's' : ''} selected
                          </Typography>
                          <Tooltip title={!selectedClassId ? 'Select a class first (Step 2)' : ''}>
                            <span>
                              <Button
                                variant="contained"
                                onClick={handleAssignToClass}
                                disabled={assigning || !selectedClassId}
                                startIcon={assigning ? <CircularProgress size={16} color="inherit" /> : <AssignmentIndIcon />}
                                sx={{
                                  ml: 'auto',
                                  background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                                  color: theme.palette.primary.contrastText,
                                  fontWeight: 700,
                                  borderRadius: '12px',
                                  boxShadow: `0 4px 14px ${alpha(primary, 0.35)}`,
                                }}
                              >
                                {assigning ? 'Assigning…' : `Assign to ${classes.find(c => c.classId === selectedClassId)?.className ?? 'Class'}`}
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      )}

                      {/* Error */}
                      {poolError && <Alert severity="error" sx={{ borderRadius: 2 }}>{poolError}</Alert>}

                      {/* Pool Table */}
                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          bgcolor: 'transparent',
                        }}
                        aria-busy={poolLoading}
                      >
                        <Table>
                          <TableHead sx={{ backgroundColor: alpha(primary, 0.1) }}>
                            <TableRow>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  indeterminate={selectedStudentIds.size > 0 && selectedStudentIds.size < poolStudents.length}
                                  checked={poolStudents.length > 0 && selectedStudentIds.size === poolStudents.length}
                                  onChange={toggleAll}
                                  disabled={poolStudents.length === 0}
                                  sx={{ color: primary, '&.Mui-checked': { color: primary } }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{t('students.studentName')}</TableCell>
                              <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{t('students.studentId')}</TableCell>
                              <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{t('students.department')}</TableCell>
                              <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>YEAR</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {poolLoading ? (
                              <TableRow>
                                <TableCell colSpan={5}>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress color="primary" />
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : poolStudents.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary', fontWeight: 500 }}>
                                  <PeopleAltIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                                  <Typography fontWeight={600}>{t('students.noStudentsFound')}</Typography>
                                  <Typography variant="caption">All students in this group are assigned to classes</Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              poolStudents.map((s, idx) => {
                                const isSelected = selectedStudentIds.has(s.id);
                                return (
                                  <TableRow
                                    key={s.id}
                                    component={motion.tr}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    onClick={() => toggleStudent(s.id)}
                                    sx={{
                                      cursor: 'pointer',
                                      bgcolor: isSelected ? alpha(primary, 0.06) : 'transparent',
                                      '&:hover': { bgcolor: alpha(primary, 0.05) },
                                      transition: 'background-color 0.2s',
                                    }}
                                  >
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        checked={isSelected}
                                        onChange={() => toggleStudent(s.id)}
                                        sx={{ color: primary, '&.Mui-checked': { color: primary } }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                                    <TableCell>
                                      <Chip label={s.studentCode} size="small" sx={{ fontWeight: 700, bgcolor: alpha(primary, 0.08), color: primary, borderRadius: '8px' }} />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={s.department}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          bgcolor: s.department === 'OM' ? alpha('#2196f3', 0.1) : alpha('#ff9800', 0.1),
                                          color: s.department === 'OM' ? '#2196f3' : '#e65100',
                                          borderRadius: '8px',
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={s.year}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          textTransform: 'capitalize',
                                          bgcolor: alpha(primary, 0.08),
                                          color: primary,
                                          borderRadius: '8px',
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Footer */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                        <Button
                          component={Link}
                          href="/vice/students/all"
                          variant="outlined"
                          sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
                        >
                          {t('students.allStudents')}
                        </Button>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* Add New Student Modal */}
        <AddStudentModal
          open={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          year={level}
          department={department}
          onSubmit={async (payload) => {
            await ViceStudentsAPI.create({
              ...payload,
              department,
              year: level,
              academicYearName: academicYear,
            });
            await loadPoolStudents();
            appToast.success(t('modal.studentAddedSuccess'));
          }}
        />
      </Box>
    </>
  );
}
