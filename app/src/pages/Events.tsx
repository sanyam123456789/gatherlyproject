import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { eventsApi, type Event } from '@/api/events';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, MessageCircle, Plus, LogOut, BookOpen, UserCircle } from 'lucide-react';
import EventCategoryBadge from '@/components/EventCategoryBadge';
import SettingsDialog from '@/components/SettingsDialog';

const Events = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const socketRef = useRef<Socket | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: 50,
    category: 'concert' as 'concert' | 'travel' | 'trekking'
  });

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Setup Socket.io for real-time mock events
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002';
    socketRef.current = io(socketUrl, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to event updates');
    });

    // Listen for new mock events
    socketRef.current.on('new-mock-event', (mockEvent: any) => {
      console.log('Received new mock event:', mockEvent.title);
      setEvents((prev) => [mockEvent, ...prev].slice(0, 50)); // Keep latest 50 events
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getAllEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await eventsApi.createEvent(formData);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        maxAttendees: 50,
        category: 'concert'
      });
      setDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await eventsApi.joinEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await eventsApi.leaveEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave event');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAttending = (event: Event) => {
    return event.attendees.some(attendee => attendee._id === user?.id);
  };

  // Filter events by category
  const filteredEvents = categoryFilter === 'all'
    ? events
    : events.filter(e => e.category === categoryFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-light to-cyan-light">
        <div className="text-lg text-blue-700">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-light to-cyan-light">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-md border-b border-blue-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-dark bg-clip-text text-transparent">
            🎉 Gatherly Events
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-700">Welcome, <strong>{user?.displayName || user?.username}</strong>! 👋</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/blogs')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Blogs
            </Button>
            <SettingsDialog />
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions Bar with Category Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Discover Events</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-dark hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>Fill in the details to create a new event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe your event"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date & Time</Label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="Event location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      name="maxAttendees"
                      type="number"
                      value={formData.maxAttendees}
                      onChange={handleChange}
                      min={1}
                      max={1000}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Event'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter Tabs */}
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="all" className="flex-1">All Events</TabsTrigger>
              <TabsTrigger value="concert" className="flex-1">🎵 Concerts</TabsTrigger>
              <TabsTrigger value="travel" className="flex-1">✈️ Travel</TabsTrigger>
              <TabsTrigger value="trekking" className="flex-1">🏔 Trekking</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {events.length === 0 ? 'No events yet. Create the first one!' : 'No events in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="flex flex-col bg-white/95 backdrop-blur-md shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-blue-100 animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg flex-1">{event.title}</CardTitle>
                    {event.category && <EventCategoryBadge category={event.category} />}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees.length} / {event.maxAttendees} attendees</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created by {event.creator.username}
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    {isAttending(event) ? (
                      <>
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={() => navigate(`/events/${event._id}/chat`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleLeaveEvent(event._id)}
                        >
                          Leave Event
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleJoinEvent(event._id)}
                        disabled={event.attendees.length >= event.maxAttendees}
                      >
                        {event.attendees.length >= event.maxAttendees ? 'Event Full' : 'Join Event'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/blogs')}>
            View Blogs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Events;
