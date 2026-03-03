import React from "react";

export interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
  startIcon?: React.ReactNode;
}
