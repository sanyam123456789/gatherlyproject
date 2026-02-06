import { Music, Plane, Mountain } from 'lucide-react';

interface EventCategoryBadgeProps {
    category: 'concert' | 'travel' | 'trekking';
    className?: string;
}

const categoryConfig = {
    concert: {
        icon: Music,
        label: 'Concert',
        bgColor: 'bg-pastel-pink/30',
        textColor: 'text-pink-700',
        borderColor: 'border-pastel-pink',
    },
    travel: {
        icon: Plane,
        label: 'Travel',
        bgColor: 'bg-pastel-sky/30',
        textColor: 'text-blue-700',
        borderColor: 'border-pastel-sky',
    },
    trekking: {
        icon: Mountain,
        label: 'Trekking',
        bgColor: 'bg-pastel-mint/30',
        textColor: 'text-green-700',
        borderColor: 'border-pastel-mint',
    },
};

const EventCategoryBadge: React.FC<EventCategoryBadgeProps> = ({ category, className = '' }) => {
    const config = categoryConfig[category];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
};

export default EventCategoryBadge;
