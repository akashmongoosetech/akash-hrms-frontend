import React from 'react';
import { Card, StatusBadge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/toast';
import { Messages, Users, Settings, Search, Mic, Video, Phone, Heart, Info } from 'lucide-react';

interface ChatChannel {
  _id: string;
  name: string;
  type: 'direct' | 'group';
  participants: number;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: 'online' | 'offline';
}

interface ChatStats {
  label: string;
  value: number;
  variant: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  icon: React.ComponentType;
}

const chatChannels: ChatChannel[] = [
  { _id: '1', name: 'HR Team', type: 'group', participants: 12, lastMessage: 'John: Happy Friday!', lastTime: '2m', unread: 3, status: 'online' },
  { _id: '2', name: 'Engineering', type: 'group', participants: 8, lastMessage: 'Jane: PR #42 merged', lastTime: '15m', unread: 0, status: 'online' },
  { _id: '3', name: 'Direct: Manager', type: 'direct', participants: 2, lastMessage: 'Schedule meeting?', lastTime: '1h', unread: 1, status: 'online' },
  { _id: '4', name: 'Admin', type: 'group', participants: 5, lastMessage: 'Policy update', lastTime: '3h', unread: 0, status: 'offline' },
  { _id: '5', name: 'All Employees', type: 'group', participants: 47, lastMessage: 'Announcement: Holiday schedule', lastTime: '6h', unread: 5, status: 'online' },
];

const ChatStats = {
  online: 34,
  offline: 12,
  totalMessages: 12847,
};

const ChatPage: React.FC = () => {
  const { notify } = useToast();

  const handleStartChat = (channelId: string) => {
    notify({
      title: 'Chat Started',
      description: `Opened conversation with ${chatChannels.find(c => c._id === channelId)?.name}`,
      variant: 'primary',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Messages className="h-5 w-5 text-primary" />
            <span className="text-xl font-semibold text-gray-900">HRMS Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
            <Video className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
            <Phone className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Chat Layout */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Left: Channels List */}
        <aside className="w-64 shrink-0 bg-white rounded-2xl shadow-soft flex flex-col">
          {/* Channels Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Channels</h3>
              <span className="text-xs text-gray-500">1:1 & Groups</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Direct messages and group chats</p>
          </div>

          {/* Channels List */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-2">
              {/* Search */}
              <div className="mb-4">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  className="w-full rounded-md border input p-2 pl-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Channel Items */}
              {chatChannels.map((channel) => (
                <div
                  key={channel._id}
                  className={`flex items-center gap-3 py-3 px-2 rounded-md hover:bg-primary/5 transition-colors ${channel.unread > 0 ? 'font-medium text-primary' : ''}`}
                  onClick={() => handleStartChat(channel._id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${channel.name} channel`}
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: channel.status === 'online' ? 'var(--primary)' : 'var(--muted)', color: 'white' }}>
                    <Messages className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{channel.name}</p>
                    <p className="text-xs text-gray-500">{channel.participants} participants</p>
                  </div>
                  {channel.unread > 0 && (
                    <span className="ml-2 bg-primary text-xs font-medium text-primary-foreground rounded-pill px-2 py-0.5">
                      {channel.unread}
                    </span>
                  )}
                </div>
              ))}

              {/* New Channel Button */}
              <div className="mt-4 pt-4 border-t border-border">
                <button className="w-full flex items-center justify-center py-2 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  <Plus className="h-4 w-4 mr-2" /> Start New Channel
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Right: Chat Area */}
        <section className="flex-1 bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white rounded-t-2xl shadow-soft p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                <Messages className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">HR Team</h2>
                <p className="text-xs text-gray-500">Group chat with 12 members</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <StatusBadge status="online" size="sm" />
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-96 overflow-y-auto space-y-4 p-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="flex items-start gap-3">
                <Avatar className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="bg-white rounded-xl shadow-soft p-3 max-w-xs flex-1">
                  <p className="text-sm text-gray-900">{`Message ${num}`}</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-white">
            <form className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-md border input p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button variant="primary" type="submit">
                <Send className="h-4 w-4" /> Send
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;