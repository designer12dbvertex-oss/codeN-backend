import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// ✅ Prevent duplicate states in same country
StateSchema.index({ name: 1, countryId: 1 }, { unique: true });

// ✅ Fast dropdown lookup
StateSchema.index({ countryId: 1 });

const State = mongoose.model('State', StateSchema);
export default State;
