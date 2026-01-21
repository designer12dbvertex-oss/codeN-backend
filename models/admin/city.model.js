// import mongoose from 'mongoose';

// const CitySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//     },

//     stateId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'State',
//       required: true,
//     },

//     countryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Country',
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Prevent duplicate cities in same state & country
// CitySchema.index({ name: 1, stateId: 1, countryId: 1 }, { unique: true });

// // ✅ Fast dropdown queries
// CitySchema.index({ stateId: 1 });
// CitySchema.index({ countryId: 1 });

// const City = mongoose.model('City', CitySchema);
// export default City;
import mongoose from 'mongoose';

const CitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate cities in the same state
CitySchema.index({ name: 1, stateId: 1 }, { unique: true });

// ✅ Fast dropdown queries for state-wise filtering
CitySchema.index({ stateId: 1 });

const City = mongoose.model('City', CitySchema);
export default City;