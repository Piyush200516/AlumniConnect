// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Serialize user id into session (required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as any, null);
  }
});

// Helper to determine role from state query param
function getRoleFromState(state: any): Role {
  // Expected state values: 'student', 'alumni', 'cdc'
  switch (String(state).toLowerCase()) {
    case 'student':
      return Role.STUDENT;
    case 'alumni':
      return Role.ALUMNI;
    case 'cdc':
      return Role.CDC;
    default:
      // Fallback to STUDENT if unknown
      return Role.STUDENT;
  }
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: GoogleProfile, done: any) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }
        let user = await prisma.user.findFirst({ where: { email } });
        const requestedRole = getRoleFromState(req.query.state);
        if (user) {
          if (user.role !== requestedRole) {
            return done(new Error(`Role mismatch: User is ${user.role} but tried to log in as ${requestedRole}`), null);
          }
        } else {
          const defaultPwd = 'Shalini@16_2005_I_Love_You';
          const hashedPwd = await bcrypt.hash(defaultPwd, 12);
          user = await prisma.user.create({
            data: {
                email,
                password: hashedPwd,
                profilePhotoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                role: requestedRole,
                isEmailVerified: true,
              },
          });
          logger.info(`Created new Google OAuth user: ${email} with role ${requestedRole}`);
        }
        return done(null, user);
      } catch (err) {
        logger.error(`Google OAuth error: ${err instanceof Error ? err.message : err}`);
        return done(err as any, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/github/callback`,
      scope: ['user:email'],
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in GitHub profile'), null);
        }
        let user = await prisma.user.findFirst({ where: { email } });
        const requestedRole = getRoleFromState(req.query.state);
        if (user) {
          if (user.role !== requestedRole) {
            return done(new Error(`Role mismatch: User is ${user.role} but tried to log in as ${requestedRole}`), null);
          }
        } else {
          const defaultPwd = 'Shalini@16_2005_I_Love_You';
          const hashedPwd = await bcrypt.hash(defaultPwd, 12);
          user = await prisma.user.create({
            data: {
                email,
                password: hashedPwd,
                profilePhotoUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                role: requestedRole,
                isEmailVerified: true,
              },
          });
          logger.info(`Created new GitHub OAuth user: ${email} with role ${requestedRole}`);
        }
        return done(null, user);
      } catch (err) {
        logger.error(`GitHub OAuth error: ${err instanceof Error ? err.message : err}`);
        return done(err as any, null);
      }
    }
  )
);

export default passport;
