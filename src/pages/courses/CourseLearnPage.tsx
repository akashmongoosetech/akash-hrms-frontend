import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import TextCKeditor from '../../components/common/TextCKeditor';
import { Clock, User, ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react';
import { formatDate } from '../../Common/Commonfunction';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoFile: string;
  duration?: number;
  order: number;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  videos: Video[];
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
  createdByDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  thumbnailImage?: string;
  modules: Module[];
  createdAt?: string;
}

interface CourseProgress {
  progress: number;
  watchedTime: number;
  totalDuration: number;
  completed: boolean;
  lastWatchedAt: string | null;
  videoProgress?: any[];
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
    lastWatchedAt: null,
    videoProgress: []
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false); // Track if celebration was already shown
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // New state for modules and videos
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoProgressMap, setVideoProgressMap] = useState<Map<string, any>>(new Map());

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

  useEffect(() => {
    if (course && course.modules.length > 0) {
      // Initialize current module and video if not set
      if (currentModuleIndex >= course.modules.length) {
        setCurrentModuleIndex(0);
        setCurrentVideoIndex(0);
      } else if (currentVideoIndex >= course.modules[currentModuleIndex].videos.length) {
        setCurrentVideoIndex(0);
      }
    }
  }, [course, currentModuleIndex, currentVideoIndex]);

  // Watch for course completion to show celebration (only once)
  useEffect(() => {
    if (progress.completed && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    } else if (!progress.completed && celebrationShown) {
      // Reset celebration flag if course becomes incomplete
      setCelebrationShown(false);
    }
  }, [progress.completed, celebrationShown]);

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

  const handleEditNote = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditingContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingContent.trim()) return;

    try {
      const response = await fetch(`${API_URL}/courses/${id}/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: editingContent.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes.notes);
        setEditingNoteId(null);
        setEditingContent('');
      }
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const openDeleteModal = (noteId: string) => {
    setDeleteNoteId(noteId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteNoteId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteNote = async () => {
    if (!deleteNoteId) return;

    try {
      const response = await fetch(`${API_URL}/courses/${id}/notes/${deleteNoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes.notes);
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
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

        // Update video progress map
        const progressMap = new Map();
        if (data.videoProgress) {
          data.videoProgress.forEach((vp: any) => {
            const key = `${vp.moduleId}_${vp.videoId}`;
            progressMap.set(key, vp);
          });
        }
        setVideoProgressMap(progressMap);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const getCurrentVideo = () => {
    if (!course || !course.modules[currentModuleIndex]) return null;
    return course.modules[currentModuleIndex].videos[currentVideoIndex] || null;
  };

  const getCurrentVideoProgress = () => {
    const currentVideo = getCurrentVideo();
    if (!currentVideo) return null;
    const key = `${course?.modules[currentModuleIndex]._id}_${currentVideo._id}`;
    return videoProgressMap.get(key) || null;
  };

  const updateVideoProgress = async (watchedTime: number, totalDuration: number) => {
    const currentVideo = getCurrentVideo();
    if (!currentVideo || !course) return;

    try {
      const response = await fetch(`${API_URL}/courses/${id}/modules/${course.modules[currentModuleIndex]._id}/videos/${currentVideo._id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ watchedTime, totalDuration })
      });

      if (response.ok) {
        const data = await response.json();
        const key = `${course.modules[currentModuleIndex]._id}_${currentVideo._id}`;
        setVideoProgressMap(prev => new Map(prev.set(key, data.progress)));

        // Refresh overall progress
        fetchProgress();
      }
    } catch (err) {
      console.error('Error updating video progress:', err);
    }
  };

  const goToNextVideo = () => {
    if (!course) return;

    const currentModule = course.modules[currentModuleIndex];
    if (currentVideoIndex < currentModule.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentVideoIndex(0);
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      const prevModule = course?.modules[currentModuleIndex - 1];
      if (prevModule) {
        setCurrentVideoIndex(prevModule.videos.length - 1);
      }
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
        updateVideoProgress(currentTime, duration);
        setLastSavedTime(currentTime);
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentVideoProgress = getCurrentVideoProgress();

      // Resume from last watched position if available
      if (currentVideoProgress && currentVideoProgress.watchedTime > 0 && currentVideoProgress.watchedTime < duration) {
        videoRef.current.currentTime = currentVideoProgress.watchedTime;
      }
    }
  };

  const handleVideoEnded = () => {
    const currentVideo = getCurrentVideo();
    if (currentVideo && videoRef.current) {
      const duration = videoRef.current.duration;
      updateVideoProgress(duration, duration);
      goToNextVideo();
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
              {(() => {
                const currentVideo = getCurrentVideo();
                return currentVideo ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full rounded-t-lg bg-black max-h-[65vh]"
                      poster={course.thumbnailImage ? getUrl(course.thumbnailImage) : undefined}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onEnded={handleVideoEnded}
                      key={`${currentModuleIndex}-${currentVideoIndex}`} // Force re-render when video changes
                    >
                      <source src={getUrl(currentVideo.videoFile)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video navigation */}
                    <div className="absolute left-4 bottom-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center text-xs shadow">
                      <button
                        onClick={goToPreviousVideo}
                        className="mr-2 text-gray-600 hover:text-gray-800"
                        disabled={currentModuleIndex === 0 && currentVideoIndex === 0}
                      >
                        ‹
                      </button>
                      <span className="text-gray-700">
                        {course.modules[currentModuleIndex].title} - {currentVideo.title}
                      </span>
                      <button
                        onClick={goToNextVideo}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                        disabled={
                          currentModuleIndex === course.modules.length - 1 &&
                          currentVideoIndex === course.modules[currentModuleIndex].videos.length - 1
                        }
                      >
                        ›
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No videos available in this course.</span>
                  </div>
                );
              })()}
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
                <div className="space-y-3" style={{maxHeight:'500px', overflow:'auto'}}>
                  <h4 className="font-medium text-sm text-gray-700">Your Notes ({notes.length})</h4>
                  {notes.map((note) => (
                    <div key={note._id} className="border rounded-lg p-3 bg-gray-50">
                      {editingNoteId === note._id ? (
                        <div className="space-y-2">
                          <TextCKeditor
                            data={editingContent}
                            onChange={setEditingContent}
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

                                        fetch(`${apiUrl}/api/uploads/image`, {
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
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveEdit}
                              disabled={!editingContent.trim()}
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="text-sm text-gray-800 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(note.createdAt)}
                            </p>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleEditNote(note._id, note.content)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => openDeleteModal(note._id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
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
            {/* Course Progress */}
            <Card className="p-4 text-center mb-4">
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

              <div className="mb-4">
                <div className="text-sm text-gray-500">Course Progress</div>
                <div className="text-sm font-medium">{Math.round(progress.progress)}% Complete</div>
              </div>

              <div className="flex flex-col gap-3">
                {progress.completed ? (
                  <Button className="bg-green-600 hover:bg-green-700">Course Completed</Button>
                ) : (
                  <Button onClick={() => { if (videoRef.current) videoRef.current.play(); }} className="bg-blue-600 hover:bg-blue-700">Resume Watching</Button>
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

            {/* Course Content */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {course?.modules.map((module, moduleIdx) => (
                    <div key={module._id} className="border border-gray-200 rounded-lg">
                      <div
                        className={`px-3 py-2 cursor-pointer text-sm font-medium ${
                          moduleIdx === currentModuleIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setCurrentModuleIndex(moduleIdx);
                          setCurrentVideoIndex(0);
                        }}
                      >
                        Module {moduleIdx + 1}: {module.title}
                      </div>
                      <div className="px-3 pb-2">
                        {module.videos.map((video, videoIdx) => {
                          const videoProgress = videoProgressMap.get(`${module._id}_${video._id}`);
                          const isCompleted = videoProgress?.completed || false;
                          const isCurrent = moduleIdx === currentModuleIndex && videoIdx === currentVideoIndex;

                          return (
                            <div
                              key={video._id}
                              className={`flex items-center justify-between py-1 px-2 rounded text-xs cursor-pointer ${
                                isCurrent ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => {
                                setCurrentModuleIndex(moduleIdx);
                                setCurrentVideoIndex(videoIdx);
                              }}
                            >
                              <span className="flex-1 truncate">
                                {videoIdx + 1}. {video.title}
                              </span>
                              {isCompleted && (
                                <span className="ml-2 text-green-600">✓</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
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

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteModal}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
