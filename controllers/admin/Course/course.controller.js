import Course from '../../../models/admin/Course/course.model.js';

/**
 * @desc    Create a new course
 * @route   POST /api/admin/courses
 * @access  Private/Admin
 */
export const createCourse = async (req, res, next) => {
  try {
    // 🔒 CHECK: Only one course allowed
    const existingCourse = await Course.findOne();

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Only one course is allowed. You cannot create more.',
      });
    }

    const {
      name,
      description,
      examType,
      year,
      price,
      isPaid,
      isPublished,
      status,
    } = req.body;

    const course = await Course.create({
      name,
      description,
      examType: examType || 'NEET',
      year,
      price: price || 0,
      isPaid: isPaid || false,
      isPublished: isPublished || false,
      status: status || 'active',
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/admin/courses
 * @access  Private/Admin
 */
export const getAllCourses = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const courses = await Course.find(filter)
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/admin/courses/:id
 * @access  Private/Admin
 */
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name ')
      .populate('updatedBy', 'name ');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/admin/courses/:id
 * @access  Private/Admin
 */
export const updateCourse = async (req, res, next) => {
  try {
    const {
      name,
      description,
      examType,
      year,
      price,
      isPaid,
      isPublished,
      status,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Update fields
    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    if (examType) course.examType = examType;
    if (year) course.year = year;
    if (price !== undefined) course.price = price;
    if (isPaid !== undefined) course.isPaid = isPaid;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (status) course.status = status;
    course.updatedBy = req.admin._id;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course (soft delete - status change)
 * @route   DELETE /api/admin/courses/:id
 * @access  Private/Admin
 */
// export const deleteCourse = async (req, res, next) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: 'Course not found',
//       });
//     }

//     // Soft delete - change status to inactive
//     course.status = 'inactive';
//     course.updatedBy = req.admin._id;
//     await course.save();

//     res.status(200).json({
//       success: true,
//       message: 'Course deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course permanently deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Enable/Disable course
 * @route   PATCH /api/admin/courses/:id/status
 * @access  Private/Admin
 */
export const toggleCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either active or inactive',
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.status = status;
    course.updatedBy = req.admin._id;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${
        status === 'active' ? 'enabled' : 'disabled'
      } successfully`,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish course
 * @route   PATCH /api/admin/courses/:id/publish
 * @access  Private/Admin
 */
export const publishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.isPublished = true;
    course.updatedBy = req.admin._id;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course published successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unpublish course
 * @route   PATCH /api/admin/courses/:id/unpublish
 * @access  Private/Admin
 */
export const unpublishCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    course.isPublished = false;
    course.updatedBy = req.admin._id;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course unpublished successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};
