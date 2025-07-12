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
      collectionId,
      referrals: [],      // <-- Always create empty array for new user
      commissions: [],    // <-- Always create empty array for new user
      createdAt: Timestamp.now(),
      activationDate: Timestamp.now()
    }
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
      // Always get the Firestore doc for the upline user (by userId)
      const uplineUserDocQuery = query(collection(db, "users"), where("userId", "==", currentUplineId))
      const uplineUserDocSnap = await getDocs(uplineUserDocQuery)
      if (uplineUserDocSnap.empty) break
      const uplineUserDoc = uplineUserDocSnap.docs[0]
      const uplineUser = uplineUserDoc.data()

      // Commission amounts per level (adjust as needed)
      const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500]
      const commissionAmount = commissionAmounts[level - 1] || 0

      // Create commission for this upline (userId is upline's userId, sourceUserId is new user's userId)
      await createCommission(
        currentUplineId,
        commissionAmount,
        "referral_bonus",
        `Referral bonus for ${fullName} (${userId}) at level ${level}`,
        userId, // Pass sourceUserId for tracking
        level
      )

      // Increment upline's pendingEarnings by commissionAmount and update commissions array
      const prevPending = uplineUser.pendingEarnings || 0
      const prevCommissions = Array.isArray(uplineUser.commissions) ? uplineUser.commissions : []
      await updateDoc(doc(db, "users", uplineUserDoc.id), {
        pendingEarnings: prevPending + commissionAmount,
        commissions: [
          ...prevCommissions,
          {
            amount: commissionAmount,
            status: "pending",
            level,
            description: `Referral bonus for ${fullName} (${userId}) at level ${level}`,
            type: "referral_bonus",
            createdAt: Timestamp.now(),
            sourceUserId: userId
          }
        ]
      })

      // For Level 1 only, create referral record for the sponsor and update sponsor's referrals and downlines arrays
      if (level === 1) {
        const sponsorUserDocQuery = query(collection(db, "users"), where("userId", "==", sponsorId.toUpperCase()))
        const sponsorUserDocSnap = await getDocs(sponsorUserDocQuery)
        if (!sponsorUserDocSnap.empty) {
          await createReferral({
            sponsorId: sponsorId.toUpperCase(),
            referredUserId: userId,
            referredUserName: fullName,
            referredUserEmail: email.toLowerCase(),
            level: 1
          })
          // Add to sponsor's downlines and referrals arrays if not already present
          const sponsorUserDoc = sponsorUserDocSnap.docs[0]
          const prevDownlines = sponsorUserDoc.data().downlines || []
          const prevReferrals = sponsorUserDoc.data().referrals || []

          // Add to downlines if not present
          let updateObj: any = {}
          if (!prevDownlines.includes(userId)) {
            updateObj.downlines = [...prevDownlines, userId]
          } else {
            updateObj.downlines = prevDownlines
          }

          // Add to referrals if not present
          const alreadyReferral = prevReferrals.some(
            (r: any) => r.referredUserId === userId
          )
          if (!alreadyReferral) {
            updateObj.referrals = [
              ...prevReferrals,
              {
                referredUserId: userId,
                referredUserName: fullName,
                referredUserEmail: email.toLowerCase(),
                level: 1,
                joinedAt: Timestamp.now(),
                status: "active"
              }
            ]
          } else {
            updateObj.referrals = prevReferrals
          }

          await updateDoc(doc(db, "users", sponsorUserDoc.id), updateObj)
        }
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