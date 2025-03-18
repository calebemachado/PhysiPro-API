/**
 * Script to create an initial admin user in the database
 * Run with: npm run init:admin
 */

import dotenv from 'dotenv';
import { sequelize } from '../config/database';
import { syncModels } from '../infrastructure/persistence/sequelize/models';
import { userRepository } from '../infrastructure/persistence/sequelize/repositories';
import { UserType } from '../domain/entities/user';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Admin constants
const ADMIN_EMAIL = 'admin@physipro.com';
const ADMIN_PASSWORD = 'admin123456';

/**
 * Create admin user
 */
const createAdmin = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();

    // Sync models
    await syncModels(false);

    // Check if admin already exists
    const existingAdmin = await userRepository.findByEmail(ADMIN_EMAIL);

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create admin user
    const admin = await userRepository.create({
      id: uuidv4(),
      name: 'Administrator',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      cpf: '00000000000', // Placeholder CPF
      userType: UserType.ADMIN,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin user created successfully.');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('IMPORTANT: Please change this password after first login!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the script
createAdmin();
