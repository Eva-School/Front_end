import { Button, Typography } from "@mui/material";
import React from "react";
import { PrimaryButtonProps } from "@/types/Shared/button";
import { useTheme } from "@mui/material/styles";

const PrimaryButton: React.FC<PrimaryButtonProps> = ({

  text,
  onClick,

}) => {
  const theme = useTheme();

  return (
    <Button
      
      onClick={onClick}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        width: "clamp(220px, 24vw, 444px)",
        height: "clamp(42px, 5.8vw, 80px)",
        borderRadius: "clamp(8px, 1.2vw, 20px)",
        padding: "18.67px 12px",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          boxShadow: "none",
        }
      }}
    >
      <Typography variant="h2">{text}</Typography>
    </Button>

  );
};

export default PrimaryButton;
