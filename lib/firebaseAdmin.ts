// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import 'server-only';

let _app: App | null = null;

function loadServiceAccount() {
  // Preferred: 3 separate env vars (easier on Vercel etc.)....
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawKey) {
    const privateKey = rawKey.replace(/\\n/g, "\n");
    return { projectId, clientEmail, privateKey };
  }

  // Fallback: a single JSON blob
  const blob = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!blob) return null;

  try {
    const parsed = JSON.parse(blob);
    const privateKey =
      (parsed.private_key ?? parsed.privateKey)?.replace?.(/\\n/g, "\n");
    return {
      projectId: parsed.project_id ?? parsed.projectId,
      clientEmail: parsed.client_email ?? parsed.clientEmail,
      privateKey,
    };
  } catch {
    return null;
  }
}

function getAdminApp() {
  if (_app) return _app;

  const sa = loadServiceAccount();
  if (!sa) {
    // IMPORTANT: never crash at import time — only throw when actually used.
    throw new Error(
      "Missing Firebase Admin credentials. Provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (with \\n) or FIREBASE_SERVICE_ACCOUNT (JSON)."
    );
  }

  _app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: sa.projectId,
        clientEmail: sa.clientEmail,
        privateKey: sa.privateKey,
      }),
    });

  return _app;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}