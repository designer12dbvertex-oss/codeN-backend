import Subject from '../../models/Subject/subject.model.js';
import Course from '../../models/Course/course.model.js';

/**
 * @desc    Create a new subject
 * @route   POST /api/admin/subjects
 * @access  Private/Admin
 */
export const createSubject = async (req, res, next) => {
  try {
    const { courseId, name, description, order, status } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const subject = await Subject.create({
      courseId,
      name,
      description,
      order: order || 0,
      status: status || 'active',
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all subjects
 * @route   GET /api/admin/subjects
 * @access  Private/Admin
 */
export const getAllSubjects = async (req, res, next) => {
  try {
    const { courseId, status } = req.query;
    const filter = {};

    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;

    const subjects = await Subject.find(filter)
      .populate('courseId', 'name')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single subject by ID
 * @route   GET /api/admin/subjects/:id
 * @access  Private/Admin
 */
export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('courseId', 'name description')
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/admin/subjects/:id
 * @access  Private/Admin
 */
export const updateSubject = async (req, res, next) => {
  try {
    const { courseId, name, description, order, status } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // If courseId is being updated, verify it exists
    if (courseId && courseId !== subject.courseId.toString()) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }
    }

    // Update fields
    if (courseId) subject.courseId = courseId;
    if (name) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (order !== undefined) subject.order = order;
    if (status) subject.status = status;
    subject.updatedBy = req.admin._id;

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subject (soft delete - status change)
 * @route   DELETE /api/admin/subjects/:id
 * @access  Private/Admin
 */
// export const deleteSubject = async (req, res, next) => {
//   try {
//     const subject = await Subject.findById(req.params.id);

//     if (!subject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Subject not found',
//       });
//     }

//     // Soft delete - change status to inactive
//     subject.status = 'inactive';
//     subject.updatedBy = req.admin._id;
//     await subject.save();

//     res.status(200).json({
//       success: true,
//       message: 'Subject deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject permanently deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Enable/Disable subject
 * @route   PATCH /api/admin/subjects/:id/status
 * @access  Private/Admin
 */
export const toggleSubjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    subject.status = status;
    subject.updatedBy = req.admin._id;
    await subject.save();

    res.status(200).json({
      success: true,
      message: `Subject ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};
