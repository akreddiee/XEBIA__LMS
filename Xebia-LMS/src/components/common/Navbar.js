"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, ShieldAlert, Search } from "lucide-react";
import NotificationPopover from "./NotificationPopover";

export default function Navbar({ onMenuToggle, isOffline }) {
  const { data: session } = useSession();
  const storedUser = typeof window !== "undefined" && typeof localStorage !== "undefined" ? JSON.parse(localStorage.getItem("current_user") || "null") : null;
  const user = session?.user || storedUser;

  return (
    <header className="sticky top-0 z-30 h-20 bg-white border-b border-border flex items-center justify-between px-6 md:px-8 shadow-xs flex-shrink-0">
      {/* Left side: Mobile Burger Trigger & Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl hover:bg-gray-100 text-foreground lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* Search Input Box */}
        <div className="relative w-full max-w-xs md:max-w-sm hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search courses, modules..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side: Role, Notifications, and Profile */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        {/* Search icon for mobile screens where input is hidden */}
        <button className="p-2 rounded-xl hover:bg-gray-100 text-foreground/70 hover:text-foreground sm:hidden transition-colors cursor-pointer" aria-label="Search">
          <Search className="w-5 h-5" />
        </button>

        {/* Interactive Notifications Popover */}
        <NotificationPopover />

        {isOffline && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-black text-amber-800 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Demo Mode</span>
          </div>
        )}

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-[10px] font-black text-amber-800 uppercase tracking-wider transition-colors cursor-pointer"
            title="Open Admin Control Center"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        )}

        <div className="h-8 w-px bg-border hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-extrabold text-foreground leading-tight">{user?.name || "Consultant"}</p>
            <p className="text-[10px] text-text-muted font-bold capitalize mt-0.5">{user?.role || "Learner"}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-sm uppercase">
            {user?.name?.substring(0, 2) || "CO"}
          </div>
        </div>
      </div>
    </header>
  );
}
