import { VIBE_CONFIGS, type VibeType } from '@/utils/vibeMatching';

interface VibeBadgeProps {
    vibe: VibeType;
    showDescription?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function VibeBadge({ vibe, showDescription = false, size = 'md' }: VibeBadgeProps) {
    const config = VIBE_CONFIGS[vibe];

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const emojiSizes = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-2xl'
    };

    return (
        <div className="flex flex-col items-start gap-1">
            <div className={`
        inline-flex items-center gap-2 rounded-full
        bg-gradient-to-r ${config.color}
        text-white font-display font-semibold
        shadow-lg animate-glow-pulse
        ${sizeClasses[size]}
      `}>
                <span className={emojiSizes[size]}>{config.emoji}</span>
                <span>{config.label}</span>
            </div>

            {showDescription && (
                <p className="text-xs text-ice-gray font-body italic mt-1">
                    {config.description}
                </p>
            )}
        </div>
    );
}
