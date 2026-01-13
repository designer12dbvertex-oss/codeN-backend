import College from '../models/college.model.js';
import Country from '../models/country.model.js';
import State from '../models/state.model.js';
import City from '../models/city.model.js';

export const addCollege = async (req, res, next) => {
  try {
    const { name, countryId, stateId, cityId } = req.body;
    if (!name || !countryId || !stateId || !cityId)
      return res
        .status(400)
        .json({
          success: false,
          message: 'name, countryId, stateId and cityId required',
        });

    const country = await Country.findById(countryId);
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });

    const state = await State.findById(stateId);
    if (!state)
      return res
        .status(404)
        .json({ success: false, message: 'State not found' });

    if (String(state.countryId) !== String(countryId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'State does not belong to the provided country',
        });
    }

    const city = await City.findById(cityId);
    if (!city)
      return res
        .status(404)
        .json({ success: false, message: 'City not found' });

    if (
      String(city.stateId) !== String(stateId) ||
      String(city.countryId) !== String(countryId)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'City is not consistent with provided state/country',
        });
    }

    const college = await College.create({ name, countryId, stateId, cityId });
    res.status(201).json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const getColleges = async (req, res, next) => {
  try {
    const { search, countryId, stateId, cityId } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (countryId) filter.countryId = countryId;
    if (stateId) filter.stateId = stateId;
    if (cityId) filter.cityId = cityId;

    const colleges = await College.find(filter)
      .populate('countryId', 'name')
      .populate('stateId', 'name')
      .populate('cityId', 'name')
      .sort({ name: 1 });

    res
      .status(200)
      .json({ success: true, count: colleges.length, data: colleges });
  } catch (error) {
    next(error);
  }
};

export const getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id)
      .populate('countryId', 'name')
      .populate('stateId', 'name')
      .populate('cityId', 'name');
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: 'College not found' });
    res.status(200).json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.countryId || updates.stateId || updates.cityId) {
      const country = updates.countryId
        ? await Country.findById(updates.countryId)
        : null;
      const state = updates.stateId
        ? await State.findById(updates.stateId)
        : null;
      const city = updates.cityId ? await City.findById(updates.cityId) : null;

      if (updates.countryId && !country)
        return res
          .status(404)
          .json({ success: false, message: 'Country not found' });
      if (updates.stateId && !state)
        return res
          .status(404)
          .json({ success: false, message: 'State not found' });
      if (updates.cityId && !city)
        return res
          .status(404)
          .json({ success: false, message: 'City not found' });

      if (
        state &&
        updates.countryId &&
        String(state.countryId) !== String(updates.countryId)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'State does not belong to the provided country',
          });
      }
      if (city && state && String(city.stateId) !== String(state._id)) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'City does not belong to the provided state',
          });
      }
    }

    const college = await College.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('countryId', 'name')
      .populate('stateId', 'name')
      .populate('cityId', 'name');

    if (!college)
      return res
        .status(404)
        .json({ success: false, message: 'College not found' });
    res.status(200).json({ success: true, data: college });
  } catch (error) {
    next(error);
  }
};

export const deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const college = await College.findByIdAndDelete(id);
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: 'College not found' });
    res.status(200).json({ success: true, message: 'College deleted' });
  } catch (error) {
    next(error);
  }
};
