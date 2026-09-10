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
    Alert,
    Skeleton,
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
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        let isMounted = true;
        // keep effect side-effect-only; avoid setState at effect start (eslint rule)

        profileService
            .getMyProfile()
            .then((data) => {
                if (!isMounted) return;
                setError(null);
                const mapped: ProfileData = {
                    fullName: data.fullName?.trim() || data.username?.trim() || user.username,
                    username: data.username?.trim() || user.username,
                    role: data.role?.trim() || user.role,
                    subject: data.subject,
                    academicYear: data.academicYear?.trim() || "Not assigned",
                    status: data.status ?? "Active",
                };
                setProfile(mapped);
            })
            .catch(() => {
                if (!isMounted) return;
                setError("Failed to load profile data from server.");
            });

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, user, retryCount]);

    if (authLoading) {
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
                    <Typography variant="h2">
                        You must be logged in to view this page.
                    </Typography>
                </Box>
            </>
        );
    }

    if (error) {
        return (
            <>
                <SharedNavbar />
                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                    }}
                >
                    <Card
                        sx={{
                            width: "clamp(340px, 40vw, 500px)",
                            borderRadius: "20px",
                            p: 4,
                            textAlign: "center",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setError(null);
                                setProfile(null);
                                setRetryCount((c) => c + 1);
                            }}
                            sx={{ borderRadius: "12px", px: 4, py: 1.5 }}
                        >
                            Try Again
                        </Button>
                    </Card>
                </Box>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <SharedNavbar />
                <Box
                    sx={{
                        minHeight: "100vh",
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
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Skeleton variant="circular" width={96} height={96} />
                        <Skeleton variant="text" width={200} height={32} />
                        <Skeleton variant="text" width={140} height={20} />
                        <Divider sx={{ width: "100%", my: 2 }} />
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 3,
                                width: "100%",
                            }}
                        >
                            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                        </Box>
                    </Card>
                </Box>
            </>
        );
    }

    return (
        <>
            <SharedNavbar />
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
                        <InfoItem
                            label="Academic Year"
                            value={profile.academicYear}
                        />
                        <InfoItem label="Status" value={profile.status} />
                    </Box>

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
    const [message] = useState(
        "Profile update (username/password) is not available because the backend Swagger does not expose an update endpoint yet."
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent sx={{ p: 4 }}>
                <Typography variant="h2" sx={{ mb: 3 }}>
                    Edit Profile
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    {message}
                </Alert>

                <TextField
                    fullWidth
                    label="Username"
                    defaultValue={username}
                    sx={{ mb: 2 }}
                    disabled
                />

                <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    sx={{ mb: 2 }}
                    disabled
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    sx={{ mb: 3 }}
                    disabled
                />

                <Button
                    fullWidth
                    disabled
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