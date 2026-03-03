"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    Avatar,
    Typography,
    Divider,
    Button,
    Dialog,
    DialogContent,
    TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import { ProfileData } from "@/types/profile";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { profileService } from "@/services/profile.service";
import { useAuth } from "@/context/AuthContext";


const TeacherProfilePage = () => {
    const theme = useTheme();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        profileService
            .getMyProfile()
            .then((data) => {
                if (!isMounted) return;
                // Map API response to ProfileData if needed
                const mapped: ProfileData = {
                    fullName: data.fullName,
                    username: data.username,
                    role: data.role,
                    subject: data.subject,
                    academicYear: data.academicYear,
                    status: data.status,
                };
                setProfile(mapped);
            })
            .catch(() => {
                if (!isMounted) return;
                setError("Failed to load profile");
            })
            .finally(() => {
                if (!isMounted) return;
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user]);

    if (authLoading || loading) {
        return (
            <>
                <SharedNavbar />
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h2">Loading profile...</Typography>
                </Box>
            </>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <>
                <SharedNavbar />
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h2">You must be logged in to view this page.</Typography>
                </Box>
            </>
        );
    }

    if (error || !profile) {
        return (
            <>
                <SharedNavbar />
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h2">
                        {error || "Profile not available"}
                    </Typography>
                </Box>
            </>
        );
    }

    return (
        <>
        <SharedNavbar/>
        <>
        <SharedNavbar/>
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: theme.palette.background.default,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: "clamp(340px, 40vw, 620px)",
                    borderRadius: "24px",
                    p: "32px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 96,
                            height: 96,
                            mx: "auto",
                            mb: 2,
                            backgroundColor: theme.palette.primary.main,
                        }}
                    >
                        <PersonOutlineIcon fontSize="large" />
                    </Avatar>

                    <Typography variant="h2">{profile.fullName}</Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {profile.username}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Info */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        mb: 4,
                    }}
                >
                    <InfoItem label="Role" value={profile.role} />
                    {profile.subject && (
                        <InfoItem label="Subject" value={profile.subject} />
                    )}
                    <InfoItem label="Academic Year" value={profile.academicYear} />
                    <InfoItem label="Status" value={profile.status} />
                </Box>

                {/* Edit Button */}
                <Button
                    fullWidth
                    onClick={() => setOpen(true)}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        height: 48,
                        borderRadius: "12px",
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    <Typography variant="h3">Edit Profile</Typography>
                </Button>
            </Card>

            <EditProfileDialog
                open={open}
                onClose={() => setOpen(false)}
                username={profile.username}
            />
            </Box>
        </>
            </Box>
        </>
    );
};

/* ================= Dialog ================= */

interface EditProfileDialogProps {
    open: boolean;
    onClose: () => void;
    username: string;
}

const EditProfileDialog = ({
    open,
    onClose,
    username,
}: EditProfileDialogProps) => {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent sx={{ p: 4 }}>
                    <Typography variant="h2" sx={{ mb: 3 }}>
                        Edit Profile
                    </Typography>

                <TextField
                    fullWidth
                    label="Username"
                    defaultValue={username}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    sx={{ mb: 3 }}
                />

                <Button
                    fullWidth
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        height: 44,
                        borderRadius: "10px",
                        "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    <Typography variant="h3">Save Changes</Typography>
                </Button>
            </DialogContent>
        </Dialog>
            );
        
        
            );
        
        
};

/* ================= Info Item ================= */

interface InfoItemProps {
    label: string;
    value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => {
    const theme = useTheme();

    return (
        <Box>
            <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
            >
                {label}
            </Typography>
            <Typography>{value}</Typography>
        </Box>
    );
};

export default TeacherProfilePage;