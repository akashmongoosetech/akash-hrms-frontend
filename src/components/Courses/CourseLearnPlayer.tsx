import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  status: 'Published' | 'Draft';
  category: string;
  categoryDetails?: { _id: string; name: string };
  createdBy: string;
  createdByDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  courseVideo?: string;
  thumbnailImage?: string;
  createdAt?: string;
}

interface CourseLearnPlayerProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseLearnPlayer({ course, isOpen, onClose }: CourseLearnPlayerProps) {
  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  // Utility to get video URL
  const getVideoUrl = (path?: string) => {
    if (!path) return '';

    let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, ''); // normalize path

    // If it already includes full URL, return as is
    if (cleanPath.startsWith('http')) return cleanPath;

    // If path starts with 'uploads/', use it directly, else prepend 'uploads/'
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `${API_URL}/${cleanPath}`;
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{course.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{course.description}</p>

          {course.courseVideo ? (
            <div className="aspect-video">
              <video
                controls
                className="w-full h-full rounded-lg"
                poster={course.thumbnailImage ? getVideoUrl(course.thumbnailImage) : undefined}
              >
                <source src={getVideoUrl(course.courseVideo)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No video available for this course.</span>
            </div>
          )}

          {/* Additional implementations can be added here */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Course Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Duration:</span> {course.duration}
              </div>
              <div>
                <span className="font-medium">Category:</span> {course.categoryDetails?.name || course.category}
              </div>
              <div>
                <span className="font-medium">Created by:</span>{' '}
                {course.createdByDetails
                  ? `${course.createdByDetails.firstName} ${course.createdByDetails.lastName}`
                  : 'Unknown'
                }
              </div>
              <div>
                <span className="font-medium">Status:</span> {course.status}
              </div>
            </div>
          </div>

          {/* Placeholder for more implementations like progress tracking, notes, etc. */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Learning Progress</h4>
            <p className="text-sm text-gray-600">Track your progress here. (Implementation pending)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}