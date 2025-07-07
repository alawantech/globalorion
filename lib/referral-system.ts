import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
    
    console.log("✅ Referral record created successfully")
    return true
  } catch (error) {
    console.error("❌ Error creating referral:", error)
    return false
  }
}

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
