import MCQ from '../../models/MCQs/mcq.model.js';
import Chapter from '../../models/Chapter/chapter.model.js';

// ✅ CORRECT MODELS
import SubSubject from '../../models/Sub-subject/subSubject.model.js';
import Subject from '../../models/Subject/subject.model.js';
import Tag from '../../models/Tags/tag.model.js';

/**
 * @desc    Create a new MCQ
 * @route   POST /api/admin/mcqs
 * @access  Private/Admin
 */
export const createMCQ = async (req, res, next) => {
  try {
    const {
      chapterId,
      tagId,
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

    
    if (!tagId) {
      return res.status(400).json({
        success: false,
        message: 'Tag is required',
      });
    }

    // 1️⃣ Verify chapter
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }
    // 1️⃣ Verify Tag
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    // 2️⃣ Ensure tag belongs to same chapter
    if (tag.chapterId.toString() !== chapterId) {
      return res.status(400).json({
        success: false,
        message: 'Tag does not belong to this chapter',
      });
    }

    // 2️⃣ Get SubSubject
    const subSubject = await SubSubject.findById(chapter.subSubjectId);
    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    // 3️⃣ Get Subject
    const subject = await Subject.findById(subSubject.subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // 4️⃣ Validate options
    if (!options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'MCQ must have at least 2 options',
      });
    }

    // 5️⃣ Validate correctAnswer
    if (correctAnswer === undefined || correctAnswer === null) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer is required',
      });
    }

    // 6️⃣ Create MCQ with FULL hierarchy
    const mcq = await MCQ.create({
      courseId: subject.courseId,
      subjectId: subject._id,
      subSubjectId: subSubject._id,
      chapterId,
      tagId,
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
    const {
      courseId,
      tagId,
      subjectId,
      subSubjectId,
      chapterId,
      status,
      difficulty,
      previousYearTag,
    } = req.query;

    const filter = {};

    // 🔹 Scope filters
    if (courseId) filter.courseId = courseId;
    if (tagId) filter.tagId = tagId;
    if (subjectId) filter.subjectId = subjectId;
    if (subSubjectId) filter.subSubjectId = subSubjectId;
    if (chapterId) filter.chapterId = chapterId;

    // 🔹 Other filters
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (previousYearTag !== undefined) {
      filter.previousYearTag = previousYearTag === 'true';
    }

    const mcqs = await MCQ.find(filter)
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name')
      .populate('tagId', 'name')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
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
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name description')
      .populate('tagId', 'name description') // ✅ UPDATED
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

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
      tagId,
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

    /**
     * 🔹 If chapter is changed → update full hierarchy
     */
    if (chapterId && chapterId !== mcq.chapterId.toString()) {
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });
      }

      // 🔴 IMPORTANT: chapter change → tag MUST be provided
      if (!tagId) {
        return res.status(400).json({
          success: false,
          message: 'Tag is required when changing chapter',
        });
      }

      const subSubject = await SubSubject.findById(chapter.subSubjectId);
      if (!subSubject) {
        return res.status(404).json({
          success: false,
          message: 'Sub-subject not found',
        });
      }

      const subject = await Subject.findById(subSubject.subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
        });
      }

      // ✅ update hierarchy
      mcq.chapterId = chapterId;
      mcq.subSubjectId = subSubject._id;
      mcq.subjectId = subject._id;
      mcq.courseId = subject.courseId;
    }

    /**
     * 🔹 Handle TAG update (independent)
     */
    if (tagId && tagId !== mcq.tagId.toString()) {
      const tag = await Tag.findById(tagId);
      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Tag not found',
        });
      }

      const chapterToCheck = chapterId || mcq.chapterId.toString();

      if (tag.chapterId.toString() !== chapterToCheck) {
        return res.status(400).json({
          success: false,
          message: 'Tag does not belong to this chapter',
        });
      }

      mcq.tagId = tagId;
    }

    /**
     * 🔹 Validate options
     */
    if (options && options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'MCQ must have at least 2 options',
      });
    }

    /**
     * 🔹 Update remaining fields
     */
    if (question !== undefined) mcq.question = question;
    if (options !== undefined) mcq.options = options;
    if (correctAnswer !== undefined) mcq.correctAnswer = correctAnswer;
    if (explanation !== undefined) mcq.explanation = explanation;
    if (difficulty !== undefined) mcq.difficulty = difficulty;
    if (marks !== undefined) mcq.marks = marks;
    if (negativeMarks !== undefined) mcq.negativeMarks = negativeMarks;
    if (previousYearTag !== undefined) mcq.previousYearTag = previousYearTag;
    if (status !== undefined) mcq.status = status;

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

    // 🔹 Validate status
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

    // 🔹 No-op check (already same status)
    if (mcq.status === status) {
      return res.status(200).json({
        success: true,
        message: `MCQ already ${status}`,
        data: mcq,
      });
    }

    // 🔹 Update status
    mcq.status = status;
    mcq.updatedBy = req.admin._id;
    await mcq.save();

    res.status(200).json({
      success: true,
      message:
        status === 'active'
          ? 'MCQ enabled successfully'
          : 'MCQ disabled successfully',
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};
