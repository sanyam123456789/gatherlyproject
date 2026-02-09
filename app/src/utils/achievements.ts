// Achievement system for Gatherly - Penguin Rewards 🐧
// Gamification to encourage engagement and reward milestones

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    total: number;
    rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const ACHIEVEMENT_DEFINITIONS = [
    {
        id: 'first_event',
        name: 'First Steps',
        description: 'Join your first event',
        icon: '🐣',
        total: 1,
        rarity: 'bronze' as const,
        check: (stats: UserStats) => stats.eventsJoined
    },
    {
        id: 'social_penguin',
        name: 'Social Penguin',
        description: 'Join 5 events',
        icon: '🐧',
        total: 5,
        rarity: 'silver' as const,
        check: (stats: UserStats) => stats.eventsJoined
    },
    {
        id: 'party_animal',
        name: 'Party Animal',
        description: 'Join 10 events',
        icon: '🎉',
        total: 10,
        rarity: 'gold' as const,
        check: (stats: UserStats) => stats.eventsJoined
    },
    {
        id: 'ice_breaker',
        name: 'Ice Breaker',
        description: 'Create your first event',
        icon: '❄️',
        total: 1,
        rarity: 'bronze' as const,
        check: (stats: UserStats) => stats.eventsCreated
    },
    {
        id: 'event_organizer',
        name: 'Event Organizer',
        description: 'Create 5 events',
        icon: '🎯',
        total: 5,
        rarity: 'silver' as const,
        check: (stats: UserStats) => stats.eventsCreated
    },
    {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Create 10 events',
        icon: '🏗️',
        total: 10,
        rarity: 'gold' as const,
        check: (stats: UserStats) => stats.eventsCreated
    },
    {
        id: 'vibe_master',
        name: 'Vibe Master',
        description: 'Get vibe-matched with 10 events',
        icon: '🌟',
        total: 10,
        rarity: 'gold' as const,
        check: (stats: UserStats) => stats.vibeMatches
    },
    {
        id: 'explorer',
        name: 'Arctic Explorer',
        description: 'Join events in 3 different categories',
        icon: '🧭',
        total: 3,
        rarity: 'silver' as const,
        check: (stats: UserStats) => stats.categoriesExplored
    },
    {
        id: 'week_streak',
        name: 'Committed Penguin',
        description: 'Join events for 3 consecutive weeks',
        icon: '🔥',
        total: 3,
        rarity: 'platinum' as const,
        check: (stats: UserStats) => stats.weekStreak
    },
    {
        id: 'super_social',
        name: 'Super Social',
        description: 'Have 20 people join your events',
        icon: '👥',
        total: 20,
        rarity: 'platinum' as const,
        check: (stats: UserStats) => stats.totalAttendeesHosted
    }
];

export interface UserStats {
    eventsJoined: number;
    eventsCreated: number;
    vibeMatches: number;
    categoriesExplored: number;
    weekStreak: number;
    totalAttendeesHosted: number;
}

/**
 * Calculate user stats from their event data
 */
export function calculateUserStats(userId: string, allEvents: any[]): UserStats {
    const joinedEvents = allEvents.filter(e =>
        e.attendees.some((a: any) => a._id === userId)
    );
    const createdEvents = allEvents.filter(e => e.creator._id === userId);

    // Calculate categories explored
    const categories = new Set(joinedEvents.map(e => e.category).filter(Boolean));

    // Calculate total attendees across user's created events
    const totalAttendeesHosted = createdEvents.reduce(
        (sum, event) => sum + event.attendees.length,
        0
    );

    return {
        eventsJoined: joinedEvents.length,
        eventsCreated: createdEvents.length,
        vibeMatches: 0, // Would track this separately
        categoriesExplored: categories.size,
        weekStreak: 0, // Would need date tracking
        totalAttendeesHosted
    };
}

/**
 * Check all achievements and return current status
 */
export function checkAchievements(stats: UserStats): Achievement[] {
    return ACHIEVEMENT_DEFINITIONS.map(def => {
        const progress = def.check(stats);
        return {
            id: def.id,
            name: def.name,
            description: def.description,
            icon: def.icon,
            unlocked: progress >= def.total,
            progress,
            total: def.total,
            rarity: def.rarity
        };
    });
}

/**
 * Get rarity color for achievements
 */
export function getRarityColor(rarity: Achievement['rarity']): string {
    const colors = {
        bronze: 'from-amber-600 to-amber-800',
        silver: 'from-slate-300 to-slate-500',
        gold: 'from-yellow-400 to-yellow-600',
        platinum: 'from-aurora-cyan to-aurora-purple'
    };
    return colors[rarity];
}

/**
 * Calculate achievement completion percentage
 */
export function getAchievementProgress(achievements: Achievement[]): number {
    const unlocked = achievements.filter(a => a.unlocked).length;
    return Math.round((unlocked / achievements.length) * 100);
}
