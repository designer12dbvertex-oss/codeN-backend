import Test from '../../models/testModel.js';
import TestAttempt from '../../models/testAttemptModel.js';
import MCQ from '../../models/MCQs/mcq.model.js';

export const getAvailableTests = async (req, res) => {
  const tests = await Test.find({
    courseId: req.query.courseId,
    isPublished: true,
  });
  res.json(tests);
};

export const startTest = async (req, res) => {
  const test = await Test.findById(req.params.testId);
  if (!test || !test.isPublished) {
    return res.status(404).json({ message: 'Test not available' });
  }

  const attempt = await TestAttempt.create({
    userId: req.user._id,
    testId: test._id,
    startedAt: new Date(),
  });

  res.json({
    attemptId: attempt._id,
    testType: test.testType,
    perQuestionTime: test.perQuestionTime,
  });
};

export const getNextQuestion = async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId);
  const test = await Test.findById(attempt.testId);

  const mcqs = await MCQ.find({}).limit(test.totalQuestions);

  if (attempt.currentIndex >= mcqs.length) {
    return res.json({ message: 'Test completed' });
  }

  res.json({
    mcq: mcqs[attempt.currentIndex],
    time: test.testType === 'exam' ? test.perQuestionTime : null,
  });
};

export const submitAnswer = async (req, res) => {
  const { selectedOption } = req.body;
  const attempt = await TestAttempt.findById(req.params.attemptId);
  const test = await Test.findById(attempt.testId);

  const mcqs = await MCQ.find({}).limit(test.totalQuestions);
  const mcq = mcqs[attempt.currentIndex];

  const isCorrect = mcq.correctAnswer === selectedOption;

  attempt.answers.push({
    mcqId: mcq._id,
    selectedOption,
    isCorrect,
  });

  attempt.currentIndex += 1;
  await attempt.save();

  res.json({ isCorrect });
};

export const submitTest = async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId);
  const test = await Test.findById(attempt.testId);

  let score = 0;
  attempt.answers.forEach((a) => {
    score += a.isCorrect ? test.marksPerQuestion : -test.negativeMarks;
  });

  attempt.score = score;
  attempt.submittedAt = new Date();
  await attempt.save();

  res.json({ success: true, score });
};
