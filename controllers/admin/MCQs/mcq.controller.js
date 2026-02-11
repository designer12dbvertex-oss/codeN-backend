import mongoose from 'mongoose';
import MCQ from '../../../models/admin/MCQs/mcq.model.js';
import Test from '../../../models/admin/Test/testModel.js';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';
import Topic from '../../../models/admin/Topic/topic.model.js';
import SubSubject from '../../../models/admin/Sub-subject/subSubject.model.js';
import Subject from '../../../models/admin/Subject/subject.model.js';
import Tag from '../../../models/admin/Tags/tag.model.js';
import fs from 'fs';
import path from 'path';

export const createMCQ = async (req, res, next) => {
  try {
    const {
      chapterId,
      topicId,
      tagId,
      testId: rawTestId,
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

    // 1. 🔥 TEST IDs KO ARRAY MEIN NORMALIZE KAREIN
    // Yeh logic handle karegi: single string, array, ya comma-separated string
    let testIds = [];
    if (rawTestId) {
      if (Array.isArray(rawTestId)) {
        testIds = rawTestId;
      } else if (typeof rawTestId === 'string') {
        // Agar comma separated string hai "id1,id2" toh split karein, warna single ID array banayein
        testIds = rawTestId.includes(',')
          ? rawTestId.split(',').map((id) => id.trim())
          : [rawTestId.trim()];
      }
    }

    // Filter out invalid/empty strings
    testIds = testIds.filter((id) => id && id !== 'null' && id !== 'undefined');

    let firstTestMode = null;

    // 2. 🔥 HAR SELECTED TEST KO VALIDATE KAREIN

    const files = req.files || {};

    // 3. VALIDATE HIERARCHY
    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res
        .status(404)
        .json({ success: false, message: 'Chapter not found' });

    if (!topicId)
      return res
        .status(400)
        .json({ success: false, message: 'Topic ID is required' });

    const topic = await Topic.findById(topicId);
    if (!topic)
      return res
        .status(404)
        .json({ success: false, message: 'Topic not found' });

    if (topic.chapterId.toString() !== chapterId) {
      return res.status(400).json({
        success: false,
        message: 'Topic does not belong to the selected Chapter',
      });
    }

    const subSubject = await SubSubject.findById(chapter.subSubjectId);
    if (!subSubject)
      return res
        .status(404)
        .json({ success: false, message: 'SubSubject not found' });

    const subject = await Subject.findById(subSubject.subjectId);
    if (!subject)
      return res.status(404).json({
        success: false,
        message: 'Full hierarchy (Subject/Course) not found',
      });

    // 4. PARSE JSON FIELDS
    let parsedQuestion = {};
    try {
      parsedQuestion =
        typeof question === 'string' ? JSON.parse(question) : question || {};
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question JSON format',
      });
    }

    let parsedOptions = [];
    try {
      parsedOptions =
        typeof options === 'string' ? JSON.parse(options) : options || [];
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid options JSON format',
      });
    }

    let parsedExplanation = null;
    try {
      parsedExplanation = explanation
        ? typeof explanation === 'string'
          ? JSON.parse(explanation)
          : explanation
        : null;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid explanation JSON format',
      });
    }

    // 5. MAP FILES TO PATHS
    const questionImages = files['questionImages']
      ? files['questionImages'].map((f) => `/uploads/mcq-images/${f.filename}`)
      : [];
    const explanationImages = files['explanationImages']
      ? files['explanationImages'].map(
          (f) => `/uploads/mcq-images/${f.filename}`
        )
      : [];

    const finalOptions = (parsedOptions || []).map((opt, index) => ({
      text: opt.text || '',
      image: files[`optionImage_${index}`]
        ? `/uploads/mcq-images/${files[`optionImage_${index}`][0].filename}`
        : opt.image || null,
    }));

    // 🔥 Question validation (always run)
    if (!parsedQuestion?.text || !parsedQuestion.text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required',
      });
    }

    // 🔥 Options count validation
    if (!Array.isArray(finalOptions) || finalOptions.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 4 options are required',
      });
    }

    // 🔥 Each option must have text
    if (finalOptions.some((opt) => !opt?.text || !opt.text.trim())) {
      return res.status(400).json({
        success: false,
        message: 'All options must have text',
      });
    }
    // 🔥 Duplicate options check (production safety)
    const optionTexts = finalOptions.map((o) => o.text.trim().toLowerCase());
    const uniqueOptions = new Set(optionTexts);

    if (uniqueOptions.size !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate options are not allowed',
      });
    }

    const ans = Number(correctAnswer);

    if (!Number.isInteger(ans) || ans < 0 || ans > 3) {
      return res.status(400).json({
        success: false,
        message: 'correctAnswer must be an integer between 0 and 3',
      });
    }

    // 6. BUILD TAGS ARRAY
    const tags = [];
    if (tagId) {
      const tag = await Tag.findById(tagId).select('name').lean();
      if (tag) tags.push(tag.name);
    }
    if (previousYearTag === 'true' || previousYearTag === true) {
      tags.push('Previous Year');
    }

    // 7. 🔥 CREATE MCQ (testId is now an array)
    const session = await mongoose.startSession();

    let mcq;

    try {
      session.startTransaction();

      if (testIds.length > 0) {
        for (const tid of testIds) {
          if (!mongoose.Types.ObjectId.isValid(tid)) {
            throw new Error(`Invalid test ID format: ${tid}`);
          }

          const testExists = await Test.findById(tid)
            .select('_id mcqLimit testMode testTitle')
            .session(session);

          if (!testExists) {
            throw new Error(`Test not found: ${tid}`);
          }

          const currentCount = await MCQ.countDocuments({
            testId: tid,
          }).session(session);

          if (currentCount >= Number(testExists.mcqLimit || 0)) {
            throw new Error(
              `MCQ limit reached for test "${testExists.testTitle}". Limit: ${testExists.mcqLimit}`
            );
          }

          if (!firstTestMode) {
            firstTestMode = testExists.testMode;
          }
        }
      }

      const created = await MCQ.create(
        [
          {
            testId: testIds,
            testMode: firstTestMode || null,
            courseId: subject.courseId,
            subjectId: subject._id,
            subSubjectId: subSubject._id,
            topicId: topic._id,
            chapterId,
            tagId: tagId || null,
            tags,
            question: {
              text: parsedQuestion.text || '',
              images: questionImages,
            },
            options: finalOptions,
            correctAnswer: ans,
            explanation: {
              text: parsedExplanation?.text || '',
              images: explanationImages,
            },
            difficulty: difficulty || 'medium',
            marks: marks || 4,
            negativeMarks: negativeMarks || 1,
            previousYearTag:
              previousYearTag === 'true' || previousYearTag === true || false,
            status: status || 'active',
            createdBy: req.admin._id,
            updatedBy: req.admin._id,
          },
        ],
        { session }
      );

      mcq = created[0];

      for (const tid of testIds) {
        await Test.findByIdAndUpdate(
          tid,
          { $addToSet: { mcqs: mcq._id } },
          { session }
        );

        const count = await MCQ.countDocuments({ testId: tid }).session(
          session
        );

        await Test.findByIdAndUpdate(
          tid,
          { totalQuestions: count },
          { session }
        );
      }

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } finally {
      session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: 'MCQ created successfully',
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMCQs = async (req, res, next) => {
  try {
    const {
      testId,
      testMode,
      courseId,
      subjectId,
      subSubjectId,
      topicId,
      chapterId,
      tagId,
      status,
      difficulty,
    } = req.query;

    const filter = {};

    /**
     * STRICT FILTERING LOGIC
     *
     * Case 1: testId === 'null' → Only manual MCQs (testId is null)
     * Case 2: testId provided → Only that specific test's MCQs
     * Case 3: testMode === 'regular' → Only Q-Test MCQs (testId exists AND testMode = 'regular')
     * Case 4: testMode === 'exam' → Only Test MCQs (testId exists AND testMode = 'exam')
     * Case 5: No filter → All MCQs grouped by test
     *
     * ⚠️ CRITICAL: Manual, regular, and exam MCQs must NEVER mix
     */

    /* ===========================
   STRICT PRODUCTION FILTERING
   =========================== */

    // 1️⃣ Specific Test View
    if (testId && testId !== 'null') {
      filter.testId = testId;
    }

    // 2️⃣ Manual MCQs Only
    else if (testId === 'null') {
      filter.testMode = null; // manual MCQs
    }

    // 3️⃣ Exam MCQs Only
    else if (testMode === 'exam') {
      filter.testMode = 'exam';
    }

    // 4️⃣ Regular (Q-Test) MCQs Only
    else if (testMode === 'regular') {
      filter.testMode = 'regular';
    }

    // Case 5: No explicit filter means return all MCQs (will be grouped by test)

    if (courseId) filter.courseId = courseId;
    if (subjectId) filter.subjectId = subjectId;
    if (subSubjectId) filter.subSubjectId = subSubjectId;
    if (topicId) filter.topicId = topicId;
    if (chapterId) filter.chapterId = chapterId;
    if (tagId) filter.tagId = tagId;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const totalCount = await MCQ.countDocuments(filter);

    const mcqs = await MCQ.find(filter)

      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name')
      .populate('topicId', 'name')
      .populate('tagId', 'name')
      .populate({
        path: 'testId',
        select: 'testTitle testMode',
        model: 'Test',
      })

      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const buildGroup = (tid, tName, tMode, list) => ({
      testId: tid,
      testName: tName ?? 'Deleted Test',
      testMode: tMode ?? null,
      totalMCQs: list.length,
      mcqList: list,
    });

    // 🔥 SPECIAL CASE: Manual MCQs
    if (testId === 'null') {
      return res.status(200).json({
        success: true,
        count: mcqs.length,
        format: 'test-wise-grouped',
        data: [
          {
            testId: null,
            testName: 'Manual MCQs',
            testMode: null,
            totalMCQs: mcqs.length,
            mcqList: mcqs,
          },
        ],
      });
    }

    // —— testId provided: single-test view ——
    if (testId && testId !== 'null') {
      // 1️⃣ Always fetch test directly
      const test = await Test.findById(testId)
        .select('testTitle testMode')
        .lean();

      if (!test) {
        return res.status(200).json({
          success: true,
          count: 0,
          format: 'test-wise-grouped',
          data: [],
        });
      }

      // 2️⃣ Return test name even if mcqs empty
      return res.status(200).json({
        success: true,
        count: mcqs.length,
        format: 'test-wise-grouped',
        data: [
          buildGroup(
            testId,
            test.testTitle, // ✅ Always real test name
            test.testMode ?? null,
            mcqs // ✅ Actual MCQs list
          ),
        ],
      });
    }

    // —— no testId: all MCQs grouped by test ——

    const grouped = {};

    // Group MCQs by their test. Manual MCQs (testId === null) will be
    for (const mcq of mcqs) {
      if (Array.isArray(mcq.testId) && mcq.testId.length > 0) {
        for (const t of mcq.testId) {
          if (!t) continue;

          const key = t._id.toString();
          const name = t.testTitle ?? 'Deleted Test';

          if (!grouped[key]) {
            grouped[key] = {
              testId: t._id,
              testName: name,
              testMode: t.testMode ?? null,
              totalMCQs: 0,
              mcqList: [],
            };
          }

          grouped[key].mcqList.push(mcq);
          grouped[key].totalMCQs += 1;
        }
      } else {
        // Manual MCQ
        const key = 'manual';

        if (!grouped[key]) {
          grouped[key] = {
            testId: null,
            testName: 'Manual MCQs',
            testMode: null,
            totalMCQs: 0,
            mcqList: [],
          };
        }

        grouped[key].mcqList.push(mcq);
        grouped[key].totalMCQs += 1;
      }
    }

    const testsArray = Object.values(grouped);

    return res.status(200).json({
      success: true,
      count: mcqs.length,
      format: 'test-wise-grouped',
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: testsArray,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single MCQ
 * GET /api/admin/mcqs/:id
 */
export const getMCQById = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id).populate(
      'courseId subjectId subSubjectId chapterId tagId'
    );

    if (!mcq)
      return res.status(404).json({ success: false, message: 'MCQ not found' });
    res.status(200).json({ success: true, data: mcq });
  } catch (error) {
    next(error);
  }
};

export const updateMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: 'MCQ not found',
      });
    }

    const {
      chapterId,
      topicId,
      tagId,
      testId: rawTestId,
      question,
      options,
      explanation,
      correctAnswer,
      status,
      ...rest
    } = req.body;

    if ('mode' in rest) delete rest.mode;

    const files = req.files || {};

    /* ---------------- STATUS ---------------- */
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }
      mcq.status = status;
    }

    /* ---------------- TEST ATTACH / DETACH ---------------- */
    if (rawTestId !== undefined) {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const oldTestIds = (mcq.testId || []).map((id) => id.toString());

        const newTestIds = rawTestId
          ? (Array.isArray(rawTestId)
              ? rawTestId
              : rawTestId.includes(',')
                ? rawTestId.split(',').map((id) => id.trim())
                : [rawTestId.trim()]
            ).filter((id) => id && id !== 'null')
          : [];

        for (const tid of newTestIds) {
          if (!mongoose.Types.ObjectId.isValid(tid)) {
            throw new Error(`Invalid test ID: ${tid}`);
          }
        }

        // Remove from old tests
        for (const oldId of oldTestIds) {
          if (!newTestIds.includes(oldId)) {
            await Test.findByIdAndUpdate(
              oldId,
              { $pull: { mcqs: mcq._id } },
              { session }
            );
          }
        }

        // Add to new tests
        for (const newId of newTestIds) {
          if (!oldTestIds.includes(newId)) {
            await Test.findByIdAndUpdate(
              newId,
              { $addToSet: { mcqs: mcq._id } },
              { session }
            );
          }
        }

        mcq.testId = newTestIds;

        if (newTestIds.length > 0) {
          const firstTest = await Test.findById(newTestIds[0])
            .select('testMode')
            .lean();
          mcq.testMode = firstTest?.testMode || null;
        } else {
          mcq.testMode = null;
        }

        await mcq.save({ session });

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } finally {
        session.endSession();
      }
    }

    /* ---------------- HIERARCHY UPDATE ---------------- */
    if (chapterId && chapterId !== mcq.chapterId?.toString()) {
      const chapter = await Chapter.findById(chapterId);
      if (!chapter)
        return res.status(404).json({
          success: false,
          message: 'Chapter not found',
        });

      const subSubject = await SubSubject.findById(chapter.subSubjectId);
      const subject = await Subject.findById(subSubject?.subjectId);

      if (subject) {
        mcq.courseId = subject.courseId;
        mcq.subjectId = subject._id;
        mcq.subSubjectId = subSubject._id;
        mcq.chapterId = chapterId;
      }
    }

    if (topicId && topicId !== mcq.topicId?.toString()) {
      const topic = await Topic.findById(topicId);
      if (topic) mcq.topicId = topicId;
    }

    if (tagId !== undefined) {
      mcq.tagId = tagId || null;
    }

    /* ---------------- QUESTION UPDATE ---------------- */
    if (question) {
      let q;
      try {
        q = typeof question === 'string' ? JSON.parse(question) : question;
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid question JSON format',
        });
      }

      if (q.replaceImages === true) {
        mcq.question.images = [];
      }

      const newImgs = files['questionImages']
        ? files['questionImages'].map(
            (f) => `/uploads/mcq-images/${f.filename}`
          )
        : [];

      mcq.question = {
        text: q.text !== undefined ? q.text : mcq.question.text,
        images: q.replaceImages
          ? newImgs
          : [...(mcq.question.images || []), ...newImgs],
      };
    }

    /* ---------------- OPTIONS UPDATE ---------------- */
    if (options) {
      const opts = typeof options === 'string' ? JSON.parse(options) : options;

      if (!Array.isArray(opts) || opts.length !== 4) {
        return res.status(400).json({
          success: false,
          message: 'Exactly 4 options are required',
        });
      }

      mcq.options = opts.map((opt, index) => ({
        text: opt.text || '',
        image: files[`optionImage_${index}`]
          ? `/uploads/mcq-images/${files[`optionImage_${index}`][0].filename}`
          : opt.image || mcq.options[index]?.image || null,
      }));
    }

    /* ---------------- CORRECT ANSWER ---------------- */
    if (correctAnswer !== undefined) {
      const ans = Number(correctAnswer);

      if (!Number.isInteger(ans) || ans < 0 || ans > 3) {
        return res.status(400).json({
          success: false,
          message: 'correctAnswer must be between 0 and 3',
        });
      }

      mcq.correctAnswer = ans;
    }

    /* ---------------- OTHER FIELDS ---------------- */
    ['marks', 'negativeMarks', 'difficulty', 'previousYearTag'].forEach(
      (field) => {
        if (req.body[field] !== undefined) {
          mcq[field] = req.body[field];
        }
      }
    );

    mcq.updatedBy = req.admin._id;

    if (rawTestId === undefined) {
      await mcq.save();
    }

    return res.status(200).json({
      success: true,
      message: 'MCQ updated successfully',
      data: mcq,
    });
  } catch (error) {
    next(error);
  }
};

/* Delete helper */
const deleteFile = async (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), filePath);

  try {
    await fs.promises.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to delete file:', err.message);
    }
  }
};

/**
 * Delete MCQ
 */
export const deleteMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq)
      return res.status(404).json({ success: false, message: 'MCQ not found' });

    for (const img of mcq.question?.images || []) {
      await deleteFile(img);
    }

    for (const opt of mcq.options || []) {
      await deleteFile(opt.image);
    }

    for (const img of mcq.explanation?.images || []) {
      await deleteFile(img);
    }

    if (Array.isArray(mcq.testId) && mcq.testId.length > 0) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        for (const tid of mcq.testId) {
          await Test.findByIdAndUpdate(
            tid,
            { $pull: { mcqs: mcq._id } },
            { session }
          );

          const count = await MCQ.countDocuments({ testId: tid }).session(
            session
          );

          await Test.findByIdAndUpdate(
            tid,
            { totalQuestions: count },
            { session }
          );
        }

        await session.commitTransaction();
        session.endSession();
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
    }

    await mcq.deleteOne();

    res.status(200).json({ success: true, message: 'MCQ permanently deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle status
 */
export const toggleMCQStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq)
      return res.status(404).json({ success: false, message: 'MCQ not found' });

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status (active/inactive only)',
      });
    }

    mcq.status = status;
    mcq.updatedBy = req.admin._id;
    await mcq.save();

    res
      .status(200)
      .json({ success: true, message: `MCQ status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Chapters by Subject & SubSubject
 * GET /api/admin/mcqs/chapters?subjectId=&subSubjectId=
 */
export const getChaptersBySubSubject = async (req, res, next) => {
  try {
    const { subjectId, subSubjectId } = req.query;

    if (!subjectId || !subSubjectId) {
      return res.status(400).json({
        success: false,
        message: 'subjectId and subSubjectId are required',
      });
    }

    const chapters = await Chapter.find({ subSubjectId })
      .select('_id name')
      .sort({ name: 1 })
      .lean();

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
 * Get Topics by Chapter
 * GET /api/admin/mcqs/topics?chapterId=
 */
export const getTopicsByChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: 'chapterId is required',
      });
    }

    const topics = await Topic.find({ chapterId })
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};
