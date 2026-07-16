'use client';

import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, Box, Typography, TextField, Button, Step, StepLabel, Stepper, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ViceDepartment, ViceLevel } from '@/types/vice/students';
import AccessibleIconButton from '@/components/a11y/AccessibleIconButton';
import { useTranslations } from 'next-intl';

interface AddStudentModalProps {
    open: boolean;
    onClose: () => void;
    year: ViceLevel;
    department: ViceDepartment;
    onSubmit: (payload: {
        firstName: string;
        middleName?: string;
        lastName: string;
        studentCode: string;
        email: string;
        phone: string;
    }) => Promise<void>;
}

export default function AddStudentModal({ open, onClose, year, department, onSubmit }: AddStudentModalProps) {
    const t = useTranslations();
    const [activeStep] = useState(0);
    const steps = [1, 2, 3];

    const [form, setForm] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        studentCode: '',
        email: '',
        phone: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
        setError(null);
        setSuccess(false);
        if (disabledReason) {
            setError(disabledReason);
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                firstName: form.firstName.trim(),
                middleName: form.middleName.trim(),
                lastName: form.lastName.trim(),
                studentCode: form.studentCode.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
            });
            setSuccess(true);
            setForm({
                firstName: '',
                middleName: '',
                lastName: '',
                studentCode: '',
                email: '',
                phone: '',
            });
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 800);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t('students.addStudentFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    padding: 2,
                    maxWidth: '600px'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    {t('modal.addNewStudent')}
                </Typography>
                <AccessibleIconButton label={t('common.closeMenu')} onClick={onClose} size="small">
                    <CloseIcon />
                </AccessibleIconButton>
            </Box>

            <DialogContent sx={{ overflowY: 'visible' }}>
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{
                        '& .MuiStepConnector-line': {
                            borderColor: '#ffc107',
                            borderTopWidth: 3,
                            borderRadius: 1
                        }
                    }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel
                                    StepIconComponent={() => (
                                        <Box sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: '#ffc107',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: '#000',
                                            zIndex: 1,
                                            border: '2px solid white' // To separate from line
                                        }}>
                                            {label}
                                        </Box>
                                    )}
                                >
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 2 }}>{t('modal.studentAddedSuccess')}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Alert severity="info" sx={{ mb: 2 }}>
                    {t('modal.year')}: <b>{year}</b> — {t('students.department')}: <b>{department}</b> — {t('modal.class')}: <b>{t('students.unassigned')}</b>
                </Alert>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.firstName')}
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            variant="outlined"
                            required
                            aria-required="true"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.middleNameOptional')}
                            value={form.middleName}
                            onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.lastName')}
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            variant="outlined"
                            required
                            aria-required="true"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.studentCode')}
                            value={form.studentCode}
                            onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
                            variant="outlined"
                            required
                            aria-required="true"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.email')}
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            variant="outlined"
                            required
                            aria-required="true"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                    <Box>
                        <TextField
                            fullWidth
                            label={t('modal.phone')}
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            variant="outlined"
                            required
                            aria-required="true"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f5f5f5' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: '#555' } }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        // Keep the action available so handleSave can explain exactly which
                        // field is missing or invalid instead of leaving the user with a
                        // disabled button and no reason.
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            minWidth: '200px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            '&:hover': {
                                backgroundColor: '#ffca2c'
                            }
                        }}
                    >
                        {submitting ? t('modal.saving') : t('modal.saveStudent')}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
