import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./RightSidebar";
import Header from "./Header";
import Toaster from "./Toaster";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function Layout() {
  usePushNotifications();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 pb-16 md:pb-0">
        <Header />
        <main className="p-4">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
