import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AfterglowCardSkeleton() {
    return (
        <Card className="flex flex-col bg-arctic-deep/90 backdrop-blur-md shadow-xl border border-aurora-cyan/20 h-full overflow-hidden">
            {/* Photo Placeholder */}
            <div className="h-48 bg-gradient-to-br from-ice-dark/50 to-ice-dark/30 animate-pulse" />

            <CardHeader>
                {/* Title Skeleton */}
                <div className="h-6 bg-ice-dark/40 rounded animate-pulse w-3/4 mb-3" />

                {/* Author/Date Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-ice-dark/40 animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-ice-dark/40 rounded animate-pulse w-1/2" />
                        <div className="h-3 bg-ice-dark/40 rounded animate-pulse w-1/3" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
                {/* Content Skeleton */}
                <div className="space-y-2 mb-4">
                    <div className="h-3 bg-ice-dark/30 rounded animate-pulse w-full" />
                    <div className="h-3 bg-ice-dark/30 rounded animate-pulse w-5/6" />
                    <div className="h-3 bg-ice-dark/30 rounded animate-pulse w-4/5" />
                </div>

                {/* Event Badge Skeleton */}
                <div className="h-6 bg-ice-dark/30 rounded-full animate-pulse w-1/2 mb-3" />

                {/* Button Skeleton */}
                <div className="h-10 bg-ice-dark/40 rounded-lg animate-pulse mt-auto" />
            </CardContent>
        </Card>
    );
}
