import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import socket from '../../utils/socket';
import { Send, MessageCircle, Search, Paperclip, Trash2, X } from 'lucide-react';
import Icon from '../common/Icon';
import { motion, AnimatePresence } from "framer-motion";

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
  isDeletedForEveryone?: boolean;
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
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  // Listen for new messages and message deletions
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (selectedUser && (message.sender._id === selectedUser._id || message.receiver === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
      }
      // Update chat users list
      fetchChatUsers();
    };

    const handleMessageDeleted = (data: { messageId: string; isDeletedForEveryone: boolean }) => {
      if (data.isDeletedForEveryone) {
        // Update the message to show "Deleted by user" instead of removing it
        setMessages(prev => prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, message: 'Deleted by user', file: undefined, isDeletedForEveryone: true }
            : msg
        ));
      } else {
        // Remove the message (delete for me)
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
      // Update chat users list
      fetchChatUsers();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
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
    setSelectedMessages([]);
    setIsSelectionMode(false);
    fetchMessages(user._id);
  };

  // Handle message selection
  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedMessages([]);
    }
  };

  // Check if any received messages are selected
  const hasReceivedMessagesSelected = () => {
    return selectedMessages.some(messageId => {
      const message = messages.find(msg => msg._id === messageId);
      return message && message.sender._id !== currentUserId;
    });
  };

  // Delete selected messages
  const deleteMessages = async (deleteForEveryone: boolean) => {
    if (selectedMessages.length === 0) return;

    try {
      // For each selected message, determine the appropriate deletion endpoint
      const deletePromises = selectedMessages.map(messageId => {
        const message = messages.find(msg => msg._id === messageId);
        if (!message) return Promise.resolve();

        // If deleting for everyone, only allow if user is the sender
        const isSentMessage = message.sender._id === currentUserId;
        const shouldDeleteForEveryone = deleteForEveryone && isSentMessage;

        return API.delete(shouldDeleteForEveryone ? `/chats/delete-for-everyone/${messageId}` : `/chats/delete-for-me/${messageId}`);
      });

      await Promise.all(deletePromises);

      // Update local state based on deletion type
      setMessages(prev => prev.map(msg => {
        if (!selectedMessages.includes(msg._id)) return msg;

        const isSentMessage = msg.sender._id === currentUserId;
        const shouldDeleteForEveryone = deleteForEveryone && isSentMessage;

        if (shouldDeleteForEveryone) {
          // Update message to show "Deleted by user"
          return { ...msg, message: 'Deleted by user', file: undefined, isDeletedForEveryone: true };
        } else {
          // For "delete for me", remove the message from local state
          return null;
        }
      }).filter(Boolean) as Message[]);

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowDeleteModal(false);

      // Update chat users list
      fetchChatUsers();
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
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
                        src={user.photo}
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
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                >
                  <div className="flex items-center">
                    {user.photo ? (
                      <img
                        src={user.photo}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedUser.photo ? (
                    <img
                      src={selectedUser.photo}
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
                <div className="flex items-center space-x-2">
                  {isSelectionMode ? (
                    <>
                      {selectedMessages.length > 0 && (
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          Delete ({selectedMessages.length})
                        </button>
                      )}
                      <button
                        onClick={toggleSelectionMode}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                      >
                        <X className="h-4 w-4 inline mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={toggleSelectionMode}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Select
                    </button>
                  )}
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
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message._id)}
                      onChange={() => handleMessageSelect(message._id)}
                      className="mr-2 mt-2"
                    />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                      message.isDeletedForEveryone
                        ? 'bg-gray-100 text-gray-500 italic border border-gray-200'
                        : message.sender._id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    } ${selectedMessages.includes(message._id) ? 'ring-2 ring-red-500' : ''}`}
                  >
                    {message.file && !message.isDeletedForEveryone && (
                      <div className="mb-2">
                        {message.file.type.startsWith('image/') ? (
                          <img
                            src={message.file.path}
                            alt={message.file.name}
                            className="max-w-full h-auto rounded cursor-pointer"
                            onClick={() => window.open(message.file.path, '_blank')}
                          />
                        ) : message.file.type.startsWith('video/') ? (
                          <video
                            controls
                            className="max-w-full h-auto rounded"
                            src={message.file.path}
                          />
                        ) : message.file.type.startsWith('audio/') ? (
                          <audio
                            controls
                            className="max-w-full"
                            src={message.file.path}
                          />
                        ) : (
                          <a
                            href={message.file.path}
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
                    <p className={message.isDeletedForEveryone ? 'text-sm' : ''}>{message.message}</p>
                    <span className={`text-xs ${message.isDeletedForEveryone ? 'text-gray-400' : 'opacity-75'}`}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                Confirm Deletion
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                You are about to delete <strong>{selectedMessages.length}</strong>{" "}
                message{selectedMessages.length > 1 ? "s" : ""}.
                {hasReceivedMessagesSelected() ? (
                  <span className="block mt-2 text-sm text-orange-600 dark:text-orange-400">
                    Note: Received messages can only be deleted from your chat feed.
                  </span>
                ) : (
                  <span className="block mt-2 text-sm text-gray-500">
                    Choose how you want to delete these messages.
                  </span>
                )}
              </p>

              {/* Buttons */}
              <div className={`grid gap-3 ${hasReceivedMessagesSelected() ? 'grid-cols-2' : 'grid-cols-3'}`}>

                {/* Delete for me */}
                <button
                  onClick={() => deleteMessages(false)}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all shadow-sm hover:shadow-md"
                >
                  For Me
                </button>

                {/* Delete for Everyone - only show if no received messages are selected */}
                {!hasReceivedMessagesSelected() && (
                  <button
                    onClick={() => deleteMessages(true)}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    For All
                  </button>
                )}

                {/* Cancel */}
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ChatMain;