import express from 'express';
const router = express.Router();
import { uploadVideoFile } from '../../middleware/uploadMiddleware.js'


import { 
    createVideo, 
    getAllVideos, 
    deleteVideo 
} from '../../controllers/Video/video.controller.js';



/**
 * @route   POST /api/admin/videos
 * @desc    Create a new video
 */
router.post('/', uploadVideoFile.single('video'), createVideo);

/**
 * @route   GET /api/admin/videos
 * @desc    Get all videos (Can filter by chapterId in query)
 */
router.get('/', getAllVideos);

/**
 * @route   DELETE /api/admin/videos/:id
 * @desc    Delete a video
 */
router.delete('/:id', deleteVideo);

export default router;