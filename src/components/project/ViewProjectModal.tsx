import React from 'react';
import { X, FolderOpen } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';

interface Client {
  _id: string;
  name: string;
  email: string;
}

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  technology: string;
  client?: Client | null;
  teamMembers: TeamMember[];
  startDate: string;
  status: string;
}

interface ViewProjectModalProps {
  viewProject: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

const getMembersForView = (p?: Project | null): TeamMember[] => {
  const m: any = p && (p as any).teamMembers;
  if (!Array.isArray(m)) return [] as TeamMember[];
  if (m.length === 0) return [] as TeamMember[];
  return typeof m[0] === 'string' ? [] as TeamMember[] : (m.filter((x: any) => x && x._id) as TeamMember[]);
};

export default function ViewProjectModal({ viewProject, onClose, onEdit }: ViewProjectModalProps) {
  if (!viewProject) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderOpen className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Project Details</h2>
          </div>
          <button onClick={onClose} className="hover:text-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Project Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Project Name</p>
                <p className="font-medium text-gray-900">{viewProject.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Client</p>
                <p className="font-medium text-gray-900">{viewProject.client && viewProject.client.name ? viewProject.client.name : 'No client'}</p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium text-gray-900">{formatDate(viewProject.startDate as any)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  viewProject.status === 'Active' ? 'bg-green-100 text-green-800' :
                  viewProject.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {viewProject.status}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Description</h3>
            <p className="text-gray-800 text-sm">{viewProject.description}</p>
          </div>

          {/* Technology */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {viewProject.technology.split(',').map((tech, index) => (
                <span key={index} className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
              Team Members ({getMembersForView(viewProject).length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {getMembersForView(viewProject).map((member) => (
                <div key={member._id} className="flex items-center space-x-3 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
                  {member.photo ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover shadow-sm"
                      src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${member.photo}`}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => { onClose(); onEdit(viewProject); }}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Edit Project
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-md hover:bg-gray-300 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}