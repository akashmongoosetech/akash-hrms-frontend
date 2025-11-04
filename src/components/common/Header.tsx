import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Mail,
} from "lucide-react";
import socket from "../../utils/socket";
import { formatDate } from "../../Common/Commonfunction";

export default function Header() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem("userId");

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (userId) {
      const savedNotifications = localStorage.getItem(`notifications-${userId}`);
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        const unread = parsedNotifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    }
  }, [userId]);

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

    // Socket.io listener for real-time notifications
    if (userId) {
      socket.on(`todo-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });

      socket.on(`ticket-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });

      socket.on(`event-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });

      socket.on(`holiday-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      socket.off(`todo-notification-${userId}`);
      socket.off(`ticket-notification-${userId}`);
      socket.off(`event-notification-${userId}`);
      socket.off(`holiday-notification-${userId}`);
    };
  }, [userId, navigate]);

  // Get user info from API response or fallback to localStorage
  const role = userData?.role || localStorage.getItem("role") || "Employee";
  const userName = userData
    ? `${userData.firstName} ${userData.lastName}`
    : localStorage.getItem("userName") || "User";
  const baseUrl = ((import.meta as any).env.VITE_API_URL || "http://localhost:5000").replace('', '');
  const userPhoto = userData?.photo
    ? `${baseUrl}/uploads/${
        userData.photo.split(/[/\\]/).pop()
      }`
    : null;

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

  return (
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
            {/* <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div> */}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
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
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            // Mark this notification as read
                            if (!notification.read) {
                              setNotifications((prev) => {
                                const updatedNotifications = prev.map((n, i) =>
                                  i === index ? { ...n, read: true } : n
                                );
                                localStorage.setItem(`notifications-${userId}`, JSON.stringify(updatedNotifications));
                                return updatedNotifications;
                              });
                              setUnreadCount((prev) => Math.max(0, prev - 1));
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                Just now
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
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
                    <div className="flex items-center space-x-3">
                      {/* {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{userName}</p>
                        <p className="text-sm text-gray-500">{role}</p>
                      </div> */}
                      <p></p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate(`/employees/view/${userId}`)}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Profile</span>
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
  );
}
