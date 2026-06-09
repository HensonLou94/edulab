import dotenv from 'dotenv';
dotenv.config();

import { syncDatabase, User, Teacher } from '../models/index.js';
import bcrypt from 'bcryptjs';

const initDatabase = async () => {
  console.log('Starting database initialization...');

  const synced = await syncDatabase(true);
  if (!synced) {
    console.error('Failed to sync database');
    process.exit(1);
  }

  // Create default admin user
  const existingAdmin = await User.findOne({ where: { username: 'admin' } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    // Create associated teacher record for admin
    await Teacher.create({
      userId: admin.id,
      name: '管理员',
      phone: '',
      subjects: '',
      baseSalary: 0,
      hourlyRate: 0
    });

    console.log('Default admin user created: admin / admin123');
  }

  console.log('Database initialization completed.');
  process.exit(0);
};

initDatabase();
