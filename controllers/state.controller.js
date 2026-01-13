import State from '../models/state.model.js';
import Country from '../models/country.model.js';

export const addState = async (req, res, next) => {
  try {
    const { name, countryId } = req.body;
    if (!name || !countryId)
      return res
        .status(400)
        .json({ success: false, message: 'Name and countryId required' });

    const country = await Country.findById(countryId);
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });

    const state = await State.create({ name, countryId });
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

export const getStates = async (req, res, next) => {
  try {
    const { search, countryId } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (countryId) filter.countryId = countryId;

    const states = await State.find(filter)
      .populate('countryId', 'name')
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: states.length, data: states });
  } catch (error) {
    next(error);
  }
};

export const getStateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const state = await State.findById(id).populate('countryId', 'name');
    if (!state)
      return res
        .status(404)
        .json({ success: false, message: 'State not found' });
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

export const updateState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.countryId) {
      const country = await Country.findById(updates.countryId);
      if (!country)
        return res
          .status(404)
          .json({ success: false, message: 'Country not found' });
    }
    const state = await State.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('countryId', 'name');
    if (!state)
      return res
        .status(404)
        .json({ success: false, message: 'State not found' });
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};

export const deleteState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const state = await State.findByIdAndDelete(id);
    if (!state)
      return res
        .status(404)
        .json({ success: false, message: 'State not found' });
    res.status(200).json({ success: true, message: 'State deleted' });
  } catch (error) {
    next(error);
  }
};
