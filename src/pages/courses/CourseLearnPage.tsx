import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Clock, User, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';

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

export default function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

  // Utility to get URL
  const getUrl = (path?: string) => {
    if (!path) return '';

    let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

    if (cleanPath.startsWith('http')) return cleanPath;

    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    return `${API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch course');
      }
    } catch (err) {
      setError('Error fetching course');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <Button onClick={() => navigate('/learn')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button onClick={() => navigate('/learn')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 text-lg">{course.description}</p>
      </div>

      {/* Video Player */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {course.courseVideo ? (
            <video
              controls
              className="w-full aspect-video rounded-lg"
              poster={course.thumbnailImage ? getUrl(course.thumbnailImage) : undefined}
            >
              <source src={getUrl(course.courseVideo)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No video available for this course.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{course.duration}</span>
            </div>

            <div>
              <span className="font-medium">Category:</span>
              <span className="ml-2">{course.categoryDetails?.name || course.category}</span>
            </div>

            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {course.status}
              </span>
            </div>

            {course.createdAt && (
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{formatDate(course.createdAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Created By</CardTitle>
          </CardHeader>
          <CardContent>
            {course.createdByDetails ? (
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  {course.createdByDetails.photo ? (
                    <AvatarImage
                      src={getUrl(course.createdByDetails.photo)}
                      alt={`${course.createdByDetails.firstName} ${course.createdByDetails.lastName}`}
                    />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {course.createdByDetails.firstName} {course.createdByDetails.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{course.createdByDetails.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unknown creator</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Track your learning progress here. Additional features like notes, quizzes, and completion tracking can be implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}