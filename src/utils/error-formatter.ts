// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatLocalizedError(err: unknown, t: any): string {
  if (!err) {
    return t("accounts.validations.genericFailed");
  }

  const rawMessage = typeof err === "string" ? err : err instanceof Error ? err.message : String(err);
  const lower = rawMessage.toLowerCase();

  // Network & Session
  if (lower.includes("network error") || lower.includes("failed to fetch")) {
    return t("accounts.validations.networkError");
  }
  if (lower.includes("session expired") || lower.includes("unauthorized") || lower.includes("401")) {
    return t("accounts.validations.sessionExpired");
  }

  // Admin Safeguards
  if (lower.includes("cannot deactivate your own")) {
    return t("accounts.validations.selfDeactivateForbidden");
  }
  if (lower.includes("cannot remove the administrator role")) {
    return t("accounts.validations.selfDemoteForbidden");
  }
  if (lower.includes("at least one active administrator")) {
    return t("accounts.validations.lastAdminForbidden");
  }
  if (lower.includes("primary administrator")) {
    return t("accounts.validations.cannotModifyPrimaryAdmin");
  }

  // Account Uniqueness & Existence
  if (lower.includes("username is already in use") || lower.includes("username already exists")) {
    return t("accounts.validations.usernameExists");
  }
  if (lower.includes("email is already in use") || lower.includes("email already exists")) {
    return t("accounts.validations.emailExists");
  }
  if (lower.includes("account not found") || lower.includes("user not found")) {
    return t("accounts.validations.accountNotFound");
  }

  // Field Validations
  if (lower.includes("invalid phone number") || lower.includes("phonenumber")) {
    return t("accounts.validations.phoneInvalid");
  }
  if (lower.includes("invalid email") || lower.includes("email format")) {
    return t("accounts.validations.emailInvalid");
  }
  if (lower.includes("email is required")) {
    return t("accounts.validations.emailRequired");
  }
  if (lower.includes("username is required")) {
    return t("accounts.validations.usernameRequired");
  }
  if (lower.includes("username can only contain")) {
    return t("accounts.validations.usernameInvalid");
  }
  if (lower.includes("username must be between")) {
    return t("accounts.validations.usernameLength");
  }
  if (lower.includes("first name is required")) {
    return t("accounts.validations.firstNameRequired");
  }
  if (lower.includes("last name is required")) {
    return t("accounts.validations.lastNameRequired");
  }
  if (lower.includes("password must be at least") || lower.includes("password length")) {
    return t("accounts.validations.passwordLength");
  }
  if (lower.includes("password is required")) {
    return t("accounts.validations.passwordRequired");
  }

  // Server error
  if (lower.includes("server error") || lower.includes("500")) {
    return t("accounts.validations.serverError");
  }

  // Strip HTTP status suffix if present, e.g. " (HTTP 400)"
  const cleaned = rawMessage.replace(/\s*\(HTTP \d+\)\s*$/i, "").trim();
  return cleaned || t("accounts.validations.genericFailed");
}
