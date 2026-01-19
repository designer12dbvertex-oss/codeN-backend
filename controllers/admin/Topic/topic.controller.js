import mongoose from 'mongoose';
import Topic from '../../../models/admin/Topic/topic.model.js';
import SubSubject from '../../../models/admin/Sub-subject/subSubject.model.js';

// ==========================
// CREATE TOPIC
// ==========================
export const createTopic = async (req, res) => {
  try {
    const { name, description, order, subSubjectId, status } = req.body;

    if (!name || !subSubjectId) {
      return res.status(400).json({
        success: false,
        message: 'Topic name and subSubjectId are required',
      });
    }

    // ✅ Validate subSubjectId
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

    // ✅ Duplicate check (same sub-subject + same name)
    const exists = await Topic.findOne({
      name: name.trim(),
      subSubjectId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Topic already exists in this sub-subject',
      });
    }

    const topic = await Topic.create({
      name: name.trim(),
      description,
      order: order || 0,
      subSubjectId,
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
// GET TOPICS BY SUB-SUBJECT
// ==========================
export const getTopicsBySubSubject = async (req, res) => {
  try {
    const { subSubjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subSubjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subSubjectId',
      });
    }

    const topics = await Topic.find({
      subSubjectId,
      status: 'active',
    })
      .select('name description order subSubjectId status')
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
    const topics = await Topic.find()
      .populate({
        path: 'subSubjectId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
        },
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

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
        path: 'subSubjectId',
        select: 'name subjectId',
        populate: {
          path: 'subjectId',
          select: 'name',
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
export const updateTopic = async (req, res) => {
  try {
    const { name, description, order, subSubjectId, status } = req.body;

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
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

      topic.subSubjectId = subSubjectId;
    }

    if (name !== undefined) topic.name = name.trim();
    if (description !== undefined) topic.description = description;
    if (order !== undefined) topic.order = order;
    if (status !== undefined) topic.status = status;

    topic.updatedBy = req.admin._id;
    await topic.save();

    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
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
