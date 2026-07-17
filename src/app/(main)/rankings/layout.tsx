import RoleGuard from "@/components/auth/RoleGuard";

const RANKINGS_ROLES = ["Admin", "StudentAffairs", "Teacher"] as const;

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[...RANKINGS_ROLES]}>{children}</RoleGuard>;
}
