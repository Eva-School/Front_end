"use client";

import React, { useState } from "react";
import {
  Box, Button, Menu, MenuItem, Typography,
  CircularProgress, useTheme, alpha, Snackbar, Alert,
} from "@mui/material";
import DownloadIcon      from "@mui/icons-material/Download";
import PictureAsPdfIcon  from "@mui/icons-material/PictureAsPdf";
import PrintIcon         from "@mui/icons-material/Print";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { tokenStorage } from "@/utils/token-storage";

interface ExportButtonProps {
  studentId?: string;
  year?: string;
  variant?: "contained" | "outlined" | "text";
  size?: "small" | "medium" | "large";
}

export default function ExportButton({
  studentId = "self",
  year = "2024-2025",
  variant = "outlined",
  size = "medium",
}: ExportButtonProps) {
  const theme   = useTheme();
  const primary = theme.palette.primary.main;

  const [anchor,  setAnchor]  = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false, msg: "", severity: "success",
  });

  const openMenu  = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const handleExport = async (type: "pdf" | "print") => {
    closeMenu();
    setLoading(true);
    try {
      const url = `/api/export?type=html&studentId=${studentId}&year=${encodeURIComponent(year)}`;
      const accessToken = tokenStorage.getAccessToken();
      const res = await fetch(url, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!res.ok) throw new Error("Export failed");

      const html  = await res.text();
      const blob  = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);

      if (type === "print") {
        const win = window.open(blobUrl, "_blank");
        if (win) {
          win.onload = () => {
            setTimeout(() => win.print(), 500);
          };
        }
      } else {
        // PDF: open in new tab — user can use browser's Save as PDF
        window.open(blobUrl, "_blank");
        setToast({
          open: true,
          msg: "Report opened! Use Ctrl+P → Save as PDF to download.",
          severity: "success",
        });
      }
    } catch {
      setToast({ open: true, msg: "Export failed. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={openMenu}
        disabled={loading}
        endIcon={loading ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <KeyboardArrowDownIcon />}
        startIcon={<DownloadIcon />}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 2,
          borderColor: alpha(primary, 0.4),
          color: variant === "contained" ? "#000" : primary,
          bgcolor: variant === "contained" ? primary : "transparent",
          "&:hover": {
            bgcolor: variant === "contained" ? alpha(primary, 0.88) : alpha(primary, 0.06),
            borderColor: primary,
          },
        }}
      >
        Export Report
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={closeMenu}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
            bgcolor: theme.palette.background.paper,
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => handleExport("pdf")}
          sx={{
            gap: 1.5, py: 1.25,
            "&:hover": { bgcolor: alpha(primary, 0.06) },
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 18, color: "#F44336" }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Save as PDF</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Open & save from browser
            </Typography>
          </Box>
        </MenuItem>

        <MenuItem
          onClick={() => handleExport("print")}
          sx={{
            gap: 1.5, py: 1.25,
            "&:hover": { bgcolor: alpha(primary, 0.06) },
          }}
        >
          <PrintIcon sx={{ fontSize: 18, color: "#2196F3" }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Print Report</Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Send to printer
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
