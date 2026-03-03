"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import SharedNavbar from "@/components/layout/SharedNavbar";
import LeadCard from "@/components/about/LeadCard";
import TeamCarousel from "@/components/about/TeamCarousel";
import SectionTitleCard from "@/components/about/SectionTitleCard";
import { teamLead, aboutTeams, aboutStats } from "@/data/about";

export default function AboutPage() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        pb: 10,
      }}
    >
      <SharedNavbar />

      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 8 },
          px: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: `linear-gradient(135deg, ${alpha(primary, 0.08)} 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              textAlign: "center",
              mb: 2,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
              transition: "opacity 0.3s ease",
            }}
          >
            About the team
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: "center",
              maxWidth: 560,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            The dedicated team behind the School Grading System — committed to
            excellence, security, and a seamless experience for students,
            teachers, and admins.
          </Typography>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="md" sx={{ mb: { xs: 6, md: 8 }, px: { xs: 2, sm: 2 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
            gap: { xs: 2, sm: 3 },
            justifyContent: "center",
            maxWidth: 480,
            mx: "auto",
          }}
        >
          {aboutStats.map((stat, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                border: `1px solid ${alpha(primary, 0.2)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  boxShadow: `0 4px 16px ${alpha(primary, 0.08)}`,
                  borderColor: alpha(primary, 0.3),
                },
                "&:focus-within": {
                  outline: `2px solid ${primary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: primary,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Team Lead */}
      <Container maxWidth="md" sx={{ mb: { xs: 6, md: 8 }, px: { xs: 2, sm: 2 } }}>
        <Box sx={{ mb: 3 }}>
          <SectionTitleCard title="Team Lead" />
        </Box>
        <LeadCard lead={teamLead} />
      </Container>

      {/* Teams: Backend, Frontend, Flutter */}
      {aboutTeams.map((team) => (
        <Box
          key={team.key}
          sx={{
            bgcolor: alpha(primary, 0.04),
            py: { xs: 5, sm: 6, md: 8 },
            borderTop: `1px solid ${alpha(primary, 0.12)}`,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2 }, mb: 3 }}>
            <SectionTitleCard title={team.title} />
          </Container>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 2 } }}>
            <TeamCarousel developers={team.developers} />
          </Container>
        </Box>
      ))}
    </Box>
  );
}
