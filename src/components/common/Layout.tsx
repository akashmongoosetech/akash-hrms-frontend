import React, { createContext, useContext, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LeftSidebar from "./RightSidebar";
import Header from "./Header";
import Toaster from "./Toaster";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import socket, { connectSocket, disconnectSocket } from "../../utils/socket";
import { SidebarProvider, useSidebar } from "../ui/sidebar";

interface DashboardPreferences {
  projects: boolean;
  teams: boolean;
  todos: boolean;
  tickets: boolean;
  leaves: boolean;
  activities: boolean;
  performance: boolean;
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
  const location = useLocation();

  const [dashboardPreferences, setDashboardPreferences] = useState<DashboardPreferences>({
    projects: true,
    teams: true,
    todos: true,
    tickets: true,
    leaves: true,
    activities: true,
    performance: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        const validatedPreferences: DashboardPreferences = {
          projects: typeof parsed.projects === 'boolean' ? parsed.projects : true,
          teams: typeof parsed.teams === 'boolean' ? parsed.teams : true,
          todos: typeof parsed.todos === 'boolean' ? parsed.todos : true,
          tickets: typeof parsed.tickets === 'boolean' ? parsed.tickets : true,
          leaves: typeof parsed.leaves === 'boolean' ? parsed.leaves : true,
          activities: typeof parsed.activities === 'boolean' ? parsed.activities : true,
          performance: typeof parsed.performance === 'boolean' ? parsed.performance : true,
        };
        setDashboardPreferences(validatedPreferences);
      } catch (error) {
        // If parsing fails, keep defaults
      }
    }
  }, []);

  // Open the authenticated socket connection once the layout (i.e. a logged-in
  // session) is mounted. Without this, real-time events never arrive after a
  // page refresh because the connection is no longer opened automatically.
  useEffect(() => {
    connectSocket();
  }, []);

  // Report the current application section to the server so chat notifications
  // can be suppressed only while the recipient is actively viewing the exact
  // conversation. The Chat page reports its own (more specific) presence.
  //
  // The heartbeat deliberately does NOT include a section/conversation. That
  // lets the Chat page own the conversation id while this global timer only
  // keeps the session alive and reports tab visibility.
  useEffect(() => {
    const section = location.pathname.split('/')[1] || 'dashboard';
    const isChatSection = section === 'chat';

    const reportSection = () => {
      if (isChatSection) return;
      socket.emit('user:section:update', {
        section,
        conversationId: null,
        visible: document.visibilityState === 'visible',
      });
    };

    const sendHeartbeat = () => {
      if (!socket.connected) return;
      socket.emit('user:heartbeat', {
        visible: document.visibilityState === 'visible',
      });
    };

    reportSection();
    sendHeartbeat();
    socket.on('connect', reportSection);
    socket.on('connect', sendHeartbeat);
    document.addEventListener('visibilitychange', reportSection);
    document.addEventListener('visibilitychange', sendHeartbeat);

    const interval = window.setInterval(sendHeartbeat, 25 * 1000);

    return () => {
      socket.off('connect', reportSection);
      socket.off('connect', sendHeartbeat);
      document.removeEventListener('visibilitychange', reportSection);
      document.removeEventListener('visibilitychange', sendHeartbeat);
      window.clearInterval(interval);
    };
  }, [location.pathname]);

  // Socket listener for logout
  useEffect(() => {
    socket.on('logout', (data) => {
      socket.emit('user:presence:offline');
      disconnectSocket();
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
      <SidebarProvider
        style={
          {
            '--sidebar-width': '16rem',
            '--sidebar-width-mobile': '18rem',
          } as React.CSSProperties
        }
      >
        <LeftSidebar />

        <AppContent>
          <Outlet />
        </AppContent>

        <Toaster />
      </SidebarProvider>
    </LayoutContext.Provider>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-svh min-w-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header onToggleSidebar={toggleSidebar} />
      <main className="w-full flex-1">{children}</main>
    </div>
  );
}
