import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig } from "./config";
import type { Session } from "./types";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function isConfigured(): boolean {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}

function getDb(): Firestore | null {
  if (!isConfigured()) return null;
  if (!app) app = initializeApp(firebaseConfig);
  if (!db) db = getFirestore(app);
  return db;
}

export async function saveSession(session: Session): Promise<void> {
  const firestore = getDb();
  if (!firestore) return;
  try {
    const ref = doc(collection(firestore, "sessions"), session.id);
    await setDoc(ref, session, { merge: true });
  } catch {
    // Silently fail — analytics should never break the site
  }
}

export async function loadSessions(max = 200): Promise<Session[]> {
  const firestore = getDb();
  if (!firestore) return [];
  try {
    const q = query(
      collection(firestore, "sessions"),
      orderBy("startedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Session);
  } catch {
    return [];
  }
}
