import mongoose from 'mongoose';

/**
 * MongoDB database connection function
 * MongoDB database se connect karne ke liye function
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose ke latest features use karne ke liye
      // useNewUrlParser aur useUnifiedTopology ab default hai
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

