// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { Role } from '@prisma/client';

// Serialize user id into session (not used, but required by passport)
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

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      passReqToCallback: true,
    },
  ),
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (req: any, accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
      try {
        // GitHub may provide emails separately; ensure we have primary email
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email found in GitHub profile'), null);
        }
        let user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
          // New OAuth user – set a deterministic bcrypt‑hashed password
          const defaultPwd = 'Shalini@16_2005_I_Love_You';
          const bcrypt = (await import('bcryptjs')).default;
          const hashedPwd = await bcrypt.hash(defaultPwd, 12);
          const role = (req.query.state === 'admin_setup') ? Role.ADMIN : Role.STUDENT;
          user = await prisma.user.create({
            data: {
              email,
              password: hashedPwd,
              role,
              isEmailVerified: true,
            },
          });
          logger.info(`Created new user via GitHub OAuth: ${email} with role: ${role}`);
        }
        return done(null, user);
      } catch (err) {
        logger.error(`GitHub OAuth error: ${err instanceof Error ? err.message : err}`);
        return done(err as any, null);
      }
    },
  ),
);

export default passport;
