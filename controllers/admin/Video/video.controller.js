

import mongoose from 'mongoose';
import Video from '../../../models/admin/Video/video.model.js';

/**
 * @desc    Create a new video with Thumbnail and Notes
 * @route   POST /api/admin/videos
 */
// export const createVideo = async (req, res, next) => {
//   try {
//     const {
//       courseId,
//       subjectId,
//       subSubjectId,
//       chapterId,
//       title,
//       description,
//       order,
//     } = req.body;

//     // Check karein ki main video file aayi hai ya nahi
//     if (!req.files || !req.files.video) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please upload a video file' });
//     }

//     // Files ke paths nikalna
//     const videoUrl = req.files.video[0].path;
//     const thumbnailUrl = req.files.thumbnail
//       ? req.files.thumbnail[0].path
//       : null;
//     const notesUrl = req.files.notes ? req.files.notes[0].path : null;

//     const video = await Video.create({
//       courseId,
//       subjectId,
//       subSubjectId,
//       chapterId,
//       title,
//       description,
//       videoUrl,
//       thumbnailUrl, // ✅ Saved
//       notesUrl, // ✅ Saved
//       order: order || 0,
//       createdBy: req.admin._id,
//       updatedBy: req.admin._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Video, Thumbnail and Notes uploaded successfully',
//       data: video,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const createVideo = async (req, res, next) => {

//   try {
//     const {
//       courseId,
//       subjectId,
//       subSubjectId,
//       topicId,      // ✅ Naya field: Topic
//       chapterId,
//       title,
//       description,
//       order,
//     } = req.body;
// if (!topicId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Topic ID is missing! Please select a topic in the frontend.'
//       });
//     }
//     // 1. Check video file
//     if (!req.files || !req.files.video) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please upload a video file' });
//     }

//     // 2. Extract paths
//     const videoUrl = req.files.video[0].path;
//     const thumbnailUrl = req.files.thumbnail ? req.files.thumbnail[0].path : null;
//     const notesUrl = req.files.notes ? req.files.notes[0].path : null;

//     // 3. Save to Database
//     const video = await Video.create({
//       courseId,
//       subjectId,
//       subSubjectId,
//       topicId,      // ✅ Added Topic
//       chapterId,
//       title,
//       description,
//       videoUrl,
//       thumbnailUrl,
//       notesUrl,
//       order: order || 0,
//       createdBy: req.admin._id,
//       updatedBy: req.admin._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Video with Topic, Thumbnail and Notes saved successfully',
//       data: video,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const createVideo = async (req, res, next) => {
  try {
    const { courseId, subjectId, subSubjectId, topicId, chapterId, title, description, order } = req.body;

    if (!topicId) {
      return res.status(400).json({ success: false, message: 'Topic ID is missing!' });
    }

    if (!req.files || !req.files.video) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    // --- YE BADLAV KAREIN (Path Cleaning) ---
    // .replace(/\\/g, '/') ensures ki Windows wale slash ( \ ) forward slash ( / ) ban jayein
    const videoUrl = req.files.video[0].path.replace(/\\/g, '/');
    const thumbnailUrl = req.files.thumbnail ? req.files.thumbnail[0].path.replace(/\\/g, '/') : null;
    const notesUrl = req.files.notes ? req.files.notes[0].path.replace(/\\/g, '/') : null;

    const video = await Video.create({
      courseId,
      subjectId,
      subSubjectId,
      topicId,
      chapterId,
      title,
      description,
      videoUrl,      // Ab ye "uploads/videos/name.mp4" jaisa save hoga
      thumbnailUrl,
      notesUrl,
      order: order || 0,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Video saved successfully',
      data: video,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Update video details and files
 */
export const updateVideo = async (req, res, next) => {
  try {
    const { title, description, order, status } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: 'Video not found' });
    }

    // Agar nayi files upload hui hain toh update karein
    if (req.files) {
      if (req.files.video) video.videoUrl = req.files.video[0].path;
      if (req.files.thumbnail) video.thumbnailUrl = req.files.thumbnail[0].path;
      if (req.files.notes) video.notesUrl = req.files.notes[0].path;
    }

    if (title) video.title = title;
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

// export const getAllVideos = async (req, res, next) => {
//   try {
//     const { chapterId, status } = req.query;
//     const filter = {};
//     if (chapterId) filter.chapterId = chapterId;
//     if (status) filter.status = status;

//     // const videos = await Video.find(filter)
//     //   .populate('chapterId', 'name')
//     //   .populate('courseId', 'name')
//     //   .sort({ order: 1 });
//     const videos = await Video.find(filter)
//       .populate('courseId', 'name')
//       .populate('subjectId', 'name')
//       .populate('subSubjectId', 'name')
//       .populate('chapterId', 'name')
//       .sort({ order: 1 });

//     res.status(200).json({
//       success: true,
//       count: videos.length,
//       data: videos,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllVideos = async (req, res, next) => {
  try {
    // 1. topicId ko bhi query se nikalein
    const { chapterId, topicId, status } = req.query;

    const filter = {};
    if (chapterId) filter.chapterId = chapterId;
    if (topicId) filter.topicId = topicId; // 2. Topic filter add karein
    if (status) filter.status = status;

    const videos = await Video.find(filter)
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name')
      .populate('topicId', 'name') // 3. Agar topic ka naam chahiye toh populate karein
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};

export const getChapterVideoByChapterId = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { status } = req.query;

    // ✅ Validate chapterId
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId',
      });
    }

    const filter = {
      chapterId,
    };

    if (status) filter.status = status;

    // ✅ Fetch videos
    const videos = await Video.find(filter)
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    next(error);
  }
};


export const getVideoData = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId)
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};
