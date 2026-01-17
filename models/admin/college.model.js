import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },

    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },

    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate colleges in same city
CollegeSchema.index({ name: 1, cityId: 1 }, { unique: true });

// ✅ Fast dropdown queries
CollegeSchema.index({ countryId: 1 });
CollegeSchema.index({ stateId: 1 });
CollegeSchema.index({ cityId: 1 });

const College = mongoose.model('College', CollegeSchema);
export default College;
