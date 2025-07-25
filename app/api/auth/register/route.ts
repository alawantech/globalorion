import { type NextRequest, NextResponse } from "next/server"
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth"
import { doc, setDoc, Timestamp, collection, query, where, getDocs, updateDoc, addDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateUserId, getUserByUserId, generateCollectionId } from "@/lib/firestore-utils"
import { createReferral, createCommission } from "@/lib/referral-system"

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const body = await request.json();
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location } = body

    // 1. Validate required fields
    if (!fullName || !email || !phone || !password || !sponsorId || !uplineId || !pin) {
      return NextResponse.json({ error: "All fields, including PIN, sponsor ID, and upline ID, are required." }, { status: 400 })
    }

    // 2. Check sponsor exists
    const sponsor = await getUserByUserId(sponsorId.trim().toUpperCase())
    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor ID does not exist." }, { status: 400 })
    }

    // 3. Check upline exists
    const upline = await getUserByUserId(uplineId.toUpperCase())
    if (!upline) {
      return NextResponse.json({ error: "Upline ID does not exist." }, { status: 400 })
    }

    // 4. Check PIN is valid and not used (accept "unused" or "sent")
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
      return NextResponse.json({ error: "Invalid or already used PIN." }, { status: 400 })
    }
    const pinStatus = pinDoc.data().status
    if (pinStatus !== "unused" && pinStatus !== "sent") {
      return NextResponse.json({ error: "PIN is already used. Please use a valid unused PIN." }, { status: 400 })
    }

    // 5. Register user with email and password (this authenticates the user)
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password)
    const firebaseUser = userCredential.user
    await updateProfile(firebaseUser, { displayName: fullName })

    // 6. Generate userId (or use your util)
    const userId = await generateUserId()
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

    // Commission amounts per level
    const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500];

    // Helper to update commissions and pending earnings
    async function addCommissionToUser(userDocSnap: any, amount: number, level: number, description: string, sourceUserId: string) {
      const userDoc = userDocSnap.docs[0];
      const userData = userDoc.data();
      const prevPending = userData.pendingEarnings || 0;
      const prevCommissions = Array.isArray(userData.commissions) ? userData.commissions : [];
      await updateDoc(doc(db, "users", userDoc.id), {
        pendingEarnings: prevPending + amount,
        commissions: [
          ...prevCommissions,
          {
            amount,
            status: "pending",
            level,
            description,
            type: "referral_bonus",
            createdAt: Timestamp.now(),
            sourceUserId,
            parentId: userDoc.data().userId // <-- Add parentId (receiver)
          }
        ]
      });
    }

    // Level 1: Sponsor (always gets paid when a new user joins, if not offline)
    const sponsorUserDocSnap = await getDocs(query(collection(db, "users"), where("userId", "==", sponsorId.toUpperCase())));
    if (!sponsorUserDocSnap.empty) {
      const sponsorUser = sponsorUserDocSnap.docs[0].data();
      if (sponsorUser.status !== "offline") {
        await createCommission(
          sponsorId.toUpperCase(),
          commissionAmounts[0],
          "referral_bonus",
          `Referral bonus for ${fullName} (${userId}) at level 1`,
          userId,
          1,
          sponsorId.toUpperCase() // <-- Add parentId
        );
        await addCommissionToUser(
          sponsorUserDocSnap,
          commissionAmounts[0],
          1,
          `Referral bonus for ${fullName} (${userId}) at level 1`,
          userId
        );
      }
    }

    // Level 2-6: Only pay commission if the new user is at the correct level in the upline's matrix and upline is not offline
    let currentUplineId = uplineId.toUpperCase();
    for (let level = 2; level <= 6; level++) {
      if (!currentUplineId) break;
      // Prevent double commission if sponsor and upline are the same for this referral
      if (currentUplineId === sponsorId.toUpperCase() && level === 2) {
        const uplineUserDocSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentUplineId)));
        const uplineUser = uplineUserDocSnap.docs[0]?.data();
        currentUplineId = uplineUser?.uplineId ? uplineUser.uplineId.toUpperCase() : "";
        continue;
      }
      const uplineUserDocSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentUplineId)));
      if (uplineUserDocSnap.empty) break;
      const uplineUser = uplineUserDocSnap.docs[0].data();
      if (uplineUser.status === "offline") {
        currentUplineId = uplineUser.uplineId ? uplineUser.uplineId.toUpperCase() : "";
        continue;
      }

      // Check if the new user is at the correct depth in the upline's matrix
      let ancestorId = userId;
      let found = false;
      for (let l = 1; l < level; l++) {
        const ancestorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", ancestorId)));
        if (ancestorSnap.empty) break;
        const ancestor = ancestorSnap.docs[0].data();
        ancestorId = ancestor.sponsorId;
        if (!ancestorId) break;
        if (ancestorId === currentUplineId && l === level - 1) {
          found = true;
          break;
        }
      }
      if (found) {
        await createCommission(
          currentUplineId,
          commissionAmounts[level - 1],
          "referral_bonus",
          `Referral bonus for ${fullName} (${userId}) at level ${level}`,
          userId,
          level,
          currentUplineId // <-- Add parentId
        );
        await addCommissionToUser(
          uplineUserDocSnap,
          commissionAmounts[level - 1],
          level,
          `Referral bonus for ${fullName} (${userId}) at level ${level}`,
          userId
        );
      }
      // Move up the matrix
      currentUplineId = uplineUser.uplineId ? uplineUser.uplineId.toUpperCase() : "";
    }

    // Level 1 only: create referral record and update sponsor's referrals and downlines
    if (!sponsorUserDocSnap.empty) {
      await createReferral({
        sponsorId: sponsorId.toUpperCase(),
        referredUserId: userId,
        referredUserName: fullName,
        referredUserEmail: email.toLowerCase(),
        level: 1
      });

      const sponsorUserDoc = sponsorUserDocSnap.docs[0];
      const sponsorData = sponsorUserDoc.data();
      const prevDownlines = sponsorData.downlines || [];
      const prevReferrals = sponsorData.referrals || [];

      // Add to downlines if not present
      const newDownlines = prevDownlines.includes(userId) ? prevDownlines : [...prevDownlines, userId];

      // Add to referrals if not present
      const alreadyReferral = prevReferrals.some((r: any) => r.referredUserId === userId);
      const newReferrals = alreadyReferral
        ? prevReferrals
        : [
            ...prevReferrals,
            {
              referredUserId: userId,
              referredUserName: fullName,
              referredUserEmail: email.toLowerCase(),
              level: 1,
              joinedAt: Timestamp.now(),
              status: "active"
            }
          ];

      await updateDoc(doc(db, "users", sponsorUserDoc.id), {
        downlines: newDownlines,
        referrals: newReferrals
      });
    }

    // 10. Add Matrix Node
    await addDoc(collection(db, "matrix"), {
      userId,
      parentId: uplineId.toUpperCase(),
      level: 1,
      position: 0,
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
    // Do NOT call deleteUser(auth.currentUser) here!
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