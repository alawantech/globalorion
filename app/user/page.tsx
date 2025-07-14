// This file enables your dashboard to be rendered as a page in the Next.js App Router.

"use client"

import { useEffect, useState } from "react"
import UserDashboard from "./dashboard"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore"

export default function Page() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUserId(null)
        setError("You are not logged in.")
        setLoading(false)
        return
      }
      console.log("Firebase UID:", firebaseUser.uid)
      console.log("Firebase Email:", firebaseUser.email)

      // List all user doc IDs for debugging
      try {
        const allUsersSnap = await getDocs(collection(db, "users"))
        const allIds = allUsersSnap.docs.map(doc => doc.id)
        console.log("All user doc IDs in Firestore:", allIds)
      } catch (e) {
        console.log("Could not list all user doc IDs:", e)
      }

      // Try by UID (doc ID)
      let userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        console.log("Found user by UID doc ID:", data)
        setUserId(data.userId || firebaseUser.uid)
        setLoading(false)
        return
      }

      // Try by userId as doc ID (if your doc IDs are userId)
      if (firebaseUser.displayName) {
        const userDocByUserId = await getDoc(doc(db, "users", firebaseUser.displayName))
        if (userDocByUserId.exists()) {
          const data = userDocByUserId.data()
          console.log("Found user by userId as doc ID (displayName):", data)
          setUserId(data.userId)
          setLoading(false)
          return
        }
      }

      // Try by userId field
      const q1 = query(collection(db, "users"), where("userId", "==", firebaseUser.uid))
      const snap1 = await getDocs(q1)
      if (!snap1.empty) {
        console.log("Found user by userId field:", snap1.docs[0].data())
        setUserId(snap1.docs[0].data().userId)
        setLoading(false)
        return
      }

      // Try by email
      const q2 = query(collection(db, "users"), where("email", "==", firebaseUser.email))
      const snap2 = await getDocs(q2)
      if (!snap2.empty) {
        console.log("Found user by email field:", snap2.docs[0].data())
        setUserId(snap2.docs[0].data().userId)
        setLoading(false)
        return
      }

      setError(
        "No user found for your account. (UID: " +
          firebaseUser.uid +
          ", Email: " +
          firebaseUser.email +
          ")"
      )
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>
  if (error || !userId) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "No user found."}</div>
  return <UserDashboard userId={userId} />
}
