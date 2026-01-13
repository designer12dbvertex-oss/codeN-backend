import Chapter from '../../models/Chapter/chapter.model.js';
import SubSubject from '../../models/Sub-subject/subSubject.model.js';

/**
 * @desc    Create a new chapter
 * @route   POST /api/admin/chapters
 * @access  Private/Admin
 */
export const createChapter = async (req, res, next) => {
  try {
    const {
      subSubjectId,
      name,
      description,
      weightage,
      order,
      isFreePreview,
      status,
    } = req.body;

    // Verify sub-subject exists
    const subSubject = await SubSubject.findById(subSubjectId);
    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    const chapter = await Chapter.create({
      subSubjectId,
      name,
      description,
      weightage: weightage || 0,
      order: order || 0,
      isFreePreview: isFreePreview || false,
      status: status || 'active',
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

/**
 * @desc    Get all chapters
 * @route   GET /api/admin/chapters
 * @access  Private/Admin
 */
export const getAllChapters = async (req, res, next) => {
  try {
    const { subSubjectId, status } = req.query;
    const filter = {};

    if (subSubjectId) filter.subSubjectId = subSubjectId;
    if (status) filter.status = status;

    const chapters = await Chapter.find(filter)
      .populate('subSubjectId', 'name subjectId')
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

/**
 * @desc    Get single chapter by ID
 * @route   GET /api/admin/chapters/:id
 * @access  Private/Admin
 */
export const getChapterById = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('subSubjectId', 'name description subjectId')
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

/**
 * @desc    Update chapter
 * @route   PUT /api/admin/chapters/:id
 * @access  Private/Admin
 */
export const updateChapter = async (req, res, next) => {
  try {
    const {
      subSubjectId,
      name,
      description,
      weightage,
      order,
      isFreePreview,
      status,
    } = req.body;

    const chapter = await Chapter.findById(req.params.id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    // If subSubjectId is being updated, verify it exists
    if (subSubjectId && subSubjectId !== chapter.subSubjectId.toString()) {
      const subSubject = await SubSubject.findById(subSubjectId);
      if (!subSubject) {
        return res.status(404).json({
          success: false,
          message: 'Sub-subject not found',
        });
      }
    }

    // Update fields
    if (subSubjectId) chapter.subSubjectId = subSubjectId;
    if (name) chapter.name = name;
    if (description !== undefined) chapter.description = description;
    if (weightage !== undefined) chapter.weightage = weightage;
    if (order !== undefined) chapter.order = order;
    if (isFreePreview !== undefined) chapter.isFreePreview = isFreePreview;
    if (status) chapter.status = status;
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

/**
 * @desc    Delete chapter (soft delete - status change)
 * @route   DELETE /api/admin/chapters/:id
 * @access  Private/Admin
 */
// export const deleteChapter = async (req, res, next) => {
//   try {
//     const chapter = await Chapter.findById(req.params.id);

//     if (!chapter) {
//       return res.status(404).json({
//         success: false,
//         message: 'Chapter not found',
//       });
//     }

//     // Soft delete - change status to inactive
//     chapter.status = 'inactive';
//     chapter.updatedBy = req.admin._id;
//     await chapter.save();

//     res.status(200).json({
//       success: true,
//       message: 'Chapter deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };
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
/**
 * @desc    Enable/Disable chapter
 * @route   PATCH /api/admin/chapters/:id/status
 * @access  Private/Admin
 */
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
