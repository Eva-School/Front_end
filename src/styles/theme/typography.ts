
import { ThemeOptions } from "@mui/material/styles";
import { ibmPlexSans } from "./font";

export const typography: ThemeOptions["typography"] = {
    fontFamily: ibmPlexSans.style.fontFamily,
    h1: {
        fontWeight: 700,
        fontSize: "clamp(0.6rem, 2vw, 1.1rem)",
        "@media (max-width:1838px)": {
            fontSize: "1rem",
        },
        "@media (max-width:1711px)": {
            fontSize: "0.8rem",
        },
        "@media (max-width:1450px)": {
            fontSize: "0.44rem",
        },

    },

    h2: {
        fontWeight: 700, fontSize: "2rem",
        "@media (max-width:1838px)": {
            fontSize: "1.6rem",
        },
        "@media (max-width:1024px)": {
            fontSize: "1.2rem",
        },
    },
    h3: {
        fontWeight: 700,
        fontSize: "clamp(0.6rem, 2vw, 1.1rem)",
        "@media (max-width:1838px)": {
            fontSize: "1rem",
        },
        "@media (max-width:1711px)": {
            fontSize: "0.8rem",
        },

    },

    h4: {
        fontWeight: 700,
        fontSize: "20px",
        "@media (max-width:1838px)": {
            fontSize: "18px",
        },
        "@media (max-width:1024px)": {
            fontSize: "16px",
        },
        "@media (max-width:999px)": {
            fontSize: "13.4px",
        },
    },

    h5: {
        fontWeight: 500,
        fontSize: "20px",
        "@media (max-width:1838px)": {
            fontSize: "18px",
        },
        "@media (max-width:1024px)": {
            fontSize: "15px",
        },
        "@media (max-width:999px)": {
            fontSize: "13.4px",
        },
    },

    body1: {
        fontWeight: 700,
        fontSize: "16px",
        "@media (max-width:1838px)": {
            fontSize: "15px",
        },
        "@media (max-width:1024px)": {
            fontSize: "13px",
        },

    },

    body2: {
        fontWeight: 400,
        fontSize: "16px",
        "@media (max-width:1838px)": {
            fontSize: "15px",
        },
        "@media (max-width:1024px)": {
            fontSize: "13px",
        },
    },
    body3: {
        fontWeight: 700,
        fontSize: "25px",
        "@media (max-width:1838px)": {
            fontSize: "22px",
        },
        "@media (max-width:1024px)": {
            fontSize: "20px",
        },
    },
    body4: {
        fontWeight: 500,
        fontSize: "25px",
        "@media (max-width:1838px)": {
            fontSize: "22px",
        },
        "@media (max-width:1024px)": {
            fontSize: "20px",
        },
    },


  

};
