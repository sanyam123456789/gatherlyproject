// Fallback mock events to show when API fails or database is empty
export const FALLBACK_EVENTS = [
    {
        _id: 'mock-1',
        title: '🎵 Jazz Night Under the Stars',
        description: 'Join us for an evening of smooth jazz and good vibes at the rooftop lounge. Featuring local artists and amazing city views!',
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        location: 'Skyline Rooftop Lounge, Downtown',
        category: 'concert' as const,
        attendees: [
            { _id: '1', username: 'FrostyPenguin247' },
            { _id: '2', username: 'CosmicExplorer88' },
            { _id: '3', username: 'ArcticWanderer42' }
        ],
        maxAttendees: 50,
        creator: {
            _id: '1',
            username: 'GatherlyBot',
            email: 'bot@gatherly.com'
        },
        imageUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'mock-2',
        title: '⛰️ Sunrise Trek to Eagle Peak',
        description: 'Early morning adventure to catch the sunrise from the highest point in the region. Moderate difficulty, all levels welcome!',
        date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        location: 'Eagle Peak Trailhead',
        category: 'trekking' as const,
        attendees: [
            { _id: '4', username: 'MountainVibes99' },
            { _id: '5', username: 'TrailBlazer456' }
        ],
        maxAttendees: 15,
        creator: {
            _id: '4',
            username: 'MountainVibes99',
            email: 'mountain@gatherly.com'
        },
        imageUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'mock-3',
        title: '✈️ Weekend Road Trip to Coastal Town',
        description: 'Spontaneous weekend getaway to explore hidden beaches and local seafood spots. Carpool available!',
        date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        location: 'Meeting Point: City Square',
        category: 'travel' as const,
        attendees: [
            { _id: '6', username: 'WanderlustSoul' },
            { _id: '7', username: 'BeachVibes777' },
            { _id: '8', username: 'SunnyAdventurer' },
            { _id: '9', username: 'OceanDreamer21' }
        ],
        maxAttendees: 8,
        creator: {
            _id: '6',
            username: 'WanderlustSoul',
            email: 'wanderlust@gatherly.com'
        },
        imageUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'mock-4',
        title: '🎸 Indie Music Festival',
        description: 'Three-day music festival featuring emerging indie bands. Food trucks, art installations, and great music!',
        date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
        location: 'Riverside Park',
        category: 'concert' as const,
        attendees: [
            { _id: '10', username: 'MusicLover42' },
            { _id: '11', username: 'IndieFan88' }
        ],
        maxAttendees: 200,
        creator: {
            _id: '10',
            username: 'MusicLover42',
            email: 'music@gatherly.com'
        },
        imageUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default FALLBACK_EVENTS;
