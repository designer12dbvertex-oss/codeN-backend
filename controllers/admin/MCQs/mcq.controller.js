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

/**
 * Create MCQ
 * POST /api/admin/mcqs
 */
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

    // Debug: log testId from payload (if null, fix frontend)
    console.log('createMCQ req.body.testId', rawTestId);

    const testId =
      rawTestId === undefined || rawTestId === null || rawTestId === ''
        ? null
        : String(rawTestId).trim() || null;

    let testExists = null;

    if (testId && testId !== 'null') {
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid test ID format',
        });
      }

      testExists = await Test.findById(testId)
        .select('_id mcqLimit testMode')
        .lean();

      if (!testExists) {
        return res.status(404).json({
          success: false,
          message: 'Test not found. Please select a valid test.',
        });
      }

      // 🔥 MCQ LIMIT CHECK (sirf jab test diya ho)
      const currentCount = await MCQ.countDocuments({ testId });

      if (currentCount >= Number(testExists.mcqLimit || 0)) {
        return res.status(400).json({
          success: false,
          message: `MCQ limit reached. This test allows only ${testExists.mcqLimit} MCQs.`,
        });
      }
    }

    const files = req.files || {};

    // Validate chapter & build hierarchy
    const chapter = await Chapter.findById(chapterId);
    if (!chapter)
      return res
        .status(404)
        .json({ success: false, message: 'Chapter not found' });

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required',
      });
    }

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

    // Parse JSON fields if sent as strings (form-data)
    const parsedQuestion =
      typeof question === 'string' ? JSON.parse(question) : question || {};
    const parsedOptions =
      typeof options === 'string' ? JSON.parse(options) : options || [];
    const parsedExplanation = explanation
      ? typeof explanation === 'string'
        ? JSON.parse(explanation)
        : explanation
      : null;

    // Map files to paths
    const questionImages = files['questionImages']
      ? files['questionImages'].map((f) => `/uploads/mcq-images/${f.filename}`)
      : [];
    const explanationImages = files['explanationImages']
      ? files['explanationImages'].map(
          (f) => `/uploads/mcq-images/${f.filename}`
        )
      : [];

    // Build final options (expecting 4)
    const finalOptions = (parsedOptions || []).map((opt, index) => ({
      text: opt.text || '',
      image: files[`optionImage_${index}`]
        ? `/uploads/mcq-images/${files[`optionImage_${index}`][0].filename}`
        : opt.image || null,
    }));

    if (finalOptions.length !== 4) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 4 options are required',
      });
    }

    const ans = Number(correctAnswer);
    if (![0, 1, 2, 3].includes(ans)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid correctAnswer index (0–3 only)',
      });
    }
    // 🔥 BUILD TAGS ARRAY
    const tags = [];

    if (tagId) {
      const tag = await Tag.findById(tagId).select('name').lean();
      if (tag) tags.push(tag.name);
    }

    if (previousYearTag === 'true' || previousYearTag === true) {
      tags.push('Previous Year');
    }

    // Create MCQ (testId validated above)
    const mcq = await MCQ.create({
      testId: testId || null,
      testMode: testExists?.testMode || null,
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
    });

    res
      .status(201)
      .json({ success: true, message: 'MCQ created successfully', data: mcq });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all MCQs
 * GET /api/admin/mcqs
 * Returns test-wise grouped MCQs.
 * - testId provided: single test (with mcqList); empty test returns { totalMCQs: 0, mcqList: [] }.
 * - no testId: all MCQs grouped by test (format: test → totalMCQs → mcqList[]).
 */
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

    if (typeof testId !== 'undefined') {
      // Case 1: Explicit testId filter (including 'null')
      if (testId === 'null') {
        filter.testId = null; // Manual MCQs ONLY
      } else if (testId) {
        filter.testId = testId; // Specific test MCQs ONLY
      }
    } else if (testMode === 'exam') {
      // Only exam MCQs that are attached to a test
      filter.testMode = 'exam';
      filter.testId = { $ne: null };
    } else if (testMode === 'regular') {
      // Only regular MCQs that are attached to a test
      filter.testMode = 'regular';
      filter.testId = { $ne: null };
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

    const mcqs = await MCQ.find(filter)
      .populate('courseId', 'name')
      .populate('subjectId', 'name')
      .populate('subSubjectId', 'name')
      .populate('chapterId', 'name')
      .populate('topicId', 'name')
      .populate('tagId', 'name')
      .populate('testId', 'testTitle testMode')

      .sort({ createdAt: -1 });

    const buildGroup = (tid, tName, tMode, list) => ({
      testId: tid,
      testName: tName || 'Unknown Test',
      testMode: tMode || null, // ✅ ADD THIS
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
      if (mcqs.length > 0) {
        const ref = mcqs[0].testId;
        const name = ref?.testTitle || ref?.name || 'Unknown Test';
        return res.status(200).json({
          success: true,
          count: mcqs.length,
          format: 'test-wise-grouped',
          data: [
            buildGroup(testId, name, mcqs[0]?.testId?.testMode || null, mcqs),
          ],
        });
      }

      const test = await Test.findById(testId).select('testTitle').lean();
      if (!test) {
        return res.status(200).json({
          success: true,
          count: 0,
          format: 'test-wise-grouped',
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        count: 0,
        format: 'test-wise-grouped',
        data: [
          buildGroup(
            testId,
            test.testTitle || 'Unknown Test',
            test.testMode || null,
            []
          ),
        ],
      });
    }

    // —— no testId: all MCQs grouped by test ——

    const grouped = {};

    // Group MCQs by their test. Manual MCQs (testId === null) will be
    // placed under the 'manual' key so they appear as a separate group.
    for (const mcq of mcqs) {
      const t = mcq.testId;
      const key = t?._id?.toString() ?? 'manual';
      const name =
        t?.testTitle ||
        t?.name ||
        (key === 'manual' ? 'Manual MCQs' : 'Unknown Test');

      if (!grouped[key]) {
        grouped[key] = {
          testId: t?._id ?? null,
          testName: name,
          testMode: t?.testMode || null,
          totalMCQs: 0,
          mcqList: [],
        };
      }

      grouped[key].mcqList.push(mcq);
      grouped[key].totalMCQs += 1;
    }

    const testsArray = Object.values(grouped);

    return res.status(200).json({
      success: true,
      count: mcqs.length,
      format: 'test-wise-grouped',
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

/**
 * Update MCQ
 * PUT /api/admin/mcqs/:id
 */
export const updateMCQ = async (req, res, next) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    if (!mcq) {
      return res.status(404).json({ success: false, message: 'MCQ not found' });
    }

    const {
      chapterId,
      topicId,
      tagId,
      // mode removed
      testId,
      question,
      options,
      explanation,
      correctAnswer,
      status,
      ...rest
    } = req.body;

    // strip out any mode if mistakenly sent
    if ('mode' in rest) delete rest.mode;

    const files = req.files || {};

    /* STATUS */
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status (active/inactive only)',
        });
      }
      mcq.status = status;
    }

    /* HIERARCHY CHANGE */
    if (chapterId && chapterId !== mcq.chapterId.toString()) {
      const ch = await Chapter.findById(chapterId);
      if (!ch)
        return res
          .status(404)
          .json({ success: false, message: 'Chapter not found' });

      const ss = await SubSubject.findById(ch.subSubjectId);
      if (!ss)
        return res
          .status(404)
          .json({ success: false, message: 'SubSubject not found' });

      const s = await Subject.findById(ss.subjectId);
      if (!s)
        return res
          .status(404)
          .json({ success: false, message: 'Subject not found' });

      mcq.courseId = s.courseId;
      mcq.subjectId = s._id;
      mcq.subSubjectId = ss._id;
      mcq.chapterId = chapterId;
    }

    /* TOPIC CHANGE */
    if (topicId && topicId !== mcq.topicId?.toString()) {
      const t = await Topic.findById(topicId);
      if (!t)
        return res
          .status(404)
          .json({ success: false, message: 'Topic not found' });

      if (t.chapterId.toString() !== (chapterId || mcq.chapterId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'Topic does not belong to the selected Chapter',
        });
      }

      mcq.topicId = topicId;
    }

    /* TAG */
    if (tagId !== undefined) {
      mcq.tagId = tagId || null;
    }
    /* TEST ATTACH / DETACH */
    if (testId !== undefined) {
      const newTestId = testId || null;

      if (newTestId) {
        if (!mongoose.Types.ObjectId.isValid(newTestId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid test ID',
          });
        }

        const t = await Test.findById(newTestId).select('_id testMode').lean();

        if (!t) {
          return res.status(404).json({
            success: false,
            message: 'Test not found',
          });
        }

        mcq.testId = newTestId;
        mcq.testMode = t.testMode; // 🔥 ADD THIS
      } else {
        mcq.testId = null;
        mcq.testMode = null; // 🔥 ADD THIS
      }
    }

    /* QUESTION UPDATE */
    if (question) {
      const q = typeof question === 'string' ? JSON.parse(question) : question;

      if (q.replaceImages === true) {
        mcq.question.images.forEach(deleteFile);
        mcq.question.images = [];
      }

      const newImgs = files['questionImages']
        ? files['questionImages'].map(
            (f) => `/uploads/mcq-images/${f.filename}`
          )
        : [];

      mcq.question = {
        text: q.text || mcq.question.text,
        images: [...(q.images || mcq.question.images), ...newImgs],
      };
    }

    /* OPTIONS UPDATE */
    if (options) {
      const opts = typeof options === 'string' ? JSON.parse(options) : options;

      if (opts.length !== 4) {
        return res.status(400).json({
          success: false,
          message: 'Exactly 4 options are required',
        });
      }

      // delete old option images if replaced
      opts.forEach((opt, i) => {
        if (opt.replaceImage === true && mcq.options[i]?.image) {
          deleteFile(mcq.options[i].image);
        }
      });

      mcq.options = opts.map((opt, index) => ({
        text: opt.text || '',
        image: files[`optionImage_${index}`]
          ? `/uploads/mcq-images/${files[`optionImage_${index}`][0].filename}`
          : opt.image || mcq.options[index]?.image || null,
      }));

      // revalidate correctAnswer
      if (
        mcq.correctAnswer !== undefined &&
        mcq.correctAnswer > opts.length - 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'correctAnswer index out of range after options update',
        });
      }
    }

    /* EXPLANATION UPDATE */
    if (explanation) {
      const exp =
        typeof explanation === 'string' ? JSON.parse(explanation) : explanation;

      if (exp.replaceImages === true) {
        mcq.explanation.images.forEach(deleteFile);
        mcq.explanation.images = [];
      }

      const newExpImgs = files['explanationImages']
        ? files['explanationImages'].map(
            (f) => `/uploads/mcq-images/${f.filename}`
          )
        : [];

      mcq.explanation = {
        text: exp.text || mcq.explanation.text,
        images: [...(exp.images || mcq.explanation.images), ...newExpImgs],
      };
    }

    /* CORRECT ANSWER */
    if (correctAnswer !== undefined) {
      const ans = Number(correctAnswer);
      if (![0, 1, 2, 3].includes(ans)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid correctAnswer index (0–3 only)',
        });
      }
      mcq.correctAnswer = ans;
    }

    /* SIMPLE FIELDS */
    Object.assign(mcq, rest);
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

/* Delete helper */
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      // log but don't crash
      console.error('Failed to delete file', fullPath, err);
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

    mcq.question?.images?.forEach(deleteFile);
    mcq.options?.forEach((opt) => deleteFile(opt.image));
    mcq.explanation?.images?.forEach(deleteFile);

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
