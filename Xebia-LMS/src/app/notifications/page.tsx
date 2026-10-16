"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  BookOpen,
  FileSpreadsheet,
  ShieldCheck,
  BellOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationCategory, NotificationPriority, NotificationItem } from "../../types";

const CATEGORIES: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "All Categories", value: "ALL", icon: Bell },
  { label: "General", value: "GENERAL", icon: Info },
  { label: "Assessments", value: "ASSESSMENTS", icon: FileSpreadsheet },
  { label: "Courses", value: "COURSES", icon: BookOpen },
  { label: "Events", value: "EVENTS", icon: Calendar },
  { label: "Grades", value: "GRADES", icon: Sparkles },
  { label: "Certificates", value: "CERTIFICATES", icon: Award },
  { label: "Verification", value: "VERIFICATION", icon: ShieldCheck },
];

const PRIORITIES: { label: string; value: string }[] = [
  { label: "All Priorities", value: "ALL" },
  { label: "Urgent", value: "URGENT" },
  { label: "Warning", value: "WARNING" },
  { label: "Info", value: "INFO" },
  { label: "Success", value: "SUCCESS" },
];

export default function NotificationsPage() {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 10;

  const {
    notifications,
    total,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    status: statusFilter,
    category: categoryFilter,
    priority: priorityFilter,
    page: currentPage,
    size: pageSize,
  });

  // Client-side search filtering over current batch
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const getCategoryDetails = (category: NotificationCategory) => {
    switch (category) {
      case "ASSESSMENTS":
        return {
          icon: FileSpreadsheet,
          color: "text-[#84117C] bg-[#84117C]/10 border-[#84117C]/20",
          name: "Assessment",
        };
      case "COURSES":
        return {
          icon: BookOpen,
          color: "text-blue-700 bg-blue-50 border-blue-200",
          name: "Course",
        };
      case "EVENTS":
        return {
          icon: Calendar,
          color: "text-[#01AC9F] bg-[#01AC9F]/10 border-[#01AC9F]/20",
          name: "Event",
        };
      case "GRADES":
        return {
          icon: Sparkles,
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          name: "Grade",
        };
      case "CERTIFICATES":
        return {
          icon: Award,
          color: "text-purple-700 bg-purple-50 border-purple-200",
          name: "Certificate",
        };
      case "VERIFICATION":
        return {
          icon: ShieldCheck,
          color: "text-amber-700 bg-amber-50 border-amber-200",
          name: "Verification",
        };
      default:
        return {
          icon: Info,
          color: "text-gray-700 bg-gray-100 border-gray-200",
          name: "General",
        };
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          border: "border-l-rose-500",
        };
      case "WARNING":
        return {
          label: "Warning",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          border: "border-l-amber-500",
        };
      case "SUCCESS":
        return {
          label: "Success",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          border: "border-l-emerald-500",
        };
      case "INFO":
      default:
        return {
          label: "Info",
          badge: "bg-sky-50 text-sky-700 border-sky-200",
          dot: "bg-sky-500",
          border: "border-l-sky-500",
        };
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
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

  const handleActionClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Alerts & Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FF6200] text-white shadow-xs">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-muted font-medium mt-1">
            Centralized hub for course milestones, assessment deadlines, grading scorecard releases, and platform verification events.
          </p>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="p-2.5 border border-border bg-white hover:bg-gray-50 text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Refresh notifications"
            aria-label="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Filter Controls: Search & Read Status Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Read Status Filter Tabs */}
          <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-primary shadow-xs"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              All Alerts
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("unread");
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "unread"
                  ? "bg-white text-primary shadow-xs"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#FF6200]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("read");
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "read"
                  ? "bg-white text-primary shadow-xs"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              Read
            </button>
          </div>

          {/* Search Box & Priority Filter */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search alerts by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-primary/50 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border border-border rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:border-primary/50 font-bold text-foreground cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoryFilter === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat.value);
                  setCurrentPage(0);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-white text-foreground/80 border-border hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-text-muted"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Notification Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white border border-border p-5 rounded-2xl shadow-xs animate-pulse flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded-sm w-1/3" />
                    <div className="h-3 bg-gray-100 rounded-sm w-20" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-sm w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-extrabold text-rose-700">Failed to load alerts</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 text-text-muted flex items-center justify-center mx-auto">
              <BellOff className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">No alerts matching your criteria</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {searchQuery || categoryFilter !== "ALL" || statusFilter !== "all" || priorityFilter !== "ALL"
                  ? "Try resetting your search query or selected filters to see more results."
                  : "You're all caught up! New learning notifications and deadlines will appear here."}
              </p>
            </div>
            {(searchQuery || categoryFilter !== "ALL" || statusFilter !== "all" || priorityFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("ALL");
                  setPriorityFilter("ALL");
                  setCurrentPage(0);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-gray-50 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const catDetails = getCategoryDetails(notification.category);
            const priorityBadge = getPriorityBadge(notification.priority);
            const CategoryIcon = catDetails.icon;

            return (
              <div
                key={notification.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-l-4 ${
                  notification.read
                    ? "border-border border-l-transparent opacity-90"
                    : `${priorityBadge.border} border-border bg-gradient-to-r from-primary/[0.015] to-transparent`
                }`}
              >
                {/* Left Side: Category Icon + Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${catDetails.color}`}
                  >
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Header line: Badges and Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6200]/10 text-[#FF6200] border border-[#FF6200]/20 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6200] animate-pulse" />
                          New
                        </span>
                      )}

                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${catDetails.color}`}
                      >
                        {catDetails.name}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${priorityBadge.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                        {priorityBadge.label}
                      </span>

                      {/* Time */}
                      <span
                        className="text-[11px] text-text-muted font-medium ml-auto flex items-center gap-1"
                        title={formatFullDate(notification.createdAt)}
                      >
                        <Clock className="w-3 h-3 text-text-muted/70" />
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    {/* Notification Title */}
                    <h2
                      className={`text-sm sm:text-base leading-snug tracking-tight ${
                        notification.read ? "font-bold text-foreground" : "font-extrabold text-foreground"
                      }`}
                    >
                      {notification.title}
                    </h2>

                    {/* Notification Body Message */}
                    <p className="text-xs text-foreground/80 leading-relaxed font-normal">
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60 flex-shrink-0">
                  {/* Action CTA Button */}
                  {notification.actionUrl && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(notification)}
                      className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Mark as read & Delete Icon buttons */}
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Dismiss notification"
                      aria-label="Dismiss notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <span className="text-xs text-text-muted font-bold">
            Showing page {currentPage + 1} of {totalPages} ({total} total alerts)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-2 border border-border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-foreground transition-all cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage + 1 >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-2 border border-border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-foreground transition-all cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
