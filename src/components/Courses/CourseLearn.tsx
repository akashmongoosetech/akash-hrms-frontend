import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Clock, User } from 'lucide-react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  status: 'Published' | 'Draft';
  category: string;
  categoryDetails?: { _id: string; name: string };
  createdBy: string;
  createdByDetails?: Employee;
  courseVideo?: string;
  thumbnailImage?: string;
  createdAt?: string;
}

export default function CourseLearn() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  // Utility to get image URL
  const getImageUrl = (path?: string) => {
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/courses?status=Published`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        console.error('Failed to fetch courses');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-6">Learn Courses</h1> */}

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Explore Courses</h2>
            <p className="text-gray-600">Grow your skills with high-quality learning content.</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course._id}
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white flex flex-col"
              >
                {/* Thumbnail */}
                <CardHeader className="p-0">
                  {course.thumbnailImage ? (
                    <img
                      src={course.thumbnailImage}
                      alt={course.title}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </CardHeader>

                {/* Content */}
                <CardContent className="p-5 flex flex-col flex-grow">
                  <CardTitle className="text-xl font-semibold mb-3 line-clamp-2">
                    {course.title}
                  </CardTitle>

                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <Avatar className="h-9 w-9 mr-3">
                      {course.createdByDetails?.photo ? (
                        <AvatarImage
                          src={getImageUrl(course.createdByDetails.photo)}
                          alt={`${course.createdByDetails.firstName} ${course.createdByDetails.lastName}`}
                        />
                      ) : null}
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.createdByDetails
                          ? `${course.createdByDetails.firstName} ${course.createdByDetails.lastName}`
                          : "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {course.createdByDetails?.email}
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => navigate(`/learn/${course._id}`)}
                    className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all"
                  >
                    Learn
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}