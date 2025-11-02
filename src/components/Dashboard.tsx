import React, { useState, useEffect } from "react";
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
import EmployeeTable from "./EmployeeTable";
import UserTable from "./UserTable";
import DepartmentTable from "./DepartmentTable";
import HolidayTable from "./HolidayTable";
import EventTable from "./EventTable";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Fetch user profile data from backend
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const response = await fetch(
            `${
              (import.meta as any).env.VITE_API_URL || "http://localhost:5000"
            }/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error(
              "Failed to fetch user profile, status:",
              response.status,
              "userId:",
              userId
            );
            // Clear invalid user data from localStorage
            if (response.status === 404) {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("userId");
              localStorage.removeItem("userName");
              // Redirect to login
              navigate("/login");
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Get user info from API response or fallback to localStorage
  const role = userData?.role || localStorage.getItem("role") || "Employee";
  const userName = userData
    ? `${userData.firstName} ${userData.lastName}`
    : localStorage.getItem("userName") || "User";
  const userPhoto = userData?.photo
    ? `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"}/${
        userData.photo
      }`
    : null;
  console.log("userPhoto URL:", userPhoto); // Debug photo URL

  const allNavItems = [
    {
      id: "overview",
      name: "Dashboard",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "user",
      name: "User",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "employees",
      name: "Employees",
      icon: <Users className="h-5 w-5" />,
      roles: ["Employee", "Admin", "SuperAdmin"],
    },
    {
      id: "department",
      name: "Department",
      icon: <Building className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "activities",
      name: "Activities",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "holidays",
      name: "Holidays",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "events",
      name: "Events",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    { id: "reports", name: "Reports", icon: <BarChart3 className="h-5 w-5" /> },
    {
      id: "gallery",
      name: "Gallery",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "todo",
      name: "Todo",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "link",
      name: "Link",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "ticket",
      name: "Ticket",
      icon: <Users className="h-5 w-5" />,
      roles: ["Admin", "SuperAdmin"],
    },
    {
      id: "attendance",
      name: "Attendance",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: "leave",
      name: "Leave Management",
      icon: <Calendar className="h-5 w-5" />,
    },
    { id: "payroll", name: "Payroll", icon: <FileText className="h-5 w-5" /> },
    {
      id: "recruitment",
      name: "Recruitment",
      icon: <TrendingUp className="h-5 w-5" />,
    }
  ];

  const navItems = allNavItems.filter(
    (item) =>
      !item.roles ||
      item.roles.some((r) => r.toLowerCase() === role.toLowerCase())
  );

  // Mock data for dashboard
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeave: 0,
    newHires: 0,
    pendingRequests: 0,
  });

  const [realStats, setRealStats] = useState({
    totalEmployees: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Fetch real user statistics
    const fetchUserStats = async () => {
      try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const users = await response.json();
          const totalEmployees = users.filter((user: any) => user.role === 'Employee').length;
          const totalAdmins = users.filter((user: any) => user.role === 'Admin').length;
          const totalSuperAdmins = users.filter((user: any) => user.role === 'SuperAdmin').length;

          setRealStats({
            totalEmployees,
            totalAdmins,
            totalSuperAdmins
          });

          // Update stats with real employee count
          setStats(prevStats => ({
            ...prevStats,
            totalEmployees: totalEmployees
          }));
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();

    // Set other mock data
    setStats(prevStats => ({
      ...prevStats,
      onLeave: 8,
      newHires: 5,
      pendingRequests: 12
    }));

    setRecentActivities([
      {
        id: 1,
        user: "Sarah Johnson",
        action: "Leave request submitted",
        time: "2 hours ago",
        type: "leave",
      },
      {
        id: 2,
        user: "Mike Chen",
        action: "Profile updated",
        time: "4 hours ago",
        type: "profile",
      },
      {
        id: 3,
        user: "Lisa Wang",
        action: "Document uploaded",
        time: "6 hours ago",
        type: "document",
      },
      {
        id: 4,
        user: "David Kim",
        action: "Performance review completed",
        time: "1 day ago",
        type: "review",
      },
    ]);

    setUpcomingEvents([
      {
        id: 1,
        title: "Team Meeting",
        date: "2024-01-15",
        time: "10:00 AM",
        type: "meeting",
      },
      {
        id: 2,
        title: "Payroll Processing",
        date: "2024-01-20",
        type: "deadline",
      },
      {
        id: 3,
        title: "Training Session",
        date: "2024-01-18",
        time: "2:00 PM",
        type: "training",
      },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  const getStatCardColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
    ];
    return colors[index % colors.length];
  };

  const getActivityIcon = (type) => {
    const icons = {
      leave: <Clock className="h-4 w-4 text-blue-500" />,
      profile: <Users className="h-4 w-4 text-green-500" />,
      document: <FileText className="h-4 w-4 text-purple-500" />,
      review: <BarChart3 className="h-4 w-4 text-orange-500" />,
    };
    return icons[type] || <CheckCircle2 className="h-4 w-4 text-gray-500" />;
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "+2%",
    },
    {
      title: "Admins",
      value: realStats.totalAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "Super Admins",
      value: realStats.totalSuperAdmins,
      icon: <Users className="h-6 w-6 text-white" />,
      change: "",
    },
    {
      title: "On Leave Today",
      value: stats.onLeave,
      icon: <Calendar className="h-6 w-6 text-white" />,
      change: "-1",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    HRMS Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {userName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                New leave request
                              </p>
                              <p className="text-xs text-gray-500">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-500">{role}</p>
                    </div>
                    <div className="p-2">
                      <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r border-gray-200">
          <nav className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-3 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                  <div
                    key={card.title}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {card.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {card.value}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            card.change.startsWith("+")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {/* {card.change} from last month */}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-full ${getStatCardColor(
                          index
                        )}`}
                      >
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "employees" && <EmployeeTable />}

          {activeTab === "user" && <UserTable />}

          {activeTab === "department" && <DepartmentTable />}

          {activeTab === "holidays" && <HolidayTable />}

          {activeTab === "events" && <EventTable />}
        </main>
      </div>
    </div>
  );
}
