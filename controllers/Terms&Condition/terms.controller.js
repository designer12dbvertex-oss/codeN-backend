import { TermsConditions } from "../../models/TermsModel/terms.model.js";

export const addTerms = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(200).json({ message: "Content required", status: false });

  try {
    let data = await TermsConditions.findOne();
    if (data) {
      data.content = content;
      await data.save();
      return res.status(200).json({ message: "Terms updated!", status: true, data });
    } else {
      data = await TermsConditions.create({ content });
      return res.status(201).json({ message: "Terms created!", status: true, data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};

export const getTerms = async (req, res) => {
  try {
    const data = await TermsConditions.findOne();
    res.status(200).json({ status: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};