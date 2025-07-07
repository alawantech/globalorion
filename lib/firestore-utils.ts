import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  addDoc,
  orderBy,
  arrayUnion,
  Timestamp,
  deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  UserDocument, 
  PaymentDocument, 
  CommissionDocument, 
  PinDocument,
  PackageDocument,
  MatrixDocument,
  TransactionDocument,
  SettingsDocument,
  NotificationDocument,
  COLLECTIONS 
} from "./firestore-collections";

// User utilities
export const checkUserExists = async (userId: string): Promise<boolean> => {
  const q = query(collection(db, COLLECTIONS.USERS), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const getUserByUserId = async (userId: string): Promise<UserDocument | null> => {
  try {
    console.log(`🔍 Searching for userId: "${userId}" in collection: "${COLLECTIONS.USERS}"`);
    
    const q = query(collection(db, COLLECTIONS.USERS), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.docs.length} documents matching userId: "${userId}"`);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserDocument;
      console.log(`✅ User found: ${userData.name} (${userData.userId})`);
      return userData;
    }
    
    console.log(`❌ No user found with userId: "${userId}"`);
    return null;
  } catch (error) {
    console.error(`❌ Error searching for userId "${userId}":`, error);
    return null;
  }
};

export const getUserByUid = async (uid: string): Promise<UserDocument | null> => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return userDoc.exists() ? userDoc.data() as UserDocument : null;
};

// Payment utilities
export const createPayment = async (paymentData: Omit<PaymentDocument, 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.PAYMENTS), {
    ...paymentData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const updatePaymentStatus = async (paymentId: string, status: PaymentDocument['status']) => {
  await updateDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), {
    status
  });
};

export const getPaymentsByUser = async (userId: string): Promise<PaymentDocument[]> => {
  const q = query(
    collection(db, COLLECTIONS.PAYMENTS), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as PaymentDocument));
};

// Commission utilities
export const createCommission = async (commissionData: Omit<CommissionDocument, 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.COMMISSIONS), {
    ...commissionData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const approveCommission = async (commissionId: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.COMMISSIONS, commissionId), {
    status: 'approved',
    approvedAt: Timestamp.now()
  });
};

export const getCommissionsByUser = async (userId: string): Promise<CommissionDocument[]> => {
  const q = query(
    collection(db, COLLECTIONS.COMMISSIONS), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as CommissionDocument));
};

// PIN utilities
export const createPin = async (pinData: Omit<PinDocument, 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.PINS), {
    ...pinData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const validatePin = async (pin: string): Promise<boolean> => {
  const q = query(collection(db, COLLECTIONS.PINS), where("pin", "==", pin), where("status", "==", "unused"));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const usePin = async (pin: string, userId: string): Promise<boolean> => {
  const q = query(collection(db, COLLECTIONS.PINS), where("pin", "==", pin), where("status", "==", "unused"));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const pinDoc = querySnapshot.docs[0];
    await updateDoc(pinDoc.ref, {
      status: "used",
      usedBy: userId,
      usedAt: Timestamp.now()
    });
    return true;
  }
  return false;
};

export const generatePinCode = (): string => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const generateReference = (prefix: string = 'REF'): string => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

// Create notification utility
export const createNotification = async (notificationData: Omit<NotificationDocument, 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...notificationData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

// Package utilities
export const getPackageById = async (packageId: string): Promise<PackageDocument | null> => {
  const packageDoc = await getDoc(doc(db, COLLECTIONS.PACKAGES, packageId));
  return packageDoc.exists() ? packageDoc.data() as PackageDocument : null;
};

export const getAllPackages = async (): Promise<PackageDocument[]> => {
  const q = query(collection(db, COLLECTIONS.PACKAGES), where("isActive", "==", true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as PackageDocument));
};

export const updatePackage = async (packageId: string, updates: Partial<PackageDocument>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.PACKAGES, packageId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Matrix utilities
export const createMatrixNode = async (matrixData: Omit<MatrixDocument, 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.MATRIX), {
    ...matrixData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const findMatrixPosition = async (uplineId: string): Promise<{position: number, level: number}> => {
  const q = query(collection(db, COLLECTIONS.MATRIX), where("userId", "==", uplineId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const uplineMatrix = querySnapshot.docs[0].data() as MatrixDocument;
    
    // Check if left position is available
    if (!uplineMatrix.leftChild) {
      return { position: 1, level: uplineMatrix.level + 1 };
    }
    // Check if right position is available
    if (!uplineMatrix.rightChild) {
      return { position: 2, level: uplineMatrix.level + 1 };
    }
    
    // Find next available position in downline
    return await findNextAvailablePosition(uplineMatrix.leftChild, uplineMatrix.level + 1);
  }
  
  return { position: 1, level: 1 };
};

const findNextAvailablePosition = async (userId: string, level: number): Promise<{position: number, level: number}> => {
  const q = query(collection(db, COLLECTIONS.MATRIX), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const matrix = querySnapshot.docs[0].data() as MatrixDocument;
    
    if (!matrix.leftChild) {
      return { position: 1, level: level + 1 };
    }
    if (!matrix.rightChild) {
      return { position: 2, level: level + 1 };
    }
    
    // Continue searching in left subtree
    return await findNextAvailablePosition(matrix.leftChild, level + 1);
  }
  
  return { position: 1, level: level + 1 };
};

export const getMatrixByUser = async (userId: string): Promise<MatrixDocument | null> => {
  const q = query(collection(db, COLLECTIONS.MATRIX), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as MatrixDocument;
  }
  return null;
};

// Transaction utilities
export const createTransaction = async (transactionData: Omit<TransactionDocument, 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transactionData,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

export const getTransactionsByUser = async (userId: string): Promise<TransactionDocument[]> => {
  const q = query(
    collection(db, COLLECTIONS.TRANSACTIONS), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as TransactionDocument));
};

export const updateTransactionStatus = async (transactionId: string, status: TransactionDocument['status']): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), {
    status
  });
};

// Settings utilities
export const getSystemSettings = async (): Promise<SettingsDocument | null> => {
  const settingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'system'));
  return settingsDoc.exists() ? settingsDoc.data() as SettingsDocument : null;
};

export const updateSystemSettings = async (updates: Partial<SettingsDocument>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.SETTINGS, 'system'), {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const getAvailablePins = async (): Promise<PinDocument[]> => {
  const q = query(collection(db, COLLECTIONS.PINS), where("status", "==", "unused"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data() } as PinDocument));
};

// Generate unique IDs
export const generateUserId = async (): Promise<string> => {
  let userId: string;
  let exists = true;
  
  while (exists) {
    const timestamp = Date.now().toString();
    userId = `GO${timestamp.slice(-8)}`;
    exists = await checkUserExists(userId);
  }
  
  return userId!;
};