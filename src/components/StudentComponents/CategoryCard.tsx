"use client";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface CategoryCardProps {
  number: string;
  title: string;
  onClick: () => void;
}

export default function CategoryCard({
  number,
  title,
  onClick,
}: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "24px !important",
        }}
      >
        <Box
          sx={{
            width: "60px",
            height: "60px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: "white",
            }}
          >
            {number}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
