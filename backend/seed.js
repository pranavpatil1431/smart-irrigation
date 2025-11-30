import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (adminExists) {
      console.log('✅ Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Default admin created:');
    console.log('- Email: admin@gmail.com');
    console.log('- Password: admin123');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  });
