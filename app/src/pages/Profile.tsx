import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { profileApi, type Profile as ProfileType } from '@/api/profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, BookOpen, ArrowLeft, Edit } from 'lucide-react';

const Profile = () => {
    const { userId } = useParams<{ userId?: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        displayName: '',
        avatar: '',
    });

    const isOwnProfile = !userId || userId === currentUser?.id;

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await profileApi.getProfile(userId);
            setProfile(data);
            setEditData({
                displayName: data.user.displayName || '',
                avatar: data.user.avatar || '',
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await profileApi.updateProfile(editData);
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-light to-cyan-light">
                <div className="text-lg text-blue-700">Loading profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertDescription>{error || 'Profile not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-light to-cyan-light">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md shadow-md border-b border-blue-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Header Card */}
                <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg animate-fade-in-up">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-dark flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                    {profile.user.avatar ? (
                                        <img
                                            src={profile.user.avatar}
                                            alt={profile.user.displayName}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        profile.user.displayName?.charAt(0).toUpperCase() || profile.user.username.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* User Info */}
                                <div>
                                    <h2 className="text-2xl font-bold">{profile.user.displayName || profile.user.username}</h2>
                                    <p className="text-gray-600">@{profile.user.username}</p>
                                    <p className="text-sm text-gray-500">{profile.user.email}</p>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Profile</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="displayName">Display Name</Label>
                                                <Input
                                                    id="displayName"
                                                    value={editData.displayName}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, displayName: e.target.value })
                                                    }
                                                    placeholder="Your cute display name"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="avatar">Avatar URL</Label>
                                                <Input
                                                    id="avatar"
                                                    value={editData.avatar}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, avatar: e.target.value })
                                                    }
                                                    placeholder="https://example.com/avatar.jpg"
                                                />
                                            </div>
                                            <Button onClick={handleUpdateProfile} className="w-full">
                                                Save Changes
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Joined Events */}
                    <Card className="bg-white/95 backdrop-blur-md shadow-lg border border-blue-100 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Joined Events ({profile.joinedEvents.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.joinedEvents.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No events joined yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {profile.joinedEvents.slice(0, 5).map((event: any) => (
                                        <div
                                            key={event._id}
                                            className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-sky-light hover:shadow-md hover:border-blue-300 border border-transparent transition-all cursor-pointer"
                                            onClick={() => navigate(`/events/${event._id}/chat`)}
                                        >
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User's Blogs */}
                    <Card className="bg-white/95 backdrop-blur-md shadow-lg border border-blue-100 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-cyan-dark" />
                                Blogs ({profile.blogs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.blogs.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No blogs written yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {profile.blogs.slice(0, 5).map((blog: any) => (
                                        <div
                                            key={blog._id}
                                            className="p-3 rounded-lg bg-gradient-to-r from-cyan-light to-sky-light hover:shadow-md hover:border-blue-300 border border-transparent transition-all cursor-pointer"
                                            onClick={() => navigate('/blogs')}
                                        >
                                            <h3 className="font-semibold">{blog.title}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
