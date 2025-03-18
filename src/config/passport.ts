import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { User } from '../models/user.model';
import { UserAttributes } from '../types/common';
import dotenv from 'dotenv';

dotenv.config();

// Configure local strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done): Promise<void> => {
      try {
        // Find the user by email
        const user = await User.findOne({ where: { email, active: true } });
        
        // If user not found or password is invalid
        if (!user || !(await user.isValidPassword(password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Return the user if authentication is successful
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configure JWT strategy for token authentication
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done): Promise<void> => {
    try {
      // Find the user by ID from JWT payload
      const user = await User.findOne({ 
        where: { 
          id: jwtPayload.id,
          active: true 
        } 
      });
      
      // If user not found
      if (!user) {
        return done(null, false);
      }
      
      // Return the user if found
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Add types to req.user
declare global {
  namespace Express {
    interface User extends UserAttributes {}
  }
}

export default passport; 