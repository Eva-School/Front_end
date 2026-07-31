"use client";

import React from "react";
import Link from "next/link";
import { Box, Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BarChartIcon from "@mui/icons-material/BarChart";

import DashboardHeader from "@/components/shared/DashboardHeader-bg";
import SharedCard from "@/components/shared/SharedCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { CardData } from "@/types/SharedCard";

interface AdminCardDefinition {
  id: string;
  href: string;
  icon: CardData["icon"];
}

const ADMIN_CARD_DEFINITIONS: AdminCardDefinition[] = [
  {
    id: "students",
    href: "/vice/students",
    icon: GroupsIcon,
  },
  {
    id: "teachers",
    href: "/vice/teachers",
    icon: PersonAddAlt1Icon,
  },
  {
    id: "quarterGrades",
    href: "/vice/grades",
    icon: FactCheckIcon,
  },
  {
    id: "finalGrades",
    href: "/vice/grades/final",
    icon: AssignmentTurnedInIcon,
  },
  {
    id: "settings",
    href: "/vice/settings",
    icon: SettingsIcon,
  },
  {
    id: "rankings",
    href: "/rankings",
    icon: BarChartIcon,
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const cards: CardData[] = ADMIN_CARD_DEFINITIONS.map((def) => ({
    id: def.id,
    title: t(`dashboards.adminCards.${def.id}.title`),
    description: t(`dashboards.adminCards.${def.id}.description`),
    href: def.href,
    icon: def.icon,
  }));

  return (
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
      <Box sx={{ position: "relative", zIndex: 1, p: "10px 15px" }}>
        <Button
          component={Link}
          href="/vice/settings"
          variant="contained"
          startIcon={<SettingsIcon />}
          sx={{
            position: "absolute",
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
            name={user?.username ? t("dashboards.welcome", { name: user.username }) : t("dashboards.admin")}
            year={t("dashboards.admin")}
            subtitle={t("dashboards.adminSubtitle")}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: "20px", md: "20px", lg: "33px", xl: "75px" },
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {cards.map((card) => (
                <SharedCard key={card.id} {...card} />
              ))}
            </Box>
          </DashboardHeader>
        </Box>
      </Box>
    </Box>
  );
}
