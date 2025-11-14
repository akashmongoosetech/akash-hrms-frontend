import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import API from '../../utils/api';
import toast from 'react-hot-toast';
import DeleteModal from '../../Common/DeleteModal';
import socket from '../../utils/socket';
import ReportTable from '../../components/Reports/ReportTable';
import AddReportModal from '../../components/Reports/AddReportModal';
import ViewReportModal from '../../components/Reports/ViewReportModal';
import EditReportModal from '../../components/Reports/EditReportModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';

interface Report {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  description: string;
  startTime: string;
  breakDuration: number;
  endTime: string;
  workingHours: string;
  totalHours: string;
  date: string;
  note: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ReportsPage() {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const getYesterday = () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    };

    const getToday = () => {
      return new Date().toISOString().split('T')[0];
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [fetchingReports, setFetchingReports] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filters, setFilters] = useState({
       fromDate: getYesterday(),
       toDate: getToday(),
       employeeId: (role === 'Admin' || role === 'SuperAdmin') ? '' : userId || ''
     });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

  useEffect(() => {
    fetchAllReports(currentPage);
    fetchEmployees();

    // Socket listeners for real-time updates
    socket.on('reportCreated', (newReport) => {
      setReports(prev => [newReport, ...prev]);
      toast.success('New report added by another user');
    });

    socket.on('reportUpdated', (data) => {
      const { updatedReport, updater } = data;
      setReports(prev => prev.map(report =>
        report._id === updatedReport._id ? updatedReport : report
      ));
      toast.success(`Report updated by ${updater.name} (${updater.role})`);
    });

    socket.on('reportDeleted', (deletedReportId) => {
      setReports(prev => prev.filter(report => report._id !== deletedReportId));
      toast.success('Report deleted by another user');
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off('reportCreated');
      socket.off('reportUpdated');
      socket.off('reportDeleted');
    };
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDeleteReport = (id: string) => {
    setDeleteReportId(id);
    setShowDeleteModal(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditModalOpen(true);
  };

  const fetchReports = async (filterParams?: { fromDate?: string; toDate?: string; employeeId?: string }) => {
    try {
      const params = new URLSearchParams();
      if (filterParams?.fromDate) params.append('fromDate', filterParams.fromDate);
      if (filterParams?.toDate) params.append('toDate', filterParams.toDate);
      if (filterParams?.employeeId) params.append('employeeId', filterParams.employeeId);

      const response = await API.get(`/reports?${params.toString()}`);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setFetchingReports(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await API.get('/users');
      setEmployees(response.data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error loading employees');
    }
  };

  const handleApplyFilters = () => {
    fetchReports(filters);
  };

  // Initial fetch without filters to get all reports, then filter client-side
  const fetchAllReports = async (page: number = 1) => {
    try {
      const response = await API.get(`/reports?page=${page}&limit=${itemsPerPage}`);
      const allReports = response.data.reports;
      // Filter to only yesterday and today, and by employee if not admin
      const yesterday = getYesterday();
      const today = getToday();
      let filteredReports = allReports.filter((report: Report) =>
        report.date === yesterday || report.date === today
      );
      if (role !== 'Admin' && role !== 'SuperAdmin') {
        filteredReports = filteredReports.filter((report: Report) =>
          report.employee._id === userId
        );
      }
      setReports(filteredReports);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading reports');
    } finally {
      setFetchingReports(false);
    }
  };


  const handleDelete = (id: string) => {
    setDeleteReportId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteReportId) return;

    try {
      await API.delete(`/reports/${deleteReportId}`);

      // Emit socket event for real-time update
      socket.emit('reportDeleted', deleteReportId);

      toast.success('Report deleted successfully!');
      setShowDeleteModal(false);
      setDeleteReportId(null);
      fetchAllReports(currentPage); // Refresh reports list
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting report');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {role && role !== 'Admin' && role !== 'SuperAdmin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            <span>Add Report</span>
          </button>
        )}
      </div>

     <ReportTable
       reports={reports}
       role={role}
       fetchingReports={fetchingReports}
       onView={handleViewReport}
       onEdit={handleEditReport}
       onDelete={handleDeleteReport}
       employees={employees}
       filters={filters}
       onFiltersChange={setFilters}
       onApplyFilters={handleApplyFilters}
     />

     {/* Pagination */}
     {totalPages > 1 && (
       <Pagination className="mt-6">
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
                 onClick={() => setCurrentPage(page)}
                 isActive={currentPage === page}
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

     <AddReportModal
       isOpen={isModalOpen}
       onClose={() => setIsModalOpen(false)}
       onReportAdded={fetchAllReports}
     />

     <ViewReportModal
       isOpen={isViewModalOpen}
       onClose={() => {
         setIsViewModalOpen(false);
         setSelectedReport(null);
       }}
       report={selectedReport}
       role={role}
     />

     <EditReportModal
       isOpen={isEditModalOpen}
       onClose={() => {
         setIsEditModalOpen(false);
         setSelectedReport(null);
       }}
       report={selectedReport}
       onReportUpdated={fetchAllReports}
     />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  );
}