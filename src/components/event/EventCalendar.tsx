import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Edit, Trash2, Cake, Calendar, Clock } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';
import toast from 'react-hot-toast';

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
  };
  description: string;
  startTime: string;
  breakDuration: number;
  endTime: string;
  workingHours: string;
  totalHours: string;
  date: string;
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

interface EventCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  onDeleteConfirm?: (eventId: string) => Promise<void>;
  userRole?: string;
}

export default function EventCalendar({ events, onEventClick, onEditEvent, onDeleteEvent, onDeleteConfirm, userRole }: EventCalendarProps) {
   const [selectedEvent, setSelectedEvent] = useState<Event | BirthdayEvent | HolidayEvent | ReportEvent | LeaveEvent | SaturdayEvent | null>(null);
   const [users, setUsers] = useState<User[]>([]);
   const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
   const [reports, setReports] = useState<Report[]>([]);
   const [leaves, setLeaves] = useState<Leave[]>([]);
   const [saturdays, setSaturdays] = useState<SaturdayEvent[]>([]);
   const [loading, setLoading] = useState(true);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
   const [selectedFilter, setSelectedFilter] = useState<string>('All Events');
   const [currentUserId, setCurrentUserId] = useState<string>('');

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
      console.log('Current token:', token ? 'present' : 'missing');
      console.log('Current role:', role);

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      // console.log('Response headers:', response.headers);

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
        const holidayEvents: HolidayEvent[] = holidaysData.map((holiday: any) => ({
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
          // Parse date without timezone conversion - keep it as local date
          const dateStr = saturday.date.split('T')[0]; // Get YYYY-MM-DD part
          const date = new Date(dateStr + 'T00:00:00'); // Create date at midnight local time
          const formattedDate = dateStr; // Keep as YYYY-MM-DD string
          return {
            _id: saturday._id,
            name: saturday.isWeekend ? 'Weekend Saturday' : 'Working Saturday',
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

  const allEvents = [...events, ...birthdayEvents, ...holidays, ...reportEvents, ...leaveEvents, ...saturdays];

  // Helper function to get color based on working hours
  const getReportColor = (workingHours: string) => {
    const hours = parseFloat(workingHours.split(' ')[0]);
    if (hours >= 8) return '#10B981'; // green
    if (hours >= 4) return '#3B82F6'; // blue
    return '#EF4444'; // red
  };

  // Prepare events for FullCalendar
  const calendarEvents: any[] = allEvents.map(event => ({
    id: event._id,
    title: 'type' in event && event.type === 'report' ? event.workingHours : event.name,
    date: event.date,
    color: 'type' in event && event.type === 'birthday' ? '#3B82F6' :
           ('type' in event && event.type === 'holiday' ? '#EF4444' :
            'type' in event && event.type === 'report' ? getReportColor(event.workingHours) :
            'type' in event && event.type === 'leave' ? '#EF4444' :
            'type' in event && event.type === 'saturday' ? (event.isWeekend ? '#8B5CF6' : '#10B981') : '#10B981'),
    extendedProps: {
      originalEvent: event
    }
  }));

  const handleEventClick = (info: any) => {
    const originalEvent = info.event.extendedProps.originalEvent;
    setSelectedEvent(originalEvent);
    // Only call onEventClick for regular events, not birthdays, holidays, reports, leaves, or saturdays
    if (onEventClick && !('type' in originalEvent)) {
      onEventClick(originalEvent);
    }
  };

  const handleListEventClick = (event: Event | BirthdayEvent | HolidayEvent | ReportEvent | LeaveEvent | SaturdayEvent) => {
    setSelectedEvent(event);
    // Only call onEventClick for regular events, not birthdays, holidays, reports, leaves, or saturdays
    if (onEventClick && !('type' in event)) {
      onEventClick(event as Event);
    }
  };

  // Sort events by date (most recent first)
  const sortedEvents = [...allEvents]
    .sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  // Check if user can manage events (Admin or SuperAdmin)
  const canManageEvents = userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin');


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Events List Sidebar */}
      <div className="lg:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {/* {selectedFilter} */} Events
            {/* ({allEvents.length}) */}
          </h2>
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All Events">All Events</option>
              {userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin') ? (
                <>
                  {users.map(user => (
                    <option key={user._id} value={`${user.firstName} ${user.lastName} - ${user._id}`}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </>
              ) : (
                <option value="Reports">Reports</option>
              )}
            </select>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sortedEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No events scheduled</p>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event._id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedEvent?._id === event._id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 ' + (
                      'type' in event && event.type === 'birthday'
                        ? 'hover:border-blue-300 hover:bg-gray-50'
                        : 'type' in event && event.type === 'holiday'
                        ? 'hover:border-red-300 hover:bg-gray-50'
                        : 'type' in event && event.type === 'report'
                        ? 'hover:border-purple-300 hover:bg-gray-50'
                        : 'type' in event && event.type === 'leave'
                        ? 'hover:border-red-300 hover:bg-gray-50'
                        : 'type' in event && event.type === 'saturday'
                        ? 'hover:border-purple-300 hover:bg-gray-50'
                        : 'hover:border-green-300 hover:bg-gray-50'
                    )
                } ${
                  'type' in event && event.type === 'birthday'
                    ? 'border-l-[8px] border-l-blue-500'
                    : 'type' in event && event.type === 'holiday'
                    ? 'border-l-[8px] border-l-red-500'
                    : 'type' in event && event.type === 'report'
                    ? 'border-l-[8px] border-l-purple-500'
                    : 'type' in event && event.type === 'leave'
                    ? 'border-l-[8px] border-l-red-500'
                    : 'type' in event && event.type === 'saturday'
                    ? 'border-l-[8px] border-l-purple-500'
                    : 'border-l-[8px] border-l-green-500'
                }`}
                onClick={() => handleListEventClick(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium line-clamp-2 pr-2 ${
                    'type' in event && event.type === 'birthday'
                      ? 'text-blue-600'
                      : 'type' in event && event.type === 'holiday'
                      ? 'text-red-600'
                      : 'type' in event && event.type === 'report'
                      ? 'text-purple-600'
                      : 'type' in event && event.type === 'leave'
                      ? 'text-red-600'
                      : 'type' in event && event.type === 'saturday'
                      ? 'text-purple-600'
                      : 'text-green-600'
                  }`}>
                    {event.name}
                  </h3>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {canManageEvents && !('type' in event) && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditEvent) onEditEvent(event as Event);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit event"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteEventId(event._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span className={`w-3 h-3 rounded-full ${
                      'type' in event && event.type === 'birthday' ? 'bg-blue-500' :
                      ('type' in event && event.type === 'holiday' ? 'bg-red-500' :
                       'type' in event && event.type === 'report' ? 'bg-purple-500' :
                       'type' in event && event.type === 'leave' ? 'bg-red-500' :
                       'type' in event && event.type === 'saturday' ? 'bg-purple-500' : 'bg-green-500')
                    }`}></span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date)}
                </p>
                {'type' in event && event.type === 'birthday' ? (
                  <div className="flex items-center mt-1">
                    <Cake className="h-3 w-3 text-blue-600 mr-1" />
                    <p className="text-xs text-blue-600">
                      Birthday - {event.user.role}
                    </p>
                  </div>
                ) : 'type' in event && event.type === 'holiday' ? (
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 text-red-600 mr-1" />
                    <p className="text-xs text-red-600">
                      Holiday
                    </p>
                  </div>
                ) : 'type' in event && event.type === 'report' ? (
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-purple-600 mr-1" />
                    <p className="text-xs text-purple-600">
                      Report - {event.workingHours}
                    </p>
                  </div>
                ) : 'type' in event && event.type === 'leave' ? (
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 text-red-600 mr-1" />
                    <p className="text-xs text-red-600">
                      {event.leaveType} Leave - {event.status}
                    </p>
                  </div>
                ) : 'type' in event && event.type === 'saturday' ? (
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 text-purple-600 mr-1" />
                    <p className="text-xs text-purple-600">
                      {event.isWeekend ? 'Weekend Saturday' : 'Working Saturday'}
                    </p>
                  </div>
                ) : (
                  'createdAt' in event && event.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {formatDate(event.createdAt)}
                    </p>
                  )
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="lg:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
          eventColor="#3B82F6"
          eventTextColor="#FFFFFF"
          dayMaxEvents={true}
          moreLinkClick="popover"
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
            }
          }
        }}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
