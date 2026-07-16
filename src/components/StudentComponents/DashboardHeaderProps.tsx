"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  name: string;
  year: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name, year, subtitle }) => {
  const t = useTranslations();
  return (
    <Box sx={{ mb: 5, textAlign: "start" }}>
      <Typography
        variant="h3"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 1,
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        {t("dashboards.welcome", { name })}
      </Typography>

      <Typography
        variant="h6"
        sx={{ color: "rgba(255, 255, 255, 0.32)", mb: 0.5 }}
      >
        {year}
      </Typography>

      {subtitle && (
        <Typography
          variant="body1"
          sx={{ color: "rgba(255, 255, 255, 0.42)", fontSize: "18px" }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default DashboardHeader;
