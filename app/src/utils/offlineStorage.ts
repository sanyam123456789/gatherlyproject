/**
 * Offline Storage Utility
 * Manages localStorage for Afterglow posts when backend is unavailable
 */

export interface PendingAfterglowPost {
    id: string; // Temporary UUID
    data: {
        title: string;
        content: string;
        photos: string[]; // Base64 encoded images
        tags?: string[];
        eventId?: string; // Optional event reference
    };
    createdAt: string;
    synced: boolean;
    syncAttempts: number;
}

export interface LocalAfterglowStorage {
    version: '1.0';
    pendingPosts: PendingAfterglowPost[];
    syncedPosts: string[]; // IDs of successfully synced posts
}

const STORAGE_KEY = 'gatherly_afterglow_offline';
const MAX_PENDING_POSTS = 50; // Prevent unbounded growth

/**
 * Get the current localStorage state
 */
export function getLocalStorage(): LocalAfterglowStorage {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { version: '1.0', pendingPosts: [], syncedPosts: [] };
        }
        return JSON.parse(raw);
    } catch (error) {
        console.error('Failed to parse localStorage:', error);
        return { version: '1.0', pendingPosts: [], syncedPosts: [] };
    }
}

/**
 * Save a new Afterglow post to localStorage
 * Returns the temporary ID assigned to the post
 */
export function saveToLocalStorage(data: PendingAfterglowPost['data']): string {
    const storage = getLocalStorage();

    // Generate temporary ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const tempPost: PendingAfterglowPost = {
        id: tempId,
        data,
        createdAt: new Date().toISOString(),
        synced: false,
        syncAttempts: 0
    };

    storage.pendingPosts.push(tempPost);

    // Limit to MAX_PENDING_POSTS (remove oldest)
    if (storage.pendingPosts.length > MAX_PENDING_POSTS) {
        storage.pendingPosts = storage.pendingPosts.slice(-MAX_PENDING_POSTS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));

    return tempId;
}

/**
 * Get all pending posts that need to be synced
 */
export function getPendingPosts(): PendingAfterglowPost[] {
    const storage = getLocalStorage();
    return storage.pendingPosts.filter(post => !post.synced);
}

/**
 * Mark a post as successfully synced
 * @param tempId - Temporary ID from localStorage
 * @param realId - Real ID from backend
 */
export function markAsSynced(tempId: string, realId: string): void {
    const storage = getLocalStorage();

    const post = storage.pendingPosts.find(p => p.id === tempId);
    if (post) {
        post.synced = true;
        storage.syncedPosts.push(realId);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

/**
 * Remove synced posts from localStorage to save space
 */
export function clearSyncedPosts(): void {
    const storage = getLocalStorage();
    storage.pendingPosts = storage.pendingPosts.filter(p => !p.synced);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

/**
 * Increment sync attempt counter for a post
 */
export function incrementSyncAttempts(tempId: string): void {
    const storage = getLocalStorage();

    const post = storage.pendingPosts.find(p => p.id === tempId);
    if (post) {
        post.syncAttempts += 1;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

/**
 * Remove a post from localStorage (e.g., user deleted it)
 */
export function removeFromLocalStorage(tempId: string): void {
    const storage = getLocalStorage();
    storage.pendingPosts = storage.pendingPosts.filter(p => p.id !== tempId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

/**
 * Get count of pending posts
 */
export function getPendingCount(): number {
    return getPendingPosts().length;
}
