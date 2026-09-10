"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE_URL, secureFetch } from "@/config/api.config";
import type { ClassStudent, CohortStage } from "@/types/class-management.types";

interface EditClassStudentModalProps {
  open: boolean;
  onClose: () => void;
  student: ClassStudent | null;
  cohort: CohortStage;
  department: string;
  classId: number;
  onStudentUpdated: () => void;
}

export default function EditClassStudentModal({
  open,
  onClose,
  student,
  cohort,
  department,
  classId,
  onStudentUpdated,
}: EditClassStudentModalProps) {
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFirstName(student.firstName || student.fullName.split(" ")[0] || "");
      setLastName(student.lastName || student.fullName.split(" ").slice(1).join(" ") || "");
      setStudentCode(student.studentCode || student.nationalId || "");
      setEmail(student.email || "");
      setPhone(student.phone || "");
      setAddress(student.address || "");
    }
    setErrorMsg(null);
  }, [student, open]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !studentCode.trim() || !email.trim()) {
      setErrorMsg(t("common.validations.required"));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentCode: studentCode.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        department: department || "OM",
        year: cohort,
        classId,
      };

      await secureFetch(`${API_BASE_URL}/vice/students/${student.studentId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      onStudentUpdated();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("common.validations.serverError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {t("classes.editStudent")}
        </DialogTitle>

        <DialogContent dividers>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              id="input-edit-first-name"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              id="input-edit-last-name"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Student Code"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              fullWidth
              id="input-edit-student-code"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              id="input-edit-student-email"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              id="input-edit-student-phone"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              id="input-edit-student-address"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit" sx={{ fontWeight: 600 }}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            id="btn-submit-edit-student"
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: "10px", fontWeight: 700, px: 3 }}
          >
            {t("classes.saveChanges")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
