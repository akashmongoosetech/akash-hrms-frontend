import React from 'react';

interface BreakRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  action: 'Break In' | 'Break Out';
  reason?: string;
  timestamp: string;
  date: string;
  addedBy?: {
    _id: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface ActivitiesTimelineProps {
  breaks: BreakRecord[];
}

const ActivitiesTimeline: React.FC<ActivitiesTimelineProps> = ({ breaks }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i className="fa fa-stream text-blue-500"></i> Timeline Activity
        </h3>
      </div>

      <div className="relative p-6">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-gray-200 to-transparent"></div>

        {breaks.length > 0 ? (
          breaks.map((activity, index) => {
            // --- Date Separator Logic ---
            let showSeparator = false;
            let displayDate = '';
            const currentDateStr = activity.date;
            if (index === 0 || currentDateStr !== breaks[index - 1].date) {
              showSeparator = true;
            }

            if (showSeparator && currentDateStr) {
              const dateObj = new Date(currentDateStr);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);

              const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
              const dateNoTime = stripTime(dateObj);
              const todayNoTime = stripTime(today);
              const yesterdayNoTime = stripTime(yesterday);

              if (dateNoTime.getTime() === todayNoTime.getTime()) {
                displayDate = '';
              } else if (dateNoTime.getTime() === yesterdayNoTime.getTime()) {
                displayDate = 'Yesterday';
              } else {
                displayDate = dateObj.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                });
              }
            }

            const key = activity._id || index;
            const type = activity.action === 'Break In' ? 'Break_in' : 'Break_out';
            const time = formatTime(activity.timestamp);
            const description = activity.reason || '';

            if (!activity.employee) return null;

            return (
              <React.Fragment key={key}>
                {/* Date Separator */}
                {showSeparator && displayDate && (
                  <div className="flex items-center my-8">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="mx-3 px-4 py-1 border border-gray-300 rounded-full bg-gray-50 text-gray-600 text-sm font-medium shadow-sm">
                      <i className="fa fa-calendar-alt mr-1 text-gray-400"></i>
                      {displayDate}
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                )}

                {/* Timeline Item */}
                <div className="relative pl-14 mb-8 group">
                  {/* Node circle */}
                  <div className="absolute left-5 top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform"></div>

                  <div className="flex items-start gap-4">
                    {/* Profile Image */}
                    {activity.employee.photo ? (
                      <img
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${activity.employee.photo}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 text-blue-600 font-semibold">
                        {activity.employee.firstName[0]}
                        {activity.employee.lastName[0]}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-800">
                          {activity.employee.firstName} {activity.employee.lastName}
                          <span className="mx-2 text-gray-400">|</span>
                          <span
                            className={`${
                              type === 'Break_in' ? 'text-green-600' : 'text-red-500'
                            } font-medium`}
                          >
                            {type === 'Break_in' ? 'Break In' : 'Break Out'}
                          </span>
                        </span>
                        <small className="text-gray-500">{time}</small>
                      </div>

                      {description && (
                        <p className="text-sm text-gray-700 leading-snug">
                          {description}
                        </p>
                      )}

                      {activity.addedBy && (
                        <small className="block text-blue-600 mt-1">
                          Added by {activity.addedBy.firstName} {activity.addedBy.lastName} ({activity.addedBy.role})
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-6">No activities found</div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesTimeline;