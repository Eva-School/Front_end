import RoleGuard from "@/components/auth/RoleGuard";

const ADMIN_ROLES = ["Admin"] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[...ADMIN_ROLES]}>{children}</RoleGuard>;
}
