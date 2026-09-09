"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  TextField,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslations } from "next-intl";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountSummary, ChangeUserRolePayload, RoleOption } from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { useAuth } from "@/context/AuthContext";
import { formatLocalizedError } from "@/utils/error-formatter";

interface ChangeRoleDialogProps {
  open: boolean;
  account: AccountSummary | null;
  onClose: () => void;
  onSuccess: () => void;
  roles: RoleOption[];
}

export default function ChangeRoleDialog({
  open,
  account,
  onClose,
  onSuccess,
  roles,
}: ChangeRoleDialogProps) {
  const t = useTranslations();
  const { user: currentLoggedInUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  // Target-role extra fields
  const [qualifications, setQualifications] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [studentCode, setStudentCode] = useState("");

  const isSelf = currentLoggedInUser?.userId === account?.userId;

  useEffect(() => {
    if (account) {
      queueMicrotask(() => {
        setSelectedRole(account.role);
        setError(null);
        setQualifications("");
        setNationalId("");
        setStudentCode("");
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setError(null);

    if (isSelf && account.role === "Admin" && selectedRole !== "Admin") {
      setError(t("accounts.dialogs.role.selfDemotionWarning"));
      return;
    }

    if (selectedRole === account.role) {
      onClose();
      return;
    }

    const payload: ChangeUserRolePayload = {
      newRole: selectedRole,
    };

    if (selectedRole === "Teacher") {
      payload.qualifications = qualifications.trim() || undefined;
    } else if (selectedRole === "Student") {
      payload.nationalId = nationalId.trim() || undefined;
      payload.studentCode = studentCode.trim() || undefined;
    }

    setLoading(true);
    try {
      await AdminAccountsAPI.changeRole(account.userId, payload);
      appToast.success(t("accounts.dialogs.role.success"));
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (r: RoleOption) => {
    switch (r.normalizedName) {
      case "Admin":
        return t("accounts.roles.Admin");
      case "StudentAffairs":
        return t("accounts.roles.StudentAffairs");
      case "Teacher":
        return t("accounts.roles.Teacher");
      case "Student":
        return t("accounts.roles.Student");
      default:
        return r.roleName;
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="span" fontWeight={700}>
          {t("accounts.dialogs.role.title")}
        </Typography>
        <IconButton onClick={onClose} disabled={loading} aria-label="close">
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

            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
              {t("accounts.dialogs.role.warning")}
            </Alert>

            {isSelf && account?.role === "Admin" && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {t("accounts.dialogs.role.selfDemotionWarning")}
              </Alert>
            )}

            <TextField
              label={t("accounts.dialogs.role.currentRole")}
              value={account?.role || ""}
              disabled
              fullWidth
            />

            <FormControl fullWidth disabled={loading}>
              <InputLabel>{t("accounts.dialogs.role.newRole")}</InputLabel>
              <Select
                value={selectedRole}
                label={t("accounts.dialogs.role.newRole")}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((r) => (
                  <MenuItem
                    key={r.roleId}
                    value={r.roleName}
                    disabled={isSelf && account?.role === "Admin" && r.roleName !== "Admin"}
                  >
                    {getRoleLabel(r)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* If switching to Teacher */}
            {selectedRole === "Teacher" && account?.role !== "Teacher" && (
              <TextField
                label={t("accounts.dialogs.create.qualifications")}
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                fullWidth
                disabled={loading}
                placeholder="e.g. Master of Education"
              />
            )}

            {/* If switching to Student */}
            {selectedRole === "Student" && account?.role !== "Student" && (
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <TextField
                  label={t("accounts.dialogs.create.nationalId")}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  label={t("accounts.dialogs.create.studentCode")}
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  disabled={loading}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            {t("accounts.dialogs.role.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={loading || (isSelf && account?.role === "Admin" && selectedRole !== "Admin")}
            startIcon={loading ? <CircularProgress size={18} /> : undefined}
          >
            {t("accounts.dialogs.role.submit")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
