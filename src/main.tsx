import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ProfileManagement from './components/ProfileManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentPage from './pages/DepartmentPage';
import HolidaysPage from './pages/HolidaysPage';
import EventsPage from './pages/EventsPage';
import ClientPage from './pages/ClientPage';
import ProjectPage from './pages/ProjectPage';
import StatisticsPage from './pages/StatisticsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ReportsPage from './pages/ReportsPage';
import GalleryPage from './pages/GalleryPage';
import TodoPage from './pages/TodoPage';
import LinkPage from './pages/LinkPage';
import TicketPage from './pages/TicketPage';
import TicketAddPage from './pages/TicketAddPage';
import TicketEditPage from './pages/TicketEditPage';
import TicketViewPage from './pages/TicketViewPage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import RecruitmentPage from './pages/RecruitmentPage';
import './index.css';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<LoginPage/>} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/users" element={
            <ProtectedRoute requiredRole="Admin">
              <UserManagement/>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProfileManagement/>} />
          <Route path="/employees" element={<EmployeesPage/>} />
          <Route path="/department" element={
            <ProtectedRoute requiredRole="Admin">
              <DepartmentPage/>
            </ProtectedRoute>
          } />
          <Route path="/holidays" element={<HolidaysPage/>} />
          <Route path="/events" element={
            <ProtectedRoute requiredRole="Admin">
              <EventsPage/>
            </ProtectedRoute>
          } />
          <Route path="/client" element={<ClientPage/>} />
          <Route path="/project" element={<ProjectPage/>} />
          <Route path="/statistics" element={
            <ProtectedRoute requiredRole="Admin">
              <StatisticsPage/>
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute requiredRole="Admin">
              <ActivitiesPage/>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={<ReportsPage/>} />
          <Route path="/gallery" element={
            <ProtectedRoute requiredRole="Admin">
              <GalleryPage/>
            </ProtectedRoute>
          } />
          <Route path="/todo" element={
            <ProtectedRoute requiredRole="Admin">
              <TodoPage/>
            </ProtectedRoute>
          } />
          <Route path="/link" element={
            <ProtectedRoute requiredRole="Admin">
              <LinkPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute requiredRole="Admin">
              <TicketPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/add" element={
            <ProtectedRoute requiredRole="Admin">
              <TicketAddPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/edit/:id" element={
            <ProtectedRoute requiredRole="Admin">
              <TicketEditPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/view/:id" element={
            <ProtectedRoute requiredRole="Admin">
              <TicketViewPage/>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={<AttendancePage/>} />
          <Route path="/leave" element={<LeavePage/>} />
          <Route path="/payroll" element={<PayrollPage/>} />
          <Route path="/recruitment" element={<RecruitmentPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<AppRoutes />);
