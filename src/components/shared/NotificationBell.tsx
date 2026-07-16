"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  useTheme,
  alpha,
  Chip,
  Divider,
  ClickAwayListener,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GradeIcon from "@mui/icons-material/Grade";
import CampaignIcon from "@mui/icons-material/Campaign";
import InfoIcon from "@mui/icons-material/Info";
import AlarmIcon from "@mui/icons-material/Alarm";
import { secureFetch } from "@/config/api.config";
import { useLocale, useTranslations } from "next-intl";

interface Notification {
  id: string;
  type: "grade" | "announcement" | "system" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

interface NotificationsResponse {
  notifications?: Notification[];
  unreadCount?: number;
}

const TYPE_CONFIG = {
  grade: { icon: <GradeIcon sx={{ fontSize: 16 }} />, color: "#FFC600" },
  announcement: { icon: <CampaignIcon sx={{ fontSize: 16 }} />, color: "#2196F3" },
  system: { icon: <InfoIcon sx={{ fontSize: 16 }} />, color: "#9C27B0" },
  reminder: { icon: <AlarmIcon sx={{ fontSize: 16 }} />, color: "#FF5722" },
};

const PRIORITY_COLORS = { low: "#9E9E9E", medium: "#FF9800", high: "#F44336" };

function formatRelativeTime(iso: string, locale: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (mins < 1) return formatter.format(0, "second");
  if (mins < 60) return formatter.format(-mins, "minute");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return formatter.format(-hours, "hour");
  return formatter.format(-Math.floor(hours / 24), "day");
}

export default function NotificationBell() {
  const theme = useTheme();
  const locale = useLocale();
  const t = useTranslations();
  const primary = theme.palette.primary.main;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    setLoading(true);
    secureFetch<NotificationsResponse>("/api/notifications")
      .then((data) => {
        setNotifications(data.notifications ?? []);
        setUnread(data.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    queueMicrotask(fetchNotifications);
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    secureFetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(fetchNotifications);
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
    secureFetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    }).catch(() => {});
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box ref={ref} sx={{ position: "relative" }}>
        <IconButton
          onClick={() => setOpen((v) => !v)}
          size="small"
          aria-label={t("notifications.label")}
          sx={{
            color: open ? primary : theme.palette.text.secondary,
            bgcolor: open ? alpha(primary, 0.1) : "transparent",
            transition: "all 0.2s ease",
            "&:hover": { bgcolor: alpha(primary, 0.1), color: primary },
          }}
        >
          <Badge
            badgeContent={unread}
            max={9}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#F44336",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                animation: unread > 0 ? "badgePulse 2s ease-in-out infinite" : "none",
                "@keyframes badgePulse": {
                  "0%,100%": { transform: "scale(1) translate(50%, -50%)" },
                  "50%": { transform: "scale(1.2) translate(50%, -50%)" },
                },
              },
            }}
          >
            <NotificationsIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        {/* Dropdown */}
        {open && (
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 8px)",
              insetInlineEnd: 0,
              width: 340,
              maxHeight: 480,
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.18)}`,
              overflow: "hidden",
              zIndex: 1400,
              animation: "dropIn 0.2s ease-out",
              "@keyframes dropIn": {
                from: { opacity: 0, transform: "translateY(-8px) scale(0.97)" },
                to: { opacity: 1, transform: "translateY(0) scale(1)" },
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {t("notifications.label")}
                </Typography>
                {unread > 0 && (
                  <Chip
                    label={unread}
                    size="small"
                    sx={{ bgcolor: "#F44336", color: "#fff", height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                  />
                )}
              </Box>
              {unread > 0 && (
                <Typography
                  variant="caption"
                  onClick={markAllRead}
                  sx={{
                    color: primary,
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {t("notifications.markAllRead")}
                </Typography>
              )}
            </Box>

            {/* Notifications List */}
            <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
              {loading && (
                <Box sx={{ py: 3, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {t("common.loading")}
                  </Typography>
                </Box>
              )}

              {!loading && notifications.length === 0 && (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <NotificationsIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {t("notifications.empty")}
                  </Typography>
                </Box>
              )}

              {notifications.map((notif, i) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                return (
                  <Box key={notif.id}>
                    <Box
                      onClick={() => !notif.read && markRead(notif.id)}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        px: 2.5,
                        py: 1.75,
                        bgcolor: notif.read ? "transparent" : alpha(cfg.color, 0.04),
                        cursor: notif.read ? "default" : "pointer",
                        transition: "background 0.2s",
                        "&:hover": { bgcolor: alpha(cfg.color, 0.07) },
                        position: "relative",
                      }}
                    >
                      {/* Unread dot */}
                      {!notif.read && (
                        <Box
                          sx={{
                            position: "absolute",
                            insetInlineStart: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: cfg.color,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          bgcolor: alpha(cfg.color, 0.12),
                          color: cfg.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {cfg.icon}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notif.read ? 500 : 700,
                              color: theme.palette.text.primary,
                              fontSize: "0.8rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notif.title}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                            {notif.priority === "high" && (
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: PRIORITY_COLORS.high,
                                }}
                              />
                            )}
                            {notif.read && (
                              <CheckCircleIcon sx={{ fontSize: 13, color: "#4CAF50" }} />
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {notif.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: alpha(theme.palette.text.secondary, 0.6), fontSize: "0.65rem", mt: 0.25, display: "block" }}
                        >
                          {formatRelativeTime(notif.timestamp, locale)}
                        </Typography>
                      </Box>
                    </Box>
                    {i < notifications.length - 1 && (
                      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.35), mx: 2 }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
