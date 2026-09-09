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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountSummary } from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

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

  const handleClose = () => {
    if (loading) return;
    setNewPassword("");
    setShowPassword(false);
    setError(null);
    onClose();
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

            <TextField
              label={t("accounts.dialogs.resetPassword.newPassword")}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              autoFocus
              disabled={loading}
              helperText="Minimum 8 characters (upper, lower, number, special character)"
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
