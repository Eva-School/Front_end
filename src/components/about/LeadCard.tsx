"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography, IconButton, useTheme, alpha } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import type { TeamLead } from "@/types/developer";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface LeadCardProps {
  lead: TeamLead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primaryLight = alpha(primary, 0.12);
  const [imgError, setImgError] = useState(false);
  const showImage = lead.image && !imgError;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "flex-start" },
        gap: 3,
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        p: { xs: 3, md: 4 },
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        border: `1px solid ${alpha(primary, 0.15)}`,
        borderLeft: `4px solid ${primary}`,
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          boxShadow: `0 4px 16px ${alpha(primary, 0.08)}`,
        },
        "&:focus-within": {
          outline: `2px solid ${primary}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 160, md: 200 },
          height: { xs: 160, md: 200 },
          borderRadius: 2,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
         {showImage && (
    <>
      {/* background blurred */}
      <Image
        src={lead.image!}
        alt=""
        fill
        
        style={{
          objectFit: "cover",
          filter: "blur(12px)",
          transform: "scale(1.1)",
        }}
      />

      {/* main image */}
      <Image
        src={lead.image!}
        alt={lead.name}
        fill
        onError={() => setImgError(true)}
        style={{
          objectFit: "contain",
          
        }}
      />
    </>
  )}

  {!showImage && (
    <Typography
      sx={{
        fontSize: "3rem",
        fontWeight: 700,
        color: primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {getInitials(lead.name)}
    </Typography>
  )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {lead.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: primary,
            fontWeight: 600,
            mb: 2,
          }}
        >
          {lead.role}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            lineHeight: 1.8,
            mb: 2,
          }}
        >
          {lead.bio}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {lead.githubUrl && (
            <IconButton
              href={lead.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              sx={{
                color: theme.palette.text.secondary,
                transition: "color 0.2s ease, transform 0.2s ease",
                "&:hover": { color: primary },
                "&:focus-visible": {
                  outline: `2px solid ${primary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <GitHubIcon />
            </IconButton>
          )}
          {lead.linkedinUrl && (
            <IconButton
              href={lead.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              sx={{
                color: theme.palette.text.secondary,
                transition: "color 0.2s ease, transform 0.2s ease",
                "&:hover": { color: primary },
                "&:focus-visible": {
                  outline: `2px solid ${primary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <LinkedInIcon />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
