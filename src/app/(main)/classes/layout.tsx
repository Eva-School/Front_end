import RoleGuard from "@/components/auth/RoleGuard";

const ALLOWED_ROLES = ["Admin", "StudentAffairs"] as const;

export default function ClassManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowedRoles={[...ALLOWED_ROLES]}>{children}</RoleGuard>;
}
