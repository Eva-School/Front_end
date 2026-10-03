"use client";

import React, { useState } from "react";
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
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountSummary } from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

function generateSecureRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;

  const getRandomChar = (str: string) => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return str[array[0] % str.length];
  };

  const passwordChars = [
    getRandomChar(upper),
    getRandomChar(lower),
    getRandomChar(digits),
    getRandomChar(symbols),
  ];

  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(getRandomChar(all));
  }

  // Shuffle using Fisher-Yates with crypto randomness
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const j = array[0] % (i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}

interface ResetPasswordDialogProps {
  open: boolean;
  account: AccountSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordDialog({
  open,
  account,
  onClose,
  onSuccess,
}: ResetPasswordDialogProps) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setNewPassword("");
    setShowPassword(false);
    setCopied(false);
    setError(null);
    onClose();
  };

  const handleGenerateRandom = () => {
    const randomPwd = generateSecureRandomPassword(12);
    setNewPassword(randomPwd);
    setShowPassword(true);
    setCopied(false);
    setError(null);
  };

  const handleCopyPassword = async () => {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      appToast.success(t("accounts.dialogs.resetPassword.copied"));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      appToast.error(t("accounts.dialogs.generateCredential.copyFailed"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setError(null);

    const trimmedPassword = newPassword.trim();
    if (!trimmedPassword) {
      setError(t("accounts.validations.passwordRequired"));
      return;
    }

    if (trimmedPassword.length < 8) {
      setError(t("accounts.validations.passwordLength"));
      return;
    }

    setLoading(true);
    try {
      await AdminAccountsAPI.resetPassword(account.userId, { newPassword: trimmedPassword });
      appToast.success(t("accounts.dialogs.resetPassword.success"));
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          {t("accounts.dialogs.resetPassword.title")}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              {t("accounts.dialogs.resetPassword.description", {
                name: account?.fullName || "",
                username: account?.username || "",
              })}
            </Typography>

            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
              {t("accounts.dialogs.resetPassword.warning")}
            </Alert>

            {/* Random Password Quick Generator Button */}
            <Button
              type="button"
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<ShuffleIcon fontSize="small" />}
              onClick={handleGenerateRandom}
              disabled={loading}
              sx={{
                py: 0.9,
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                display: "flex",
                justifyContent: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  borderColor: (theme) => theme.palette.primary.main,
                },
              }}
            >
              {t("accounts.dialogs.resetPassword.generateRandom")}
            </Button>

            <TextField
              label={t("accounts.dialogs.resetPassword.newPassword")}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setCopied(false);
              }}
              required
              fullWidth
              autoFocus
              disabled={loading}
              helperText="Minimum 8 characters (upper, lower, number, special character)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {/* Copy Password Button (visible when password entered) */}
                    {newPassword && (
                      <Tooltip
                        title={
                          copied
                            ? t("accounts.dialogs.resetPassword.copied")
                            : t("accounts.dialogs.resetPassword.copyPassword")
                        }
                        arrow
                      >
                        <IconButton
                          onClick={handleCopyPassword}
                          edge="end"
                          size="small"
                          color={copied ? "success" : "default"}
                          aria-label="copy password"
                          sx={{ mr: 0.5 }}
                        >
                          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Shuffle / Random Button */}
                    <Tooltip title={t("accounts.dialogs.resetPassword.generateRandom")} arrow>
                      <IconButton
                        onClick={handleGenerateRandom}
                        edge="end"
                        size="small"
                        disabled={loading}
                        aria-label="generate random password"
                        sx={{ mr: 0.5 }}
                      >
                        <ShuffleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Toggle Visibility */}
                    <Tooltip
                      title={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      arrow
                    >
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} disabled={loading} color="inherit">
            {t("accounts.dialogs.resetPassword.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {t("accounts.dialogs.resetPassword.submit")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

