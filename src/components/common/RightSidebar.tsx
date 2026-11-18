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
  ListTodo,
  Briefcase,
  BadgeIndianRupee,
  Group,
  MessageSquareMore,
  Rss,
  GraduationCap,
  BadgeCheck,
  Lightbulb,
  HelpCircle,
  MapPin,
  ChevronDown,
} from "lucide-react";
import SettingsSidebar from "./SettingsSidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";

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

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
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
  const isIconCollapsed = !isMobile && state === "collapsed";

  const closeMobile = () => setOpenMobile(false);

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
      icon: <Building className="h-4 w-4" />,
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
      icon: <Users className="h-4 w-4" />,
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
      ],
    },
    {
      title: "Projects",
      icon: <Briefcase className="h-4 w-4" />,
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
    {
      title: "Learning",
      icon: <GraduationCap className="h-4 w-4" />,
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
      ],
    },
    {
      title: "More",
      icon: <MessageSquareMore className="h-4 w-4" />,
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
      (item) => !item.roles || item.roles.some((r) => r.toLowerCase() === role.toLowerCase())
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

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) closeMobile();
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
          <div className="flex h-10 items-center overflow-hidden">
            <img
              src="/logo/logo.png"
              alt="SoSapient HRMS"
              className="h-9 w-auto max-w-[170px] object-contain transition-all group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:max-w-[28px] group-data-[collapsible=icon]:object-cover group-data-[collapsible=icon]:object-left"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 px-1 py-2">
          {filteredSections.map((section) => {
            const open = isSectionOpen(section.title);
            const showItems = isIconCollapsed || open;

            return (
              <SidebarGroup key={section.title} className="py-1">
                <SidebarGroupLabel asChild>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    aria-expanded={open}
                    className="w-full justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {section.icon}
                      <span className="truncate">{section.title}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                        open ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                </SidebarGroupLabel>

                {showItems && (
                  <SidebarMenu className="gap-0.5">
                    {section.items.map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={active}
                            tooltip={item.name}
                            onClick={() => handleNavigate(item.path)}
                            className={`h-9 rounded-lg px-2.5 text-sm ${
                              active
                                ? "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {item.icon}
                            <span className="truncate">{item.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings"
                onClick={() => {
                  setIsRightSidebarOpen(true);
                  if (isMobile) closeMobile();
                }}
                className="h-9 rounded-lg px-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        <button onClick={() => setOpenMobile(true)} className="flex flex-col items-center text-gray-700">
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
