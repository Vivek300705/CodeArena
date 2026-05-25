import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let isFirebaseAdminInitialized = false;

try {
  // Try to load the service account from a path specified in ENV
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (serviceAccountPath) {
    const fullPath = path.resolve(process.cwd(), serviceAccountPath);
    if (fs.existsSync(fullPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      isFirebaseAdminInitialized = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn(`Firebase service account file not found at: ${fullPath}`);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set in .env. Social login backend verification will fail.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export { admin, isFirebaseAdminInitialized };
