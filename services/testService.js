import Test from '../models/admin/Test/testModel.js';
import Question from '../models/admin/MCQs/mcq.model.js';
import Subject from '../models/admin/Subject/subject.model.js';
import SubSubject from '../models/admin/Sub-subject/subSubject.model.js';
import Topic from '../models/admin/Topic/topic.model.js';
import Chapter from '../models/admin/Chapter/chapter.model.js';
import Course from '../models/admin/Course/course.model.js';

/**
 * Fetch questions for Grand Test
 * - Gets ALL active questions from course
 */
export const getGrandTestQuestions = async (courseId, mcqLimit) => {
  try {
    // Find all questions with status active
    const questions = await Question.find({
      status: 'active',
    }).lean();

    if (questions.length === 0) {
      throw new Error('No questions found in the system');
    }

    if (questions.length < mcqLimit) {
      throw new Error(
        `Insufficient questions. Found: ${questions.length}, Required: ${mcqLimit}`
      );
    }

    // Randomize questions
    const shuffled = questions.sort(() => 0.5 - Math.random());

    // Return first mcqLimit questions
    return shuffled.slice(0, mcqLimit);
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch questions for Subject Test
 * - Gets questions based on selected filters
 */
export const getSubjectTestQuestions = async (filters, mcqLimit) => {
  try {
    const {
      subjects = [],
      subSubjects = [],
      topics = [],
      chapters = [],
    } = filters;

    // Build MongoDB query
    let query = {
      status: 'active',
    };

    if (subjects.length > 0) {
      query.subjectId = { $in: subjects };
    }

    if (subSubjects.length > 0) {
      query.subSubjectId = { $in: subSubjects };
    }

    if (topics.length > 0) {
      query.topicId = { $in: topics };
    }

    if (chapters.length > 0) {
      query.chapterId = { $in: chapters };
    }

    // Fetch questions matching filters
    const questions = await Question.find(query).lean();

    if (questions.length === 0) {
      throw new Error(
        'No questions found for the selected filters. Please adjust your selection.'
      );
    }

    if (questions.length < mcqLimit) {
      throw new Error(
        `Insufficient questions. Found: ${questions.length}, Required: ${mcqLimit}`
      );
    }

    // Randomize questions
    const shuffled = questions.sort(() => 0.5 - Math.random());

    // Return first mcqLimit questions
    return shuffled.slice(0, mcqLimit);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all filters available for a course
 */
export const getCourseFilters = async (courseId) => {
  try {
    // Get all subjects for course
    const subjects = await Subject.find({
      courseId: courseId,
      status: 'active',
    }).select('_id name');

    const subjectIds = subjects.map((s) => s._id);

    // Get all sub-subjects for these subjects
    const subSubjects = await SubSubject.find({
      subjectId: { $in: subjectIds },
      status: 'active',
    }).select('_id name');

    const subSubjectIds = subSubjects.map((ss) => ss._id);

    // Get all topics for these sub-subjects
    const topics = await Topic.find({
      subSubjectId: { $in: subSubjectIds },
      status: 'active',
    }).select('_id name');

    const topicIds = topics.map((t) => t._id);

    // Get all chapters for these topics
    const chapters = await Chapter.find({
      topicId: { $in: topicIds },
      status: 'active',
    }).select('_id name');

    return {
      subjects,
      subSubjects,
      topics,
      chapters,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validate Subject Test filters
 */
export const validateSubjectTestFilters = (filters) => {
  const { subjects = [], subSubjects = [], topics = [], chapters = [] } =
    filters;

  const hasAtLeastOneFilter =
    subjects.length > 0 ||
    subSubjects.length > 0 ||
    topics.length > 0 ||
    chapters.length > 0;

  if (!hasAtLeastOneFilter) {
    throw new Error(
      'At least one filter (Subject/SubSubject/Topic/Chapter) must be selected'
    );
  }

  return true;
};

/**
 * Count questions for preview
 */
export const countAvailableQuestions = async (filters, testCategory) => {
  try {
    if (testCategory === 'grand') {
      const count = await Question.countDocuments({
        status: 'active',
      });
      return count;
    }

    if (testCategory === 'subject') {
      validateSubjectTestFilters(filters);

      const { subjects = [], subSubjects = [], topics = [], chapters = [] } =
        filters;

      let query = {
        status: 'active',
      };

      if (subjects.length > 0) {
        query.subjectId = { $in: subjects };
      }

      if (subSubjects.length > 0) {
        query.subSubjectId = { $in: subSubjects };
      }

      if (topics.length > 0) {
        query.topicId = { $in: topics };
      }

      if (chapters.length > 0) {
        query.chapterId = { $in: chapters };
      }

      const count = await Question.countDocuments(query);
      return count;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Format test response for API
 */
export const formatTestResponse = (test) => {
  return {
    _id: test._id,
    testTitle: test.testTitle,
    month: test.month,
    academicYear: test.academicYear,
    category: test.category,
    testMode: test.testMode,
    courseId: test.courseId || null,
    subjects: test.subjects,
    subSubjects: test.subSubjects,
    topics: test.topics,
    chapters: test.chapters,
    mcqLimit: test.mcqLimit,
    timeLimit: test.timeLimit || null,
    totalQuestions: test.questions?.length || 0,
    status: test.status,
    description: test.description,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  };
};

/**
 * Format test with questions for attempt
 */
export const formatTestForAttempt = (test) => {
  return {
    _id: test._id,
    testTitle: test.testTitle,
    category: test.category,
    testMode: test.testMode,
    timeLimit: test.timeLimit || null,
    totalQuestions: test.questions?.length || 0,
    questions: test.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      questionImage: q.questionImage || null,
      options: q.options.map((opt) => ({
        text: opt.text,
        optionImage: opt.optionImage || null,
        // Don't send isCorrect to frontend during attempt
      })),
      explanation: q.explanation,
    })),
  };
};

export default {
  getGrandTestQuestions,
  getSubjectTestQuestions,
  getCourseFilters,
  validateSubjectTestFilters,
  countAvailableQuestions,
  formatTestResponse,
  formatTestForAttempt,
};
