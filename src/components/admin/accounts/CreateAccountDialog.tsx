"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountFormOptions, CreateAccountPayload, RoleOption } from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

interface CreateAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: RoleOption[];
}

export default function CreateAccountDialog({
  open,
  onClose,
  onSuccess,
  roles,
}: CreateAccountDialogProps) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form options (roles, academic years, classes, departments)
  const [formOptions, setFormOptions] = useState<AccountFormOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState("Teacher");

  // Password mode: "auto" or "custom"
  const [passwordMode, setPasswordMode] = useState<"auto" | "custom">("auto");
  const [customPassword, setCustomPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // Generated password result state
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingOptions(true);
      AdminAccountsAPI.getFormOptions()
        .then((options) => {
          setFormOptions(options);
        })
        .catch((err) => {
          console.error("Failed to load account form options:", err);
        })
        .finally(() => {
          setLoadingOptions(false);
        });
    }
  }, [open]);

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

  const resetForm = () => {
    setUsername("");
    setUsernameTouched(false);
    setEmail("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setPhoneNumber("");
    setSelectedRole("Teacher");
    setPasswordMode("auto");
    setCustomPassword("");
    setShowPassword(false);
    setTeacherDepartmentId("");
    setQualifications("");
    setNationalId("");
    setStudentCode("");
    setGender("Male");
    setAddress("");
    setAcademicYearId("");
    setClassId("");
    setStudentDepartmentId("");
    setError(null);
    setGeneratedPassword(null);
    setCopied(false);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!usernameTouched) {
      const atIndex = val.indexOf("@");
      const localPart = atIndex >= 0 ? val.substring(0, atIndex) : val;
      const plusIndex = localPart.indexOf("+");
      const cleanLocal = plusIndex >= 0 ? localPart.substring(0, plusIndex) : localPart;
      const sanitized = cleanLocal.replace(/[^a-zA-Z0-9._-]/g, "");
      setUsername(sanitized);
    }
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      appToast.error(t("accounts.dialogs.create.copyFailed", { defaultMessage: "Failed to copy password." }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedUser = username.trim();
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
    if (trimmedUser) {
      if (trimmedUser.length > 100) {
        setError(t("accounts.validations.usernameLength", { defaultMessage: "Username cannot exceed 100 characters." }));
        return;
      }
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUser)) {
        setError(t("accounts.validations.usernameInvalid", { defaultMessage: "Username can only contain letters, numbers, dots, underscores, and hyphens." }));
        return;
      }
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

    if (passwordMode === "custom" && customPassword.length < 8) {
      setError(t("accounts.validations.passwordLength"));
      return;
    }

    if (trimmedPhone) {
      const phoneRegex = /^[+]?[(]?[0-9\u0660-\u0669]{1,4}[)]?[-\s./0-9\u0660-\u0669]{3,20}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        setError(t("accounts.validations.phoneInvalid"));
        return;
      }
    }

    const payload: CreateAccountPayload = {
      username: trimmedUser || undefined,
      email: trimmedEmail,
      firstName: trimmedFirst,
      middleName: middleName.trim() || undefined,
      lastName: trimmedLast,
      phoneNumber: trimmedPhone || undefined,
      role: selectedRole,
      password: passwordMode === "custom" ? customPassword : undefined,
    };

    if (selectedRole === "Teacher") {
      payload.qualifications = qualifications.trim() || undefined;
      payload.departmentId = teacherDepartmentId ? Number(teacherDepartmentId) : undefined;
    } else if (selectedRole === "Student") {
      payload.nationalId = nationalId.trim() || undefined;
      payload.studentCode = studentCode.trim() || undefined;
      payload.gender = gender;
      payload.address = address.trim() || undefined;
      payload.academicYearId = academicYearId ? Number(academicYearId) : undefined;
      payload.classId = classId ? Number(classId) : undefined;
      payload.departmentId = studentDepartmentId ? Number(studentDepartmentId) : undefined;
    }

    setLoading(true);
    try {
      const result = await AdminAccountsAPI.createAccount(payload);
      appToast.success(t("accounts.dialogs.create.success"));

      if (result.generatedInitialPassword) {
        // Keep dialog open to show generated password
        setGeneratedPassword(result.generatedInitialPassword);
        onSuccess();
      } else {
        onSuccess();
        handleClose();
      }
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const rolesToRender = formOptions?.roles?.length ? formOptions.roles : roles;
  const filteredClasses = (formOptions?.classes || []).filter((c) => {
    if (!academicYearId) return true;
    return c.academicYearId === academicYearId;
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          {generatedPassword ? t("accounts.dialogs.create.generatedPasswordTitle") : t("accounts.dialogs.create.title")}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {generatedPassword ? (
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {t("accounts.dialogs.create.success")}
            </Alert>

            <Typography variant="body2" color="text.secondary">
              {t("accounts.dialogs.create.generatedPasswordNotice")}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50"),
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("accounts.dialogs.create.username")}
                </Typography>
                <Typography variant="body1" fontWeight={700} sx={{ fontFamily: "monospace", mb: 1 }}>
                  {username || email}
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block">
                  {t("accounts.dialogs.create.generatedPasswordTitle")}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="primary.main"
                  sx={{ fontFamily: "monospace", letterSpacing: 1 }}
                >
                  {generatedPassword}
                </Typography>
              </Box>

              <Button
                variant={copied ? "contained" : "outlined"}
                color={copied ? "success" : "primary"}
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopyPassword}
                sx={{ minWidth: 140 }}
              >
                {copied ? t("accounts.dialogs.create.copied") : t("accounts.dialogs.create.copyPassword")}
              </Button>
            </Paper>
          </Stack>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {t("accounts.dialogs.create.basicInfo")}
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
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label={t("accounts.dialogs.create.username")}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameTouched(true);
                  }}
                  fullWidth
                  disabled={loading}
                  helperText={t("accounts.dialogs.create.usernameHelper")}
                  placeholder="e.g. john.doe"
                />
              </Box>

              <TextField
                label={t("accounts.dialogs.create.phone")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="e.g. 01012345678"
                helperText={t("accounts.dialogs.create.phoneHelper")}
              />

              <Divider />

              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {t("accounts.dialogs.create.roleSelection")}
              </Typography>

              <FormControl fullWidth disabled={loading}>
                <InputLabel>{t("accounts.dialogs.create.role")}</InputLabel>
                <Select
                  value={selectedRole}
                  label={t("accounts.dialogs.create.role")}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {rolesToRender.map((r) => {
                    let label = r.roleName;
                    if (r.normalizedName === "Admin") label = t("accounts.roles.Admin");
                    else if (r.normalizedName === "StudentAffairs") label = t("accounts.roles.StudentAffairs");
                    else if (r.normalizedName === "Teacher") label = t("accounts.roles.Teacher");
                    else if (r.normalizedName === "Student") label = t("accounts.roles.Student");
                    return (
                      <MenuItem key={r.roleId} value={r.roleName}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Dynamic Teacher fields */}
              {selectedRole === "Teacher" && (
                <Stack spacing={2} sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}>
                  <FormControl fullWidth disabled={loading || loadingOptions}>
                    <InputLabel>{t("accounts.dialogs.create.department")}</InputLabel>
                    <Select
                      value={teacherDepartmentId}
                      label={t("accounts.dialogs.create.department")}
                      onChange={(e) => setTeacherDepartmentId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <MenuItem value="">
                        <em>{t("accounts.dialogs.create.noDepartment")}</em>
                      </MenuItem>
                      {formOptions?.departments.map((d) => (
                        <MenuItem key={d.departmentId} value={d.departmentId}>
                          {d.departmentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label={t("accounts.dialogs.create.qualifications")}
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    fullWidth
                    disabled={loading}
                    placeholder="e.g. B.Sc. in Computer Science"
                  />
                </Stack>
              )}

              {/* Dynamic Student fields */}
              {selectedRole === "Student" && (
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
                      <InputLabel>{t("accounts.dialogs.create.academicYear")}</InputLabel>
                      <Select
                        value={academicYearId}
                        label={t("accounts.dialogs.create.academicYear")}
                        onChange={(e) => handleAcademicYearChange(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.create.selectAcademicYear")}</em>
                        </MenuItem>
                        {formOptions?.academicYears.map((ay) => (
                          <MenuItem key={ay.academicYearId} value={ay.academicYearId}>
                            {ay.yearName} {ay.stage ? `(${ay.stage})` : ""}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={loading || loadingOptions}>
                      <InputLabel>{t("accounts.dialogs.create.class")}</InputLabel>
                      <Select
                        value={classId}
                        label={t("accounts.dialogs.create.class")}
                        onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.create.unassignedClass")}</em>
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
                      <InputLabel>{t("accounts.dialogs.create.department")}</InputLabel>
                      <Select
                        value={studentDepartmentId}
                        label={t("accounts.dialogs.create.department")}
                        onChange={(e) => setStudentDepartmentId(e.target.value ? Number(e.target.value) : "")}
                      >
                        <MenuItem value="">
                          <em>{t("accounts.dialogs.create.noDepartment")}</em>
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
                    label={t("accounts.dialogs.create.address")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                    disabled={loading}
                  />
                </Stack>
              )}

              <Divider />

              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {t("accounts.dialogs.create.passwordSection")}
              </Typography>

              <RadioGroup
                value={passwordMode}
                onChange={(e) => setPasswordMode(e.target.value as "auto" | "custom")}
              >
                <FormControlLabel
                  value="auto"
                  control={<Radio disabled={loading} />}
                  label={t("accounts.dialogs.create.generatePassword")}
                />
                <FormControlLabel
                  value="custom"
                  control={<Radio disabled={loading} />}
                  label={t("accounts.dialogs.create.customPassword")}
                />
              </RadioGroup>

              {passwordMode === "custom" && (
                <TextField
                  label={t("accounts.dialogs.create.password")}
                  type={showPassword ? "text" : "password"}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                  helperText="Minimum 8 characters with upper, lower, numbers, and symbols"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={handleClose} disabled={loading} color="inherit">
              {t("accounts.dialogs.create.cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : undefined}>
              {t("accounts.dialogs.create.submit")}
            </Button>
          </DialogActions>
        </form>
      )}

      {generatedPassword && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} variant="contained">
            {t("accounts.dialogs.details.close")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
