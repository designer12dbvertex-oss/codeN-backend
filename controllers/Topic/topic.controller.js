import Topic from '../../models/Topic/topic.model.js';

export const createTopic = async (req, res) => {
    console.log("Body Received:", req.body); // Check karein topicId yahan hai ya nahi
  console.log("Topic ID:", req.body.topicId);
  try {
    const topic = await Topic.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json({ success: true, data: topic });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

export const getTopicsByChapter = async (req, res) => {
  try {
    const topics = await Topic.find({ chapterId: req.params.chapterId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: topics });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

export const getAllTopics = async (req, res) => {
  try {
    // Sabse pehle find karo, phir populate karo
    const topics = await Topic.find()
      .populate({
        path: 'chapterId',
        select: 'name subSubjectId', // Chapter ka naam aur subSubjectId uthao
        populate: {
          path: 'subSubjectId',
          select: 'name' // Sub-Subject ka naam uthao
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};