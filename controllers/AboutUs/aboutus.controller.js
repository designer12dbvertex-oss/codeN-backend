import { AboutUs } from "../../models/AboutUs/about.model.js";
// Add or Edit About Us
export const addAboutUs = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(200).json({
      message: "Please provide content for About Us.",
      status: false,
    });
  }

  try {
    // Check if an "About Us" document already exists
    let aboutUs = await AboutUs.findOne();

    if (aboutUs) {
      // If it exists, update (Edit logic)
      aboutUs.content = content;
      await aboutUs.save();
      return res.status(200).json({ 
        message: "About Us updated successfully", 
        content: aboutUs.content, 
        status: true 
      });
    } else {
      // If it doesn't exist, create new (Add logic)
      aboutUs = await AboutUs.create({ content });
      return res.status(201).json({ 
        message: "About Us added successfully", 
        content: aboutUs.content, 
        status: true 
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
      status: false,
    });
  }
};

// Get About Us
export const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      return res.status(404).json({ message: "About Us not found", status: false });
    }
    res.status(200).json({ content: aboutUs.content, status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};