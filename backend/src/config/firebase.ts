import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps, App, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { logger } from '../utils/logger';
import { prisma } from '../lib/prisma';

// ─── Singleton references ─────────────────────────────────────────────────────
let firebaseApp: App | null = null;
let messaging: Messaging | null = null;

/**
 * Resolve the Firebase service account from FIREBASE_SERVICE_ACCOUNT env var.
 *
 * Accepts two formats in .env:
 *   1. Inline JSON string  → FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
 *   2. File path           → FIREBASE_SERVICE_ACCOUNT=./secrets/serviceAccount.json
 *                            FIREBASE_SERVICE_ACCOUNT=C:\path\to\serviceAccount.json
 */
function resolveServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

  if (!raw) return null;

  // ── Case 1: JSON string (starts with '{') ──────────────────────────────────
  if (raw.startsWith('{')) {
    try {
      return JSON.parse(raw) as ServiceAccount;
    } catch (err) {
      logger.error(
        '[Firebase] FIREBASE_SERVICE_ACCOUNT looks like JSON but failed to parse. ' +
          'Make sure the JSON is minified (no newlines) and properly quoted in .env.\n' +
          `Parse error: ${err instanceof Error ? err.message : err}`
      );
      return null;
    }
  }

  // ── Case 2: File path ──────────────────────────────────────────────────────
  // Resolve relative paths from the project root (cwd), not from this file
  const filePath = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);

  if (!fs.existsSync(filePath)) {
    logger.error(
      `[Firebase] FIREBASE_SERVICE_ACCOUNT is set to a file path, but the file was not found:\n` +
        `  Path tried: ${filePath}\n` +
        `  Original value: ${raw}`
    );
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as ServiceAccount;
  } catch (err) {
    logger.error(
      `[Firebase] Failed to read/parse service account file at: ${filePath}\n` +
        `Error: ${err instanceof Error ? err.message : err}`
    );
    return null;
  }
}

/**
 * Initialize Firebase Admin SDK. Idempotent – safe to call on every hot-reload.
 */
export const initializeFirebase = (): void => {
  // ── Guard: already initialized (hot-reload safe) ───────────────────────────
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    messaging = getMessaging(firebaseApp);
    logger.info('[Firebase] Reusing existing Firebase Admin app instance.');
    return;
  }

  const serviceAccount = resolveServiceAccount();

  if (!serviceAccount) {
    logger.warn(
      '[Firebase] ⚠️  FCM push notifications are DISABLED.\n' +
        '  To enable, set FIREBASE_SERVICE_ACCOUNT in .env using one of:\n' +
        '    Option A (JSON string): FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}\n' +
        '    Option B (file path):   FIREBASE_SERVICE_ACCOUNT=./secrets/serviceAccount.json\n' +
        '  Get the key: Firebase Console → Project Settings → Service Accounts → Generate new private key'
    );
    return;
  }

  try {
    firebaseApp = initializeApp({ credential: cert(serviceAccount) });
    messaging = getMessaging(firebaseApp);
    logger.info('[Firebase] ✅ Firebase Admin SDK initialized successfully.');
  } catch (err) {
    logger.error(
      `[Firebase] ❌ initializeApp() failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

export const getFirebaseApp = (): App | null => firebaseApp;

/**
 * Send FCM push notifications to a list of device tokens.
 * Silently mocks when Firebase is not configured.
 * Automatically removes invalid/expired tokens from the database.
 */
export const sendFcmNotification = async (
  userId: string,
  tokens: string[],
  payload: { title: string; body: string; linkUrl?: string }
): Promise<void> => {
  if (!tokens || tokens.length === 0) return;

  if (!messaging) {
    logger.info(
      `[FCM Mock] → user ${userId} (${tokens.length} token(s)): "${payload.title}" – "${payload.body}"`
    );
    return;
  }

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.linkUrl ? { linkUrl: payload.linkUrl } : undefined,
      webpush: payload.linkUrl
        ? { fcmOptions: { link: payload.linkUrl } }
        : undefined,
    });

    logger.info(
      `[FCM] Sent to ${tokens.length} token(s): ` +
        `✅ ${response.successCount} succeeded, ❌ ${response.failureCount} failed.`
    );

    // ── Stale token cleanup ────────────────────────────────────────────────
    if (response.failureCount > 0) {
      const staleTokens: string[] = [];

      response.responses.forEach((res, idx) => {
        if (!res.success && res.error) {
          const { code } = res.error;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            staleTokens.push(tokens[idx]);
          }
        }
      });

      if (staleTokens.length > 0) {
        logger.info(`[FCM] Removing ${staleTokens.length} stale token(s) for user ${userId}.`);
        await prisma.fcmToken.deleteMany({
          where: { token: { in: staleTokens } },
        });
      }
    }
  } catch (err) {
    logger.error(
      `[FCM] Error sending to user ${userId}: ${err instanceof Error ? err.message : err}`
    );
  }
};
