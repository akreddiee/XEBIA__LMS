
import React from "react";
import { useLocation } from "react-router-dom";
import { useSession } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  LogOut,
  FolderKanban,
  FileCode,
  Sliders,
  Layers,
  UserPlus,
  BarChart3,
  Shield,
  Settings,
  ShieldCheck,
  Bell
} from "lucide-react";
import SidebarLogo from "./SidebarLogo";
import SidebarToggle from "./SidebarToggle";
import NavigationItem from "./NavigationItem";

export default function Sidebar({ isOpen, onClose, collapsed, onCollapseToggle }) {
  const location = useLocation();
  const pathname = location.pathname || "";

  const { data: session, logout } = useSession();
  
  const userRole = session?.user?.role || "learner";
  const userName = session?.user?.name || "Consultant";

  const learnerLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Categories", href: "/categories", icon: Tag },
    { name: "All Courses", href: "/courses", icon: BookOpen },
    { name: "Verify Certificate", href: "/verification", icon: ShieldCheck },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const adminLinks = [
    { name: "Admin Dashboard", href: "/admin", icon: Layers },
    { name: "Verification Center", href: "/admin/verification", icon: ShieldCheck },
    { name: "Manage Categories", href: "/admin/categories", icon: Tag },
    { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Manage Modules", href: "/admin/modules", icon: FolderKanban },
    { name: "Manage Submodules", href: "/admin/submodules", icon: Sliders },
    { name: "Content Builder", href: "/admin/content", icon: FileCode },
    { name: "Learner Credentials", href: "/admin/learners", icon: UserPlus },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Roles & Permissions", href: "/admin/permissions", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const isActive = (href) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Wrapper with width transition */}
      <aside
        className={`fixed lg:relative top-0 bottom-0 left-0 lg:top-auto lg:bottom-auto lg:left-auto z-40 bg-white border-r border-border flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-[80px]" : "lg:w-[280px]"} w-[280px] h-screen lg:h-screen`}
      >
        {/* Toggle Button - placed outside the scroll container to prevent clipping */}
        <SidebarToggle collapsed={collapsed} onToggle={onCollapseToggle} />

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          {/* Logo Brand Header */}
          <div className="flex items-center border-b border-border h-20">
            <SidebarLogo collapsed={collapsed} onClick={onClose} />
          </div>

          {/* Navigation links block */}
          <nav className="p-4 flex flex-col gap-1 transition-all duration-300">
            <span className={`px-4 text-[10px] font-black text-text-muted uppercase tracking-wider block transition-all duration-300 overflow-hidden whitespace-nowrap ${
              collapsed ? "max-h-0 opacity-0 mb-0 mt-0" : "max-h-8 opacity-100 mb-2 mt-2"
            }`}>
              LEARNING
            </span>
            {learnerLinks.map((link) => (
              <NavigationItem
                key={link.href}
                name={link.name}
                href={link.href}
                icon={link.icon}
                active={isActive(link.href)}
                collapsed={collapsed}
                onClick={onClose}
              />
            ))}

            {userRole === "admin" && (
              <>
                <span className={`px-4 text-[10px] font-black text-text-muted uppercase tracking-wider block transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  collapsed ? "max-h-0 opacity-0 mt-0 mb-0" : "max-h-8 opacity-100 mt-6 mb-2"
                }`}>
                  ADMINISTRATOR
                </span>
                <div className={`bg-border transition-all duration-300 ${collapsed ? "h-px my-4 mx-4" : "h-0 my-0 overflow-hidden"}`} />
                {adminLinks.map((link) => (
                  <NavigationItem
                    key={link.href}
                    name={link.name}
                    href={link.href}
                    icon={link.icon}
                    active={isActive(link.href)}
                    collapsed={collapsed}
                    onClick={onClose}
                  />
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Footer profile area */}
        <div className="p-4 border-t border-border bg-gray-50/50 flex flex-col gap-3 flex-shrink-0 transition-all duration-300">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-2 py-1"}`}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-primary text-sm uppercase flex-shrink-0">
              {userName.substring(0, 2)}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap ${
              collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[200px] opacity-100"
            }`}>
              <p className="text-sm font-extrabold text-foreground truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-text-muted font-bold truncate capitalize mt-0.5">{userRole}</p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className={`flex items-center gap-2.5 py-2.5 border border-border text-foreground hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
              collapsed ? "px-2 justify-center border-transparent hover:bg-rose-50" : "px-4"
            } w-full`}
            title={collapsed ? "Sign Out" : ""}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            <span className={`truncate transition-all duration-300 overflow-hidden whitespace-nowrap ${
              collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[150px] opacity-100"
            }`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
