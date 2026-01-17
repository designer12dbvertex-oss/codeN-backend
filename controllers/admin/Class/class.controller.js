import ClassModel from '../../../models/admin/Class/class.model.js';

// CREATE
export const createClass = async (req, res) => {
  const { name, description } = req.body;

  const exists = await ClassModel.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: 'Class already exists' });
  }

  const newClass = await ClassModel.create({ name, description });

  res.status(201).json({
    success: true,
    data: newClass,
  });
};

// READ
export const getAllClasses = async (req, res) => {
  const classes = await ClassModel.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: classes,
  });
};

// UPDATE
export const updateClass = async (req, res) => {
  const updated = await ClassModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updated) {
    return res.status(404).json({ message: 'Class not found' });
  }

  res.json({ success: true, data: updated });
};

// DELETE
export const deleteClass = async (req, res) => {
  await ClassModel.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Class deleted successfully',
  });
};
