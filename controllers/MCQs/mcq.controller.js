import MCQ from '../../models/MCQs/mcq.model.js';
import Chapter from '../../models/Chapter/chapter.model.js';

/**
 * @desc    Create a new MCQ
 * @route   POST /api/admin/mcqs
 * @access  Private/Admin
 */
export const createMCQ = async (req, res, next) => {
  try {
    const {
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      marks,
      negativeMarks,
      previousYearTag,
      status,
    } = req.body;

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    // Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'MCQ must have at least 2 options',
      });
    }

    // Validate correctAnswer
    if (!correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer is required',
      });
    }

    const mcq = await MCQ.create({
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty: difficulty || 'medium',
      marks: marks || 4,
      negativeMarks: negativeMarks || 1,
      previousYearTag: previousYearTag || false,
      status: status || 'active',
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'MCQ created successfully',
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all MCQs
 * @route   GET /api/admin/mcqs
 * @access  Private/Admin
 */
export const getAllMCQs = async (req, res, next) => {
  try {
    const { chapterId, status, difficulty, previousYearTag } = req.query;
    const filter = {};

    if (chapterId) filter.chapterId = chapterId;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (previousYearTag !== undefined)
      filter.previousYearTag = previousYearTag === 'true';

    const mcqs = await MCQ.find(filter)
      .populate('chapterId', 'name subSubjectId')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: mcqs.length,
      data: mcqs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single MCQ by ID
 * @route   GET /api/admin/mcqs/:id
 * @access  Private/Admin
 */
export const getMCQById = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id)
      .populate('chapterId', 'name description subSubjectId')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ');

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update MCQ
 * @route   PUT /api/admin/mcqs/:id
 * @access  Private/Admin
 */
export const updateMCQ = async (req, res, next) => {
  try {
    const {
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      difficulty,
      marks,
      negativeMarks,
      previousYearTag,
      status,
    } = req.body;

    const mcq = await MCQ.findById(req.params.id);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    // If chapterId is being updated, verify it exists
    if (chapterId && chapterId !== mcq.chapterId.toString()) {
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });
      }
    }

    // Validate options if being updated
    if (options && options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'MCQ must have at least 2 options',
      });
    }

    // Update fields
    if (chapterId) mcq.chapterId = chapterId;
    if (question) mcq.question = question;
    if (options) mcq.options = options;
    if (correctAnswer !== undefined) mcq.correctAnswer = correctAnswer;
    if (explanation !== undefined) mcq.explanation = explanation;
    if (difficulty) mcq.difficulty = difficulty;
    if (marks !== undefined) mcq.marks = marks;
    if (negativeMarks !== undefined) mcq.negativeMarks = negativeMarks;
    if (previousYearTag !== undefined) mcq.previousYearTag = previousYearTag;
    if (status) mcq.status = status;
    mcq.updatedBy = req.admin._id;

    await mcq.save();

    res.status(200).json({
      success: true,
      message: 'MCQ updated successfully',
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete MCQ (soft delete - status change)
 * @route   DELETE /api/admin/mcqs/:id
 * @access  Private/Admin
 */
// export const deleteMCQ = async (req, res, next) => {
//   try {
//     const mcq = await MCQ.findById(req.params.id);

//     if (!mcq) {
//       return res.status(404).json({
//         success: false,
//         message: 'MCQ not found',
//       });
//     }

//     // Soft delete - change status to inactive
//     mcq.status = 'inactive';
//     mcq.updatedBy = req.admin._id;
//     await mcq.save();

//     res.status(200).json({
//       success: true,
//       message: 'MCQ deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const deleteMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    await MCQ.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'MCQ permanently deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Enable/Disable MCQ
 * @route   PATCH /api/admin/mcqs/:id/status
 * @access  Private/Admin
 */
export const toggleMCQStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const mcq = await MCQ.findById(req.params.id);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    mcq.status = status;
    mcq.updatedBy = req.admin._id;
    await mcq.save();

    res.status(200).json({
      success: true,
      message: `MCQ ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};
