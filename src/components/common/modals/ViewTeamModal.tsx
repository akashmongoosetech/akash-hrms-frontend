import React from 'react';
import { formatDateTime } from '../../../Common/Commonfunction';

interface Team {
  _id: string;
  name: string;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  teamMembers: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  }[];
  project: {
    _id: string;
    name: string;
    client?: {
      _id: string;
      name: string;
      profile?: string;
    };
  };
  status: string;
  createdAt: string;
}

interface ViewTeamModalProps {
  showModal: boolean;
  onClose: () => void;
  team: Team | null;
}

const ViewTeamModal: React.FC<ViewTeamModalProps> = ({ showModal, onClose, team }) => {
  if (!showModal || !team) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar relative transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4 border-b border-gray-200 pb-3">
          <h3 className="text-2xl font-semibold text-gray-800">Team Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-sm">Team Name</div>
              <div className="text-lg font-semibold text-gray-800">{team.name}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Status</div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  team.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {team.status}
              </span>
            </div>
          </div>

          {/* Project */}
          <section>
            <h4 className="text-gray-600 text-sm mb-2 font-medium">Project</h4>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 flex items-center space-x-4 hover:shadow-md transition-all">
              {team.project.client?.profile && (
                <img
                  src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${team.project.client.profile}`}
                  alt={team.project.client.name}
                  className="w-14 h-14 rounded-full ring-2 ring-blue-100 object-cover"
                  onError={(e) => ((e.target as HTMLImageElement).src = '/default-avatar.png')}
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{team.project.name}</p>
                {team.project.client && (
                  <p className="text-sm text-gray-600">Client: {team.project.client.name}</p>
                )}
              </div>
            </div>
          </section>

          {/* Manager */}
          <section>
            <h4 className="text-gray-600 text-sm mb-2 font-medium">Manager</h4>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 flex items-center space-x-4 hover:shadow-md transition-all">
              <img
                src={
                  team.manager.photo
                    ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${team.manager.photo}`
                    : '/default-avatar.png'
                }
                alt={`${team.manager.firstName} ${team.manager.lastName}`}
                className="w-14 h-14 rounded-full ring-2 ring-blue-100 object-cover"
                onError={(e) => ((e.target as HTMLImageElement).src = '/default-avatar.png')}
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {team.manager.firstName} {team.manager.lastName}
                </p>
                <p className="text-sm text-gray-600">{team.manager.email}</p>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section>
            <h4 className="text-gray-600 text-sm mb-2 font-medium">
              Team Members ({team.teamMembers.length})
            </h4>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              {team.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {team.teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center text-center hover:shadow-lg transition-all"
                    >
                      <img
                        src={
                          member.photo
                            ? `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${member.photo}`
                            : '/default-avatar.png'
                        }
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-12 h-12 rounded-full ring-2 ring-blue-50 object-cover mb-2"
                        onError={(e) => ((e.target as HTMLImageElement).src = '/default-avatar.png')}
                      />
                      <div className="font-medium text-gray-800">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No team members</div>
              )}
            </div>
          </section>

          {/* Footer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-sm">Created Date</div>
              <div className="text-gray-800 font-medium">{formatDateTime(team.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 font-medium hover:from-gray-300 hover:to-gray-400 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* CSS for fade and hidden scrollbar */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ViewTeamModal;
