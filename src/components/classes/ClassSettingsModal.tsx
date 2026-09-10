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
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import type {
  ClassItem,
  CohortStage,
  CreateClassPayload,
  UpdateClassPayload,
} from "@/types/class-management.types";

interface ClassSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitCreate?: (payload: CreateClassPayload) => Promise<void>;
  onSubmitUpdate?: (classId: number, payload: UpdateClassPayload) => Promise<void>;
  editingClass?: ClassItem | null;
  cohort: CohortStage;
  academicYearName?: string;
}

export default function ClassSettingsModal({
  open,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingClass,
  cohort,
  academicYearName = "2026-2027",
}: ClassSettingsModalProps) {
  const { t } = useLanguage();

  const isEditMode = Boolean(editingClass);

  const [className, setClassName] = useState("");
  const [department, setDepartment] = useState("OM");
  const [capacity, setCapacity] = useState<number>(30);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingClass) {
      setClassName(editingClass.className);
      setDepartment(editingClass.departmentName || "OM");
      setCapacity(editingClass.capacity || 30);
      setIsActive(editingClass.isActive);
    } else {
      setClassName("");
      setDepartment("OM");
      setCapacity(30);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [editingClass, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setErrorMsg(t("common.validations.required"));
      return;
    }
    if (capacity < 1 || capacity > 500) {
      setErrorMsg(t("classes.capacity"));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEditMode && editingClass && onSubmitUpdate) {
        await onSubmitUpdate(editingClass.classId, {
          className: className.trim(),
          department,
          capacity,
          isActive,
        });
      } else if (onSubmitCreate) {
        await onSubmitCreate({
          yearId: academicYearName,
          stage: cohort,
          department,
          className: className.trim(),
          capacity,
        });
      }
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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 1,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {isEditMode ? t("classes.editClassTitle") : t("classes.createClassTitle")}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* Class Name */}
            <TextField
              label={t("classes.className")}
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              fullWidth
              autoFocus
              id="input-class-name"
              placeholder="e.g. 1/1, Class A, Advanced OM"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "12px" },
              }}
            />

            {/* Department Selection */}
            <FormControl fullWidth size="medium">
              <InputLabel id="select-department-label">{t("classes.department")}</InputLabel>
              <Select
                labelId="select-department-label"
                value={department}
                label={t("classes.department")}
                onChange={(e) => setDepartment(e.target.value)}
                id="select-class-department"
                sx={{ borderRadius: "12px" }}
              >
                <MenuItem value="OM">OM (Operations Maintenance)</MenuItem>
                <MenuItem value="SD">SD (Software Development)</MenuItem>
              </Select>
            </FormControl>

            {/* Capacity */}
            <TextField
              label={t("classes.capacity")}
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
              fullWidth
              id="input-class-capacity"
              inputProps={{ min: 1, max: 500 }}
              helperText="Allowed range: 1 - 500 students"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "12px" },
              }}
            />

            {/* Active Status Switch (only in edit mode) */}
            {isEditMode && (
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    color="primary"
                    id="switch-class-active"
                  />
                }
                label={isActive ? t("classes.active") : t("classes.inactive")}
                sx={{ ml: 0.5 }}
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            id="btn-submit-class-settings"
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              px: 3,
            }}
          >
            {isEditMode ? t("classes.saveChanges") : t("classes.createClassButton")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
