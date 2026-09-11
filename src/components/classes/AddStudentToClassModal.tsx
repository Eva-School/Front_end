"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SearchIcon from "@mui/icons-material/Search";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE_URL, secureFetch } from "@/config/api.config";
import type { CohortStage, CreateStudentInClassPayload } from "@/types/class-management.types";

interface UnassignedStudentItem {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
}

interface AddStudentToClassModalProps {
  open: boolean;
  onClose: () => void;
  classId: number;
  className: string;
  cohort: CohortStage;
  department: string;
  academicYearName?: string;
  onStudentAdded: () => void;
}

export default function AddStudentToClassModal({
  open,
  onClose,
  classId,
  className,
  cohort,
  department,
  academicYearName,
  onStudentAdded,
}: AddStudentToClassModalProps) {
  const theme = useTheme();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  // Unassigned pool state
  const [unassignedList, setUnassignedList] = useState<UnassignedStudentItem[]>([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [poolSearch, setPoolSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // New student form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUnassignedStudents = useCallback(async () => {
    setIsLoadingPool(true);
    try {
      const query = new URLSearchParams({
        year: cohort,
        department: department || "OM",
        unassigned: "true",
      });
      if (academicYearName) query.set("academicYearName", academicYearName);

      const res = await secureFetch(`${API_BASE_URL}/vice/students?${query.toString()}`);
      if (Array.isArray(res)) {
        setUnassignedList(res as UnassignedStudentItem[]);
      }
    } catch (err: unknown) {
      console.error("Failed to load unassigned students:", err);
    } finally {
      setIsLoadingPool(false);
    }
  }, [cohort, department, academicYearName]);

  // Load unassigned students when opened
  useEffect(() => {
    if (open) {
      loadUnassignedStudents();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [open, loadUnassignedStudents]);

  const handleAssignStudent = async (studentId: string) => {
    setAssigningId(studentId);
    setErrorMsg(null);
    try {
      await secureFetch(`${API_BASE_URL}/vice/students/${studentId}/class`, {
        method: "PATCH",
        body: JSON.stringify({ classId }),
      });
      setSuccessMsg(t("classes.saveSuccess"));
      setUnassignedList((prev) => prev.filter((s) => s.id !== studentId));
      onStudentAdded();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("common.validations.serverError"));
    } finally {
      setAssigningId(null);
    }
  };

  const handleCreateNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !studentCode.trim() || !email.trim()) {
      setErrorMsg(t("common.validations.required"));
      return;
    }

    setIsSubmittingNew(true);
    setErrorMsg(null);

    try {
      const payload: CreateStudentInClassPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentCode: studentCode.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        department: department || "OM",
        year: cohort,
        classId,
        academicYearName,
      };

      await secureFetch(`${API_BASE_URL}/vice/students`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessMsg(t("classes.saveSuccess"));
      // Clear inputs
      setFirstName("");
      setLastName("");
      setStudentCode("");
      setEmail("");
      setPhone("");
      setAddress("");
      onStudentAdded();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("common.validations.serverError"));
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const filteredUnassigned = unassignedList.filter(
    (s) =>
      s.name.toLowerCase().includes(poolSearch.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(poolSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(poolSearch.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        {t("classes.addStudent")} — {className}
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
        >
          <Tab
            label={t("classes.assignExisting")}
            icon={<HowToRegIcon fontSize="small" />}
            iconPosition="start"
            id="tab-assign-unassigned"
            sx={{ fontWeight: 700, textTransform: "none" }}
          />
          <Tab
            label={t("classes.registerNew")}
            icon={<PersonAddAlt1Icon fontSize="small" />}
            iconPosition="start"
            id="tab-register-new-student"
            sx={{ fontWeight: 700, textTransform: "none" }}
          />
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ minHeight: 320 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }}>
            {successMsg}
          </Alert>
        )}

        {/* TAB 0: UNASSIGNED STUDENTS POOL */}
        {activeTab === 0 && (
          <Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Search unassigned students..."
              value={poolSearch}
              onChange={(e) => setPoolSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />

            {isLoadingPool ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : filteredUnassigned.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No unassigned students found in {department} for this cohort.
                </Typography>
                <Button
                  size="small"
                  onClick={() => setActiveTab(1)}
                  sx={{ mt: 1.5, fontWeight: 700 }}
                >
                  {t("classes.registerNew")}
                </Button>
              </Box>
            ) : (
              <List sx={{ maxHeight: 300, overflowY: "auto" }}>
                {filteredUnassigned.map((s) => (
                  <ListItem
                    key={s.id}
                    sx={{
                      borderRadius: "14px",
                      mb: 1,
                      backgroundColor: alpha(theme.palette.divider, 0.04),
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                    }}
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        disabled={assigningId === s.id}
                        onClick={() => handleAssignStudent(s.id)}
                        id={`btn-assign-student-${s.id}`}
                        startIcon={
                          assigningId === s.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <CheckCircleOutlineIcon fontSize="small" />
                          )
                        }
                        sx={{
                          borderRadius: "10px",
                          fontWeight: 700,
                          textTransform: "none",
                          px: 2,
                        }}
                      >
                        Enroll
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: "primary.main",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {s.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={700}>{s.name}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Code: {s.studentCode} • {s.email}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* TAB 1: REGISTER NEW STUDENT DIRECTLY */}
        {activeTab === 1 && (
          <form id="form-create-student-in-class" onSubmit={handleCreateNewStudent}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                pt: 1,
              }}
            >
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
                id="input-new-student-first-name"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                id="input-new-student-last-name"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Student Code / National ID"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                fullWidth
                id="input-new-student-code"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                id="input-new-student-email"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                id="input-new-student-phone"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                id="input-new-student-address"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Box>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          {t("common.cancel")}
        </Button>
        {activeTab === 1 && (
          <Button
            type="submit"
            form="form-create-student-in-class"
            variant="contained"
            disabled={isSubmittingNew}
            id="btn-submit-new-student-in-class"
            startIcon={isSubmittingNew ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: "10px", fontWeight: 700, px: 3 }}
          >
            {t("classes.registerNew")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
