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
  switch (String(state).toLowerCase()) {
    case 'student':
      return Role.STUDENT;
    case 'alumni':
      return Role.ALUMNI;
    case 'cdc':
      return Role.CDC;
    default:
      return Role.STUDENT;
  }
}

// Resolve callback URLs.
// Priority: provider-specific env > BACKEND_URL env > local backend port.
const defaultBackendUrl = `http://localhost:${process.env.PORT || 5002}`;
const backendUrl = (process.env.BACKEND_URL || defaultBackendUrl).replace(/\/+$/, '');

const googleCallbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  `${backendUrl}/api/auth/google/callback`;

const githubCallbackURL =
  process.env.GITHUB_CALLBACK_URL ||
  `${backendUrl}/api/auth/github/callback`;

logger.info(`[Passport] Google callbackURL = ${googleCallbackURL}`);
logger.info(`[Passport] GitHub callbackURL = ${githubCallbackURL}`);

// ── Google OAuth Strategy ──
const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL,
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
            const hashedPwd = await bcrypt.hash(defaultPwd, 10);
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
  console.log('✅ Google OAuth strategy loaded');
} else {
  logger.warn('⚠️ Google OAuth credentials missing; Google login will be disabled.');
}

// ── GitHub OAuth Strategy ──
const githubClientId = (process.env.GITHUB_CLIENT_ID || '').trim();
const githubClientSecret = (process.env.GITHUB_CLIENT_SECRET || '').trim();

if (githubClientId && githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackURL,
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
            const hashedPwd = await bcrypt.hash(defaultPwd, 10);
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
  console.log('✅ GitHub OAuth strategy loaded');
} else {
  logger.warn('⚠️ GitHub OAuth credentials missing; GitHub login will be disabled.');
}

export default passport;
