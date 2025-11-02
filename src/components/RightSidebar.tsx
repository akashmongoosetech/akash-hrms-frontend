import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building,
} from "lucide-react";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Employee";

  const allNavItems = [
    {
      id: "overview",
      name: "Dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      id: "user",
      name: "User",
      icon: <Users className="h-5 w-5" />,
      path: "/users",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "employees",
      name: "Employees",
      icon: <Users className="h-5 w-5" />,
      path: "/employees",
      roles: ["Employee", "Admin", "SuperAdmin"],
    },
    {
      id: "department",
      name: "Department",
      icon: <Building className="h-5 w-5" />,
      path: "/department",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: <Users className="h-5 w-5" />,
      path: "/statistics",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "activities",
      name: "Activities",
      icon: <Users className="h-5 w-5" />,
      path: "/activities",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "holidays",
      name: "Holidays",
      icon: <Users className="h-5 w-5" />,
      path: "/holidays",
    },
    {
      id: "events",
      name: "Events",
      icon: <Calendar className="h-5 w-5" />,
      path: "/events",
      roles: ["Admin", "SuperAdmin"],
    },
    { id: "reports", name: "Reports", icon: <BarChart3 className="h-5 w-5" />, path: "/reports" },
    {
      id: "gallery",
      name: "Gallery",
      icon: <Users className="h-5 w-5" />,
      path: "/gallery",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "todo",
      name: "Todo",
      icon: <Users className="h-5 w-5" />,
      path: "/todo",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "link",
      name: "Link",
      icon: <Users className="h-5 w-5" />,
      path: "/link",
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "ticket",
      name: "Ticket",
      icon: <Users className="h-5 w-5" />,
      path: "/tickets",
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
      icon: <Calendar className="h-5 w-5" />,
      path: "/leave",
    },
    { id: "payroll", name: "Payroll", icon: <FileText className="h-5 w-5" />, path: "/payroll" },
    {
      id: "recruitment",
      name: "Recruitment",
      icon: <TrendingUp className="h-5 w-5" />,
      path: "/recruitment",
    },
    {
      id: "client",
      name: "Client",
      icon: <TrendingUp className="h-5 w-5" />,
      path: "/client",
    },
    {
      id: "project",
      name: "Project",
      icon: <Users className="h-5 w-5" />,
      path: "/project",
    },
  ];

  const navItems = allNavItems.filter(
    (item) =>
      !item.roles ||
      item.roles.some((r) => r.toLowerCase() === role.toLowerCase())
  );

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200">
      <nav className="p-4 h-full overflow-y-auto">
        {/* Top Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => navigate("/events")}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title="Events"
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}