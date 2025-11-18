import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import socket from '../../utils/socket';
import { Send, MessageCircle, Search, Paperclip } from 'lucide-react';
import Icon from '../common/Icon';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  role?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  receiver: string;
  message: string;
  createdAt: string;
  read: boolean;
  file?: {
    name: string;
    path: string;
    type: string;
    size: number;
  };
}

type IconType = 'audio' | 'code' | 'document' | 'empty' | 'folder' | 'image' | 'img' | 'spreadsheets' | 'video' | 'video-01' | 'video-02' | 'aep' | 'ai' | 'avi' | 'css' | 'csv' | 'dmg' | 'doc' | 'docx' | 'exe' | 'fig' | 'gif' | 'html' | 'java' | 'mp4' | 'mpeg' | 'pdf' | 'pdf-simple' | 'png' | 'ppt' | 'pptx' | 'psd' | 'sql' | 'svg' | 'txt' | 'webp' | 'xls' | 'xlsx' | 'xml' | 'zip';

const ChatMain: React.FC = () => {
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  const getIconType = (file: { name: string; type: string }): IconType => {
    const mime = file.type;
    if (mime === 'application/pdf') return 'pdf';
    if (mime === 'application/msword') return 'doc';
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (mime === 'application/vnd.ms-excel') return 'xls';
    if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
    if (mime === 'text/plain') return 'txt';
    if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'zip';
    return 'document';
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join socket room
  useEffect(() => {
    if (currentUserId) {
      socket.emit('join', currentUserId);
    }
  }, [currentUserId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (selectedUser && (message.sender._id === selectedUser._id || message.receiver === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
      }
      // Update chat users list
      fetchChatUsers();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [selectedUser]);

  // Fetch chat users
  const fetchChatUsers = async () => {
    try {
      const response = await API.get('/chats/users');
      setChatUsers(response.data.chatUsers);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    }
  };

  // Fetch messages for selected user
  const fetchMessages = async (userId: string) => {
    try {
      const response = await API.get(`/chats/messages/${userId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('receiverId', selectedUser._id);
      formData.append('message', newMessage.trim() || ' '); // Message is required, so send space if only file
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await API.post('/chats/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add the message to local state immediately
      const sentMessage = {
        _id: response.data.data._id,
        sender: {
          _id: currentUserId!,
          firstName: localStorage.getItem('userName')?.split(' ')[0] || '',
          lastName: localStorage.getItem('userName')?.split(' ')[1] || '',
        },
        receiver: selectedUser._id,
        message: newMessage.trim(),
        file: selectedFile ? {
          name: selectedFile.name,
          path: response.data.data.file?.path,
          type: selectedFile.type,
          size: selectedFile.size,
        } : undefined,
        createdAt: response.data.data.createdAt,
        read: false,
      };
      setMessages(prev => [...prev, sentMessage]);

      // Update chat users list
      fetchChatUsers();

      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await API.get(`/chats/search-users?query=${encodeURIComponent(searchQuery)}`);
        setSearchResults(response.data.users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    fetchChatUsers();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Users List */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users to start chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <p>Searching...</p>
            </div>
          ) : searchQuery.trim() !== '' ? (
            // Show search results
            searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No users found</p>
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="flex items-center">
                    {user.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.photo}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                    )}
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Show chat users
            chatUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="mx-auto mb-2 h-8 w-8" />
                <p>No chats yet</p>
                <p className="text-sm mt-1">Use the search above to start a new conversation</p>
              </div>
            ) : (
              chatUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {user.photo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.photo}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                    )}
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {user.lastMessage}
                        </p>
                      )}
                    </div>
                    {user.lastMessageTime && (
                      <span className="text-xs text-gray-400">
                        {new Date(user.lastMessageTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center">
                {selectedUser.photo ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${selectedUser.photo}`}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                )}
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.file && (
                      <div className="mb-2">
                        {message.file.type.startsWith('image/') ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${message.file.path.split('/').pop()}`}
                            alt={message.file.name}
                            className="max-w-full h-auto rounded cursor-pointer"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${message.file.path.split('/').pop()}`, '_blank')}
                          />
                        ) : message.file.type.startsWith('video/') ? (
                          <video
                            controls
                            className="max-w-full h-auto rounded"
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${message.file.path.split('/').pop()}`}
                          />
                        ) : message.file.type.startsWith('audio/') ? (
                          <audio
                            controls
                            className="max-w-full"
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${message.file.path.split('/').pop()}`}
                          />
                        ) : (
                          <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${message.file.path.split('/').pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`underline ${message.sender._id === currentUserId ? 'text-blue-200' : 'text-blue-600'}`}
                          >
                            <Icon type={getIconType(message.file)} size={16} className="inline mr-1" />
                            {message.file.name}
                          </a>
                        )}
                      </div>
                    )}
                    <p>{message.message}</p>
                    <span className="text-xs opacity-75">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              {selectedFile && (
                <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <label
                  htmlFor="file-input"
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer flex items-center"
                >
                  <Paperclip className="h-5 w-5" />
                </label>
                <button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="mx-auto mb-4 h-16 w-16" />
              <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
              <p>Choose a user from the list to begin a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMain;