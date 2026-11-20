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

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

const photoUrl = (photo?: string) =>
  photo ? (photo.startsWith('http') ? photo : `${API_URL}/${photo}`) : null;

const initials = (m: { firstName?: string; lastName?: string }) =>
  `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const colorFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 5;
  const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-violet-100 text-violet-700'];
  return colors[hash];
};

function Avatar({ member }: { member: { photo?: string; firstName?: string; lastName?: string } }) {
  const src = photoUrl(member.photo);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${member.firstName} ${member.lastName}`}
      title={`${member.firstName} ${member.lastName}`}
      className="w-8 h-8 rounded-full object-cover"
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status === 'Active' ? 'bg-emerald-100 text-emerald-700' : status === 'Rejected' ? 'bg-red-100 text-red-700' : status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
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
          <div className="flex items-center gap-2">
            {project.teamMembers && project.teamMembers.length > 0 ? (
              <Avatar member={project.teamMembers[0]} />
            ) : null}
            <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
          </div>
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
        <div className="flex flex-wrap gap-2">
          {project.teamMembers?.slice(0, 4).map((member) => (
            <div
              key={member._id}
              className="relative group"
              title={`${member.firstName} ${member.lastName}`}
              style={{ width: 32, height: 32 }}
            >
              <img
                src={member.photo
                  ? member.photo.startsWith('http')
                      ? member.photo
                      : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${member.photo}`
                  : '/default-avatar.png'}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 transition-shadow duration-200 hover:opacity-80 group-hover:opacity-100"
              />
            </div>
          ))}
          {project.teamMembers?.length > 4 && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 ring-2 ring-white">
              +{project.teamMembers.length - 4}
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <p className="font-bold">Team:</p>
            <Users className="h-3 w-3" />
            <div className="flex flex-wrap gap-1">
              {project.teamMembers?.map((member) => (
                <span key={member._id} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                  {member.firstName} {member.lastName}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'Active' ? 'bg-green-100 text-green-800' : project.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}