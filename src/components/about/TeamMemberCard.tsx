"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography, IconButton, useTheme, alpha } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import type { Developer } from "@/types/developer";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TeamMemberCardProps {
  developer: Developer;
}

export default function TeamMemberCard({ developer }: TeamMemberCardProps) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primaryLight = alpha(primary, 0.12);
  const [imgError, setImgError] = useState(false);
  const showImage = developer.image && !imgError;

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        border: `1px solid ${alpha(primary, 0.2)}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 6px 20px ${alpha(primary, 0.1)}`,
          borderColor: alpha(primary, 0.3),
        },
        "&:focus-within": {
          outline: `2px solid ${primary}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          aspectRatio: "1",
          position: "relative",
          bgcolor: primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
         {showImage && (
    <>
      {/* background blurred */}
      <Image
        src={developer.image!}
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
        src={developer.image!}
        alt={developer.name}
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
      {getInitials(developer.name)}
    </Typography>
  )}
      </Box>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, textAlign: "center" }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 0.5,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          {developer.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mb: 1.5,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
          }}
        >
          {developer.role}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          {developer.githubUrl && (
            <IconButton
              href={developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              sx={{
                color: theme.palette.text.secondary,
                transition: "color 0.2s ease",
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
          {developer.linkedinUrl && (
            <IconButton
              href={developer.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              sx={{
                color: theme.palette.text.secondary,
                transition: "color 0.2s ease",
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
