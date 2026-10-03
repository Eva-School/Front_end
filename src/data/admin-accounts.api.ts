import { API_BASE_URL, secureFetch } from "@/config/api.config";
import {
  AccountDetail,
  AccountFormOptions,
  AccountListQuery,
  AccountPagedResult,
  AccountSummary,
  ChangeUserRolePayload,
  CreateAccountPayload,
  CreateAccountResult,
  BatchCreateCredentialsPayload,
  BatchCreateCredentialsResult,
  CreateCredentialsForExistingPayload,
  CreateCredentialsResult,
  ResetPasswordPayload,
  RoleOption,
  SetAccountStatusPayload,
  UncredentialedAccountListQuery,
  UncredentialedAccountSummary,
  UncredentialedStats,
  UpdateAccountProfilePayload,
} from "@/types/account.types";

export const AdminAccountsAPI = {
  async getAccounts(query: AccountListQuery = {}): Promise<AccountPagedResult<AccountSummary>> {
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.role) params.append("role", query.role);
    if (typeof query.isActive === "boolean") params.append("isActive", String(query.isActive));
    if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
    if (query.pageSize) params.append("pageSize", String(query.pageSize));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (typeof query.sortDescending === "boolean") params.append("sortDescending", String(query.sortDescending));

    const queryString = params.toString();
    const url = `${API_BASE_URL}/admin/accounts${queryString ? `?${queryString}` : ""}`;
    return secureFetch<AccountPagedResult<AccountSummary>>(url);
  },

  async getAccountById(id: number): Promise<AccountDetail> {
    return secureFetch<AccountDetail>(`${API_BASE_URL}/admin/accounts/${id}`);
  },

  async getRoles(): Promise<RoleOption[]> {
    return secureFetch<RoleOption[]>(`${API_BASE_URL}/admin/accounts/roles`);
  },

  async getFormOptions(): Promise<AccountFormOptions> {
    return secureFetch<AccountFormOptions>(`${API_BASE_URL}/admin/accounts/options`);
  },

  async createAccount(payload: CreateAccountPayload): Promise<CreateAccountResult> {
    return secureFetch<CreateAccountResult>(`${API_BASE_URL}/admin/accounts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateAccount(id: number, payload: UpdateAccountProfilePayload): Promise<AccountDetail> {
    return secureFetch<AccountDetail>(`${API_BASE_URL}/admin/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async changeRole(id: number, payload: ChangeUserRolePayload): Promise<{ message: string }> {
    return secureFetch<{ message: string }>(`${API_BASE_URL}/admin/accounts/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async setStatus(id: number, payload: SetAccountStatusPayload): Promise<{ message: string }> {
    return secureFetch<{ message: string }>(`${API_BASE_URL}/admin/accounts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(id: number, payload: ResetPasswordPayload): Promise<{ message: string }> {
    return secureFetch<{ message: string }>(`${API_BASE_URL}/admin/accounts/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getUncredentialedAccounts(query: UncredentialedAccountListQuery = {}): Promise<AccountPagedResult<UncredentialedAccountSummary>> {
    const params = new URLSearchParams();
    if (query.search) params.append("search", query.search);
    if (query.accountType && query.accountType !== "All") params.append("accountType", query.accountType);
    if (query.departmentId) params.append("departmentId", String(query.departmentId));
    if (query.academicYearId) params.append("academicYearId", String(query.academicYearId));
    if (query.pageNumber) params.append("pageNumber", String(query.pageNumber));
    if (query.pageSize) params.append("pageSize", String(query.pageSize));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (typeof query.sortDescending === "boolean") params.append("sortDescending", String(query.sortDescending));

    const queryString = params.toString();
    const url = `${API_BASE_URL}/admin/accounts/uncredentialed${queryString ? `?${queryString}` : ""}`;
    return secureFetch<AccountPagedResult<UncredentialedAccountSummary>>(url);
  },

  async getUncredentialedStats(): Promise<UncredentialedStats> {
    return secureFetch<UncredentialedStats>(`${API_BASE_URL}/admin/accounts/uncredentialed/stats`);
  },

  async createCredentialsForExisting(payload: CreateCredentialsForExistingPayload): Promise<CreateCredentialsResult> {
    return secureFetch<CreateCredentialsResult>(`${API_BASE_URL}/admin/accounts/uncredentialed/create`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async batchCreateCredentialsForExisting(payload: BatchCreateCredentialsPayload): Promise<BatchCreateCredentialsResult> {
    return secureFetch<BatchCreateCredentialsResult>(`${API_BASE_URL}/admin/accounts/uncredentialed/batch-create`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
