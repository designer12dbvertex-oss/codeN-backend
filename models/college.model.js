import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
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

const College = mongoose.model('College', CollegeSchema);
export default College;
