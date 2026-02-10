import { useState } from 'react';
import { X } from 'lucide-react';

interface PhotoGridProps {
    photos: string[];
    className?: string;
    showLightbox?: boolean;
}

export default function PhotoGrid({ photos, className = '', showLightbox = false }: PhotoGridProps) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (!photos || photos.length === 0) return null;

    const photoCount = photos.length;

    const openLightbox = (index: number) => {
        if (showLightbox) {
            setLightboxIndex(index);
        }
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const nextPhoto = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % photos.length);
        }
    };

    const prevPhoto = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
        }
    };

    // Grid layout classes based on photo count
    const getGridClass = () => {
        switch (photoCount) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-2 gap-2';
            case 3:
                return 'grid-cols-2 grid-rows-2 gap-2';
            case 4:
                return 'grid-cols-2 grid-rows-2 gap-2';
            case 5:
            default:
                return 'grid-cols-3 grid-rows-2 gap-2';
        }
    };

    const getPhotoClass = (index: number) => {
        if (photoCount === 3 && index === 0) {
            return 'col-span-2 row-span-2'; // First photo spans full left
        }
        if (photoCount === 5 && index === 0) {
            return 'col-span-2 row-span-2'; // First photo spans 2x2
        }
        return '';
    };

    return (
        <>
            <div className={`grid ${getGridClass()} max-h-96 overflow-hidden rounded-xl ${className}`}>
                {photos.map((photo, idx) => (
                    <div
                        key={idx}
                        className={`relative overflow-hidden bg-gray-800 ${getPhotoClass(idx)} ${showLightbox ? 'cursor-pointer hover:opacity-90' : ''
                            }`}
                        onClick={() => openLightbox(idx)}
                    >
                        <img
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            loading="lazy"
                        />
                        {/* Show "+N more" badge on last photo if there are more than 5 */}
                        {photoCount > 5 && idx === 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">+{photoCount - 5}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Simple Lightbox Modal */}
            {showLightbox && lightboxIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevPhoto();
                        }}
                        className="absolute left-4 text-white hover:text-gray-300 transition-colors text-4xl"
                        aria-label="Previous photo"
                    >
                        ‹
                    </button>

                    <img
                        src={photos[lightboxIndex]}
                        alt={`Photo ${lightboxIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextPhoto();
                        }}
                        className="absolute right-4 text-white hover:text-gray-300 transition-colors text-4xl"
                        aria-label="Next photo"
                    >
                        ›
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                        {lightboxIndex + 1} / {photos.length}
                    </div>
                </div>
            )}
        </>
    );
}
