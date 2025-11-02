import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Edit, Trash2, Cake } from 'lucide-react';
import DeleteModal from '../Common/DeleteModal';

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
  dateOfBirth: string;
  role: string;
}

interface BirthdayEvent {
  _id: string;
  name: string;
  date: string;
  type: 'birthday';
  user: User;
}

interface EventCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
  userRole?: string;
}

export default function EventCalendar({ events, onEventClick, onEditEvent, onDeleteEvent, userRole }: EventCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | BirthdayEvent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
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
        const usersData = await response.json();
        console.log('Fetched users:', usersData);
        console.log('Users with DOB:', usersData.filter((u: User) => u.dateOfBirth));
        console.log('First user sample:', usersData[0]);
        setUsers(usersData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users, status:', response.status, 'error:', errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
      .filter(u => !!u.dateOfBirth)
      .map((user) => {
        // Try to parse DOB robustly; fall back to splitting string
        let dob = new Date(user.dateOfBirth);
        if (isNaN(dob.getTime())) {
          // Expected format: YYYY-MM-DD
          const parts = user.dateOfBirth.split(/[-/]/).map(Number);
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
  const allEvents = [...events, ...birthdayEvents];

  const calendarEvents = allEvents.map(event => ({
    id: event._id,
    title: event.name,
    // Ensure date is in YYYY-MM-DD format and avoid timezone shifts
    date: (event.date.includes('T') ? event.date.split('T')[0] : event.date),
    backgroundColor: 'type' in event && event.type === 'birthday' ? '#10B981' : '#3B82F6',
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

  const handleListEventClick = (event: Event | BirthdayEvent) => {
    setSelectedEvent(event);
    // Only call onEventClick for regular events, not birthdays
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => handleListEventClick(event)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2 pr-2">
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
                    <span className={`w-3 h-3 rounded-full ${'type' in event && event.type === 'birthday' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date)}
                </p>
                {'type' in event && event.type === 'birthday' ? (
                  <div className="flex items-center mt-1">
                    <Cake className="h-3 w-3 text-green-600 mr-1" />
                    <p className="text-xs text-green-600">
                      Birthday - {event.user.role}
                    </p>
                  </div>
                ) : (
                  'createdAt' in event && event.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(event.createdAt).toLocaleDateString()}
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