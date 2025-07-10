import { type NextRequest, NextResponse } from "next/server"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, Timestamp, collection, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateUserId, getUserByUserId, generateCollectionId } from "@/lib/firestore-utils"
import { createReferral, createCommission } from "@/lib/referral-system"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Registration API called");
    
    const body = await request.json();
    console.log("📦 Request body received:", {
      fullName: body.fullName,
      email: body.email,
      sponsorId: body.sponsorId,
      uplineId: body.uplineId,
      pinMethod: body.pinMethod
    });
    
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location } = body

    // 1. Validate required fields
    if (!fullName || !email || !phone || !password || !sponsorId || !uplineId || !pin) {
      return NextResponse.json({ error: "All fields, including PIN, sponsor ID, and upline ID, are required." }, { status: 400 })
    }

    // 2. Check sponsor exists
    const sponsor = await getUserByUserId(sponsorId.toUpperCase())
    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor ID does not exist." }, { status: 400 })
    }

    // 3. Check upline exists
    const upline = await getUserByUserId(uplineId.toUpperCase())
    if (!upline) {
      return NextResponse.json({ error: "Upline ID does not exist." }, { status: 400 })
    }

    // 4. Check PIN is valid and unused
    const pinQuery = query(collection(db, "pins"), where("pin", "==", pin), where("status", "==", "unused"))
    const pinSnap = await getDocs(pinQuery)
    if (pinSnap.empty) {
      return NextResponse.json({ error: "Invalid or already used PIN." }, { status: 400 })
    }
    const pinDoc = pinSnap.docs[0]

    // 5. Register user with email and password (this authenticates the user)
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName: fullName })

    // 6. Generate userId (or use your util)
    const userId = await generateUserId()
    // Generate a unique collectionId for product collection using the shared util
    const collectionId = generateCollectionId()

    // 7. Save user info in users collection (now authenticated)
    const userData = {
      userId,
      userName: userId,
      name: fullName,
      email: email.toLowerCase(),
      phone,
      location: location || "",
      role: "user",
      sponsorId: sponsorId.toUpperCase(),
      uplineId: uplineId.toUpperCase(),
      status: "active",
      currentLevel: 1,
      totalEarnings: 0,
      pendingEarnings: 0,
      downlines: [],
      collectionId, // <-- always set for new users
      createdAt: Timestamp.now(),
      activationDate: Timestamp.now()
    }
    console.log("Generated collectionId for user:", collectionId) // <-- log collectionId
    await setDoc(doc(db, "users", firebaseUser.uid), userData)

    // 8. Mark PIN as used
    await updateDoc(doc(db, "pins", pinDoc.id), {
      status: "used",
      usedBy: userId,
      usedAt: Timestamp.now(),
    })

    // --- 9. 6-Level Matrix Referral & Commission Logic ---
    let currentUplineId = uplineId.toUpperCase()
    for (let level = 1; level <= 6; level++) {
      if (!currentUplineId) break
      const uplineUser = await getUserByUserId(currentUplineId)
      if (!uplineUser) break

      // Commission amounts per level (adjust as needed)
      const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500]
      const commissionAmount = commissionAmounts[level - 1] || 0

      // Create commission for this upline
      await createCommission(
        currentUplineId,
        commissionAmount,
        "referral_bonus",
        `Referral bonus for ${fullName} (${userId}) at level ${level}`
      )

      // For Level 1 only, create referral record for the sponsor
      if (level === 1) {
        await createReferral({
          sponsorId: sponsorId.toUpperCase(), // Always the sponsor, not the upline
          referredUserId: userId,
          referredUserName: fullName,
          referredUserEmail: email.toLowerCase(),
          level: 1
        })
      }

      // Move up the matrix
      currentUplineId = uplineUser.uplineId ? uplineUser.uplineId.toUpperCase() : ""
    }

    // 10. Add Matrix Node
    await addDoc(collection(db, "matrix"), {
      userId,
      parentId: uplineId.toUpperCase(), // or sponsorId if you want
      level: 1,
      position: 0, // set as needed
      leftChild: "",
      rightChild: "",
      isComplete: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful! You can now login.",
      user: {
        uid: firebaseUser.uid,
        userId: userData.userId,
        collectionId: userData.collectionId, // <-- returned to frontend
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        status: userData.status,
        role: userData.role,
        // Optionally add a hint for frontend redirection
        redirect: "/dashboard"
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    let errorMessage = "Registration failed. Please try again."
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please use a different email or try logging in."
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please use a stronger password."
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address. Please enter a valid email."
    } else if (typeof error.message === "string") {
      errorMessage = error.message
    }
    return NextResponse.json({ error: errorMessage, details: String(error) }, { status: 500 })
  }
}