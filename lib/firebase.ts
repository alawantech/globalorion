// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

// Initialize default data
export const initializeFirestore = async () => {
  try {
    console.log("🔥 Initializing Firebase connection...");
    
    // Test connection by checking if admin user exists
    const adminRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      console.log(`✅ Firebase connected! Admin user found: ${adminData.name} (${adminData.userId})`);
    } else {
      console.log("⚠️ Firebase connected but no admin user found. Creating admin user...");
      
      // Create admin user if doesn't exist
      await setDoc(adminRef, {
        userId: 'admin002',
        userName: 'admin002',
        name: 'System Administrator',
        email: 'admin2@brightorian.com',
        phone: '08100681294',
        location: 'Admin Office',
        role: 'admin',
        sponsorId: '',
        uplineId: '',
        status: 'active',
        currentLevel: 1,
        totalEarnings: 0,
        pendingEarnings: 0,
        downlines: [],
        createdAt: Timestamp.now(),
        activationDate: Timestamp.now()
      });
      
      console.log('✅ Admin user created with userId: admin002');
    }
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('❌ Check your Firebase configuration and internet connection');
  }
};

export default app;
  