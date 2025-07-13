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

// Recalculate commissions for a user and their matrix downlines
export async function recalculateUserCommissions(userId: string) {
  // Get all referrals where this user is sponsor (direct referrals)
  const referralsSnap = await getDocs(query(collection(db, "referrals"), where("sponsorId", "==", userId)))
  const directReferrals = referralsSnap.docs.map(doc => doc.data())

  const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500]
  let commissions: any[] = []

  // Level 1: direct referrals
  directReferrals.forEach(ref => {
    commissions.push({
      userId,
      amount: commissionAmounts[0],
      type: "referral_bonus",
      description: `Referral bonus for ${ref.referredUserName} (${ref.referredUserId}) at level 1`,
      status: "pending",
      createdAt: ref.joinedAt || ref.createdAt || new Date(),
      sourceUserId: ref.referredUserId,
      level: 1
    })
  })

  // Level 2-6: traverse downlines
  let currentLevelRefs = directReferrals
  for (let level = 2; level <= 6; level++) {
    let nextLevelRefs: any[] = []
    for (const ref of currentLevelRefs) {
      const subRefsSnap = await getDocs(query(collection(db, "referrals"), where("sponsorId", "==", ref.referredUserId)))
      const subRefs = subRefsSnap.docs.map(doc => doc.data())
      subRefs.forEach(subRef => {
        commissions.push({
          userId,
          amount: commissionAmounts[level - 1],
          type: "referral_bonus",
          description: `Referral bonus for ${subRef.referredUserName} (${subRef.referredUserId}) at level ${level}`,
          status: "pending",
          createdAt: subRef.joinedAt || subRef.createdAt || new Date(),
          sourceUserId: subRef.referredUserId,
          level
        })
      })
      nextLevelRefs = nextLevelRefs.concat(subRefs)
    }
    currentLevelRefs = nextLevelRefs
  }

  // Update user's commissions array in users collection
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
  if (!userSnap.empty) {
    const userDoc = userSnap.docs[0]
    await updateDoc(doc(db, "users", userDoc.id), {
      commissions
    })
  }
  return commissions
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
