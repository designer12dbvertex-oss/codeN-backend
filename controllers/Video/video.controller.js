import Video from '../../models/Video/video.model.js';

/**
 * @desc    Create a new video linked to hierarchy
 * @route   POST /api/admin/videos
 */
export const createVideo = async (req, res, next) => {
  try {
    const { courseId, subjectId, subSubjectId, chapterId, title, description, order } = req.body;

    // Check karein ki file aayi hai ya nahi
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a video file" });
    }

    // req.file.path mein video ka local address hoga (e.g., uploads/videos/123.mp4)
    const videoUrl = req.file.path; 

    const video = await Video.create({
      courseId,
      subjectId,
      subSubjectId,
      chapterId,
      title,
      videoUrl, // Browser se upload hui file ka path
      description,
      order: order || 0,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded and saved successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get videos (Filter by Chapter/Subject)
 * @route   GET /api/admin/videos
 */
export const getAllVideos = async (req, res, next) => {
  try {
    const { chapterId, status } = req.query;
    const filter = {};
    if (chapterId) filter.chapterId = chapterId;
    if (status) filter.status = status;

    const videos = await Video.find(filter)
      .populate('chapterId', 'name')
      .populate('courseId', 'name')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete video
 * @route   DELETE /api/admin/videos/:id
 */
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update video
 * @route   PUT /api/admin/videos/:id
 */
export const updateVideo = async (req, res, next) => {
  try {
    const { title, videoUrl, description, order, status } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (title) video.title = title;
    if (videoUrl) video.videoUrl = videoUrl;
    if (description !== undefined) video.description = description;
    if (order !== undefined) video.order = order;
    if (status) video.status = status;
    video.updatedBy = req.admin._id;

    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};