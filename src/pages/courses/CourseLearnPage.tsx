import React, { useState, useEffect, useRef } from 'react';
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

interface CourseProgress {
  progress: number;
  watchedTime: number;
  totalDuration: number;
  completed: boolean;
  lastWatchedAt: string | null;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

export default function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CourseProgress>({
    progress: 0,
    watchedTime: 0,
    totalDuration: 0,
    completed: false,
    lastWatchedAt: null
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);

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
      fetchProgress();
      fetchUser();
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

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const updateProgress = async (watchedTime: number, totalDuration: number) => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ watchedTime, totalDuration })
      });

      if (response.ok) {
        const data = await response.json();
        const newProgress = data.progress;
        setProgress(newProgress);

        // Check if just completed
        if (newProgress.completed && !progress.completed) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000); // Hide after 5 seconds
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;

      // Save progress every 5 seconds or when significant change
      if (Math.abs(currentTime - lastSavedTime) >= 5) {
        updateProgress(currentTime, duration);
        setLastSavedTime(currentTime);
      }

      // Update local progress state for real-time UI
      const currentProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
      setProgress(prev => ({
        ...prev,
        progress: Math.max(prev.progress, currentProgress),
        watchedTime: Math.max(prev.watchedTime, currentTime),
        totalDuration: duration
      }));
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setProgress(prev => ({
        ...prev,
        totalDuration: duration
      }));

      // Resume from last watched position if available
      if (progress.watchedTime > 0 && progress.watchedTime < duration) {
        videoRef.current.currentTime = progress.watchedTime;
      }
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
              ref={videoRef}
              controls
              className="w-full aspect-video rounded-lg"
              poster={course.thumbnailImage ? getUrl(course.thumbnailImage) : undefined}
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onEnded={() => {
                if (videoRef.current) {
                  const duration = videoRef.current.duration;
                  updateProgress(duration, duration);
                }
              }}
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
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.progress}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Watched: {Math.floor(progress.watchedTime / 60)}:{Math.floor(progress.watchedTime % 60).toString().padStart(2, '0')}</span>
              <span>Total: {Math.floor(progress.totalDuration / 60)}:{Math.floor(progress.totalDuration % 60).toString().padStart(2, '0')}</span>
            </div>
            {progress.completed && (
              <div className="text-center py-2">
                <span className="text-green-600 font-medium">✓ Course Completed!</span>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Your progress is automatically saved as you watch the video.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4 animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            {user && (
              <div className="flex items-center justify-center mb-4">
                <Avatar className="h-16 w-16 mr-4">
                  {user.photo ? (
                    <AvatarImage src={getUrl(user.photo)} alt={`${user.firstName} ${user.lastName}`} />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-600">Employee</p>
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
            <p className="text-gray-700 mb-4">You have completed this course!</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Keep learning and growing!</p>
          </div>
        </div>
      )}
    </div>
  );
}