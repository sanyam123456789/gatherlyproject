// Mock event generator for real-time event demonstration

const concertEvents = [
    { title: 'Indie Rock Night Live', description: 'Join us for an electrifying evening with local indie bands and amazing vibes!', location: 'The Music Hall, Downtown' },
    { title: 'Jazz & Coffee Evening', description: 'Smooth jazz performances in a cozy cafe setting. Bring your friends!', location: 'Blue Note Cafe' },
    { title: 'Electronic Music Festival', description: 'Dance the night away with top DJs spinning the best electronic beats.', location: 'Riverside Arena' },
    { title: 'Classical Orchestra Concert', description: 'Experience the magic of classical music with our city orchestra.', location: 'Symphony Center' },
    { title: 'Pop Music Showcase', description: 'Upcoming pop artists performing their latest hits. Don\'t miss out!', location: 'Star Theatre' },
    { title: 'Rock Legends Tribute', description: 'Celebrating the greatest rock bands of all time with tribute performances.', location: 'Electric Garden' }
];

const travelEvents = [
    { title: 'Weekend Beach Getaway', description: 'Escape to pristine beaches and crystal-clear waters. Relaxation guaranteed!', location: 'Coastal Paradise Resort' },
    { title: 'Mountain Village Tour', description: 'Explore charming mountain villages and experience local culture.', location: 'Highland Valley' },
    { title: 'City Food Tour', description: 'Taste the best local cuisine and discover hidden food gems.', location: 'Food District, Old Town' },
    { title: 'Desert Safari Adventure', description: 'Experience the thrill of dune bashing and traditional desert camping.', location: 'Golden Dunes Desert' },
    { title: 'Island Hopping Expedition', description: 'Discover beautiful tropical islands and marine life.', location: 'Azure Islands' },
    { title: 'Historic City Walk', description: 'Walk through centuries of history in our guided heritage tour.', location: 'Heritage District' }
];

const trekkingEvents = [
    { title: 'Sunrise Mountain Trek', description: 'Wake up early and witness a breathtaking sunrise from the mountain peak.', location: 'Eagle Peak Trail' },
    { title: 'Forest Nature Walk', description: 'Peaceful walk through ancient forests with expert naturalist guides.', location: 'Evergreen Forest Reserve' },
    { title: 'Canyon Exploration', description: 'Navigate through stunning canyons and unique rock formations.', location: 'Red Rock Canyon' },
    { title: 'Waterfall Trail Adventure', description: 'Trek to hidden waterfalls and swim in natural pools.', location: 'Cascade Valley' },
    { title: 'Alpine Meadows Hike', description: 'Experience wildflower meadows and panoramic mountain views.', location: 'Alpine Heights' },
    { title: 'Coastal Cliff Trail', description: 'Hike along dramatic coastal cliffs with ocean views.', location: 'Windswept Shores' }
];

const categoryData = {
    concert: concertEvents,
    travel: travelEvents,
    trekking: trekkingEvents
};

/**
 * Generate a random mock event
 * @returns {Object} Mock event object
 */
function generateMockEvent() {
    const categories = ['concert', 'travel', 'trekking'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const events = categoryData[category];
    const eventTemplate = events[Math.floor(Math.random() * events.length)];

    // Generate random date between now and 30 days from now
    const daysFromNow = Math.floor(Math.random() * 30) + 1;
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(Math.floor(Math.random() * 12) + 10, Math.floor(Math.random() * 60), 0, 0);

    const maxAttendees = [20, 30, 40, 50, 75, 100][Math.floor(Math.random() * 6)];

    return {
        ...eventTemplate,
        category,
        date: date.toISOString(),
        maxAttendees,
        attendees: []
    };
}

/**
 * Generate multiple mock events
 * @param {number} count - Number of events to generate
 * @returns {Array} Array of mock events
 */
function generateMockEvents(count = 1) {
    const events = [];
    for (let i = 0; i < count; i++) {
        events.push(generateMockEvent());
    }
    return events;
}

module.exports = {
    generateMockEvent,
    generateMockEvents
};
