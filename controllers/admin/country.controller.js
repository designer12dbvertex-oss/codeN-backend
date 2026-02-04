import Country from '../../models/admin/country.model.js';

export const addCountry = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });

    const country = await Country.create({ name });
    res.status(201).json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

export const getCountries = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const countries = await Country.find(filter).sort({ name: 1 });
    res
      .status(200)
      .json({ success: true, count: countries.length, data: countries });
  } catch (error) {
    next(error);
  }
};

export const getCountryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const country = await Country.findById(id);
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

export const updateCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const country = await Country.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });
    res.status(200).json({ success: true, data: country });
  } catch (error) {
    next(error);
  }
};

export const deleteCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const country = await Country.findByIdAndDelete(id);
    if (!country)
      return res
        .status(404)
        .json({ success: false, message: 'Country not found' });
    res.status(200).json({ success: true, message: 'Country deleted' });
  } catch (error) {
    next(error);
  }
};
