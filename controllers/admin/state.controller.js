// import State from '../../models/admin/state.model.js';
// import Country from '../../models/admin/country.model.js';

// export const addState = async (req, res, next) => {
//   try {
//     const { name, countryId } = req.body;
//     if (!name || !countryId)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Name and countryId required' });

//     const country = await Country.findById(countryId);
//     if (!country)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Country not found' });

//     const state = await State.create({ name, countryId });
//     res.status(201).json({ success: true, data: state });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getStates = async (req, res, next) => {
//   try {
//     const { search, countryId } = req.query;
//     const filter = {};
//     if (search) filter.name = { $regex: search, $options: 'i' };
//     if (countryId) filter.countryId = countryId;

//     const states = await State.find(filter)
//       .populate('countryId', 'name')
//       .sort({ name: 1 });
//     res.status(200).json({ success: true, count: states.length, data: states });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getStateById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const state = await State.findById(id).populate('countryId', 'name');
//     if (!state)
//       return res
//         .status(404)
//         .json({ success: false, message: 'State not found' });
//     res.status(200).json({ success: true, data: state });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateState = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     if (updates.countryId) {
//       const country = await Country.findById(updates.countryId);
//       if (!country)
//         return res
//           .status(404)
//           .json({ success: false, message: 'Country not found' });
//     }
//     const state = await State.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).populate('countryId', 'name');
//     if (!state)
//       return res
//         .status(404)
//         .json({ success: false, message: 'State not found' });
//     res.status(200).json({ success: true, data: state });
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteState = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const state = await State.findByIdAndDelete(id);
//     if (!state)
//       return res
//         .status(404)
//         .json({ success: false, message: 'State not found' });
//     res.status(200).json({ success: true, message: 'State deleted' });
//   } catch (error) {
//     next(error);
//   }
// };


import State from '../../models/admin/state.model.js';

// ✅ 1. Add State (Admin Only)
export const addState = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'State name is required' });

    const state = await State.create({ name });
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'State already exists' });
    }
    next(error);
  }
};

// ✅ 2. Get All States (Admin ke liye saare, User ke liye sirf Active)
export const getStates = async (req, res, next) => {
  try {
    const { search, isAdmin } = req.query; 
    let filter = {};

    // Agar request user ki taraf se hai (isAdmin query nahi hai), toh sirf active dikhao
    if (isAdmin !== 'true') {
      filter.isActive = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const states = await State.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, count: states.length, data: states });
  } catch (error) {
    next(error);
  }
};

// ✅ 3. Update State & Status Toggle (Admin Only)
export const updateState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const state = await State.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true, runValidators: true }
    );

    if (!state) return res.status(404).json({ success: false, message: 'State not found' });
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    next(error);
  }
};



export const getActiveStates = async (req, res) => {
  try {
    // Hum sirf wahi states nikal rahe hain jahan isActive: true hai
    const states = await State.find({ isActive: true })
      .select('name _id') // Sirf kaam ka data bhej rahe hain
      .sort({ name: 1 }); // Alphabetical order (A to Z)

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "States fetch karne mein dikkat aayi",
      error: error.message
    });
  }
};