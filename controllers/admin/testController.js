import Test from '../../models/testModel.js';
import MCQ from '../../models/MCQs/mcq.model.js';

export const createTest = async (req, res) => {
  try {
    const {
      courseId,
      subjectId,
      subSubjectId,
      chapterId,
      scopeType,
      testType,
      totalQuestions,
    } = req.body;

    let filter = {};

    if (scopeType === 'chapter') filter.chapterId = chapterId;
    if (scopeType === 'sub-subject') filter.subSubjectId = subSubjectId;
    if (scopeType === 'subject') filter.subjectId = subjectId;

    const count = await MCQ.countDocuments(filter);
    if (count < totalQuestions) {
      return res.status(400).json({ message: 'Not enough MCQs' });
    }

    const duration = testType === 'exam' ? totalQuestions : null;

    const test = await Test.create({
      courseId,
      subjectId,
      subSubjectId,
      chapterId,
      scopeType,
      testType,
      totalQuestions,
      duration,
    });

    res.status(201).json({ success: true, test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const publishTest = async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { isPublished: true },
    { new: true }
  );
  res.json({ success: true, test });
};
