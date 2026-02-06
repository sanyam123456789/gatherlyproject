import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { eventsApi, type Event } from '@/api/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  message: string;
  username: string;
  timestamp: string;
}

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const data = await eventsApi.getEventById(eventId);
        setEvent(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Setup Socket.io connection
  useEffect(() => {
    if (!eventId || !user) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002';

    socketRef.current = io(socketUrl, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);

      // Join event room
      socketRef.current?.emit('join-event', {
        eventId,
        username: user.username
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    // Listen for previous messages
    socketRef.current.on('previous-messages', (previousMessages: ChatMessage[]) => {
      setMessages(previousMessages);
    });

    // Listen for new messages
    socketRef.current.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for user joined/left notifications
    socketRef.current.on('user-joined', (notification: ChatMessage) => {
      setMessages((prev) => [...prev, notification]);
    });

    socketRef.current.on('user-left', (notification: ChatMessage) => {
      setMessages((prev) => [...prev, notification]);
    });

    // Listen for typing indicators
    socketRef.current.on('user-typing', ({ username, isTyping }: { username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        } else {
          return prev.filter((u) => u !== username);
        }
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [eventId, user, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !eventId || !user) return;

    socketRef.current.emit('send-message', {
      eventId,
      message: newMessage.trim(),
      username: user.username
    });

    setNewMessage('');

    // Stop typing indicator
    socketRef.current.emit('typing', {
      eventId,
      username: user.username,
      isTyping: false
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Emit typing indicator
    if (socketRef.current && eventId && user) {
      socketRef.current.emit('typing', {
        eventId,
        username: user.username,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading event chat...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || 'Event not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{event.title}</h1>
              <p className="text-sm text-gray-500">Event Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.attendees.length} attendees</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 overflow-hidden">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.username === user?.username
                      ? 'items-end'
                      : msg.username === 'System'
                        ? 'items-center'
                        : 'items-start'
                    }`}
                >
                  {msg.username === 'System' ? (
                    <span className="text-xs text-gray-400 italic">
                      {msg.message} - {formatTime(msg.timestamp)}
                    </span>
                  ) : (
                    <>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.username === user?.username
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                          }`}
                      >
                        <div className="text-xs opacity-75 mb-1">{msg.username}</div>
                        <div>{msg.message}</div>
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </>
                  )}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                <span className="animate-pulse">...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t py-4">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="flex-1"
              disabled={!isConnected}
            />
            <Button type="submit" disabled={!newMessage.trim() || !isConnected}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventChat;
