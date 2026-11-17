import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  Building,
  BarChart3,
  Activity,
  CalendarDays,
  CalendarCheck,
  Image,
  Link,
  Ticket,
  Clock,
  CalendarRange,
  Wallet,
  UserPlus,
  Handshake,
  FolderKanban,
  Calendar,
  Settings,
  Menu,
  X,
  ListTodo,
  Briefcase,
  BadgeIndianRupee,
  Group,
  MessageSquareMore,
  Rss,
  GraduationCap,
  BookOpen,
  Notebook,
  LibraryBig,
  School, BadgeCheck, Lightbulb, UserCheck, HelpCircle, MapPin, ChevronDown
} from "lucide-react";
import SettingsSidebar from "./SettingsSidebar";

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
}

interface Section {
  title: string;
  icon?: React.ReactElement;
  items: NavItem[];
}

interface RightSidebarProps {
  /** Desktop: true when the sidebar is slid off-canvas. */
  collapsed?: boolean;
  /** Desktop: toggle collapse state. */
  onToggleCollapsed?: () => void;
  /** Mobile: drawer visibility. */
  mobileOpen?: boolean;
  /** Mobile: request a drawer state change. */
  onMobileOpenChange?: (open: boolean) => void;
}

export default function RightSidebar({
  collapsed = false,
  onToggleCollapsed,
  mobileOpen = false,
  onMobileOpenChange,
}: RightSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("sidebarSections");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });
  const role = localStorage.getItem("role") || "Employee";

  const closeMobile = () => onMobileOpenChange?.(false);

  // -------------------------
  // NAVIGATION SECTIONS
  // -------------------------
  const sections: Section[] = [
    {
      title: "Dashboard",
      items: [
        {
          id: "overview",
          name: "Dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Office",
      icon: <Building className="h-4 w-4 text-gray-500" />,
      items: [
        {
          id: "user",
          name: "User",
          icon: <User className="h-5 w-5" />,
          path: "/users",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "department",
          name: "Department",
          icon: <Building className="h-5 w-5" />,
          path: "/department",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "holidays",
          name: "Holidays",
          icon: <CalendarDays className="h-5 w-5" />,
          path: "/holidays",
        },
        {
          id: "payroll",
          name: "Payroll",
          icon: <Wallet className="h-5 w-5" />,
          path: "/payroll",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "recruitment",
          name: "Recruitment",
          icon: <UserPlus className="h-5 w-5" />,
          path: "/recruitment",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "team",
          name: "Team",
          icon: <Group className="h-5 w-5" />,
          path: "/team",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "accounts",
          name: "Account",
          icon: <BadgeIndianRupee className="h-5 w-5" />,
          path: "/accounts",
          roles: ["Admin", "SuperAdmin"],
        },
      ],
    },
    {
      title: "Employees",
      icon: <Users className="h-4 w-4 text-gray-500" />,
      items: [
        {
          id: "employees",
          name: "Employees",
          icon: <Users className="h-5 w-5" />,
          path: "/employees",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "statistics",
          name: "Statistics",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/statistics",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "employee-tracking",
          name: "Employee Tracking",
          icon: <MapPin className="h-5 w-5" />,
          path: "/employee-tracking",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "activities",
          name: "Activities",
          icon: <Activity className="h-5 w-5" />,
          path: "/activities",
          roles: ["Employee", "Admin", "SuperAdmin"],
        },
        {
          id: "events",
          name: "Events",
          icon: <CalendarCheck className="h-5 w-5" />,
          path: "/events",
        },
        {
          id: "reports",
          name: "Reports",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/reports",
        },
        {
          id: "gallery",
          name: "Gallery",
          icon: <Image className="h-5 w-5" />,
          path: "/gallery",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "attendance",
          name: "Attendance",
          icon: <Clock className="h-5 w-5" />,
          path: "/attendance",
        },
        {
          id: "leave",
          name: "Leave Management",
          icon: <CalendarRange className="h-5 w-5" />,
          path: "/leave",
        },
        {
          id: "performance",
          name: "Performance",
          icon: <BarChart3 className="h-5 w-5" />,
          path: "/performance",
          roles: ["Admin", "SuperAdmin"],
        },
        // {
        //   id: "onboarding",
        //   name: "Onboarding",
        //   icon: <UserCheck className="h-5 w-5" />,
        //   path: "/onboarding",
        //   roles: ["Admin", "SuperAdmin"],
        // },
      ],
    },
    {
      title: "Projects",
      icon: <Briefcase className="h-4 w-4 text-gray-500" />,
      items: [
        {
          id: "client",
          name: "Client",
          icon: <Handshake className="h-5 w-5" />,
          path: "/client",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "project",
          name: "Project",
          icon: <FolderKanban className="h-5 w-5" />,
          path: "/project",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "ticket",
          name: "Ticket",
          icon: <Ticket className="h-5 w-5" />,
          path: "/tickets",
        },
        {
          id: "todo",
          name: "Todo",
          icon: <ListTodo className="h-5 w-5" />,
          path: "/todo",
          roles: ["Employee", "Admin", "SuperAdmin"],
        },
        {
          id: "link",
          name: "Link",
          icon: <Link className="h-5 w-5" />,
          path: "/link",
          roles: ["Admin", "SuperAdmin"],
        },
      ],
    },

    // Learning Management
    {
      title: "Learning",
      icon: <GraduationCap className="h-4 w-4 text-gray-500" />,
      items: [
      {
          id: "learn",
          name: "Learning",
          icon: <BadgeCheck className="h-5 w-5" />,
          path: "/learn",
          roles: ["Admin", "SuperAdmin", "Employee"],
        },
        {
          id: "learning",
          name: "Admin Panel",
          icon: <Lightbulb className="h-5 w-5" />,
          path: "/learning",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "certificate-verification",
          name: "Verification",
          icon: <BadgeCheck className="h-5 w-5" />,
          path: "/certificate-verification",
          roles: ["Admin", "SuperAdmin"],
        },
        {
          id: "quiz",
          name: "My Quiz",
          icon: <HelpCircle className="h-5 w-5" />,
          path: "/quiz",
          roles: ["Employee"],
        },
        {
          id: "quiz-admin",
          name: "Quiz Admin",
          icon: <HelpCircle className="h-5 w-5" />,
          path: "/quiz-admin",
          roles: ["Admin", "SuperAdmin"],
        },
        // {
        //   id: "admin-course-panel",
        //   name: "Admin Course",
        //   icon: <Lightbulb className="h-5 w-5" />,
        //   path: "/admin-course-panel",
        //   roles: ["Admin", "SuperAdmin"],
        // },
      ],
    },

    {
      title: "More",
      icon: <MessageSquareMore className="h-4 w-4 text-gray-500" />,
      items: [
        {
          id: "chat",
          name: "Chat",
          icon: <MessageSquareMore className="h-5 w-5" />,
          path: "/chat",
          roles: ["Admin", "SuperAdmin", "Employee"],
        },
        {
          id: "blog",
          name: "Blog",
          icon: <Rss className="h-5 w-5" />,
          path: "/blog",
          roles: ["Admin", "SuperAdmin", "Employee"],
        },
        {
          id: "add-blog",
          name: "Add Blog",
          icon: <Rss className="h-5 w-5" />,
          path: "/blog-admin",
          roles: ["Admin", "SuperAdmin"],
        },
      ],
    },
  ];

  // -------------------------
  // ROLE-BASED FILTER
  // -------------------------
  const filteredSections = sections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        !item.roles || item.roles.some((r) => r.toLowerCase() === role.toLowerCase())
    ),
  }));

  const isSectionOpen = (title: string) => openSections[title] ?? true;

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = { ...prev, [title]: !(prev[title] ?? true) };
      try {
        localStorage.setItem("sidebarSections", JSON.stringify(next));
      } catch {
        // Storage can be unavailable (private mode); the UI still works.
      }
      return next;
    });
  };

  // Always reveal the section that owns the current page (handles direct links
  // and navigation from elsewhere while a section is collapsed).
  useEffect(() => {
    const activeSection = filteredSections.find((section) =>
      section.items.some((item) => item.path === location.pathname)
    );
    if (!activeSection) return;
    setOpenSections((prev) =>
      prev[activeSection.title] === false
        ? { ...prev, [activeSection.title]: true }
        : prev
    );
  }, [location.pathname]);

  const renderNav = (prefix: string, closeOnNavigate: boolean) => (
    <div className="space-y-2">
      {filteredSections.map((section) => {
        const open = isSectionOpen(section.title);
        const panelId = `${prefix}-section-${section.title
          .toLowerCase()
          .replace(/\s+/g, "-")}`;

        return (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              aria-expanded={open}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-50"
            >
              <span className="flex min-w-0 items-center space-x-2">
                {section.icon}
                <span className="truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.title}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {open && (
              <div id={panelId} className="mt-1 space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      if (closeOnNavigate) closeMobile();
                    }}
                    className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // -------------------------
  // COMPONENT RENDER
  // -------------------------
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="app-sidebar"
        aria-hidden={collapsed}
        className={`fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 md:flex ${
          collapsed ? "-translate-x-full pointer-events-none" : "translate-x-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
          <img
            src="/logo/logo.png"
            alt="SoSapient HRMS"
            className="h-9 w-auto max-w-full object-contain lg:h-10"
          />
          <button
            onClick={onToggleCollapsed}
            aria-label="Close sidebar"
            className="shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
          {renderNav("desktop", false)}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobile}
      />
      <aside
        aria-hidden={!mobileOpen}
        className={`fixed left-0 top-0 z-40 flex h-dvh w-[min(18rem,85vw)] flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <img
            src="/logo/logo.png"
            alt="SoSapient HRMS"
            className="h-8 w-auto max-w-[170px] object-contain"
          />
          <button
            onClick={closeMobile}
            aria-label="Close menu"
            className="shrink-0 rounded-md p-1 text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain p-4">
          {renderNav("mobile", true)}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <button
            onClick={() => {
              closeMobile();
              setIsRightSidebarOpen(true);
            }}
            className="flex w-full items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <button onClick={() => onMobileOpenChange?.(true)} className="flex flex-col items-center text-gray-700">
          <Menu className="h-5 w-5" />
          <span className="text-xs">Menu</span>
        </button>
        <button onClick={() => navigate("/dashboard")} className="flex flex-col items-center text-gray-700">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button onClick={() => navigate("/events")} className="flex flex-col items-center text-gray-700">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </button>
        <button onClick={() => setIsRightSidebarOpen(true)} className="flex flex-col items-center text-gray-700">
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </button>
      </nav>

      <SettingsSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        onNavigate={(path) => {
          navigate(path);
          setIsRightSidebarOpen(false);
        }}
      />
    </>
  );
}
