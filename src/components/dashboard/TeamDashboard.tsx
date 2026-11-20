import React, { useState, useEffect, useMemo } from 'react';
import { formatDate } from '../../Common/Commonfunction';
import { Button } from '../ui/button';
import ViewTeamModal from '../common/modals/ViewTeamModal';
import { Eye, Users, Briefcase, Building2, CalendarDays } from 'lucide-react';
import { BaseSkeleton } from '../ui/skeleton';

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
}

interface Team {
    _id: string;
    name: string;
    manager?: Member;
    teamMembers: Member[];
    project: {
        _id: string;
        name: string;
        client?: { _id: string; name: string };
    };
    status: string;
    createdAt: string;
}

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-cyan-100 text-cyan-700',
];

const photoUrl = (photo?: string) =>
    photo ? (photo.startsWith('http') ? photo : `${API_URL}/${photo}`) : null;

const initials = (m: Member) =>
    `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase() || '?';

const colorFor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
    return AVATAR_COLORS[hash];
};

function Avatar({ member, size = 'h-9 w-9', ring = true }: { member: Member; size?: string; ring?: boolean }) {
    const [failed, setFailed] = useState(false);
    const src = photoUrl(member.photo);
    const base = `${size} rounded-full shrink-0 ${ring ? 'ring-2 ring-white' : ''}`;

    return src && !failed ? (
        <img
            src={src}
            alt={`${member.firstName} ${member.lastName}`}
            title={`${member.firstName} ${member.lastName}`}
            onError={() => setFailed(true)}
            className={`${base} object-cover`}
        />
    ) : (
        <span
            title={`${member.firstName} ${member.lastName}`}
            className={`${base} ${colorFor(member._id)} inline-flex items-center justify-center text-xs font-semibold`}
        >
            {initials(member)}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const active = status === 'Active';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
            }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {status}
        </span>
    );
}

function TeamCardSkeleton() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <BaseSkeleton className="h-6 w-40" />
                <BaseSkeleton className="h-6 w-16 rounded-full" />
            </div>
            <BaseSkeleton className="mt-5 h-12 w-full" />
            <div className="mt-5 flex items-center gap-2">
                {Array(4).fill(0).map((_, i) => (
                    <BaseSkeleton key={i} className="h-9 w-9 rounded-full" />
                ))}
            </div>
            <BaseSkeleton className="mt-6 h-9 w-full" />
        </div>
    );
}

export default function TeamDashboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

    const role = localStorage.getItem('role') || 'Employee';
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_URL}/teams`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (response.ok) {
                const data: Team[] = await response.json();
                let result = data;

                if (role === 'Employee' && userId) {
                    result = data.filter(
                        (team) =>
                            team.manager?._id === userId ||
                            team.teamMembers.some((m) => m._id === userId)
                    );
                }
                setTeams(result);
            } else {
                setError('Failed to fetch teams');
            }
        } catch {
            setError('Error fetching teams');
        } finally {
            setLoading(false);
        }
    };

    const counts = useMemo(() => {
        const active = teams.filter((t) => t.status === 'Active').length;
        return { All: teams.length, Active: active, Inactive: teams.length - active };
    }, [teams]);

    const visibleTeams = useMemo(() => {
        if (filter === 'All') return teams;
        return teams.filter((t) => (filter === 'Active' ? t.status === 'Active' : t.status !== 'Active'));
    }, [teams, filter]);

    if (loading) {
        return (
            <section className="mb-6 sm:mb-8">
                <BaseSkeleton className="mb-5 h-8 w-48" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array(6).fill(0).map((_, i) => (
                        <TeamCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <div className="mx-4 my-8 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 sm:mx-0">
                {error}
            </div>
        );
    }

    if (teams.length === 0) return null;

    return (
        <>
            <section className="mb-6 sm:mb-8">
                {/* Header */}
                <div className="mb-5 flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Teams Overview</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {counts.All} {counts.All === 1 ? 'team' : 'teams'} &middot; {counts.Active} active
                        </p>
                    </div>

                    <div className="inline-flex self-start rounded-xl bg-gray-100 p-1 sm:self-auto" role="tablist">
                        {(['All', 'Active', 'Inactive'] as const).map((f) => (
                            <button
                                key={f}
                                role="tab"
                                aria-selected={filter === f}
                                onClick={() => setFilter(f)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                    filter === f
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {f}
                                <span className="ml-1.5 text-xs text-gray-400">{counts[f]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {visibleTeams.length === 0 && (
                    <div className="mx-4 rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 sm:mx-0">
                        No {filter.toLowerCase()} teams to show.
                    </div>
                )}

                {/* Cards */}
                <div className="grid grid-cols-1 gap-5 px-4 sm:px-0 md:grid-cols-2 xl:grid-cols-3">
                    {visibleTeams.map((team) => {
                        const active = team.status === 'Active';
                        const shown = team.teamMembers.slice(0, 5);
                        const extra = team.teamMembers.length - shown.length;

                        return (
                            <article
                                key={team._id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg"
                            >
                                <div className={`h-1 w-full ${active ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gray-300'}`} />

                                <div className="flex flex-1 flex-col p-5 sm:p-6">
                                    {/* Title row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-lg font-semibold text-gray-900" title={team.name}>
                                                {team.name}
                                            </h2>
                                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                                                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{team.project?.name}</span>
                                            </p>
                                        </div>
                                        <StatusBadge status={team.status} />
                                    </div>

                                    {/* Client */}
                                    {team.project?.client && (
                                        <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
                                            <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                            <span className="truncate">{team.project.client.name}</span>
                                        </p>
                                    )}

                                    {/* Manager */}
                                    <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                        {team.manager ? (
                                            <>
                                                <Avatar member={team.manager} size="h-10 w-10" ring={false} />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium text-gray-900">
                                                        {team.manager.firstName} {team.manager.lastName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Manager</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-500">No manager assigned</div>
                                        )}
                                    </div>

                                    {/* Members */}
                                    <div className="mt-5 flex items-center justify-between gap-3">
                                        <div className="flex -space-x-2">
                                            {shown.map((m) => (
                                                <Avatar key={m._id} member={m} />
                                            ))}
                                            {extra > 0 && (
                                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 ring-2 ring-white">
                                                    +{extra}
                                                </span>
                                            )}
                                            {team.teamMembers.length === 0 && (
                                                <span className="text-sm text-gray-400">No members yet</span>
                                            )}
                                        </div>
                                        <span className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
                                            <Users className="h-4 w-4" />
                                            {team.teamMembers.length}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Created {formatDate(team.createdAt)}
                                        </span>
                                        <Button
                                            className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-1.5 font-medium text-white transition-all hover:from-blue-500 hover:to-blue-700"
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Eye className="mr-1.5 h-4 w-4" /> View
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <ViewTeamModal showModal={showModal} onClose={() => setShowModal(false)} team={selectedTeam} />
        </>
    );
}