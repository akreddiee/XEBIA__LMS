"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  Award,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  BellOff,
  RefreshCw,
  X
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("all"); // "all" | "unread"
  const popoverRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ size: 8 });

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeUnreadCount = typeof unreadCount === "number" ? unreadCount : 0;

  const displayedNotifications =
    tab === "unread"
      ? safeNotifications.filter((n) => !n.read)
      : safeNotifications;

  const handleItemClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "ASSESSMENTS":
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#84117C]" />;
      case "COURSES":
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case "EVENTS":
        return <Calendar className="w-3.5 h-3.5 text-[#01AC9F]" />;
      case "GRADES":
        return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
      case "CERTIFICATES":
        return <Award className="w-3.5 h-3.5 text-purple-600" />;
      case "VERIFICATION":
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          pill: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          border: "border-l-rose-500",
        };
      case "WARNING":
        return {
          pill: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          border: "border-l-amber-500",
        };
      case "SUCCESS":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          border: "border-l-emerald-500",
        };
      case "INFO":
      default:
        return {
          pill: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
          border: "border-l-sky-500",
        };
    }
  };

  const formatTimeAgo = (dateStr) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "Recent";
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="notification-bell-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2.5 rounded-xl border transition-all duration-200 relative cursor-pointer ${
          isOpen
            ? "bg-primary/10 border-primary/30 text-primary"
            : "border-transparent hover:border-border hover:bg-gray-100 text-foreground/80 hover:text-foreground"
        }`}
        aria-label={`Notifications, ${safeUnreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5 pointer-events-none" />

        {/* Dynamic Unread Badge */}
        {safeUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FF6200] text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center animate-fadeIn shadow-xs pointer-events-none">
            {safeUnreadCount > 9 ? "9+" : safeUnreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-fadeIn transition-all duration-200"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Popover Header */}
          <div className="p-4 border-b border-border bg-gray-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-foreground text-sm">Notifications</h3>
              {safeUnreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                  {safeUnreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {safeUnreadCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-[11px] font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-foreground hover:bg-gray-200/60 transition-colors cursor-pointer"
                aria-label="Close notifications popover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Popover Filter Tabs */}
          <div className="flex items-center border-b border-border px-4 py-2 gap-2 bg-white text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                tab === "all"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-foreground hover:bg-gray-100"
              }`}
            >
              All ({safeNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("unread")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                tab === "unread"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-foreground hover:bg-gray-100"
              }`}
            >
              Unread ({safeUnreadCount})
            </button>
          </div>

          {/* Notification List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60 custom-scrollbar max-h-96">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-sm w-3/4" />
                      <div className="h-2 bg-gray-100 rounded-sm w-full" />
                      <div className="h-2 bg-gray-100 rounded-sm w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-600 font-bold">{error}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-foreground transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-text-muted">
                  <BellOff className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">
                  {tab === "unread" ? "No unread alerts" : "No notifications yet"}
                </h4>
                <p className="text-[11px] text-text-muted">
                  {tab === "unread"
                    ? "You are all caught up on your learning alerts!"
                    : "Activity updates and reminders will appear here."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const priorityStyle = getPriorityStyle(notif.priority);
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-gray-50/80 transition-colors flex items-start gap-3 relative cursor-pointer border-l-3 ${
                      notif.read ? "border-l-transparent bg-white" : `${priorityStyle.border} bg-primary/[0.02]`
                    }`}
                    onClick={() => handleItemClick(notif)}
                  >
                    {/* Category Icon Badge */}
                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-border/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black tracking-wider uppercase text-text-muted">
                          {notif.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {!notif.read && (
                            <span
                              className={`w-2 h-2 rounded-full ${priorityStyle.dot}`}
                              title="Unread"
                            />
                          )}
                          <span className="text-[10px] text-text-muted font-medium flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                      </div>

                      <h4
                        className={`text-xs leading-snug line-clamp-1 ${
                          notif.read ? "font-semibold text-foreground" : "font-extrabold text-foreground"
                        }`}
                      >
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                    </div>

                    {/* Mark as read quick button */}
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        className="p-1 rounded-md text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer mt-0.5"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-3 border-t border-border bg-gray-50/80 flex items-center justify-between text-xs">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer text-xs"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
