"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  alpha,
  Paper,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import { ViceStudentsAPI, type ViceBulkImportResponse } from "@/data/vice-students.api";
import type { ViceDepartment, ViceLevel } from "@/types/vice/students";
import { useLanguage } from "@/context/LanguageContext";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  year: ViceLevel;
  department: ViceDepartment;
  academicYearName?: string;
  onSuccess?: () => void;
}

export default function BulkImportModal({
  open,
  onClose,
  year,
  department,
  academicYearName,
  onSuccess,
}: BulkImportModalProps) {
  const theme = useTheme();
  const { dir } = useLanguage();
  const primary = theme.palette.primary.main;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ViceBulkImportResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
        setError("يرجى اختيار ملف إكسيل (.xlsx, .xls) أو CSV (.csv)");
        setSelectedFile(null);
        return;
      }
      setError(null);
      setResult(null);
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
        setError("يرجى اختيار ملف إكسيل (.xlsx, .xls) أو CSV (.csv)");
        return;
      }
      setError(null);
      setResult(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await ViceStudentsAPI.importExcel(selectedFile, {
        year,
        department,
        academicYearName,
      });
      setResult(res);
      if (res.successCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء استيراد الملف");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir={dir}
      PaperProps={{
        sx: {
          borderRadius: "24px",
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          fontWeight: 800,
          fontSize: "1.3rem",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CloudUploadIcon sx={{ color: primary, fontSize: 32 }} />
          <Typography variant="h6" fontWeight={800}>
            استيراد الطلاب من شيت إكسيل (Bulk Import)
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ border: 0, py: 2 }}>
        <Stack spacing={3}>
          {/* Dropzone */}
          <Box component="label" sx={{ display: "block", cursor: "pointer" }}>
            <Paper
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{
                p: 4,
                border: `2px dashed ${selectedFile ? primary : alpha(theme.palette.divider, 0.3)}`,
                borderRadius: "16px",
                bgcolor: selectedFile
                  ? alpha(primary, 0.04)
                  : alpha(theme.palette.background.default, 0.4),
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: primary,
                  bgcolor: alpha(primary, 0.06),
                },
              }}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                hidden
                onChange={handleFileChange}
              />

            {selectedFile ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <InsertDriveFileIcon sx={{ fontSize: 48, color: primary }} />
                <Typography fontWeight={700} variant="body1">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
                <Button size="small" sx={{ mt: 1, color: theme.palette.error.main }}>
                  تغيير الملف
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <CloudUploadIcon sx={{ fontSize: 48, color: alpha(primary, 0.6) }} />
                <Typography fontWeight={700} variant="body1">
                  اسحب ملف الإكسيل هنا أو انقر للاختيار
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  يدعم ملفات (.xlsx, .xls, .csv) المعتمدة
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {/* Results Display */}
          {result && (
            <Stack spacing={2}>
              <Alert
                severity={result.failureCount === 0 ? "success" : result.successCount > 0 ? "warning" : "error"}
                sx={{ borderRadius: 2 }}
              >
                <Typography fontWeight={700}>
                  تمت معالجة {result.totalRows} صفوف:
                </Typography>
                <Typography variant="body2">
                  ✅ نجاح الإضافة: {result.successCount} طالب | ❌ الفشل: {result.failureCount}
                </Typography>
              </Alert>

              {result.errors.length > 0 && (
                <Box
                  sx={{
                    maxHeight: 180,
                    overflowY: "auto",
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    borderRadius: 2,
                    p: 1.5,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="error.main" sx={{ mb: 1, display: "block" }}>
                    ملاحظات وأخطاء الصفوف:
                  </Typography>
                  <List dense disablePadding>
                    {result.errors.map((err, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28, color: theme.palette.error.main }}>
                          <ErrorOutlineIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={err}
                          primaryTypographyProps={{ variant: "caption", color: "text.primary" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit" sx={{ borderRadius: "10px" }}>
          {result ? "إغلاق" : "إلغاء"}
        </Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleOutlineIcon />}
            sx={{
              background: `linear-gradient(45deg, ${primary}, ${theme.palette.secondary?.main || primary})`,
              color: "#fff",
              fontWeight: 700,
              borderRadius: "10px",
              px: 3,
            }}
          >
            {loading ? "جاري الاستيراد..." : "بدء الاستيراد"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
