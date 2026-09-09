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
import { AccountDetail, UpdateAccountProfilePayload } from "@/types/account.types";
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

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Teacher fields
  const [qualifications, setQualifications] = useState("");

  // Student fields
  const [nationalId, setNationalId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [gender, setGender] = useState("Male");
  const [address, setAddress] = useState("");

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
        }
        if (detail.studentProfile) {
          setNationalId(detail.studentProfile.nationalId || "");
          setStudentCode(detail.studentProfile.studentCode || "");
          setGender(detail.studentProfile.gender || "Male");
          setAddress(detail.studentProfile.address || "");
        }
        setError(null);
      });
    }
  }, [detail]);

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

    if (detail.role === "Teacher" || detail.teacherProfile) {
      payload.qualifications = qualifications.trim() || undefined;
    }
    if (detail.role === "Student" || detail.studentProfile) {
      payload.nationalId = nationalId.trim() || undefined;
      payload.studentCode = studentCode.trim() || undefined;
      payload.gender = gender;
      payload.address = address.trim() || undefined;
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
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
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
              {t("accounts.dialogs.edit.description", { name: account?.fullName || account?.username || "" })}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
              <TextField
                label={t("accounts.dialogs.create.firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
              <TextField
                label={t("accounts.dialogs.create.middleName")}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                disabled={loading}
              />
              <TextField
                label={t("accounts.dialogs.create.lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </Box>

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
              helperText={t("accounts.dialogs.create.phoneHelper", { defaultMessage: "Optional. e.g. 01012345678 or +201012345678" })}
            />

            {/* Role specific profile fields */}
            {(account?.role === "Teacher" || account?.teacherProfile) && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="primary" fontWeight={700}>
                  {t("accounts.dialogs.details.profileInfo")}
                </Typography>
                <TextField
                  label={t("accounts.dialogs.create.qualifications")}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  fullWidth
                  disabled={loading}
                />
              </>
            )}

            {(account?.role === "Student" || account?.studentProfile) && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="primary" fontWeight={700}>
                  {t("accounts.dialogs.details.profileInfo")}
                </Typography>
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
