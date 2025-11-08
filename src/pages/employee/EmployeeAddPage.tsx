import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

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
  salary?: number;
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
  status?: string;
  department?: string;
}

interface Department {
  _id: string;
  name: string;
  head: string;
}

export default function EmployeeAddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dob: '',
    joiningDate: '',
    mobile1: '',
    mobile2: '',
    password: '',
    address1: '',
    address2: '',
    emergencyContact1: '',
    emergencyContact2: '',
    emergencyContact3: '',
    skillsFrontend: [] as string[],
    skillsBackend: [] as string[],
    bankAccountName: '',
    bankAccountNo: '',
    bankName: '',
    ifscCode: '',
    bankAddress: '',
    salary: '',
    salaryDetails: {
      accountNo: '',
      bankName: '',
      ifscCode: ''
    },
    aadharCardNumber: '',
    drivingLicenseNumber: '',
    panCardNumber: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    upworkProfile: '',
    role: 'Employee',
    status: 'Active',
    department: ''
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/departments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        } else {
          toast.error('Invalid departments data received');
          setDepartments([]);
        }
      } else {
        toast.error('Failed to fetch departments');
        setDepartments([]);
      }
    } catch (err) {
      toast.error('Error fetching departments');
      setDepartments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (key === 'department' && value === '') return; // Skip empty department to avoid ObjectId cast error
        if (key === 'skillsFrontend' || key === 'skillsBackend') {
          submitData.append(key, JSON.stringify(value));
        } else if (key === 'salaryDetails') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value as string);
        }
      });

      // Add files
      if (profileFile) submitData.append('photo', profileFile);
      if (aadharFile) submitData.append('aadharCardFile', aadharFile);
      if (panFile) submitData.append('panCardFile', panFile);
      if (drivingLicenseFile) submitData.append('drivingLicenseFile', drivingLicenseFile);
      if (resumeFile) submitData.append('resume', resumeFile);

      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success('Employee created successfully');
        navigate('/employees');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create employee');
      }
    } catch (err) {
      toast.error('Error creating employee');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (type: 'frontend' | 'backend', skills: string[]) => {
    if (type === 'frontend') {
      setFormData({ ...formData, skillsFrontend: skills });
    } else {
      setFormData({ ...formData, skillsBackend: skills });
    }
  };

  const addSkill = (type: 'frontend' | 'backend') => {
    const skill = type === 'frontend' ? prompt('Enter frontend skill:') : prompt('Enter backend skill:');
    if (skill && skill.trim()) {
      const currentSkills = type === 'frontend' ? formData.skillsFrontend : formData.skillsBackend;
      if (!currentSkills.includes(skill.trim())) {
        handleSkillChange(type, [...currentSkills, skill.trim()]);
      }
    }
  };

  const removeSkill = (type: 'frontend' | 'backend', skillToRemove: string) => {
    const currentSkills = type === 'frontend' ? formData.skillsFrontend : formData.skillsBackend;
    handleSkillChange(type, currentSkills.filter(skill => skill !== skillToRemove));
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile 1</label>
                <input
                  type="text"
                  value={formData.mobile1}
                  onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile 2</label>
                <input
                  type="text"
                  value={formData.mobile2}
                  onChange={(e) => setFormData({ ...formData, mobile2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address 1</label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 1</label>
                <input
                  type="text"
                  value={formData.emergencyContact1}
                  onChange={(e) => setFormData({ ...formData, emergencyContact1: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 2</label>
                <input
                  type="text"
                  value={formData.emergencyContact2}
                  onChange={(e) => setFormData({ ...formData, emergencyContact2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact 3</label>
                <input
                  type="text"
                  value={formData.emergencyContact3}
                  onChange={(e) => setFormData({ ...formData, emergencyContact3: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  {formData.skillsFrontend.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill('frontend', skill)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSkill('frontend')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Frontend Skill
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backend Skills</label>
                <div className="space-y-2">
                  {formData.skillsBackend.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill('backend', skill)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSkill('backend')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Backend Skill
                  </button>
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
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNo}
                  onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Address</label>
                <input
                  type="text"
                  value={formData.bankAddress}
                  onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Salary (per month)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter salary amount"
                />
              </div>
            </div>
          </div>

          {/* Salary Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.salaryDetails.accountNo}
                  onChange={(e) => setFormData({
                    ...formData,
                    salaryDetails: { ...formData.salaryDetails, accountNo: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.salaryDetails.bankName}
                  onChange={(e) => setFormData({
                    ...formData,
                    salaryDetails: { ...formData.salaryDetails, bankName: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={formData.salaryDetails.ifscCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    salaryDetails: { ...formData.salaryDetails, ifscCode: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card Number</label>
                <input
                  type="text"
                  value={formData.aadharCardNumber}
                  onChange={(e) => setFormData({ ...formData, aadharCardNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving License Number</label>
                <input
                  type="text"
                  value={formData.drivingLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number</label>
                <input
                  type="text"
                  value={formData.panCardNumber}
                  onChange={(e) => setFormData({ ...formData, panCardNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Profiles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upwork Profile</label>
                <input
                  type="url"
                  value={formData.upworkProfile}
                  onChange={(e) => setFormData({ ...formData, upworkProfile: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Card File</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card File</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving License File</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDrivingLicenseFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Role & Password */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role & Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Create Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}