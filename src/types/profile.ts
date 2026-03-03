export interface ProfileData {
    fullName: string;
    username: string;
    role: string;
    subject?: string;
    academicYear: string;
    status: "Active" | "Inactive";
}