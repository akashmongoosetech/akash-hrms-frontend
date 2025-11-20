import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import TextCKeditor from '../../components/common/TextCKeditor';
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

interface CourseNote {
  _id: string;
  content: string;
  createdAt: string;
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
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [newNote, setNewNote] = useState('');

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
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}/notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
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

  // helper for circular progress UI
  const circleRadius = 36;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressOffset = circleCircumference - (Math.min(Math.max(progress.progress, 0), 100) / 100) * circleCircumference;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={() => navigate('/learn')} className="px-3 py-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{course.title}</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">{course.categoryDetails?.name || course.category} • {course.duration}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Created</p>
            <p className="text-sm font-medium">{course.createdAt ? formatDate(course.createdAt) : '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main video area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl overflow-hidden">
            <CardContent className="p-0 bg-gradient-to-b from-white to-slate-50">
              {course.courseVideo ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-t-lg bg-black max-h-[65vh]"
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

                  {/* subtle overlay info */}
                  <div className="absolute left-4 bottom-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center text-xs shadow">
                    <Clock className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="text-gray-700">{course.duration}</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No video available for this course.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>About this course</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              {/* Add new note */}
              <div className="space-y-2">
                <TextCKeditor
                  data={newNote}
                  onChange={setNewNote}
                  config={{
                    extraPlugins: [function(editor) {
                      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                        return {
                          upload: () => {
                            return loader.file.then(file => new Promise((resolve, reject) => {
                              const formData = new FormData();
                              formData.append('upload', file);

                              const token = localStorage.getItem('token');
                              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                              fetch(`${apiUrl}/uploads/image`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formData
                              })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                              })
                              .then(result => {
                                if (result.url) {
                                  resolve({ default: result.url });
                                } else {
                                  reject(result.error || 'Upload failed');
                                }
                              })
                              .catch(error => {
                                reject(error.message || error);
                              });
                            }));
                          },
                          abort: () => {}
                        };
                      };
                    }],
                    toolbar: [
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "numberedList",
                      "bulletedList",
                      "|",
                      "link",
                      "blockQuote",
                      "|",
                      "insertTable",
                      "|",
                      "undo",
                      "redo",
                      "|",
                      "imageUpload",
                    ],
                    table: {
                      contentToolbar: [
                        "tableColumn",
                        "tableRow",
                        "mergeTableCells",
                      ],
                    },
                    image: {
                      toolbar: [
                        'imageTextAlternative',
                        '|',
                        'imageStyle:alignLeft',
                        'imageStyle:full',
                        'imageStyle:alignRight'
                      ],
                    },
                  }}
                />
                <Button
                  onClick={async () => {
                    if (!newNote.trim()) return;
                    try {
                      const response = await fetch(`${API_URL}/courses/${id}/notes`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ content: newNote.trim() })
                      });

                      if (response.ok) {
                        const data = await response.json();
                        setNotes(data.notes.notes);
                        setNewNote('');
                      }
                    } catch (err) {
                      console.error('Error adding note:', err);
                    }
                  }}
                  disabled={!newNote.trim()}
                  className="w-full"
                >
                  Add Note
                </Button>
              </div>

              {/* Display existing notes */}
              {notes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Your Notes ({notes.length})</h4>
                  {notes.map((note) => (
                    <div key={note._id} className="border rounded-lg p-3 bg-gray-50">
                      <div
                        className="text-sm text-gray-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* mobile creator & meta (visible on small screens) */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm"><Clock className="h-4 w-4 mr-2 text-gray-500" /> <span>{course.duration}</span></div>
                <div className="text-sm">Category: <span className="font-medium">{course.categoryDetails?.name || course.category}</span></div>
                <div className="text-sm">Status: <span className={`ml-2 px-2 py-1 rounded text-sm ${course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{course.status}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="sticky top-6">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="relative inline-block">
                  <svg width="90" height="90" className="block">
                    <circle cx="45" cy="45" r={circleRadius} strokeWidth="8" stroke="#e6e7ef" fill="none" />
                    <circle
                      cx="45"
                      cy="45"
                      r={circleRadius}
                      strokeWidth="8"
                      strokeDasharray={`${circleCircumference} ${circleCircumference}`}
                      strokeDashoffset={progressOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 45 45)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      fill="none"
                    />
                    <text x="45" y="50" textAnchor="middle" fontSize="16" fontWeight={700} fill="#111827">{Math.round(progress.progress)}%</text>
                  </svg>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-500">Watched</div>
                <div className="text-sm font-medium">{Math.floor(progress.watchedTime / 60)}:{Math.floor(progress.watchedTime % 60).toString().padStart(2, '0')}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-sm font-medium">{Math.floor(progress.totalDuration / 60)}:{Math.floor(progress.totalDuration % 60).toString().padStart(2, '0')}</div>
              </div>

              <div className="flex flex-col gap-3">
                {progress.completed ? (
                  <Button className="bg-green-600 hover:bg-green-700">Completed</Button>
                ) : (
                  <Button onClick={() => { if (videoRef.current) videoRef.current.play(); }} className="bg-blue-600 hover:bg-blue-700">Resume</Button>
                )}

                {progress.completed && (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${API_URL}/courses/${id}/certificate`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        });

                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `Certificate_${course?.title.replace(/\s+/g, '_') || 'Course'}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } else {
                          console.error('Failed to download certificate');
                        }
                      } catch (error) {
                        console.error('Error downloading certificate:', error);
                      }
                    }}
                    className="bg-white border border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Download Certificate
                  </Button>
                )}
              </div>
            </Card>

            <Card className="mt-4 p-4">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Category</span><span className="font-medium">{course.categoryDetails?.name || course.category}</span></div>
                <div className="flex justify-between"><span>Status</span><span className={`font-medium ${course.status === 'Published' ? 'text-green-600' : 'text-yellow-600'}`}>{course.status}</span></div>
                {course.createdAt && <div className="flex justify-between"><span>Created</span><span className="font-medium">{formatDate(course.createdAt)}</span></div>}
              </CardContent>
            </Card>

            {course.createdByDetails && (
              <Card className="mt-4 p-4">
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      {course.createdByDetails.photo ? (
                        <AvatarImage src={getUrl(course.createdByDetails.photo)} alt={`${course.createdByDetails.firstName} ${course.createdByDetails.lastName}`} />
                      ) : null}
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{course.createdByDetails.firstName} {course.createdByDetails.lastName}</div>
                      <div className="text-sm text-gray-500">{course.createdByDetails.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* small note */}
            <div className="mt-4 text-xs text-gray-400">Progress is saved automatically while you watch. Make sure to stay connected to save your progress.</div>
          </div>
        </aside>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 text-center max-w-lg mx-4 shadow-2xl transform transition-all">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
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
                  <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">Employee</p>
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
            <p className="text-gray-700 mb-4">You have completed this course!</p>
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowCelebration(false)} className="bg-slate-100 text-slate-700">Close</Button>
              <Button onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/courses/${id}/certificate`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });

                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Certificate_${course?.title.replace(/\s+/g, '_') || 'Course'}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  } else {
                    console.error('Failed to download certificate');
                  }
                } catch (error) {
                  console.error('Error downloading certificate:', error);
                }
              }} className="bg-green-600 hover:bg-green-700">Download Certificate</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
