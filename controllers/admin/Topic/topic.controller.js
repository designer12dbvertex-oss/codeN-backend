import mongoose from 'mongoose';
import Topic from '../../../models/admin/Topic/topic.model.js';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';

// ==========================
// CREATE TOPIC
// ==========================
export const createTopic = async (req, res) => {
  try {
    const { name, description, order, chapterId, status } = req.body;

    if (!name || !chapterId) {
      return res.status(400).json({
        success: false,
        message: 'Topic name and chapterId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId',
      });
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $inc: { topicSequence: 1 } },
      { new: true }
    ).select('chapterCode topicSequence');

    if (!updatedChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    const codonId = `${updatedChapter.chapterCode}-T${String(
      updatedChapter.topicSequence
    ).padStart(2, '0')}`;

    const topic = await Topic.create({
      codonId,
      chapterCode: updatedChapter.chapterCode,
      name: name.trim(),
      description,
      order: order || 0,
      chapterId,
      status: status || 'active',
      createdBy: req.admin._id,
    });

    return res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Topic already exists in this chapter',
      });
    }

    console.error('Create Topic Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message, // show real error
    });
  }
};

// ==========================
// GET TOPICS BY CHAPTER
// ==========================
export const getTopicsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapterId',
      });
    }

    const topics = await Topic.find({
      chapterId,
      status: 'active',
    })
      .select('name description order chapterId status')
      .sort({ order: 1 })
      .lean();
    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopicsByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Database mein topics dhoondo jo us Chapter ID se jude hain
    const topics = await Topic.find({
      chapterId: chapterId,
      status: 'active', // Sirf active topics dikhane ke liye
    })
      .sort({ order: 1 }) // Order ke hisaab se sequence mein (1, 2, 3...)
      .populate('chapterId', 'name') // Chapter ka naam bhi saath ayega
      .lean();
    if (!topics || topics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No topics found for this chapter',
      });
    }

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ==========================
// GET ALL TOPICS
// ==========================
export const getAllTopics = async (req, res) => {
  try {
    const { chapterId } = req.query;

    const filter = {};
    if (chapterId) {
      filter.chapterId = chapterId;
    }

    const topics = await Topic.find(filter)
      .populate({
        path: 'chapterId',
        select: 'name subSubjectId',
        populate: {
          path: 'subSubjectId',
          select: 'name subjectId',
          populate: {
            path: 'subjectId',
            select: 'name',
          },
        },
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean(); // 👈 IMPORTANT

    // 🔁 Force consistency
    const safeTopics = topics.map((t) => ({
      ...t,
      chapterId: typeof t.chapterId === 'string' ? null : t.chapterId,
    }));

    res.status(200).json({
      success: true,
      count: safeTopics.length,
      data: safeTopics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET SINGLE TOPIC
// ==========================
// export const getTopicById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid topic id',
//       });
//     }

//     const topic = await Topic.findById(id)
//       .populate({
//         path: 'chapterId',
//         select: 'name subSubjectId',
//         populate: {
//           path: 'subSubjectId',
//           select: 'name subjectId',
//           populate: {
//             path: 'subjectId',
//             select: 'name',
//           },
//         },
//       })
//       .populate('createdBy', 'name email');

//     if (!topic) {
//       return res.status(404).json({
//         success: false,
//         message: 'Topic not found',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: topic,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic id',
      });
    }

    const topic = await Topic.findById(id)
      .populate({
        path: 'chapterId',
        select: 'name subSubjectId',
        populate: {
          path: 'subSubjectId',
          select: 'name subjectId',
          populate: {
            path: 'subjectId',
            select: 'name courseId', // ✅ include courseId
            populate: {
              path: 'courseId',
              select: 'name', // ✅ populate course
            },
          },
        },
      })
      .populate('createdBy', 'name email')
      .lean(); // ✅ production safe

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error('Get Topic By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ==========================
// UPDATE TOPIC
// ==========================
export const updateTopic = async (req, res, next) => {
  try {
    const { name, description, order, chapterId } = req.body;

    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    // ✅ Validate chapterId if being updated
    if (chapterId) {
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid chapterId',
        });
      }

      const chapterExists = await Chapter.exists({ _id: chapterId });
      if (!chapterExists) {
        return res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });
      }

      topic.chapterId = chapterId;
    }

    if (name !== undefined) topic.name = name.trim();
    if (description !== undefined) topic.description = description;
    if (order !== undefined) topic.order = order;

    topic.updatedBy = req.admin._id;
    await topic.save();

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Topic already exists in this chapter',
      });
    }

    next(error);
  }
};

// ==========================
// DELETE TOPIC (PERMANENT)
// ==========================
export const deleteTopicPermanently = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Topic permanently deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// TOGGLE TOPIC STATUS
// ==========================
export const toggleTopicStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    topic.status = status;
    topic.updatedBy = req.admin._id;
    await topic.save();

    res.status(200).json({
      success: true,
      message: `Topic ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET TOPIC BY CODON ID
// ==========================
export const getTopicByCodonId = async (req, res) => {
  try {
    const { codonId } = req.params;

    if (!codonId) {
      return res.status(400).json({
        success: false,
        message: 'codonId is required',
      });
    }

    const topic = await Topic.findOne({ codonId })
      .populate({
        path: 'chapterId',
        select: 'name subSubjectId chapterCode',
        populate: {
          path: 'subSubjectId',
          select: 'name subjectId',
          populate: {
            path: 'subjectId',
            select: 'name courseId',
            populate: {
              path: 'courseId',
              select: 'name',
            },
          },
        },
      })
      .lean();

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found with this codonId',
      });
    }

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error('Get Topic By CodonId Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
