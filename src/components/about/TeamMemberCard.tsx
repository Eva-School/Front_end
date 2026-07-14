"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography, IconButton, useTheme, alpha } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { motion } from "framer-motion";
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
  const secondary = theme.palette.secondary?.main || primary;
  const [imgError, setImgError] = useState(false);
  const showImage = developer.image && !imgError;

  return (
    <Box
      component={motion.div}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: "blur(12px)",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
        border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        borderTop: `1px solid ${alpha(primary, 0.2)}`,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 4,
          boxShadow: `inset 0 0 0 2px ${alpha(primary, 0)}`,
          transition: "box-shadow 0.3s ease",
          pointerEvents: "none",
        },
        "&:hover::after": {
          boxShadow: `inset 0 0 0 2px ${alpha(primary, 0.5)}`,
        },
      }}
    >
      <Box
        sx={{
          aspectRatio: "1",
          position: "relative",
          bgcolor: alpha(primary, 0.05),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "50%",
            background: `linear-gradient(to top, ${alpha(theme.palette.background.paper, 1)}, transparent)`,
            pointerEvents: "none",
            zIndex: 1,
          }
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
                filter: "blur(16px)",
                transform: "scale(1.1)",
                opacity: 0.6,
              }}
            />

            {/* main image */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", height: "100%", position: "relative" }}
            >
              <Image
                src={developer.image!}
                alt={developer.name}
                fill
                onError={() => setImgError(true)}
                style={{
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </motion.div>
          </>
        )}

        {!showImage && (
          <Typography
            sx={{
              fontSize: "3.5rem",
              fontWeight: 800,
              color: primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textShadow: `0 2px 10px ${alpha(primary, 0.2)}`,
            }}
          >
            {getInitials(developer.name)}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: "center", position: "relative", zIndex: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            mb: 0.5,
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            letterSpacing: "-0.01em",
          }}
        >
          {developer.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            display: "inline-block",
            background: `linear-gradient(90deg, ${primary}, ${secondary})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {developer.role}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          {developer.githubUrl && (
            <IconButton
              component={motion.a}
              whileHover={{ scale: 1.2, backgroundColor: alpha(theme.palette.text.primary, 0.1) }}
              whileTap={{ scale: 0.9 }}
              href={developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
              }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
          )}
          {developer.linkedinUrl && (
            <IconButton
              component={motion.a}
              whileHover={{ scale: 1.2, backgroundColor: alpha("#0077b5", 0.1) }}
              whileTap={{ scale: 0.9 }}
              href={developer.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                "&:hover": { color: "#0077b5" }
              }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}
