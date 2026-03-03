"use client";

import { Box } from "@mui/material";
import SharedNavbar from "@/components/layout/SharedNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Navbar */}
      <SharedNavbar />

      {/* Page Content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}