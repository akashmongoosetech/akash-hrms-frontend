import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, Trash2, Plus } from 'lucide-react';
import DeleteModal from '../../Common/DeleteModal';
import { formatDate } from '../../Common/Commonfunction';
import CreateTeamModal from './modals/CreateTeamModal';
import ViewTeamModal from './modals/ViewTeamModal';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';

interface Team {
  _id: string;
  name: string;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamMembers: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  project: {
    _id: string;
    name: string;
    client?: {
      _id: string;
      name: string;
    };
  };
  status: string;
  createdAt: string;
}

export default function TeamTable() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewTeam, setViewTeam] = useState<Team | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        setError('Failed to fetch teams');
      }
    } catch (err) {
      setError('Error fetching teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: any) => {
    setCreateLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teamData)
      });

      if (response.ok) {
        fetchTeams();
        setShowCreateModal(false);
      } else {
        setError('Failed to create team');
      }
    } catch (err) {
      setError('Error creating team');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTeamId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTeamId) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/teams/${deleteTeamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchTeams();
        setShowDeleteModal(false);
        setDeleteTeamId(null);
      } else {
        setError('Failed to delete team');
      }
    } catch (err) {
      setError('Error deleting team');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (team: Team) => {
    setViewTeam(team);
    setShowViewModal(true);
    setDropdownOpen(null);
  };

  const toggleDropdown = (teamId: string) => {
    setDropdownOpen(dropdownOpen === teamId ? null : teamId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <BaseSkeleton className="h-6 w-20" />
          <BaseSkeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <BaseSkeleton className="h-6 w-32 mb-2" />
                  <BaseSkeleton className="h-5 w-16" />
                </div>
                <BaseSkeleton className="h-8 w-8 rounded-full" />
              </div>

              <div className="space-y-3">
                <div>
                  <BaseSkeleton className="h-4 w-12 mb-1" />
                  <BaseSkeleton className="h-4 w-24" />
                </div>

                <div>
                  <BaseSkeleton className="h-4 w-20 mb-1" />
                  <BaseSkeleton className="h-4 w-16" />
                </div>

                <div>
                  <BaseSkeleton className="h-4 w-12 mb-1" />
                  <BaseSkeleton className="h-4 w-28" />
                </div>

                <div>
                  <BaseSkeleton className="h-4 w-14 mb-1" />
                  <BaseSkeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Team</span>
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No teams found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    team.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(team._id)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {dropdownOpen === team._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => openViewModal(team)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(team._id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Manager</div>
                  <div className="text-sm font-medium text-gray-900">
                    {team.manager.firstName} {team.manager.lastName}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Team Members</div>
                  <div className="text-sm font-medium text-gray-900">
                    {team.teamMembers.length} members
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Project</div>
                  <div className="text-sm font-medium text-gray-900">
                    {team.project.name}
                    {team.project.client && (
                      <span className="text-gray-500"> ({team.project.client.name})</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="text-sm text-gray-900">
                    {formatDate(team.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTeamModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTeam}
        loading={createLoading}
      />

      <ViewTeamModal
        showModal={showViewModal}
        onClose={() => setShowViewModal(false)}
        team={viewTeam}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}