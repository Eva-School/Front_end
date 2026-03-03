import { PaletteOptions } from "@mui/material/styles";

export const palette: PaletteOptions = {
    mode: "light",

    // Primary colors
    primary: { main: "#FFC600", dark: "#E6B800" },
    secondary: { main: "#ffc600", contrastText: "#fff" },

    // Feedback colors
    error: { main: "rgba(191, 0, 0, 0.16)", light:"#D40000"},
    warning: { main: "#ff9800" },
    info: { main: "#2196f3" },
    success: { main: "#4caf50" },

    // Background
    background: {
        default: "#f4f6f8",
        paper: "rgba(255, 255, 255, 0.88)",
        main:"#ffffff"
    },

    // Text
    text: {
        primary: "#212121",
        secondary: "#757575",
    },
    
    divider: "rgba(81, 81, 81, 0.3)",

    action: {
        hover: "#ffcdd2",
        
    },

};
