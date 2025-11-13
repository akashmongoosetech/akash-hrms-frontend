import React, { createContext, useContext, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "./RightSidebar";
import Header from "./Header";
import Toaster from "./Toaster";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import socket from "../../utils/socket";

interface DashboardPreferences {
  projects: boolean;
  teams: boolean;
  todos: boolean;
  tickets: boolean;
}

interface LayoutContextType {
  dashboardPreferences: DashboardPreferences;
  updateDashboardPreferences: (preferences: DashboardPreferences) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export default function Layout() {
  usePushNotifications();
  const navigate = useNavigate();

  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>({
    projects: true,
    teams: true,
    todos: true,
    tickets: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      setDashboardPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Socket listener for logout
  useEffect(() => {
    socket.on('logout', (data) => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      // Show message before redirect
      alert('Your session has expired or your account has been removed by the Super Admin. Please contact your administrator.');
      navigate('/login');
    });

    return () => {
      socket.off('logout');
    };
  }, [navigate]);

  const updateDashboardPreferences = (preferences: DashboardPreferences) => {
    setDashboardPreferences(preferences);
    localStorage.setItem('dashboardPreferences', JSON.stringify(preferences));
  };

  return (
    <LayoutContext.Provider value={{ dashboardPreferences, updateDashboardPreferences }}>
      <div className=" min-h-screen bg-gray-50">
        {/* Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 pb-16 md:pb-0">
          <Header />
          <main className="w-full">
            <Outlet />
          </main>
        </div>

        <Toaster />
      </div>
    </LayoutContext.Provider>
  );
}
