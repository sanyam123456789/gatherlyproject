import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { eventsApi, type Event } from '@/api/events';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, MessageCircle, Plus, LogOut, BookOpen, UserCircle, Loader2 } from 'lucide-react';
import EventCategoryBadge from '@/components/EventCategoryBadge';
import SettingsDialog from '@/components/SettingsDialog';
import EventCardSkeleton from '@/components/EventCardSkeleton';
import AttendeeModal from '@/components/AttendeeModal';
import { FALLBACK_EVENTS } from '@/utils/mockEvents';

const Events = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<Event | null>(null);
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
      setError(''); // Clear any previous errors
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      const errorMessage = err.response?.data?.message || 'Could not connect to server';
      setError(errorMessage + '. Showing sample events.');
      // Use fallback mock events instead of showing empty UI
      setEvents(FALLBACK_EVENTS);
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
    setLoadingStates(prev => ({ ...prev, [eventId]: true }));
    try {
      await eventsApi.joinEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join event');
    } finally {
      setLoadingStates(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    setLoadingStates(prev => ({ ...prev, [`leave-${eventId}`]: true }));
    try {
      await eventsApi.leaveEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave event');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`leave-${eventId}`]: false }));
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
      <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
        <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-aurora-cyan via-aurora-purple to-aurora-pink bg-clip-text text-transparent">
              🐧 Gatherly Events
            </h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <EventCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
      {/* Glassmorphism Header */}
      <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-aurora-cyan via-aurora-purple to-aurora-pink bg-clip-text text-transparent">
            🐧 Gatherly
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-ice-gray font-body">Welcome, <strong className="text-ice-white font-mono">{user?.displayName || user?.username}</strong>! 👋</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="border-aurora-cyan/30 hover:border-aurora-cyan hover:bg-aurora-cyan/10 text-ice-white">
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/afterglow')} className="border-aurora-purple/30 hover:border-aurora-purple hover:bg-aurora-purple/10 text-ice-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Afterglow
            </Button>
            <SettingsDialog />
            <Button variant="outline" onClick={handleLogout} size="sm" className="border-aurora-pink/30 hover:border-aurora-pink hover:bg-aurora-pink/10 text-ice-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6 bg-aurora-pink/10 border-aurora-pink/30 text-ice-white">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions Bar with Category Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-display font-bold text-ice-white">Discover Events ✨</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50 transition-all duration-300 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-arctic-deep border-aurora-cyan/30">
                <DialogHeader>
                  <DialogTitle className="text-ice-white font-display text-2xl">Create New Event</DialogTitle>
                  <DialogDescription className="text-ice-gray">Fill in the details to create a new event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-ice-white">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter event title"
                      className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-ice-white">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe your event"
                      rows={3}
                      className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
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

          {/* Category Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${categoryFilter === 'all'
                ? 'bg-aurora-cyan text-arctic-deepest shadow-lg shadow-aurora-cyan/50 animate-glow-pulse'
                : 'bg-arctic-light/50 text-ice-gray hover:bg-arctic-light border border-ice-dark/30'
                }`}
            >
              All Events
            </button>
            <button
              onClick={() => setCategoryFilter('concert')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${categoryFilter === 'concert'
                ? 'bg-vibe-concert text-white shadow-lg shadow-vibe-concert/50 animate-glow-pulse'
                : 'bg-arctic-light/50 text-ice-gray hover:bg-arctic-light border border-ice-dark/30'
                }`}
            >
              🎵 Concerts
            </button>
            <button
              onClick={() => setCategoryFilter('travel')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${categoryFilter === 'travel'
                ? 'bg-vibe-travel text-white shadow-lg shadow-vibe-travel/50 animate-glow-pulse'
                : 'bg-arctic-light/50 text-ice-gray hover:bg-arctic-light border border-ice-dark/30'
                }`}
            >
              ✈️ Travel
            </button>
            <button
              onClick={() => setCategoryFilter('trekking')}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${categoryFilter === 'trekking'
                ? 'bg-vibe-trek text-white shadow-lg shadow-vibe-trek/50 animate-glow-pulse'
                : 'bg-arctic-light/50 text-ice-gray hover:bg-arctic-light border border-ice-dark/30'
                }`}
            >
              🏔 Trekking
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ice-gray text-lg font-body">
              {events.length === 0 ? 'No events yet. Create the first one! 🐧' : 'No events in this category yet.'}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredEvents.map((event) => {
              // Get category-specific glow color
              const glowColor = event.category === 'concert' ? 'vibe-concert' :
                event.category === 'travel' ? 'vibe-travel' :
                  event.category === 'trekking' ? 'vibe-trek' : 'aurora-cyan';

              return (
                <motion.div
                  key={event._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`flex flex-col bg-arctic-deep/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-${glowColor}/20 transition-shadow duration-300 border border-${glowColor}/30 h-full overflow-hidden`}>
                    {/* Event Cover Image */}
                    <div className={`h-40 bg-gradient-to-br ${event.category === 'concert' ? 'from-vibe-concert/80 to-vibe-concert/40' :
                      event.category === 'travel' ? 'from-vibe-travel/80 to-vibe-travel/40' :
                        event.category === 'trekking' ? 'from-vibe-trek/80 to-vibe-trek/40' :
                          'from-aurora-cyan/80 to-aurora-purple/40'
                      } flex items-end justify-end p-4`}>
                      <div className="bg-arctic-deepest/60 px-3 py-1 rounded-full text-xs font-mono text-ice-white backdrop-blur-sm">
                        {event.category || 'event'}
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl font-display text-ice-white flex-1">{event.title}</CardTitle>
                        {event.category && <EventCategoryBadge category={event.category} />}
                      </div>
                      <CardDescription className="line-clamp-2 text-ice-gray font-body">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-2 text-sm text-ice-gray mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-aurora-cyan" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-aurora-purple" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-aurora-green" />
                          <span>{event.attendees.length} / {event.maxAttendees} attendees</span>
                        </div>
                        <div className="text-xs text-ice-dark font-mono">
                          Created by {event.creator.username}
                        </div>
                      </div>

                      {/* Attendee Avatars */}
                      {event.attendees.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ice-dark/20">
                          <div className="flex -space-x-2">
                            {event.attendees.slice(0, 3).map((attendee, idx) => (
                              <div
                                key={attendee._id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-purple border-2 border-arctic-deep flex items-center justify-center text-xs font-bold text-white"
                                style={{ zIndex: 3 - idx }}
                              >
                                {attendee.username.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {event.attendees.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-ice-dark/30 border-2 border-arctic-deep flex items-center justify-center text-xs font-semibold text-ice-gray">
                                +{event.attendees.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-ice-gray font-body">
                            {event.attendees.slice(0, 2).map(a => a.username).join(', ')}
                            {event.attendees.length > 2 && ` +${event.attendees.length - 2} more`}
                          </div>
                        </div>
                      )}

                      <div className="mt-auto space-y-2">
                        {isAttending(event) ? (
                          <>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                className="w-full bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50 text-white"
                                onClick={() => navigate(`/events/${event._id}/chat`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Open Chat
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                variant="outline"
                                className="w-full border-aurora-pink/30 hover:border-aurora-pink hover:bg-aurora-pink/10 text-ice-white"
                                onClick={() => handleLeaveEvent(event._id)}
                                disabled={loadingStates[`leave-${event._id}`]}
                              >
                                {loadingStates[`leave-${event._id}`] ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Leaving...
                                  </>
                                ) : 'Leave Event'}
                              </Button>
                            </motion.div>
                          </>
                        ) : (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              className="w-full bg-gradient-to-r from-aurora-green to-aurora-cyan hover:shadow-lg hover:shadow-aurora-green/50 text-white"
                              onClick={() => handleJoinEvent(event._id)}
                              disabled={event.attendees.length >= event.maxAttendees || loadingStates[event._id]}
                            >
                              {loadingStates[event._id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Joining...
                                </>
                              ) : event.attendees.length >= event.maxAttendees ? 'Event Full' : 'Join Event'}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/afterglow')}>
            View Afterglow
          </Button>
        </div>
      </div>

      {/* Attendee Modal */}
      {selectedEventForAttendees && (
        <AttendeeModal
          open={Boolean(selectedEventForAttendees)}
          onClose={() => setSelectedEventForAttendees(null)}
          attendees={selectedEventForAttendees.attendees}
          eventTitle={selectedEventForAttendees.title}
        />
      )}
    </div>
  );
};

export default Events;
