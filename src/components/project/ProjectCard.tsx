import React from 'react';
import { Edit, Trash2, MoreHorizontal, Eye, Users, Calendar } from 'lucide-react';
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

interface ProjectCardProps {
  project: Project;
  menuRef: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  openMenuId: string | null;
  onMenuToggle: (id: string) => void;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  getClientName: (p?: Project | null) => string;
}

export default function ProjectCard({
  project,
  menuRef,
  openMenuId,
  onMenuToggle,
  onView,
  onEdit,
  onDelete,
  getClientName
}: ProjectCardProps) {
  return (
    <div className="relative border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{getClientName(project)}</p>
        </div>
        <div className="relative" ref={(el) => menuRef.current[project._id] = el}>
          <button
            onClick={() => onMenuToggle(project._id)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
          {openMenuId === project._id && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => { onView(project); onMenuToggle(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4 text-gray-600" />
                <span>View</span>
              </button>
              <button
                onClick={() => { onEdit(project); onMenuToggle(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4 text-blue-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => { onDelete(project._id); onMenuToggle(''); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700 line-clamp-2">
        {project.description}
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex flex-wrap gap-1">
          {project.technology.split(',').map((tech, index) => (
            <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {tech.trim()}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <p className="font-bold">Start date:</p>
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.startDate as any)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <p className="font-bold">Team:</p>
          <Users className="h-3 w-3" />
          <div className="flex flex-wrap gap-1">
            {project.teamMembers.map((member) => (
              <span key={member._id} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                {member.firstName} {member.lastName}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          project.status === 'Active' ? 'bg-green-100 text-green-800' :
          project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}