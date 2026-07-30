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

const renderIcon = (iconInput: unknown) => {
  if (!iconInput) return null;
  if (React.isValidElement(iconInput)) return iconInput;

  const Resolved = (typeof iconInput === "object" && iconInput !== null && "default" in iconInput)
    ? (iconInput as { default: unknown }).default
    : iconInput;

  if (typeof Resolved === "function" || typeof Resolved === "string" || (typeof Resolved === "object" && Resolved !== null && "$$typeof" in Resolved)) {
    const Component = Resolved as React.ElementType;
    return <Component width={40} height={40} style={{ width: 40, height: 40 }} />;
  }

  if (typeof Resolved === "object" && Resolved !== null && "src" in Resolved) {
    return <img src={(Resolved as { src: string }).src} alt="" style={{ width: 40, height: 40 }} />;
  }

  return null;
};

function DashboardCard({
  icon,
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
            {renderIcon(icon)}

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
