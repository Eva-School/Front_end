"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Stack, Card, RadioGroup, FormControlLabel, Radio,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Paper, CircularProgress, Alert, useTheme, alpha, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ViceStudentsAPI } from '@/data/vice-students.api';
import type { ViceStudent, ViceDepartment, ViceLevel } from '@/types/vice/students';
import { appToast } from '@/hooks/useAppToast';
import EditStudentModal from '@/components/vice/students/EditStudentModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AllStudentsPage() {
  const router = useRouter();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [students, setStudents] = useState<ViceStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingStudent, setEditingStudent] = useState<ViceStudent | null>(null);

  const [departmentFilter, setDepartmentFilter] = useState<ViceDepartment>('OM');
  const [levelFilter, setLevelFilter] = useState<ViceLevel>('junior');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ViceStudentsAPI.list({
        year: levelFilter,
        department: departmentFilter,
      });
      setStudents(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [levelFilter, departmentFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to unassign this student from their class?")) return;
    try {
      await ViceStudentsAPI.assignClass(id, null);
      appToast.success("Student unassigned from class successfully");
      fetchStudents();
    } catch (e: unknown) {
      appToast.error(e instanceof Error ? e.message : "Failed to unassign student");
    }
  };

  const handleEditSubmit = async (payload: { firstName?: string; lastName?: string; studentCode?: string }) => {
    if (!editingStudent) return;
    try {
        await ViceStudentsAPI.update(editingStudent.id, payload);
        appToast.success("Student updated successfully");
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
    <Box sx={{ position: 'relative', minHeight: '100vh', pb: 8, bgcolor: theme.palette.background.default, overflow: 'hidden' }}>
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
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <IconButton onClick={() => router.back()} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.05) }}>
              <ArrowBackIcon />
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
              All Students Dashboard
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
                      Students Directory
                    </Typography>
                  </Box>
                  
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
                    Promote Students
                  </Button>
                </Box>

                {/* Filters */}
                <Box sx={{
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>DEPARTMENT</Typography>
                    <RadioGroup row value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value as ViceDepartment)}>
                      <FormControlLabel value="OM" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.95rem">OM</Typography>} />
                      <FormControlLabel value="SD" control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />} label={<Typography fontWeight={600} fontSize="0.95rem">SD</Typography>} />
                    </RadioGroup>
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>LEVEL</Typography>
                    <RadioGroup row value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as ViceLevel)}>
                      {(['junior', 'wheeler', 'senior'] as ViceLevel[]).map((lv) => (
                        <FormControlLabel key={lv} value={lv}
                          control={<Radio sx={{ color: primary, '&.Mui-checked': { color: primary } }} size="small" />}
                          label={<Typography fontWeight={600} fontSize="0.95rem" sx={{ textTransform: 'capitalize' }}>{lv}</Typography>}
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
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>Student Code</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>Dept</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }}>Class</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, borderBottom: 'none' }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                              <CircularProgress color="primary" />
                            </TableCell>
                          </TableRow>
                        ) : students.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                No students found for this department and level.
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
                              <TableCell sx={{ fontWeight: 700, color: primary, borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                {student.department}
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
                                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Unassigned</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottomColor: alpha(theme.palette.divider, 0.1) }}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingStudent(student)}
                                    sx={{ color: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.1) }}
                                    title="Edit Student"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  {student.className && (
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDelete(student.id)}
                                        sx={{ color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.1) }}
                                        title="Unassign from Class"
                                      >
                                        <DeleteIcon fontSize="small" />
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
    </Box>
  );
}
