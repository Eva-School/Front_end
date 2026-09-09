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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TablePagination,
  TableSortLabel,
  Tooltip,
  InputAdornment,
  Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockResetIcon from "@mui/icons-material/LockReset";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

import { useAuth } from "@/context/AuthContext";
import { appToast } from "@/hooks/useAppToast";
import { AdminAccountsAPI } from "@/data/admin-accounts.api";
import { AccountListQuery, AccountSummary, RoleOption } from "@/types/account.types";
import { formatLocalizedError } from "@/utils/error-formatter";

import CreateAccountDialog from "@/components/admin/accounts/CreateAccountDialog";
import EditAccountDialog from "@/components/admin/accounts/EditAccountDialog";
import ChangeRoleDialog from "@/components/admin/accounts/ChangeRoleDialog";
import ResetPasswordDialog from "@/components/admin/accounts/ResetPasswordDialog";
import AccountDetailsDialog from "@/components/admin/accounts/AccountDetailsDialog";

export default function AdminAccountsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const theme = useTheme();
  const { user: currentUser } = useAuth();

  // Roles lookup
  const [roles, setRoles] = useState<RoleOption[]>([]);

  // Query state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "", "true", "false"
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDescending, setSortDescending] = useState<boolean>(true);

  // Data state
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active action menu anchor
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);

  // Dialog open states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeDetailsUserId, setActiveDetailsUserId] = useState<number | null>(null);

  // Status toggle confirmation dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTargetAccount, setStatusTargetAccount] = useState<AccountSummary | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Search debounce ref
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

  // Load roles once
  useEffect(() => {
    AdminAccountsAPI.getRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error("Failed to load roles:", err));
  }, []);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const query: AccountListQuery = {
        pageNumber: page + 1,
        pageSize,
        sortBy,
        sortDescending,
      };

      if (debouncedSearch.trim()) {
        query.search = debouncedSearch.trim();
      }
      if (selectedRole) {
        query.role = selectedRole;
      }
      if (selectedStatus === "true") {
        query.isActive = true;
      } else if (selectedStatus === "false") {
        query.isActive = false;
      }

      const result = await AdminAccountsAPI.getAccounts(query);
      setAccounts(result.items);
      setTotalCount(result.totalCount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("accounts.loadFailed");
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDescending, debouncedSearch, selectedRole, selectedStatus, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchAccounts();
    });
  }, [fetchAccounts]);

  // Handle Sort Toggle
  const handleRequestSort = (property: string) => {
    const isAsc = sortBy === property && !sortDescending;
    setSortDescending(!isAsc);
    setSortBy(property);
    setPage(0);
  };

  // Action Menu Open/Close
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, account: AccountSummary) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Status Change Confirmation Trigger
  const handleToggleStatusClick = (account: AccountSummary) => {
    if (account.userId === currentUser?.userId) {
      appToast.error(t("accounts.dialogs.status.selfDeactivateWarning"));
      return;
    }
    setStatusTargetAccount(account);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTargetAccount) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = !statusTargetAccount.isActive;
      await AdminAccountsAPI.setStatus(statusTargetAccount.userId, { isActive: newStatus });
      appToast.success(t("accounts.dialogs.status.success"));
      setStatusDialogOpen(false);
      setStatusTargetAccount(null);
      fetchAccounts();
    } catch (err: unknown) {
      appToast.error(formatLocalizedError(err, t));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Role Chip Color
  const getRoleChipProps = (role: string) => {
    switch (role) {
      case "Admin":
        return {
          color: "error" as const,
          label: t("accounts.roles.Admin", { defaultMessage: "Admin" }),
        };
      case "StudentAffairs":
        return {
          color: "secondary" as const,
          label: t("accounts.roles.StudentAffairs", { defaultMessage: "Student Affairs" }),
        };
      case "Teacher":
        return {
          color: "primary" as const,
          label: t("accounts.roles.Teacher", { defaultMessage: "Teacher" }),
        };
      case "Student":
        return {
          color: "info" as const,
          label: t("accounts.roles.Student", { defaultMessage: "Student" }),
        };
      default:
        return {
          color: "default" as const,
          label: role,
        };
    }
  };

  const isSelf = (account: AccountSummary) => account.userId === currentUser?.userId;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: { xs: 2.5, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Navigation & Title */}
        <Stack spacing={2} sx={{ mb: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={Link}
              href="/admin"
              variant="text"
              startIcon={<ArrowBackIcon sx={{ transform: locale === "ar" ? "scaleX(-1)" : "none" }} />}
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              {t("dashboards.admin", { defaultMessage: "Admin Dashboard" })}
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: "-0.5px" }}>
                {t("accounts.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("accounts.subtitle")}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: "12px",
                fontWeight: 700,
                boxShadow: theme.shadows[4],
              }}
            >
              {t("accounts.addAccount")}
            </Button>
          </Box>
        </Stack>

        {/* Filter Toolbar Card */}
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
            <TextField
              size="small"
              placeholder={t("accounts.searchPlaceholder")}
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{t("accounts.filterRole")}</InputLabel>
                <Select
                  value={selectedRole}
                  label={t("accounts.filterRole")}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t("accounts.allRoles")}</MenuItem>
                  {roles.map((r) => {
                    let label = r.roleName;
                    if (r.normalizedName === "Admin") label = t("accounts.roles.Admin");
                    else if (r.normalizedName === "StudentAffairs") label = t("accounts.roles.StudentAffairs");
                    else if (r.normalizedName === "Teacher") label = t("accounts.roles.Teacher");
                    else if (r.normalizedName === "Student") label = t("accounts.roles.Student");
                    return (
                      <MenuItem key={r.roleId} value={r.roleName}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{t("accounts.filterStatus")}</InputLabel>
                <Select
                  value={selectedStatus}
                  label={t("accounts.filterStatus")}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t("accounts.allStatuses")}</MenuItem>
                  <MenuItem value="true">{t("accounts.active")}</MenuItem>
                  <MenuItem value="false">{t("accounts.inactive")}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Card>

        {/* Error Notification */}
        {fetchError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFetchError(null)}>
            {fetchError}
          </Alert>
        )}

        {/* Accounts Table Card */}
        <Card
          sx={{
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            overflow: "hidden",
          }}
        >
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 850 }} aria-label="accounts table">
              <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell sortDirection={sortBy === "fullName" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "fullName"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("fullName")}
                    >
                      {t("accounts.user")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sortDirection={sortBy === "email" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "email"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      {t("accounts.email")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sortDirection={sortBy === "role" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "role"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("role")}
                    >
                      {t("accounts.role")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sortDirection={sortBy === "isActive" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "isActive"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("isActive")}
                    >
                      {t("accounts.status")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sortDirection={sortBy === "createdAt" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("createdAt")}
                    >
                      {t("accounts.created")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell sortDirection={sortBy === "lastLoginDate" ? (sortDescending ? "desc" : "asc") : false}>
                    <TableSortLabel
                      active={sortBy === "lastLoginDate"}
                      direction={sortDescending ? "desc" : "asc"}
                      onClick={() => handleRequestSort("lastLoginDate")}
                    >
                      {t("accounts.lastLogin")}
                    </TableSortLabel>
                  </TableCell>

                  <TableCell align="right">{t("accounts.actions")}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={36} />
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {t("accounts.noAccountsFound")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => {
                    const roleChip = getRoleChipProps(account.role);
                    const selfAccount = isSelf(account);

                    return (
                      <TableRow
                        key={account.userId}
                        hover
                        sx={{
                          transition: "background-color 0.15s ease",
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        {/* User info */}
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                              {account.fullName}
                              {selfAccount && (
                                <Chip
                                  size="small"
                                  label="You"
                                  color="default"
                                  sx={{ ml: 1, height: 18, fontSize: "0.68rem", fontWeight: 700 }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{account.username}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Email & Phone */}
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" color="text.primary">
                              {account.email}
                            </Typography>
                            {account.phoneNumber && (
                              <Typography variant="caption" color="text.secondary">
                                {account.phoneNumber}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Role Chip */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={roleChip.label}
                            color={roleChip.color}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: "6px" }}
                          />
                        </TableCell>

                        {/* Status Switch */}
                        <TableCell>
                          <Tooltip
                            title={
                              selfAccount
                                ? t("accounts.dialogs.status.selfDeactivateWarning")
                                : account.isActive
                                ? t("accounts.actionsMenu.deactivate")
                                : t("accounts.actionsMenu.activate")
                            }
                          >
                            <span>
                              <Switch
                                size="small"
                                checked={account.isActive}
                                disabled={selfAccount}
                                onChange={() => handleToggleStatusClick(account)}
                                color={account.isActive ? "success" : "default"}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(account.createdAt).toLocaleDateString(locale, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </TableCell>

                        {/* Last Login Date */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {account.lastLoginAt
                              ? new Date(account.lastLoginAt).toLocaleDateString(locale, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : t("accounts.never")}
                          </Typography>
                        </TableCell>

                        {/* Actions Menu Trigger */}
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label={`Actions for ${account.username}`}
                            onClick={(e) => handleOpenMenu(e, account)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
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

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              minWidth: 180,
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <MenuItem
            onClick={() => {
              if (selectedAccount) {
                setActiveDetailsUserId(selectedAccount.userId);
                setDetailsDialogOpen(true);
              }
              handleCloseMenu();
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            {t("accounts.actionsMenu.viewDetails")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              setEditDialogOpen(true);
              handleCloseMenu();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            {t("accounts.actionsMenu.editProfile")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              setRoleDialogOpen(true);
              handleCloseMenu();
            }}
          >
            <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            {t("accounts.actionsMenu.changeRole")}
          </MenuItem>

          <MenuItem
            onClick={() => {
              setResetPasswordDialogOpen(true);
              handleCloseMenu();
            }}
          >
            <LockResetIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            {t("accounts.actionsMenu.resetPassword")}
          </MenuItem>

          {selectedAccount && !isSelf(selectedAccount) && (
            <MenuItem
              onClick={() => {
                if (selectedAccount) {
                  setStatusTargetAccount(selectedAccount);
                  setStatusDialogOpen(true);
                }
                handleCloseMenu();
              }}
              sx={{ color: selectedAccount.isActive ? "error.main" : "success.main" }}
            >
              {selectedAccount.isActive ? (
                <>
                  <BlockIcon fontSize="small" sx={{ mr: 1.5 }} />
                  {t("accounts.actionsMenu.deactivate")}
                </>
              ) : (
                <>
                  <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1.5 }} />
                  {t("accounts.actionsMenu.activate")}
                </>
              )}
            </MenuItem>
          )}
        </Menu>

        {/* Create Account Dialog */}
        <CreateAccountDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={fetchAccounts}
          roles={roles}
        />

        {/* Edit Account Dialog */}
        <EditAccountDialog
          open={editDialogOpen}
          accountId={selectedAccount?.userId || null}
          onClose={() => setEditDialogOpen(false)}
          onSuccess={fetchAccounts}
        />

        {/* Change Role Dialog */}
        <ChangeRoleDialog
          open={roleDialogOpen}
          account={selectedAccount}
          onClose={() => setRoleDialogOpen(false)}
          onSuccess={fetchAccounts}
          roles={roles}
        />

        {/* Reset Password Dialog */}
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          account={selectedAccount}
          onClose={() => setResetPasswordDialogOpen(false)}
          onSuccess={fetchAccounts}
        />

        {/* Account Details Dialog */}
        <AccountDetailsDialog
          open={detailsDialogOpen}
          userId={activeDetailsUserId}
          onClose={() => {
            setDetailsDialogOpen(false);
            setActiveDetailsUserId(null);
          }}
        />

        {/* Status Confirmation Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={isUpdatingStatus ? undefined : () => setStatusDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle fontWeight={700}>
            {t("accounts.dialogs.status.title")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {statusTargetAccount?.isActive
                ? t("accounts.dialogs.status.confirmDeactivate", {
                    name: statusTargetAccount?.fullName || "",
                  })
                : t("accounts.dialogs.status.confirmActivate", {
                    name: statusTargetAccount?.fullName || "",
                  })}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setStatusDialogOpen(false)}
              disabled={isUpdatingStatus}
              color="inherit"
            >
              {t("accounts.dialogs.status.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmStatusChange}
              disabled={isUpdatingStatus}
              color={statusTargetAccount?.isActive ? "error" : "success"}
              startIcon={isUpdatingStatus ? <CircularProgress size={18} /> : undefined}
            >
              {statusTargetAccount?.isActive
                ? t("accounts.dialogs.status.deactivate")
                : t("accounts.dialogs.status.activate")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
