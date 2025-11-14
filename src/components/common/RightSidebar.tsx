import React, { useState } from "react";
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
  Rss
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

export default function RightSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const role = localStorage.getItem("role") || "Employee";

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

    {
      title: "More",
      icon: <MessageSquareMore className="h-4 w-4 text-gray-500" />,
      items: [
        {
          id: "blog",
          name: "Blog",
          icon: <Rss className="h-5 w-5" />,
          path: "/blog",
          roles: ["Admin", "SuperAdmin", "Employee"],
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

  // -------------------------
  // COMPONENT RENDER
  // -------------------------
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Profilics <span className="text-blue-600 italic">Sytems</span></h1>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="p-4 overflow-y-auto flex-1 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center space-x-2 mb-2">
                {section.icon}
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center w-full space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
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
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 w-64 bg-white h-full border-r border-gray-200 z-40 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-700">Menu</h2>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto flex-1 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center space-x-2 mb-2">
                {section.icon}
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 md:hidden z-30">
        <button onClick={() => setIsOpen(true)} className="flex flex-col items-center text-gray-700">
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
