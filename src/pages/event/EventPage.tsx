import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Calendar, Star, Users, CheckCircle, XClock, Music } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  date: string;
  type: 'celebration' | 'training' | 'meeting' | 'holiday';
  status: 'upcoming' | 'ongoing' | 'completed';
  attendees?: number;
}

const EventStats = {
  upcoming: 8,
  ongoing: 2,
  completed: 15,
};

const EventPage: React.FC = () => {
  const { notify } = useToast();

  const handleCreateEvent = () => {
    notify({
      title: 'Event Created',
      description: 'New event has been successfully created',
      variant: 'success',
    });
  };

  const handleJoinEvent = (eventId: string) => {
    notify({
      title: 'Joined',
      description: 'You have joined the event',
      variant: 'primary',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Company events, training, and celebrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-500">Create Event</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Event Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{EventStats.upcoming}</p>
            </div>
            <StatusBadge status="primary" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Music className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Ongoing</p>
              <p className="text-2xl font-bold text-gray-900">{EventStats.ongoing}</p>
            </div>
            <StatusBadge status="success" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{EventStats.completed}</p>
            </div>
            <StatusBadge status="success" size="sm" />
          </div>
        </Card>

        <Card className="p-5 rounded-xl shadow-soft transition-all hover:shadow-medium">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{EventStats.upcoming + EventStats.ongoing + EventStats.completed}</p>
            </div>
            <StatusBadge status="info" size="sm" />
          </div>
        </Card>
      </div>

      {/* Create Event Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Create New Event</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Event Title</label>
            <input
              type="text"
              placeholder="e.g., Annual Day Celebration"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Date</label>
            <input
              type="date"
              className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Type</label>
            <select className="w-full rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option>Celebration</option>
              <option>Training</option>
              <option>Meeting</option>
              <option>Holiday</option>
            </select>
          </div>
          <div>
            <Button variant="primary" className="w-full">
              <Star className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <Card className="p-6 bg-white rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          <Button variant="ghost" size="sm" className="text-sm text-primary/70">
            View All
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Jan 25 - Team Building</span>
            <span className="ml-2 text-xs text-primary font-medium">3h remaining</span>
            <StatusBadge status="primary" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Jan 28 - Leadership Training</span>
            <span className="ml-2 text-xs text-primary font-medium">2d remaining</span>
            <StatusBadge status="primary" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-border opacity-20 last:border-0">
            <Music className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Feb 02 - Annual Day</span>
            <span className="ml-2 text-xs text-primary font-medium">1w remaining</span>
            <StatusBadge status="success" size="sm" />
          </div>
          <div className="flex items-center gap-3 py-2 last:border-0">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span className="text-gray-500">Dec 31 - Year End Party</span>
            <span className="ml-2 text-xs text-primary font-medium">Completed</span>
            <StatusBadge status="success" size="sm" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventPage;