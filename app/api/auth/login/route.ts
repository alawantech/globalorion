import { type NextRequest, NextResponse } from "next/server"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 User login started...")

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`🔐 Attempting login for: ${email}`)

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password)
    const firebaseUser = userCredential.user

    console.log(`✅ Firebase Auth successful for: ${firebaseUser.email}`)

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

    if (!userDoc.exists()) {
      console.log(`❌ User document not found for uid: ${firebaseUser.uid}`)
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    console.log(`✅ User data found: ${userData.name} (${userData.userId})`)

    // Update last login
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      lastLogin: Timestamp.now(),
    })

    // Log activity
    await addDoc(collection(db, "activity_logs"), {
      userId: userData.userId,
      action: "login",
      description: "User logged in successfully",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      createdAt: Timestamp.now(),
    })

    console.log("✅ User logged in successfully:", userData.email)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: firebaseUser.uid,
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status,
        currentLevel: userData.currentLevel,
        totalEarnings: userData.totalEarnings,
        pendingEarnings: userData.pendingEarnings,
        token: await firebaseUser.getIdToken(), // Firebase JWT token
      },
    })
  } catch (error: any) {
    console.error("❌ Login error:", error)

    let errorMessage = "Login failed. Please try again."

    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMessage = "Invalid email or password."
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many failed attempts. Please try again later."
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Invalid email or password."
    }

    return NextResponse.json({ error: errorMessage }, { status: 401 })
  }
}