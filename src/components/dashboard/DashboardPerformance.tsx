import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, TrendingUp } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';
import { BaseSkeleton } from '../ui/skeleton';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Reviewer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Appraisal {
  _id: string;
  employee: Employee;
  reviewer: Reviewer;
  period: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    title: string;
    description: string;
    status: string;
    targetDate: string;
    progress: number;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string;
  comments: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPerformance() {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setLoading(true);
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');

      let url = `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/appraisals?limit=6`;

      // If user is Employee, only show their own appraisals
      if (role === 'Employee' && userId) {
        url += `&employeeId=${userId}`;
      }
      // Admin and SuperAdmin see all appraisals (no additional filter needed)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppraisals(data.appraisals || []);
      } else {
        setError('Failed to fetch appraisals');
      }
    } catch (err) {
      console.error('Error fetching appraisals:', err);
      setError('Error fetching appraisals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-100';
      case 'Rejected':
        return 'text-red-600 bg-red-100';
      case 'Under Review':
        return 'text-blue-600 bg-blue-100';
      case 'Submitted':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <BaseSkeleton className="h-6 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <BaseSkeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <BaseSkeleton className="h-4 w-24 mb-1" />
                  <BaseSkeleton className="h-3 w-32" />
                </div>
              </div>
              <BaseSkeleton className="h-4 w-16 mb-2" />
              <BaseSkeleton className="h-5 w-20 mb-2" />
              <BaseSkeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Employee Performance Overview</h1>
        <TrendingUp className="h-5 w-5 text-gray-500" />
      </div>

      {appraisals.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No performance appraisals found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appraisals.map((appraisal) => (
            <div
              key={appraisal._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Employee Info */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {appraisal.employee.photo ? (
                    <img
                      src={appraisal.employee.photo.startsWith('http') ? appraisal.employee.photo : `${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/uploads/${appraisal.employee.photo}`}
                      alt={`${appraisal.employee.firstName} ${appraisal.employee.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {appraisal.employee.firstName} {appraisal.employee.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {appraisal.employee.email}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-2">
                {renderStars(appraisal.overallRating)}
              </div>

              {/* Period */}
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {formatDate(appraisal.period.startDate)} - {formatDate(appraisal.period.endDate)}
                </span>
              </div>

              {/* Reviewer */}
              <div className="text-xs text-gray-500 mb-2">
                Reviewer: {appraisal.reviewer.firstName} {appraisal.reviewer.lastName}
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                  {appraisal.status}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(appraisal.updatedAt)}
                </span>
              </div>

              {/* Goals Progress */}
              {appraisal.goals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-1">
                    Goals: {appraisal.goals.filter(g => g.status === 'Completed').length}/{appraisal.goals.length} completed
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${appraisal.goals.length > 0 ? (appraisal.goals.filter(g => g.status === 'Completed').length / appraisal.goals.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}