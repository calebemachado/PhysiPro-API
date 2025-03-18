/**
 * Script to create an initial admin user in the database
 * Run with: npm run init:admin
 */

import dotenv from 'dotenv';
import { User, UserType } from '../models/user.model';
import { sequelize } from '../config/database';

dotenv.config();

const ADMIN_EMAIL = 'admin@physipro.com';
const ADMIN_PASSWORD = 'admin123456';

async function createAdmin(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Syncing database models...');
    await sequelize.sync();
    
    console.log('Checking if admin exists...');
    const existingAdmin = await User.findOne({ 
      where: { email: ADMIN_EMAIL } 
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists. No action needed.');
      return;
    }
    
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      cpf: '000.000.000-00',
      userType: UserType.ADMIN,
      active: true,
    });
    
    console.log('Admin user created successfully!');
    console.log('------------------------------');
    console.log('Login credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('------------------------------');
    console.log('IMPORTANT: Change this password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createAdmin(); 