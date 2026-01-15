import { PrivacyPolicy } from "../../models/PrivacyPolicy/privacypolicy.model.js";

// Add or Update Privacy Policy
export const addPrivacyPolicy = async (req, res) => {
  const { content } = req.body;
  try {
    let data = await PrivacyPolicy.findOne();
    if (data) {
      data.content = content;
      await data.save();
      return res.status(200).json({ status: true, message: "Privacy Policy updated!", data });
    } else {
      data = await PrivacyPolicy.create({ content });
      return res.status(201).json({ status: true, message: "Privacy Policy created!", data });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get Privacy Policy
export const getPrivacyPolicy = async (req, res) => {
  try {
    const data = await PrivacyPolicy.findOne();
    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};