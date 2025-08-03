import { useState } from "react"
import StockistRegisterPage from "@/app/stockist/register/page"

export default function StockistSection({ userId, user }: { userId: string, user: any }) {
  const [showForm, setShowForm] = useState(false)

  if (!userId) return null

  // If user is already a stockist, show info
  if (user?.stockist) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-green-800 mb-2">You are a Stockist</h2>
        <div className="mb-2">
          <b>Package:</b> {user.stockist.packageName}
        </div>
        <div className="mb-2">
          <b>Products:</b> {user.stockist.products}
        </div>
        <div className="mb-2">
          <b>Status:</b> {user.stockist.status}
        </div>
        <div className="mb-2">
          <b>PIN:</b> {user.stockist.pin}
        </div>
        <div className="mb-2">
          <b>Submitted At:</b> {user.stockist.submittedAt ? new Date(user.stockist.submittedAt).toLocaleString() : ""}
        </div>
      </div>
    )
  }

  // If not a stockist, show button and form
  return (
    <div className="mb-8">
      {!showForm ? (
        <button
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:scale-105 transition"
          onClick={() => setShowForm(true)}
        >
          Become a Stockist
        </button>
      ) : (
        <StockistRegisterPage userId={userId} visible={true} onSuccess={() => setShowForm(false)} />
      )}
    </div>
  )
}
