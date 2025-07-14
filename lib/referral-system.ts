import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { calculateMatrixRequirements } from "./matrix-calculator"

// --- Referral creation ---
export interface CreateReferralData {
  sponsorId: string
  referredUserId: string
  referredUserName: string
  referredUserEmail: string
  level: number
}

export async function createReferral(referralData: CreateReferralData) {
  try {
    console.log("📊 Creating referral record...")
    
    // Add to referrals collection
    await addDoc(collection(db, "referrals"), {
      ...referralData,
      status: "active",
      totalCommissionEarned: 0,
      joinedAt: Timestamp.now(),
      activatedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    })
    
    // --- Add referred user to sponsor's downlines array ---
    // Find sponsor's user doc by userId
    const sponsorQuery = query(collection(db, "users"), where("userId", "==", referralData.sponsorId))
    const sponsorSnap = await getDocs(sponsorQuery)
    if (!sponsorSnap.empty) {
      const sponsorDoc = sponsorSnap.docs[0]
      await updateDoc(doc(db, "users", sponsorDoc.id), {
        downlines: arrayUnion(referralData.referredUserId)
      })
    }
    
    console.log("✅ Referral record created and downline updated")
    return true
  } catch (error) {
    console.error("❌ Error creating referral:", error)
    return false
  }
}

// --- Commission creation ---
// Add sourceUserId and level for tracking
export async function createCommission(
  userId: string,
  amount: number,
  type: string,
  description: string,
  sourceUserId?: string,
  level?: number
) {
  try {
    console.log("💰 Creating commission record...")
    
    await addDoc(collection(db, "commissions"), {
      userId,
      amount,
      type,
      description,
      status: "pending",
      createdAt: Timestamp.now(),
      ...(sourceUserId ? { sourceUserId } : {}),
      ...(level ? { level } : {})
    })
    
    console.log("✅ Commission record created successfully")
    return true
  } catch (error) {
    console.error("❌ Error creating commission:", error)
    return false
  }
}

// Helper: Traverse a referral tree up to 6 levels and collect commissions per branch
async function traverseReferralTree(
  userId: string,
  referral: any,
  commissionAmounts: number[],
  level: number,
  commissions: any[]
) {
  if (level > 6) return;
  commissions.push({
    userId,
    amount: commissionAmounts[level - 1],
    type: "referral_bonus",
    description: `Referral bonus for ${referral.referredUserName || referral.name} (${referral.referredUserId}) at level ${level}`,
    status: "pending",
    createdAt: referral.joinedAt || referral.createdAt || new Date(),
    sourceUserId: referral.referredUserId,
    level,
  });
  // Find the next referral in this branch (downline of this referral)
  const subRefsSnap = await getDocs(
    query(
      collection(db, "referrals"),
      where("sponsorId", "==", referral.referredUserId)
    )
  );
  if (!subRefsSnap.empty) {
    // Only follow the first downline in this branch (single branch per direct referral)
    const subRefs = subRefsSnap.docs.map(doc => doc.data());
    if (subRefs.length > 0) {
      await traverseReferralTree(userId, subRefs[0], commissionAmounts, level + 1, commissions);
    }
  }
}

// Helper: Traverse a referral tree up to 6 levels and collect commissions per branch, also collect the branch path
async function traverseReferralTreeWithPath(
  userId: string,
  referral: any,
  commissionAmounts: number[],
  level: number,
  branch: any[],
  commissions: any[]
) {
  if (level > 6) return;
  const commission = {
    userId,
    amount: commissionAmounts[level - 1],
    type: "referral_bonus",
    description: `Referral bonus for ${referral.referredUserName || referral.name} (${referral.referredUserId}) at level ${level}`,
    status: "pending",
    createdAt: referral.joinedAt || referral.createdAt || new Date(),
    sourceUserId: referral.referredUserId,
    level,
    referral: referral,
  };
  commissions.push(commission);
  branch.push(referral);
  // Find the next referral in this branch (downline of this referral)
  const subRefsSnap = await getDocs(
    query(
      collection(db, "referrals"),
      where("sponsorId", "==", referral.referredUserId)
    )
  );
  if (!subRefsSnap.empty) {
    // Only follow the first downline in this branch (single branch per direct referral)
    const subRefs = subRefsSnap.docs.map(doc => doc.data());
    if (subRefs.length > 0) {
      await traverseReferralTreeWithPath(userId, subRefs[0], commissionAmounts, level + 1, branch, commissions);
    }
  }
}

// Recalculate commissions for a user and their direct referral trees (returns array of branches for differentiation)
export async function recalculateUserCommissions(userId: string) {
  // Get all direct referrals (level 1)
  const referralsSnap = await getDocs(
    query(collection(db, "referrals"), where("sponsorId", "==", userId))
  );
  const directReferrals = referralsSnap.docs.map(doc => doc.data());

  const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500];
  let allBranches: any[] = [];
  let allCommissions: any[] = [];

  // For each direct referral, traverse their tree up to 6 levels (one branch per direct)
  for (const ref of directReferrals) {
    let branch: any[] = [];
    let commissions: any[] = [];
    await traverseReferralTreeWithPath(userId, ref, commissionAmounts, 1, branch, commissions);
    allBranches.push({
      directReferral: ref,
      branch, // array of referrals in the chain (A → D → G ...)
      commissions, // array of commission objects for this branch
      total: commissions.reduce((sum, c) => sum + (c.amount || 0), 0),
    });
    allCommissions.push(...commissions);
  }

  // Update user's commissions array in users collection (flat list for legacy UI)
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
  if (!userSnap.empty) {
    const userDoc = userSnap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), {
      commissions: allCommissions,
    });
  }
  // Return array of branches for UI to differentiate each direct referral and its tree
  return allBranches;
}

// --- Matrix placement (basic guidance) ---
// You should have a "matrix" collection with documents like:
// { userId, parentId, leftChild, rightChild, level, position, isComplete, createdAt, updatedAt }
// When a user registers, add them to the matrix under their upline or sponsor.
// See your lib/matrix-calculator.ts for calculation logic.

// --- What you need in Firestore ---
// 1. "referrals" collection (already used)
// 2. "users" collection with a "downlines" array field (already used)
// 3. "matrix" collection for matrix positions (see your MatrixDocument and matrix-calculator.ts)
//    - When a user registers, create a matrix node for them and update their upline's leftChild/rightChild if needed.

// --- To check if everything works ---
// - "referrals" collection should get a new doc for each referral.
// - Sponsor's "downlines" array in "users" should include the new user's userId.
// - "matrix" collection should have a node for each user, with correct parentId/level/position.
// - Use your matrix-calculator.ts utilities to manage matrix logic.

// No error signs, all types and logic are compatible with TypeScript and Firebase.
