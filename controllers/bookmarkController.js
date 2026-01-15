import Bookmark from "../models/bookmarkModel.js";

/**
 * common validation helper
 */
const validateBookmark = ({ type, mcqId, chapterId, subSubjectId }) => {
  if (!type) return "type is required";

  if (type === "mcq" && !mcqId) return "mcqId is required";
  if (type === "chapter" && !chapterId) return "chapterId is required";
  if (type === "sub-subject" && !subSubjectId)
    return "subSubjectId is required";

  return null;
};

/**
 * @route   POST /api/bookmarks
 */
export const addBookmark = async (req, res) => {
  try {
    const error = validateBookmark(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      type: req.body.type,
      mcqId: req.body.type === "mcq" ? req.body.mcqId : null,
      chapterId: req.body.type === "chapter" ? req.body.chapterId : null,
      subSubjectId:
        req.body.type === "sub-subject" ? req.body.subSubjectId : null,
    });

    res.status(201).json({
      success: true,
      message: "Bookmark added",
      bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Already bookmarked" });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/bookmarks
 */
export const removeBookmark = async (req, res) => {
  try {
    const error = validateBookmark(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await Bookmark.findOneAndDelete({
      userId: req.user._id,
      type: req.body.type,
      mcqId: req.body.type === "mcq" ? req.body.mcqId : null,
      chapterId: req.body.type === "chapter" ? req.body.chapterId : null,
      subSubjectId:
        req.body.type === "sub-subject" ? req.body.subSubjectId : null,
    });

    res.json({ success: true, message: "Bookmark removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/bookmarks
 */
export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate("mcqId")
      .populate("chapterId")
      .populate("subSubjectId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/bookmarks/toggle
 */
export const toggleBookmark = async (req, res) => {
  try {
    const error = validateBookmark(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const query = {
      userId: req.user._id,
      type: req.body.type,
      mcqId: req.body.type === "mcq" ? req.body.mcqId : null,
      chapterId: req.body.type === "chapter" ? req.body.chapterId : null,
      subSubjectId:
        req.body.type === "sub-subject" ? req.body.subSubjectId : null,
    };

    const existing = await Bookmark.findOne(query);

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        message: "Bookmark removed",
        bookmarked: false,
      });
    }

    await Bookmark.create(query);
    res.json({
      success: true,
      message: "Bookmark added",
      bookmarked: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
