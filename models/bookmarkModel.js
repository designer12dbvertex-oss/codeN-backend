import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["mcq", "chapter", "sub-subject"],
      required: true,
    },

    mcqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MCQ",
      default: null,
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },

    subSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubject",
      default: null,
    },
  },
  { timestamps: true }
);

// duplicate bookmark prevent karne ke liye
bookmarkSchema.index(
  {
    userId: 1,
    type: 1,
    mcqId: 1,
    chapterId: 1,
    subSubjectId: 1,
  },
  { unique: true }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;
