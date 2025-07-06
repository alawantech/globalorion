// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqbxEXUT8U_AAKhjg9HAODD9VaNWbVHdU",
  authDomain: "global-orion.firebaseapp.com",
  projectId: "global-orion",
  storageBucket: "global-orion.firebasestorage.app",
  messagingSenderId: "721818260133",
  appId: "1:721818260133:web:6175fc8759178f0e90734c",
  measurementId: "G-MQXBJ5EMS2"
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Collection references
export const usersCollection = collection(db, 'users');
export const paymentsCollection = collection(db, 'payments');
export const commissionsCollection = collection(db, 'commissions');
export const pinsCollection = collection(db, 'pins');
export const packagesCollection = collection(db, 'packages');
export const matrixCollection = collection(db, 'matrix');
export const transactionsCollection = collection(db, 'transactions');
export const settingsCollection = collection(db, 'settings');
export const withdrawalsCollection = collection(db, 'withdrawals');
export const notificationsCollection = collection(db, 'notifications');
export const referralsCollection = collection(db, 'referrals');
export const bonusesCollection = collection(db, 'bonuses');
export const activityLogsCollection = collection(db, 'activity_logs');
export const supportTicketsCollection = collection(db, 'support_tickets');

// Initialize default data
export const initializeFirestore = async () => {
  try {
    // Create admin user if doesn't exist
    const adminRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
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
        createdAt: new Date(),
        activationDate: new Date()
      });
    }

    // Create sample PINs with auto-generated IDs
    const samplePins = [
      { pin: 'PIN123456', status: 'unused' },
      { pin: 'PIN789012', status: 'unused' },
      { pin: 'PIN345678', status: 'unused' },
      { pin: 'PIN901234', status: 'unused' },
      { pin: 'PIN567890', status: 'unused' }
    ];

    for (const pinData of samplePins) {
      try {
        await addDoc(collection(db, 'pins'), {
          pin: pinData.pin,
          status: pinData.status,
          assignedTo: null,
          createdAt: new Date()
        });
      } catch (error) {
        console.log(`PIN ${pinData.pin} may already exist`);
      }
    }

    // Create packages with auto-generated IDs
    const packages = [
      {
        id: 'starter',
        features: 'Access to 6-Level Matrix System, Commission on All Levels, Mobile App Access',
        currency: 'NGN',
        price: 36000,
        isActive: true
      },
      {
        id: 'premium',
        features: 'Access to 6-Level Matrix System, Commission on All Levels, Mobile App Access, Priority Support, Monthly Webinars, Bonus Commissions',
        currency: 'NGN',
        price: 72000,
        isActive: true
      }
    ];

    for (const pkg of packages) {
      try {
        await addDoc(collection(db, 'packages'), {
          id: pkg.id,
          features: pkg.features,
          currency: pkg.currency,
          price: pkg.price,
          isActive: pkg.isActive,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.log(`Package ${pkg.id} may already exist`);
      }
    }

    // Create matrix root with specific document ID
    const matrixRef = doc(db, 'matrix', 'root');
    const matrixDoc = await getDoc(matrixRef);
    
    if (!matrixDoc.exists()) {
      await setDoc(matrixRef, {
        userId: 'admin002',
        parentId: '',
        leftChild: '',
        rightChild: '',
        level: 0,
        position: 0,
        isComplete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create sample transactions with auto-generated IDs
    const transactions = [
      {
        userId: 'admin002',
        type: 'credit',
        amount: 0,
        description: 'Initial balance',
        category: 'system',
        reference: 'INIT001',
        status: 'completed',
        balanceBefore: 0,
        balanceAfter: 0
      },
      {
        userId: 'admin002',
        type: 'credit',
        amount: 10800,
        description: 'Sample commission earned',
        category: 'commission',
        reference: 'COMM001',
        status: 'completed',
        balanceBefore: 0,
        balanceAfter: 10800
      },
      {
        userId: 'admin002',
        type: 'debit',
        amount: 5000,
        description: 'Sample withdrawal',
        category: 'withdrawal',
        reference: 'WITH001',
        status: 'completed',
        balanceBefore: 10800,
        balanceAfter: 5800
      }
    ];

    for (const transaction of transactions) {
      try {
        await addDoc(collection(db, 'transactions'), {
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          reference: transaction.reference,
          status: transaction.status,
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          createdAt: new Date()
        });
      } catch (error) {
        console.log(`Transaction ${transaction.reference} may already exist`);
      }
    }

    // Create system settings with specific document ID
    const settingsRef = doc(db, 'settings', 'system');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      await setDoc(settingsRef, {
        commissionRates: {
          level1: 0.3,
          level2: 0.15,
          level3: 0.1,
          level4: 0.5,
          level5: 0.3,
          level6: 0.2
        },
        matrixSize: 2,
        maxLevels: 6,
        minWithdrawal: 5000,
        pinPrice: 1000,
        withdrawalFee: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create sample notification
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin002',
        title: 'Welcome to Bright Orion',
        message: 'Your account has been successfully created and activated.',
        type: 'system',
        isRead: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.log('Sample notification may already exist');
    }

    // Create sample bonus
    try {
      await addDoc(collection(db, 'bonuses'), {
        userId: 'admin002',
        bonusType: 'welcome',
        amount: 1000,
        description: 'Welcome bonus for new users',
        criteria: 'Account activation',
        status: 'approved',
        createdAt: new Date(),
        approvedAt: new Date()
      });
    } catch (error) {
      console.log('Sample bonus may already exist');
    }

    // Create sample activity log
    try {
      await addDoc(collection(db, 'activity_logs'), {
        userId: 'admin002',
        action: 'login',
        description: 'Admin user logged in',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date()
      });
    } catch (error) {
      console.log('Sample activity log may already exist');
    }

    // Create WITHDRAWALS collection (matching your structure)
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: 'admin002',
        amount: '5000', // String as per your structure
        method: 'bank_transfer',
        reference: 'WITH001',
        status: 'pending',
        fee: 100,
        netAmount: 4900,
        requestedAt: new Date()
      });
      console.log('✅ Withdrawals collection created');
    } catch (error) {
      console.log('Withdrawals collection may already exist');
    }

    // Create NOTIFICATIONS collection (matching your structure)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin002',
        title: 'Welcome to Bright Orion',
        message: 'Your account has been successfully created',
        type: 'system',
        isRead: false,
        createdAt: new Date()
      });
      console.log('✅ Notifications collection created');
    } catch (error) {
      console.log('Notifications collection may already exist');
    }

    // Create REFERRALS collection (matching your structure)
    try {
      await addDoc(collection(db, 'referrals'), {
        sponsorId: 'admin002',
        referredUserId: 'GO12345678',
        referredUserName: 'John Doe',
        referredUserEmail: 'john@example.com',
        level: 1,
        status: 'active',
        totalCommissionEarned: 10800,
        joinedAt: new Date()
      });
      console.log('✅ Referrals collection created');
    } catch (error) {
      console.log('Referrals collection may already exist');
    }

    // Create BONUSES collection (matching your structure)
    try {
      await addDoc(collection(db, 'bonuses'), {
        userId: 'admin002',
        bonusType: 'welcome',
        amount: 1000,
        description: 'Welcome bonus for new users',
        criteria: 'Account activation',
        status: 'approved',
        createdAt: new Date()
      });
      console.log('✅ Bonuses collection created');
    } catch (error) {
      console.log('Bonuses collection may already exist');
    }

    // Create ACTIVITY_LOGS collection
    try {
      await addDoc(collection(db, 'activity_logs'), {
        userId: 'admin002',
        action: 'login',
        description: 'Admin user logged in',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metadata: {
          loginTime: new Date().toISOString()
        },
        createdAt: new Date()
      });
      console.log('✅ Activity logs collection created');
    } catch (error) {
      console.log('Activity logs collection may already exist');
    }

    // Create SUPPORT_TICKETS collection
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: 'admin002',
        subject: 'Test Support Ticket',
        message: 'This is a sample support ticket for testing purposes.',
        category: 'general',
        priority: 'medium',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: []
      });
      console.log('✅ Support tickets collection created');
    } catch (error) {
      console.log('Support tickets collection may already exist');
    }

    console.log('🎉 All collections created successfully!');
  } catch (error) {
    console.error('❌ Error creating collections:', error);
  }
};

export default app;
     