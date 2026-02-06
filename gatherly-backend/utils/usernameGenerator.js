// Cute username generator for unique display names
const adjectives = [
    'Fluffy', 'Cozy', 'Happy', 'Cheerful', 'Bouncy', 'Sunny', 'Dreamy',
    'Sparkly', 'Gentle', 'Peaceful', 'Jolly', 'Merry', 'Sweet', 'Lovely',
    'Bright', 'Shiny', 'Playful', 'Friendly', 'Warm', 'Soft', 'Snowy',
    'Arctic', 'Frosty', 'Icy', 'Chilly', 'Cool', 'Breezy', 'Misty'
];

const nouns = [
    'Penguin', 'Panda', 'Koala', 'Otter', 'Bunny', 'Kitty', 'Puppy',
    'Fox', 'Bear', 'Owl', 'Deer', 'Seal', 'Dolphin', 'Hedgehog',
    'Squirrel', 'Raccoon', 'Wombat', 'Narwhal', 'Whale', 'Cloud',
    'Star', 'Moon', 'Sunset', 'Rainbow', 'Breeze', 'Wave', 'River',
    'Waddler', 'Buddy', 'Friend', 'Pal', 'Mate', 'Chum', 'Explorer'
];

/**
 * Generate a unique cute username
 * @returns {string} A cute username like "FluffyPenguin42"
 */
function generateCuteUsername() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adjective}${noun}${number}`;
}

/**
 * Generate multiple username options
 * @param {number} count - Number of usernames to generate
 * @returns {string[]} Array of cute usernames
 */
function generateUsernameOptions(count = 3) {
    const usernames = new Set();

    while (usernames.size < count) {
        usernames.add(generateCuteUsername());
    }

    return Array.from(usernames);
}

module.exports = {
    generateCuteUsername,
    generateUsernameOptions
};
