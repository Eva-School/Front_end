"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, IconButton, useTheme, alpha } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TeamMemberCard from "./TeamMemberCard";
import type { Developer } from "@/types/developer";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "next-intl";

interface TeamCarouselProps {
  developers: Developer[];
}

const CARD_MIN_WIDTH = 280;
const GAP = 24;

export default function TeamCarousel({ developers }: TeamCarouselProps) {
  const theme = useTheme();
  const { dir } = useLanguage();
  const t = useTranslations();
  const primary = theme.palette.primary.main;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [developers.length]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = CARD_MIN_WIDTH + GAP;
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
      }}
    >
      <Box
        ref={scrollRef}
        onScroll={updateScrollState}
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          pb: 1,
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-track": { bgcolor: alpha(theme.palette.divider, 0.2), borderRadius: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: alpha(primary, 0.4), borderRadius: 4 },
        }}
      >
        {developers.map((dev) => (
          <Box
            key={dev.id}
            sx={{
              flex: `0 0 ${CARD_MIN_WIDTH}px`,
              scrollSnapAlign: "start",
              minWidth: { xs: "min(85vw, 320px)", sm: CARD_MIN_WIDTH },
            }}
          >
            <TeamMemberCard developer={dev} />
          </Box>
        ))}
      </Box>

      {/* Prev / Next buttons — hide on very small screens if you prefer */}
      {developers.length > 1 && (
        <>
          <IconButton
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label={t("a11y.previous")}
            sx={{
              position: "absolute",
              insetInlineStart: { xs: 4, sm: -20, md: -28 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: theme.palette.background.paper,
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              zIndex: 1,
              borderRadius: 2,
              transition: "background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { bgcolor: primary, color: theme.palette.getContrastText(primary), boxShadow: `0 4px 12px ${alpha(primary, 0.3)}` },
              "&:focus-visible": { outline: `2px solid ${primary}`, outlineOffset: 2 },
              "&.Mui-disabled": { bgcolor: theme.palette.action.disabledBackground },
            }}
          >
            {dir === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          <IconButton
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label={t("a11y.next")}
            sx={{
              position: "absolute",
              insetInlineEnd: { xs: 4, sm: -20, md: -28 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: theme.palette.background.paper,
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              zIndex: 1,
              borderRadius: 2,
              transition: "background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { bgcolor: primary, color: theme.palette.getContrastText(primary), boxShadow: `0 4px 12px ${alpha(primary, 0.3)}` },
              "&:focus-visible": { outline: `2px solid ${primary}`, outlineOffset: 2 },
              "&.Mui-disabled": { bgcolor: theme.palette.action.disabledBackground },
            }}
          >
            {dir === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </>
      )}
    </Box>
  );
}
