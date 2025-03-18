import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { UserModel, UserModelStatic, UserAttributes, UserType } from '../types/model';

const User = sequelize.define<UserModel>(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userType: {
      type: DataTypes.ENUM(...Object.values(UserType)),
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trainerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user): Promise<void> => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user): Promise<void> => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
) as unknown as UserModelStatic;

// Instance method to compare password
User.prototype.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Static method to check if a user can register another user
User.canRegisterUserType = (registrarType: UserType, targetType: UserType): boolean => {
  if (registrarType === UserType.ADMIN) {
    // Admins can register all types of users
    return true;
  } else if (registrarType === UserType.TRAINER) {
    // Trainers can only register students
    return targetType === UserType.STUDENT;
  }
  // Students can't register any users
  return false;
};

// Static method to format user for response
User.formatForResponse = (user: UserModel | UserAttributes): Omit<UserAttributes, 'password' | 'resetPasswordToken' | 'resetPasswordExpires'> => {
  const userData = user instanceof Model ? user.toJSON() : { ...user };
  delete userData.password;
  delete userData.resetPasswordToken;
  delete userData.resetPasswordExpires;
  return userData;
};

// Self-reference for trainer-student relationship
User.hasMany(User, { as: 'students', foreignKey: 'trainerId' });
User.belongsTo(User, { as: 'trainer', foreignKey: 'trainerId' });

export { User }; 