"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Card,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Alert,
  Checkbox,
  Avatar,
  Slide,
  Tabs,
  Tab,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import {
  UncredentialedAccountListQuery,
  UncredentialedAccountSummary,
  UncredentialedStats,
} from "@/types/account.types";
import GenerateCredentialDialog from "@/components/admin/accounts/GenerateCredentialDialog";
import BatchGenerateCredentialsDialog from "@/components/admin/accounts/BatchGenerateCredentialsDialog";

export default function PendingCredentialsPage() {
  const t = useTranslations();
  const theme = useTheme();

  // Stats state
  const [stats, setStats] = useState<UncredentialedStats>({
    totalCount: 0,
    studentCount: 0,
    teacherCount: 0,
    userCount: 0,
  });

  // Query state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTypeTab, setSelectedTypeTab] = useState<string>("All");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDescending, setSortDescending] = useState<boolean>(true);

  // Data state
  const [accounts, setAccounts] = useState<UncredentialedAccountSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Selection state
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Dialog states
  const [singleDialogAccount, setSingleDialogAccount] = useState<UncredentialedAccountSummary | null>(null);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  // Search debounce
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 400);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchInput]);

  // Load stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await AdminAccountsAPI.getUncredentialedStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load uncredentialed stats:", err);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // Fetch uncredentialed accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const query: UncredentialedAccountListQuery = {
        pageNumber: page + 1,
        pageSize,
        sortBy,
        sortDescending,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }
      if (selectedTypeTab !== "All") {
        query.accountType = selectedTypeTab;
      }

      const result = await AdminAccountsAPI.getUncredentialedAccounts(query);
      setAccounts(result.items);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("accounts.loadFailed");
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDescending, debouncedSearch, selectedTypeTab, t]);

  useEffect(() => {
    void fetchAccounts();
  }, [fetchAccounts]);

  // Handle Sort
  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && !sortDescending;
    setSortDescending(!isAsc);
    setSortBy(property);
    setPage(0);
  };

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newKeys = new Set(selectedKeys);
      accounts.forEach((acc) => newKeys.add(acc.key));
      setSelectedKeys(newKeys);
    } else {
      const newKeys = new Set(selectedKeys);
      accounts.forEach((acc) => newKeys.delete(acc.key));
      setSelectedKeys(newKeys);
    }
  };

  const handleToggleSelect = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  const handleClearSelection = () => {
    setSelectedKeys(new Set());
  };

  const isAllOnPageSelected = accounts.length > 0 && accounts.every((acc) => selectedKeys.has(acc.key));
  const isSomeOnPageSelected = accounts.some((acc) => selectedKeys.has(acc.key)) && !isAllOnPageSelected;

  const selectedAccountsList = accounts.filter((acc) => selectedKeys.has(acc.key));

  const handleRefresh = () => {
    void fetchStats();
    void fetchAccounts();
  };

  return (
    <Box sx={{ py: 4, minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="xl">
        {/* Navigation & Header */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Link href="/admin/accounts" passHref style={{ textDecoration: "none" }}>
                <Button
                  size="small"
                  startIcon={<ArrowBackIcon fontSize="small" />}
                  sx={{ color: "text.secondary", pl: 0, fontWeight: 600 }}
                >
                  {t("accounts.pendingPage.backToAccounts")}
                </Button>
              </Link>
            </Stack>
            <Typography variant="h4" component="h1" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              {t("accounts.pendingPage.title")}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 750 }}>
              {t("accounts.pendingPage.subtitle")}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {t("accounts.actionsMenu.activate") || "Refresh"}
          </Button>
        </Stack>

        {/* KPI Stat Ribbon */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Card 1: Total Pending */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: theme.palette.warning.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningAmberIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {t("accounts.pendingPage.stats.total")}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="warning.main">
                {stats.totalCount}
              </Typography>
            </Box>
          </Card>

          {/* Card 2: Students */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SchoolIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {t("accounts.pendingPage.stats.students")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {stats.studentCount}
              </Typography>
            </Box>
          </Card>

          {/* Card 3: Teachers */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {t("accounts.pendingPage.stats.teachers")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {stats.teacherCount}
              </Typography>
            </Box>
          </Card>

          {/* Card 4: Users Without Password */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {t("accounts.pendingPage.stats.users")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {stats.userCount}
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* Filter Card */}
        <Card
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 3,
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder={t("accounts.pendingPage.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ minWidth: { xs: "100%", md: 360 }, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Type Segment Filter Tabs */}
            <Tabs
              value={selectedTypeTab}
              onChange={(_, val) => {
                setSelectedTypeTab(val);
                setPage(0);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: alpha(theme.palette.divider, 0.08),
                borderRadius: "10px",
                p: 0.5,
                minHeight: 40,
                "& .MuiTab-root": {
                  minHeight: 32,
                  py: 0.5,
                  px: 2,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab value="All" label={`${t("accounts.pendingPage.types.all")} (${stats.totalCount})`} />
              <Tab value="Student" label={`${t("accounts.pendingPage.types.student")} (${stats.studentCount})`} />
              <Tab value="Teacher" label={`${t("accounts.pendingPage.types.teacher")} (${stats.teacherCount})`} />
              <Tab value="User" label={`${t("accounts.pendingPage.types.user")} (${stats.userCount})`} />
            </Tabs>
          </Stack>
        </Card>

        {/* Error Alert */}
        {fetchError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {fetchError}
          </Alert>
        )}

        {/* Data Table Card */}
        <Card
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[2],
            overflow: "hidden",
            position: "relative",
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.7) }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={isSomeOnPageSelected}
                      checked={isAllOnPageSelected}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "fullname"}
                      direction={sortBy === "fullname" && !sortDescending ? "asc" : "desc"}
                      onClick={() => handleRequestSort("fullname")}
                    >
                      {t("accounts.pendingPage.table.entity")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "accounttype"}
                      direction={sortBy === "accounttype" && !sortDescending ? "asc" : "desc"}
                      onClick={() => handleRequestSort("accounttype")}
                    >
                      {t("accounts.pendingPage.table.type")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortBy === "identifier"}
                      direction={sortBy === "identifier" && !sortDescending ? "asc" : "desc"}
                      onClick={() => handleRequestSort("identifier")}
                    >
                      {t("accounts.pendingPage.table.identifier")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("accounts.pendingPage.table.contact")}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t("accounts.pendingPage.table.reason")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {t("accounts.pendingPage.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={36} thickness={4} />
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        {t("accounts.pendingPage.noAccounts")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => {
                    const isSelected = selectedKeys.has(account.key);
                    const initials = account.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow
                        key={account.key}
                        hover
                        selected={isSelected}
                        sx={{
                          transition: "background-color 0.15s ease",
                          cursor: "pointer",
                        }}
                        onClick={() => handleToggleSelect(account.key)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleSelect(account.key)}
                            size="small"
                          />
                        </TableCell>

                        {/* Entity / Profile */}
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                bgcolor:
                                  account.accountType === "Student"
                                    ? alpha(theme.palette.info.main, 0.2)
                                    : account.accountType === "Teacher"
                                    ? alpha(theme.palette.success.main, 0.2)
                                    : alpha(theme.palette.primary.main, 0.2),
                                color:
                                  account.accountType === "Student"
                                    ? theme.palette.info.main
                                    : account.accountType === "Teacher"
                                    ? theme.palette.success.main
                                    : theme.palette.primary.main,
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {account.fullName}
                              </Typography>
                              {account.nameArabic && account.nameArabic !== account.fullName && (
                                <Typography variant="caption" color="text.secondary" dir="rtl">
                                  {account.nameArabic}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Type & Placement */}
                        <TableCell>
                          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <Chip
                              size="small"
                              label={
                                account.accountType === "Student"
                                  ? t("accounts.roles.Student")
                                  : account.accountType === "Teacher"
                                  ? t("accounts.roles.Teacher")
                                  : account.role
                              }
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                height: 22,
                                bgcolor:
                                  account.accountType === "Student"
                                    ? alpha(theme.palette.info.main, 0.1)
                                    : account.accountType === "Teacher"
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.secondary.main, 0.1),
                              }}
                            />
                            {account.className && (
                              <Chip size="small" variant="outlined" label={account.className} sx={{ height: 22 }} />
                            )}
                            {account.departmentName && (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={account.departmentName}
                                sx={{ height: 22 }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Identifier */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              bgcolor: alpha(theme.palette.divider, 0.15),
                              px: 1,
                              py: 0.25,
                              borderRadius: "6px",
                              display: "inline-block",
                              letterSpacing: 0.5,
                            }}
                          >
                            {account.identifier}
                          </Typography>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <Typography variant="body2">{account.email || "—"}</Typography>
                          {account.phoneNumber && (
                            <Typography variant="caption" color="text.secondary">
                              {account.phoneNumber}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Missing Reason */}
                        <TableCell>
                          <Chip
                            size="small"
                            color={account.missingReason === "NoUserAccount" ? "warning" : "error"}
                            variant="outlined"
                            label={
                              account.missingReason === "NoUserAccount"
                                ? t("accounts.pendingPage.reasons.NoUserAccount")
                                : t("accounts.pendingPage.reasons.NoPassword")
                            }
                            sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600 }}
                          />
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<VpnKeyIcon fontSize="small" />}
                            onClick={() => setSingleDialogAccount(account)}
                            sx={{
                              borderRadius: "8px",
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                              py: 0.5,
                              px: 1.5,
                            }}
                          >
                            {t("accounts.pendingPage.table.createLogin")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={t("accounts.rowsPerPage")}
          />
        </Card>

        {/* Floating Batch Action Dock */}
        <Slide direction="up" in={selectedKeys.size > 0} mountOnEnter unmountOnExit>
          <Paper
            elevation={6}
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1200,
              px: 3,
              py: 1.5,
              borderRadius: "16px",
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(12px)",
              border: `1px solid ${theme.palette.primary.main}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t("accounts.pendingPage.batch.dockTitle", { count: selectedKeys.size })}
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<GroupAddIcon />}
                onClick={() => setBatchDialogOpen(true)}
                sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
              >
                {t("accounts.pendingPage.batch.generateBtn", { count: selectedKeys.size })}
              </Button>

              <IconButton size="small" onClick={handleClearSelection} title={t("accounts.pendingPage.batch.clearSelection")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        </Slide>

        {/* Single Credential Generator Modal */}
        <GenerateCredentialDialog
          open={Boolean(singleDialogAccount)}
          account={singleDialogAccount}
          onClose={() => setSingleDialogAccount(null)}
          onSuccess={() => {
            handleRefresh();
          }}
        />

        {/* Batch Credential Generator Modal */}
        <BatchGenerateCredentialsDialog
          open={batchDialogOpen}
          selectedAccounts={selectedAccountsList}
          onClose={() => setBatchDialogOpen(false)}
          onSuccess={() => {
            handleClearSelection();
            handleRefresh();
          }}
        />
      </Container>
    </Box>
  );
}
