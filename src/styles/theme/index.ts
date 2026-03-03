import { createTheme, ThemeOptions } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";

const initialTheme = createTheme({ palette, typography });

const finalThemeOptions: ThemeOptions = {
    ...initialTheme,
    components: {
        MuiBreadcrumbs: {
            styleOverrides: {
                root: { color: initialTheme.palette.secondary?.contrastText },
                separator: { color: initialTheme.palette.secondary?.contrastText },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    ...(initialTheme.typography.body1 as React.CSSProperties),
                    textDecorationColor: "rgba(255, 255, 255, 0.5)",
                },
            },
        },
    },
};

const theme = createTheme(finalThemeOptions);
export default theme;
