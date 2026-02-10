import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export type PenguinTrigger =
    | 'first-login'
    | 'empty-afterglow'
    | 'post-success'
    | 'first-event-join'
    | 'offline-mode';

interface PenguinState {
    visible: boolean;
    message: string;
    action?: { label: string; onClick: () => void };
    duration: number; // ms before auto-fade
}

const PENGUIN_MESSAGES: Record<PenguinTrigger, Omit<PenguinState, 'visible'>> = {
    'first-login': {
        message: "Welcome to Gatherly! 🐧",
        duration: 5000
    },
    'empty-afterglow': {
        message: "Want to share an Afterglow? ✨",
        duration: 8000
    },
    'post-success': {
        message: "That story will glow forever! 🌟",
        duration: 3000
    },
    'first-event-join': {
        message: "You're in! Check the chat to meet others 💬",
        duration: 4000
    },
    'offline-mode': {
        message: "Oops! We'll retry when you're back online 🌐",
        duration: 4000
    }
};

const PenguinCompanion = () => {
    const { penguinEnabled } = useSettingsStore();
    const { user } = useAuthStore();
    const [state, setState] = useState<PenguinState | null>(null);

    // Check if penguin should be shown
    const shouldShow = penguinEnabled && user?.penguinEnabled !== false;

    // Expose function globally for triggering from other components
    useEffect(() => {
        if (!shouldShow) return;

        (window as any).showPenguin = (trigger: PenguinTrigger, customAction?: { label: string; onClick: () => void }) => {
            const config = PENGUIN_MESSAGES[trigger];
            setState({
                visible: true,
                ...config,
                action: customAction || config.action
            });

            setTimeout(() => setState(null), config.duration);
        };

        return () => {
            delete (window as any).showPenguin;
        };
    }, [shouldShow]);

    if (!shouldShow || !state?.visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed bottom-4 right-4 z-50 pointer-events-auto"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* Speech bubble */}
                <motion.div
                    className="absolute bottom-16 right-0 bg-white rounded-xl p-4 shadow-2xl max-w-xs mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-sm text-gray-800 font-medium">{state.message}</p>
                    {state.action && (
                        <Button
                            size="sm"
                            onClick={state.action.onClick}
                            className="mt-2 bg-gradient-to-r from-aurora-cyan to-aurora-purple text-white"
                        >
                            {state.action.label}
                        </Button>
                    )}
                    {/* Speech bubble arrow */}
                    <div className="absolute bottom-0 right-8 transform translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                </motion.div>

                {/* Penguin SVG */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                    <svg
                        width="64"
                        height="64"
                        viewBox="0 0 50 50"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-2xl"
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PenguinCompanion;

// Helper function to trigger penguin from anywhere
export function showPenguin(trigger: PenguinTrigger, customAction?: { label: string; onClick: () => void }) {
    if ((window as any).showPenguin) {
        (window as any).showPenguin(trigger, customAction);
    }
}
