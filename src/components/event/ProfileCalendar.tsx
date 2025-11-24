import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Edit, Trash2, Cake, Calendar, Clock } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import ViewReportModal from '../Reports/ViewReportModal';
import { formatDate, sortEmployeesAlphabetically } from '../../Common/Commonfunction';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface Event {
  _id: string;
  name: string;
  date: string;
  createdAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string;
  role: string;
}

interface BirthdayEvent {
  _id: string;
  name: string;
  date: string;
  type: 'birthday';
  user: User;
}

interface HolidayEvent {
  _id: string;
  name: string;
  date: string;
  type: 'holiday';
}

interface Report {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  description: string;
  startTime: string;
  breakDuration: number;
  endTime: string;
  workingHours: string;
  totalHours: string;
  date: string;
  note: string;
  createdAt: string;
}

interface Leave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Vacation' | 'Personal';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  rejectedBy?: {
    firstName: string;
    lastName: string;
  };
  comments?: string;
  daysRequested: number;
  createdAt: string;
}

interface ReportEvent {
  _id: string;
  name: string;
  date: string;
  type: 'report';
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  workingHours: string;
}

interface LeaveEvent {
  _id: string;
  name: string;
  date: string;
  type: 'leave';
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  leaveType: string;
  status: string;
}

interface SaturdayEvent {
  _id: string;
  name: string;
  date: string;
  type: 'saturday';
  isWeekend: boolean;
}


interface ProfileCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  onDeleteConfirm?: (eventId: string) => Promise<void>;
  userRole?: string;
}

export default function ProfileCalendar({ events, onEventClick, onEditEvent, onDeleteEvent, onDeleteConfirm, userRole }: ProfileCalendarProps) {
   const [selectedEvent, setSelectedEvent] = useState<Event | BirthdayEvent | HolidayEvent | ReportEvent | LeaveEvent | SaturdayEvent | null>(null);
   const [users, setUsers] = useState<User[]>([]);
   const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
   const [reports, setReports] = useState<Report[]>([]);
   const [leaves, setLeaves] = useState<Leave[]>([]);
   const [saturdays, setSaturdays] = useState<SaturdayEvent[]>([]);
   const [loading, setLoading] = useState(true);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
   const [selectedFilter, setSelectedFilter] = useState<string>('Reports');
   const [currentUserId, setCurrentUserId] = useState<string>('');
   const [showReportModal, setShowReportModal] = useState(false);
   const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
      fetchUsers();
      fetchHolidays();
      fetchCurrentUser();
      fetchSaturdays();
    }, []);

  useEffect(() => {
    if (selectedFilter === 'Reports' || (selectedFilter !== 'All Events' && selectedFilter !== 'Reports')) {
      fetchReports();
      fetchLeaves();
    }
  }, [selectedFilter, userRole]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const usersData = data.users;
        setUsers(usersData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users, status:', response.status, 'error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/holidays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const holidaysData = await response.json();

        // Transform holidays to HolidayEvent format
        const holidayEvents: HolidayEvent[] = holidaysData.holidays.map((holiday: any) => ({
          _id: holiday._id,
          name: holiday.name,
          date: holiday.date.split('T')[0], // Ensure YYYY-MM-DD format
          type: 'holiday' as const,
        }));

        setHolidays(holidayEvents);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch holidays, status:', response.status, 'error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        console.error('Failed to fetch reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    }
  };

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
      } else {
        console.error('Failed to fetch leaves');
        setLeaves([]);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLeaves([]);
    }
  };

  const fetchSaturdays = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/saturdays/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const saturdayEvents: SaturdayEvent[] = data.map((saturday: any) => {
          // Normalize date to UTC to avoid timezone issues
          const date = new Date(saturday.date);
          const formattedDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD in UTC
          return {
            _id: saturday._id,
            name: saturday.isWeekend ? '' : 'Working Saturday',
            date: formattedDate,
            type: 'saturday' as const,
            isWeekend: saturday.isWeekend,
          };
        });
        setSaturdays(saturdayEvents);
      } else {
        console.error('Failed to fetch saturdays, status:', response.status);
        setSaturdays([]);
      }
    } catch (error) {
      console.error('Error fetching saturdays:', error);
      setSaturdays([]);
    }
  };

  // Helper to format YYYY-MM-DD without timezone issues
  const formatYMD = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Generate birthday events for current year (memoized)
  const birthdayEvents: BirthdayEvent[] = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const list: BirthdayEvent[] = users
      .filter(u => !!u.dob && ['employee', 'admin', 'superadmin'].includes(u.role.toLowerCase()))
      .map((user) => {
        // Try to parse DOB robustly; fall back to splitting string
        let dob = new Date(user.dob);
        if (isNaN(dob.getTime())) {
          // Expected format: YYYY-MM-DD
          const parts = user.dob.split(/[-/]/).map(Number);
          if (parts.length >= 3) {
            dob = new Date(parts[0], parts[1] - 1, parts[2]);
          }
        }
        const month = dob.getMonth();
        const day = dob.getDate();
        const date = formatYMD(currentYear, month, day);

        return {
          _id: `birthday-${user._id}-${currentYear}`,
          name: `${user.firstName} ${user.lastName}'s Birthday`,
          date,
          type: 'birthday' as const,
          user,
        };
      })
      .filter(e => !!e.date);

    return list;
  }, [users]);

  // Generate report events (memoized)
  const reportEvents: ReportEvent[] = useMemo(() => {
    if (selectedFilter === 'Reports' && currentUserId) {
      // Employee selecting "Reports" - show current user's reports
      return reports
        .filter(report => report.employee._id === currentUserId)
        .map(report => ({
          _id: `report-${report._id}`,
          name: `${report.employee.firstName} ${report.employee.lastName}`,
          date: report.date,
          type: 'report' as const,
          user: report.employee,
          workingHours: report.workingHours,
        }));
    } else if (selectedFilter !== 'All Events' && selectedFilter !== 'Reports') {
      // Admin/SuperAdmin selecting specific employee - show that employee's reports
      const employeeId = selectedFilter.split(' - ')[1]; // Assuming format "Name - ID"
      return reports
        .filter(report => report.employee._id === employeeId)
        .map(report => ({
          _id: `report-${report._id}`,
          name: `${report.employee.firstName} ${report.employee.lastName}`,
          date: report.date,
          type: 'report' as const,
          user: report.employee,
          workingHours: report.workingHours,
        }));
    }
    // For "All Events", don't show any reports
    return [];
  }, [reports, selectedFilter, userRole, currentUserId]);

  // Generate leave events (memoized)
  const leaveEvents: LeaveEvent[] = useMemo(() => {
    const generateLeaveEventsForPeriod = (leave: Leave, isCurrentUser: boolean) => {
      const events: LeaveEvent[] = [];
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      // Generate an event for each day in the leave period
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        events.push({
          _id: `leave-${leave._id}-${dateString}`,
          name: isCurrentUser
            ? `My ${leave.leaveType} Leave`
            : `${leave.leaveType}`,
          date: dateString,
          type: 'leave' as const,
          employee: leave.employee,
          leaveType: leave.leaveType,
          status: leave.status,
        });
      }
      return events;
    };

    if (selectedFilter === 'Reports' && currentUserId) {
      // Employee selecting "Reports" - show current user's leaves for all days
      const userLeaves = leaves.filter(leave => leave.employee._id === currentUserId);
      return userLeaves.flatMap(leave => generateLeaveEventsForPeriod(leave, true));
    } else if (selectedFilter !== 'All Events' && selectedFilter !== 'Reports') {
      // Admin/SuperAdmin selecting specific employee - show that employee's leaves for all days
      const employeeId = selectedFilter.split(' - ')[1];
      const employeeLeaves = leaves.filter(leave => leave.employee._id === employeeId);
      return employeeLeaves.flatMap(leave => generateLeaveEventsForPeriod(leave, false));
    }
    // For "All Events", don't show any leaves
    return [];
  }, [leaves, selectedFilter, userRole, currentUserId]);


  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'All Events') {
      return [...events, ...birthdayEvents, ...holidays, ...saturdays];
    } else {
      // For "Reports" or specific employee selection
      return [...reportEvents, ...leaveEvents, ...holidays, ...saturdays];
    }
  }, [events, birthdayEvents, holidays, reportEvents, leaveEvents, saturdays, selectedFilter]);

  const allEvents = useMemo(() => [...events, ...birthdayEvents, ...holidays, ...reportEvents, ...leaveEvents, ...saturdays], [events, birthdayEvents, holidays, reportEvents, leaveEvents, saturdays]);

  // Helper function to get color based on working hours
  const getReportColor = (workingHours: string) => {
    const hours = parseFloat(workingHours.split(' ')[0]);
    if (hours >= 8) return 'rgba(16, 185, 129, 1)'; // green
    if (hours >= 4) return 'rgba(59, 130, 246, 1)'; // blue
    return 'rgba(239, 68, 68, 1)'; // red
  };

// In your calendarEvents mapping:
const calendarEvents: any[] = filteredEvents.map(event => ({
  id: event._id,
  title:
    'type' in event && event.type === 'report'
      ? event.workingHours
      : event.name.replace(/\d{1,2}:\d{2}/g, '').trim(),

  start: event.date,
  allDay: true,

  display:
    ('type' in event &&
    (event.type === 'holiday' ||
      event.type === 'leave' ||
      event.type === 'saturday' ||
      event.type === 'birthday' ||
      event.type === 'event' ||
      event.type === 'report')) ||
    !('type' in event)
      ? 'background'
      : 'auto',

  backgroundColor:
    'type' in event && event.type === 'birthday'
      ? 'rgba(59, 130, 246, 1)'
      : 'type' in event && event.type === 'holiday'
      ? '#EF4444'
      : 'type' in event && event.type === 'report'
      ? getReportColor(event.workingHours)
      : 'type' in event && event.type === 'leave'
      ? '#EF4444'
      : 'type' in event && event.type === 'saturday'
      ? '#FAE4B7'
      : (event as any).backgroundColor || 'rgba(16, 185, 129, 1)',

  textColor:
    'type' in event && event.type === 'saturday'
      ? '#000000'
      : '#FFFFFF',

  extendedProps: { originalEvent: event },
}));

  const handleEventClick = (info: any) => {
    const originalEvent = info.event.extendedProps.originalEvent;
    if ('type' in originalEvent && originalEvent.type === 'report') {
      // Handle report click - open report modal
      const reportId = originalEvent._id.replace('report-', '');
      const report = reports.find(r => r._id === reportId);
      if (report) {
        setSelectedReport(report);
        setShowReportModal(true);
      }
    } else {
      setSelectedEvent(originalEvent);
      // Only call onEventClick for regular events, not birthdays, holidays, reports, leaves, or saturdays
      if (onEventClick && !('type' in originalEvent)) {
        onEventClick(originalEvent);
      }
    }
  };



  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Events List Sidebar */}
      {/* Calendar */}
      <div className="lg:w-full lg-h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventDisplay="block"
          dayMaxEvents={true}
          moreLinkClick="popover"
          dayCellDidMount={(info) => {
            // Highlight Sundays with yellow background and black text
            if (info.date.getDay() === 0) {
              info.el.style.backgroundColor = '#FAE4B7';
              info.el.style.color = '#000000';
            }
          }}
        />
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (onDeleteConfirm && deleteEventId) {
            try {
              await onDeleteConfirm(deleteEventId);
              setShowDeleteModal(false);
              setDeleteEventId(null);
              // Refresh data after deletion
              fetchUsers();
              fetchHolidays();
              if (selectedFilter === 'Reports' || (selectedFilter !== 'All Events' && selectedFilter !== 'Reports')) {
                fetchReports();
                fetchLeaves();
              }
            } catch (error) {
              console.error('Error deleting event:', error);
              // Refresh data even on error to ensure consistency
              fetchUsers();
              fetchHolidays();
              if (selectedFilter === 'Reports' || (selectedFilter !== 'All Events' && selectedFilter !== 'Reports')) {
                fetchReports();
                fetchLeaves();
              }
              throw error; // Re-throw to let DeleteModal show error message
            }
          }
        }}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />

      <ViewReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        report={selectedReport}
        role={userRole}
      />
    </div>
  );
}

