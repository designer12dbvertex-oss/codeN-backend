import mongoose from 'mongoose';

const CitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
  },
  { timestamps: true }
);

const City = mongoose.model('City', CitySchema);
export default City;
