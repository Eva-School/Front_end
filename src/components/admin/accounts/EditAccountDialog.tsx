"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import {
  AccountDetail,
  AccountFormOptions,
  UpdateAccountProfilePayload,
} from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

interface EditAccountDialogProps {
  open: boolean;
  account?: AccountDetail | null;
  accountId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAccountDialog({
  open,
  account,
  accountId,
  onClose,
  onSuccess,
}: EditAccountDialogProps) {
  const t = useTranslations();

  const [detail, setDetail] = useState<AccountDetail | null>(account || null);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form options (academic years, classes, departments)
  const [formOptions, setFormOptions] = useState<AccountFormOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Common identity fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Teacher fields
  const [teacherDepartmentId, setTeacherDepartmentId] = useState<number | "">("");
  const [qualifications, setQualifications] = useState("");

  // Student fields
  const [nationalId, setNationalId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");
  const [academicYearId, setAcademicYearId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [studentDepartmentId, setStudentDepartmentId] = useState<number | "">("");

  useEffect(() => {
    if (open) {
      setLoadingOptions(true);
      AdminAccountsAPI.getFormOptions()
        .then((options) => {
          setFormOptions(options);
        })
        .catch((err) => {
          console.error("Failed to load form options:", err);
        })
        .finally(() => {
          setLoadingOptions(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (account) {
      queueMicrotask(() => {
        setDetail(account);
      });
    } else if (open && accountId) {
      queueMicrotask(() => {
        setFetching(true);
      });
      AdminAccountsAPI.getAccountById(accountId)
        .then((res) => {
          setDetail(res);
        })
        .catch((err) => {
          setError(err?.message || "Failed to load account details");
        })
        .finally(() => setFetching(false));
    } else {
      queueMicrotask(() => {
        setDetail(null);
      });
    }
  }, [open, account, accountId]);

  useEffect(() => {
    if (detail) {
      queueMicrotask(() => {
        setFirstName(detail.firstName || "");
        setMiddleName(detail.middleName || "");
        setLastName(detail.lastName || "");
        setEmail(detail.email || "");
        setPhoneNumber(detail.phoneNumber || "");

        if (detail.teacherProfile) {
          setQualifications(detail.teacherProfile.qualifications || "");
          setTeacherDepartmentId(detail.teacherProfile.departmentId ?? "");
        }
        if (detail.studentProfile) {
          setNationalId(detail.studentProfile.nationalId || "");
          setStudentCode(detail.studentProfile.studentCode || "");
          setGender(detail.studentProfile.gender || "Male");
          setAddress(detail.studentProfile.address || "");
          setAcademicYearId(detail.studentProfile.currentAcademicYearId ?? "");
          setClassId(detail.studentProfile.classId ?? "");
          setStudentDepartmentId(detail.studentProfile.departmentId ?? "");
        }
        setError(null);
      });
    }
  }, [detail]);

  const handleClassChange = (newClassId: number | "") => {
    setClassId(newClassId);
    if (newClassId && formOptions) {
      const cls = formOptions.classes.find((c) => c.classId === newClassId);
      if (cls) {
        if (cls.academicYearId && (!academicYearId || academicYearId !== cls.academicYearId)) {
          setAcademicYearId(cls.academicYearId);
        }
        if (cls.departmentId && !studentDepartmentId) {
          setStudentDepartmentId(cls.departmentId);
        }
      }
    }
  };

  const handleAcademicYearChange = (newYearId: number | "") => {
    setAcademicYearId(newYearId);
    if (newYearId && classId && formOptions) {
      const cls = formOptions.classes.find((c) => c.classId === classId);
      if (cls && cls.academicYearId !== newYearId) {
        setClassId("");
      }
    }
  };

  const isTeacher =
    detail?.role === "Teacher" ||
    detail?.normalizedRole === "Teacher" ||
    !!detail?.teacherProfile;

  const isStudent =
    detail?.role === "Student" ||
    detail?.normalizedRole === "Student" ||
    !!detail?.studentProfile;

  const filteredClasses = (formOptions?.classes || []).filter((c) => {
    if (!academicYearId) return true;
    return c.academicYearId === academicYearId;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedFirst) {
      setError(t("accounts.validations.firstNameRequired"));
      return;
    }
    if (!trimmedLast) {
      setError(t("accounts.validations.lastNameRequired"));
      return;
    }
    if (!trimmedEmail) {
      setError(t("accounts.validations.emailRequired"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(t("accounts.validations.emailInvalid"));
      return;
    }

    if (trimmedPhone) {
      const phoneRegex = /^[+]?[(]?[0-9\u0660-\u0669]{1,4}[)]?[-\s./0-9\u0660-\u0669]{3,20}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        setError(t("accounts.validations.phoneInvalid"));
        return;
      }
    }

    const payload: UpdateAccountProfilePayload = {
      firstName: trimmedFirst,
      middleName: middleName.trim() || undefined,
      lastName: trimmedLast,
      email: trimmedEmail,
      phoneNumber: trimmedPhone || undefined,
    };

    if (isTeacher) {
      payload.qualifications = qualifications.trim() || undefined;
      payload.departmentId = teacherDepartmentId ? Number(teacherDepartmentId) : undefined;
    }
    if (isStudent) {
      payload.nationalId = nationalId.trim() || undefined;
      payload.studentCode = studentCode.trim() || undefined;
      payload.gender = gender;
      payload.address = address.trim() || undefined;
      payload.academicYearId = academicYearId ? Number(academicYearId) : undefined;
      payload.classId = classId === "" ? 0 : Number(classId);
      payload.departmentId = studentDepartmentId ? Number(studentDepartmentId) : undefined;
    }

    setLoading(true);
    try {
      await AdminAccountsAPI.updateAccount(detail.userId, payload);
      appToast.success(t("accounts.dialogs.edit.success"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          {t("accounts.dialogs.edit.title")}
        </Typography>
        <IconButton onClick={onClose} disabled={loading} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {fetching ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              {t("accounts.dialogs.edit.description", { name: detail?.fullName || detail?.username || "" })}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              <TextField
                label={t("accounts.dialogs.create.firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("accounts.dialogs.create.middleName")}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                fullWidth
                disabled={loading}
              />
              <TextField
                label={t("accounts.dialogs.create.lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                disabled={loading}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label={t("accounts.dialogs.create.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                disabled={loading}
              />

              <TextField
                label={t("accounts.dialogs.create.phone")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="e.g. 01012345678"
                helperText={t("accounts.dialogs.create.phoneHelper")}
              />
            </Box>

            {/* Role specific profile fields */}
            {isTeacher && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="primary" fontWeight={700}>
                  {t("accounts.dialogs.details.profileInfo")}
                </Typography>
                <Stack spacing={2} sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}>
                  <FormControl fullWidth disabled={loading || loadingOptions}>
                    <InputLabel>{t("accounts.dialogs.edit.department")}</InputLabel>
                    <Select
                      value={teacherDepartmentId}
                      label={t("accounts.dialogs.edit.department")}
                      onChange={(e) => setTeacherDepartmentId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <MenuItem value="">
                        <em>{t("accounts.dialogs.edit.noDepartment")}</em>
                      </MenuItem>
                      {formOptions?.departments.map((d) => (
                        <MenuItem key={d.departmentId} value={d.departmentId}>
                          {d.departmentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={t("accounts.dialogs.edit.qualifications")}
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    fullWidth
                    disabled={loading}
                    placeholder={t("accounts.dialogs.edit.qualificationsPlaceholder")}
                  />
                </Stack>
              </>
            )}

            {isStudent && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="primary" fontWeight={700}>
                  {t("accounts.dialogs.details.profileInfo")}
                </Typography>
                <Stack spacing={2} sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField
                      label={t("accounts.dialogs.create.nationalId")}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      fullWidth
                      disabled={loading}
                    />
                    <TextField
                      label={t("accounts.dialogs.create.studentCode")}
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      fullWidth
                      disabled={loading}
                    />
                  </Box>

                  {/* Academic Stage / Year and Class Assignment */}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <FormControl fullWidth disabled={loading || loadingOptions}>
                      <InputLabel>{t("accounts.dialogs.edit.academicYear")}</InputLabel>
                      <Select
                        value={academicYearId}
                        label={t("accounts.dialogs.edit.academicYear")}
                        onChange={(e) => handleAcademicYearChange(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.edit.selectAcademicYear")}</em>
                        </MenuItem>
                        {formOptions?.academicYears.map((ay) => (
                          <MenuItem key={ay.academicYearId} value={ay.academicYearId}>
                            {ay.yearName} {ay.stage ? `(${ay.stage})` : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={loading || loadingOptions}>
                      <InputLabel>{t("accounts.dialogs.edit.class")}</InputLabel>
                      <Select
                        value={classId}
                        label={t("accounts.dialogs.edit.class")}
                        onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.edit.unassignedClass")}</em>
                        </MenuItem>
                        {filteredClasses.map((cls) => {
                          const capacityInfo = cls.capacity ? `${cls.currentStudentCount}/${cls.capacity}` : `${cls.currentStudentCount}`;
                          return (
                            <MenuItem key={cls.classId} value={cls.classId}>
                              {cls.className} ({capacityInfo}) {cls.departmentName ? `- ${cls.departmentName}` : ""}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <FormControl fullWidth disabled={loading || loadingOptions}>
                      <InputLabel>{t("accounts.dialogs.edit.department")}</InputLabel>
                      <Select
                        value={studentDepartmentId}
                        label={t("accounts.dialogs.edit.department")}
                        onChange={(e) => setStudentDepartmentId(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.edit.noDepartment")}</em>
                        </MenuItem>
                        {formOptions?.departments.map((d) => (
                          <MenuItem key={d.departmentId} value={d.departmentId}>
                            {d.departmentName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={loading}>
                      <InputLabel>{t("accounts.dialogs.create.gender")}</InputLabel>
                      <Select
                        value={gender}
                        label={t("accounts.dialogs.create.gender")}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <MenuItem value="Male">{t("accounts.dialogs.create.male")}</MenuItem>
                        <MenuItem value="Female">{t("accounts.dialogs.create.female")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <TextField
                    label={t("accounts.dialogs.edit.address")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                </Stack>
              </>
            )}
          </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            {t("accounts.dialogs.edit.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : undefined}>
            {t("accounts.dialogs.edit.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

