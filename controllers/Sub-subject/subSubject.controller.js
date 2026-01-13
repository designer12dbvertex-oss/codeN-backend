import SubSubject from '../../models/Sub-subject/subSubject.model.js';
import Subject from '../../models/Subject/subject.model.js';

/**
 * @desc    Create a new sub-subject
 * @route   POST /api/admin/sub-subjects
 * @access  Private/Admin
 */
export const createSubSubject = async (req, res, next) => {
  try {
    const { subjectId, name, description, order, status } = req.body;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const subSubject = await SubSubject.create({
      subjectId,
      name,
      description,
      order: order || 0,
      status: status || 'active',
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Sub-subject created successfully',
      data: subSubject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all sub-subjects
 * @route   GET /api/admin/sub-subjects
 * @access  Private/Admin
 */
export const getAllSubSubjects = async (req, res, next) => {
  try {
    const { subjectId, status } = req.query;
    const filter = {};

    if (subjectId) filter.subjectId = subjectId;
    if (status) filter.status = status;

    const subSubjects = await SubSubject.find(filter)
      .populate('subjectId', 'name courseId')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subSubjects.length,
      data: subSubjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single sub-subject by ID
 * @route   GET /api/admin/sub-subjects/:id
 * @access  Private/Admin
 */
export const getSubSubjectById = async (req, res, next) => {
  try {
    const subSubject = await SubSubject.findById(req.params.id)
      .populate('subjectId', 'name description courseId')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ');

    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subSubject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update sub-subject
 * @route   PUT /api/admin/sub-subjects/:id
 * @access  Private/Admin
 */
export const updateSubSubject = async (req, res, next) => {
  try {
    const { subjectId, name, description, order, status } = req.body;

    const subSubject = await SubSubject.findById(req.params.id);

    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    // If subjectId is being updated, verify it exists
    if (subjectId && subjectId !== subSubject.subjectId.toString()) {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
        });
      }
    }

    // Update fields
    if (subjectId) subSubject.subjectId = subjectId;
    if (name) subSubject.name = name;
    if (description !== undefined) subSubject.description = description;
    if (order !== undefined) subSubject.order = order;
    if (status) subSubject.status = status;
    subSubject.updatedBy = req.admin._id;

    await subSubject.save();

    res.status(200).json({
      success: true,
      message: 'Sub-subject updated successfully',
      data: subSubject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete sub-subject (soft delete - status change)
 * @route   DELETE /api/admin/sub-subjects/:id
 * @access  Private/Admin
 */
// export const deleteSubSubject = async (req, res, next) => {
//   try {
//     const subSubject = await SubSubject.findById(req.params.id);

//     if (!subSubject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Sub-subject not found',
//       });
//     }

//     // Soft delete - change status to inactive
//     subSubject.status = 'inactive';
//     subSubject.updatedBy = req.admin._id;
//     await subSubject.save();

//     res.status(200).json({
//       success: true,
//       message: 'Sub-subject deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const deleteSubSubject = async (req, res, next) => {
  try {
    const subSubject = await SubSubject.findById(req.params.id);

    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    await SubSubject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Sub-subject permanently deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Enable/Disable sub-subject
 * @route   PATCH /api/admin/sub-subjects/:id/status
 * @access  Private/Admin
 */
export const toggleSubSubjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const subSubject = await SubSubject.findById(req.params.id);

    if (!subSubject) {
      return res.status(404).json({
        success: false,
        message: 'Sub-subject not found',
      });
    }

    subSubject.status = status;
    subSubject.updatedBy = req.admin._id;
    await subSubject.save();

    res.status(200).json({
      success: true,
      message: `Sub-subject ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: subSubject,
    });
  } catch (error) {
    next(error);
  }
};
