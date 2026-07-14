import localFont from "next/font/local";

export const notoSans = localFont({
    src: [
        { path: "../fonts/NotoSans-Regular.ttf", weight: "400", style: "normal" },
        { path: "../fonts/NotoSans-Bold.ttf", weight: "700", style: "normal" },
    ],
    display: "swap",
});
