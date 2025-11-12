import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  User,
  AlertCircle,
  Send,
  MessageCircle,
  TrendingUp,
  Clock,
  Edit,
  File,
  FileImage,
  FileText,
  FileCode,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";
import { formatDate, formatDateTime } from "../../Common/Commonfunction";
import socket from "../../utils/socket";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Button } from "../../components/ui/button";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}
interface ProgressEntry {
  _id: string;
  date: string;
  workingHours: number;
  progress: number;
  updatedBy: { _id: string; firstName: string; lastName: string; role: string };
}
interface Ticket {
  _id: string;
  title: string;
  employee?: Employee | null;
  priority?: "Low" | "Medium" | "High";
  dueDate?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: ProgressEntry[];
  currentProgress?: number;
}
interface Comment {
  _id: string;
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: string;
    photo?: string;
  };
  createdAt: string;
  attachments?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
  }[];
}

export default function TicketViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [progressDate, setProgressDate] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [progressValue, setProgressValue] = useState("");
  const [currentProgress, setCurrentProgress] = useState("");
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // force refetch after updates

  // Safe date formatter used during render
  const formatDateTimeSafe = (s?: string): string => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };

  // Get file icon based on mimetype and filename
  const getFileIcon = (mimetype: string, filename: string) => {
    if (mimetype.startsWith('image/')) return <FileImage className="h-6 w-6" />;
    if (mimetype === 'application/pdf') return <FileText className="h-6 w-6" />;
    if (mimetype.includes('spreadsheet') || mimetype === 'text/csv') return <FileSpreadsheet className="h-6 w-6" />;
    if (mimetype.includes('javascript') || mimetype.includes('php') || mimetype === 'application/sql' || mimetype === 'text/html' || mimetype === 'text/css') return <FileCode className="h-6 w-6" />;
    if (filename.toLowerCase().endsWith('.env') || filename.toLowerCase().endsWith('.js') || filename.toLowerCase().endsWith('.php') || filename.toLowerCase().endsWith('.sql')) return <FileCode className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  // Fetch ticket, robust handling
  const fetchTicket = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }/tickets/${id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        // try to parse error message if available
        let errMsg = `Failed to fetch ticket (status ${response.status})`;
        try {
          const errJson = await response.json();
          errMsg = errJson.message || errMsg;
        } catch (_) {
          /* ignore parse errors */
        }
        setTicket(null);
        setError(errMsg);
        return;
      }

      // parse JSON safely
      let data: Ticket | null = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        setTicket(null);
        setError("Invalid ticket response from server");
        return;
      }

      setTicket(data);
    } catch (err) {
      setTicket(null);
      setError("Network error fetching ticket");
      console.error("fetchTicket error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    try {
      const url = `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }/comments/${id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data: Comment[] = await response.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // initial fetch + re-fetch whenever refreshTrigger toggles
  useEffect(() => {
    if (!id) return;
    fetchTicket();
    fetchComments();

    // socket: ensure single listener (remove first)
    const eventName = `comment-${id}`;
    socket.off(eventName);
    socket.on(eventName, (newComment: Comment) => {
      setComments((prev) => [...prev, newComment]);
    });

    // socket listener for progress updates
    const progressEventName = `ticket-progress-${id}`;
    socket.off(progressEventName);
    socket.on(progressEventName, (data: { type: string; ticket: Ticket }) => {
      if (data.type === 'progress_update') {
        setTicket(data.ticket);
      }
    });

    return () => {
      socket.off(eventName);
      socket.off(progressEventName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refreshTrigger]);

  // When ticket changes, seed form fields safely
  useEffect(() => {
    if (!ticket) return;
    setCurrentProgress((ticket.currentProgress ?? 0).toString());

    // determine last updated date
    const progressArr = Array.isArray(ticket.progress) ? ticket.progress : [];
    if (progressArr.length > 0) {
      const lastEntry = progressArr[progressArr.length - 1];
      const lastDate = new Date(
        lastEntry?.date || ticket.updatedAt || ticket.createdAt || Date.now()
      );
      if (!isNaN(lastDate.getTime())) {
        setProgressDate(lastDate.toISOString().split("T")[0]);
      }
    } else {
      const createdDate = new Date(ticket.createdAt || Date.now());
      if (!isNaN(createdDate.getTime())) {
        setProgressDate(createdDate.toISOString().split("T")[0]);
      }
    }
  }, [ticket]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    try {
      const formData = new FormData();
      formData.append('message', newComment.trim());
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const url = `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }/comments/${id}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      if (response.ok) {
        setNewComment("");
        setSelectedFiles([]);
        // server will emit socket event; if not, trigger refresh
        // setRefreshTrigger(prev => !prev);
      } else {
        console.error("Failed to post comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/html',
      'text/css',
      'application/javascript', 'application/x-javascript',
      'application/x-php',
      'application/sql',
      'text/plain' // for .env files
    ];
    const allowedExtensions = ['.env', '.js', '.php', '.sql'];
    const filteredFiles = files.filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
    });
    setSelectedFiles(filteredFiles);
  };
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !ticket) return;

    setUpdatingProgress(true);
    setProgressError(null);

    const userRole = localStorage.getItem("role");
    let updateData: any = {};

    if (userRole === "Employee") {
      const newProgress = parseInt(progressValue) || 0;
      if (newProgress < (ticket.currentProgress || 0)) {
        setProgressError("Cannot update progress below current progress");
        setUpdatingProgress(false);
        return;
      }

      // last updated date fallback
      let lastUpdatedDate = new Date(ticket.createdAt || Date.now());
      const progArr = Array.isArray(ticket.progress) ? ticket.progress : [];
      if (progArr.length > 0) {
        const last = progArr[progArr.length - 1];
        const candidate = new Date(
          last?.date || ticket.updatedAt || ticket.createdAt || Date.now()
        );
        if (!isNaN(candidate.getTime())) lastUpdatedDate = candidate;
      }

      const selectedDate = new Date(progressDate || Date.now());
      // selectedDate must be strictly after lastUpdatedDate
      if (selectedDate <= lastUpdatedDate) {
        setProgressError(
          "You cannot update progress before the last updated date."
        );
        setUpdatingProgress(false);
        return;
      }

      updateData.progressUpdate = {
        date: progressDate || new Date().toISOString(),
        workingHours: parseFloat(workingHours) || 0,
        progress: newProgress,
      };
    } else {
      const newProgress = parseInt(currentProgress) || 0;
      if (newProgress < (ticket.currentProgress || 0)) {
        setProgressError("Cannot update progress below current progress");
        setUpdatingProgress(false);
        return;
      }
      updateData.currentProgress = newProgress;
    }

    try {
      const url = `${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"
        }/tickets/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // don't rely on response shape; force a fresh fetch to get canonical ticket
        setShowProgressForm(false);
        // keep progressDate populated (do not immediately clear) so next open is stable
        setWorkingHours("");
        setProgressValue("");
        // toggle refresh trigger to fetch updated ticket
        setRefreshTrigger((prev) => !prev);
        setProgressError(null);
      } else {
        // parse friendly message if available
        let errMsg = "Failed to update progress";
        try {
          const errBody = await response.json();
          errMsg = errBody.message || errMsg;
        } catch (_) {
          /* ignore */
        }
        setProgressError(errMsg);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      setProgressError("Network error occurred while updating progress");
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Render guards: loading / error / not found
  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-8">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-8 text-red-600">
          {error || "Ticket not found"}
        </div>
      </div>
    );
  }

  // Safe helpers for rendering (avoid indexing undefined strings)
  const employeeName = ticket.employee
    ? `${ticket.employee.firstName || ""} ${ticket.employee.lastName || ""
      }`.trim()
    : "No employee assigned";

  return (
    <div className="p-6 w-full">
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Ticket Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {ticket.title || "Untitled"}
              </h2>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${ticket.priority === "High"
                    ? "bg-red-100 text-red-800"
                    : ticket.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                    }`}
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {ticket.priority || "Low"} Priority
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <User className="h-4 w-4" />
                    <span>Assigned Employee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {ticket.employee?.photo ? (
                      <img
                        src={`${(import.meta as any).env.VITE_API_URL ||
                          "http://localhost:5000"
                          }/${ticket.employee.photo}`}
                        alt={employeeName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {ticket.employee && ticket.employee.firstName
                            ? ticket.employee.firstName[0] || ""
                            : "—"}
                          {ticket.employee && ticket.employee.lastName
                            ? ticket.employee.lastName[0] || ""
                            : ""}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-900 font-medium">
                        {employeeName}
                      </div>
                      {ticket.employee?.email && (
                        <div className="text-sm text-gray-500">
                          {ticket.employee.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {formatDate(ticket.dueDate)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Progress</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ticket.currentProgress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {ticket.currentProgress ?? 0}%
                    </span>
                    <Button
                      onClick={() => setShowProgressForm(true)}
                      variant="ghost"
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Created</div>
                  <div className="text-gray-900 font-medium">
                    {formatDateTime(ticket.createdAt)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                  <div className="text-gray-900 font-medium">
                    {formatDateTime(ticket.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-sm text-gray-500 mb-2">Description</div>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                {ticket.description || "No description provided."}
              </div>
            </div>

            {/* Progress History */}
            {Array.isArray(ticket.progress) && ticket.progress.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  Progress History
                </div>
                <div className="space-y-2">
                  {ticket.progress.map((entry, index) => (
                    <div
                      key={entry._id ?? index}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {entry.workingHours ?? 0}h
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {entry.progress ?? 0}%
                            </span>
                          </div>
                        </div>
                        {entry.updatedBy && (
                          <div className="text-sm text-gray-500">
                            by {entry.updatedBy.firstName || ""}{" "}
                            {entry.updatedBy.lastName || ""} <br />
                            <span>{entry.updatedBy.role}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-96">
            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle
                  className="h-5 w-5 text-gray-600 transition-transform duration-300 ease-in-out hover:scale-125 hover:text-blue-500 animate-bounce-slow"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  Comments
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {comment.user.photo ? (
                            <img
                              src={`${(import.meta as any).env.VITE_API_URL ||
                                "http://localhost:5000"
                                }/${comment.user.photo}`}
                              alt={`${comment.user.firstName || ""} ${comment.user.lastName || ""
                                }`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {(comment.user.firstName?.[0] ?? "") +
                                  (comment.user.lastName?.[0] ?? "")}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user.firstName} {comment.user.lastName}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${comment.user.role === "Admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {comment.user.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <div
                            className="mt-1 text-sm text-gray-900"
                            dangerouslySetInnerHTML={{
                              __html: comment.message,
                            }}
                          />
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {comment.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={`${(import.meta as any).env.VITE_API_URL || "http://localhost:5000"
                                    }/uploads/${attachment.filename}`}
                                  target="_blank"
                                  download={attachment.originalname}
                                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  {getFileIcon(attachment.mimetype, attachment.originalname)}
                                  <span style={{ fontSize: "10px" }}>Attached File</span>
                                  {/* {attachment.originalname} */}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                {/* @ts-ignore */}
                <CKEditor
                  editor={ClassicEditor}
                  data={newComment}
                  onChange={(event, editor) => setNewComment(editor.getData())}
                  config={{
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
                    ],
                    table: {
                      contentToolbar: [
                        "tableColumn",
                        "tableRow",
                        "mergeTableCells",
                      ],
                    },
                  }}
                />
                <div className="w-full max-w-lg mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Files (Images, PDF, Excel, CSV, HTML, CSS, .env, JS, PHP, SQL)
                  </label>

                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.xls,.xlsx,.csv,.html,.css,.env,.js,.php,.sql"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        Drag & drop files here, or click to select
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supported formats: JPG, PNG, GIF, WebP, PDF, XLS, CSV, HTML, CSS, .env, JS, PHP, SQL
                      </p>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md text-sm">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.type, file.name)}
                            <span className="truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Progress Update Modal */}
        {showProgressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Progress
              </h3>
              {progressError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{progressError}</p>
                </div>
              )}
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                {localStorage.getItem("role") === "Employee" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date (Last Updated: {progressDate})
                      </label>
                      <input
                        type="date"
                        value={progressDate}
                        onChange={(e) => setProgressDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        min={progressDate}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Working Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        placeholder="Enter hours worked"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        placeholder="Enter progress percentage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentProgress}
                      onChange={(e) => setCurrentProgress(e.target.value)}
                      placeholder="Enter current progress"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowProgressForm(false);
                      setProgressError(null);
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={updatingProgress}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updatingProgress}
                  >
                    {updatingProgress ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
