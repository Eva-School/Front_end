import { Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { PrimaryButtonProps } from "@/types/Shared/button";
import { useTheme } from "@mui/material/styles";

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onClick,
  startIcon = <AddIcon />,
}) => {
  const theme = useTheme();

  return (
    <Button
      startIcon={startIcon}
      onClick={onClick}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        width: "clamp(111px, 11.56vw, 222px)",
        height: "clamp(30px, 3.125vw, 60px)",
        borderRadius: "clamp(8px, 1.2vw, 20px)",
        padding: "18.67px 12px",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          boxShadow: "none",
        },
        "& .MuiButton-startIcon .MuiSvgIcon-root": {
          fontSize: "1rem" 
        },
      }}
    >
      <Typography variant="h1">{text}</Typography>
    </Button>

  );
};

export default PrimaryButton;
