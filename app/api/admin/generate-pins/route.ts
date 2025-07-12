import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

// Helper to generate a random PIN code (alphanumeric, 8 chars)
function generatePinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(req: NextRequest) {
  try {
    const { count } = await req.json()
    const n = Math.max(1, Math.min(Number(count) || 1, 100))
    let generated = 0
    for (let i = 0; i < n; i++) {
      await addDoc(collection(db, "pins"), {
        code: generatePinCode(),
        status: "unused",
        createdAt: new Date(),
      })
      generated++
    }
    return NextResponse.json({ success: true, generated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PINs" }, { status: 500 })
  }
}