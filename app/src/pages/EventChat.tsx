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
    <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid flex flex-col">
      {/* Header */}
      <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-ice-gray hover:text-ice-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold text-ice-white">{event.title}</h1>
              <p className="text-sm text-ice-gray font-body">Event Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-ice-gray">
              <Users className="w-4 h-4 text-aurora-purple" />
              <span>{event.attendees.length} attendees</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-aurora-green shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-aurora-pink'}`} />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 overflow-hidden">
        <Card className="h-[calc(100vh-200px)] flex flex-col bg-arctic-deep/60 backdrop-blur-md border border-aurora-cyan/20 shadow-xl">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-aurora-cyan/20 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="text-center text-ice-gray py-8 font-body">
                <p>No messages yet. Start the conversation! 🐧</p>
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
                    <span className="text-xs text-ice-dark italic my-2 px-3 py-1 bg-arctic-light/10 rounded-full">
                      {msg.message} - {formatTime(msg.timestamp)}
                    </span>
                  ) : (
                    <>
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.username === user?.username
                          ? 'bg-gradient-to-r from-aurora-cyan to-aurora-purple text-arctic-deepest font-medium shadow-lg shadow-aurora-cyan/10 rounded-tr-none'
                          : 'bg-arctic-mid border border-ice-dark/30 text-ice-white shadow-md rounded-tl-none'
                          }`}
                      >
                        <div className={`text-xs mb-1 font-bold ${msg.username === user?.username ? 'text-arctic-deepest/70' : 'text-aurora-purple'}`}>
                          {msg.username || 'Unknown'}
                        </div>
                        <div className="break-words">{msg.message || ''}</div>
                      </div>
                      <span className="text-[10px] text-ice-dark mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </>
                  )}
                </div>
              ))
            )}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-aurora-cyan font-mono animate-pulse">
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </div>

      {/* Message Input */}
      <div className="bg-arctic-deep/80 backdrop-blur-xl border-t border-aurora-cyan/20 py-4 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="flex-1 bg-arctic-mid/50 border-aurora-cyan/30 text-ice-white placeholder:text-ice-dark focus:border-aurora-cyan focus:ring-aurora-cyan/20 backdrop-blur-sm transition-all"
              disabled={!isConnected}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="bg-aurora-cyan text-arctic-deepest hover:bg-aurora-cyan/90 font-bold shadow-lg shadow-aurora-cyan/20 transition-all hover:scale-105 active:scale-95"
            >
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
