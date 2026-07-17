import RoleGuard from "@/components/auth/RoleGuard";

const ANALYTICS_ROLES = ["Admin", "StudentAffairs"] as const;

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={[...ANALYTICS_ROLES]}>{children}</RoleGuard>;
}
