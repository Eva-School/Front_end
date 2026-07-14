'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, Stack,
  Button, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Checkbox, CircularProgress, Alert
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

import { appToast } from '@/hooks/useAppToast';
import { ViceStudentsAPI } from '@/data/vice-students.api';
import type { ViceStudent, ViceDepartment, ViceLevel } from '@/types/vice/students';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const LEVELS: { value: ViceLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'wheeler', label: 'Wheeler' },
  { value: 'senior', label: 'Senior' }
];

export default function PromoteStudentsPage() {
  const theme = useTheme();
  
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const glassCardSx = {
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.4)}, ${alpha(theme.palette.background.paper, 0.2)})`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    borderRadius: '24px',
    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.2)}`,
    p: 3,
  };

  const [sourceDept, setSourceDept] = useState<ViceDepartment>('OM');
  const [sourceLevel, setSourceLevel] = useState<ViceLevel>('junior');
  const [targetLevel, setTargetLevel] = useState<ViceLevel>('wheeler');

  const [students, setStudents] = useState<ViceStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ViceStudentsAPI.list({ year: sourceLevel, department: sourceDept });
      setStudents(data);
      // Select all by default
      setSelectedStudentIds(new Set(data.map(s => s.id)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [sourceLevel, sourceDept]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set()); // deselect all
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.id))); // select all
    }
  };

  const handleToggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handlePromote = async () => {
    if (!window.confirm(`Are you sure you want to promote ${selectedStudentIds.size} students to ${targetLevel}? \nUnselected students will remain in ${sourceLevel}. All will be unassigned from their current classes.`)) return;
    
    setPromoting(true);
    setError(null);
    try {
      await ViceStudentsAPI.promote({
        studentIds: Array.from(selectedStudentIds),
        sourceLevel,
        targetLevel,
        department: sourceDept,
      });
      appToast.success('End of year promotion completed successfully');
      fetchStudents(); // Refresh list
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to promote students');
      appToast.error('Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `radial-gradient(circle at top right, ${alpha(primary, 0.1)}, transparent 40%),
                   radial-gradient(circle at bottom left, ${alpha(secondary, 0.1)}, transparent 40%)`,
      pt: { xs: 4, md: 6 },
      pb: { xs: 8, md: 10 },
      px: { xs: 2, sm: 3, md: 4 },
    }}>
      <Container maxWidth="xl">
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <Box sx={{ mb: 6, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.text.secondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Promote Students
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                End of year workflow to transfer students to the next academic level
              </Typography>
            </Box>
          </Box>

          <Stack spacing={4}>
            {/* Step 1: Filters & Target */}
            <Card sx={glassCardSx} component={motion.div} variants={itemVariants}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                {/* Source */}
                <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 300, alignItems: 'center' }}>
                  <Typography fontWeight="bold" sx={{ mr: 2, minWidth: 100 }}>From (Source):</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Department</InputLabel>
                    <Select value={sourceDept} label="Department" onChange={(e) => setSourceDept(e.target.value as ViceDepartment)}>
                      <MenuItem value="OM">OM</MenuItem>
                      <MenuItem value="SD">SD</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Level</InputLabel>
                    <Select value={sourceLevel} label="Level" onChange={(e) => setSourceLevel(e.target.value as ViceLevel)}>
                      {LEVELS.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <ArrowForwardIcon sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }} />

                {/* Target */}
                <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 250, alignItems: 'center' }}>
                  <Typography fontWeight="bold" sx={{ mr: 2, minWidth: 100 }}>To (Target):</Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Next Level</InputLabel>
                    <Select value={targetLevel} label="Next Level" onChange={(e) => setTargetLevel(e.target.value as ViceLevel)}>
                      {LEVELS.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Card>

            {/* Step 2: Student List */}
            <Card sx={{ ...glassCardSx, p: 0, overflow: 'hidden' }} component={motion.div} variants={itemVariants}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="h6" fontWeight={700}>
                  Students List ({selectedStudentIds.size}/{students.length} selected)
                </Typography>
                <Button
                  variant="contained"
                  onClick={handlePromote}
                  disabled={promoting || students.length === 0}
                  startIcon={promoting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    background: `linear-gradient(45deg, ${primary}, ${secondary})`,
                    color: '#fff',
                    fontWeight: 700,
                    px: 4,
                    borderRadius: '12px',
                    boxShadow: `0 4px 14px ${alpha(primary, 0.4)}`,
                  }}
                >
                  Confirm Promotion
                </Button>
              </Box>

              {error && <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                  <CircularProgress size={40} thickness={4} />
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)' }}>
                          <Checkbox
                            checked={students.length > 0 && selectedStudentIds.size === students.length}
                            indeterminate={selectedStudentIds.size > 0 && selectedStudentIds.size < students.length}
                            onChange={handleToggleSelectAll}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)' }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)' }}>Current Class</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {students.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                              <Typography variant="body1" color="text.secondary">No students found for this department and level.</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          students.map((student) => {
                            const isSelected = selectedStudentIds.has(student.id);
                            return (
                              <TableRow
                                key={student.id}
                                hover
                                onClick={() => handleToggleStudent(student.id)}
                                sx={{ cursor: 'pointer', transition: 'background-color 0.2s', '&:last-child td': { border: 0 } }}
                              >
                                <TableCell padding="checkbox" sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                  <Checkbox checked={isSelected} color="primary" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                  {student.name}
                                </TableCell>
                                <TableCell sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                  {student.studentCode || '-'}
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
                                    <Typography variant="body2" color="text.secondary" fontStyle="italic">Unassigned</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                  {isSelected ? (
                                    <Typography variant="body2" color="primary.main" fontWeight="bold">Will be Promoted to {targetLevel}</Typography>
                                  ) : (
                                    <Typography variant="body2" color="error.main" fontWeight="bold">Will remain in {sourceLevel}</Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
