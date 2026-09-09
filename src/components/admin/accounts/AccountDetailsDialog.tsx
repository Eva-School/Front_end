"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Box,
  Chip,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountDetail } from "@/types/account.types";

interface AccountDetailsDialogProps {
  open: boolean;
  userId: number | null;
  onClose: () => void;
}

export default function AccountDetailsDialog({
  open,
  userId,
  onClose,
}: AccountDetailsDialogProps) {
  const t = useTranslations();

  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      queueMicrotask(() => {
        setLoading(true);
        setError(null);
      });
      AdminAccountsAPI.getAccountById(userId)
        .then((data) => setAccount(data))
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load account details."))
        .finally(() => setLoading(false));
    } else {
      queueMicrotask(() => {
        setAccount(null);
      });
    }
  }, [open, userId]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return { bg: "rgba(124, 77, 255, 0.12)", color: "#7c4dff", border: "rgba(124, 77, 255, 0.3)" };
      case "Student Affairs":
      case "StudentAffairs":
        return { bg: "rgba(25, 118, 210, 0.12)", color: "#1976d2", border: "rgba(25, 118, 210, 0.3)" };
      case "Teacher":
        return { bg: "rgba(0, 150, 136, 0.12)", color: "#00897b", border: "rgba(0, 150, 136, 0.3)" };
      case "Student":
        return { bg: "rgba(245, 124, 0, 0.12)", color: "#f57c00", border: "rgba(245, 124, 0, 0.3)" };
      default:
        return { bg: "rgba(158, 158, 158, 0.12)", color: "#757575", border: "rgba(158, 158, 158, 0.3)" };
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return t("accounts.never");
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const roleStyle = getRoleColor(account?.role || "");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          {t("accounts.dialogs.details.title")}
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" py={3} textAlign="center">
            {error}
          </Typography>
        ) : account ? (
          <Stack spacing={3}>
            {/* Header info */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {account.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{account.username} • ID: {account.userId}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={t(`accounts.roles.${account.normalizedRole}`, { defaultMessage: account.role })}
                  sx={{
                    fontWeight: 700,
                    bgcolor: roleStyle.bg,
                    color: roleStyle.color,
                    border: `1px solid ${roleStyle.border}`,
                  }}
                />
                <Chip
                  label={account.isActive ? t("accounts.active") : t("accounts.inactive")}
                  color={account.isActive ? "success" : "default"}
                  size="small"
                  variant={account.isActive ? "filled" : "outlined"}
                />
              </Stack>
            </Box>

            {/* Overview Paper */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1.5}>
                {t("accounts.dialogs.details.overview")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.email")}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {account.email || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.phone")}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {account.phoneNumber || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.created")}
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(account.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.lastLogin")}
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(account.lastLoginAt)}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Role Profile Details */}
            {account.teacherProfile && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1.5}>
                  {t("accounts.dialogs.details.profileInfo")} ({t("accounts.roles.Teacher")})
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.employeeCode")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {account.teacherProfile.employeeCode || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.department")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {account.teacherProfile.departmentName || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.qualifications")}
                    </Typography>
                    <Typography variant="body2">
                      {account.teacherProfile.qualifications || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {account.studentProfile && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1.5}>
                  {t("accounts.dialogs.details.profileInfo")} ({t("accounts.roles.Student")})
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.studentCode")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {account.studentProfile.studentCode || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.nationalId")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {account.studentProfile.nationalId || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.gender")}
                    </Typography>
                    <Typography variant="body2">
                      {account.studentProfile.gender || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.academicYear")}
                    </Typography>
                    <Typography variant="body2">
                      {account.studentProfile.academicYearName || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.class")}
                    </Typography>
                    <Typography variant="body2">
                      {account.studentProfile.className || "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("accounts.dialogs.details.department")}
                    </Typography>
                    <Typography variant="body2">
                      {account.studentProfile.departmentName || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Security & System Info */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1.5}>
                {t("accounts.dialogs.details.systemInfo")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  {account.emailConfirmed ? (
                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                  ) : (
                    <HighlightOffIcon color="action" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {t("accounts.dialogs.details.emailConfirmed")}: {account.emailConfirmed ? "Yes" : "No"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  {account.twoFactorEnabled ? (
                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                  ) : (
                    <HighlightOffIcon color="action" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {t("accounts.dialogs.details.twoFactor")}: {account.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.dialogs.details.failedLogins")}
                  </Typography>
                  <Typography variant="body2">
                    {account.accessFailedCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("accounts.dialogs.details.lockoutStatus")}
                  </Typography>
                  <Typography variant="body2">
                    {account.lockoutEnd ? `Locked until ${new Date(account.lockoutEnd).toLocaleTimeString()}` : "Normal"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          {t("accounts.dialogs.details.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
