import { type NextRequest, NextResponse } from "next/server"
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth"
import { doc, setDoc, Timestamp, collection, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateUserId, getUserByUserId, generateCollectionId } from "@/lib/firestore-utils"
import { createReferral, createCommission } from "@/lib/referral-system"

export async function POST(request: NextRequest) {
  let firebaseUser: any = null
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
      // Try to delete user if already created
      if (auth.currentUser) {
        try { await deleteUser(auth.currentUser) } catch {}
      }
      return NextResponse.json({ error: "Sponsor ID does not exist." }, { status: 400 })
    }

    // 3. Check upline exists
    const upline = await getUserByUserId(uplineId.toUpperCase())
    if (!upline) {
      if (auth.currentUser) {
        try { await deleteUser(auth.currentUser) } catch {}
      }
      return NextResponse.json({ error: "Upline ID does not exist." }, { status: 400 })
    }

    // 4. Check PIN is valid and not used (accept "unused" or "sent")
    // Try both "pin" and "code" fields for compatibility
    const pinValue = typeof pin === "string" ? pin.trim().toUpperCase() : ""
    let pinDoc = null
    let pinSnapAll = await getDocs(query(collection(db, "pins"), where("pin", "==", pinValue)))
    if (!pinSnapAll.empty) {
      pinDoc = pinSnapAll.docs[0]
    } else {
      // Try "code" field if "pin" field not found
      const pinSnapCode = await getDocs(query(collection(db, "pins"), where("code", "==", pinValue)))
      if (!pinSnapCode.empty) {
        pinDoc = pinSnapCode.docs[0]
      }
    }
    if (!pinDoc) {
      if (auth.currentUser) {
        try { await deleteUser(auth.currentUser) } catch {}
      }
      return NextResponse.json({ error: "Invalid or already used PIN." }, { status: 400 })
    }
    const pinStatus = pinDoc.data().status

    // Only allow registration if pin is "unused" or "sent"
    if (pinStatus !== "unused" && pinStatus !== "sent") {
      if (auth.currentUser) {
        try { await deleteUser(auth.currentUser) } catch {}
      }
      return NextResponse.json({ error: "PIN is already used. Please use a valid unused PIN." }, { status: 400 })
    }

    // 5. Register user with email and password (this authenticates the user)
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password)
    firebaseUser = userCredential.user

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
      referrals: [],
      commissions: [],
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
    // NEW LOGIC: Sponsor gets Level 1 commission, upline gets Level 2, etc.
    // Level 1: sponsor, Level 2+: traverse up from upline

    // 1. Give Level 1 commission to sponsor
    const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500]
    await createCommission(
      sponsorId.toUpperCase(),
      commissionAmounts[0],
      "referral_bonus",
      `Referral bonus for ${fullName} (${userId}) at level 1`,
      userId,
      1
    )
    // Update sponsor's pendingEarnings and commissions array
    const sponsorUserDocQuery = query(collection(db, "users"), where("userId", "==", sponsorId.toUpperCase()))
    const sponsorUserDocSnap = await getDocs(sponsorUserDocQuery)
    if (!sponsorUserDocSnap.empty) {
      const sponsorUserDoc = sponsorUserDocSnap.docs[0]
      const sponsorUser = sponsorUserDoc.data()
      const prevPending = sponsorUser.pendingEarnings || 0
      const prevCommissions = Array.isArray(sponsorUser.commissions) ? sponsorUser.commissions : []
      await updateDoc(doc(db, "users", sponsorUserDoc.id), {
        pendingEarnings: prevPending + commissionAmounts[0],
        commissions: [
          ...prevCommissions,
          {
            amount: commissionAmounts[0],
            status: "pending",
            level: 1,
            description: `Referral bonus for ${fullName} (${userId}) at level 1`,
            type: "referral_bonus",
            createdAt: Timestamp.now(),
            sourceUserId: userId
          }
        ]
      })
    }

    // 2. Traverse up from upline for Level 2-6 commissions
    let currentUplineId = uplineId.toUpperCase()
    for (let level = 2; level <= 6; level++) {
      if (!currentUplineId) break
      const uplineUserDocQuery = query(collection(db, "users"), where("userId", "==", currentUplineId))
      const uplineUserDocSnap = await getDocs(uplineUserDocQuery)
      if (uplineUserDocSnap.empty) break
      const uplineUserDoc = uplineUserDocSnap.docs[0]
      const uplineUser = uplineUserDoc.data()

      await createCommission(
        currentUplineId,
        commissionAmounts[level - 1],
        "referral_bonus",
        `Referral bonus for ${fullName} (${userId}) at level ${level}`,
        userId,
        level
      )

      const prevPending = uplineUser.pendingEarnings || 0
      const prevCommissions = Array.isArray(uplineUser.commissions) ? uplineUser.commissions : []
      await updateDoc(doc(db, "users", uplineUserDoc.id), {
        pendingEarnings: prevPending + commissionAmounts[level - 1],
        commissions: [
          ...prevCommissions,
          {
            amount: commissionAmounts[level - 1],
            status: "pending",
            level,
            description: `Referral bonus for ${fullName} (${userId}) at level ${level}`,
            type: "referral_bonus",
            createdAt: Timestamp.now(),
            sourceUserId: userId
          }
        ]
      })

      // Move up the matrix
      currentUplineId = uplineUser.uplineId ? uplineUser.uplineId.toUpperCase() : ""
    }

    // For Level 1 only, create referral record for the sponsor and update sponsor's referrals and downlines arrays
    // Fix: Only run this block once, not inside a loop. Remove "if (level === 1)" and always run this after the commission logic.
    {
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

    // Registration successful, redirect to login page
    return NextResponse.json({
      success: true,
      message: "Registration successful! Please login.",
      redirect: "/auth/login"
    })
  } catch (error: any) {
    // If user was created but error happened after, delete the user so email can be reused
    if (auth.currentUser) {
      try { await deleteUser(auth.currentUser) } catch {}
    }
    // ...existing error handling...
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