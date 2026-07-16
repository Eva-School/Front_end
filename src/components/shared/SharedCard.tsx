import React from "react";
import Link from "next/link";
import { Card, Box, Typography, Divider, useTheme } from "@mui/material";
import { CardData } from "@/types/SharedCard";

type SharedCardProps = CardData;

const SharedCard: React.FC<SharedCardProps> = ({
  icon: Icon,
  title,
  description,
  href,
}) => {
  const theme = useTheme();
  const validHref = typeof href === "string" && href.trim().length > 0 ? href : null;

  const content = (
      <Card
        tabIndex={validHref ? 0 : -1}
        sx={{
          textDecoration: "none",
          width: "100%",
          maxWidth: 505,
          height: 270,
          borderRadius: 3,
          cursor: validHref ? "pointer" : "default",
          bgcolor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          "&:hover": {
            outline: `2px solid ${theme.palette.primary.main}`,
            transform: "translateY(-2px)",
          },
          [theme.breakpoints.up("lg")]: {
            maxWidth: 390,
            height: 220,
          },
          [theme.breakpoints.up("md")]: {
            maxWidth: 282,
            height: 195,
          },
          [theme.breakpoints.down("sm")]: {
            maxWidth: "90vw",
            height: 200,
          },
        }}
      >
        <Box
          sx={{
            width: "90%",
            height: "55%",
            margin: "auto",
          }}
        >
          {/* Icon + Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: theme.palette.primary.main,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon width={40} height={40} />
            </Box>

            <Box sx={{ marginInlineStart: 2.5, flex: 1 }}>
              <Typography variant="body4" color="text.primary">
                {title}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Description */}
          <Box sx={{ marginInlineStart: 2.5 }}>
            <Typography variant="h5" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </Card>
  );

  return validHref ? (
    <Link href={validHref} style={{ display: "contents", textDecoration: "none" }}>
      {content}
    </Link>
  ) : content;
};

export default SharedCard;
