"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import type { ClassItem } from "@/types/class-management.types";

interface ClassDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
  onConfirmDelete: (classId: number) => Promise<void>;
}

export default function ClassDeleteDialog({
  open,
  onClose,
  classItem,
  onConfirmDelete,
}: ClassDeleteDialogProps) {
  const { t } = useLanguage();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!classItem) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(classItem.classId);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("common.validations.serverError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>
        {t("classes.deleteConfirmTitle")}
      </DialogTitle>
      <DialogContent>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}
        <DialogContentText sx={{ color: "text.primary", mb: 1.5 }}>
          {t("classes.deleteConfirmMessage", { name: classItem.className })}
        </DialogContentText>
        {classItem.studentCount > 0 && (
          <Typography variant="body2" color="warning.main" fontWeight={600}>
            ⚠️ {classItem.studentCount} student(s) currently enrolled will be unassigned.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} color="inherit" sx={{ fontWeight: 600 }}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          disabled={isDeleting}
          id="btn-confirm-delete-class"
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ borderRadius: "10px", fontWeight: 700, px: 2.5 }}
        >
          {t("classes.deleteClass")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
