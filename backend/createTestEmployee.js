import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Check if test employee exists
    const testEmployee = await User.findOne({ email: 'employee@gmail.com' });
    if (!testEmployee) {
      const employee = new User({
        name: 'Test Employee',
        email: 'employee@gmail.com', 
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP001',
        area: 'NDZ-A'
      });
      await employee.save();
      console.log('✅ Test employee created: employee@gmail.com / employee123');
    } else {
      console.log('✅ Test employee already exists');
    }
    
    // Show employee count
    const employeeCount = await User.countDocuments({ role: 'employee' });
    console.log(`📊 Total employees in database: ${employeeCount}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });