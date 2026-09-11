"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  Chip,
  Stack,
  IconButton,
  Snackbar,
  Grid,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import HomeIcon from "@mui/icons-material/Home";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

import { ProfileData } from "@/types/profile";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { profileService } from "@/services/profile.service";
import { studentService } from "@/services/student.service";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const theme = useTheme();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let isMounted = true;

    profileService
      .getMyProfile()
      .then((data) => {
        if (!isMounted) return;
        setError(null);
        setProfile(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Failed to load profile data from server.");
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, retryCount]);

  if (authLoading) {
    return (
      <>
        <SharedNavbar />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h5">Loading profile...</Typography>
        </Box>
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <SharedNavbar />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h5">You must be logged in to view this page.</Typography>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SharedNavbar />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Card sx={{ maxWidth: 500, width: "100%", borderRadius: "20px", p: 4, textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => {
                setError(null);
                setProfile(null);
                setRetryCount((c) => c + 1);
              }}
              sx={{ borderRadius: "12px", px: 4, py: 1.5 }}
            >
              Try Again
            </Button>
          </Card>
        </Box>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <SharedNavbar />
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Card sx={{ maxWidth: 680, width: "100%", borderRadius: "24px", p: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Skeleton variant="circular" width={96} height={96} />
            <Skeleton variant="text" width={220} height={32} />
            <Skeleton variant="text" width={160} height={20} />
            <Divider sx={{ width: "100%", my: 2 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, width: "100%" }}>
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Box>
          </Card>
        </Box>
      </>
    );
  }

  const isStudent = profile.role?.toLowerCase() === "student";

  const handleProfileUpdated = (updated: Partial<ProfileData>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : null));
    setSnackbarMessage("Contact information updated successfully!");
  };

  return (
    <>
      <SharedNavbar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "clamp(340px, 90vw, 760px)",
            borderRadius: "24px",
            p: { xs: 3, md: 4 },
            boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 2,
                backgroundColor: theme.palette.primary.main,
                boxShadow: "0 8px 24px rgba(255, 198, 0, 0.25)",
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 50, color: "#000" }} />
            </Avatar>

            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {isRtl && profile.addressArabic ? profile.fullName : profile.fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              @{profile.username} • {profile.role}
            </Typography>

            {/* Quick Chips */}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap">
              <Chip
                label={profile.status}
                size="small"
                color={profile.status === "Active" ? "success" : "default"}
                sx={{ fontWeight: 700 }}
              />
              {profile.studentCode && (
                <Chip
                  icon={<BadgeIcon sx={{ fontSize: 16 }} />}
                  label={profile.studentCode}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
              {profile.academicYear && (
                <Chip
                  icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                  label={profile.academicYear}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Academic & Personal Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              mb: 4,
            }}
          >
            <InfoItem label="Full Name" value={profile.fullName} />
            <InfoItem label="Role" value={profile.role} />

            {profile.subject && <InfoItem label="Assigned Subject" value={profile.subject} />}

            {isStudent && (
              <>
                {profile.nationalId && <InfoItem label="National ID" value={profile.nationalId} />}
                {profile.className && <InfoItem label="Class" value={profile.className} />}
                {profile.departmentName && <InfoItem label="Department" value={profile.departmentName} />}
                {profile.majorName && <InfoItem label="Major / Specialization" value={profile.majorName} />}
                {profile.phone && <InfoItem label="Phone Number" value={profile.phone} />}
                {profile.address && <InfoItem label="Address" value={profile.address} />}
                {profile.relativeName && (
                  <InfoItem label="Guardian / Relative Name" value={profile.relativeName} />
                )}
                {profile.relativePhone && (
                  <InfoItem label="Guardian Phone" value={profile.relativePhone} />
                )}
                {profile.overallPercentage !== undefined && profile.overallPercentage !== null && (
                  <InfoItem label={t("profile.overallAverage", "Overall Average")} value={`${profile.overallPercentage}%`} />
                )}
                {profile.completedCompetencies !== undefined && (
                  <InfoItem
                    label="Competency Units"
                    value={`${profile.completedCompetencies} / ${profile.totalCompetencies ?? 0} Mastered`}
                  />
                )}
              </>
            )}
          </Box>

          <Button
            fullWidth
            onClick={() => setOpen(true)}
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              height: 48,
              borderRadius: "14px",
              fontWeight: 700,
              fontSize: "15px",
              textTransform: "none",
              boxShadow: "0 6px 20px rgba(255, 198, 0, 0.2)",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            {isStudent ? "Edit Contact Information" : "Edit Profile"}
          </Button>
        </Card>

        {/* Edit Dialog */}
        <EditProfileDialog
          open={open}
          onClose={() => setOpen(false)}
          profile={profile}
          isStudent={isStudent}
          onSaved={handleProfileUpdated}
        />

        {/* Toast Notification */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage(null)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Box>
    </>
  );
}

/* ================= Dialog ================= */

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  isStudent: boolean;
  onSaved: (updated: Partial<ProfileData>) => void;
}

const EditProfileDialog = ({
  open,
  onClose,
  profile,
  isStudent,
  onSaved,
}: EditProfileDialogProps) => {
  const theme = useTheme();
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");
  const [addressArabic, setAddressArabic] = useState(profile.addressArabic || "");
  const [relativeName, setRelativeName] = useState(profile.relativeName || "");
  const [relativePhone, setRelativePhone] = useState(profile.relativePhone || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setAddressArabic(profile.addressArabic || "");
    setRelativeName(profile.relativeName || "");
    setRelativePhone(profile.relativePhone || "");
    setSaveError(null);
  }, [profile, open]);

  const handleSave = async () => {
    if (!isStudent) return;
    setSaving(true);
    setSaveError(null);
    try {
      await studentService.updateStudentProfile({
        phone: phone.trim(),
        address: address.trim(),
        addressArabic: addressArabic.trim(),
        relativeName: relativeName.trim(),
        relativePhone: relativePhone.trim(),
      });
      onSaved({
        phone: phone.trim(),
        address: address.trim(),
        addressArabic: addressArabic.trim(),
        relativeName: relativeName.trim(),
        relativePhone: relativePhone.trim(),
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography component="div" variant="h6" sx={{ fontWeight: 800 }}>
          {isStudent ? "Update Contact Information" : "Edit Profile"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {isStudent ? (
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: "12px" }}>
              Students can update personal phone, residence address, and guardian emergency contact. Institutional and academic records are managed by Student Affairs.
            </Alert>

            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01012345678"
              InputProps={{ startAdornment: <ContactPhoneIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            />

            <TextField
              fullWidth
              label="Home Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Nasr City, Cairo"
              InputProps={{ startAdornment: <HomeIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            />

            <TextField
              fullWidth
              label="Home Address (Arabic)"
              value={addressArabic}
              onChange={(e) => setAddressArabic(e.target.value)}
              placeholder="مثال: ١٢ مدينة نصر، القاهرة"
              dir="rtl"
            />

            <Divider sx={{ my: 1 }} />

            <TextField
              fullWidth
              label="Guardian / Relative Name"
              value={relativeName}
              onChange={(e) => setRelativeName(e.target.value)}
              placeholder="e.g. Ahmed Ali (Father)"
              InputProps={{ startAdornment: <FamilyRestroomIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
            />

            <TextField
              fullWidth
              label="Guardian Phone Number"
              value={relativePhone}
              onChange={(e) => setRelativePhone(e.target.value)}
              placeholder="e.g. 01198765432"
            />
          </Stack>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Account credential changes for staff are managed by the System Administrator.
            </Alert>
            <TextField fullWidth label="Username" defaultValue={profile.username} disabled sx={{ mb: 2 }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        {isStudent && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              borderRadius: "10px",
              "&:hover": { bgcolor: theme.palette.primary.dark },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

/* ================= Info Item ================= */

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "14px",
        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
        {value}
      </Typography>
    </Box>
  );
};