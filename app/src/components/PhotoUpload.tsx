import { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoUploadProps {
    photos: string[];
    onChange: (photos: string[]) => void;
    maxPhotos?: number;
    maxSizePerFile?: number; // in bytes
}

const DEFAULT_MAX_PHOTOS = 5;
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export default function PhotoUpload({
    photos,
    onChange,
    maxPhotos = DEFAULT_MAX_PHOTOS,
    maxSizePerFile = DEFAULT_MAX_SIZE
}: PhotoUploadProps) {
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`;
        }
        if (file.size > maxSizePerFile) {
            const sizeMB = (maxSizePerFile / 1024 / 1024).toFixed(0);
            return `File too large: ${file.name}. Maximum size is ${sizeMB}MB.`;
        }
        return null;
    };

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        setError('');

        const files = Array.from(fileList);
        const remainingSlots = maxPhotos - photos.length;

        if (files.length > remainingSlots) {
            setError(`Maximum ${maxPhotos} photos allowed. You can add ${remainingSlots} more.`);
            return;
        }

        // Validate all files first
        for (const file of files) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        // Convert to base64
        const newPhotos: string[] = [];
        for (const file of files) {
            try {
                const base64 = await fileToBase64(file);
                newPhotos.push(base64);
            } catch (err) {
                setError(`Failed to process ${file.name}`);
                return;
            }
        }

        onChange([...photos, ...newPhotos]);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        onChange(newPhotos);
        setError('');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input so same file can be selected again
        if (e.target) e.target.value = '';
    };

    return (
        <div className="space-y-4">
            {/* Photo Previews */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                            <img
                                src={photo}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-ice-dark/30"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1.5 
                          opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                aria-label={`Remove photo ${idx + 1}`}
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone (only show if not at max) */}
            {photos.length < maxPhotos && (
                <>
                    <div
                        onClick={handleClick}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-300
              ${isDragging
                                ? 'border-aurora-cyan bg-aurora-cyan/10 scale-105'
                                : 'border-aurora-cyan/50 hover:border-aurora-cyan hover:bg-aurora-cyan/5'
                            }
            `}
                    >
                        <Upload className="w-10 h-10 mx-auto mb-3 text-aurora-cyan" />
                        <p className="text-ice-white font-medium mb-1">
                            Drag photos here or click to browse
                        </p>
                        <p className="text-xs text-ice-gray">
                            Up to {maxPhotos} images • Max {(maxSizePerFile / 1024 / 1024).toFixed(0)}MB each
                        </p>
                        <p className="text-xs text-ice-dark mt-1">
                            {photos.length} / {maxPhotos} photos uploaded
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        aria-label="Photo upload input"
                    />
                </>
            )}

            {/* Error Display */}
            {error && (
                <Alert className="bg-aurora-pink/10 border-aurora-pink/30">
                    <AlertCircle className="w-4 h-4 text-aurora-pink" />
                    <AlertDescription className="text-ice-white">{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
