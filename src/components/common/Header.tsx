import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Bell,
  Settings,
  Sun,
  LogOut,
  ChevronDown,
  Search,
  Mail,
  Clock,
  X,
  Plus,
} from "lucide-react";
import socket from "../../utils/socket";
import { formatDate } from "../../Common/Commonfunction";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Header() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    description: '',
    startTime: '',
    breakDuration: 0,
    endTime: '',
    workingHours: '',
    totalHours: '',
  });
  const [reportLoading, setReportLoading] = useState(false);
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

  // Fetch punch status and break status on mount
  useEffect(() => {
    const fetchPunchStatus = async () => {
      if (userId) {
        try {
          const response = await fetch(
            `${
              (import.meta as any).env.VITE_API_URL || "http://localhost:5000"
            }/punches/status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setIsPunchedIn(data.isPunchedIn);
            if (data.isPunchedIn && data.punchTime) {
              setPunchInTime(new Date(data.punchTime.punchInTime));
            }
          }
        } catch (error) {
          console.error("Failed to fetch punch status:", error);
        }
      }
    };

    const fetchBreakStatus = async () => {
      if (userId) {
        try {
          const response = await fetch(
            `${
              (import.meta as any).env.VITE_API_URL || "http://localhost:5000"
            }/breaks/status`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setIsOnBreak(data.isOnBreak);
          }
        } catch (error) {
          console.error("Failed to fetch break status:", error);
        }
      }
    };

    fetchPunchStatus();
    fetchBreakStatus();
  }, [userId]);

  // Update elapsed time every second when punched in
   useEffect(() => {
     let interval: number;
     if (isPunchedIn && punchInTime) {
       interval = setInterval(() => {
         const now = new Date();
         const diff = now.getTime() - punchInTime.getTime();
         const hours = Math.floor(diff / (1000 * 60 * 60));
         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
         const seconds = Math.floor((diff % (1000 * 60)) / 1000);
         setElapsedTime(
           `${hours.toString().padStart(2, "0")}:${minutes
             .toString()
             .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
         );
       }, 1000);
     }
     return () => {
       if (interval) clearInterval(interval);
     };
   }, [isPunchedIn, punchInTime]);

  // Update report form data when modal opens
  useEffect(() => {
    if (showReportModal && punchInTime) {
      const now = new Date();
      const startTimeStr = punchInTime.toTimeString().slice(0, 5); // HH:MM format
      const endTimeStr = now.toTimeString().slice(0, 5); // HH:MM format

      // Fetch break duration
      const fetchBreakDuration = async () => {
        try {
          const response = await API.get('/breaks/duration');
          const breakDuration = response.data.totalBreakDuration || 0;

          // Calculate hours - handle overnight shifts
          const start = new Date(`1970-01-01T${startTimeStr}:00`);
          const end = new Date(`1970-01-01T${endTimeStr}:00`);
          let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

          // If negative, it means overnight (end time is next day)
          if (totalMinutes < 0) {
            totalMinutes = (24 * 60) + totalMinutes; // Add 24 hours
          }

          const totalHours = Math.floor(totalMinutes / 60);
          const totalMins = Math.floor(totalMinutes % 60);
          const totalHoursStr = `${totalHours.toString().padStart(2, '0')}:${totalMins.toString().padStart(2, '0')}`;

          const workingMinutes = Math.max(0, totalMinutes - breakDuration);
          const workingHours = Math.floor(workingMinutes / 60);
          const workingMins = Math.floor(workingMinutes % 60);
          const workingHoursStr = `${workingHours.toString().padStart(2, '0')}:${workingMins.toString().padStart(2, '0')}`;

          setReportFormData(prev => ({
            ...prev,
            startTime: startTimeStr,
            endTime: endTimeStr,
            breakDuration: breakDuration,
            totalHours: totalHoursStr,
            workingHours: workingHoursStr,
          }));
        } catch (error) {
          console.error('Error fetching break duration:', error);
          // Calculate without break duration - handle overnight shifts
          const start = new Date(`1970-01-01T${startTimeStr}:00`);
          const end = new Date(`1970-01-01T${endTimeStr}:00`);
          let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

          // If negative, it means overnight (end time is next day)
          if (totalMinutes < 0) {
            totalMinutes = (24 * 60) + totalMinutes; // Add 24 hours
          }

          const totalHours = Math.floor(totalMinutes / 60);
          const totalMins = Math.floor(totalMinutes % 60);
          const totalHoursStr = `${totalHours.toString().padStart(2, '0')}:${totalMins.toString().padStart(2, '0')}`;

          const workingMinutes = Math.max(0, totalMinutes);
          const workingHours = Math.floor(workingMinutes / 60);
          const workingMins = Math.floor(workingMinutes % 60);
          const workingHoursStr = `${workingHours.toString().padStart(2, '0')}:${workingMins.toString().padStart(2, '0')}`;

          setReportFormData(prev => ({
            ...prev,
            startTime: startTimeStr,
            endTime: endTimeStr,
            breakDuration: 0,
            totalHours: totalHoursStr,
            workingHours: workingHoursStr,
          }));
        }
      };

      fetchBreakDuration();
    }
  }, [showReportModal, punchInTime]);

  // Calculate hours when form data changes
  useEffect(() => {
    if (reportFormData.startTime && reportFormData.endTime) {
      const start = new Date(`1970-01-01T${reportFormData.startTime}:00`);
      const end = new Date(`1970-01-01T${reportFormData.endTime}:00`);
      let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

      // If negative, it means overnight (end time is next day)
      if (totalMinutes < 0) {
        totalMinutes = (24 * 60) + totalMinutes; // Add 24 hours
      }

      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = Math.floor(totalMinutes % 60);
      const totalHoursStr = `${totalHours.toString().padStart(2, '0')}:${totalMins.toString().padStart(2, '0')}`;

      const workingMinutes = Math.max(0, totalMinutes - reportFormData.breakDuration);
      const workingHours = Math.floor(workingMinutes / 60);
      const workingMins = Math.floor(workingMinutes % 60);
      const workingHoursStr = `${workingHours.toString().padStart(2, '0')}:${workingMins.toString().padStart(2, '0')}`;

      setReportFormData(prev => ({
        ...prev,
        totalHours: totalHoursStr,
        workingHours: workingHoursStr,
      }));
    }
  }, [reportFormData.startTime, reportFormData.endTime, reportFormData.breakDuration]);

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

      socket.on(`leave-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });

      socket.on(`leave-status-notification-${userId}`, (notification) => {
        setNotifications((prev) => {
          const newNotifications = [{ ...notification, read: false }, ...prev];
          localStorage.setItem(`notifications-${userId}`, JSON.stringify(newNotifications));
          return newNotifications;
        });
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for break events to update break status
      socket.on('newBreak', (newBreak) => {
        if (newBreak.employee._id === userId) {
          if (newBreak.action === 'Break In') {
            setIsOnBreak(true);
          } else if (newBreak.action === 'Break Out') {
            setIsOnBreak(false);
          }
        }
      });
    }

    return () => {
      socket.off(`todo-notification-${userId}`);
      socket.off(`ticket-notification-${userId}`);
      socket.off(`event-notification-${userId}`);
      socket.off(`holiday-notification-${userId}`);
      socket.off(`leave-notification-${userId}`);
      socket.off(`leave-status-notification-${userId}`);
      socket.off('newBreak');
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

  const handlePunch = async () => {
    if (isPunchedIn && isOnBreak) {
      toast.error("Need to Break Out first.");
      return;
    }

    if (isPunchedIn) {
      // Show report modal for punch out
      setShowReportModal(true);
      return;
    }

    try {
      const endpoint = "/punches/in";
      const response = await fetch(
        `${
          (import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsPunchedIn(true);
        setPunchInTime(new Date(data.punchTime.punchInTime));
      } else {
        // Handle error messages from backend
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to punch");
        console.error("Failed to punch:", response.status, errorData);
      }
    } catch (error) {
      console.error("Failed to punch:", error);
      toast.error("An error occurred while punching");
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDescription = reportFormData.description.replace(/<[^>]*>/g, '').trim();
    if (!cleanDescription) {
      toast.error('Please fill in the report description');
      return;
    }

    setReportLoading(true);
    try {
      // Submit report
      await API.post('/reports', {
        description: reportFormData.description,
        startTime: reportFormData.startTime,
        breakDuration: reportFormData.breakDuration,
        endTime: reportFormData.endTime,
        workingHours: reportFormData.workingHours,
        totalHours: reportFormData.totalHours,
      });

      // Then punch out
      const response = await fetch(
        `${
          (import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }/punches/out`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setIsPunchedIn(false);
        setPunchInTime(null);
        setElapsedTime("00:00:00");
        setShowReportModal(false);
        setReportFormData({
          description: '',
          startTime: '',
          breakDuration: 0,
          endTime: '',
          workingHours: '',
          totalHours: '',
        });
        toast.success('Punch out and report submitted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to punch out");
      }
    } catch (error: any) {
      console.error("Failed to submit report or punch out:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while submitting report");
      }
    } finally {
      setReportLoading(false);
    }
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
                <p className="text-sm text-gray-500">
                  Welcome back, {userName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Punch Button - Only for Employees */}
            {role === "Employee" && (
              <button
                onClick={handlePunch}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPunchedIn
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Clock className="h-5 w-5" />
                <span>
                  {isPunchedIn ? `Punch Out (${elapsedTime})` : "Punch In"}
                </span>
              </button>
            )}

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
                  {/* <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      Add more here
                      <p></p>
                    </div>
                  </div> */}
                  <div className="p-2">
                    <button
                      onClick={() => navigate(`/employees/view/${userId}`)}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                     <button
                      onClick={() => navigate('/saturday-setting')}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Sun className="h-4 w-4" />
                      <span>Saturday Setting</span>
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

      {/* Daily Report Modal for Punch Out */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Daily Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Description *
                </label>
                <div className="border border-gray-300 rounded-lg">
                  <CKEditor
                    editor={ClassicEditor}
                    data={reportFormData.description}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setReportFormData(prev => ({ ...prev, description: data }));
                    }}
                    config={{
                      toolbar: [
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'numberedList', 'bulletedList', '|',
                        'link', 'blockQuote', '|',
                        'undo', 'redo'
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={reportFormData.startTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Your punch-in time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={reportFormData.breakDuration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from today's breaks</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={reportFormData.endTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Current time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Working Hours
                  </label>
                  <input
                    type="text"
                    value={reportFormData.workingHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">End Time - Start Time - Break Duration</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Today's Total Hours
                  </label>
                  <input
                    type="text"
                    value={reportFormData.totalHours}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">End Time - Start Time</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading || !reportFormData.description.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportLoading ? 'Submitting...' : 'Submit & Punch Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
