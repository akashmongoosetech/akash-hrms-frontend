import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../Common/Commonfunction';
import ProfileCalendar from '../../components/event/ProfileCalendar';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  photo?: string;
  employeeCode?: string; 0
  dob?: string;
  joiningDate?: string;
  mobile1?: string;
  mobile2?: string;
  password?: string;
  address1?: string;
  address2?: string;
  emergencyContact1?: string;
  emergencyContact2?: string;
  emergencyContact3?: string;
  skillsFrontend?: string[];
  skillsBackend?: string[];
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  bankAddress?: string;
  salaryDetails?: {
    accountNo?: string;
    bankName?: string;
    ifscCode?: string;
  };
  aadharCardNumber?: string;
  drivingLicenseNumber?: string;
  panCardNumber?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  upworkProfile?: string;
  role: string;
  department?: string | {
    _id: string;
    name: string;
    head: string;
  };
  aadharCardFile?: string;
  panCardFile?: string;
  drivingLicenseFile?: string;
  resume?: string;
}

export default function EmployeeViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const validTabs = ['View', 'Timeline', 'Calendar'];
  const normalizedTab = tabParam ? tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase() : null;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(validTabs.includes(normalizedTab || '') ? normalizedTab : 'View');
  const [activities, setActivities] = useState<any[]>([]);
  const [showResume, setShowResume] = useState(false);
  const currentUserId = localStorage.getItem("userId");
  const currentRole = localStorage.getItem("role");

  useEffect(() => {
    if (id) {
      // Restrict employees to view only their own profile
      if (currentRole === "Employee" && id !== currentUserId) {
        navigate(`/employees/view/${currentUserId}`);
        return;
      }
      fetchEmployee();
      fetchActivities();
    }
  }, [id, currentRole, currentUserId, navigate]);

  // Update URL when activeTab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (activeTab !== 'View') {
      newSearchParams.set('tab', activeTab.toLowerCase());
    } else {
      newSearchParams.delete('tab');
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  const fetchEmployee = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const employeeData: Employee = await response.json();
        setEmployee(employeeData);
      } else {
        toast.error('Failed to fetch employee');
      }
    } catch (err) {
      toast.error('Error fetching employee');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!id) return;

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Fetch punches with employee and date filter
      const punchesResponse = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/punches?employee=${id}&fromDate=${today}&toDate=${today}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch breaks with employeeId and date filter
      const breaksResponse = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/breaks?employeeId=${id}&fromDate=${today}&toDate=${today}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const activities: any[] = [];

      if (punchesResponse.ok) {
        const punchesData = await punchesResponse.json();
        const employeePunches = punchesData.punchTimes || [];
        employeePunches.forEach((punch: any) => {
          if (punch.punchInTime) {
            activities.push({
              id: `punch-in-${punch._id}`,
              type: 'punch-in',
              time: punch.punchInTime,
              date: punch.createdAt ? punch.createdAt.split('T')[0] : new Date(punch.punchInTime).toISOString().split('T')[0],
              description: 'Punched In'
            });
          }
          if (punch.punchOutTime) {
            activities.push({
              id: `punch-out-${punch._id}`,
              type: 'punch-out',
              time: punch.punchOutTime,
              date: punch.createdAt ? punch.createdAt.split('T')[0] : new Date(punch.punchOutTime).toISOString().split('T')[0],
              description: 'Punched Out'
            });
          }
        });
      }

      if (breaksResponse.ok) {
        const breaksData = await breaksResponse.json();
        const employeeBreaks = Array.isArray(breaksData) ? breaksData : [];
        employeeBreaks.forEach((breakItem: any) => {
          activities.push({
            id: `break-${breakItem._id}`,
            type: breakItem.action === 'Break In' ? 'break-start' : 'break-end',
            time: breakItem.timestamp,
            date: breakItem.date,
            description: breakItem.action === 'Break In' ? 'Break Started' : 'Break Ended'
          });
        });
      }

      // Sort activities by time (most recent first) - since all are from today
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">Loading employee...</div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16 text-red-600">Employee not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:block">Back to Employees</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
          </div>
          <button
            onClick={() => navigate(`/employees/edit/${employee._id}`)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Employee</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('View')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'View'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <Eye className="h-4 w-4" />
              <span>View</span>
            </button>
            <button
              onClick={() => setActiveTab('Timeline')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'Timeline'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <Clock className="h-4 w-4" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('Calendar')}
              className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'Calendar'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'View' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Employee Profile Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8 border-b border-gray-200">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <div>
                    {employee.photo ? (
                      <img
                        src={employee.photo}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-lg border-4 border-white mx-auto">
                        <span class="text-3xl font-bold text-blue-600">
                          ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
                        </span>
                      </div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-lg border-4 border-white mx-auto">
                        <span className="text-3xl font-bold text-blue-600">
                          {(employee.firstName?.charAt(0) || '')}{(employee.lastName?.charAt(0) || '')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Centered employee code */}
                  <div className="text-center mt-2 font-medium text-gray-600">
                    {employee.employeeCode}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{employee.firstName} {employee.lastName}</h2>
                  <p className="text-xl text-gray-700 mb-1">{employee.role}</p>
                  <p className="text-gray-600 mb-4">{employee.email}</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {employee.mobile1 && (
                      <span className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        <span>📱</span>
                        <span>{employee.mobile1}</span>
                      </span>
                    )}
                    {employee.joiningDate && (
                      <span className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        <span>📅</span>
                        <span>Joined {new Date(employee.joiningDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    {typeof employee.department === 'object' && employee.department?.name && (
                      <span className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        <span>🏢</span>
                        <span>{employee.department.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6 space-y-8">
              {/* Personal Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">First Name</label>
                    <div className="text-gray-900 font-medium">{employee.firstName}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Last Name</label>
                    <div className="text-gray-900 font-medium">{employee.lastName}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <div className="text-gray-900 break-words">{employee.email}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Gender</label>
                    <div className="text-gray-900">{employee.gender || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                    <div className="text-gray-900">{employee.dob ? formatDate(employee.dob) : '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Joining Date</label>
                    <div className="text-gray-900">{employee.joiningDate ? formatDate(employee.joiningDate) : '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Department</label>
                    <div className="text-gray-900">{typeof employee.department === 'object' ? employee.department?.name : employee.department || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Role</label>
                    <div className="text-gray-900">{employee.role}</div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Mobile 1</label>
                    <div className="text-gray-900">{employee.mobile1 || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Mobile 2</label>
                    <div className="text-gray-900">{employee.mobile2 || '-'}</div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Address 1</label>
                    <div className="text-gray-900">{employee.address1 || '-'}</div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Address 2</label>
                    <div className="text-gray-900">{employee.address2 || '-'}</div>
                  </div>
                </div>
              </section>

              {/* Emergency Contacts */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Emergency Contacts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Emergency Contact 1</label>
                    <div className="text-gray-900">{employee.emergencyContact1 || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Emergency Contact 2</label>
                    <div className="text-gray-900">{employee.emergencyContact2 || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Emergency Contact 3</label>
                    <div className="text-gray-900">{employee.emergencyContact3 || '-'}</div>
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Skills</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Frontend Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {employee.skillsFrontend && employee.skillsFrontend.length > 0 ? (
                        employee.skillsFrontend.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="text-gray-500">-</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Backend Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {employee.skillsBackend && employee.skillsBackend.length > 0 ? (
                        employee.skillsBackend.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="text-gray-500">-</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Banking Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Banking Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Bank Account Name</label>
                    <div className="text-gray-900">{employee.bankAccountName || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Bank Account Number</label>
                    <div className="text-gray-900 font-mono">{employee.bankAccountNo || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                    <div className="text-gray-900">{employee.bankName || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                    <div className="text-gray-900 font-mono">{employee.ifscCode || '-'}</div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Bank Address</label>
                    <div className="text-gray-900">{employee.bankAddress || '-'}</div>
                  </div>
                </div>
              </section>

              {/* Salary Details */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Salary Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Account Number</label>
                    <div className="text-gray-900 font-mono">{employee.salaryDetails?.accountNo || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                    <div className="text-gray-900">{employee.salaryDetails?.bankName || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                    <div className="text-gray-900 font-mono">{employee.salaryDetails?.ifscCode || '-'}</div>
                  </div>
                </div>
              </section>

              {/* Documents */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Aadhar Card Number</label>
                    <div className="text-gray-900 font-mono">{employee.aadharCardNumber || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Driving License Number</label>
                    <div className="text-gray-900 font-mono">{employee.drivingLicenseNumber || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">PAN Card Number</label>
                    <div className="text-gray-900 font-mono">{employee.panCardNumber || '-'}</div>
                  </div>
                </div>
              </section>

              {/* Social Media */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Social Media Profiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Facebook</label>
                    <div className="text-gray-900">
                      {employee.facebook ? (
                        <a href={employee.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                          {employee.facebook}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Twitter</label>
                    <div className="text-gray-900">
                      {employee.twitter ? (
                        <a href={employee.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                          {employee.twitter}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">LinkedIn</label>
                    <div className="text-gray-900">
                      {employee.linkedin ? (
                        <a href={employee.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                          {employee.linkedin}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Instagram</label>
                    <div className="text-gray-900">
                      {employee.instagram ? (
                        <a href={employee.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                          {employee.instagram}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-sm font-medium text-gray-600">Upwork Profile</label>
                    <div className="text-gray-900">
                      {employee.upworkProfile ? (
                        <a href={employee.upworkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                          {employee.upworkProfile}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                </div>
              </section>

              {/* File Uploads */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Uploaded Files</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Profile Photo</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      {employee.photo ? (
                        <img
                          src={employee.photo}
                          alt="Profile"
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                              No Image
                            </div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Aadhar Card File</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      {employee.aadharCardFile ? (
                        <iframe
                          src={employee.aadharCardFile}
                          className="w-full h-64 rounded-md border-0"
                          title="Aadhar Card"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                          No File
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">PAN Card File</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      {employee.panCardFile ? (
                        <iframe
                          src={employee.panCardFile}
                          className="w-full h-64 rounded-md border-0"
                          title="PAN Card"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                          No File
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Driving License File</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      {employee.drivingLicenseFile ? (
                        <iframe
                          src={employee.drivingLicenseFile}
                          className="w-full h-64 rounded-md border-0"
                          title="Driving License"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                          No File
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-600">Resume</label>
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      {employee.resume ? (
                        showResume ? (
                          <embed
                            src={employee.resume}
                            type="application/pdf"
                            width="100%"
                            height="600"
                            className="rounded-md"
                          />
                        ) : (
                          <button
                            onClick={() => setShowResume(true)}
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <span>📄</span>
                            <span>View Resume</span>
                          </button>
                        )
                      ) : (
                        <div className="text-gray-500">No File</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'Timeline' && (
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-2xl border border-gray-100 overflow-hidden mx-2 lg:mx-0">
            {/* Animated Header with Gradient */}
            <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 lg:p-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl lg:text-2xl font-bold text-white mb-1 lg:mb-2 truncate">Activity Timeline</h2>
                    <p className="text-blue-100 text-xs lg:text-sm truncate">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Mobile stats */}
                    <div className="sm:hidden flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-white text-lg font-bold">{activities.length}</div>
                        <div className="text-blue-100 text-xs">Events</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicator - Hidden on mobile */}
                {/* <div className="hidden sm:block mt-4">
          <div className="flex justify-between text-blue-100 text-xs mb-1">
            <span>Daily Progress</span>
            <span>75%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div className="bg-white h-1.5 rounded-full w-3/4 shadow-lg"></div>
          </div>
        </div> */}
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="p-6 lg:p-8 text-center">
                <div className="relative w-16 h-16 lg:w-24 lg:h-24 mx-auto mb-4 lg:mb-6">
                  {/* Animated Orb */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 lg:inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Ready to Start Your Day?</h3>
                <p className="text-gray-500 text-sm lg:text-base mb-4 lg:mb-6 px-4">Log your first activity to begin tracking</p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm lg:text-base w-full sm:w-auto">
                  Start Tracking
                </button>
              </div>
            ) : (
              <div className="p-4 lg:p-6">
                {/* Interactive Timeline */}
                <div className="relative">
                  {/* Central Timeline - Hidden on mobile */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 rounded-full"></div>

                  <div className="space-y-6 lg:space-y-8">
                    {activities.map((activity, index) => {
                      const isEven = index % 2 === 0;
                      const typeConfig = {
                        'punch-in': {
                          gradient: 'from-green-400 to-emerald-500',
                          icon: (
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ),
                          label: 'Punch In',
                          color: 'green'
                        },
                        'punch-out': {
                          gradient: 'from-red-400 to-rose-500',
                          icon: (
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ),
                          label: 'Punch Out',
                          color: 'red'
                        },
                        'break-start': {
                          gradient: 'from-amber-400 to-yellow-500',
                          icon: (
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                            </svg>
                          ),
                          label: 'Break Start',
                          color: 'amber'
                        },
                        'break-end': {
                          gradient: 'from-blue-400 to-indigo-500',
                          icon: (
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          ),
                          label: 'Break End',
                          color: 'blue'
                        }
                      }[activity.type];

                      return (
                        <div key={activity.id} className={`
                  relative group
                  md:flex md:items-center 
                  ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}
                `}>
                          {/* Content Card */}
                          <div className={`
                    w-full md:w-5/12 
                    ${isEven ? 'md:pr-4 lg:pr-8' : 'md:pl-4 lg:pl-8'}
                    mb-4 md:mb-0
                  `}>
                            <div className={`
                      bg-white rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-lg border border-gray-100 
                      transform hover:scale-105 hover:shadow-2xl transition-all duration-300
                      group-hover:border-${typeConfig.color}-200 group-hover:ring-2 group-hover:ring-${typeConfig.color}-100
                      w-full
                    `}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`bg-gradient-to-r ${typeConfig.gradient} text-white text-xs font-semibold px-2 lg:px-3 py-1 rounded-full shadow-sm whitespace-nowrap`}>
                                    {typeConfig.label}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                                    {formatDate(activity.date)}
                                  </span>
                                </div>
                                <div className={`w-2 h-2 bg-${typeConfig.color}-400 rounded-full ${index === 0 ? 'animate-ping' : ''} flex-shrink-0 ml-2`}></div>
                              </div>

                              <h3 className="text-gray-900 font-semibold text-base lg:text-lg mb-2 line-clamp-2">
                                {activity.description}
                              </h3>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                                  </svg>
                                  <span className="font-mono font-bold text-sm lg:text-base">
                                    {new Date(activity.time).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {activity.duration && (
                                  <span className="text-xs lg:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded self-start sm:self-auto">
                                    {activity.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Central Timeline Dot */}
                          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-20">
                            <div className={`relative bg-gradient-to-r ${typeConfig.gradient} w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white group-hover:scale-125 transition-transform duration-300`}>
                              {typeConfig.icon}
                              {/* Glow Effect */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r opacity-75 animate-ping"></div>
                            </div>
                          </div>

                          {/* Mobile Timeline Dot */}
                          <div className="md:hidden flex items-center justify-center my-4">
                            <div className={`relative bg-gradient-to-r ${typeConfig.gradient} w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                              {typeConfig.icon}
                            </div>
                          </div>

                          {/* Time Label */}
                          <div className={`
                    w-full md:w-5/12 
                    ${isEven ? 'md:pl-4 lg:pl-8 md:text-left' : 'md:pr-4 lg:pr-8 md:text-right'}
                    text-center md:text-inherit
                  `}>
                            {/* <div className="text-gray-400 text-xs lg:text-sm font-mono bg-gray-50 inline-block px-3 py-2 rounded-lg">
                      {new Date(activity.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary Stats */}
                {/* <div className="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-blue-200">
            <div className="text-lg lg:text-2xl font-bold text-blue-600">8.2h</div>
            <div className="text-blue-500 text-xs lg:text-sm">Total Time</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-green-200">
            <div className="text-lg lg:text-2xl font-bold text-green-600">2</div>
            <div className="text-green-500 text-xs lg:text-sm">Breaks</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-purple-200">
            <div className="text-lg lg:text-2xl font-bold text-purple-600">94%</div>
            <div className="text-purple-500 text-xs lg:text-sm">Efficiency</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-amber-200">
            <div className="text-lg lg:text-2xl font-bold text-amber-600">4</div>
            <div className="text-amber-500 text-xs lg:text-sm">Activities</div>
          </div>
        </div> */}

                {/* Quick Actions */}
                {/* <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm lg:text-base">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Punch In</span>
          </button>
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm lg:text-base">
            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Activity</span>
          </button>
        </div> */}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ProfileCalendar
              events={[]}
              userRole={currentRole || undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}