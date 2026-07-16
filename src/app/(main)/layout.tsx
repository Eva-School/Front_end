"use client";

import { Box } from "@mui/material";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { motion, useReducedMotion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      sx={{ overflowX: "hidden" }}
      aria-label="Main content section"
    >
      {/* Navbar */}
      <SharedNavbar />

      {/* Page Content */}
      <Box sx={{ flex: 1}}>
        <Box
          component={motion.div}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
