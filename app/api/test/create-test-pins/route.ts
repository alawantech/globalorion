import { NextResponse } from "next/server"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST() {
  try {
    const testPins = [
      'PIN123456',
      'PIN789012', 
      'PIN345678'
    ]

    const createdPins = []

    for (const pin of testPins) {
      const pinDoc = await addDoc(collection(db, 'pins'), {
        pin,
        status: 'unused',
        assignedTo: null,
        createdAt: Timestamp.now()
      })
      
      createdPins.push({ id: pinDoc.id, pin })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${testPins.length} test PINs`,
      pins: createdPins
    })
  } catch (error) {
    console.error("Error creating PINs:", error)
    return NextResponse.json({ error: "Failed to create PINs" }, { status: 500 })
  }
}
