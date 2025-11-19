import React from 'react';
import { formatDate } from '../../Common/Commonfunction';

interface Category {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  duration: string; // in hours/minutes format
  status: 'Published' | 'Draft';
  category: string; // category ID
  categoryDetails?: Category;
  createdBy: string; // employee ID
  createdByDetails?: Employee;
  courseVideo?: string; // file URL or path
  thumbnailImage?: string; // file URL or path
  createdAt?: string;
}

interface CourseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Published':
      return 'bg-green-100 text-green-800';
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CourseViewModal({ isOpen, onClose, course }: CourseViewModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">View Course</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <p className="mt-1 text-sm text-gray-900">{course.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="mt-1 text-sm text-gray-900">{course.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <p className="mt-1 text-sm text-gray-900">{course.duration}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
              {course.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <p className="mt-1 text-sm text-gray-900">{course.categoryDetails?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created By</label>
            <p className="mt-1 text-sm text-gray-900">{course.createdByDetails ? `${course.createdByDetails.firstName} ${course.createdByDetails.lastName}` : 'N/A'}</p>
          </div>
          {course.thumbnailImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <img src={course.thumbnailImage} alt="Thumbnail" className="mt-1 max-w-full h-auto rounded" />
            </div>
          )}
          {course.courseVideo && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Video</label>
              <video controls className="mt-1 max-w-full rounded">
                <source src={course.courseVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {course.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(course.createdAt)}</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
}