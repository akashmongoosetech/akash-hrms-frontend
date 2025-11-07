import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./RightSidebar";
import Header from "./Header";
import Toaster from "./Toaster";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function Layout() {
  // Initialize push notifications
  usePushNotifications();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Left Sidebar */}
      <div className="fixed left-0 top-0 h-full z-10">
        <LeftSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <Header />
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}