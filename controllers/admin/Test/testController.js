import Test from '../../../models/admin/Test/testModel.js';
import {
  getGrandTestQuestions,
  getSubjectTestQuestions,
  getCourseFilters,
  validateSubjectTestFilters,
  countAvailableQuestions,
  formatTestResponse,
  formatTestForAttempt,
} from '../../../services/testService.js';

/**
 * @desc    Create a new Test (Grand or Subject)
 * @route   POST /api/admin/tests
 * @access  Private/Admin
 */
export const createTest = async (req, res, next) => {
  try {
    const {
      month,
      academicYear,
      testTitle,
      category,
      testMode,
      courseId,
      subjects = [],
      subSubjects = [],
      topics = [],
      chapters = [],
      mcqLimit,
      timeLimit,
      description = '',
    } = req.body;

    // ===== VALIDATION =====

    // Common validations
    if (!month || !academicYear || !testTitle || !category || !testMode) {
      return res.status(400).json({
        success: false,
        message:
          'Month, Academic Year, Test Title, Category, and Test Mode are required',
      });
    }

    if (!mcqLimit || mcqLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'MCQ Limit must be a positive number',
      });
    }

    // Grand Test specific validation
    if (category === 'grand') {
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required for Grand Test',
        });
      }
    }

    // Subject Test specific validation
    if (category === 'subject') {
      try {
        validateSubjectTestFilters({ subjects, subSubjects, topics, chapters });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    // Exam Mode validation
    if (testMode === 'exam' && (!timeLimit || timeLimit < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Time Limit (in minutes) is required for Exam Mode',
      });
    }

    // ===== GET QUESTIONS =====
    let questions;

    try {
      if (category === 'grand') {
        questions = await getGrandTestQuestions(courseId, mcqLimit);
      } else {
        questions = await getSubjectTestQuestions(
          { subjects, subSubjects, topics, chapters },
          mcqLimit
        );
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // ===== CREATE TEST =====
    const testData = {
      month,
      academicYear,
      testTitle,
      category,
      testMode,
      courseId: category === 'grand' ? courseId : null,
      subjects: category === 'subject' ? subjects : [],
      subSubjects: category === 'subject' ? subSubjects : [],
      topics: category === 'subject' ? topics : [],
      chapters: category === 'subject' ? chapters : [],
      mcqLimit,
      timeLimit: testMode === 'exam' ? timeLimit : null,
      questions,
      status: 'active',
      description,
      createdBy: req.admin?._id || req.user?._id, // from authMiddleware
    };

    const test = await Test.create(testData);

    // Populate references
    await test.populate(['courseId', 'createdBy']);

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: formatTestResponse(test),
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating test',
    });
  }
};

/**
 * @desc    Get all tests with filters
 * @route   GET /api/admin/tests
 * @access  Private/Admin
 */
export const getAllTests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status, testMode } = req.query;

    // Build filter query
    let filter = {};

    if (category && ['grand', 'subject'].includes(category)) {
      filter.category = category;
    }

    if (status && ['active', 'inactive', 'draft'].includes(status)) {
      filter.status = status;
    }

    if (testMode && ['regular', 'exam'].includes(testMode)) {
      filter.testMode = testMode;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch tests
    const tests = await Test.find(filter)
      .populate('courseId', 'name')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Test.countDocuments(filter);

    res.json({
      success: true,
      data: tests.map(formatTestResponse),
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Get All Tests Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching tests',
    });
  }
};

/**
 * @desc    Get single test by ID
 * @route   GET /api/admin/tests/:testId
 * @access  Private/Admin
 */
export const getTestById = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId)
      .populate('courseId', 'name')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Get Test By ID Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching test',
    });
  }
};

/**
 * @desc    Get test with questions for user attempt
 * @route   GET /api/admin/tests/:testId/attempt
 * @access  Private/User
 */
export const getTestForAttempt = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId).where('status').equals('active');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or is inactive',
      });
    }

    res.json({
      success: true,
      data: formatTestForAttempt(test),
    });
  } catch (error) {
    console.error('Get Test For Attempt Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching test',
    });
  }
};

/**
 * @desc    Get available filters for creating Subject Test
 * @route   GET /api/admin/tests/filters/:courseId
 * @access  Private/Admin
 */
export const getTestFilters = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const filters = await getCourseFilters(courseId);

    res.json({
      success: true,
      data: filters,
    });
  } catch (error) {
    console.error('Get Test Filters Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching filters',
    });
  }
};

/**
 * @desc    Preview available questions count
 * @route   POST /api/admin/tests/preview
 * @access  Private/Admin
 */
export const previewTestQuestions = async (req, res, next) => {
  try {
    const {
      category,
      courseId,
      subjects = [],
      subSubjects = [],
      topics = [],
      chapters = [],
      mcqLimit,
    } = req.body;

    if (!category || !mcqLimit) {
      return res.status(400).json({
        success: false,
        message: 'Category and MCQ Limit are required',
      });
    }

    try {
      const count = await countAvailableQuestions(
        { subjects, subSubjects, topics, chapters },
        category
      );

      res.json({
        success: true,
        data: {
          availableQuestions: count,
          requestedQuestions: mcqLimit,
          canCreate: count >= mcqLimit,
          message:
            count >= mcqLimit
              ? `Test can be created with ${mcqLimit} questions`
              : `Only ${count} questions available. Need at least ${mcqLimit}`,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Preview Test Questions Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error previewing test questions',
    });
  }
};

/**
 * @desc    Update test
 * @route   PUT /api/admin/tests/:testId
 * @access  Private/Admin
 */
export const updateTest = async (req, res, next) => {
  try {
    const { testId } = req.params;
    const { testTitle, mcqLimit, timeLimit, status, description } = req.body;

    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Update allowed fields
    if (testTitle) test.testTitle = testTitle;
    if (description) test.description = description;
    if (mcqLimit) test.mcqLimit = mcqLimit;
    if (timeLimit && test.testMode === 'exam') test.timeLimit = timeLimit;
    if (status) test.status = status;

    test.updatedBy = req.admin?._id || req.user?._id;

    await test.save();
    await test.populate(['courseId', 'createdBy', 'updatedBy']);

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: formatTestResponse(test),
    });
  } catch (error) {
    console.error('Update Test Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating test',
    });
  }
};

/**
 * @desc    Delete test
 * @route   DELETE /api/admin/tests/:testId
 * @access  Private/Admin
 */
export const deleteTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const test = await Test.findByIdAndDelete(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('Delete Test Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting test',
    });
  }
};

export default {
  createTest,
  getAllTests,
  getTestById,
  getTestForAttempt,
  getTestFilters,
  previewTestQuestions,
  updateTest,
  deleteTest,
};
