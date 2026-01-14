import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB connected');

    // check if admin already exists
    const newEmail = 'admin_new@gmail.com';
    const existingAdmin = await Admin.findOne({ email: newEmail });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      process.exit();
    }

    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin_test@gmail.com',
      password: '123456', 
      role: 'admin',

    },
  );
  

    console.log('🎉 Admin seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
