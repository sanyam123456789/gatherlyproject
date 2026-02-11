import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { profileApi, type Profile as ProfileType } from '@/api/profile';
import { eventsApi } from '@/api/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, BookOpen, ArrowLeft, Edit, Trophy, Award } from 'lucide-react';
import VibeBadge from '@/components/VibeBadge';
import { calculateVibeProfile, type VibeProfile } from '@/utils/vibeMatching';
import { checkAchievements, calculateUserStats, getRarityColor, getAchievementProgress, type Achievement } from '@/utils/achievements';

const Profile = () => {
    const { userId } = useParams<{ userId?: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState<ProfileType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [vibeProfile, setVibeProfile] = useState<VibeProfile | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
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

            // Calculate vibe profile and achievements
            const allEvents = await eventsApi.getAllEvents();
            const vibe = calculateVibeProfile(data.user.id, allEvents);
            setVibeProfile(vibe);

            const stats = calculateUserStats(data.user.id, allEvents);
            const userAchievements = checkAchievements(stats);
            setAchievements(userAchievements);
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
                <div className="text-lg text-aurora-cyan font-display">Loading profile... 🐧</div>
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
        <div className="min-h-screen bg-gradient-to-br from-arctic-deepest via-arctic-deep to-arctic-mid">
            {/* Header */}
            <header className="bg-arctic-deep/80 backdrop-blur-xl shadow-lg shadow-aurora-cyan/5 border-b border-aurora-cyan/20">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/events')} className="text-ice-white hover:bg-aurora-cyan/10 hover:text-aurora-cyan">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Events
                    </Button>
                    <h1 className="text-2xl font-display font-bold text-ice-white">Profile</h1>
                    <div className="w-24"></div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Header Card */}
                <Card className="mb-6 bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-cyan/30 animate-fade-in-up">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-purple flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-arctic-deep">
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
                                    <h2 className="text-2xl font-display font-bold text-ice-white">{profile.user.displayName || profile.user.username}</h2>
                                    <p className="text-aurora-cyan font-mono">@{profile.user.username}</p>
                                    <p className="text-sm text-ice-gray font-body">{profile.user.email}</p>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-aurora-purple/30 hover:bg-aurora-purple/10 text-ice-white hover:border-aurora-purple">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-arctic-deep border-aurora-cyan/30">
                                        <DialogHeader>
                                            <DialogTitle className="text-ice-white font-display">Edit Profile</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="displayName" className="text-ice-white">Display Name</Label>
                                                <Input
                                                    id="displayName"
                                                    value={editData.displayName}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, displayName: e.target.value })
                                                    }
                                                    placeholder="Your cute display name"
                                                    className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="avatar" className="text-ice-white">Avatar URL</Label>
                                                <Input
                                                    id="avatar"
                                                    value={editData.avatar}
                                                    onChange={(e) =>
                                                        setEditData({ ...editData, avatar: e.target.value })
                                                    }
                                                    placeholder="https://example.com/avatar.jpg"
                                                    className="bg-arctic-mid border-ice-dark/30 text-ice-white placeholder:text-ice-dark"
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

                {/* Vibe Profile Section */}
                {vibeProfile && (
                    <Card className="mb-6 bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-purple/30 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-ice-white font-display">
                                <Trophy className="w-5 h-5 text-aurora-purple" />
                                Your Vibe Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Primary Vibe Badge */}
                                <div className="flex items-center justify-center py-4">
                                    <VibeBadge vibe={vibeProfile.primaryVibe} size="lg" showDescription={true} />
                                </div>

                                {/* Vibe Breakdown */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-ice-white font-body">Vibe Breakdown</h4>
                                    {Object.entries(vibeProfile.vibePercentages)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([vibe, percentage]) => (
                                            <div key={vibe} className="space-y-1">
                                                <div className="flex justify-between text-xs text-ice-gray">
                                                    <span className="capitalize font-mono">{vibe}</span>
                                                    <span className="font-semibold">{percentage}%</span>
                                                </div>
                                                <div className="h-2 bg-arctic-mid rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-aurora-cyan to-aurora-purple transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                                <p className="text-xs text-ice-gray text-center italic mt-4 font-body">
                                    Based on {vibeProfile.totalScore > 0 ? 'your event attendance patterns' : 'join events to discover your vibe!'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Achievements Section */}
                {achievements.length > 0 && (
                    <Card className="mb-6 bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-green/30 animate-fade-in-up">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-ice-white font-display">
                                    <Award className="w-5 h-5 text-aurora-green" />
                                    Penguin Achievements
                                </CardTitle>
                                <span className="text-sm text-ice-gray font-mono">
                                    {getAchievementProgress(achievements)}% Complete
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className={`
                                            p-4 rounded-lg border-2 transition-all duration-200
                                            ${achievement.unlocked
                                                ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} border-transparent shadow-lg`
                                                : 'bg-arctic-mid/30 border-ice-dark/30 opacity-60'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-3xl">{achievement.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold text-sm ${achievement.unlocked ? 'text-white' : 'text-ice-gray'} font-display`}>
                                                    {achievement.name}
                                                </h4>
                                                <p className={`text-xs mt-1 ${achievement.unlocked ? 'text-white/80' : 'text-ice-dark'} font-body`}>
                                                    {achievement.description}
                                                </p>
                                                <div className="mt-2">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className={achievement.unlocked ? 'text-white/90' : 'text-ice-gray'}>
                                                            {achievement.progress} / {achievement.total}
                                                        </span>
                                                        {achievement.unlocked && (
                                                            <span className="font-semibold text-white capitalize text-[10px]">
                                                                {achievement.rarity}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white/90 transition-all duration-500"
                                                            style={{ width: `${Math.min((achievement.progress / achievement.total) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Joined Events */}
                    <Card className="bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-green/30 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-ice-white font-display">
                                <Calendar className="w-5 h-5 text-aurora-green" />
                                Joined Events ({profile.joinedEvents.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.joinedEvents.length === 0 ? (
                                <p className="text-ice-gray text-center py-4 font-body">No events joined yet 🐧</p>
                            ) : (
                                <div className="space-y-3">
                                    {profile.joinedEvents.slice(0, 5).map((event: any) => (
                                        <div
                                            key={event._id}
                                            className="p-3 rounded-lg bg-arctic-mid/50 border border-ice-dark/30 hover:border-aurora-green/50 hover:bg-arctic-mid transition-all cursor-pointer"
                                            onClick={() => navigate(`/events/${event._id}/chat`)}
                                        >
                                            <h3 className="font-semibold text-ice-white font-display">{event.title}</h3>
                                            <p className="text-sm text-ice-gray font-body">{formatDate(event.date)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User's Blogs */}
                    <Card className="bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-pink/30 animate-fade-in-up">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-ice-white font-display">
                                <BookOpen className="w-5 h-5 text-aurora-pink" />
                                Blogs ({profile.blogs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.blogs.length === 0 ? (
                                <p className="text-ice-gray text-center py-4 font-body">No blogs written yet 📝</p>
                            ) : (
                                <div className="space-y-3">
                                    {profile.blogs.slice(0, 5).map((blog: any) => (
                                        <div
                                            key={blog._id}
                                            className="p-3 rounded-lg bg-arctic-mid/50 border border-ice-dark/30 hover:border-aurora-pink/50 hover:bg-arctic-mid transition-all cursor-pointer"
                                            onClick={() => navigate('/blogs')}
                                        >
                                            <h3 className="font-semibold text-ice-white font-display">{blog.title}</h3>
                                            <p className="text-sm text-ice-gray font-body">
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
