import Test from '../../models/testModel.js';
import TestAttempt from '../../models/testAttemptModel.js';
import MCQ from '../../models/MCQs/mcq.model.js';

/**
 * 🔥 AUTO SUBMIT HELPER
 * (logic kahi aur change nahi karta)
 */
const autoSubmitTest = async (attempt, test) => {
  if (attempt.submittedAt) return attempt;

  let score = 0;
  attempt.answers.forEach((a) => {
    score += a.isCorrect ? test.marksPerQuestion : -test.negativeMarks;
  });

  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();

  return attempt;
};

/**
 * USER – GET AVAILABLE TESTS
 */
export const getAvailableTests = async (req, res) => {
  try {
    const tests = await Test.find({
      courseId: req.query.courseId,
      isPublished: true,
    });

    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * USER – START TEST
 * exam mode → overall timer start
 * regular mode → no timer
 */
export const startTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);

    if (!test || !test.isPublished) {
      return res.status(404).json({ message: 'Test not available' });
    }

    let endsAt = null;

    // ✅ EXAM MODE → overall timer
    if (test.testType === 'exam') {
      endsAt = new Date(Date.now() + test.duration * 60 * 1000);
    }

    const attempt = await TestAttempt.create({
      userId: req.user._id,
      testId: test._id,
      startedAt: new Date(),
      endsAt,
    });

    res.json({
      success: true,
      attemptId: attempt._id,
      testType: test.testType,
      duration: test.duration,
      endsAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * USER – GET NEXT QUESTION
 */
export const getNextQuestion = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const test = await Test.findById(attempt.testId);

    // ⏱️ AUTO SUBMIT WHEN TIME OVER
    if (test.testType === 'exam' && new Date() > attempt.endsAt) {
      const submittedAttempt = await autoSubmitTest(attempt, test);

      return res.status(200).json({
        success: true,
        message: 'Time over. Test auto submitted',
        score: submittedAttempt.score,
      });
    }

    const mcqs = await MCQ.find({}).limit(test.totalQuestions);

    if (attempt.currentIndex >= mcqs.length) {
      const submittedAttempt = await autoSubmitTest(attempt, test);

      return res.json({
        success: true,
        message: 'Test completed',
        score: submittedAttempt.score,
      });
    }

    res.json({
      success: true,
      mcq: mcqs[attempt.currentIndex],
      timeLeft:
        test.testType === 'exam'
          ? Math.max(0, Math.floor((attempt.endsAt - Date.now()) / 1000))
          : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * USER – SUBMIT ANSWER
 */
export const submitAnswer = async (req, res) => {
  try {
    const { selectedOption } = req.body;

    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const test = await Test.findById(attempt.testId);

    // ⏱️ AUTO SUBMIT WHEN TIME OVER
    if (test.testType === 'exam' && new Date() > attempt.endsAt) {
      const submittedAttempt = await autoSubmitTest(attempt, test);

      return res.status(200).json({
        success: true,
        message: 'Time over. Test auto submitted',
        score: submittedAttempt.score,
      });
    }

    const mcqs = await MCQ.find({}).limit(test.totalQuestions);
    const mcq = mcqs[attempt.currentIndex];

    if (!mcq) {
      return res.status(400).json({ message: 'No question found' });
    }

    const isCorrect = mcq.correctAnswer === selectedOption;

    attempt.answers.push({
      mcqId: mcq._id,
      selectedOption,
      isCorrect,
    });

    attempt.currentIndex += 1;
    await attempt.save();

    res.json({ success: true, isCorrect });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * USER – SUBMIT TEST (MANUAL)
 */
export const submitTest = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({
        message: 'Test already submitted',
      });
    }

    const test = await Test.findById(attempt.testId);
    const submittedAttempt = await autoSubmitTest(attempt, test);

    res.json({
      success: true,
      score: submittedAttempt.score,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
