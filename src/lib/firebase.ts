import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  getDocFromServer
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { CandidateProfile, JobRole } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operational types for handleFirestoreError
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: localStorage.getItem("jobcrafter_device_user_id"),
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.error("Firestore Error Details: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure database connection is validated
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

// Perform local device/session registration to retain persistent ID in localStorage of the browser
export function setupAuthListener(onAuthSuccess: (uid: string) => void) {
  let active = true;
  let uid = localStorage.getItem("jobcrafter_device_user_id");
  if (!uid) {
    uid = "user_" + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("jobcrafter_device_user_id", uid);
  }

  // Trigger callback inside positive stack frame
  setTimeout(() => {
    if (active && uid) {
      onAuthSuccess(uid);
    }
  }, 50);

  return () => {
    active = false;
  };
}

// 1. Candidate Profile DB methods
export async function saveCandidateProfile(uid: string, profile: CandidateProfile) {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, "users", uid), profile);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getCandidateProfile(uid: string): Promise<CandidateProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as CandidateProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// 2. JobRole DB methods
export async function saveJobRole(uid: string, role: JobRole) {
  const path = `users/${uid}/roles/${role.id}`;
  try {
    await setDoc(doc(db, "users", uid, "roles", role.id), role);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteJobRoleFromDb(uid: string, roleId: string) {
  const path = `users/${uid}/roles/${roleId}`;
  try {
    await deleteDoc(doc(db, "users", uid, "roles", roleId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function getJobRoles(uid: string): Promise<JobRole[]> {
  const path = `users/${uid}/roles`;
  try {
    const snap = await getDocs(collection(db, "users", uid, "roles"));
    const list: JobRole[] = [];
    snap.forEach((docRef) => {
      list.push(docRef.data() as JobRole);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}
