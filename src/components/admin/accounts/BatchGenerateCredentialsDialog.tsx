"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControlLabel,
  Checkbox,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslations } from "next-intl";

import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import {
  BatchCreateCredentialsPayload,
  BatchCreateCredentialsResult,
  UncredentialedAccountSummary,
} from "@/types/account.types";
import { appToast } from "@/hooks/useAppToast";
import { formatLocalizedError } from "@/utils/error-formatter";

interface BatchGenerateCredentialsDialogProps {
  open: boolean;
  selectedAccounts: UncredentialedAccountSummary[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchGenerateCredentialsDialog({
  open,
  selectedAccounts,
  onClose,
  onSuccess,
}: BatchGenerateCredentialsDialogProps) {
  const t = useTranslations();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration options
  const [prioritizeRegistered, setPrioritizeRegistered] = useState(true);
  const [autoEmail, setAutoEmail] = useState(true);
  const [domain, setDomain] = useState("school.edu");

  // Result state
  const [result, setResult] = useState<BatchCreateCredentialsResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setResult(null);
    setCopied(false);
    onClose();
  };

  const handleStartGeneration = async () => {
    if (selectedAccounts.length === 0) return;
    setError(null);
    setLoading(true);

    const payload: BatchCreateCredentialsPayload = {
      items: selectedAccounts.map((acc) => ({
        accountType: acc.accountType,
        entityId: acc.entityId,
      })),
      prioritizeExistingRegisteredEmail: prioritizeRegistered,
      autoGenerateEmailIfMissing: autoEmail,
      defaultEmailDomain: domain.trim() || "school.edu",
    };

    try {
      const res = await AdminAccountsAPI.batchCreateCredentialsForExisting(payload);
      setResult(res);
      appToast.success(
        t("accounts.dialogs.batchGenerate.successSummary", {
          success: res.successCount,
          total: res.totalRequested,
        })
      );
      onSuccess();
    } catch (err: unknown) {
      setError(formatLocalizedError(err, t));
    } finally {
      setLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!result || result.credentials.length === 0) return;

    const headers = ["Name", "Account Type", "Role", "Username", "Password", "Email", "Status", "Error"];
    const rows = result.credentials.map((c) => [
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.accountType,
      c.role,
      c.username,
      c.generatedPassword,
      c.email,
      c.succeeded ? "Success" : "Failed",
      c.error ? `"${c.error.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `credentials_batch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy table to clipboard
  const handleCopyTable = async () => {
    if (!result || result.credentials.length === 0) return;

    const textLines = [
      "Name\tRole\tUsername\tPassword\tEmail\tStatus",
      ...result.credentials.map(
        (c) => `${c.fullName}\t${c.role}\t${c.username}\t${c.generatedPassword}\t${c.email}\t${c.succeeded ? "OK" : "ERR"}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textLines);
      setCopied(true);
      appToast.success(t("accounts.dialogs.batchGenerate.copied"));
      setTimeout(() => setCopied(false), 2500);
    } catch {
      appToast.error(t("accounts.dialogs.generateCredential.copyFailed"));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
            <GroupAddIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {result
                ? t("accounts.dialogs.batchGenerate.resultTitle")
                : t("accounts.dialogs.batchGenerate.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("accounts.dialogs.batchGenerate.description", { count: selectedAccounts.length })}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {result ? (
        // Results View
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Alert
              severity={result.failureCount === 0 ? "success" : "warning"}
              sx={{ borderRadius: "12px" }}
            >
              <Typography variant="body2" fontWeight={600}>
                {t("accounts.dialogs.batchGenerate.successSummary", {
                  success: result.successCount,
                  total: result.totalRequested,
                })}
              </Typography>
              {result.failureCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {t("accounts.dialogs.batchGenerate.failureNotice", { count: result.failureCount })}
                </Typography>
              )}
            </Alert>

            {/* Credential Data Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "12px", maxHeight: 380 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t("accounts.user")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t("accounts.role")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t("accounts.username")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t("accounts.dialogs.create.password")}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t("accounts.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.credentials.map((cred) => (
                    <TableRow key={cred.key || `${cred.accountType}-${cred.entityId}`}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {cred.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cred.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={cred.role} sx={{ fontSize: "0.75rem" }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                        {cred.username || "—"}
                      </TableCell>
                      <TableCell>
                        {cred.generatedPassword ? (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              px: 1,
                              py: 0.25,
                              borderRadius: "6px",
                              display: "inline-block",
                            }}
                          >
                            {cred.generatedPassword}
                          </Typography>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {cred.succeeded ? (
                          <Chip
                            size="small"
                            color="success"
                            icon={<CheckCircleOutlineIcon />}
                            label="Created"
                            sx={{ height: 24, fontSize: "0.75rem" }}
                          />
                        ) : (
                          <Tooltip title={cred.error || "Failed"}>
                            <Chip
                              size="small"
                              color="error"
                              icon={<ErrorOutlineIcon />}
                              label="Error"
                              sx={{ height: 24, fontSize: "0.75rem" }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Actions for Export / Copy */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyTable}
                sx={{ borderRadius: "10px" }}
              >
                {copied ? t("accounts.dialogs.generateCredential.copied") : t("accounts.dialogs.batchGenerate.copyTable")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportCsv}
                sx={{ borderRadius: "10px", fontWeight: 700 }}
              >
                {t("accounts.dialogs.batchGenerate.exportCsv")}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      ) : (
        // Confirmation & Configuration View
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: "10px" }}>
                {error}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              {t("accounts.dialogs.batchGenerate.description", { count: selectedAccounts.length })}
            </Typography>

            {/* Selected Accounts Preview Pill Stack */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "12px",
                maxHeight: 180,
                overflowY: "auto",
                bgcolor: alpha(theme.palette.background.default, 0.6),
              }}
            >
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {selectedAccounts.map((acc) => (
                  <Chip
                    key={acc.key}
                    label={`${acc.fullName} (${acc.identifier})`}
                    size="small"
                    sx={{ borderRadius: "8px", fontWeight: 500 }}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Options */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px" }}>
              <Stack spacing={1.5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={prioritizeRegistered}
                      onChange={(e) => setPrioritizeRegistered(e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {t("accounts.dialogs.batchGenerate.prioritizeRegistered")}
                      </Typography>
                    </Stack>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoEmail}
                      onChange={(e) => setAutoEmail(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t("accounts.dialogs.batchGenerate.autoEmail")}
                />

                {autoEmail && (
                  <TextField
                    label={t("accounts.dialogs.batchGenerate.emailDomain")}
                    size="small"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    sx={{ maxWidth: 280, ml: { xs: 0, sm: 4 } }}
                    helperText="e.g. school.edu -> std101@student.school.edu"
                  />
                )}
              </Stack>
            </Paper>

            {loading && (
              <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ borderRadius: "10px" }}>
                {t("accounts.dialogs.batchGenerate.processing")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          {result ? t("accounts.dialogs.batchGenerate.close") : t("accounts.dialogs.generateCredential.cancel")}
        </Button>
        {!result && (
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleStartGeneration}
            startIcon={loading ? <CircularProgress size={16} /> : <GroupAddIcon />}
            sx={{ borderRadius: "10px", px: 2.5, fontWeight: 700 }}
          >
            {t("accounts.dialogs.batchGenerate.start")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
