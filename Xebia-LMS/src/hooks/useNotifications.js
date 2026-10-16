"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiService } from "../lib/apiService";

export function useNotifications(filters = {}) {
  const { data: session } = useSession();
  const storedUser = typeof window !== "undefined" && typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("current_user") || "null") : null;
  const userId = session?.user?.id || storedUser?.id || "u-learner";
  const userRole = session?.user?.role || storedUser?.role || "learner";

  const [data, setData] = useState({
    items: [],
    total: 0,
    unreadCount: 0,
    page: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);
      const parsedFilters = filterKey ? JSON.parse(filterKey) : {};
      const res = await apiService.getNotifications(userId, userRole, parsedFilters);
      if (res && Array.isArray(res.items)) {
        setData(res);
      } else {
        setData({
          items: [],
          total: 0,
          unreadCount: 0,
          page: 0,
          totalPages: 1,
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [userId, userRole, filterKey]);

  useEffect(() => {
    fetchNotifications();

    // Event listener for synchronized cross-component notification updates
    const handleSync = () => {
      fetchNotifications();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("lms:notifications-updated", handleSync);
    }

    // Auto-refresh poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("lms:notifications-updated", handleSync);
      }
    };
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id, userId);
      // Optimistic state update
      setData((prev) => {
        const nextItems = prev.items.map((item) =>
          item.id === id ? { ...item, read: true } : item
        );
        const wasUnread = prev.items.find((item) => item.id === id && !item.read);
        return {
          ...prev,
          items: nextItems,
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lms:notifications-updated"));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead(userId, userRole);
      setData((prev) => ({
        ...prev,
        items: prev.items.map((item) => ({ ...item, read: true })),
        unreadCount: 0,
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lms:notifications-updated"));
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiService.deleteNotification(id, userId);
      setData((prev) => {
        const deletedItem = prev.items.find((item) => item.id === id);
        const nextItems = prev.items.filter((item) => item.id !== id);
        return {
          ...prev,
          items: nextItems,
          total: Math.max(0, prev.total - 1),
          unreadCount: deletedItem && !deletedItem.read ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lms:notifications-updated"));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return {
    notifications: Array.isArray(data?.items) ? data.items : [],
    total: typeof data?.total === "number" ? data.total : 0,
    unreadCount: typeof data?.unreadCount === "number" ? data.unreadCount : 0,
    page: data?.page || 0,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
