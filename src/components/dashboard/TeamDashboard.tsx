import React, { useState, useEffect } from 'react';
import { formatDate } from '../../Common/Commonfunction';
import { Button } from '../ui/button';
import ViewTeamModal from '../common/modals/ViewTeamModal';
import { Eye } from 'lucide-react';

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

export default function TeamDashboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const role = localStorage.getItem("role") || "Employee";
    const userId = localStorage.getItem("userId");

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
                let filteredTeams = data;

                if (role === 'Employee' && userId) {
                    filteredTeams = data.filter((team: Team) =>
                        team.manager._id === userId ||
                        team.teamMembers.some(member => member._id === userId)
                    );
                }

                setTeams(filteredTeams);
            } else {
                setError('Failed to fetch teams');
            }
        } catch (err) {
            setError('Error fetching teams');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading teams...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    if (teams.length === 0) {
        return null; // Don't show anything if no teams
    }

    return (
        <>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 px-4 sm:px-0">Teams Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="mb-4">
                                <div className="d-flex">
                                    <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                                <div>
                                <Button
                                    className=''
                                    variant='destructive'
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        setShowModal(true);
                                    }}
                                >
                                    <Eye/> View
                                </Button>
                            </div>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${team.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {team.status}
                                </span>
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

                                <div className="d-flex gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Project</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {team.project.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Client</div>
                                        <div>
                                            {team.project.client && (
                                                <span className="text-sm font-medium text-gray-900"> {team.project.client.name}</span>
                                            )}
                                        </div>
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
            </div>

            <ViewTeamModal
                showModal={showModal}
                onClose={() => setShowModal(false)}
                team={selectedTeam}
            />
        </>
    );
}
