const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Upload base64 image to S3
 * @param {string} base64Image - Base64 encoded image
 * @param {string} userId - User ID for folder structure
 * @returns {Promise<string>} - S3 public URL
 */
async function uploadToS3(base64Image, userId) {
    try {
        // Extract base64 data and convert to buffer
        const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid base64 image format');
        }

        const [, extension, data] = matches;
        let buffer = Buffer.from(data, 'base64');

        // Try to optimize image with Sharp (fallback if Sharp fails)
        try {
            const optimizedBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer();
            buffer = optimizedBuffer;
        } catch (sharpError) {
            console.warn('Sharp optimization failed, using original image:', sharpError.message);
            // Continue with original buffer
        }

        // Generate unique filename
        const randomId = crypto.randomBytes(16).toString('hex');
        const filename = `${userId}/${randomId}.jpg`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: filename,
            Body: buffer,
            ContentType: 'image/jpeg'
        });

        await s3Client.send(command);

        // Return public URL
        const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
        return url;

    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload image to S3');
    }
}

/**
 * Delete image from S3
 * @param {string} imageUrl - S3 URL
 */
async function deleteFromS3(imageUrl) {
    try {
        // Extract key from URL
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove leading /

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('S3 delete error:', error);
        // Don't throw - deletion failure shouldn't block user actions
    }
}

/**
 * Process photos array (convert base64 to S3 URLs)
 * @param {string[]} photos - Array of base64 or URLs
 * @param {string} userId - User ID for folder structure
 * @returns {Promise<string[]>} - Array of S3 URLs
 */
async function processPhotos(photos, userId) {
    const urls = [];

    for (const photo of photos) {
        if (photo.startsWith('data:image/')) {
            // Base64: upload to S3
            const url = await uploadToS3(photo, userId);
            urls.push(url);
        } else if (photo.includes('s3.amazonaws.com')) {
            // Already an S3 URL: keep it
            urls.push(photo);
        } else {
            console.warn('Unknown photo format:', photo.substring(0, 50));
        }
    }

    return urls;
}

module.exports = { uploadToS3, deleteFromS3, processPhotos };
