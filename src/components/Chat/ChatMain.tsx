import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../utils/api';
import socket, { connectSocket } from '../../utils/socket';
import {
  Send,
  MessageCircle,
  MessagesSquare,
  Search,
  Paperclip,
  Trash2,
  X,
  ArrowLeft,
  CheckCheck,
  Check,
  Ban,
  Download,
  Loader2,
  Mail,
  CircleCheck,
} from 'lucide-react';
import Icon from '../common/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Message as MessageItem,
  MessageContent,
  MessageFooter,
  MessageAvatar,
} from '../ui/message';
import { Bubble, BubbleContent, BubbleGroup } from '../ui/bubble';
import { Marker, MarkerContent } from '../ui/marker';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import toast from 'react-hot-toast';
import MessageReactions from './MessageReactions';
import ReactionToolbar from './ReactionToolbar';
import { QUICK_REACTION_EMOJI } from './reactionTypes';
import type { MessageReaction } from './reactionTypes';
import { useLongPress } from '../../hooks/useLongPress';
import { useRecentEmojis } from '../../hooks/useRecentEmojis';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  role?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface FileAttachment {
  name: string;
  path: string;
  type: string;
  size: number;
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
  file?: FileAttachment | null;
  isDeletedForEveryone?: boolean;
  reactions?: MessageReaction[];
}

type IconType = 'audio' | 'code' | 'document' | 'empty' | 'folder' | 'image' | 'img' | 'spreadsheets' | 'video' | 'video-01' | 'video-02' | 'aep' | 'ai' | 'avi' | 'css' | 'csv' | 'dmg' | 'doc' | 'docx' | 'exe' | 'fig' | 'gif' | 'html' | 'java' | 'mp4' | 'mpeg' | 'pdf' | 'pdf-simple' | 'png' | 'ppt' | 'pptx' | 'psd' | 'sql' | 'svg' | 'txt' | 'webp' | 'xls' | 'xlsx' | 'xml' | 'zip';

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

const initialsOf = (first?: string, last?: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDayLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameDay(date, now)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatListTime = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (sameDay(date, now)) return formatTime(iso);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const ChatMain: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedChatUserId = searchParams.get('userId');
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    firstName?: string;
    lastName?: string;
    photo?: string;
  } | null>(null);
  const [reactionToolbar, setReactionToolbar] = useState<{
    messageId: string;
    isMine: boolean;
    rect: DOMRect;
  } | null>(null);

  const pendingReactionsRef = useRef<Set<string>>(new Set());
  const handledChatRequestRef = useRef<string | null>(null);
  const requestedFallbackRef = useRef<string | null>(null);
  const longPressTargetRef = useRef<HTMLElement | null>(null);
  const fileOpenTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<{ messageId: string; at: number } | null>(null);
  const suppressClickRef = useRef(0);
  const doubleTapHandledAtRef = useRef(0);

  useEffect(
    () => () => {
      if (fileOpenTimerRef.current !== null) {
        window.clearTimeout(fileOpenTimerRef.current);
      }
    },
    [],
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedUserIdRef = useRef<string | null>(null);

  const currentUserId = localStorage.getItem('userId');
  const currentUserName = localStorage.getItem('userName') || 'You';
  const { recents, remember } = useRecentEmojis(currentUserId);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id ?? null;
  }, [selectedUser]);

  // The login response does not include the photo, so fetch the signed-in
  // user's profile to show their real picture on their own messages.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await API.get('/users/me');
        if (cancelled) return;
        setCurrentUserProfile({
          firstName: response.data?.firstName,
          lastName: response.data?.lastName,
          photo: response.data?.photo,
        });
      } catch (error) {
        console.error('Error loading current user profile:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchChatUsers = useCallback(async () => {
    try {
      const response = await API.get('/chats/users');
      const users = Array.isArray(response.data.chatUsers) ? response.data.chatUsers : [];
      setChatUsers(users);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const markConversationAsRead = useCallback(async (userId: string) => {
    // Optimistic local badge reset; the server emits the authoritative total.
    setChatUsers(previous =>
      previous.map(user =>
        user._id === userId ? { ...user, unreadCount: 0 } : user,
      ),
    );
    try {
      await API.put(`/chats/read/${userId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  useEffect(() => {
    connectSocket();
  }, []);

  // Report chat presence to the server: the recipient is only considered to be
  // "actively viewing" a conversation when this socket reports the Chat section
  // together with the exact conversation id.
  const selectedUserId = selectedUser?._id ?? null;

  useEffect(() => {
    if (!currentUserId) return;

    const isVisible = () => document.visibilityState === 'visible';

    const reportPresence = () => {
      // A hidden tab is not "actively viewing" the conversation, so the server
      // must still create a notification for it.
      socket.emit('user:section:update', {
        section: 'chat',
        conversationId: isVisible() ? selectedUserId : null,
        visible: isVisible(),
      });
    };

    const handleVisibilityChange = () => {
      if (isVisible()) {
        reportPresence();
      } else {
        // Only clear the conversation. The section stays `chat`, and the
        // global heartbeat continues to mark the session as online.
        socket.emit('chat:conversation:close');
      }
    };

    reportPresence();
    socket.on('connect', reportPresence);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.off('connect', reportPresence);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Leaving the Chat page must not leave a stale "viewing" state behind.
      // Only the conversation is cleared; Layout reports the new section.
      socket.emit('chat:conversation:close');
    };
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    fetchChatUsers();
  }, [fetchChatUsers]);

  // Opening a chat notification links to /chat?userId=<sender>. Select that
  // conversation automatically once the conversation list is available. The
  // last handled id is remembered so manually switching conversations is not
  // overridden on every render.
  useEffect(() => {
    if (!requestedChatUserId) {
      handledChatRequestRef.current = null;
      requestedFallbackRef.current = null;
      return;
    }
    if (handledChatRequestRef.current === requestedChatUserId) return;

    const selectTarget = (target: User) => {
      handledChatRequestRef.current = requestedChatUserId;
      setSelectedUser(target);
      setSelectedMessages([]);
      setIsSelectionMode(false);
      setSearchQuery('');
    };

    const target = chatUsers.find(user => user._id === requestedChatUserId);
    if (target) {
      selectTarget(target);
      return;
    }

    // The sender may never have been part of this user's conversation list
    // (first ever message). Resolve the participant so the notification
    // deep-link still opens the correct conversation.
    if (usersLoading || requestedFallbackRef.current === requestedChatUserId) return;
    requestedFallbackRef.current = requestedChatUserId;

    let cancelled = false;
    (async () => {
      try {
        const response = await API.get(`/chats/user/${requestedChatUserId}`);
        if (cancelled) return;
        const user = response.data?.user as User | undefined;
        if (!user) return;
        setChatUsers(previous =>
          previous.some(item => item._id === user._id) ? previous : [user, ...previous],
        );
        selectTarget(user);
      } catch (error) {
        if (!cancelled) {
          console.error('Error opening requested conversation:', error);
          toast.error('Could not open that conversation');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatUsers, requestedChatUserId, usersLoading]);

  // Fetch messages whenever a conversation is opened
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setMessagesLoading(true);
    setMessages([]);

    (async () => {
      try {
        const response = await API.get(`/chats/messages/${selectedUser._id}`);
        if (cancelled) return;
        setMessages(response.data.messages);
        if (document.visibilityState === 'visible') {
          markConversationAsRead(selectedUser._id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Could not load this conversation');
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUser, markConversationAsRead]);

  useEffect(() => {
    if (messagesLoading) return;
    const timer = setTimeout(() => scrollToBottom(messages.length > 0 ? 'smooth' : 'auto'), 40);
    return () => clearTimeout(timer);
  }, [messages, messagesLoading]);

  // Live updates
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      const activeUserId = selectedUserIdRef.current;
      const isActiveConversation =
        !!activeUserId && (message.sender._id === activeUserId || message.receiver === activeUserId);
      const isIncomingFromPartner =
        !!activeUserId &&
        message.sender._id === activeUserId &&
        document.visibilityState === 'visible';

      if (isActiveConversation) {
        setMessages(prev => {
          if (prev.some(item => item._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      if (isIncomingFromPartner && activeUserId) {
        // Only mark read when the tab is actually visible. A hidden Chat tab
        // must not swallow the notification/unread state.
        void markConversationAsRead(activeUserId).finally(fetchChatUsers);
      } else {
        fetchChatUsers();
      }
    };

    const handleMessageRead = (data: {
      messageIds?: string[];
      readerId?: string;
      senderId?: string;
    }) => {
      if (!Array.isArray(data?.messageIds) || data.messageIds.length === 0) return;
      const readIds = new Set(data.messageIds);
      setMessages(prev =>
        prev.map(message =>
          readIds.has(message._id) ? { ...message, read: true } : message,
        ),
      );

      // If this user is the reader, their local conversation badge is clear.
      if (data.readerId && data.senderId && data.readerId === currentUserId) {
        setChatUsers(previous =>
          previous.map(user =>
            user._id === data.senderId ? { ...user, unreadCount: 0 } : user,
          ),
        );
      }
    };

    const handleUnreadUpdate = () => {
      // The server owns the counters; re-fetch the conversation list so each
      // row's badge and the total stay consistent.
      fetchChatUsers();
    };

    const handleNotificationsRead = (data: { senderId?: string }) => {
      if (!data?.senderId) return;
      setChatUsers(previous =>
        previous.map(user =>
          user._id === data.senderId ? { ...user, unreadCount: 0 } : user,
        ),
      );
    };

    const handleMessageDeleted = (data: { messageId: string; isDeletedForEveryone: boolean }) => {
      if (data.isDeletedForEveryone) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  message: 'Deleted by user',
                  file: undefined,
                  reactions: [],
                  isDeletedForEveryone: true,
                }
              : msg,
          ),
        );
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
      fetchChatUsers();
    };

    // Reactions are broadcast by the backend to both participants (and to the
    // reacting user's other devices), so the list stays authoritative.
    const handleReactionUpdated = (data: {
      messageId: string;
      reactions: MessageReaction[];
    }) => {
      if (!data?.messageId) return;
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, reactions: Array.isArray(data.reactions) ? data.reactions : [] }
            : msg,
        ),
      );
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chat:message:read', handleMessageRead);
    socket.on('chat:unread:update', handleUnreadUpdate);
    socket.on('chat:notifications:read', handleNotificationsRead);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageReactionUpdated', handleReactionUpdated);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chat:message:read', handleMessageRead);
      socket.off('chat:unread:update', handleUnreadUpdate);
      socket.off('chat:notifications:read', handleNotificationsRead);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageReactionUpdated', handleReactionUpdated);
    };
  }, [currentUserId, fetchChatUsers, markConversationAsRead]);

  // Debounced user search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const response = await API.get(`/chats/search-users?query=${encodeURIComponent(query)}`);
        if (!cancelled) setSearchResults(response.data.users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Selected attachment preview lifecycle
  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Auto-grow composer
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 132)}px`;
  }, [newMessage]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedMessages([]);
    setIsSelectionMode(false);
    setSearchQuery('');
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUser || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('receiverId', selectedUser._id);
      formData.append('message', newMessage.trim() || ' ');
      if (selectedFile) formData.append('file', selectedFile);

      const response = await API.post('/chats/send', formData);

      const sentMessage: Message = {
        _id: response.data.data._id,
        sender: {
          _id: currentUserId!,
          firstName: currentUserName.split(' ')[0] || '',
          lastName: currentUserName.split(' ').slice(1).join(' ') || '',
        },
        receiver: selectedUser._id,
        message: newMessage.trim(),
        file: selectedFile
          ? {
              name: selectedFile.name,
              path: response.data.data.file?.path,
              type: selectedFile.type,
              size: selectedFile.size,
            }
          : undefined,
        createdAt: response.data.data.createdAt,
        read: false,
      };

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchChatUsers();
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId],
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedMessages([]);
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === messages.length) setSelectedMessages([]);
    else setSelectedMessages(messages.map(message => message._id));
  };

  const hasReceivedMessagesSelected = () =>
    selectedMessages.some(id => {
      const message = messages.find(msg => msg._id === id);
      return message && message.sender._id !== currentUserId;
    });

  const deleteMessages = async (deleteForEveryone: boolean) => {
    if (selectedMessages.length === 0) return;

    try {
      await Promise.all(
        selectedMessages.map(messageId => {
          const message = messages.find(msg => msg._id === messageId);
          if (!message) return Promise.resolve();

          const shouldDeleteForEveryone = deleteForEveryone && message.sender._id === currentUserId;
          return API.delete(
            shouldDeleteForEveryone
              ? `/chats/delete-for-everyone/${messageId}`
              : `/chats/delete-for-me/${messageId}`,
          );
        }),
      );

      setMessages(prev =>
        prev
          .map(msg => {
            if (!selectedMessages.includes(msg._id)) return msg;

            const shouldDeleteForEveryone =
              deleteForEveryone && msg.sender._id === currentUserId;

            if (shouldDeleteForEveryone) {
              return {
                ...msg,
                message: 'Deleted by user',
                file: undefined,
                isDeletedForEveryone: true,
              };
            }
            return null;
          })
          .filter(Boolean) as Message[],
      );

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowDeleteModal(false);
      fetchChatUsers();
      toast.success(deleteForEveryone ? 'Messages deleted for everyone' : 'Messages deleted for you');
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Could not delete the selected messages');
    }
  };

  const sharedFiles = useMemo(
    () =>
      messages
        .filter(message => message.file && !message.isDeletedForEveryone)
        .map(message => message.file as FileAttachment)
        .reverse(),
    [messages],
  );

  // Consecutive messages from the same sender (within 5 minutes) share one
  // Message with a BubbleGroup, matching the reference design.
  const messageGroups = useMemo(() => {
    const groups: {
      key: string;
      isMine: boolean;
      sender: Message['sender'];
      messages: Message[];
    }[] = [];

    messages.forEach(message => {
      const isMine = message.sender._id === currentUserId;
      const lastGroup = groups[groups.length - 1];
      const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];

      const continuesGroup =
        !!lastGroup &&
        !!lastMessage &&
        lastGroup.isMine === isMine &&
        lastGroup.sender._id === message.sender._id &&
        sameDay(new Date(lastMessage.createdAt), new Date(message.createdAt)) &&
        new Date(message.createdAt).getTime() - new Date(lastMessage.createdAt).getTime() <
          5 * 60 * 1000;

      if (continuesGroup) {
        lastGroup.messages.push(message);
      } else {
        groups.push({
          key: message._id,
          isMine,
          sender: message.sender,
          messages: [message],
        });
      }
    });

    return groups;
  }, [messages, currentUserId]);

  const currentUser = useMemo(() => {
    const parts = currentUserName.trim().split(/\s+/);
    return {
      firstName: currentUserProfile?.firstName || parts[0] || 'You',
      lastName: currentUserProfile?.lastName ?? parts.slice(1).join(' '),
      photo: currentUserProfile?.photo,
    };
  }, [currentUserName, currentUserProfile]);

  const totalUnread = useMemo(
    () => chatUsers.reduce((sum, user) => sum + (user.unreadCount || 0), 0),
    [chatUsers],
  );

  // -------------------------
  // MESSAGE REACTIONS
  // -------------------------
  const openReactionToolbar = useCallback(
    (messageId: string, isMine: boolean, rect: DOMRect) => {
      setReactionToolbar(previous => {
        // Both long-press and contextmenu can fire for one gesture; keep the
        // existing anchor so a late event cannot reset the open picker.
        if (previous && previous.messageId === messageId) return previous;
        return { messageId, isMine, rect };
      });
    },
    [],
  );

  const closeReactionToolbar = useCallback(() => setReactionToolbar(null), []);

  // Switching conversations dismisses the toolbar so it can never act on a
  // message that is no longer on screen.
  useEffect(() => {
    closeReactionToolbar();
  }, [selectedUser?._id, closeReactionToolbar]);

  const handleLongPress = useCallback(() => {
    const element = longPressTargetRef.current;
    if (!element) return;
    const messageId = element.dataset.messageId;
    if (!messageId) return;

    // Long pressing on mobile can leave a text selection behind; clear it so
    // the toolbar is the only visible result of the gesture.
    window.getSelection()?.removeAllRanges();
    openReactionToolbar(
      messageId,
      element.dataset.mine === 'true',
      element.getBoundingClientRect(),
    );
  }, [openReactionToolbar]);

  const { longPressHandlers, consumeFired, wasFired } = useLongPress({
    onLongPress: handleLongPress,
  });

  // A long press or a double-tap also produces a click on release in some
  // browsers; swallow it so it does not open an attachment or select a message.
  const handleClickCapture = useCallback(
    (event: React.MouseEvent) => {
      const afterLongPress = consumeFired();
      const afterDoubleTap = suppressClickRef.current > 0;
      if (afterDoubleTap) suppressClickRef.current -= 1;
      if (afterLongPress || afterDoubleTap) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [consumeFired],
  );

  // Attachments normally open on a single click. Opening is delayed slightly so
  // the second click of a double-click (which adds a ❤️ reaction) can cancel it
  // instead of opening the file twice.
  const openAttachment = useCallback((path?: string | null) => {
    if (!path) return;
    if (fileOpenTimerRef.current !== null) window.clearTimeout(fileOpenTimerRef.current);
    fileOpenTimerRef.current = window.setTimeout(() => {
      fileOpenTimerRef.current = null;
      window.open(path, '_blank', 'noopener,noreferrer');
    }, 280);
  }, []);

  const cancelPendingAttachment = useCallback(() => {
    if (fileOpenTimerRef.current !== null) {
      window.clearTimeout(fileOpenTimerRef.current);
      fileOpenTimerRef.current = null;
    }
  }, []);

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!currentUserId) return;

      // Guard rapid repeat clicks while a request for this pair is in flight.
      const requestKey = `${messageId}:${emoji}`;
      if (pendingReactionsRef.current.has(requestKey)) return;
      pendingReactionsRef.current.add(requestKey);

      // Remember the emoji for the "Frequently Used" section of the picker.
      remember(emoji);

      const target = messages.find(message => message._id === messageId);
      const previousReactions = target?.reactions ?? [];

      // Optimistic update so the reaction appears instantly for the sender.
      setMessages(prev =>
        prev.map(message => {
          if (message._id !== messageId) return message;
          const list = message.reactions ?? [];
          const mine = list.some(
            reaction => reaction.user?._id === currentUserId && reaction.emoji === emoji,
          );

          if (mine) {
            return {
              ...message,
              reactions: list.filter(
                reaction => !(reaction.user?._id === currentUserId && reaction.emoji === emoji),
              ),
            };
          }

          return {
            ...message,
            reactions: [
              ...list,
              {
                emoji,
                createdAt: new Date().toISOString(),
                user: {
                  _id: currentUserId,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                  photo: currentUser.photo ?? null,
                },
              },
            ],
          };
        }),
      );

      try {
        const response = await API.post(`/chats/react/${messageId}`, { emoji });
        const reactions = response.data?.reactions;
        if (Array.isArray(reactions)) {
          setMessages(prev =>
            prev.map(message =>
              message._id === messageId ? { ...message, reactions } : message,
            ),
          );
        }
      } catch (error) {
        console.error('Error updating reaction:', error);
        // Roll back to the state we captured before the optimistic update.
        setMessages(prev =>
          prev.map(message =>
            message._id === messageId
              ? { ...message, reactions: previousReactions }
              : message,
          ),
        );
        toast.error('Could not update your reaction');
      } finally {
        pendingReactionsRef.current.delete(requestKey);
      }
    },
    [currentUser, currentUserId, messages, remember],
  );

  const toolbarSelectedEmojis = useMemo(() => {
    if (!reactionToolbar) return [] as string[];
    const target = messages.find(message => message._id === reactionToolbar.messageId);
    return (target?.reactions ?? [])
      .filter(reaction => reaction.user?._id === currentUserId)
      .map(reaction => reaction.emoji);
  }, [messages, reactionToolbar, currentUserId]);

  // Double-click (desktop) and double-tap (touch) both toggle ❤️. The two
  // paths share a timestamp guard so a browser that emits a synthetic dblclick
  // after a touch double-tap cannot toggle the reaction twice.
  const quickReact = useCallback(
    (messageId: string) => {
      doubleTapHandledAtRef.current = Date.now();
      cancelPendingAttachment();
      toggleReaction(messageId, QUICK_REACTION_EMOJI);
    },
    [cancelPendingAttachment, toggleReaction],
  );

  const handleMessageDoubleClick = useCallback(
    (messageId: string) => {
      if (Date.now() - doubleTapHandledAtRef.current < 600) return;
      quickReact(messageId);
    },
    [quickReact],
  );

  const handleMessagePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      longPressHandlers.onPointerUp();

      // Mouse users keep the native dblclick path below.
      if (event.pointerType === 'mouse' || !event.isPrimary) return;

      // A long press that just opened the toolbar must not count as the first
      // tap of a double-tap (dismissing the toolbar would add a heart).
      if (wasFired()) {
        lastTapRef.current = null;
        return;
      }

      const messageId = event.currentTarget.dataset.messageId;
      if (!messageId) return;

      const now = Date.now();
      const last = lastTapRef.current;

      if (last && last.messageId === messageId && now - last.at <= 320) {
        lastTapRef.current = null;
        // Swallow the click that follows the second tap (attachments would
        // otherwise open while the reaction is being added).
        suppressClickRef.current += 1;
        window.setTimeout(() => {
          suppressClickRef.current = 0;
        }, 600);
        quickReact(messageId);
        return;
      }

      lastTapRef.current = { messageId, at: now };
    },
    [longPressHandlers, quickReact, wasFired],
  );

  const renderAvatar = (user: { firstName: string; lastName: string; photo?: string }, size = 'h-10 w-10') => (
    <Avatar className={`${size} border border-white shadow-sm`}>
      {user.photo ? <AvatarImage src={user.photo} alt={`${user.firstName} ${user.lastName}`} /> : null}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
        {initialsOf(user.firstName, user.lastName)}
      </AvatarFallback>
    </Avatar>
  );

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[540px] w-full flex-col bg-slate-100/70 p-3 sm:p-4 md:h-[calc(100dvh-4.75rem)] lg:p-5">
      <div className="mx-auto flex h-full w-full max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-20px_rgba(15,23,42,0.25)]">
        {/* Conversation list */}
        <aside
          className={`w-full shrink-0 flex-col border-r border-slate-200 bg-white sm:flex sm:w-[320px] lg:w-[360px] ${
            selectedUser ? 'hidden' : 'flex'
          }`}
        >
          <div className="border-b border-slate-100 px-4 pb-3 pt-4 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight text-slate-900">Messages</h1>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {totalUnread > 99 ? '99+' : totalUnread} unread
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {chatUsers.length > 0
                    ? `${chatUsers.length} conversation${chatUsers.length === 1 ? '' : 's'}`
                    : 'Team conversations live here'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessagesSquare className="h-[18px] w-[18px]" />
              </div>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teammates..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3 pt-1">
            {showSearchResults ? (
              <>
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {isSearching ? 'Searching…' : 'Search results'}
                </p>

                {isSearching ? (
                  <div className="space-y-2 px-2 py-3">
                    {[0, 1, 2].map(row => (
                      <div key={row} className="flex animate-pulse items-center gap-3 rounded-xl px-2 py-2">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-28 rounded bg-slate-200" />
                          <div className="h-3 w-40 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-700">No teammates found</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try a different name or email address.
                    </p>
                  </div>
                ) : (
                  searchResults.map(user => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      {renderAvatar(user)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.role && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              {user.role}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                        Chat
                      </span>
                    </button>
                  ))
                )}
              </>
            ) : usersLoading ? (
              <div className="space-y-2 px-2 py-3">
                {[0, 1, 2, 3].map(row => (
                  <div key={row} className="flex animate-pulse items-center gap-3 rounded-xl px-2 py-2">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-slate-200" />
                      <div className="h-3 w-44 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatUsers.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">No conversations yet</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Search for a teammate above and send your first message.
                </p>
              </div>
            ) : (
              <>
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </p>
                {chatUsers.map(user => {
                  const isActive = selectedUser?._id === user._id;
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? 'bg-blue-50 ring-1 ring-inset ring-blue-100'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {renderAvatar(user)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive ? 'text-blue-700' : 'text-slate-900'
                            }`}
                          >
                            {user.firstName} {user.lastName}
                          </p>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {user.lastMessageTime && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {formatListTime(user.lastMessageTime)}
                              </span>
                            )}
                            {(user.unreadCount || 0) > 0 && (
                              <span className="min-w-[18px] rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                                {(user.unreadCount || 0) > 99 ? '99+' : user.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          className={`truncate text-xs ${
                            (user.unreadCount || 0) > 0
                              ? 'font-semibold text-slate-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {user.lastMessage?.trim() || 'Say hello 👋'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </aside>

        {/* Conversation */}
        <section
          className={`min-w-0 flex-1 flex-col bg-slate-50/60 sm:flex ${
            selectedUser ? 'flex' : 'hidden'
          }`}
        >
          {selectedUser ? (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Back to conversations"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  {renderAvatar(selectedUser, 'h-9 w-9 sm:h-10 sm:w-10')}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                      {selectedUser.role && (
                        <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          {selectedUser.role}
                        </span>
                      )}
                      <span className="truncate">{selectedUser.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {isSelectionMode ? (
                    <>
                      {selectedMessages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete ({selectedMessages.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:block"
                      >
                        {selectedMessages.length === messages.length ? 'Clear all' : 'Select all'}
                      </button>
                      <button
                        type="button"
                        onClick={toggleSelectionMode}
                        aria-label="Exit selection mode"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={toggleSelectionMode}
                      disabled={messages.length === 0}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Select
                    </button>
                  )}
                </div>
              </header>

              <div
                ref={messagesScrollRef}
                className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-6"
              >
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[0, 1, 2].map(row => (
                      <div
                        key={row}
                        className={`flex ${row % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className="h-14 w-40 animate-pulse rounded-2xl bg-slate-200/70 sm:w-52" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                      <MessagesSquare className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">
                      Start the conversation
                    </p>
                    <p className="mt-1 max-w-xs text-sm text-slate-500">
                      Send {selectedUser.firstName} a message — share an update, a file, or a quick
                      hello.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messageGroups.map((group, groupIndex) => {
                      const firstMessage = group.messages[0];
                      const lastMessage = group.messages[group.messages.length - 1];
                      const previousGroup = messageGroups[groupIndex - 1];

                      const showDayLabel =
                        !previousGroup ||
                        !sameDay(
                          new Date(previousGroup.messages[0].createdAt),
                          new Date(firstMessage.createdAt),
                        );

                      return (
                        <React.Fragment key={group.key}>
                          {showDayLabel && (
                            <Marker variant="separator" className="my-4 px-1">
                              <MarkerContent className="text-[11px] font-medium">
                                {formatDayLabel(firstMessage.createdAt)}
                              </MarkerContent>
                            </Marker>
                          )}

                          <MessageItem
                            align={group.isMine ? 'end' : 'start'}
                            className={`items-end ${showDayLabel ? 'mt-1' : 'mt-3'}`}
                          >
                            <MessageAvatar className="mb-4 bg-transparent">
                              {group.isMine ? (
                                <Avatar className="h-8 w-8 border border-white shadow-sm">
                                  {currentUser.photo ? (
                                    <AvatarImage
                                      src={currentUser.photo}
                                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                    />
                                  ) : null}
                                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-[10px] font-semibold text-white">
                                    {initialsOf(currentUser.firstName, currentUser.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                renderAvatar(group.sender, 'h-8 w-8')
                              )}
                            </MessageAvatar>

                            <MessageContent
                              className={`gap-1.5 ${group.isMine ? 'items-end' : 'items-start'}`}
                            >
                              <BubbleGroup
                                className={`w-full gap-1 ${
                                  group.isMine ? 'items-end' : 'items-start'
                                }`}
                              >
                                {group.messages.map(message => {
                                  const isSelected = selectedMessages.includes(message._id);
                                  const canReact =
                                    !isSelectionMode && !message.isDeletedForEveryone;
                                  const reactionHandlers = canReact
                                    ? {
                                        onPointerDown: (
                                          event: React.PointerEvent<HTMLDivElement>,
                                        ) => {
                                          longPressTargetRef.current = event.currentTarget;
                                          // Any new press supersedes a pending single-click
                                          // attachment open, so a fast second tap opens the
                                          // reaction instead of the file.
                                          cancelPendingAttachment();
                                          longPressHandlers.onPointerDown(event);
                                        },
                                        onPointerMove: longPressHandlers.onPointerMove,
                                        onPointerUp: handleMessagePointerUp,
                                        onPointerLeave: longPressHandlers.onPointerLeave,
                                        onPointerCancel: longPressHandlers.onPointerCancel,
                                      }
                                    : {};

                                  return (
                                    <div
                                      key={message._id}
                                      className={`flex w-full min-w-0 flex-col ${
                                        group.isMine ? 'items-end' : 'items-start'
                                      }`}
                                    >
                                      <Bubble
                                        variant={
                                          message.isDeletedForEveryone
                                            ? 'outline'
                                            : group.isMine
                                              ? 'default'
                                              : 'muted'
                                        }
                                        className="max-w-[85%] sm:max-w-[75%]"
                                      >
                                      <BubbleContent
                                        data-message-id={message._id}
                                        data-mine={group.isMine ? 'true' : 'false'}
                                        {...reactionHandlers}
                                        onClickCapture={
                                          canReact ? handleClickCapture : undefined
                                        }
                                        onDoubleClick={
                                          canReact
                                            ? () => handleMessageDoubleClick(message._id)
                                            : undefined
                                        }
                                        onContextMenu={
                                          canReact
                                            ? event => {
                                                event.preventDefault();
                                                openReactionToolbar(
                                                  message._id,
                                                  group.isMine,
                                                  event.currentTarget.getBoundingClientRect(),
                                                );
                                              }
                                            : undefined
                                        }
                                        onMouseDown={
                                          canReact
                                            ? event => {
                                                // Stop the browser from selecting a word on
                                                // the second click of a double-click.
                                                if (event.detail > 1) event.preventDefault();
                                              }
                                            : undefined
                                        }
                                        role={isSelectionMode ? 'button' : undefined}
                                        tabIndex={isSelectionMode ? 0 : undefined}
                                        onClick={
                                          isSelectionMode
                                            ? () => handleMessageSelect(message._id)
                                            : undefined
                                        }
                                        onKeyDown={
                                          isSelectionMode
                                            ? event => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                  event.preventDefault();
                                                  handleMessageSelect(message._id);
                                                }
                                              }
                                            : undefined
                                        }
                                        className={`text-[13px] ${
                                          message.isDeletedForEveryone
                                            ? 'border-dashed border-slate-300 bg-slate-100 text-slate-400'
                                            : group.isMine
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted text-slate-800'
                                        } ${isSelectionMode ? 'cursor-pointer' : ''} ${
                                          isSelected
                                            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50'
                                            : ''
                                        } ${
                                          canReact
                                            ? '[-webkit-touch-callout:none] [touch-action:manipulation] transition-shadow'
                                            : ''
                                        }`}
                                      >
                                        {message.isDeletedForEveryone ? (
                                          <span className="flex items-center gap-1.5 text-xs italic text-slate-400">
                                            <Ban className="h-3.5 w-3.5" />
                                            This message was deleted
                                          </span>
                                        ) : (
                                          <>
                                            {message.file && (
                                              <div className="mb-1.5">
                                                {message.file.type?.startsWith('image/') ? (
                                                  <img
                                                    src={message.file.path}
                                                    alt={message.file.name}
                                                    className="max-h-64 w-auto cursor-pointer rounded-lg object-cover"
                                                    onClick={() => {
                                                      if (isSelectionMode) return;
                                                      openAttachment(message.file!.path);
                                                    }}
                                                    onDoubleClick={event => event.preventDefault()}
                                                  />
                                                ) : message.file.type?.startsWith('video/') ? (
                                                  <video
                                                    controls
                                                    className="max-h-64 w-full rounded-lg"
                                                    src={message.file.path}
                                                  />
                                                ) : message.file.type?.startsWith('audio/') ? (
                                                  <audio
                                                    controls
                                                    className="w-56 max-w-full"
                                                    src={message.file.path}
                                                  />
                                                ) : (
                                                  <a
                                                    href={message.file.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={event => {
                                                      if (isSelectionMode) {
                                                        event.preventDefault();
                                                        return;
                                                      }
                                                      if (
                                                        event.metaKey ||
                                                        event.ctrlKey ||
                                                        event.shiftKey ||
                                                        event.button !== 0
                                                      ) {
                                                        return;
                                                      }
                                                      event.preventDefault();
                                                      openAttachment(message.file!.path);
                                                    }}
                                                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition ${
                                                      group.isMine
                                                        ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                  >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                                      <Icon
                                                        type={getIconType(message.file)}
                                                        size={18}
                                                      />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                      <span className="block truncate text-xs font-semibold">
                                                        {message.file.name}
                                                      </span>
                                                      <span
                                                        className={`block text-[10px] ${
                                                          group.isMine
                                                            ? 'text-blue-100'
                                                            : 'text-slate-500'
                                                        }`}
                                                      >
                                                        {formatBytes(message.file.size)}
                                                      </span>
                                                    </span>
                                                    <Download className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                                  </a>
                                                )}
                                              </div>
                                            )}

                                            {message.message?.trim() && (
                                              <p className="whitespace-pre-wrap break-words">
                                                {message.message}
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </BubbleContent>
                                    </Bubble>

                                    {canReact && (message.reactions?.length ?? 0) > 0 ? (
                                      <MessageReactions
                                        reactions={message.reactions ?? []}
                                        currentUserId={currentUserId}
                                        onToggle={emoji => toggleReaction(message._id, emoji)}
                                        className={`mt-1 ${
                                          group.isMine
                                            ? 'justify-end pr-1'
                                            : 'justify-start pl-1'
                                        }`}
                                      />
                                    ) : null}
                                  </div>
                                  );
                                })}
                              </BubbleGroup>

                              <MessageFooter
                                className={`px-1 text-[10px] ${
                                  group.isMine ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                {formatTime(lastMessage.createdAt)}
                                {group.isMine && !lastMessage.isDeletedForEveryone && (
                                  <span className="ml-1 inline-flex items-center">
                                    {lastMessage.read ? (
                                      <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5 text-slate-400" />
                                    )}
                                  </span>
                                )}
                              </MessageFooter>
                            </MessageContent>
                          </MessageItem>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} className="h-1" />
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-slate-200 bg-white px-3 py-3 sm:px-5">
                {selectedFile && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={selectedFile.name}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                        <Icon type={getIconType(selectedFile)} size={18} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{formatBytes(selectedFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      aria-label="Remove attachment"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="chat-file-input"
                    onChange={event => setSelectedFile(event.target.files?.[0] || null)}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach a file"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900"
                  >
                    <Paperclip className="h-[18px] w-[18px]" />
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={event => setNewMessage(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={`Message ${selectedUser.firstName}...`}
                    rows={1}
                    disabled={sending}
                    className="max-h-[132px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !selectedFile) || sending}
                    aria-label="Send message"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 hidden px-1 text-[10px] text-slate-400 sm:flex sm:items-center sm:gap-1">
                  <CircleCheck className="h-3 w-3" />
                  Press Enter to send · Shift + Enter for a new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                <MessagesSquare className="h-9 w-9" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-900">
                Pick a conversation to start
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Chat with your team, share files and keep everything in one place. Select someone
                from the list or search for a teammate.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  Secure & private
                </span>
                <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  File sharing
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Contact / shared files panel */}
        {selectedUser && (
          <aside className="hidden w-[280px] shrink-0 flex-col border-l border-slate-200 bg-white xl:flex">
            <div className="flex flex-col items-center border-b border-slate-100 px-5 py-6 text-center">
              {renderAvatar(selectedUser, 'h-16 w-16')}
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              {selectedUser.role && (
                <span className="mt-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                  {selectedUser.role}
                </span>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{selectedUser.email}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Shared files
                </p>
                <span className="text-[11px] font-medium text-slate-500">{sharedFiles.length}</span>
              </div>

              {sharedFiles.length === 0 ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-4 text-xs leading-relaxed text-slate-500">
                  Files you exchange in this chat will show up here.
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {sharedFiles.slice(0, 8).map((file, index) => (
                    <a
                      key={`${file.path}-${index}`}
                      href={file.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                        <Icon type={getIconType(file)} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-slate-700">
                          {file.name}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {formatBytes(file.size)}
                        </span>
                      </span>
                      <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-5 rounded-xl bg-blue-50/70 px-3 py-3">
                <p className="text-[11px] font-semibold text-blue-700">HRMS tip</p>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-700/80">
                  Use chat to coordinate quickly, but keep official requests in Tickets so they are
                  tracked.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Delete messages?</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    You are about to delete{' '}
                    <strong className="font-semibold text-slate-700">
                      {selectedMessages.length}
                    </strong>{' '}
                    message{selectedMessages.length > 1 ? 's' : ''}. This cannot be undone.
                  </p>
                </div>
              </div>

              {hasReceivedMessagesSelected() && (
                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700">
                  Received messages can only be deleted from your own chat feed.
                </p>
              )}

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => deleteMessages(false)}
                  className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  For me
                </button>

                {!hasReceivedMessagesSelected() && (
                  <button
                    type="button"
                    onClick={() => deleteMessages(true)}
                    className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    For everyone
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactionToolbar
        anchorRect={reactionToolbar?.rect ?? null}
        selectedEmojis={toolbarSelectedEmojis}
        recents={recents}
        onSelect={emoji => {
          if (!reactionToolbar) return;
          const messageId = reactionToolbar.messageId;
          setReactionToolbar(null);
          toggleReaction(messageId, emoji);
        }}
        onClose={closeReactionToolbar}
      />
    </div>
  );
};

export default ChatMain;
