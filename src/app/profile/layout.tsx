import RoleGuard from "@/components/auth/RoleGuard";

const AUTHENTICATED_ROLES = ["Admin", "StudentAffairs", "Teacher", "Student"] as const;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[...AUTHENTICATED_ROLES]}>{children}</RoleGuard>;
}
