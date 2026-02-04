import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const Country = mongoose.model('Country', CountrySchema);
export default Country;
