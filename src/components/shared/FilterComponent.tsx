import React, { useState } from "react";
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Filter = () => {
    const theme = useTheme();
    const [type, setType] = useState("");
    const [level, setLevel] = useState("");

    const buttonStyle = {
        border: "none",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textTransform: "none",
        backgroundColor: "transparent",
        color: theme.palette.text.secondary,

        "& .circle": {
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: `2px solid ${theme.palette.primary.main}`,
            transition: "all 0.2s ease",
            flexShrink: 0,
        },

        "&.Mui-selected .circle": {
            backgroundColor: theme.palette.primary.main,
        },

        "&.Mui-selected": {
            color: theme.palette.text.primary,
            backgroundColor: "transparent",
        },

        "&:hover": {
            backgroundColor: "transparent",
        },
    };

    return (
        <Box
            sx={{
                backgroundColor: theme.palette.background.main,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
            }}
        >
            {/* Type */}
            <ToggleButtonGroup
                exclusive
                value={type}
                onChange={(e, val) => setType(val)}
                sx={{ gap: "32px" }}
            >
                {["OM", "SD"].map((item) => (
                    <ToggleButton key={item} value={item} sx={buttonStyle}>
                        <Box className="circle" />
                        <Typography variant="h1">{item}</Typography>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {/* Level */}
            <ToggleButtonGroup
                exclusive
                value={level}
                onChange={(e, val) => setLevel(val)}
                sx={{ gap: "32px" }}
            >
                {["Junior", "Wheeler", "Senior"].map((item) => (
                    <ToggleButton key={item} value={item} sx={buttonStyle}>
                        <Box className="circle" />
                        <Typography variant="h1">{item}</Typography>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
};

export default Filter;
