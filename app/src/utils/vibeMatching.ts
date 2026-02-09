// Vibe Matching System for Gatherly
// Analyzes user Event attendance patterns to determine their "vibe"
// and recommend matching events

import type { Event } from '@/api/events';

export type VibeType = 'party' | 'adventure' | 'culture' | 'social' | 'explorer';

export interface VibeProfile {
    primaryVibe: VibeType;
    vibeScores: Record<VibeType, number>;
    vibePercentages: Record<VibeType, number>;
    totalScore: number;
}

export interface VibeConfig {
    emoji: string;
    label: string;
    color: string;
    description: string;
}

export const VIBE_CONFIGS: Record<VibeType, VibeConfig> = {
    party: {
        emoji: '🎉',
        label: 'Party Animal',
        color: 'from-aurora-pink to-vibe-concert',
        description: 'You love concerts, large events, and evening gatherings!'
    },
    adventure: {
        emoji: '🏔️',
        label: 'Adventure Seeker',
        color: 'from-vibe-trek to-aurora-green',
        description: 'Trekking and travel fuel your soul!'
    },
    culture: {
        emoji: '🎭',
        label: 'Culture Vulture',
        color: 'from-aurora-purple to-aurora-cyan',
        description: 'You appreciate intimate, cultural experiences.'
    },
    social: {
        emoji: '🦋',
        label: 'Social Butterfly',
        color: 'from-aurora-cyan to-aurora-purple',
        description: 'You thrive on connections and community!'
    },
    explorer: {
        emoji: '🧭',
        label: 'Curious Explorer',
        color: 'from-aurora-cyan via-aurora-green to-vibe-travel',
        description: 'You love trying diverse experiences!'
    }
};

/**
 * Calculate a user's vibe profile based on their attended events
 * @param userId - Current user's ID
 * @param allEvents - All events in the system
 * @returns VibeProfile with scores and primary vibe
 */
export function calculateVibeProfile(userId: string, allEvents: Event[]): VibeProfile {
    // Filter events the user has attended
    const attendedEvents = allEvents.filter(event =>
        event.attendees.some(attendee => attendee._id === userId)
    );

    // Initialize scores
    const scores: Record<VibeType, number> = {
        party: 0,
        adventure: 0,
        culture: 0,
        social: 0,
        explorer: 0
    };

    // If user hasn't attended any events, return default explorer vibe
    if (attendedEvents.length === 0) {
        return {
            primaryVibe: 'explorer',
            vibeScores: scores,
            vibePercentages: { party: 0, adventure: 0, culture: 0, social: 0, explorer: 100 },
            totalScore: 0
        };
    }

    attendedEvents.forEach(event => {
        // Category-based scoring
        if (event.category === 'concert') {
            scores.party += 3;
            scores.culture += 1;
        }
        if (event.category === 'trekking') {
            scores.adventure += 3;
            scores.explorer += 1;
        }
        if (event.category === 'travel') {
            scores.adventure += 2;
            scores.explorer += 2;
        }
        if (event.category === 'workshop' || event.category === 'seminar') {
            scores.culture += 2;
            scores.explorer += 1;
        }

        // Event size scoring
        const attendeeCount = event.attendees.length;
        if (attendeeCount > 50) {
            scores.party += 2;
        } else if (attendeeCount < 15) {
            scores.culture += 2;
        }

        // Max attendees scoring
        if (event.maxAttendees > 100) {
            scores.party += 1;
        } else if (event.maxAttendees <= 20) {
            scores.culture += 1;
        }

        // Every event increases social score (community engagement)
        scores.social += 1;

        // Diverse event attendance increases explorer score
        scores.explorer += 0.5;
    });

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    // Calculate percentages
    const vibePercentages: Record<VibeType, number> = {
        party: Math.round((scores.party / totalScore) * 100) || 0,
        adventure: Math.round((scores.adventure / totalScore) * 100) || 0,
        culture: Math.round((scores.culture / totalScore) * 100) || 0,
        social: Math.round((scores.social / totalScore) * 100) || 0,
        explorer: Math.round((scores.explorer / totalScore) * 100) || 0
    };

    // Determine primary vibe (highest score)
    const primaryVibe = (Object.entries(scores).reduce((a, b) =>
        scores[a[0] as VibeType] > scores[b[0] as VibeType] ? a : b
    )[0]) as VibeType;

    return {
        primaryVibe,
        vibeScores: scores,
        vibePercentages,
        totalScore
    };
}

/**
 * Calculate vibe match score between user's vibe and an event
 * @param userVibe - User's vibe profile
 * @param event - Event to match against
 * @returns Match score from 0-100
 */
export function calculateEventMatch(userVibe: VibeProfile, event: Event): number {
    let matchScore = 0;

    // Category matching
    const categoryScores: Record<string, Record<VibeType, number>> = {
        concert: { party: 30, culture: 10, social: 15, adventure: 0, explorer: 5 },
        trekking: { adventure: 30, explorer: 15, party: 0, culture: 5, social: 10 },
        travel: { adventure: 25, explorer: 20, culture: 10, party: 5, social: 10 },
        workshop: { culture: 25, explorer: 15, social: 10, party: 0, adventure: 5 },
        seminar: { culture: 30, explorer: 10, social: 10, party: 0, adventure: 0 }
    };

    if (event.category && categoryScores[event.category]) {
        matchScore += categoryScores[event.category][userVibe.primaryVibe] || 0;
    }

    // Size matching
    const attendeeCount = event.attendees.length;
    if (userVibe.primaryVibe === 'party' && attendeeCount > 30) {
        matchScore += 20;
    } else if (userVibe.primaryVibe === 'culture' && attendeeCount < 20) {
        matchScore += 20;
    } else if (userVibe.primaryVibe === 'social') {
        matchScore += 15; // Social butterflies like all events
    }

    // Explorer bonus for diverse event types
    if (userVibe.primaryVibe === 'explorer') {
        matchScore += 20;
    }

    // Cap at 100
    return Math.min(matchScore, 100);
}

/**
 * Get recommended events for a user based on their vibe
 * @param userVibe - User's vibe profile  
 * @param allEvents - All available events
 * @param limit - Maximum number of recommendations
 * @returns Sorted array of events with match scores
 */
export function getRecommendedEvents(
    userVibe: VibeProfile,
    allEvents: Event[],
    limit = 6
): Array<Event & { matchScore: number }> {
    const eventsWithScores = allEvents.map(event => ({
        ...event,
        matchScore: calculateEventMatch(userVibe, event)
    }));

    return eventsWithScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
}
