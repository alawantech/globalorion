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
    const { fullName, email, phone, password, sponsorId, pin, location } = body

    // 1. Validate required fields (remove uplineId)
    if (!fullName || !email || !phone || !password || !sponsorId || !pin) {
      return NextResponse.json({ error: "All fields, including PIN and sponsor ID, are required." }, { status: 400 })
    }

    // 2. Check sponsor exists
    const sponsor = await getUserByUserId(sponsorId.trim().toUpperCase())
    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor ID does not exist." }, { status: 400 })
    }

    // 3. Check PIN is valid and not used (accept "unused" or "sent")
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

    // 4. Register user with email and password (this authenticates the user)
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password)
    const firebaseUser = userCredential.user
    await updateProfile(firebaseUser, { displayName: fullName })

    // 5. Generate userId (or use your util)
    const userId = await generateUserId()
    const collectionId = generateCollectionId()

    // 6. Save user info in users collection (now authenticated)
    const userData = {
      userId,
      userName: userId,
      name: fullName,
      email: email.toLowerCase(),
      phone,
      location: location || "",
      role: "user",
      sponsorId: sponsorId.toUpperCase(),
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

    // 7. Traverse up to 6 sponsor levels, awarding commissions and updating referrals/downlines
    const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500];
    let currentSponsorId = sponsorId.toUpperCase();
    for (let level = 1; level <= 6; level++) {
      if (!currentSponsorId) break;
      const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentSponsorId)));
      if (sponsorSnap.empty) break;
      const sponsorDoc = sponsorSnap.docs[0];
      const sponsorData = sponsorDoc.data();

      // Award commission for this level
      await createCommission(
        currentSponsorId,
        commissionAmounts[level - 1],
        "referral_bonus",
        `Referral bonus for ${fullName} (${userId}) at level ${level}`,
        userId,
        level,
        currentSponsorId // parentId
      );

      // Update sponsor's commissions and pending earnings
      const prevPending = sponsorData.pendingEarnings || 0;
      const prevCommissions = Array.isArray(sponsorData.commissions) ? sponsorData.commissions : [];
      await updateDoc(doc(db, "users", sponsorDoc.id), {
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
            sourceUserId: userId,
            parentId: currentSponsorId
          }
        ]
      });

      // For level 1 only: add new user as direct referral and downline
      if (level === 1) {
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
        await updateDoc(doc(db, "users", sponsorDoc.id), {
          downlines: newDownlines,
          referrals: newReferrals
        });
        // Create referral record in "referrals" collection
        await createReferral({
          sponsorId: currentSponsorId,
          referredUserId: userId,
          referredUserName: fullName,
          referredUserEmail: email.toLowerCase(),
          level: 1
        });
      }

      // Move up to next sponsor for next level
      currentSponsorId = sponsorData.sponsorId ? sponsorData.sponsorId.toUpperCase() : "";
    }

    // 8. Mark PIN as used (only after all checks and successful registration)
    await updateDoc(doc(db, "pins", pinDoc.id), {
      status: "used",
      usedBy: userId,
      usedAt: Timestamp.now(),
    })

    // 9. Add Matrix Node (place under direct sponsor)
    await addDoc(collection(db, "matrix"), {
      userId,
      parentId: sponsorId.toUpperCase(),
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