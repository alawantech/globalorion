"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, pin }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Redirect to dashboard after successful registration
        router.replace("/user/dashboard")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch {
      setError("Registration failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="bg-white p-8 rounded shadow max-w-md w-full" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Register</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">PIN (optional)</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter PIN or leave blank"
          />
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  )
}
