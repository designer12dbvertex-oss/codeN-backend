import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin/admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    console.log('MONGO URI USED =', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    console.log('👉 DB NAME =', mongoose.connection.name);

    const email = 'admin_test@gmail.com';

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log('❌ Admin already exists in THIS DB:', email);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: 'codenAdmin',
      email,
      password: '123456', // plain (pre-save hook will hash)
      role: 'admin',
      phone: '9874563210',
      status: 'active',
    });

    console.log('🎉 Admin seeded successfully');
    console.log('👉 DB NAME =', mongoose.connection.name);
    console.log({
      email: admin.email,
      password: '123456',
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
