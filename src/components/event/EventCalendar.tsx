import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Edit, Trash2, Cake, Calendar } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';

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

interface EventCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  userRole?: string;
}

export default function EventCalendar({ events, onEventClick, onEditEvent, onDeleteEvent, userRole }: EventCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | BirthdayEvent | HolidayEvent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [holidays, setHolidays] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchHolidays();
  }, []);

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
        console.log('Fetched users:', usersData);
        console.log('Users with DOB:', usersData.filter((u: User) => u.dob));
        console.log('First user sample:', usersData[0]);
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

      console.log('Holidays response status:', response.status);

      if (response.ok) {
        const holidaysData = await response.json();
        console.log('Fetched holidays:', holidaysData);

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
      .filter(u => !!u.dob)
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
  const allEvents = [...events, ...birthdayEvents, ...holidays];

  // Create day colors map with priority: holiday > birthday > event
  const dayColors: { [date: string]: string } = {};
  allEvents.forEach(event => {
    const date = event.date.includes('T') ? event.date.split('T')[0] : event.date;
    const color = 'type' in event && event.type === 'birthday' ? '#3B82F6' : ('type' in event && event.type === 'holiday' ? '#EF4444' : '#10B981');
    if (!dayColors[date]) {
      dayColors[date] = color;
    } else if ('type' in event && event.type === 'holiday') {
      dayColors[date] = color; // Holiday takes priority
    } else if ('type' in event && event.type === 'birthday' && dayColors[date] === '#10B981') {
      dayColors[date] = color; // Birthday takes priority over event
    }
  });

  const calendarEvents = allEvents.map(event => ({
    id: event._id,
    title: event.name,
    // Ensure date is in YYYY-MM-DD format and avoid timezone shifts
    date: (event.date.includes('T') ? event.date.split('T')[0] : event.date),
    backgroundColor: 'type' in event && event.type === 'birthday' ? '#3B82F6' : ('type' in event && event.type === 'holiday' ? '#EF4444' : '#10B981'),
    extendedProps: {
      originalEvent: event
    }
  }));

  const handleEventClick = (info: any) => {
    const originalEvent = info.event.extendedProps.originalEvent;
    setSelectedEvent(originalEvent);
    // Only call onEventClick for regular events, not birthdays
    if (onEventClick && !('type' in originalEvent)) {
      onEventClick(originalEvent);
    }
  };

  const handleListEventClick = (event: Event | BirthdayEvent | HolidayEvent) => {
    setSelectedEvent(event);
    // Only call onEventClick for regular events, not birthdays or holidays
    if (onEventClick && !('type' in event)) {
      onEventClick(event);
    }
  };

  // Sort events by date (most recent first)
  const sortedEvents = [...allEvents].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Check if user can manage events (Admin or SuperAdmin)
  const canManageEvents = userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'superadmin');


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Events List Sidebar */}
      <div className="lg:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
          All Events ({allEvents.length})
        </h2>
        
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
                          : 'hover:border-green-300 hover:bg-gray-50'
                      )
                } ${
                  'type' in event && event.type === 'birthday'
                    ? 'border-l-[8px] border-l-blue-500'
                    : 'type' in event && event.type === 'holiday'
                    ? 'border-l-[8px] border-l-red-500'
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
                      ('type' in event && event.type === 'holiday' ? 'bg-red-500' : 'bg-green-500')
                    }`}></span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date)}
                </p>
                {/* {'type' in event && event.type === 'birthday' ? (
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
                ) : (
                  'createdAt' in event && event.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {formatDate(event.createdAt)}
                    </p>
                  )
                )} */}
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
          dayCellDidMount={(info) => {
            const date = info.date.toISOString().split('T')[0];
            if (dayColors[date]) {
              info.el.style.setProperty('background-color', dayColors[date], 'important');
            }
          }}
        />
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (onDeleteEvent && deleteEventId) {
            onDeleteEvent(deleteEventId);
            setShowDeleteModal(false);
            setDeleteEventId(null);
          }
        }}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}