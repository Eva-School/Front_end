import React from "react";
import { Card, Typography, Box, Divider } from "@mui/material";
import BookIcon from "@/icons/book.svg";
import FileIcon from "@/icons/file.svg";
import { IconType } from "@/types/Icons";
interface DashboardCardProps {
  icon: IconType;
  title: string;
  description: string;
  onClick: () => void;
}

function DashboardCard({
  icon: Icon,
  title,
  description,
  onClick,
}: DashboardCardProps) {
  return (
    <Card
      onClick={onClick}
      tabIndex={0}
      sx={{
        width: "505px",
        height: "270px",
        borderRadius: "15px",
        cursor: "pointer",
        bgcolor: "rgba(255, 255, 255, 0.88)",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          outline: "2px solid #FFC600",

        }
      }}
    >

      <Box
        sx={{
          width: "93.069%",
          height: "55.556%",
          margin: "auto"
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",

          }}>
          <Box
            sx={{
              width: "60px",
              height: "60px",
              bgcolor: "#FFC600",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

            }}
          >
            <Icon width={40} height={40} />

          </Box>
          <Box
            sx={{
              marginLeft: "20px",
            }}>
            <Typography variant="body4">{title}</Typography>
          </Box>
        </Box>

        <Divider sx={{ m:"20px 0"}} />

        <Box
          sx={{
            marginLeft: "20px",
            color: "#6B7280"
          }}>
          <Typography variant="h5">{description}</Typography>
        </Box>
      </Box>

    </Card>
  );
}

export default function StudentDashboard() {
  const handleCardClick = () => {};

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 4,
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "nowrap",
        }}
      >
        <DashboardCard
          icon={BookIcon}
          title="Quarter Grades"
          description="View your quarterly performance across all subjects"
          onClick={handleCardClick}
        />

        <DashboardCard
          icon={FileIcon}
          title="Final Grades"
          description="View your semester final exam grades"
          onClick={handleCardClick}
        />

        <DashboardCard
          icon={FileIcon}
          title="Competencies Grades"
          description="View your specialization competency grades"
          onClick={handleCardClick}
        />
      </Box>
    </Box>
  );
}
