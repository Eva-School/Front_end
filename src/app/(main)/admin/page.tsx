
"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function AdminPage() {
    const { t } = useLanguage();
    return (
        <div>
            <h1>{t("dashboards.admin")}</h1>
        </div>
    );
}
