import mongoose from 'mongoose';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';
import SubSubject from '../../../models/admin/Sub-subject/subSubject.model.js';
import Topic from '../../../models/admin/Topic/topic.model.js';

// ==========================
// CREATE CHAPTER
// ==========================
export const createChapter = async (req, res, next) => {
  try {
    const {
      courseId,
      subSubjectId,
      topicId,
      name,
      description,
      weightage,
      order,
      isFreePreview,
      status,
      targetMcqs,
    } = req.body;

    if (!subSubjectId || !topicId || !name) {
      return res.status(400).json({
        success: false,
        message: 'subSubjectId, topicId and chapter name are required',
      });
    }

    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(subSubjectId) ||
      !mongoose.Types.ObjectId.isValid(topicId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subSubjectId or topicId',
      });
    }

    const subSubject = await SubSubject.findById(subSubjectId);
    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    // ✅ Ensure topic belongs to same sub-subject
    if (topic.subSubjectId.toString() !== subSubjectId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Topic does not belong to this sub-subject',
      });
    }

    const chapter = await Chapter.create({
      courseId,
      subSubjectId,
      topicId,
      name: name.trim(),
      description,
      weightage: weightage || 0,
      order: order || 0,
      isFreePreview: isFreePreview || false,
      status: status || 'active',
      targetMcqs: targetMcqs || 50,
      image: req.file ? `/uploads/chapter-image/${req.file.filename}` : null,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// UPDATE CHAPTER
// ==========================
export const updateChapter = async (req, res, next) => {
  try {
    const {
      subSubjectId,
      topicId,
      name,
      description,
      weightage,
      order,
      isFreePreview,
      status,
      targetMcqs,
    } = req.body;

    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    if (subSubjectId) {
      if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subSubjectId',
        });
      }

      const subSubjectExists = await SubSubject.exists({ _id: subSubjectId });
      if (!subSubjectExists) {
        return res.status(404).json({
          success: false,
          message: 'Sub-subject not found',
        });
      }

      chapter.subSubjectId = subSubjectId;
    }

    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topicId',
        });
      }

      const topicExists = await Topic.exists({ _id: topicId });
      if (!topicExists) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found',
        });
      }

      chapter.topicId = topicId;
    }
    // ✅ ADD THIS BLOCK (topic–subSubject consistency)
    if (subSubjectId || topicId) {
      const finalSubSubjectId = subSubjectId || chapter.subSubjectId;
      const finalTopicId = topicId || chapter.topicId;

      const topic = await Topic.findById(finalTopicId);
      if (!topic) {
        return res.status(404).json({
          success: false,
          message: 'Topic not found',
        });
      }

      if (topic.subSubjectId.toString() !== finalSubSubjectId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Topic does not belong to this sub-subject',
        });
      }
    }
    if (name !== undefined) chapter.name = name.trim();
    if (description !== undefined) chapter.description = description;
    if (targetMcqs !== undefined) chapter.targetMcqs = targetMcqs;
    if (weightage !== undefined) chapter.weightage = weightage;
    if (order !== undefined) chapter.order = order;
    if (isFreePreview !== undefined) chapter.isFreePreview = isFreePreview;
    if (status !== undefined) chapter.status = status;

    if (req.file) {
      chapter.image = `/uploads/chapter-image/${req.file.filename}`;
    }

    chapter.updatedBy = req.admin._id;
    await chapter.save();

    res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET ALL CHAPTERS
// ==========================
export const getAllChapters = async (req, res, next) => {
  try {
    const { topicId } = req.query; // 🔥 yeh line add

    const filter = {};
    if (topicId) {
      filter.topicId = topicId; // 🔥 yeh line add
    }

    const chapters = await Chapter.find(filter) // 🔥 yahan filter use karo
      .populate({
        path: 'subSubjectId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .populate({
        path: 'topicId',
        select: 'name',
      })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET SINGLE CHAPTER
// ==========================
export const getChapterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chapter id',
      });
    }

    const chapter = await Chapter.findById(id)
      .populate({
        path: 'subSubjectId',
        select: 'name description subjectId',
      })
      .populate({
        path: 'topicId',
        select: 'name',
      })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    res.status(200).json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// DELETE CHAPTER (PERMANENT)
// ==========================
export const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    await Chapter.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Chapter permanently deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// TOGGLE CHAPTER STATUS
// ==========================
export const toggleChapterStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    chapter.status = status;
    chapter.updatedBy = req.admin._id;
    await chapter.save();

    res.status(200).json({
      success: true,
      message: `Chapter ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET CHAPTERS BY SUB-SUBJECT (+ OPTIONAL TOPIC)
// ==========================
export const getChapterBySubSubjectId = async (req, res, next) => {
  try {
    const { subSubjectId } = req.params;
    const { status, topicId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subSubjectId',
      });
    }

    const subSubjectExists = await SubSubject.exists({ _id: subSubjectId });
    if (!subSubjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    const filter = { subSubjectId };

    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topicId',
        });
      }
      filter.topicId = topicId;
    }

    if (status) filter.status = status;

    const chapters = await Chapter.find(filter)
      .sort({ order: 1 })
      .select(
        'name description image weightage order isFreePreview status subSubjectId topicId'
      );

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    next(error);
  }
};
