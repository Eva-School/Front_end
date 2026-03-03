"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  CircularProgress,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Alert,
  Card,
  Paper,
  useTheme,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GetAppIcon from "@mui/icons-material/GetApp";
import Link from "next/link";
import { teacherService } from "@/services/teacher.service";
import type { TeacherStudent } from "@/types/Teacher-api/teacher-api";

const exportToExcel = (students: TeacherStudent[], subject: string, classId: string) => {
  const headers = ["Student Name", "Final Grade", "Student Grade", "Status"];
  const rows = students.map((s) => [
    s.name,
    s.finalGrade ?? "-",
    "-",
    s.status?.toUpperCase() ?? "-",
  ]);

  const csvContent = [
    [subject, "Class", classId],
    [],
    headers,
    ...rows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${subject}_${classId}_grades.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function GradePage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const classId = searchParams?.get("classId");
  const subject = searchParams?.get("subject") || "";
  const year = searchParams?.get("year") || "";
  const subjectId = searchParams?.get("subjectId") || "";

  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!classId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await teacherService.getClassStudents(classId);
        if (cancelled) return;
        setStudents(data.students || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load students");
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const passCount = students.filter((s) => s.status === "pass").length;
  const failCount = students.filter((s) => s.status === "fail").length;

  const handleGradeChange = (id: string | number, value: string) => {
    const num = parseFloat(value);
    setGrades((prev) => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const handleSave = async (id: string | number) => {
    if (!classId) return;
    const grade = grades[id];
    setSaving((p) => ({ ...p, [id]: true }));
    try {
      await teacherService.saveStudentGrade(classId, id, grade);
    } catch (e) {
      console.error(e);
    }
    setSaving((p) => ({ ...p, [id]: false }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/Images/download 1 (1).png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          width: "95%",
          maxWidth: "1300px",
          background: "rgba(50,50,50,0.3)",
          borderRadius: "28px",
          p: 2,
          mt: 1,
          mb: 2,
        }}
      >
        {/* Back Button & Title */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
          <Button
            component={Link}
            href={`/teacher/classes${year ? `?year=${year}` : ""}${
              subjectId ? `&subject=${subjectId}` : ""
            }`}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: theme.palette.warning.main,
              fontSize: "14px",
              fontWeight: 500,
              textTransform: "none",
              padding: "4px 12px",
              "&:hover": { backgroundColor: "rgba(255, 198, 0, 0.1)" },
            }}
          >
            Back to Classes
          </Button>
          <Typography variant="h6" color="#fff">
            {subject} - Class {classId}
          </Typography>
        </Box>

        {/* Stats Section */}
        {!loading && !error && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Card
              sx={{
                background: "rgba(76, 175, 80, 0.1)",
                border: `2px solid ${theme.palette.success.main}`,
                p: 2,
                borderRadius: 2,
                flex: 1,
                minWidth: "150px",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Passed
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: "bold" }}>
                {passCount}
              </Typography>
            </Card>

            <Card
              sx={{
                background: "rgba(244, 67, 54, 0.1)",
                border: `2px solid ${theme.palette.error.main}`,
                p: 2,
                borderRadius: 2,
                flex: 1,
                minWidth: "150px",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Failed
              </Typography>
              <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: "bold" }}>
                {failCount}
              </Typography>
            </Card>

            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={() => exportToExcel(students, subject, classId || "")}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "#000",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { backgroundColor: theme.palette.primary.main },
                height: "40px",
                display: "flex",
                
              }}
            >
              Export to Excel
            </Button>
          </Box>
        )}

        {/* Search Field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search student"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ background: "#fff", borderRadius: 1, width: "100%" }}
          />
        </Box>
      </Box>

      {/* Table Section */}
      <Box
        sx={{
          width: "95%",
          maxWidth: "1300px",
          background: "rgba(50,50,50,0.3)",
          borderRadius: "28px",
          p: 2,
          mt: 1,
          mb: 2,
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filtered.length === 0 && (
          <Alert severity="info">No students match your search.</Alert>
        )}

        {!loading && filtered.length > 0 && (
          <Paper sx={{ borderRadius: 1, background: "#fff", overflow: "hidden" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "18px", color: "#000", py: 2.5 }}>
                    Student
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "18px", color: "#000", py: 2.5 }}>
                    Final Grade
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "18px", color: "#000", py: 2.5 }}>
                    Your Grade
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "18px", color: "#000", py: 2.5 }}>
                    Status
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: "18px", color: "#000", py: 2.5 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:nth-of-type(even)": { backgroundColor: "rgba(0,0,0,0.05)" },
                      "&:hover": { backgroundColor: "rgba(255,198,0,0.05)" },
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell sx={{ fontSize: "16px", fontWeight: 500, color: "#1a1a1a", py: 2.5 }}>
                      {row.name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "16px", fontWeight: 600, color: "#333", py: 2.5 }}>
                      {row.finalGrade ?? "-"}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={grades[row.id] ?? ""}
                        onChange={(e) => handleGradeChange(row.id, e.target.value)}
                        inputProps={{ style: { textAlign: "center" } }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <Chip
                        label={row.status?.toUpperCase() ?? "-"}
                        color={row.status === "pass" ? "success" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={saving[row.id]}
                        onClick={() => handleSave(row.id)}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "#000",
                          fontWeight: "bold",
                          textTransform: "none",
                          "&:hover": { backgroundColor: theme.palette.warning.dark },
                        }}
                      >
                        {saving[row.id] ? "Saving..." : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
