import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { ReportItem } from '../types';
import { INITIAL_REPORTS } from '../data/mockData';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom database if specified
export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Authentication Helpers
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // Store user record in firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Municipal User',
        photoURL: result.user.photoURL || '',
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

// Firestore Reports Service
export function subscribeToReports(
  onData: (reports: ReportItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const reportsCol = collection(db, 'reports');
    return onSnapshot(
      reportsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ReportItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as ReportItem);
          });
          onData(items);
        } else {
          // If empty, seed initial reports
          seedInitialReportsIfEmpty().then(() => {
            onData(INITIAL_REPORTS);
          });
        }
      },
      (error) => {
        console.warn('Firestore subscription error:', error);
        if (onError) onError(error);
        onData(INITIAL_REPORTS);
      }
    );
  } catch (e: any) {
    console.warn('Firestore onSnapshot init error:', e);
    if (onError) onError(e);
    onData(INITIAL_REPORTS);
    return () => {};
  }
}

export async function seedInitialReportsIfEmpty(): Promise<void> {
  try {
    const reportsCol = collection(db, 'reports');
    const snapshot = await getDocs(reportsCol);
    if (snapshot.empty) {
      console.log('Seeding initial municipal reports to Firestore...');
      for (const report of INITIAL_REPORTS) {
        const reportDoc = doc(db, 'reports', report.id);
        await setDoc(reportDoc, {
          ...report,
          syncedAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn('Firestore initial seeding error (continuing with local cache):', err);
  }
}

export async function saveReportToFirestore(report: ReportItem): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', report.id);
    await setDoc(reportRef, {
      ...report,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
  }
}

export async function updateReportInFirestore(reportOrId: ReportItem | string, updates?: Partial<ReportItem>): Promise<void> {
  try {
    if (typeof reportOrId === 'object') {
      const reportRef = doc(db, 'reports', reportOrId.id);
      await setDoc(reportRef, {
        ...reportOrId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      const reportRef = doc(db, 'reports', reportOrId);
      await updateDoc(reportRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating report in Firestore:', error);
  }
}
