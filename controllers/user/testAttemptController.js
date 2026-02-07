// import Test from '../../models/admin/Test/testModel.js';
// import TestAttempt from '../../models/user/testAttemptModel.js';
// import MCQ from '../../models/admin/MCQs/mcq.model.js';

// /**
//  * 🔥 AUTO SUBMIT HELPER
//  */
// const autoSubmitTest = async (attempt, test) => {
//   if (attempt.submittedAt) return attempt;

//   let score = 0;

//   // simple scoring: 1 mark per correct answer
//   attempt.answers.forEach((a) => {
//     if (a.isCorrect) score += 1;
//   });

//   attempt.score = score;
//   attempt.submittedAt = new Date();
//   await attempt.save();

//   return attempt;
// };

// /**
//  * USER – GET AVAILABLE TESTS
//  * GET /api/tests?courseId=xxxx
//  */
// export const getAvailableTests = async (req, res) => {
//   try {
//     const { courseId } = req.query;

//     const filter = { status: 'active' };
//     if (courseId) filter.courseId = courseId;

//     const tests = await Test.find(filter)
//       .select(
//         '_id testTitle category testMode mcqLimit timeLimit createdAt updatedAt'
//       )
//       .sort({ createdAt: -1 });

//     res.json({ success: true, tests });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * USER – START TEST
//  * POST /api/tests/:testId/start
//  */
// export const startTest = async (req, res) => {
//   try {
//     const test = await Test.findById(req.params.testId);

//     if (!test || test.status !== 'active') {
//       return res.status(404).json({ message: 'Test not available' });
//     }

//     let endsAt = null;

//     if (test.testMode === 'exam') {
//       endsAt = new Date(Date.now() + test.timeLimit * 60 * 1000);
//     }

//     const existing = await TestAttempt.findOne({
//       userId: req.user._id,
//       testId: test._id,
//       submittedAt: { $exists: false },
//     });

//     if (existing) {
//       return res.json({
//         success: true,
//         attemptId: existing._id,
//         testMode: test.testMode,
//         timeLimit: test.timeLimit,
//         endsAt: existing.endsAt,
//         resumed: true,
//       });
//     }

//     const attempt = await TestAttempt.create({
//       userId: req.user._id,
//       testId: test._id,
//       startedAt: new Date(),
//       endsAt,
//     });

//     res.json({
//       success: true,
//       attemptId: attempt._id,
//       testMode: test.testMode,
//       timeLimit: test.timeLimit,
//       endsAt,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * USER – GET NEXT QUESTION
//  * GET /api/tests/attempt/:attemptId/question
//  */
// export const getNextQuestion = async (req, res) => {
//   try {
//     const attempt = await TestAttempt.findById(req.params.attemptId);
//     if (!attempt) {
//       return res.status(404).json({ message: 'Attempt not found' });
//     }

//     const test = await Test.findById(attempt.testId);

//     // ⏱️ AUTO SUBMIT WHEN TIME OVER
//     if (test.testMode === 'exam' && new Date() > attempt.endsAt) {
//       const submittedAttempt = await autoSubmitTest(attempt, test);

//       return res.json({
//         success: true,
//         message: 'Time over. Test auto submitted',
//         score: submittedAttempt.score,
//       });
//     }

//     // const mcqs = await MCQ.find({ _id: { $in: test.mcqs } });
//     const mcqs = await MCQ.find({ _id: { $in: test.mcqs } }).lean();

//     const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

//     const orderedMcqs = test.mcqs
//       .map((id) => mcqMap.get(id.toString()))
//       .filter(Boolean);

//     if (attempt.currentIndex >= orderedMcqs.length) {
//       const submittedAttempt = await autoSubmitTest(attempt, test);

//       return res.json({
//         success: true,
//         message: 'Test completed',
//         score: submittedAttempt.score,
//       });
//     }

//     // const mcq = mcqs[attempt.currentIndex];
//     const mcq = orderedMcqs[attempt.currentIndex];

//     res.json({
//       success: true,
//       mcq,
//       timeLeft:
//         test.testMode === 'exam'
//           ? Math.max(0, Math.floor((attempt.endsAt - Date.now()) / 1000))
//           : null,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * USER – SUBMIT ANSWER
//  * POST /api/tests/attempt/:attemptId/answer
//  */
// export const submitAnswer = async (req, res) => {
//   try {
//     const { selectedOption } = req.body;

//     const attempt = await TestAttempt.findById(req.params.attemptId);
//     if (!attempt) {
//       return res.status(404).json({ message: 'Attempt not found' });
//     }

//     const test = await Test.findById(attempt.testId);
//     if (attempt.answers.length > attempt.currentIndex) {
//       return res.status(400).json({
//         message: 'Answer already submitted for this question',
//       });
//     }

//     // ⏱️ AUTO SUBMIT WHEN TIME OVER
//     if (test.testMode === 'exam' && new Date() > attempt.endsAt) {
//       const submittedAttempt = await autoSubmitTest(attempt, test);

//       return res.json({
//         success: true,
//         message: 'Time over. Test auto submitted',
//         score: submittedAttempt.score,
//       });
//     }

//     const mcqs = await MCQ.find({ _id: { $in: test.mcqs } }).lean();

//     const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

//     const orderedMcqs = test.mcqs
//       .map((id) => mcqMap.get(id.toString()))
//       .filter(Boolean);

//     const mcq = orderedMcqs[attempt.currentIndex];

//     if (!mcq) {
//       return res.status(400).json({ message: 'No question found' });
//     }

//     const isCorrect = mcq.correctAnswer === selectedOption;

//     attempt.answers.push({
//       mcqId: mcq._id,
//       selectedOption,
//       isCorrect,
//     });

//     attempt.currentIndex += 1;
//     await attempt.save();

//     res.json({ success: true, isCorrect });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * USER – SUBMIT TEST (MANUAL)
//  * POST /api/tests/attempt/:attemptId/submit
//  */
// export const submitTest = async (req, res) => {
//   try {
//     const attempt = await TestAttempt.findById(req.params.attemptId);
//     if (!attempt) {
//       return res.status(404).json({ message: 'Attempt not found' });
//     }

//     if (attempt.submittedAt) {
//       return res.status(400).json({
//         message: 'Test already submitted',
//       });
//     }

//     const test = await Test.findById(attempt.testId);
//     const submittedAttempt = await autoSubmitTest(attempt, test);

//     res.json({
//       success: true,
//       score: submittedAttempt.score,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * USER – GET TEST RESULT
//  * GET /api/tests/test-result/:userId/:testId
//  */
// export const getTestResult = async (req, res) => {
//   try {
//     const { userId, testId } = req.params;

//     const attempt = await TestAttempt.findOne({ userId, testId });

//     if (!attempt) {
//       return res.status(404).json({
//         message: 'Test attempt not found',
//       });
//     }

//     const totalQuestions = attempt.answers.length;

//     const correct = attempt.answers.filter(
//       (ans) => ans.isCorrect === true
//     ).length;

//     const wrong = attempt.answers.filter(
//       (ans) => ans.isCorrect === false
//     ).length;

//     const notAttempted = totalQuestions - (correct + wrong);

//     const performance =
//       totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

//     return res.status(200).json({
//       totalQuestions,
//       correct,
//       wrong,
//       notAttempted,
//       performance,
//       score: attempt.score,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// /**
//  * USER – GET TEST REVIEW
//  * GET /api/tests/test-review/:userId/:testId
//  */
// export const getTestReview = async (req, res) => {
//   try {
//     const { userId, testId } = req.params;

//     const attempt = await TestAttempt.findOne({ userId, testId }).lean();

//     if (!attempt) {
//       return res.status(404).json({ message: 'Test attempt not found' });
//     }

//     const mcqIds = attempt.answers.map((a) => a.mcqId);

//     const mcqs = await MCQ.find({ _id: { $in: mcqIds } }).lean();

//     const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

//     const review = attempt.answers
//       .map((ans) => {
//         const mcq = mcqMap.get(ans.mcqId.toString());
//         if (!mcq) return null;

//         let status = 'Not Attempted';
//         if (ans.selectedOption !== undefined) {
//           status = ans.isCorrect ? 'Correct' : 'Wrong';
//         }

//         return {
//           mcqId: mcq._id,
//           question: mcq.question,
//           options: mcq.options,
//           selectedOption: ans.selectedOption ?? null,
//           correctAnswer: mcq.correctAnswer,
//           status,
//         };
//       })
//       .filter(Boolean);

//     return res.status(200).json({
//       testId,
//       totalQuestions: review.length,
//       review,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

import mongoose from 'mongoose';
import Test from '../../models/admin/Test/testModel.js';
import TestAttempt from '../../models/user/testAttemptModel.js';
import MCQ from '../../models/admin/MCQs/mcq.model.js';
import { enforceSubscription } from '../../utils/subscriptionHelper.js';
/**
 * Helper: validate ObjectId
 */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * AUTO SUBMIT HELPER
 * Recomputes score from test.mcqs + attempt.answers (safer than trusting attempt.isCorrect).
 * If called for automatic submission, pass submittedBy = 'AUTO', else pass 'MANUAL'.
 */
const finalizeAndSubmitAttempt = async (attempt, submitter = 'AUTO') => {
  if (!attempt) return null;
  if (attempt.submittedAt) return attempt;

  const test = await Test.findById(attempt.testId).lean();

  let score = 0;

  if (test && Array.isArray(test.mcqs) && test.mcqs.length) {
    // NORMAL CASE
    const mcqs = await MCQ.find({ _id: { $in: test.mcqs } }).lean();
    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

    for (const mcqId of test.mcqs) {
      const qid = mcqId.toString();
      const mcqDoc = mcqMap.get(qid);
      const userAns = (attempt.answers || []).find(
        (a) => a.mcqId?.toString() === qid
      );

      if (!userAns) continue;

      if (mcqDoc) {
        if (Number(userAns.selectedOption) === Number(mcqDoc.correctAnswer)) {
          score += 1;
        }
      } else {
        if (userAns.isCorrect) score += 1;
      }
    }
  } else {
    // 🔥 FALLBACK CASE (jab test.mcqs empty ho)
    score = (attempt.answers || []).filter((a) => a.isCorrect).length;
  }

  attempt.score = score;
  attempt.submittedAt = new Date();
  attempt.submittedBy = submitter;
  await attempt.save();

  return attempt;
};

/**
 * USER – GET AVAILABLE TESTS (Exam Mode Only)
 * GET /api/tests?courseId=xxxx
 */
export const getAvailableTests = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user._id;
    if (!(await enforceSubscription(userId, res))) return;
    const now = new Date();

    const filter = { testMode: 'exam', status: 'active' };
    if (courseId) filter.courseId = courseId;

    const tests = await Test.find(filter)
      .select(
        '_id testTitle courseId mcqLimit timeLimit mcqs createdAt updatedAt'
      )
      .sort({ createdAt: -1 })
      .lean();

    if (!tests.length) {
      return res.json({ success: true, data: [] });
    }

    // fetch attempts of this user for these tests
    const testIds = tests.map((t) => t._id);

    const attempts = await TestAttempt.find({
      userId,
      testId: { $in: testIds },
    }).lean();

    const attemptMap = new Map(attempts.map((a) => [a.testId.toString(), a]));

    const response = await Promise.all(
      tests.map(async (test) => {
        const attempt = attemptMap.get(test._id.toString());

        let status = 'NOT_STARTED';
        let submittedBy = null;
        let startTestTime = null;
        let endTestTime = null;

        // default remaining time in seconds (for frontend countdown)
        let remainingTimeSeconds = (test.timeLimit || 0) * 60;

        if (attempt) {
          startTestTime = attempt.startedAt || null;
          endTestTime = attempt.endsAt || null;

          if (attempt.endsAt) {
            remainingTimeSeconds = Math.max(
              0,
              Math.floor(
                (new Date(attempt.endsAt).getTime() - now.getTime()) / 1000
              )
            );
          }

          if (attempt.submittedAt) {
            status =
              attempt.submittedBy === 'AUTO' ? 'AUTO_SUBMITTED' : 'COMPLETED';
            submittedBy = attempt.submittedBy;
            remainingTimeSeconds = 0;
          } else if (attempt.endsAt && now > new Date(attempt.endsAt)) {
            // Time expired but attempt not marked submitted yet -> auto state
            status = 'AUTO_SUBMITTED';
            submittedBy = 'AUTO';
            remainingTimeSeconds = 0;
          } else {
            status = 'IN_PROGRESS';
          }
        }

        // 🔥 FIX: MCQ COUNT FALLBACK
        let totalMcqCount = (test.mcqs || []).length;

        if (totalMcqCount === 0) {
          totalMcqCount = await MCQ.countDocuments({
            testId: test._id,
            status: 'active',
          });
        }

        return {
          testId: test._id,
          testTitle: test.testTitle,
          totalMcqCount,
          totalTime: test.timeLimit, // minutes
          remainingTimeSeconds,
          startTestTime,
          endTestTime,
          status,
          submittedBy,
        };
      })
    );

    return res.json({ success: true, data: response });
  } catch (err) {
    console.error('getAvailableTests error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available tests',
    });
  }
};

/**
 * USER – START TEST (Start or Resume)
 * POST /api/tests/:testId/start
 *
 * Response includes full MCQ list (ordered by test.mcqs),
 * remaining time (seconds), totalTestTime (minutes), and selectedOption per question (if resumed).
 */
export const startTest = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!(await enforceSubscription(userId, res))) return;
    const { testId } = req.params;

    // 1️⃣ Validate testId
    if (!isValidId(testId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid test id' });
    }

    // 2️⃣ Fetch test
    const test = await Test.findById(testId).lean();
    if (!test || test.status !== 'active') {
      return res
        .status(404)
        .json({ success: false, message: 'Test not available' });
    }

    // 3️⃣ Find existing active attempt
    let attempt = await TestAttempt.findOne({
      userId,
      testId,
      submittedAt: { $exists: false },
    });

    // 4️⃣ Create attempt if not exists
    if (!attempt) {
      const endsAt =
        test.testMode === 'exam' && test.timeLimit
          ? new Date(Date.now() + Number(test.timeLimit) * 60 * 1000)
          : null;

      attempt = await TestAttempt.create({
        userId,
        testId: test._id,
        startedAt: new Date(),
        endsAt,
        answers: [],
        currentIndex: 0,
      });
    }

    // 5️⃣ Auto submit if exam time over
    if (
      test.testMode === 'exam' &&
      attempt.endsAt &&
      new Date() > new Date(attempt.endsAt) &&
      !attempt.submittedAt
    ) {
      await finalizeAndSubmitAttempt(attempt, 'AUTO');
      return res.json({
        success: true,
        submitted: true,
        message: 'Time over. Test auto submitted.',
        score: attempt.score,
      });
    }

    // 6️⃣ FETCH MCQs (ROBUST LOGIC)
    let orderedMcqs = [];

    // Case A: test.mcqs exists (preferred – preserves order)
    if (Array.isArray(test.mcqs) && test.mcqs.length > 0) {
      const mcqs = await MCQ.find({
        _id: { $in: test.mcqs },
        status: 'active',
      })
        .populate('tagId', 'name')
        .lean();

      const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

      orderedMcqs = test.mcqs
        .map((id) => mcqMap.get(id.toString()))
        .filter(Boolean);
    }

    // Case B: fallback → fetch by testId
    if (orderedMcqs.length === 0) {
      orderedMcqs = await MCQ.find({
        testId: test._id,
        status: 'active',
      })
        .populate('tagId', 'name')
        .sort({ createdAt: 1 }) // or questionOrder if exists
        .lean();
    }

    // 7️⃣ Map attempted answers
    const answersMap = new Map(
      (attempt.answers || []).map((a) => [a.mcqId.toString(), a.selectedOption])
    );

    // 8️⃣ Format MCQs for frontend (SAFE RESPONSE)
    const formattedMcqs = orderedMcqs.map((m) => ({
      mcqId: m._id,
      mcqName: {
        text: m.question?.text || '',
        images: m.question?.images || [],
      },
      options: (m.options || []).map((opt, idx) => ({
        optionId: idx,
        name: opt?.text || '',
        image: opt?.image || null,
      })),
      tag: m.tagId?.name || null,
      selectedOption: answersMap.has(m._id.toString())
        ? answersMap.get(m._id.toString())
        : null,
    }));

    // 9️⃣ Remaining time
    const remainingTimeSeconds = attempt.endsAt
      ? Math.max(
          0,
          Math.floor((new Date(attempt.endsAt).getTime() - Date.now()) / 1000)
        )
      : null;

    // 🔟 Final response
    return res.json({
      success: true,
      attemptId: attempt._id,
      testTitle: test.testTitle,
      totalMcqCount: formattedMcqs.length,
      totalTestTime: test.timeLimit || null, // minutes
      remainingTimeSeconds,
      mcqs: formattedMcqs,
    });
  } catch (err) {
    console.error('startTest error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to start test',
    });
  }
};

/**
 * USER – GET NEXT QUESTION (legacy / sequential)
 * GET /api/tests/attempt/:attemptId/question
 *
 * Keeps legacy behaviour: returns specific question based on currentIndex,
 * and timeLeft in seconds (for exam).
 */
export const getNextQuestion = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!(await enforceSubscription(req.user._id, res))) return;

    if (!isValidId(attemptId))
      return res.status(400).json({ message: 'Invalid attempt id' });

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const test = await Test.findById(attempt.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Auto-submit if exam and time over
    if (
      test.testMode === 'exam' &&
      attempt.endsAt &&
      new Date() > new Date(attempt.endsAt)
    ) {
      const submittedAttempt = await finalizeAndSubmitAttempt(attempt, 'AUTO');
      return res.json({
        success: true,
        message: 'Time over. Test auto submitted',
        score: submittedAttempt.score,
      });
    }

    // fetch mcqs
    const mcqs = await MCQ.find({
      _id: { $in: test.mcqs },
      status: 'active',
    }).lean();
    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));
    const orderedMcqs = (test.mcqs || [])
      .map((id) => mcqMap.get(id.toString()))
      .filter(Boolean);

    if (attempt.currentIndex >= orderedMcqs.length) {
      const submittedAttempt = await finalizeAndSubmitAttempt(attempt, 'AUTO');
      return res.json({
        success: true,
        message: 'Test completed',
        score: submittedAttempt.score,
      });
    }

    const mcq = orderedMcqs[attempt.currentIndex];

    const timeLeftSeconds = attempt.endsAt
      ? Math.max(
          0,
          Math.floor((new Date(attempt.endsAt).getTime() - Date.now()) / 1000)
        )
      : null;

    return res.json({
      success: true,
      mcq,
      timeLeftSeconds,
    });
  } catch (err) {
    console.error('getNextQuestion error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * USER – SUBMIT ANSWER
 * POST /api/tests/attempt/:attemptId/answer
 *
 * Backward-compatible:
 * - If body contains { mcqId, optionId } -> update/overwrite that MCQ's answer
 * - Else if body contains { selectedOption } -> sequential behaviour (old flow) using currentIndex
 */
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!(await enforceSubscription(req.user._id, res))) return;

    if (!isValidId(attemptId))
      return res.status(400).json({ message: 'Invalid attempt id' });

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    // prevent submitting to already submitted attempt
    if (attempt.submittedAt) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const test = await Test.findById(attempt.testId).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // auto-submit if exam and time over
    if (
      test.testMode === 'exam' &&
      attempt.endsAt &&
      new Date() > new Date(attempt.endsAt)
    ) {
      const submittedAttempt = await finalizeAndSubmitAttempt(attempt, 'AUTO');
      return res.json({
        success: true,
        message: 'Time over. Test auto submitted',
        score: submittedAttempt.score,
      });
    }

    // Accept two formats (new / legacy)
    const { mcqId, optionId, selectedOption } = req.body;

    // fetch the MCQ if mcqId provided or if using sequential flow we will derive MCQ from test mcqs
    let mcqDoc = null;
    let mcqObjectId = null;
    let chosenOption = null;

    if (mcqId) {
      if (!isValidId(mcqId))
        return res.status(400).json({ message: 'Invalid mcq id' });
      mcqObjectId = mcqId;
      mcqDoc = await MCQ.findById(mcqObjectId).lean();
      if (!mcqDoc) return res.status(404).json({ message: 'MCQ not found' });
      if (typeof optionId === 'undefined') {
        return res
          .status(400)
          .json({ message: 'optionId is required when mcqId is supplied' });
      }
      chosenOption = Number(optionId);
    } else if (typeof selectedOption !== 'undefined') {
      // legacy sequential approach
      const mcqs = await MCQ.find({
        _id: { $in: test.mcqs },
        status: 'active',
      }).lean();
      const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));
      const orderedMcqs = (test.mcqs || [])
        .map((id) => mcqMap.get(id.toString()))
        .filter(Boolean);
      const mcq = orderedMcqs[attempt.currentIndex];
      if (!mcq)
        return res
          .status(400)
          .json({ message: 'No question found at current index' });
      mcqObjectId = mcq._id;
      mcqDoc = mcq;
      chosenOption = Number(selectedOption);
    } else {
      return res
        .status(400)
        .json({ message: 'Missing mcqId+optionId or selectedOption' });
    }

    // Validate chosenOption index numeric and within options length
    if (!Number.isFinite(chosenOption) || chosenOption < 0) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    if (
      !Array.isArray(mcqDoc.options) ||
      chosenOption > mcqDoc.options.length - 1
    ) {
      return res.status(400).json({ message: 'Option index out of range' });
    }

    const isCorrect = Number(mcqDoc.correctAnswer) === chosenOption;

    // Overwrite existing answer for this mcq if present
    const existingIndex = (attempt.answers || []).findIndex(
      (a) => a.mcqId?.toString() === mcqObjectId.toString()
    );

    if (existingIndex !== -1) {
      attempt.answers[existingIndex].selectedOption = chosenOption;
      attempt.answers[existingIndex].isCorrect = isCorrect;
    } else {
      attempt.answers.push({
        mcqId: mcqObjectId,
        selectedOption: chosenOption,
        isCorrect,
      });
      // If using legacy sequential path, advance currentIndex
      if (!mcqId && typeof selectedOption !== 'undefined') {
        attempt.currentIndex = (attempt.currentIndex || 0) + 1;
      }
    }

    await attempt.save();

    return res.json({ success: true, isCorrect });
  } catch (err) {
    console.error('submitAnswer error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * USER – SUBMIT TEST (MANUAL)
 * POST /api/tests/attempt/:attemptId/submit
 *
 * Calculates correct/wrong/notAttempt and percentage. Marks attempt submitted (MANUAL).
 * If already submitted -> 400.
 */
export const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!(await enforceSubscription(req.user._id, res))) return;
    if (!isValidId(attemptId))
      return res.status(400).json({ message: 'Invalid attempt id' });

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
    });

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    if (attempt.submittedAt)
      return res.status(400).json({ message: 'Test already submitted' });

    // finalize based on test MCQs
    const finalAttempt = await finalizeAndSubmitAttempt(attempt, 'MANUAL');

    const test = await Test.findById(attempt.testId).lean();

    let totalQuestions = 0;

    if (test && Array.isArray(test.mcqs) && test.mcqs.length) {
      totalQuestions = test.mcqs.length;
    } else {
      // 🔥 fallback: MCQ collection se count lo
      totalQuestions = await MCQ.countDocuments({
        testId: attempt.testId,
        status: 'active',
      });
    }

    // Recompute stats
    let correctAnswer = 0;
    let wrongAnswer = 0;
    let notAttempt = 0;

    const answersMap = new Map(
      (finalAttempt.answers || []).map((a) => [a.mcqId?.toString(), a])
    );

    if (test && Array.isArray(test.mcqs) && test.mcqs.length) {
      // load MCQs to ensure correctness
      const mcqs = await MCQ.find({ _id: { $in: test.mcqs } }).lean();
      const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

      for (const mcqId of test.mcqs) {
        const qid = mcqId.toString();
        const ans = answersMap.get(qid);
        if (!ans) {
          notAttempt++;
        } else {
          const mcqDoc = mcqMap.get(qid);
          if (mcqDoc) {
            if (Number(ans.selectedOption) === Number(mcqDoc.correctAnswer))
              correctAnswer++;
            else wrongAnswer++;
          } else {
            // if MCQ missing, use stored isCorrect flag
            if (ans.isCorrect) correctAnswer++;
            else wrongAnswer++;
          }
        }
      }
    } else {
      // 🔥 fallback: derive counts from attempt.answers
      correctAnswer = (finalAttempt.answers || []).filter(
        (a) => a.isCorrect === true
      ).length;

      wrongAnswer = (finalAttempt.answers || []).filter(
        (a) => a.isCorrect === false
      ).length;

      notAttempt = Math.max(0, totalQuestions - (correctAnswer + wrongAnswer));
    }

    const solvedMcq = correctAnswer + wrongAnswer;
    const percentage =
      totalQuestions > 0
        ? ((correctAnswer / totalQuestions) * 100).toFixed(2)
        : '0.00';

    return res.json({
      success: true,
      solvedMcq,
      correctAnswer,
      wrongAnswer,
      notAttempt,
      percentage,
      score: finalAttempt.score,
    });
  } catch (err) {
    console.error('submitTest error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * USER – GET TEST RESULT
 * GET /api/tests/test-result/:userId/:testId
 */
export const getTestResult = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    if (!(await enforceSubscription(userId, res))) return;

    if (!isValidId(userId) || !isValidId(testId)) {
      return res.status(400).json({ message: 'Invalid id(s)' });
    }

    const attempt = await TestAttempt.findOne({ userId, testId }).lean();
    if (!attempt)
      return res.status(404).json({ message: 'Test attempt not found' });

    const test = await Test.findById(testId).lean();
    const totalQuestions = (test?.mcqs || []).length || 0;

    // use MCQ docs to determine correct/wrong/notAttempt for accuracy
    const mcqs = totalQuestions
      ? await MCQ.find({ _id: { $in: test.mcqs } }).lean()
      : [];
    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

    const answersMap = new Map(
      (attempt.answers || []).map((a) => [a.mcqId?.toString(), a])
    );

    let correct = 0;
    let wrong = 0;
    let notAttempted = 0;

    if (totalQuestions) {
      for (const mcqId of test.mcqs) {
        const qid = mcqId.toString();
        const ans = answersMap.get(qid);
        if (!ans) {
          notAttempted++;
        } else {
          const mcqDoc = mcqMap.get(qid);
          if (mcqDoc) {
            if (Number(ans.selectedOption) === Number(mcqDoc.correctAnswer))
              correct++;
            else wrong++;
          } else {
            // fallback to stored isCorrect
            if (ans.isCorrect) correct++;
            else wrong++;
          }
        }
      }
    } else {
      // fallback: count from attempt.answers
      correct = (attempt.answers || []).filter(
        (a) => a.isCorrect === true
      ).length;
      wrong = (attempt.answers || []).filter(
        (a) => a.isCorrect === false
      ).length;
      notAttempted = Math.max(
        0,
        (attempt.answers || []).length - (correct + wrong)
      );
    }

    const performance =
      totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    return res.status(200).json({
      totalQuestions,
      correct,
      wrong,
      notAttempted,
      performance,
      score: attempt.score ?? 0,
    });
  } catch (error) {
    console.error('getTestResult error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * USER – GET TEST REVIEW
 * GET /api/tests/test-review/:userId/:testId
 *
 * Returns full test review (questions from test.mcqs), selectedOption if any, correctAnswer and status.
 */
export const getTestReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testId } = req.params;

    if (!(await enforceSubscription(userId, res))) return;

    if (!isValidId(userId) || !isValidId(testId)) {
      return res.status(400).json({ message: 'Invalid id(s)' });
    }

    const attempt = await TestAttempt.findOne({ userId, testId }).lean();
    if (!attempt)
      return res.status(404).json({ message: 'Test attempt not found' });

    const test = await Test.findById(testId).lean();
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const mcqs = await MCQ.find({ _id: { $in: test.mcqs } }).lean();
    const mcqMap = new Map(mcqs.map((m) => [m._id.toString(), m]));

    // Build ordered review list according to test.mcqs
    const answersMap = new Map(
      (attempt.answers || []).map((a) => [a.mcqId?.toString(), a])
    );

    const review = (test.mcqs || []).map((mcqId) => {
      const qid = mcqId.toString();
      const mcq = mcqMap.get(qid);
      if (!mcq) {
        return {
          mcqId: qid,
          question: { text: '', images: [] },
          options: [],
          selectedOption: null,
          correctAnswer: null,
          status: 'Not Found',
        };
      }

      const ans = answersMap.get(qid);
      const selectedOption = ans ? ans.selectedOption : null;
      const correctAnswer = mcq.correctAnswer;

      let status = 'Not Attempted';
      if (selectedOption !== null && typeof selectedOption !== 'undefined') {
        status =
          Number(selectedOption) === Number(correctAnswer)
            ? 'Correct'
            : 'Wrong';
      }

      return {
        mcqId: mcq._id,
        question: mcq.question || { text: '', images: [] },
        options: mcq.options || [],
        selectedOption: selectedOption !== undefined ? selectedOption : null,
        correctAnswer,
        status,
      };
    });

    return res.status(200).json({
      testId,
      totalQuestions: review.length,
      review,
    });
  } catch (error) {
    console.error('getTestReview error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAttemptAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!(await enforceSubscription(req.user._id, res))) return;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attempt id',
      });
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
    }).lean();
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    return res.json({
      success: true,
      attemptId: attempt._id,
      submittedAt: attempt.submittedAt || null,
      answers: (attempt.answers || []).map((a) => ({
        mcqId: a.mcqId,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
    });
  } catch (err) {
    console.error('getAttemptAnswers error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt answers',
    });
  }
};

export const submitQTestByChapter = async (req, res) => {
  try {
    const { qtestId, chapterId, answers } = req.body;
    const userId = req.user._id;

    if (!(await enforceSubscription(userId, res))) return;

    // 1️⃣ Validation
    if (!qtestId || !chapterId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'qtestId, chapterId and answers array are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(qtestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid qtestId',
      });
    }

    // 2️⃣ Validate Q-Test Exists
    const qtest = await Test.findOne({
      _id: qtestId,
      status: 'active',
      testMode: 'regular',
    }).lean();

    if (!qtest) {
      return res.status(404).json({
        success: false,
        message: 'Q-Test not found or inactive',
      });
    }

    // 3️⃣ Fetch MCQs ONLY of that Q-Test + chapter
    const mcqs = await MCQ.find({
      testId: qtestId,   // 🔥 DB field still testId hi rahega
      chapterId,
      status: 'active',
    }).select('_id correctAnswer');

    if (mcqs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No MCQs found for this Q-Test & chapter',
      });
    }

    // 4️⃣ Calculate Result
    let correct = 0;
    let incorrect = 0;
    let notAttempted = 0;

    mcqs.forEach((mcq) => {
      const userAnswer = answers.find(
        (a) => a.mcqId === mcq._id.toString()
      );

      if (
        !userAnswer ||
        userAnswer.selectedIndex === null ||
        userAnswer.selectedIndex === undefined
      ) {
        notAttempted++;
      } else if (
        Number(userAnswer.selectedIndex) === Number(mcq.correctAnswer)
      ) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const total = mcqs.length;
    const percentage = ((correct / total) * 100).toFixed(2);

    // 5️⃣ Save Attempt
    await TestAttempt.create({
      userId,
      testId: qtestId,  // 🔥 DB me field name same rehne do
      chapterId,
      mode: 'regular',
      answers,
      score: correct,
      submittedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Q-Test submitted successfully',
      result: {
        totalQuestions: total,
        correct,
        incorrect,
        notAttempted,
        scorePercentage: percentage,
      },
    });
  } catch (error) {
    console.error('submitQTestByChapter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit Q-Test',
    });
  }
};


/**
 * @desc   Get Q-Tests by Chapter (User Side)
 * @route  GET /api/user/tests/qtest/:chapterId
 */
export const getQTestsByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user._id; // 👈 important
    if (!(await enforceSubscription(userId, res))) return;
    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: 'Chapter ID is required',
      });
    }

    // 1️⃣ Get all regular active tests
    const tests = await Test.find({
      testMode: 'regular',
      status: 'active',
    })
      .select('_id testTitle month academicYear mcqLimit')
      .lean();

    if (!tests.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const finalData = [];

    for (const test of tests) {
      // 2️⃣ Check MCQ count for this chapter
      const count = await MCQ.countDocuments({
        testId: test._id,
        chapterId,
        testMode: 'regular',
        status: 'active',
      });

      if (count > 0) {
        // 3️⃣ Find user's attempt for this test + chapter
        const attempt = await TestAttempt.findOne({
          userId,
          testId: test._id,
          chapterId,
          mode: 'regular',
        }).lean();

        let status = 'NOT_STARTED';

        if (attempt) {
          status = attempt.submittedAt ? 'COMPLETED' : 'IN_PROGRESS';
        }

        finalData.push({
          ...test,
          totalQuestions: count,
          status, // 👈 NEW FIELD
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData,
    });
  } catch (error) {
    console.error('Get QTests By Chapter Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Q-Tests',
    });
  }
};

export const getMcqsByTestId = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user._id;

    // 🔐 subscription check
    if (!(await enforceSubscription(userId, res))) return;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test id',
      });
    }

    // Check test exists
    const test = await Test.findOne({
      _id: testId,
      status: 'active',
    }).lean();

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Fetch MCQs
    const mcqs = await MCQ.find({
      testId: test._id,
      status: 'active',
    })
      .populate('tagId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      testId: test._id,
      testTitle: test.testTitle,
      totalQuestions: mcqs.length,
      data: mcqs,
    });
  } catch (error) {
    console.error('getMcqsByTestId error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch MCQs',
    });
  }
};
