import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { afterglowApi, type Afterglow } from '@/api/afterglow';
import { eventsApi, type Event } from '@/api/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Plus, Edit, Trash2, User, Calendar, WifiOff, RefreshCw, Sparkles, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGrid from '@/components/PhotoGrid';
import AfterglowCardSkeleton from '@/components/AfterglowCardSkeleton';
import { useBackendStatus } from '@/utils/backendHealth';
import { saveToLocalStorage, getPendingPosts, markAsSynced, getPendingCount, clearSyncedPosts } from '@/utils/offlineStorage';

const Afterglow = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isOnline } = useBackendStatus();
    const [afterglows, setAfterglows] = useState<Afterglow[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAfterglow, setEditingAfterglow] = useState<Afterglow | null>(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        photos: [] as string[],
        eventRef: ''  // Event ID to link
    });

    useEffect(() => {
        fetchAfterglows();
        fetchUserEvents();
        updatePendingCount();

        // Try to sync pending posts on mount
        syncPendingPosts();
    }, []);

    const fetchUserEvents = async () => {
        try {
            const data = await eventsApi.getAllEvents();
            // Filter to only events user has joined
            const myEvents = data.filter(event =>
                event.attendees?.some(attendee =>
                    typeof attendee === 'string' ? attendee === user?.id : attendee._id === user?.id
                )
            );
            setEvents(myEvents);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    };

    const updatePendingCount = () => {
        setPendingCount(getPendingCount());
    };

    const fetchAfterglows = async () => {
        try {
            setIsLoading(true);
            const data = await afterglowApi.getAllAfterglows();
            setAfterglows(data);
            setError('');
        } catch (err: any) {
            console.error('Failed to fetch afterglows:', err);
            setError(err.response?.data?.message || 'Failed to load memories');
        } finally {
            setIsLoading(false);
        }
    };

    const syncPendingPosts = async () => {
        const pending = getPendingPosts();
        if (pending.length === 0) return;

        console.log(`Attempting to sync ${pending.length} pending post(s)...`);

        for (const post of pending) {
            try {
                const response = await afterglowApi.createAfterglow(post.data);
                markAsSynced(post.id, response._id);
                console.log(`✅ Synced: ${post.data.title}`);
            } catch (error) {
                console.warn(`❌ Failed to sync: ${post.data.title}`);
            }
        }

        // Clean up synced posts
        clearSyncedPosts();
        updatePendingCount();

        // Refresh the feed
        if (pending.length > 0) {
            fetchAfterglows();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotosChange = (photos: string[]) => {
        setFormData({
            ...formData,
            photos
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            tags: '',
            photos: [],
            eventRef: ''
        });
        setEditingAfterglow(null);
    };

    const handleOpenDialog = (afterglow?: Afterglow) => {
        if (afterglow) {
            setEditingAfterglow(afterglow);
            setFormData({
                title: afterglow.title,
                content: afterglow.content,
                tags: afterglow.tags.join(', '),
                photos: afterglow.photos || [],
                eventRef: afterglow.eventRef?._id || ''
            });
        } else {
            resetForm();
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const data = {
                title: formData.title,
                content: formData.content,
                tags,
                photos: formData.photos,
                eventRef: formData.eventRef || undefined
            };

            // Create optimistic post for immediate UI feedback
            const tempId = `temp-${Date.now()}`;
            const optimisticPost: Afterglow = {
                _id: tempId,
                title: data.title,
                content: data.content,
                tags: data.tags,
                photos: data.photos || [],
                // Don't include eventRef in optimistic post - will be populated from server
                author: {
                    _id: user!.id,
                    username: user!.username,
                    email: user!.email,
                    displayName: user?.displayName
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (editingAfterglow) {
                // Update existing
                await afterglowApi.updateAfterglow(editingAfterglow._id, data);
                setSuccessMessage('Afterglow updated! ✨');
            } else {
                // Create new - show optimistically
                setAfterglows(prev => [optimisticPost, ...prev]);
                handleCloseDialog();

                // Try backend
                try {
                    const response = await afterglowApi.createAfterglow(data);
                    // Replace temp with real
                    setAfterglows(prev => prev.map(a => a._id === tempId ? response : a));
                    setSuccessMessage('Afterglow shared! 🌟');
                } catch (apiError: any) {
                    // Backend failed - save to localStorage
                    const savedId = saveToLocalStorage(data);
                    // Update temp post to show pending status
                    setAfterglows(prev => prev.map(a =>
                        a._id === tempId ? { ...a, _id: savedId, isPending: true } as any : a
                    ));
                    setSuccessMessage('Saved locally. Will sync when online. 💾');
                    updatePendingCount();
                }
            }

            if (editingAfterglow) {
                handleCloseDialog();
                fetchAfterglows();
            }

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save Afterglow');
        } finally {
            setIsSubmitting(false);
            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    };

    const handleDelete = async (afterglowId: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) return;

        try {
            await afterglowApi.deleteAfterglow(afterglowId);
            fetchAfterglows();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete Afterglow');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isAuthor = (afterglow: Afterglow) => {
        return afterglow.author._id === user?.id;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
                <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Events
                            </Button>
                            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-aurora-cyan via-aurora-purple to-aurora-pink bg-clip-text text-transparent">
                                ✨ Afterglow
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <AfterglowCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
            {/* Header */}
            <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-ice-white hover:bg-aurora-cyan/10">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Events
                        </Button>
                        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-aurora-cyan via-aurora-purple to-aurora-pink bg-clip-text text-transparent">
                            ✨ Afterglow
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-ice-gray font-body hidden sm:inline">Welcome, <strong className="text-ice-white">{user?.displayName || user?.username}</strong>!</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Offline Mode Banner */}
                {!isOnline && (
                    <Alert className="mb-6 bg-aurora-pink/10 border-aurora-pink/30">
                        <WifiOff className="w-4 h-4 text-aurora-pink" />
                        <AlertTitle className="text-ice-white">Offline Mode</AlertTitle>
                        <AlertDescription className="text-ice-gray">
                            Your memories will be saved locally and synced when connection returns.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Success Message */}
                {successMessage && (
                    <Alert className="mb-6 bg-aurora-cyan/10 border-aurora-cyan/30">
                        <Sparkles className="w-4 h-4 text-aurora-cyan" />
                        <AlertDescription className="text-ice-white">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert className="mb-6 bg-aurora-pink/10 border-aurora-pink/30">
                        <AlertDescription className="text-ice-white">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-semibold text-ice-white">Shared Memories</h2>
                    <div className="flex gap-3">
                        {pendingCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={syncPendingPosts}
                                className="border-aurora-cyan/30 hover:bg-aurora-cyan/10 text-ice-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Sync ({pendingCount})
                            </Button>
                        )}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => handleOpenDialog()}
                                    className="bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50 transition-all duration-300"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Write Afterglow
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-arctic-deep border-aurora-cyan/30">
                                <DialogHeader>
                                    <DialogTitle className="text-ice-white font-display text-2xl">
                                        {editingAfterglow ? 'Edit Memory' : 'Share Your Afterglow'}
                                    </DialogTitle>
                                    <DialogDescription className="text-ice-gray">
                                        {editingAfterglow ? 'Update your memory.' : 'Relive and share your favorite event moments.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-ice-white">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Chasing Northern Lights"
                                            className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content" className="text-ice-white">Your Story</Label>
                                        <Textarea
                                            id="content"
                                            name="content"
                                            value={formData.content}
                                            onChange={handleChange}
                                            required
                                            placeholder="Share what made this moment special..."
                                            rows={6}
                                            className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-ice-white">Photos (up to 5)</Label>
                                        <PhotoUpload
                                            photos={formData.photos}
                                            onChange={handlePhotosChange}
                                        />
                                    </div>

                                    {/* Event Selector */}
                                    {events.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="eventRef" className="text-ice-white flex items-center gap-2">
                                                <Ticket className="w-4 h-4" />
                                                Link to Event (Optional)
                                            </Label>
                                            <select
                                                id="eventRef"
                                                name="eventRef"
                                                value={formData.eventRef}
                                                onChange={handleChange}
                                                className="w-full rounded-md bg-arctic-mid border border-ice-dark/30 text-ice-white px-3 py-2 focus:ring-2 focus:ring-aurora-cyan/50 focus:border-aurora-cyan"
                                            >
                                                <option value="">No event</option>
                                                {events.map(event => (
                                                    <option key={event._id} value={event._id}>
                                                        {event.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="tags" className="text-ice-white">Tags (comma-separated)</Label>
                                        <Input
                                            id="tags"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder="e.g., adventure, music, friends"
                                            className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" className="flex-1 bg-gradient-to-r from-aurora-cyan to-aurora-purple" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : editingAfterglow ? 'Update Memory' : 'Share Afterglow'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleCloseDialog} className="border-ice-dark/30 text-ice-white hover:bg-ice-dark/20">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Afterglows Grid */}
                {afterglows.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="text-8xl mb-6">🐧</div>
                        <h3 className="text-2xl font-display font-semibold text-ice-white mb-2">
                            No memories shared yet...
                        </h3>
                        <p className="text-ice-gray mb-6 max-w-md mx-auto">
                            Be the first to share an Afterglow! Relive your favorite event moments and let them glow forever. ✨
                        </p>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-gradient-to-r from-aurora-cyan to-aurora-purple hover:shadow-lg hover:shadow-aurora-cyan/50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Write Your First Afterglow
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {afterglows.map((afterglow: any) => (
                            <motion.div
                                key={afterglow._id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card className="flex flex-col bg-arctic-deep/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-aurora-purple/20 transition-shadow duration-300 border border-aurora-purple/30 h-full overflow-hidden">
                                    {/* Photo Grid */}
                                    {afterglow.photos && afterglow.photos.length > 0 && (
                                        <PhotoGrid photos={afterglow.photos} showLightbox />
                                    )}

                                    <CardHeader>
                                        <CardTitle className="text-lg font-display text-ice-white line-clamp-2">
                                            {afterglow.title}
                                            {afterglow.isPending && (
                                                <span className="ml-2 text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded">
                                                    ⏳ Pending Sync
                                                </span>
                                            )}
                                        </CardTitle>
                                        {/* Event Badge */}
                                        {afterglow.eventRef && (
                                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-aurora-purple/20 rounded-full text-aurora-purple text-sm border border-aurora-purple/30">
                                                <Ticket className="w-3 h-3" />
                                                <span>{afterglow.eventRef.title}</span>
                                            </div>
                                        )}
                                        <CardDescription className="flex items-center gap-4 text-sm text-ice-gray mt-2">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {afterglow.author.displayName || afterglow.author.username}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(afterglow.createdAt)}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col">
                                        <p className="text-ice-gray line-clamp-4 mb-4 flex-1 font-body">
                                            {afterglow.content}
                                        </p>

                                        {afterglow.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {afterglow.tags.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-aurora-purple/20 text-aurora-purple text-xs rounded-full border border-aurora-purple/30"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {isAuthor(afterglow) && (
                                            <div className="flex gap-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 border-aurora-cyan/30 hover:bg-aurora-cyan/10 text-ice-white"
                                                    onClick={() => handleOpenDialog(afterglow)}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleDelete(afterglow._id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Afterglow;
