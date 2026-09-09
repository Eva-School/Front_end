"use client";

import React, { useState } from "react";
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
import { CreateAccountPayload, RoleOption } from "@/types/account.types";
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

  // Form fields
  const [username, setUsername] = useState("");
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
  const [qualifications, setQualifications] = useState("");

  // Student fields
  const [nationalId, setNationalId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");

  // Generated password result state
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setPhoneNumber("");
    setSelectedRole("Teacher");
    setPasswordMode("auto");
    setCustomPassword("");
    setShowPassword(false);
    setQualifications("");
    setNationalId("");
    setStudentCode("");
    setGender("Male");
    setAddress("");
    setError(null);
    setGeneratedPassword(null);
    setCopied(false);
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
    if (!trimmedUser) {
      setError(t("accounts.validations.usernameRequired"));
      return;
    }
    if (trimmedUser.length < 3 || trimmedUser.length > 100) {
      setError(t("accounts.validations.usernameLength"));
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUser)) {
      setError(t("accounts.validations.usernameInvalid"));
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
      username: trimmedUser,
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
    } else if (selectedRole === "Student") {
      payload.nationalId = nationalId.trim() || undefined;
      payload.studentCode = studentCode.trim() || undefined;
      payload.gender = gender;
      payload.address = address.trim() || undefined;
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: (theme) => theme.palette.action.hover,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" fontFamily="monospace" fontWeight={700} sx={{ letterSpacing: 1.5 }}>
                {generatedPassword}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={handleCopyPassword}
                color={copied ? "success" : "primary"}
              >
                {copied ? t("accounts.dialogs.create.copied") : t("accounts.dialogs.create.copyPassword")}
              </Button>
            </Paper>
          </Stack>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
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
                  label={t("accounts.dialogs.create.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                  helperText="Letters, numbers, dots, hyphens"
                />
                <TextField
                  label={t("accounts.dialogs.create.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                />
              </Box>

              <TextField
                label={t("accounts.dialogs.create.phone")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="e.g. 01012345678"
                helperText={t("accounts.dialogs.create.phoneHelper", { defaultMessage: "Optional. e.g. 01012345678 or +201012345678" })}
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
                  {roles.map((r) => {
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
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: (theme) => theme.palette.action.hover }}>
                  <TextField
                    label={t("accounts.dialogs.create.qualifications")}
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    fullWidth
                    disabled={loading}
                    placeholder="e.g. B.Sc. in Computer Science"
                  />
                </Box>
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
                  <TextField
                    label="Address"
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
