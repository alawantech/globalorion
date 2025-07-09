import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
export async function createCommission(userId: string, amount: number, type: string, description: string) {
  try {
    console.log("💰 Creating commission record...")
    
    await addDoc(collection(db, "commissions"), {
      userId,
      amount,
      type,
      description,
      status: "pending",
      createdAt: Timestamp.now()
    })
    
    console.log("✅ Commission record created successfully")
    return true
  } catch (error) {
    console.error("❌ Error creating commission:", error)
    return false
  }
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
