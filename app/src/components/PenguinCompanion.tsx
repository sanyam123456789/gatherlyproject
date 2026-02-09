import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const PenguinCompanion = () => {
    const { penguinEnabled } = useSettingsStore();
    const { user } = useAuthStore();
    const [isWaving, setIsWaving] = useState(false);

    // Check if penguin should be shown
    const shouldShow = penguinEnabled && user?.penguinEnabled !== false;

    // Random wave animation - NO CURSOR TRACKING!
    useEffect(() => {
        if (!shouldShow) return;

        const waveInterval = setInterval(() => {
            setIsWaving(true);
            setTimeout(() => setIsWaving(false), 2000);
        }, 10000); // Wave every 10 seconds

        return () => clearInterval(waveInterval);
    }, [shouldShow]);

    if (!shouldShow) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-50 pointer-events-none"
        >
            <div className={`relative transition-transform duration-300 ${isWaving ? 'animate-penguin-wave' : ''}`}>
                {/* Cute Penguin SVG */}
                <svg
                    width="50"
                    height="50"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                >
                    {/* Penguin body */}
                    <ellipse cx="25" cy="30" rx="15" ry="18" fill="#2C2C2C" />
                    <ellipse cx="25" cy="30" rx="10" ry="14" fill="#FFFFFF" />

                    {/* Penguin head */}
                    <circle cx="25" cy="15" r="10" fill="#2C2C2C" />

                    {/* Eyes */}
                    <circle cx="22" cy="14" r="2" fill="#FFFFFF" />
                    <circle cx="28" cy="14" r="2" fill="#FFFFFF" />
                    <circle cx="22.5" cy="14.5" r="1" fill="#000000" className="animate-pulse" />
                    <circle cx="28.5" cy="14.5" r="1" fill="#000000" className="animate-pulse" />

                    {/* Beak */}
                    <polygon points="25,17 23,19 27,19" fill="#FFA500" />

                    {/* Wings */}
                    <ellipse
                        cx="13"
                        cy="28"
                        rx="5"
                        ry="10"
                        fill="#2C2C2C"
                        transform="rotate(-20 13 28)"
                    />
                    <ellipse
                        cx="37"
                        cy="28"
                        rx="5"
                        ry="10"
                        fill="#2C2C2C"
                        transform="rotate(20 37 28)"
                    />

                    {/* Feet */}
                    <ellipse cx="20" cy="46" rx="4" ry="2" fill="#FFA500" />
                    <ellipse cx="30" cy="46" rx="4" ry="2" fill="#FFA500" />
                </svg>

                {/* Cute speech bubble occasionally */}
                {isWaving && (
                    <div className="absolute -top-8 left-12 bg-white rounded-lg px-2 py-1 text-xs shadow-md animate-fade-in-up whitespace-nowrap">
                        👋 Hi there!
                    </div>
                )}
            </div>
        </div>
    );
};

export default PenguinCompanion;
