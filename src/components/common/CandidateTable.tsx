import React, { useState, useEffect } from 'react';
import { Eye, Download, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { UniversalSkeleton, BaseSkeleton } from '../ui/skeleton';
import { useToast } from '@/components/ui/toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Candidate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  currentCompany: string;
  experience: string;
  expectedSalary: string;
  noticePeriod: string;
  coverLetter: string;
  resume: {
    contentType: string;
    filename: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncSummary {
  status: string;
  totalFetched: number;
  new: number;
  updated: number;
  unchanged: number;
  deleted: number;
  newCareers: Array<{ title: string }>;
  updatedCareers: Array<{ title: string }>;
}

export default function CandidateTable() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const { notify } = useToast();

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage]);

  const fetchCandidates = async (page: number) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/candidates?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
        setTotalPages(Math.ceil(data.total / 10));
      } else {
        setError('Failed to fetch candidates');
      }
    } catch (err) {
      setError('Error fetching candidates');
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/candidates/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchCandidates(currentPage); // Refresh the list
      } else {
        setError('Failed to update candidate status');
      }
    } catch (err) {
      setError('Error updating candidate status');
    }
  };

  const syncCareerData = async () => {
    setSyncLoading(true);
    setSyncSummary(null);
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/candidates/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result: SyncSummary = await response.json();
        setSyncSummary(result);

        if (result.status === 'Success') {
          if (result.summary.new === 0 && result.summary.updated === 0) {
            notify({
              title: 'Career Data Up to Date',
              description: 'Career data is already up to date. No new or updated requirements found.',
              variant: 'info',
            });
          } else {
            let description = `Synchronization completed!\n`;
            description += `• Total Fetched: ${result.summary.totalFetched}\n`;
            description += `• New Records: ${result.summary.new}\n`;
            description += `• Updated Records: ${result.summary.updated}\n`;
            description += `• Unchanged Records: ${result.summary.unchanged}\n\n`;

            if (result.newCareers.length > 0) {
              description += `New Careers:\n${result.newCareers.map((c, i) => `${i + 1}. ${c.title}`).join('\n')}\n\n`;
            }
            if (result.updatedCareers.length > 0) {
              description += `Updated Careers:\n${result.updatedCareers.map((c, i) => `${i + 1}. ${c.title}`).join('\n')}\n`;
            }

            notify({
              title: 'Career Data Synchronized Successfully',
              description,
              variant: 'success',
            });
          }
        } else {
          notify({
            title: 'Synchronization Failed',
            description: result.error || 'Unknown error occurred during synchronization',
            variant: 'destructive',
          });
        }

        fetchCandidates(currentPage); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.error || errorData.message || 'Failed to sync career data';
        const stageInfo = errorData.stage ? ` (stage: ${errorData.stage})` : '';
        notify({
          title: 'Synchronization Failed',
          description: `${detail}${stageInfo}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      notify({
        title: 'Synchronization Failed',
        description: 'Network error. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <BaseSkeleton className="h-6 w-32" />
          <BaseSkeleton className="h-10 w-48" />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-4" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-8" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-12" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BaseSkeleton className="h-4 w-14" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 10 }, (_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <BaseSkeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <BaseSkeleton className="h-4 w-24 mb-1" />
                    <BaseSkeleton className="h-3 w-16 mb-1" />
                    <BaseSkeleton className="h-3 w-32" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="flex space-x-2">
                      <BaseSkeleton className="h-5 w-5 rounded-full" />
                      <BaseSkeleton className="h-5 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <BaseSkeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <div className="flex space-x-2">
                      <BaseSkeleton className="h-8 w-8 rounded" />
                      <BaseSkeleton className="h-8 w-8 rounded" />
                      <BaseSkeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Candidates</h3>
          {syncSummary && (
            <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
              <div className="flex items-center space-x-2 mb-1">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Last Sync Summary</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="text-blue-700">New: <span className="font-semibold">{syncSummary.summary.new}</span></span>
                <span className="text-emerald-700">Updated: <span className="font-semibold">{syncSummary.summary.updated}</span></span>
                <span className="text-slate-700">Unchanged: <span className="font-semibold">{syncSummary.summary.unchanged}</span></span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={syncCareerData}
          disabled={syncLoading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Sync Career Data</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Salary</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate, index) => (
              <TableRow key={candidate._id} className="hover:bg-gray-50">
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(currentPage - 1) * 10 + index + 1}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {candidate.name} &nbsp; <span className='whitespace-nowrap text-sm text-gray-500'>{candidate.experience} years</span>
                  <div className='whitespace-nowrap text-sm text-gray-500'>
                    {candidate.email}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.position}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{candidate.expectedSalary}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(candidate.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(candidate.createdAt)}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="p-2 rounded hover:bg-gray-100 text-gray-600"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {candidate.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateCandidateStatus(candidate._id, 'approved')}
                          className="p-2 rounded hover:bg-gray-100 text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateCandidateStatus(candidate._id, 'rejected')}
                          className="p-2 rounded hover:bg-gray-100 text-red-600"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-8 text-gray-500">No candidates found</div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Candidate Details</h3>
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-sm">Name</div>
                  <div className="text-gray-800 font-medium">{selectedCandidate.name}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Email</div>
                  <div className="text-gray-800">{selectedCandidate.email}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Phone</div>
                  <div className="text-gray-800">{selectedCandidate.phone}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Position</div>
                  <div className="text-gray-800">{selectedCandidate.position}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Current Company</div>
                  <div className="text-gray-800">{selectedCandidate.currentCompany || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Experience</div>
                  <div className="text-gray-800">{selectedCandidate.experience} years</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Expected Salary</div>
                  <div className="text-gray-800">₹{selectedCandidate.expectedSalary}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Notice Period</div>
                  <div className="text-gray-800">{selectedCandidate.noticePeriod}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <div className="text-gray-800 flex items-center space-x-2">
                    {getStatusIcon(selectedCandidate.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Applied Date</div>
                  <div className="text-gray-800">{new Date(selectedCandidate.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-2">Cover Letter</div>
                <div className="text-gray-800 bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                  {selectedCandidate.coverLetter}
                </div>
              </div>

              {selectedCandidate.resume && (
                <div>
                  <div className="text-gray-500 text-sm mb-2">Resume</div>
                  <div className="text-gray-800">
                    <a
                      href={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/uploads/${selectedCandidate.resume.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {selectedCandidate.resume.filename}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              {selectedCandidate.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateCandidateStatus(selectedCandidate._id, 'approved');
                      setSelectedCandidate(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      updateCandidateStatus(selectedCandidate._id, 'rejected');
                      setSelectedCandidate(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
