import City from '../models/city.model.js';
import State from '../models/state.model.js';
import Country from '../models/country.model.js';

export const addCity = async (req, res, next) => {
  try {
    const { name, stateId, countryId } = req.body;
    if (!name || !stateId || !countryId)
      return res
        .status(400)
        .json({
          success: false,
          message: 'name, stateId and countryId required',
        });

    const state = await State.findById(stateId);
    if (!state)
      return res
        .status(404)
        .json({ success: false, message: 'State not found' });

    const country = await Country.findById(countryId);
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });

    if (String(state.countryId) !== String(countryId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'State does not belong to the provided country',
        });
    }

    const city = await City.create({ name, stateId, countryId });
    res.status(201).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

export const getCities = async (req, res, next) => {
  try {
    const { search, stateId, countryId } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (stateId) filter.stateId = stateId;
    if (countryId) filter.countryId = countryId;

    const cities = await City.find(filter)
      .populate('stateId', 'name')
      .populate('countryId', 'name')
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: cities.length, data: cities });
  } catch (error) {
    next(error);
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id)
      .populate('stateId', 'name')
      .populate('countryId', 'name');
    if (!city)
      return res
        .status(404)
        .json({ success: false, message: 'City not found' });
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

export const updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.stateId && updates.countryId) {
      const state = await State.findById(updates.stateId);
      if (!state)
        return res
          .status(404)
          .json({ success: false, message: 'State not found' });
      if (String(state.countryId) !== String(updates.countryId)) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'State does not belong to the provided country',
          });
      }
    }

    const city = await City.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('stateId', 'name')
      .populate('countryId', 'name');
    if (!city)
      return res
        .status(404)
        .json({ success: false, message: 'City not found' });
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

export const deleteCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id);
    if (!city)
      return res
        .status(404)
        .json({ success: false, message: 'City not found' });
    res.status(200).json({ success: true, message: 'City deleted' });
  } catch (error) {
    next(error);
  }
};
