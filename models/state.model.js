import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
  },
  { timestamps: true }
);

const State = mongoose.model('State', StateSchema);
export default State;
