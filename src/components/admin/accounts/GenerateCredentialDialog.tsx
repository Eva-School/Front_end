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
  Divider,
  IconButton,
  InputAdornment,
  Box,
  Paper,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import { useTranslations } from "next-intl";

import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import {
  CreateCredentialsForExistingPayload,
  CreateCredentialsResult,
  UncredentialedAccountSummary,
} from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

interface GenerateCredentialDialogProps {
  open: boolean;
  account: UncredentialedAccountSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateCredentialDialog({
  open,
  account,
  onClose,
  onSuccess,
}: GenerateCredentialDialogProps) {
  const t = useTranslations();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [username, setUsername] = useState("");
  const [emailStrategy, setEmailStrategy] = useState<"registered" | "institutional" | "custom">("registered");
  const [customEmail, setCustomEmail] = useState("");
  const [passwordStrategy, setPasswordStrategy] = useState<"auto" | "custom">("auto");
  const [customPassword, setCustomPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Result state
  const [createdResult, setCreatedResult] = useState<CreateCredentialsResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize form state when account changes
  useEffect(() => {
    if (account && open) {
      setError(null);
      setCreatedResult(null);
      setCopiedField(null);
      setPasswordStrategy("auto");
      setCustomPassword("");
      setShowPassword(false);

      // Pre-fill username from identifier or email
      if (account.identifier) {
        setUsername(account.identifier.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
      } else {
        setUsername("");
      }

      // If user's email is already registered elsewhere in the data, make it the default option
      const regEmail = (account.registeredEmail || account.email || "").trim();
      if (regEmail) {
        setEmailStrategy("registered");
        setCustomEmail(regEmail);
      } else {
        setEmailStrategy("institutional");
        setCustomEmail("");
      }
    }
  }, [account, open]);

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setCreatedResult(null);
    onClose();
  };

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      appToast.success(t("accounts.dialogs.generateCredential.copied"));
      setTimeout(() => {
        setCopiedField((curr) => (curr === fieldName ? null : curr));
      }, 2500);
    } catch {
      appToast.error(t("accounts.dialogs.generateCredential.copyFailed"));
    }
  };

  const handleCopyAll = async () => {
    if (!createdResult) return;
    const block = [
      `Name: ${createdResult.fullName}`,
      `Role: ${createdResult.role}`,
      `Username: ${createdResult.username}`,
      `Password: ${createdResult.generatedPassword}`,
      `Email: ${createdResult.email}`,
    ].join("\n");

    await handleCopy(block, "all");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setError(null);

    if (passwordStrategy === "custom") {
      const trimmedPwd = customPassword.trim();
      if (!trimmedPwd) {
        setError(t("accounts.validations.passwordRequired"));
        return;
      }
      if (trimmedPwd.length < 8) {
        setError(t("accounts.validations.passwordLength"));
        return;
      }
    }

    const regEmail = (account.registeredEmail || account.email || "").trim();
    let resolvedEmail: string | undefined = undefined;

    if (emailStrategy === "registered") {
      resolvedEmail = regEmail || undefined;
    } else if (emailStrategy === "custom") {
      if (!customEmail.trim()) {
        setError(t("accounts.validations.emailRequired"));
        return;
      }
      resolvedEmail = customEmail.trim();
    } else if (emailStrategy === "institutional") {
      resolvedEmail = undefined; // backend auto-generates institutional format
    }

    const payload: CreateCredentialsForExistingPayload = {
      accountType: account.accountType,
      entityId: account.entityId,
      username: username.trim() || undefined,
      email: resolvedEmail,
      password: passwordStrategy === "custom" ? customPassword.trim() : undefined,
    };

    setLoading(true);
    try {
      const res = await AdminAccountsAPI.createCredentialsForExisting(payload);
      setCreatedResult(res);
      appToast.success(t("accounts.dialogs.generateCredential.success"));
      onSuccess();
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        component="div"
        sx={{
          m: 0,
          p: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VpnKeyIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {createdResult
                ? t("accounts.dialogs.generateCredential.resultTitle")
                : t("accounts.dialogs.generateCredential.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {account.accountType === "Student"
                ? t("accounts.roles.Student")
                : account.accountType === "Teacher"
                ? t("accounts.roles.Teacher")
                : t("accounts.roles.Admin")}{" "}
              • {account.identifier}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {createdResult ? (
        // Result Screen
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="success" icon={<ShieldIcon />} sx={{ borderRadius: "12px" }}>
              {t("accounts.dialogs.generateCredential.resultNotice")}
            </Alert>

            {/* Credential Card */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: "14px",
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                borderColor: theme.palette.divider,
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.user")}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {createdResult.fullName}
                  </Typography>
                </Box>

                <Divider />

                {/* Username */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.generateCredential.username")}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 0.5 }}
                    >
                      {createdResult.username}
                    </Typography>
                  </Box>
                  <Tooltip title={copiedField === "username" ? t("accounts.dialogs.generateCredential.copied") : t("accounts.dialogs.create.copyPassword")}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(createdResult.username, "username")}
                      color={copiedField === "username" ? "success" : "default"}
                    >
                      {copiedField === "username" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Password */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.generateCredential.password")}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        letterSpacing: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "8px",
                        display: "inline-block",
                      }}
                    >
                      {createdResult.generatedPassword}
                    </Typography>
                  </Box>
                  <Tooltip title={copiedField === "password" ? t("accounts.dialogs.generateCredential.copied") : t("accounts.dialogs.create.copyPassword")}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(createdResult.generatedPassword, "password")}
                      color={copiedField === "password" ? "success" : "default"}
                    >
                      {copiedField === "password" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Email */}
                {createdResult.email && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("accounts.dialogs.generateCredential.email")}
                      </Typography>
                      <Typography variant="body2">{createdResult.email}</Typography>
                    </Box>
                    <Tooltip title={copiedField === "email" ? t("accounts.dialogs.generateCredential.copied") : t("accounts.dialogs.create.copyPassword")}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(createdResult.email, "email")}
                        color={copiedField === "email" ? "success" : "default"}
                      >
                        {copiedField === "email" ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Stack>
            </Paper>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={copiedField === "all" ? <CheckIcon /> : <ContentCopyIcon />}
              onClick={handleCopyAll}
              sx={{ borderRadius: "10px", py: 1 }}
            >
              {copiedField === "all"
                ? t("accounts.dialogs.generateCredential.copied")
                : t("accounts.dialogs.generateCredential.copyAll")}
            </Button>
          </Stack>
        </DialogContent>
      ) : (
        // Generation Form
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: "10px" }}>
                  {error}
                </Alert>
              )}

              {/* Target Entity Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: alpha(theme.palette.background.default, 0.6),
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.info.main, 0.15),
                      color: theme.palette.info.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {account.accountType === "Student" ? (
                      <SchoolIcon fontSize="small" />
                    ) : account.accountType === "Teacher" ? (
                      <WorkIcon fontSize="small" />
                    ) : (
                      <PersonIcon fontSize="small" />
                    )}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {account.fullName}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={account.identifier}
                        sx={{ fontFamily: "monospace", fontSize: "0.75rem", height: 22 }}
                      />
                      {account.className && (
                        <Chip size="small" variant="outlined" label={account.className} sx={{ height: 22 }} />
                      )}
                      {account.departmentName && (
                        <Chip size="small" variant="outlined" label={account.departmentName} sx={{ height: 22 }} />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Username Input */}
              <TextField
                label={t("accounts.dialogs.generateCredential.username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                helperText={t("accounts.dialogs.generateCredential.usernameHelper")}
                size="small"
                fullWidth
                inputProps={{ style: { fontFamily: "monospace" } }}
              />

              {/* Email Strategy Section */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("accounts.dialogs.generateCredential.emailStrategy")}
                </Typography>

                <RadioGroup
                  value={emailStrategy}
                  onChange={(e) => setEmailStrategy(e.target.value as "registered" | "institutional" | "custom")}
                >
                  {(account.registeredEmail || account.email) && (
                    <FormControlLabel
                      value="registered"
                      control={<Radio size="small" />}
                      label={
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                          <Typography variant="body2" fontWeight={600}>
                            {t("accounts.dialogs.generateCredential.useRegisteredEmail", {
                              email: account.registeredEmail || account.email || "",
                            })}
                          </Typography>
                          <Chip
                            size="small"
                            color="success"
                            variant="outlined"
                            label={t("accounts.dialogs.generateCredential.registeredEmailBadge")}
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                          />
                        </Stack>
                      }
                    />
                  )}

                  <FormControlLabel
                    value="institutional"
                    control={<Radio size="small" />}
                    label={t("accounts.dialogs.generateCredential.autoInstitutionalEmail")}
                  />

                  <FormControlLabel
                    value="custom"
                    control={<Radio size="small" />}
                    label={t("accounts.dialogs.generateCredential.customEmailOption")}
                  />
                </RadioGroup>

                {emailStrategy === "custom" && (
                  <TextField
                    label={t("accounts.dialogs.generateCredential.email")}
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mt: 1.5 }}
                    required
                  />
                )}
              </Box>

              {/* Password Strategy */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t("accounts.dialogs.generateCredential.passwordStrategy")}
                </Typography>
                <RadioGroup
                  value={passwordStrategy}
                  onChange={(e) => setPasswordStrategy(e.target.value as "auto" | "custom")}
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio size="small" />}
                    label={t("accounts.dialogs.generateCredential.autoPassword")}
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio size="small" />}
                    label={t("accounts.dialogs.generateCredential.customPassword")}
                  />
                </RadioGroup>
              </Box>

              {/* Custom Password Input */}
              {passwordStrategy === "custom" && (
                <TextField
                  label={t("accounts.dialogs.generateCredential.password")}
                  type={showPassword ? "text" : "password"}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  size="small"
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleClose} disabled={loading} color="inherit">
              {t("accounts.dialogs.generateCredential.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <VpnKeyIcon />}
              sx={{ borderRadius: "10px", px: 2.5, fontWeight: 700 }}
            >
              {t("accounts.dialogs.generateCredential.submit")}
            </Button>
          </DialogActions>
        </form>
      )}

      {createdResult && (
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleClose} variant="contained" fullWidth sx={{ borderRadius: "10px", fontWeight: 700 }}>
            {t("accounts.dialogs.generateCredential.done")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
