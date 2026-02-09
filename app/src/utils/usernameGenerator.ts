// Arctic Night themed username generator for Gatherly
// Generates cool, adventurous usernames matching the app's vibe

const adjectives = [
    'Arctic', 'Cosmic', 'Neon', 'Frosty', 'Chill', 'Zen', 'Vibe',
    'Mystic', 'Luna', 'Solar', 'Aqua', 'Ember', 'Cloud', 'Storm',
    'Galaxy', 'Pixel', 'Echo', 'Nova', 'Velvet', 'Crystal',
    'Midnight', 'Dawn', 'Twilight', 'Starry', 'Glowing', 'Aurora',
    'Cyber', 'Digital', 'Quantum', 'Stellar'
];

const nouns = [
    'Explorer', 'Wanderer', 'Seeker', 'Dreamer', 'Penguin', 'Traveler',
    'Adventurer', 'Nomad', 'Voyager', 'Scout', 'Pioneer', 'Drifter',
    'Roamer', 'Navigator', 'Pathfinder', 'Wayfarer', 'Trekker', 'Globetrotter',
    'Vibe', 'Spirit', 'Soul', 'Ghost', 'Phantom', 'Shadow'
];

const suffixes = ['_', '247', '88', '99', '42', 'X', 'Pro', 'Zen', '777', '101', 'XD'];

/**
 * Generate a single random username
 * Format: {Adjective}{Noun}{Suffix}
 * Example: ArcticExplorer247, FrostyPenguin88, CosmicWanderer_
 */
export function generateCuteUsername(): string {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${adj}${noun}${suffix}`;
}

/**
 * Generate a batch of unique usernames
 * @param count - Number of usernames to generate (default: 5)
 * @returns Array of unique username strings
 */
export function generateUsernameOptions(count = 5): string[] {
    const batch = new Set<string>();
    let attempts = 0;
    const maxAttempts = count * 10; // Prevent infinite loop

    while (batch.size < count && attempts < maxAttempts) {
        batch.add(generateCuteUsername());
        attempts++;
    }

    return Array.from(batch);
}

/**
 * Check if a username matches the generated pattern
 * Useful for validation or analytics
 */
export function isGeneratedUsername(username: string): boolean {
    const pattern = new RegExp(
        `^(${adjectives.join('|')})(${nouns.join('|')})(${suffixes.join('|')})$`
    );
    return pattern.test(username);
}
