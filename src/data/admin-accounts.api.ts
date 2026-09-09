import { API_BASE_URL, secureFetch } from "@/config/api.config";
import {
  AccountDetail,
  AccountListQuery,
  AccountPagedResult,
  AccountSummary,
  ChangeUserRolePayload,
  CreateAccountPayload,
  CreateAccountResult,
  ResetPasswordPayload,
  RoleOption,
  SetAccountStatusPayload,
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
};
