"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useLanguage } from "@/context/LanguageContext";
import type { ClassStudent } from "@/types/class-management.types";

interface ClassStudentTableProps {
  students: ClassStudent[];
  className: string;
  onAddStudentClick: () => void;
  onEditStudent: (student: ClassStudent) => void;
  onUnassignStudent: (student: ClassStudent) => Promise<void>;
  onDeleteStudent: (student: ClassStudent) => Promise<void>;
}

export default function ClassStudentTable({
  students,
  className,
  onAddStudentClick,
  onEditStudent,
  onUnassignStudent,
  onDeleteStudent,
}: ClassStudentTableProps) {
  const theme = useTheme();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state for unassigning / deleting
  const [unassignTarget, setUnassignTarget] = useState<ClassStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassStudent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nationalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender =
        genderFilter === "ALL" ||
        s.gender.toLowerCase() === genderFilter.toLowerCase();

      return matchesSearch && matchesGender;
    });
  }, [students, searchQuery, genderFilter]);

  const displayedStudents = useMemo(() => {
    return filteredStudents.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredStudents, page, rowsPerPage]);

  const handleExportCsv = () => {
    if (!students.length) return;
    const headers = ["Student Code", "Full Name", "National ID", "Email", "Phone", "Gender", "Status"];
    const rows = filteredStudents.map((s) => [
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      `"${s.nationalId}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.gender}"`,
      `"${s.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${className}_students_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmUnassign = async () => {
    if (!unassignTarget) return;
    setIsProcessing(true);
    try {
      await onUnassignStudent(unassignTarget);
      setUnassignTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await onDeleteStudent(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      {/* Table Header Controls */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={2.5}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder={t("classes.fullName") + ", " + t("classes.studentCode") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="input-search-student-roster"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              id="select-gender-filter"
              sx={{ borderRadius: "12px", fontSize: "0.88rem" }}
            >
              <MenuItem value="ALL">{t("classes.gender")}: All</MenuItem>
              <MenuItem value="Male">{t("classes.male")}</MenuItem>
              <MenuItem value="Female">{t("classes.female")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCsv}
            disabled={filteredStudents.length === 0}
            id="btn-export-roster-csv"
            sx={{
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.85rem",
            }}
          >
            {t("classes.exportRoster")}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={onAddStudentClick}
            id="btn-add-student-to-class"
            sx={{
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.85rem",
            }}
          >
            {t("classes.addStudent")}
          </Button>
        </Stack>
      </Stack>

      {/* Table Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "20px",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(20px)",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.divider, 0.04) }}>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.fullName")}</TableCell>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.studentCode")}</TableCell>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.email")}</TableCell>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.phone")}</TableCell>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.gender")}</TableCell>
              <TableCell sx={{ fontWeight: 800, py: 2 }}>{t("classes.status")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, py: 2 }}>
                {t("classes.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="body1" fontWeight={700} color="text.secondary" mb={0.5}>
                    {t("classes.noStudentsInClass")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {t("classes.noStudentsSubtitle")}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={onAddStudentClick}
                    sx={{ borderRadius: "10px", fontWeight: 700 }}
                  >
                    {t("classes.addStudent")}
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              displayedStudents.map((student) => (
                <TableRow
                  key={student.studentId}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    transition: "background-color 0.2s",
                  }}
                >
                  {/* Name & Avatar */}
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          color: "primary.main",
                        }}
                      >
                        {student.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {student.fullName}
                        </Typography>
                        {student.nationalId && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {student.nationalId}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Student Code */}
                  <TableCell>
                    <Chip
                      label={student.studentCode}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "8px",
                        backgroundColor: alpha(theme.palette.divider, 0.08),
                      }}
                    />
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <EmailIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2">{student.email || "—"}</Typography>
                    </Stack>
                  </TableCell>

                  {/* Phone */}
                  <TableCell>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <PhoneIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      <Typography variant="body2">{student.phone || "—"}</Typography>
                    </Stack>
                  </TableCell>

                  {/* Gender */}
                  <TableCell>
                    <Chip
                      label={
                        student.gender.toLowerCase() === "female"
                          ? t("classes.female")
                          : t("classes.male")
                      }
                      size="small"
                      sx={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        borderRadius: "8px",
                        backgroundColor:
                          student.gender.toLowerCase() === "female"
                            ? alpha("#EC4899", 0.12)
                            : alpha("#3B82F6", 0.12),
                        color:
                          student.gender.toLowerCase() === "female" ? "#EC4899" : "#3B82F6",
                      }}
                    />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={student.status || t("classes.active")}
                      size="small"
                      sx={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        borderRadius: "8px",
                        backgroundColor: alpha(theme.palette.success.main, 0.12),
                        color: theme.palette.success.main,
                      }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={t("classes.editStudent")}>
                        <IconButton
                          size="small"
                          onClick={() => onEditStudent(student)}
                          id={`btn-edit-student-${student.studentId}`}
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("classes.removeFromClass")}>
                        <IconButton
                          size="small"
                          onClick={() => setUnassignTarget(student)}
                          id={`btn-unassign-student-${student.studentId}`}
                          sx={{
                            color: "warning.main",
                            "&:hover": { backgroundColor: alpha(theme.palette.warning.main, 0.1) },
                          }}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("classes.deleteStudent")}>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(student)}
                          id={`btn-delete-student-${student.studentId}`}
                          sx={{
                            color: "error.main",
                            "&:hover": { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredStudents.length > 0 && (
          <TablePagination
            component="div"
            count={filteredStudents.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </TableContainer>

      {/* Confirmation Dialog: Unassign Student */}
      <Dialog
        open={Boolean(unassignTarget)}
        onClose={() => setUnassignTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t("classes.removeStudentTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("classes.removeStudentMessage", {
              name: unassignTarget?.fullName || "",
              className,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setUnassignTarget(null)} color="inherit" disabled={isProcessing}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmUnassign}
            disabled={isProcessing}
            id="btn-confirm-unassign-student"
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            {t("classes.removeFromClass")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog: Delete Student Permanently */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "error.main" }}>
          {t("classes.deleteStudentTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("classes.deleteStudentMessage", {
              name: deleteTarget?.fullName || "",
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" disabled={isProcessing}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={isProcessing}
            id="btn-confirm-delete-student"
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            {t("classes.deleteStudent")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
