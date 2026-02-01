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

    // ✅ Validate chapterId
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

    // ✅ Duplicate check (same chapter + same name)
    const exists = await Topic.findOne({
      name: name.trim(),
      chapterId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Topic already exists in this chapter',
      });
    }

    const topic = await Topic.create({
      name: name.trim(),
      description,
      order: order || 0,
      chapterId,
      status: status || 'active',
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
            select: 'name',
          },
        },
      })
      .populate('createdBy', 'name email');

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
    res.status(500).json({
      success: false,
      message: error.message,
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
