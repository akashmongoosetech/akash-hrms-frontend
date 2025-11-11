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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-8">Loading employee...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-8 text-red-600">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Employee Details</h1>
        <button
          onClick={() => navigate(`/employees/edit/${employee._id}`)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Employee Profile Header */}
        <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            {employee.photo ? (
              <img
                src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${employee.photo}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-2xl font-bold text-gray-600">
                        ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
                      </span>
                    </div>`;
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {(employee.firstName?.charAt(0) || '')}{(employee.lastName?.charAt(0) || '')}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h2>
            <p className="text-lg text-gray-600">{employee.role}</p>
            <p className="text-sm text-gray-500">{employee.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              {employee.mobile1 && (
                <span className="text-sm text-gray-600">
                  📱 {employee.mobile1}
                </span>
              )}
              {employee.joiningDate && (
                <span className="text-sm text-gray-600">
                  📅 Joined {new Date(employee.joiningDate).toLocaleDateString()}
                </span>
              )}
              {typeof employee.department === 'object' && employee.department?.name && (
                <span className="text-sm text-gray-600">
                  🏢 {employee.department.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <div className="text-gray-900">{employee.firstName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <div className="text-gray-900">{employee.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="text-gray-900">{employee.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="text-gray-900">{employee.gender || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="text-gray-900">{employee.dob ? formatDate(employee.dob) : '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <div className="text-gray-900">{employee.joiningDate ? formatDate(employee.joiningDate) : '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="text-gray-900">{typeof employee.department === 'object' ? employee.department?.name : employee.department || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="text-gray-900">{employee.role}</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile 1</label>
                <div className="text-gray-900">{employee.mobile1 || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile 2</label>
                <div className="text-gray-900">{employee.mobile2 || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address 1</label>
                <div className="text-gray-900">{employee.address1 || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                <div className="text-gray-900">{employee.address2 || '-'}</div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 1</label>
                <div className="text-gray-900">{employee.emergencyContact1 || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 2</label>
                <div className="text-gray-900">{employee.emergencyContact2 || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 3</label>
                <div className="text-gray-900">{employee.emergencyContact3 || '-'}</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frontend Skills</label>
                <div className="space-y-2">
                  {employee.skillsFrontend && employee.skillsFrontend.length > 0 ? (
                    employee.skillsFrontend.map((skill, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-gray-100 rounded mr-2 mb-2">{skill}</span>
                    ))
                  ) : (
                    <div className="text-gray-500">-</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backend Skills</label>
                <div className="space-y-2">
                  {employee.skillsBackend && employee.skillsBackend.length > 0 ? (
                    employee.skillsBackend.map((skill, index) => (
                      <span key={index} className="inline-block px-3 py-1 bg-gray-100 rounded mr-2 mb-2">{skill}</span>
                    ))
                  ) : (
                    <div className="text-gray-500">-</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Name</label>
                <div className="text-gray-900">{employee.bankAccountName || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                <div className="text-gray-900">{employee.bankAccountNo || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div className="text-gray-900">{employee.bankName || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <div className="text-gray-900">{employee.ifscCode || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Address</label>
                <div className="text-gray-900">{employee.bankAddress || '-'}</div>
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <div className="text-gray-900">{employee.salaryDetails?.accountNo || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div className="text-gray-900">{employee.salaryDetails?.bankName || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <div className="text-gray-900">{employee.salaryDetails?.ifscCode || '-'}</div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Number</label>
                <div className="text-gray-900">{employee.aadharCardNumber || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                <div className="text-gray-900">{employee.drivingLicenseNumber || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number</label>
                <div className="text-gray-900">{employee.panCardNumber || '-'}</div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <div className="text-gray-900">{employee.facebook ? <a href={employee.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.facebook}</a> : '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <div className="text-gray-900">{employee.twitter ? <a href={employee.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.twitter}</a> : '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <div className="text-gray-900">{employee.linkedin ? <a href={employee.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.linkedin}</a> : '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <div className="text-gray-900">{employee.instagram ? <a href={employee.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.instagram}</a> : '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upwork Profile</label>
                <div className="text-gray-900">{employee.upworkProfile ? <a href={employee.upworkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.upworkProfile}</a> : '-'}</div>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="text-gray-900">
                  {employee.photo ? (
                    <embed src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employee.photo.replace(/^uploads\//, '')}`} width="100%" height="200" />
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card File</label>
                <div className="text-gray-900">
                  {employee.aadharCardFile ? (
                    <embed src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employee.aadharCardFile.replace(/^uploads\//, '')}`} width="100%" height="200" />
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card File</label>
                <div className="text-gray-900">
                  {employee.panCardFile ? (
                    <embed src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employee.panCardFile.replace(/^uploads\//, '')}`} width="100%" height="200" />
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving License File</label>
                <div className="text-gray-900">
                  {employee.drivingLicenseFile ? (
                    <embed src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employee.drivingLicenseFile.replace(/^uploads\//, '')}`} width="100%" height="200" />
                  ) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                <div className="text-gray-900">
                  {employee.resume ? (
                    <embed src={`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/${employee.resume.replace(/^uploads\//, '')}`} width="100%" height="200" />
                  ) : '-'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}