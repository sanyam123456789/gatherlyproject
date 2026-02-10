/**
 * Backend Health Check Utility
 * Detects backend availability with caching to prevent excessive requests
 */

import { useState, useEffect } from 'react';

type BackendStatus = 'up' | 'down' | 'unknown';

let cachedStatus: BackendStatus = 'unknown';
let lastCheckTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 3000; // 3 seconds

/**
 * Check if the backend is available
 * Uses cached result if recent enough
 */
export async function isBackendAvailable(): Promise<boolean> {
    const now = Date.now();

    // Return cached status if recent
    if (now - lastCheckTimestamp < CACHE_DURATION && cachedStatus !== 'unknown') {
        return cachedStatus === 'up';
    }

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
        const healthUrl = apiUrl.replace('/api', '') + '/api/health';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

        const response = await fetch(healthUrl, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        cachedStatus = response.ok ? 'up' : 'down';
        lastCheckTimestamp = now;

        return response.ok;
    } catch (error) {
        // Network error, timeout, or abort
        cachedStatus = 'down';
        lastCheckTimestamp = now;
        return false;
    }
}

/**
 * Force a fresh health check, ignoring cache
 */
export async function forceHealthCheck(): Promise<boolean> {
    lastCheckTimestamp = 0; // Invalidate cache
    return isBackendAvailable();
}

/**
 * React hook for backend status
 * Automatically checks on mount and provides manual refresh
 */
export function useBackendStatus(autoCheck = true) {
    const [isOnline, setIsOnline] = useState<boolean>(true); // Optimistic default
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkStatus = async () => {
        setIsChecking(true);
        const online = await isBackendAvailable();
        setIsOnline(online);
        setLastChecked(new Date());
        setIsChecking(false);
    };

    useEffect(() => {
        if (autoCheck) {
            checkStatus();
        }
    }, [autoCheck]);

    return {
        isOnline,
        lastChecked,
        isChecking,
        refresh: checkStatus
    };
}

/**
 * Get cached status without triggering new check
 */
export function getCachedStatus(): BackendStatus {
    return cachedStatus;
}
