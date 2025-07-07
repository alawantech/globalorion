import { NextResponse } from "next/server"
import { doc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST() {
  try {
    // Create admin user
    await setDoc(doc(db, 'users', 'admin'), {
      userId: 'admin002',
      userName: 'admin002',
      name: 'System Administrator',
      email: 'admin@brightorian.com',
      phone: '08100681294',
      location: 'Admin Office',
      role: 'admin',
      sponsorId: '',
      uplineId: '',
      status: 'active',
      currentLevel: 1,
      totalEarnings: 0,
      pendingEarnings: 0,
      downlines: [],
      createdAt: Timestamp.now(),
      activationDate: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully with userId: admin002"
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
