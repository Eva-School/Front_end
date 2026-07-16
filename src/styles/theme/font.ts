import localFont from "next/font/local";

export const notoSans = localFont({
    src: [
        { path: "../fonts/NotoSans-Regular.ttf", weight: "400", style: "normal" },
        { path: "../fonts/NotoSans-Bold.ttf", weight: "700", style: "normal" },
    ],
    display: "swap",
    variable: "--font-noto-sans",
});

export const cairo = localFont({
    src: [
        { path: "../fonts/Cairo-variable.ttf", weight: "200 1000", style: "normal" },
    ],
    display: "swap",
    variable: "--font-cairo",
});
