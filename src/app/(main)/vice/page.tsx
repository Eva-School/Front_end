"use client";
import { mapViceCardsToSharedCards } from "@/mappers/viceCards.mapper";

import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";

import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { viceCardsApi } from "@/data/vice/vicecards";
import { useLanguage } from "@/context/LanguageContext";
export default function ViceDashboard() {
  const { t } = useLanguage();
  const cards = mapViceCardsToSharedCards(viceCardsApi).map((card) => ({
    ...card,
    title: t(`viceDashboard.${card.id}.title`, card.title),
    description: t(`viceDashboard.${card.id}.description`, card.description),
  }));

  return (
      <>
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          mt: { xs: "-64px", md: "-80px" },
          pt: { xs: "64px", md: "80px" },
          boxSizing: "border-box",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `
        linear-gradient(
          rgba(0, 0, 0, 0.75),
          rgba(5, 5, 10, 0.85)
        ),
        url('/Images/login/3.jpg')
      `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          },
        }}
      >
       
        {/* Page Content */}
        <Box sx={{ position: "relative", zIndex: 1, p: "10px 15px", }}>
          <Button
            component={Link}
            href="/vice/settings"
            variant="contained"
            startIcon={<SettingsIcon />}
            sx={{
              position: "absolute",
              // Keep this action opposite the dashboard title. MUI mirrors
              // `right` in RTL, placing it on the physical left in Arabic
              // and the physical right in English.
              top: { xs: 76, md: 80 },
              right: { xs: 16, md: 100 },
              zIndex: 2,
              borderRadius: "12px",
              px: { xs: 1.5, md: 2.25 },
              py: 1,
              fontWeight: 800,
              boxShadow: "0 8px 22px rgba(0, 0, 0, 0.28)",
            }}
          >
            {t("academicYears.dashboardAction", "Academic Year Settings")}
          </Button>

          <Box
            sx={{
              minHeight: "calc(100vh - 100px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DashboardHeader
              name={t("dashboards.vice")}
              year={t("dashboards.management")}
              subtitle={t("dashboards.academicOverview")}
            >
              <Box sx={{ display: "flex", gap: { xs: "20px", md: "20px", lg: "33px", xl: "75px", }, flexWrap: "wrap", justifyContent: "center" }}>
              {cards.map((card) => (
                  <SharedCard key={card.id} {...card} />
                ))}
              </Box>
            </DashboardHeader>
          </Box>

        </Box>
      </Box>

    </>


  );
}
