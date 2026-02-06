import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';

const PenguinCompanion = () => {
    const { penguinEnabled } = useSettingsStore();
    const { user } = useAuthStore();
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [targetPosition, setTargetPosition] = useState({ x: 100, y: 100 });
    const [isWaving, setIsWaving] = useState(false);

    // Check if penguin should be shown
    const shouldShow = penguinEnabled && user?.penguinEnabled !== false;

    useEffect(() => {
        if (!shouldShow) return;

        const handleMouseMove = (e: MouseEvent) => {
            setTargetPosition({ x: e.clientX - 25, y: e.clientY - 25 });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [shouldShow]);

    // Smooth movement animation
    useEffect(() => {
        if (!shouldShow) return;

        const interval = setInterval(() => {
            setPosition((prev) => ({
                x: prev.x + (targetPosition.x - prev.x) * 0.1,
                y: prev.y + (targetPosition.y - prev.y) * 0.1,
            }));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [targetPosition, shouldShow]);

    // Random wave animation
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
            className="fixed pointer-events-none z-50 transition-transform duration-100"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className={`relative ${isWaving ? 'animate-penguin-wave' : ''}`}>
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
