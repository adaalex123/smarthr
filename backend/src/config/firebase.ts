import fs from 'fs';
import admin, { ServiceAccount } from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { config } from './index.js';
import { AppError } from '../utils/errorHandler.js';

function getAuth() {
  if (!admin.apps.length) {
    if (!fs.existsSync(config.firebase.serviceAccount)) {
      throw new AppError('Firebase service account file not found', 500);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(config.firebase.serviceAccount, 'utf8')
    ) as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.auth();
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  try {
    return await getAuth().verifyIdToken(idToken);
  } catch {
    throw new AppError('Invalid or expired OAuth token', 401);
  }
}

export function providerFromFirebase(decoded: DecodedIdToken): string {
  const signInProvider = decoded.firebase?.sign_in_provider || 'unknown';
  if (signInProvider.endsWith('.com')) {
    return signInProvider.replace('.com', '');
  }
  return signInProvider;
}
