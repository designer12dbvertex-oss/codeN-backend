// import City from '../../models/admin/city.model.js';
// import State from '../../models/admin/state.model.js';
// import Country from '../../models/admin/country.model.js';

// export const addCity = async (req, res, next) => {
//   try {
//     const { name, stateId, countryId } = req.body;
//     if (!name || !stateId || !countryId)
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'name, stateId and countryId required',
//         });

//     const state = await State.findById(stateId);
//     if (!state)
//       return res
//         .status(404)
//         .json({ success: false, message: 'State not found' });

//     const country = await Country.findById(countryId);
//     if (!country)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Country not found' });

//     if (String(state.countryId) !== String(countryId)) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'State does not belong to the provided country',
//         });
//     }

//     const city = await City.create({ name, stateId, countryId });
//     res.status(201).json({ success: true, data: city });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getCities = async (req, res, next) => {
//   try {
//     const { search, stateId, countryId } = req.query;
//     const filter = {};
//     if (search) filter.name = { $regex: search, $options: 'i' };
//     if (stateId) filter.stateId = stateId;
//     if (countryId) filter.countryId = countryId;

//     const cities = await City.find(filter)
//       .populate('stateId', 'name')
//       .populate('countryId', 'name')
//       .sort({ name: 1 });
//     res.status(200).json({ success: true, count: cities.length, data: cities });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getCityById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const city = await City.findById(id)
//       .populate('stateId', 'name')
//       .populate('countryId', 'name');
//     if (!city)
//       return res
//         .status(404)
//         .json({ success: false, message: 'City not found' });
//     res.status(200).json({ success: true, data: city });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateCity = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     if (updates.stateId && updates.countryId) {
//       const state = await State.findById(updates.stateId);
//       if (!state)
//         return res
//           .status(404)
//           .json({ success: false, message: 'State not found' });
//       if (String(state.countryId) !== String(updates.countryId)) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: 'State does not belong to the provided country',
//           });
//       }
//     }

//     const city = await City.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     })
//       .populate('stateId', 'name')
//       .populate('countryId', 'name');
//     if (!city)
//       return res
//         .status(404)
//         .json({ success: false, message: 'City not found' });
//     res.status(200).json({ success: true, data: city });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteCity = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const city = await City.findByIdAndDelete(id);
//     if (!city)
//       return res
//         .status(404)
//         .json({ success: false, message: 'City not found' });
//     res.status(200).json({ success: true, message: 'City deleted' });
//   } catch (error) {
//     next(error);
//   }
// };
import City from '../../models/admin/city.model.js';
import State from '../../models/admin/state.model.js';

// 1. CREATE: Add a new city
export const addCity = async (req, res, next) => {
  try {
    const { name, stateId } = req.body;

    if (!name || !stateId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (name and stateId) are required.' 
      });
    }

    // Check if the selected State is active
    const state = await State.findOne({ _id: stateId, isActive: true });
    if (!state) {
      return res.status(400).json({ 
        success: false, 
        message: 'Selected State is either inactive or does not exist.' 
      });
    }

    // Check if the city already exists in this specific state
    const existingCity = await City.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, 
      stateId 
    });

    if (existingCity) {
      return res.status(400).json({ 
        success: false, 
        message: 'This city already exists in the selected state.' 
      });
    }

    // Create city (Removed countryId reference)
    const city = await City.create({ 
      name: name.trim().toLowerCase(), 
      stateId 
    });

    res.status(201).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

// 2. READ: Get all cities (with optional filtering)
export const getCities = async (req, res, next) => {
  try {
    const { search, stateId } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: 'i' };
    if (stateId) filter.stateId = stateId;

    const cities = await City.find(filter)
      .populate('stateId', 'name isActive')
      .sort({ name: 1 });

    res.status(200).json({ 
      success: true, 
      count: cities.length, 
      data: cities 
    });
  } catch (error) {
    next(error);
  }
};

// 3. READ: Get single city by ID
export const getCityById = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id)
      .populate('stateId', 'name isActive');

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }
    res.status(200).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE: Update city details
export const updateCity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, stateId } = req.body;

    // Validation: If state is being changed, check if new state is active
    if (stateId) {
      const state = await State.findOne({ _id: stateId, isActive: true });
      if (!state) {
        return res.status(400).json({ 
          success: false, 
          message: 'The new state selected is not active.' 
        });
      }
    }

    const city = await City.findByIdAndUpdate(
      id, 
      { name: name?.trim().toLowerCase(), stateId }, 
      { new: true, runValidators: true }
    ).populate('stateId', 'name');

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    res.status(200).json({ success: true, data: city });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE: Remove a city
export const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    res.status(200).json({ success: true, message: 'City deleted successfully.' });
  } catch (error) {
    next(error);
  }
};