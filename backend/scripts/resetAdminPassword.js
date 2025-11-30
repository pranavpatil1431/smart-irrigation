import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Load environment from backend/.env
dotenv.config();

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/resetAdminPassword.js <email> <newPassword>');
  process.exit(1);
}

const [email, newPassword] = args;

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in environment. Please set it in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  console.log(`✅ Password reset for ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
