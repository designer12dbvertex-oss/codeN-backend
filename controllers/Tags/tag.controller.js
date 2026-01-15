import Tag from '../../models/Tag/tag.model.js';
import Chapter from '../../models/Chapter/chapter.model.js';

export const createTag = async (req, res, next) => {
  try {
    const { chapterId, name, description } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    const tag = await Tag.create({
      chapterId,
      name,
      description,
      createdBy: req.admin._id,
      updatedBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};


export const getTags = async (req, res, next) => {
  try {
    const { chapterId } = req.query;

    const filter = {};
    if (chapterId) filter.chapterId = chapterId;

    const tags = await Tag.find(filter)
      .populate('chapterId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};


export const updateTag = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    if (name) tag.name = name;
    if (description !== undefined) tag.description = description;
    if (status) tag.status = status;

    tag.updatedBy = req.admin._id;
    await tag.save();

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
