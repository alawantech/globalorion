import { type NextRequest, NextResponse } from "next/server"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, Timestamp, collection, query, where, getDocs, addDoc, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateUserId, getUserByUserId, validatePin, usePin } from "@/lib/firestore-utils"
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
    
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location, pinMethod } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !sponsorId || !uplineId) {
      console.log("❌ Missing required fields");
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    // Test Firebase connection first
    try {
      console.log("🔗 Testing Firebase connection...");
      const testQuery = query(collection(db, "users"), limit(1));
      const testSnapshot = await getDocs(testQuery);
      console.log(`✅ Firebase connected - found ${testSnapshot.docs.length} users total`);
    } catch (firebaseError) {
      console.error("❌ Firebase connection failed:", firebaseError);
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Check if email already exists
    const existingUserQuery = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
    const existingUserSnapshot = await getDocs(existingUserQuery);

    if (!existingUserSnapshot.empty) {
      console.log("❌ Email already registered");
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Optional sponsor validation (warn but don't fail)
    console.log(`🔍 Checking sponsor: "${sponsorId}"`);
    const sponsor = await getUserByUserId(sponsorId.toUpperCase());
    if (!sponsor) {
      console.log(`⚠️ Warning: Sponsor "${sponsorId}" not found, but proceeding anyway`);
    } else {
      console.log(`✅ Sponsor found: ${sponsor.name}`);
    }

    // Optional upline validation (warn but don't fail)  
    console.log(`🔍 Checking upline: "${uplineId}"`);
    const upline = await getUserByUserId(uplineId.toUpperCase());
    if (!upline) {
      console.log(`⚠️ Warning: Upline "${uplineId}" not found, but proceeding anyway`);
    } else {
      console.log(`✅ Upline found: ${upline.name}`);
    }

    // Generate unique user ID first (before PIN validation)
    const userId = await generateUserId();

    // Optional PIN validation (warn but don't fail)
    if (pinMethod === "existing" && pin) {
      console.log(`🔍 Checking PIN: "${pin}"`);
      const isPinValid = await validatePin(pin);
      if (!isPinValid) {
        console.log(`⚠️ Warning: PIN "${pin}" is invalid or used, but proceeding anyway`);
      } else {
        console.log(`✅ PIN is valid`);
        // Mark PIN as used
        await usePin(pin, userId);
      }
    }

    // Create Firebase Auth user
    console.log("🔐 Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
    const firebaseUser = userCredential.user;

    // Update user profile
    await updateProfile(firebaseUser, {
      displayName: fullName,
    });

    console.log("📄 Creating user document in Firestore...");

    // Create user document based on PIN method
    if (pinMethod === "existing") {
      // User has PIN - activate immediately (regardless of PIN validity)
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
        createdAt: Timestamp.now(),
        activationDate: Timestamp.now()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // Create referral record if sponsor exists
      if (sponsor) {
        await createReferral({
          sponsorId: sponsorId.toUpperCase(),
          referredUserId: userId,
          referredUserName: fullName,
          referredUserEmail: email.toLowerCase(),
          level: 1
        })

        // Create commission for sponsor
        await createCommission(
          sponsorId.toUpperCase(),
          4000, // First level commission
          "referral_bonus",
          `Referral bonus for ${fullName} (${userId})`
        )
      }

      // Create welcome notification
      await addDoc(collection(db, "notifications"), {
        userId,
        title: "Welcome to Bright Orion",
        message: "Your account has been successfully activated! Start referring people to earn commissions.",
        type: "system",
        isRead: false,
        createdAt: Timestamp.now()
      });

      console.log("✅ User registered and activated:", userData.email);

      return NextResponse.json({
        success: true,
        message: "Registration successful! You can now login.",
        user: {
          uid: firebaseUser.uid,
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          status: userData.status,
          role: userData.role,
          pinMethod,
        },
      });
    } else {
      // User needs to buy package - create pending account
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
        status: "pending",
        currentLevel: 1,
        totalEarnings: 0,
        pendingEarnings: 0,
        downlines: [],
        createdAt: Timestamp.now(),
        activationDate: null
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      console.log("✅ User registered (pending PIN purchase):", userData.email);

      return NextResponse.json({
        success: true,
        message: "Registration successful! Please purchase your PIN to activate your account.",
        user: {
          uid: firebaseUser.uid,
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          status: userData.status,
          role: userData.role,
          packagePrice: 36000,
          pinMethod,
          fullName,
        },
      });
    }
  } catch (error: any) {
    console.error("❌ Registration error:", error)

    let errorMessage = "Registration failed. Please try again."

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please use a different email or try logging in."
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please use a stronger password."
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address. Please enter a valid email."
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}