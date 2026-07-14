'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, TextField, Button, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ViceStudent } from '@/types/vice/students';
import { useLanguage } from '@/context/LanguageContext';
import AccessibleIconButton from '@/components/a11y/AccessibleIconButton';

interface EditStudentModalProps {
    open: boolean;
    onClose: () => void;
    student: ViceStudent | null;
    onSubmit: (payload: {
        firstName?: string;
        lastName?: string;
        studentCode?: string;
    }) => Promise<void>;
}

type EditableViceStudent = ViceStudent & {
    firstName?: string;
    lastName?: string;
};

export default function EditStudentModal({ open, onClose, student, onSubmit }: EditStudentModalProps) {
    const { t } = useLanguage();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        studentCode: '',
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (student && open) {
            // Split name into first and last name for editing (since API returns full name or we can just send firstName/lastName)
            // Wait, the backend returns firstName and lastName inside ViceStudent if it's available, otherwise we split the full name.
            const nameParts = student.name.split(' ');
            const editableStudent = student as EditableViceStudent;
            const fName = editableStudent.firstName || nameParts[0] || '';
            const lName = editableStudent.lastName || nameParts.slice(1).join(' ') || '';

            setForm({
                firstName: fName,
                lastName: lName,
                studentCode: student.studentCode || '',
            });
            setError(null);
        }
    }, [student, open]);

    const disabledReason = useMemo(() => {
        if (!form.firstName.trim()) return t('auth.usernameRequired', 'First name is required');
        if (!form.lastName.trim()) return t('teachers.lastNameRequired', 'Last name is required');
        
        const code = form.studentCode.trim();
        if (!code) return t('modal.studentCode', 'Student Code') + " " + t('auth.passwordRequired', 'is required');
        if (!/^[a-zA-Z0-9]+$/.test(code)) return "Student Code must be alphanumeric only";
        
        return null;
    }, [form, t]);

    const handleSave = async () => {
        setError(null);
        if (disabledReason) {
            setError(disabledReason);
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                studentCode: form.studentCode.trim(),
            });
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t('students.addStudentFailed', 'Failed to update student'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    padding: 2,
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Edit Student
                </Typography>
                <AccessibleIconButton label={t('common.closeMenu')} onClick={onClose} size="small">
                    <CloseIcon />
                </AccessibleIconButton>
            </Box>

            <DialogContent sx={{ overflowY: 'visible', pt: 0 }}>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4 }}>
                    <TextField
                        fullWidth
                        label={t('modal.firstName')}
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        variant="outlined"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' } }}
                    />
                    <TextField
                        fullWidth
                        label={t('modal.lastName')}
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        variant="outlined"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' } }}
                    />
                    <TextField
                        fullWidth
                        label={t('modal.studentCode')}
                        value={form.studentCode}
                        onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                        variant="outlined"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' } }}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={submitting || !!disabledReason}
                        sx={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            px: 4,
                            textTransform: 'none',
                        }}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
