'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Checkbox, CircularProgress, Container, Divider,
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, Stack,
  TextField, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { appToast } from '@/hooks/useAppToast';
import { API_BASE_URL, secureFetch } from '@/config/api.config';
import {
  AcademicYearsAPI,
  type AcademicYearOption,
  type AcademicYearRolloverResult,
  type CreateAcademicYearPayload,
} from '@/data/academic-years.api';
import { useLanguage } from '@/context/LanguageContext';

type YearMappings = { junior: string; wheeler: string; senior: string };
type ImportKey = 'copyTerms' | 'copySubjects' | 'copyClasses' | 'copyTeacherAssignments' | 'carryStudents';
type ImportOptions = Pick<CreateAcademicYearPayload, ImportKey>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const emptyImportOptions: ImportOptions = {
  copyTerms: false,
  copySubjects: false,
  copyClasses: false,
  copyTeacherAssignments: false,
  carryStudents: false,
};

export default function ViceSettingsPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const glassCardSx = {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.76)}, ${alpha(theme.palette.background.paper, 0.48)})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: '24px',
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
    p: { xs: 2.5, sm: 4 },
  };

  const [mappings, setMappings] = useState<YearMappings>({
    junior: '2024-2025', wheeler: '2024-2025', senior: '2024-2025',
  });
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [sourceYearName, setSourceYearName] = useState('');
  const [importOptions, setImportOptions] = useState<ImportOptions>(emptyImportOptions);
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [rolloverResult, setRolloverResult] = useState<AcademicYearRolloverResult | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      secureFetch<YearMappings>(`${API_BASE_URL}/settings/year-mappings`),
      AcademicYearsAPI.list(),
    ])
      .then(([loadedMappings, loadedYears]) => {
        if (!active) return;
        queueMicrotask(() => {
          if (loadedMappings.junior && loadedMappings.wheeler && loadedMappings.senior) {
            setMappings(loadedMappings);
          }
          setAcademicYears(loadedYears);
        });
      })
      .catch(() => {
        if (active) appToast.error(t('academicYears.loadFailed', 'Unable to load academic-year settings.'));
      });

    return () => { active = false; };
  }, [t]);

  const handleSaveMappings = async () => {
    setSaving(true);
    try {
      const updated = await secureFetch<YearMappings>(`${API_BASE_URL}/settings/year-mappings`, {
        method: 'PUT', body: JSON.stringify(mappings),
      });
      setMappings(updated);
      appToast.success(t('academicYears.mappingsSaved', 'Academic-year mappings updated successfully.'));
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : t('academicYears.saveFailed', 'Unable to update academic-year mappings.'));
    } finally {
      setSaving(false);
    }
  };

  const updateImportOption = (key: ImportKey, checked: boolean) => {
    setImportOptions((current) => {
      if (key === 'copyClasses' && !checked) {
        return { ...current, copyClasses: false, copyTeacherAssignments: false, carryStudents: false };
      }
      if (key === 'copySubjects' && !checked) {
        return { ...current, copySubjects: false, copyTeacherAssignments: false };
      }
      return { ...current, [key]: checked };
    });
  };

  const handleCreateYear = async () => {
    setRolloverResult(null);
    const normalizedYearName = newYearName.trim();
    if (!/^\d{4}-\d{4}$/.test(normalizedYearName)) {
      appToast.error(t('academicYears.invalidYear', 'Enter the new year as YYYY-YYYY.'));
      return;
    }

    setCreating(true);
    try {
      const result = await AcademicYearsAPI.create({
        yearName: normalizedYearName,
        copyFromYearName: sourceYearName || undefined,
        ...importOptions,
        activateImmediately,
      });
      setRolloverResult(result);
      setAcademicYears((current) => [
        { yearName: result.yearName, isActive: result.isActive },
        ...current.filter((year) => year.yearName !== result.yearName),
      ]);
      if (result.isActive) {
        setMappings({ junior: result.yearName, wheeler: result.yearName, senior: result.yearName });
      }
      setNewYearName('');
      setSourceYearName('');
      setImportOptions(emptyImportOptions);
      setActivateImmediately(false);
      appToast.success(t('academicYears.created', 'Academic year created successfully.'));
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : t('academicYears.createFailed', 'Unable to create the academic year.'));
    } finally {
      setCreating(false);
    }
  };

  const hasSource = Boolean(sourceYearName);
  const yearNames = academicYears.map((year) => year.yearName);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at top right, ${alpha(primary, 0.1)}, transparent 40%), radial-gradient(circle at bottom left, ${alpha(secondary, 0.1)}, transparent 40%)`,
      pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 }, px: { xs: 2, sm: 3, md: 4 },
    }}>
      <Container maxWidth="md">
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 56, height: 56, background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: theme.palette.primary.contrastText, boxShadow: `0 4px 20px ${alpha(primary, 0.4)}`,
            }}>
              <SettingsIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.text.secondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {t('academicYears.settingsTitle', 'Academic Year Settings')}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                {t('academicYears.settingsSubtitle', 'Create, prepare, and activate academic years')}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={4}>
            <Card sx={glassCardSx} component={motion.div} variants={itemVariants}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AddCircleOutlineIcon color="primary" />
                  <Typography variant="h5" fontWeight={800}>
                    {t('academicYears.createTitle', 'Set up a new academic year')}
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {t('academicYears.createDescription', 'Start with a clean year or selectively bring forward setup data from a previous year. Grades and historical activity are never copied.')}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth label={t('academicYears.newYear', 'New academic year')} placeholder="2025-2026"
                    value={newYearName} onChange={(event) => setNewYearName(event.target.value)}
                    inputProps={{ inputMode: 'numeric', maxLength: 9 }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>{t('academicYears.sourceYear', 'Import from (optional)')}</InputLabel>
                    <Select
                      label={t('academicYears.sourceYear', 'Import from (optional)')}
                      value={sourceYearName}
                      onChange={(event) => setSourceYearName(String(event.target.value))}
                    >
                      <MenuItem value="">{t('academicYears.startFresh', 'Start fresh')}</MenuItem>
                      {academicYears.map((year) => (
                        <MenuItem key={year.yearName} value={year.yearName}>{year.yearName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Box sx={{ borderRadius: 3, bgcolor: alpha(primary, 0.05), p: 2 }}>
                  <Typography fontWeight={800} sx={{ mb: 1 }}>
                    {t('academicYears.chooseData', 'Choose data to bring forward')}
                  </Typography>
                  <Stack>
                    <FormControlLabel
                      control={<Checkbox checked={importOptions.copyTerms} disabled={!hasSource} onChange={(event) => updateImportOption('copyTerms', event.target.checked)} />}
                      label={t('academicYears.terms', 'Terms and their dates')}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={importOptions.copySubjects} disabled={!hasSource} onChange={(event) => updateImportOption('copySubjects', event.target.checked)} />}
                      label={t('academicYears.subjects', 'Subjects and grade limits')}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={importOptions.copyClasses} disabled={!hasSource} onChange={(event) => updateImportOption('copyClasses', event.target.checked)} />}
                      label={t('academicYears.classes', 'Classes and capacities')}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={importOptions.copyTeacherAssignments} disabled={!hasSource || !importOptions.copyClasses || !importOptions.copySubjects} onChange={(event) => updateImportOption('copyTeacherAssignments', event.target.checked)} />}
                      label={t('academicYears.assignments', 'Teacher-to-class subject assignments')}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={importOptions.carryStudents} disabled={!hasSource || !importOptions.copyClasses} onChange={(event) => updateImportOption('carryStudents', event.target.checked)} />}
                      label={t('academicYears.students', 'Carry enrolled students into matching classes')}
                    />
                  </Stack>
                  {!hasSource && (
                    <Typography variant="caption" color="text.secondary">
                      {t('academicYears.selectSourceHint', 'Choose a source year to enable import options.')}
                    </Typography>
                  )}
                  {hasSource && (
                    <Typography variant="caption" color="text.secondary">
                      {t('academicYears.studentHint', 'Students keep their accounts and prior-year grades; only their current year and matching class are updated.')}
                    </Typography>
                  )}
                </Box>

                <FormControlLabel
                  control={<Checkbox checked={activateImmediately} onChange={(event) => setActivateImmediately(event.target.checked)} />}
                  label={t('academicYears.activateNow', 'Make this the active academic year for all levels now')}
                />
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  {t('academicYears.safetyNote', 'Grade results, approvals, submissions, audit logs, and notifications are kept in the previous year and are never copied.')}
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained" startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                    onClick={handleCreateYear} disabled={creating || !newYearName.trim()}
                    sx={{ background: `linear-gradient(45deg, ${primary}, ${secondary})`, color: '#fff', fontWeight: 700, px: 3, py: 1, borderRadius: '12px' }}
                  >
                    {creating ? t('academicYears.creating', 'Creating…') : t('academicYears.create', 'Create academic year')}
                  </Button>
                </Box>
                {rolloverResult && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    {t('academicYears.createdSummary', 'Created')} {rolloverResult.yearName}: {rolloverResult.termsCopied} {t('academicYears.termsCount', 'terms')}, {rolloverResult.subjectsCopied} {t('academicYears.subjectsCount', 'subjects')}, {rolloverResult.classesCopied} {t('academicYears.classesCount', 'classes')}, {rolloverResult.teacherAssignmentsCopied} {t('academicYears.assignmentsCount', 'teacher assignments')}, {rolloverResult.studentsCarried} {t('academicYears.studentsCount', 'students carried')}.
                  </Alert>
                )}
              </Stack>
            </Card>

            <Card sx={glassCardSx} component={motion.div} variants={itemVariants}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {t('academicYears.mappingsTitle', 'Active academic-year mappings')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('academicYears.mappingsDescription', 'Choose the active year for each educational level. This controls the year used by the student, teacher, and grade-management services.')}
              </Typography>

              <Stack spacing={3}>
                {(['junior', 'wheeler', 'senior'] as const).map((stage) => (
                  <Box key={stage} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
                    <Typography fontWeight="bold" sx={{ minWidth: 100 }}>
                      {t(`vice.${stage}`, `${stage[0].toUpperCase()}${stage.slice(1)}`)}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel>{t('academicYears.mappedYear', 'Mapped year')}</InputLabel>
                      <Select
                        value={mappings[stage]}
                        label={t('academicYears.mappedYear', 'Mapped year')}
                        onChange={(event) => setMappings({ ...mappings, [stage]: String(event.target.value) })}
                      >
                        {yearNames.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 4 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained" startIcon={<SaveIcon />} onClick={handleSaveMappings} disabled={saving || yearNames.length === 0}
                  sx={{ background: `linear-gradient(45deg, ${primary}, ${secondary})`, color: '#fff', fontWeight: 700, px: 4, py: 1, borderRadius: '12px', boxShadow: `0 4px 14px ${alpha(primary, 0.4)}` }}
                >
                  {saving ? t('common.saving') : t('academicYears.saveMappings', 'Save active mappings')}
                </Button>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
