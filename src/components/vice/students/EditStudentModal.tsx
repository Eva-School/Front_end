'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, TextField, Button, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { CreateViceStudentPayload, ViceStudent } from '@/types/vice/students';
import { useLanguage } from '@/context/LanguageContext';
import AccessibleIconButton from '@/components/a11y/AccessibleIconButton';
import { useTranslations } from 'next-intl';

interface EditStudentModalProps {
    open: boolean;
    onClose: () => void;
    student: ViceStudent | null;
    onSubmit: (payload: CreateViceStudentPayload) => Promise<void>;
}

export default function EditStudentModal({ open, onClose, student, onSubmit }: EditStudentModalProps) {
    const { dir } = useLanguage();
    const t = useTranslations();

    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        studentCode: '',
        email: '',
        phone: '',
        address: '',
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (student && open) {
            const nameParts = student.name.split(' ');
            const fName = student.firstName || nameParts[0] || '';
            const lName = student.lastName || nameParts.slice(1).join(' ') || '';

            setForm({
                firstName: fName,
                middleName: student.middleName || '',
                lastName: lName,
                studentCode: student.studentCode || '',
                email: student.email || '',
                phone: student.phone || '',
                address: student.address || '',
            });
            setError(null);
        }
    }, [student, open]);

    const disabledReason = useMemo(() => {
        if (!form.firstName.trim()) return t('students.firstNameRequired');
        if (!form.lastName.trim()) return t('students.lastNameRequired');
        
        const code = form.studentCode.trim();
        if (!code) return t('students.studentCodeRequired');
        if (!/^[a-zA-Z0-9]+$/.test(code)) return t('students.studentCodeAlphanumeric');

        const email = form.email.trim();
        if (!email) return t('students.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('students.validEmail');

        const phone = form.phone.trim();
        if (!phone) return t('students.phoneRequired');
        if (!/^\d{8,15}$/.test(phone)) return t('students.phoneDigits');
        
        return null;
    }, [form, t]);

    const handleSave = async () => {
        if (!student) return;

        setError(null);
        if (disabledReason) {
            setError(disabledReason);
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                firstName: form.firstName.trim(),
                middleName: form.middleName.trim() || undefined,
                lastName: form.lastName.trim(),
                studentCode: form.studentCode.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
                address: form.address.trim() || undefined,
                department: student.department,
                year: student.year,
                classId: student.classId || undefined,
                academicYearName: student.academicYearName || undefined,
            });
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t('students.failedUpdateStudent'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!student) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            dir={dir}
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
                    {t('students.editStudent')}
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
                        label={t('modal.middleNameOptional')}
                        value={form.middleName}
                        onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                        variant="outlined"
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
                        label={t('modal.email')}
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        variant="outlined"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' } }}
                    />
                    <TextField
                        fullWidth
                        label={t('modal.phone')}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        variant="outlined"
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' } }}
                    />
                    <TextField
                        fullWidth
                        label={t('modal.address')}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        variant="outlined"
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
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            px: 4,
                            textTransform: 'none',
                        }}
                    >
                        {submitting ? t('modal.saving') : t('students.saveChanges')}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
