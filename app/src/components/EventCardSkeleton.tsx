import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const EventCardSkeleton = () => (
    <Card className="flex flex-col bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-cyan/20">
        <CardHeader>
            <div className="animate-pulse space-y-3">
                {/* Title placeholder */}
                <div className="h-6 bg-ice-dark/30 rounded w-3/4"></div>
                {/* Description placeholder */}
                <div className="space-y-2">
                    <div className="h-4 bg-ice-dark/20 rounded w-full"></div>
                    <div className="h-4 bg-ice-dark/20 rounded w-5/6"></div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
            <div className="animate-pulse space-y-3 flex-1">
                {/* Date placeholder */}
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-aurora-cyan/30 rounded"></div>
                    <div className="h-4 bg-ice-dark/20 rounded w-2/3"></div>
                </div>
                {/* Location placeholder */}
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-aurora-purple/30 rounded"></div>
                    <div className="h-4 bg-ice-dark/20 rounded w-1/2"></div>
                </div>
                {/* Attendees placeholder */}
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-aurora-green/30 rounded"></div>
                    <div className="h-4 bg-ice-dark/20 rounded w-1/3"></div>
                </div>
            </div>

            {/* Button placeholders */}
            <div className="mt-auto space-y-2 pt-4">
                <div className="h-10 bg-gradient-to-r from-aurora-cyan/20 to-aurora-purple/20 rounded w-full"></div>
            </div>
        </CardContent>
    </Card>
);

export default EventCardSkeleton;
