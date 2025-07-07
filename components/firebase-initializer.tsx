"use client"

import { useEffect } from "react"
import { initializeFirestore } from "@/lib/firebase"

export default function FirebaseInitializer() {
  useEffect(() => {
    // Initialize Firestore collections when app starts
    initializeFirestore()
  }, [])

  // This component doesn't render anything visible
  return null
}
