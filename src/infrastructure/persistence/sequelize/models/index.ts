import UserModel from './user.model';

/**
 * Initialize model associations
 */
const initializeAssociations = (): void => {
  // Self-reference: Trainer to Students
  UserModel.hasMany(UserModel, {
    as: 'students',
    foreignKey: 'trainerId',
    sourceKey: 'id',
  });

  UserModel.belongsTo(UserModel, {
    as: 'trainer',
    foreignKey: 'trainerId',
    targetKey: 'id',
  });
};

// Initialize associations when this module is imported
initializeAssociations();

// Export all models from a single point
export {
  UserModel,
};

// Export a function to sync all models with the database
export const syncModels = async (force = false): Promise<void> => {
  if (process.env.NODE_ENV === 'production' && force) {
    console.warn('WARNING: Forcing sync in production mode!');
  }

  // Sync all models
  await UserModel.sync({ force });

  console.log('Database models synchronized');
};
