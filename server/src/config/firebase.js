import admin from 'firebase-admin';

let isFirebaseAdminInitialized = false;

try {
  // For verifyIdToken, we only strictly need the projectId, 
  // we do not need the full private key service account JSON!
  admin.initializeApp({
    projectId: "codearena-ca8e1"
  });
  isFirebaseAdminInitialized = true;
  console.log('Firebase Admin SDK initialized successfully for token verification.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export { admin, isFirebaseAdminInitialized };
