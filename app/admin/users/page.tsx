"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface User {
  id: string
  name: string
  userId: string
  collectionId: string
  email: string
  location: string
  activationDate?: any // Add activationDate to the User interface
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      const usersSnap = await getDocs(collection(db, "users"))
      const usersList: User[] = usersSnap.docs.map(doc => {
        const d = doc.data()
        return {
          id: doc.id,
          name: d.name || "",
          userId: d.userId || "",
          collectionId: d.collectionId || "",
          email: d.email || "",
          location: d.location || "",
          activationDate: d.activationDate, // Add activationDate to each user
        }
      })
      setUsers(usersList)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Loading users...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">User ID</th>
            <th className="border px-2 py-1">Collection ID</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Location</th>
            <th className="border px-2 py-1">Activation Date</th> {/* New column */}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border px-2 py-1">{u.name}</td>
              <td className="border px-2 py-1">{u.userId}</td>
              <td className="border px-2 py-1">{u.collectionId}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.location}</td>
              <td className="border px-2 py-1">
                {u.activationDate
                  ? (typeof u.activationDate.toDate === "function"
                      ? u.activationDate.toDate().toLocaleString()
                      : typeof u.activationDate === "number"
                        ? new Date(u.activationDate).toLocaleString()
                        : String(u.activationDate))
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
