// import Video from '../../models/Video/video.model.js';

// /**
//  * @desc    Create a new video linked to hierarchy
//  * @route   POST /api/admin/videos
//  */
// export const createVideo = async (req, res, next) => {
//   try {
//     const { courseId, subjectId, subSubjectId, chapterId, title, description, order } = req.body;

//     // Check karein ki file aayi hai ya nahi
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "Please upload a video file" });
//     }

//     // req.file.path mein video ka local address hoga (e.g., uploads/videos/123.mp4)
//     const videoUrl = req.file.path;

//     const video = await Video.create({
//       courseId,
//       subjectId,
//       subSubjectId,
//       chapterId,
//       title,
//       videoUrl, // Browser se upload hui file ka path
//       description,
//       order: order || 0,
//       createdBy: req.admin._id,
//       updatedBy: req.admin._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Video uploaded and saved successfully',
//       data: video
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Get videos (Filter by Chapter/Subject)
//  * @route   GET /api/admin/videos
//  */
// export const getAllVideos = async (req, res, next) => {
//   try {
//     const { chapterId, status } = req.query;
//     const filter = {};
//     if (chapterId) filter.chapterId = chapterId;
//     if (status) filter.status = status;

//     const videos = await Video.find(filter)
//       .populate('chapterId', 'name')
//       .populate('courseId', 'name')
//       .sort({ order: 1 });

//     res.status(200).json({
//       success: true,
//       count: videos.length,
//       data: videos
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Delete video
//  * @route   DELETE /api/admin/videos/:id
//  */
// export const deleteVideo = async (req, res, next) => {
//   try {
//     const video = await Video.findByIdAndDelete(req.params.id);

//     if (!video) {
//       return res.status(404).json({
//         success: false,
//         message: 'Video not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Video deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Update video
//  * @route   PUT /api/admin/videos/:id
//  */
// export const updateVideo = async (req, res, next) => {
//   try {
//     const { title, videoUrl, description, order, status } = req.body;
//     const video = await Video.findById(req.params.id);

//     if (!video) {
//       return res.status(404).json({
//         success: false,
//         message: 'Video not found',
//       });
//     }

//     if (title) video.title = title;
//     if (videoUrl) video.videoUrl = videoUrl;
//     if (description !== undefined) video.description = description;
//     if (order !== undefined) video.order = order;
//     if (status) video.status = status;
//     video.updatedBy = req.admin._id;

//     await video.save();

//     res.status(200).json({
//       success: true,
//       message: 'Video updated successfully',
//       data: video,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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

export const createVideo = async (req, res, next) => {
  try {
    const {
      courseId,
      subjectId,
      subSubjectId,
      topicId,      // ✅ Naya field: Topic
      chapterId,
      title,
      description,
      order,
    } = req.body;

    // 1. Check video file
    if (!req.files || !req.files.video) {
      return res
        .status(400)
        .json({ success: false, message: 'Please upload a video file' });
    }

    // 2. Extract paths
    const videoUrl = req.files.video[0].path;
    const thumbnailUrl = req.files.thumbnail ? req.files.thumbnail[0].path : null;
    const notesUrl = req.files.notes ? req.files.notes[0].path : null;

    // 3. Save to Database
    const video = await Video.create({
      courseId,
      subjectId,
      subSubjectId,
      topicId,      // ✅ Added Topic
      chapterId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      notesUrl,
      order: order || 0,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Video with Topic, Thumbnail and Notes saved successfully',
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
