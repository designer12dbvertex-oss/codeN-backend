import Test from '../../../models/admin/Test/testModel.js';
import Subject from '../../../models/admin/Subject/subject.model.js';
import SubSubject from '../../../models/admin/Sub-subject/subSubject.model.js';
import Topic from '../../../models/admin/Topic/topic.model.js';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';
import MCQ from '../../../models/admin/MCQs/mcq.model.js';

/**
 * @desc   Create Test
 * @route  POST /api/admin/tests/create
 *
 */

export const createTest = async (req, res) => {
  console.log('🔥 CREATE TEST HIT');
  console.log('👉 BODY:', req.body);

  try {
    const {
      month,
      academicYear,
      testTitle,
      courseId,
      testMode,
      mcqLimit,
      timeLimit,
      description,
    } = req.body;

    // ===== BASIC VALIDATION =====
    if (!month || !academicYear || !testTitle || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Month, Academic Year, Test Title and Course are required',
      });
    }

    if (!mcqLimit || mcqLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'MCQ Limit must be greater than 0',
      });
    }

    if (testMode === 'exam' && (!timeLimit || timeLimit < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Time limit is required for Exam Mode',
      });
    }

    // ===== CREATE TEST (NO MCQs) =====
    const test = await Test.create({
      month,
      academicYear,
      testTitle,
      courseId,
      testMode,
      mcqLimit,
      timeLimit: testMode === 'exam' ? timeLimit : null,
      description: description || '',
      mcqs: [], // 🔥 empty initially
      totalQuestions: 0, // 🔥 empty initially
      status: 'active', // 🔥 start as draft
    });

    return res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test,
    });
  } catch (error) {
    console.error('Create Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
/**
 * @desc   Get Course Filters
 * @route  GET /api/admin/tests/filters/:courseId
 */
export const getCourseFilters = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1️⃣ Subjects (course se linked)
    const subjects = await Subject.find({ courseId }).select('_id name').lean();

    const subjectIds = subjects.map((s) => s._id);

    // 2️⃣ Sub-subjects (subjects se linked)
    const subSubjects = await SubSubject.find({
      subjectId: { $in: subjectIds },
    })
      .select('_id name subjectId')
      .lean();

    const subSubjectIds = subSubjects.map((s) => s._id);

    // 3️⃣ Topics (sub-subjects se linked)
    const topics = await Topic.find({
      subSubjectId: { $in: subSubjectIds },
    })
      .select('_id name subSubjectId')
      .lean();

    const topicIds = topics.map((t) => t._id);

    // 4️⃣ Chapters (topics se linked)
    const chapters = await Chapter.find({
      topicId: { $in: topicIds },
    })
      .select('_id name topicId')
      .lean();

    // 🔥 normalize IDs to string (frontend filtering ke liye)
    const fixedSubSubjects = subSubjects.map((s) => ({
      ...s,
      subjectId: String(s.subjectId),
    }));

    const fixedTopics = topics.map((t) => ({
      ...t,
      subSubjectId: String(t.subSubjectId),
    }));

    const fixedChapters = chapters.map((c) => ({
      ...c,
      topicId: String(c.topicId),
    }));

    return res.status(200).json({
      success: true,
      data: {
        subjects,
        subSubjects: fixedSubSubjects,
        topics: fixedTopics,
        chapters: fixedChapters,
      },
    });
  } catch (error) {
    console.error('Filters Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch filters',
    });
  }
};

/**
 * @desc   Get All Tests (with pagination)
 * @route  GET /api/admin/tests
 */
// export const getAllTests = async (req, res) => {
//   try {
//     const { category, status, testMode, page = 1, limit = 10 } = req.query;

//     const filter = {};
//     if (category) filter.category = category;
//     if (status) filter.status = status;
//     if (testMode) filter.testMode = testMode;

//     const skip = (page - 1) * limit;

//     const tests = await Test.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     const total = await Test.countDocuments(filter);

//     res.json({
//       success: true,
//       data: tests,
//       pagination: {
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error('Get Tests Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch tests',
//     });
//   }
// };
export const getAllTests = async (req, res) => {
  try {
    const {
      category,
      status,
      testMode,
      courseId,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (testMode) filter.testMode = testMode;
    if (courseId) filter.courseId = courseId; // ✅ added

    const skip = (page - 1) * Number(limit);

    const tests = await Test.find(filter)
      .select(
        'testTitle category testMode mcqLimit timeLimit status createdAt updatedAt courseId'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Test.countDocuments(filter);

    res.json({
      success: true,
      tests, // 🔥 keep same key as your frontend
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Tests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
    });
  }
};

/**
 * @desc   Get Single Test
 * @route  GET /api/admin/tests/:id
 */
export const getSingleTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('courseId', 'name')
      .populate('subjects', 'name')
      .populate('subSubjects', 'name')
      .populate('topics', 'name')
      .populate('chapters', 'name');

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
    console.error('Get Single Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test',
    });
  }
};

/**
 * @desc   Delete Test
 * @route  DELETE /api/admin/tests/:id
 */
export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    await test.deleteOne();

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    console.error('Delete Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete test',
    });
  }
};
