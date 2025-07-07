"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function RedirectTest() {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog("🔥 RedirectTest component mounted")
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      addLog(`🔥 Auth state: ${user ? user.email : 'No user'}`)
      setAuthUser(user)
    })

    return () => {
      addLog("🧹 Cleanup auth listener")
      unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Redirect Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {authUser ? authUser.email : 'Not logged in'}</p>
            <p><strong>UID:</strong> {authUser ? authUser.uid : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Navigation Buttons</h2>
          <div className="space-y-2">
            <button 
              onClick={() => {
                addLog("📍 Navigating to /dashboard")
                window.location.href = "/dashboard"
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Go to Dashboard (window.location.href)
            </button>
            <button 
              onClick={() => {
                addLog("📍 Navigating to /auth/login")
                window.location.href = "/auth/login"
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-700 mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
