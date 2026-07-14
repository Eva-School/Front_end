import RoleGuard from "@/components/auth/RoleGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={["Teacher"]} fallbackRoute="/login">
            {children}
        </RoleGuard>
    );
}
