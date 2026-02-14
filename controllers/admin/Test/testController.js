import Test from '../../../models/admin/Test/testModel.js';
import Subject from '../../../models/admin/Subject/subject.model.js';
import SubSubject from '../../../models/admin/Sub-subject/subSubject.model.js';
import Topic from '../../../models/admin/Topic/topic.model.js';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';
import MCQ from '../../../models/admin/MCQs/mcq.model.js';
import mongoose from 'mongoose';

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
      subjectId,
      subSubjectId,
      chapterId,
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
    if (testMode === 'regular') {
      if (!subjectId || !subSubjectId || !chapterId) {
        return res.status(400).json({
          success: false,
          message:
            'Subject, SubSubject and Chapter are required for Regular mode',
        });
      }
    }

    // ===== CREATE TEST (NO MCQs) =====
    const test = await Test.create({
      month,
      academicYear,
      testTitle,
      courseId,
      testMode,
      subjectId: testMode === 'regular' ? subjectId : null,
      subSubjectId: testMode === 'regular' ? subSubjectId : null,
      chapterId: testMode === 'regular' ? chapterId : null,
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

    // 3️⃣ Chapters (sub-subjects se linked)
    const chapters = await Chapter.find({
      subSubjectId: { $in: subSubjectIds },
    })
      .select('_id name subSubjectId')
      .lean();

    // 🔥 normalize IDs to string (frontend filtering ke liye)

    const fixedSubSubjects = subSubjects.map((s) => ({
      ...s,
      subjectId: String(s.subjectId),
    }));

    const fixedChapters = chapters.map((c) => ({
      ...c,
      subSubjectId: String(c.subSubjectId),
    }));

    return res.status(200).json({
      success: true,
      data: {
        subjects,
        subSubjects: fixedSubSubjects,
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
//     const {
//       category,
//       status,
//       testMode,
//       courseId,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const filter = {};
//     if (category) filter.category = category;
//     if (status) filter.status = status;
//     if (testMode) filter.testMode = testMode;
//     if (courseId) filter.courseId = courseId; // ✅ added

//     const skip = (page - 1) * Number(limit);

//     const tests = await Test.find(filter)
//       .select(
//         'testTitle category testMode mcqLimit timeLimit status createdAt updatedAt courseId'
//       )
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit))
//       .lean();

//     const total = await Test.countDocuments(filter);

//     res.json({
//       success: true,
//       tests, // 🔥 keep same key as your frontend
//       pagination: {
//         total,
//         page: Number(page),
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
    if (courseId) filter.courseId = courseId;

    const skip = (page - 1) * Number(limit);

 const tests = await Test.find(filter)
  .populate('mcqs', '_id') // 👈 IMPORTANT
  .select(
    'testTitle month academicYear category testMode mcqLimit timeLimit status createdAt updatedAt courseId mcqs'
  )


      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Test.countDocuments(filter);

    // 🔥 ADD MCQ COUNTS
const testsWithCounts = tests.map((t) => ({
  ...t,
  totalQuestions: t.mcqs ? t.mcqs.length : 0, // 👈 REAL COUNT
}));


    res.json({
      success: true,
      tests: testsWithCounts,
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
// export const getSingleTest = async (req, res) => {
//   try {
//     const test = await Test.findById(req.params.id).populate(
//       'courseId',
//       'name'
//     );

//     if (!test) {
//       return res.status(404).json({
//         success: false,
//         message: 'Test not found',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: test,
//     });
//   } catch (error) {
//     console.error('Get Single Test Error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch test',
//     });
//   }
// };
export const getSingleTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate(
      'courseId',
      'name'
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // 🔥 ADD MCQ COUNT
    // const count = await MCQ.countDocuments({ testId: test._id });
  const count = test.mcqs ? test.mcqs.length : 0;


    return res.status(200).json({
      success: true,
      data: {
        ...test.toObject(),
        totalQuestions: count,
      },
    });
  } catch (error) {
    console.error('Get Single Test Error:', error);
    return res.status(500).json({
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

export const updateTest = async (req, res) => {
  try {
    const {
      testTitle,
      month,
      academicYear,
      testMode,
      subjectId,
      subSubjectId,
      chapterId,
      mcqLimit,
      timeLimit,
      description,
      status,
    } = req.body;

    // 🔥 BASIC VALIDATION
    if (!testTitle || !month || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Test Title, Month and Academic Year are required',
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

    const updatedTest = await Test.findByIdAndUpdate(
      req.params.id,
      {
        testTitle,
        month, // 🔥 important
        academicYear, // 🔥 important
        testMode,
        subjectId: testMode === 'regular' ? subjectId : null,
        subSubjectId: testMode === 'regular' ? subSubjectId : null,
        chapterId: testMode === 'regular' ? chapterId : null,
        mcqLimit,
        timeLimit: testMode === 'exam' ? timeLimit : null,
        description: description || '',
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: updatedTest,
    });
  } catch (error) {
    console.error('Update Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update test',
    });
  }
};

export const addMcqToTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { mcqId } = req.body;

    if (!mcqId) {
      return res.status(400).json({
        success: false,
        message: 'MCQ ID is required',
      });
    }

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    const mcq = await MCQ.findById(mcqId);
    // 🔥 Prevent duplicate inside Test array
    if (test.mcqs.some((m) => m.toString() === mcqId)) {
      return res.status(400).json({
        success: false,
        message: 'MCQ already added to this test',
      });
    }

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    // 🔥 Prevent duplicate inside MCQ array
    if (mcq.testId.some((t) => t.toString() === id)) {
      return res.status(400).json({
        success: false,
        message: 'MCQ already assigned to this test',
      });
    }

    // 🔥 Enforce mcqLimit AFTER duplicate check
    if (test.mcqs.length >= test.mcqLimit) {
      return res.status(400).json({
        success: false,
        message: `MCQ limit (${test.mcqLimit}) reached`,
      });
    }

    // 🔥 START TRANSACTION
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      test.mcqs.push(mcqId);
      test.totalQuestions = test.mcqs.length;
      await test.save({ session });

      mcq.testId.push(id);

      await mcq.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'MCQ added successfully',
        totalQuestions: test.totalQuestions,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    console.error('Add MCQ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



export const addMcqByCodonId = async (req, res) => {
  try {
    const { testId } = req.params;
    const { codonId } = req.body;

    if (!codonId) {
      return res.status(400).json({
        success: false,
        message: 'MCQ Codon ID is required',
      });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    const mcq = await MCQ.findOne({ codonId });
    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found with this ID',
      });
    }

    // Duplicate check
    if (mcq.testId.includes(testId)) {
      return res.status(400).json({
        success: false,
        message: 'MCQ already added to this test',
      });
    }

    // Limit check
    if ((test.totalQuestions || 0) >= test.mcqLimit) {
      return res.status(400).json({
        success: false,
        message: 'MCQ limit reached for this test',
      });
    }

    // Attach MCQ
    mcq.testId.push(testId);
    mcq.testMode = test.testMode;
    await mcq.save();

    test.mcqs.push(mcq._id);
    test.totalQuestions = (test.totalQuestions || 0) + 1;
    await test.save();

    res.status(200).json({
      success: true,
      message: `MCQ ${codonId} added successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
