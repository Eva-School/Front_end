"use client";

import React from "react";
import { Card, CardContent, Typography, useTheme, alpha } from "@mui/material";

interface SectionTitleCardProps {
  title: string;
}

export default function SectionTitleCard({ title }: SectionTitleCardProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Card
      component="section"
      variant="outlined"
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${alpha(primary, 0.2)}`,
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha(primary, 0.08)}`,
          borderColor: alpha(primary, 0.3),
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 3, "&:last-child": { pb: 2 } }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            m: 0,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
