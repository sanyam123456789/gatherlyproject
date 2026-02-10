const Blog = require('../models/Blog');
const { processPhotos, deleteFromS3 } = require('../utils/s3Upload');

// GET /api/afterglows
const getAllAfterglows = async (req, res) => {
    try {
        const { eventId, userId } = req.query;

        let filter = {};
        if (eventId) filter.eventRef = eventId;
        if (userId) filter.author = userId;

        const afterglows = await Blog.find(filter)
            .populate('author', 'username email displayName')
            .populate('eventRef', 'title category date location')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(afterglows);
    } catch (error) {
        console.error('Get afterglows error:', error);
        res.status(500).json({ message: 'Failed to fetch afterglows', error: error.message });
    }
};

// POST /api/afterglows
const createAfterglow = async (req, res) => {
    try {
        const { title, content, tags, photos, eventRef } = req.body;

        // Validate photos
        if (photos && photos.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 photos allowed' });
        }

        // Upload photos to S3 (or keep as base64 for localhost testing)
        let photoUrls = photos || [];
        try {
            photoUrls = await processPhotos(photos || [], req.userId);
        } catch (uploadError) {
            console.warn('Photo upload failed, storing base64:', uploadError.message);
            // Fallback: keep base64 if S3 upload fails (graceful degradation)
        }

        const afterglow = await Blog.create({
            title,
            content,
            tags: tags || [],
            photos: photoUrls,
            eventRef: eventRef || null,
            author: req.userId
        });

        await afterglow.populate([
            { path: 'author', select: 'username email displayName' },
            { path: 'eventRef', select: 'title category date location' }
        ]);

        res.status(201).json({
            message: 'Afterglow created successfully',
            afterglow
        });
    } catch (error) {
        console.error('Create afterglow error:', error);
        res.status(500).json({ message: 'Failed to create afterglow', error: error.message });
    }
};

// PUT /api/afterglows/:id
const updateAfterglow = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, photos } = req.body;

        const afterglow = await Blog.findById(id);
        if (!afterglow) {
            return res.status(404).json({ message: 'Afterglow not found' });
        }

        // Check ownership
        if (afterglow.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this afterglow' });
        }

        // Update text fields
        afterglow.title = title;
        afterglow.content = content;
        afterglow.tags = tags || [];

        // Update photos if provided
        if (photos) {
            if (photos.length > 5) {
                return res.status(400).json({ message: 'Maximum 5 photos allowed' });
            }

            // Delete old photos from S3 (if they were replaced)
            const oldPhotos = afterglow.photos || [];
            let newPhotos = photos;

            try {
                newPhotos = await processPhotos(photos, req.userId);

                // Clean up replaced S3 photos
                for (const oldPhoto of oldPhotos) {
                    if (!newPhotos.includes(oldPhoto) && oldPhoto.includes('s3.amazonaws.com')) {
                        await deleteFromS3(oldPhoto);
                    }
                }
            } catch (uploadError) {
                console.warn('Photo update failed, keeping existing:', uploadError.message);
            }

            afterglow.photos = newPhotos;
        }

        await afterglow.save();
        await afterglow.populate([
            { path: 'author', select: 'username email displayName' },
            { path: 'eventRef', select: 'title category date location' }
        ]);

        res.json({ message: 'Afterglow updated successfully', afterglow });
    } catch (error) {
        console.error('Update afterglow error:', error);
        res.status(500).json({ message: 'Failed to update afterglow', error: error.message });
    }
};

// DELETE /api/afterglows/:id
const deleteAfterglow = async (req, res) => {
    try {
        const { id } = req.params;

        const afterglow = await Blog.findById(id);
        if (!afterglow) {
            return res.status(404).json({ message: 'Afterglow not found' });
        }

        // Check ownership
        if (afterglow.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this afterglow' });
        }

        // Delete photos from S3
        for (const photo of afterglow.photos || []) {
            if (photo.includes('s3.amazonaws.com')) {
                await deleteFromS3(photo);
            }
        }

        await afterglow.deleteOne();
        res.json({ message: 'Afterglow deleted successfully' });
    } catch (error) {
        console.error('Delete afterglow error:', error);
        res.status(500).json({ message: 'Failed to delete afterglow', error: error.message });
    }
};

module.exports = {
    getAllAfterglows,
    createAfterglow,
    updateAfterglow,
    deleteAfterglow
};
