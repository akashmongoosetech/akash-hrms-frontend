import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './components/user/UserManagement';
import ProfileManagement from './components/user/ProfileManagement';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import EmployeesPage from './pages/employee/EmployeesPage';
import EmployeeAddPage from './pages/employee/EmployeeAddPage';
import EmployeeEditPage from './pages/employee/EmployeeEditPage';
import EmployeeViewPage from './pages/employee/EmployeeViewPage';
import DepartmentPage from './pages/department/DepartmentPage';
import HolidaysPage from './pages/holiday/HolidaysPage';
import EventsPage from './pages/event/EventsPage';
import ClientPage from './pages/client/ClientPage';
import ProjectPage from './pages/project/ProjectPage';
import StatisticsPage from './pages/common/StatisticsPage';
import ActivitiesPage from './pages/common/ActivitiesPage';
import ReportsPage from './pages/common/ReportsPage';
import GalleryPage from './pages/common/GalleryPage';
import TodoPage from './pages/common/TodoPage';
import LinkPage from './pages/common/LinkPage';
import TicketPage from './pages/ticket/TicketPage';
import TicketAddPage from './pages/ticket/TicketAddPage';
import TicketEditPage from './pages/ticket/TicketEditPage';
import TicketViewPage from './pages/ticket/TicketViewPage';
import AttendancePage from './pages/common/AttendancePage';
import LeavePage from './pages/common/LeavePage';
import PayrollPage from './pages/common/PayrollPage';
import RecruitmentPage from './pages/common/RecruitmentPage';
import PunchTime from './components/Punch/PunchTime';
import SaturdaySetting from './components/SaturdaySetting/SaturdaySetting';
import TeamTable from './components/common/TeamTable';
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
          <Route path="/employees" element={
            <ProtectedRoute requiredRole="Admin">
              <EmployeesPage/>
            </ProtectedRoute>
          } />
          <Route path="/employees/add" element={
            <ProtectedRoute requiredRole="Admin">
              <EmployeeAddPage/>
            </ProtectedRoute>
          } />
          <Route path="/employees/edit/:id" element={
            // <ProtectedRoute requiredRole="Admin">
              <EmployeeEditPage/>
            // </ProtectedRoute>
          } />
          <Route path="/employees/view/:id" element={
            // <ProtectedRoute requiredRole="Admin">
              <EmployeeViewPage/>
            // </ProtectedRoute>
          } />
          <Route path="/department" element={
            <ProtectedRoute requiredRole="Admin">
              <DepartmentPage/>
            </ProtectedRoute>
          } />
          <Route path="/holidays" element={<HolidaysPage/>} />
          <Route path="/events" element={<EventsPage/>} />
          <Route path="/client" element={<ClientPage/>} />
          <Route path="/project" element={<ProjectPage/>} />
          <Route path="/statistics" element={
            <ProtectedRoute requiredRole="Admin">
              <StatisticsPage/>
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute requiredRole="Employee">
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
            // <ProtectedRoute requiredRole="Admin">
              <TodoPage/>
            // </ProtectedRoute>
          } />
          <Route path="/link" element={
            <ProtectedRoute requiredRole="Admin">
              <LinkPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute requiredRole="Employee">
              <TicketPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/add" element={
            <ProtectedRoute requiredRole="Admin">
              <TicketAddPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/edit/:id" element={
            <ProtectedRoute requiredRole="Employee">
              <TicketEditPage/>
            </ProtectedRoute>
          } />
          <Route path="/tickets/view/:id" element={
            <ProtectedRoute requiredRole="Employee">
              <TicketViewPage/>
            </ProtectedRoute>
          } />
          <Route path="/saturday-setting" element={
            <ProtectedRoute requiredRole="Admin">
              <SaturdaySetting/>
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute requiredRole="Admin">
              <TeamTable />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={<AttendancePage/>} />
          <Route path="/leave" element={<LeavePage/>} />
          <Route path="/payroll" element={<PayrollPage/>} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/punchtime" element={<PunchTime/>} />
          <Route path="/alternate-saturday" element={
            <ProtectedRoute requiredRole="Admin">
              <SaturdaySetting/>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<AppRoutes />);
