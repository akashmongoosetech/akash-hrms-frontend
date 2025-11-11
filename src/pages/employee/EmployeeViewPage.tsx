import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../Common/Commonfunction';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  photo?: string;
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
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
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
    }
  }, [id, currentRole, currentUserId, navigate]);

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

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Employee Profile Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                {employee.photo ? (
                  <img
                    src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${employee.photo}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-lg border-4 border-white">
                          <span class="text-3xl font-bold text-blue-600">
                            ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
                          </span>
                        </div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-3xl font-bold text-blue-600">
                      {(employee.firstName?.charAt(0) || '')}{(employee.lastName?.charAt(0) || '')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{employee.firstName} {employee.lastName}</h2>
                <p className="text-xl text-gray-700 mb-1">{employee.role}</p>
                <p className="text-gray-600 mb-4">{employee.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${employee.photo}`}
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
                      <embed 
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/uploads/${employee.aadharCardFile.replace(/^uploads\//, '')}`} 
                        className="w-full h-32 rounded-md"
                        type="application/pdf"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                        No File
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600">PAN Card File</label>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    {employee.panCardFile ? (
                      <embed 
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/uploads/${employee.panCardFile.replace(/^uploads\//, '')}`} 
                        className="w-full h-32 rounded-md"
                        type="application/pdf"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                        No File
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600">Driving License File</label>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    {employee.drivingLicenseFile ? (
                      <embed 
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/uploads/${employee.drivingLicenseFile.replace(/^uploads\//, '')}`} 
                        className="w-full h-32 rounded-md"
                        type="application/pdf"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                        No File
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600">Resume</label>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    {employee.resume ? (
                      <embed 
                        src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/uploads/${employee.resume.replace(/^uploads\//, '')}`} 
                        className="w-full h-32 rounded-md"
                        type="application/pdf"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                        No File
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}