import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from "fs";
// import Faculty from '../../../models/admin/faculty/faculty.model'
import Faculty from '../../../models/admin/faculty/faculty.model.js';
import Chapter from '../../../models/admin/Chapter/chapter.model.js';
import Topic from '../../../models/admin/Topic/topic.model.js';

 // .js lagana zaroori hai

const router = express.Router();

// --- Multer Setup (Image Storage) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---

// 1. POST: Naya Faculty add karne ke liye
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, degree, description } = req.body;
        const imagePath = req.file ? req.file.filename : "";

        const newFaculty = new Faculty({
            name,
            degree,
            description,
            image: imagePath
        });

        await newFaculty.save();
        res.status(201).json({ message: "Faculty added successfully!", data: newFaculty });
    } catch (error) {
        res.status(500).json({ message: "Error adding faculty", error: error.message });
    }
});

// 2. GET: Saare Faculty ki list mangwane ke liye
router.get('/list', async (req, res) => {
    try {
        const list = await Faculty.find();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error: error.message });
    }
});

router.put('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, degree, description } = req.body;
        
        // Purana data find karein
        let faculty = await Faculty.findById(id);
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        let imagePath = faculty.image;

        // Agar nayi image upload hui hai
        if (req.file) {
            // Purani image file delete karein agar exist karti hai
            if (faculty.image) {
                const oldPath = path.join('uploads/', faculty.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = req.file.filename;
        }

        const updatedData = {
            name,
            degree,
            description,
            image: imagePath
        };

        const updatedFaculty = await Faculty.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ success: true, message: "Faculty updated successfully!", data: updatedFaculty });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating faculty", error: error.message });
    }
});

// 4. DELETE: Delete Faculty
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await Faculty.findById(id);

        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        // Server se image file delete karein
        if (faculty.image) {
            const imagePath = path.join('uploads/', faculty.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Faculty.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Faculty deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting faculty", error: error.message });
    }
});


router.get('/sub-subject/:subSubjectId', async (req, res) => {
  try {
    const { subSubjectId } = req.params;

    // Chapters dhoondo jo us Sub-Subject se jude hain
    const chapters = await Chapter.find({ 
      subSubjectId: subSubjectId,
      status: 'active' // Sirf active chapters dikhane ke liye
    })
    .sort({ order: 1 }) // Order ke hisaab se sort
    .populate('subSubjectId', 'name') // Sub-Subject ka sirf naam bhi saath ayega
    .populate('courseId', 'name'); // Course ka naam bhi ayega

    if (!chapters || chapters.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chapters found for this sub-subject"
      });
    }

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});


router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Topics dhoondo jo us Chapter se jude hain
    const topics = await Topic.find({ 
      chapterId: chapterId,
      status: 'active' 
    })
    .sort({ order: 1 })
    .populate('chapterId', 'name'); // Chapter ka naam dikhane ke liye

    if (!topics || topics.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No topics found for this chapter"
      });
    }

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});


export default router;