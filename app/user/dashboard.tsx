"use client"

import { useState } from "react"
import { Menu, LogOut, User, Users, TrendingUp, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserDashboard({ userStats }: { userStats: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showWithdrawal, setShowWithdrawal] = useState(false)
  const [bankName, setBankName] = useState(userStats?.bankName || "")
  const [accountNumber, setAccountNumber] = useState(userStats?.accountNumber || "")
  const [accountName, setAccountName] = useState(userStats?.accountName || "")
  const [amount, setAmount] = useState("")
  const [withdrawMsg, setWithdrawMsg] = useState("")
  const [savingBank, setSavingBank] = useState(false)
  const [bankSaved, setBankSaved] = useState(false)

  // Save bank details to backend
  const handleSaveBankDetails = async () => {
    setSavingBank(true)
    setWithdrawMsg("")
    if (!bankName || !accountNumber || !accountName) {
      setWithdrawMsg("All bank fields are required")
      setSavingBank(false)
      return
    }
    // Save bank details to user profile
    const res = await fetch("/api/user/update-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userStats.memberId || userStats.userId,
        bankName,
        accountNumber,
        accountName
      })
    })
    const data = await res.json()
    if (data.success) {
      setBankSaved(true)
      setWithdrawMsg("Bank details saved!")
    } else {
      setWithdrawMsg(data.error || "Failed to save bank details")
    }
    setSavingBank(false)
  }

  // Request withdrawal
  const handleWithdrawal = async () => {
    setWithdrawMsg("")
    if (!amount || !bankName || !accountNumber || !accountName) {
      setWithdrawMsg("All fields are required")
      return
    }
    if (Number(amount) < 5000) {
      setWithdrawMsg("Minimum withdrawal amount is ₦5,000")
      return
    }
    const res = await fetch("/api/user/withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userStats.memberId || userStats.userId,
        amount: Number(amount),
        bankName,
        accountNumber,
        accountName
      })
    })
    const data = await res.json()
    if (data.success) {
      setWithdrawMsg("Withdrawal request submitted!")
      setShowWithdrawal(false)
    } else {
      setWithdrawMsg(data.error || "Failed to request withdrawal")
    }
  }

  // Fix: Always reset modal state and show modal on click
  const handleOpenWithdrawal = () => {
    setBankSaved(!!(userStats?.bankName && userStats?.accountNumber && userStats?.accountName))
    setBankName(userStats?.bankName || "")
    setAccountNumber(userStats?.accountNumber || "")
    setAccountName(userStats?.accountName || "")
    setAmount("")
    setWithdrawMsg("")
    setShowWithdrawal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <span className="text-xl font-bold text-gray-900">User Dashboard</span>
          </div>
          <Button variant="outline" className="hidden md:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            <Button variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            {/* Add more mobile quick actions here if needed */}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        {/* Account Information Section */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">Full Name</span>
              <div>{userStats?.name}</div>
            </div>
            <div>
              <span className="font-semibold">Member ID</span>
              <div>{userStats?.memberId || userStats?.userId}</div>
            </div>
            <div>
              <span className="font-semibold">Email</span>
              <div>{userStats?.email}</div>
            </div>
            {userStats?.collectionId && (
              <div>
                <span className="font-semibold">Collection ID</span>
                <div>{userStats.collectionId}</div>
              </div>
            )}
            <div>
              <span className="font-semibold">Phone</span>
              <div>{userStats?.phone}</div>
            </div>
            <div>
              <span className="font-semibold">Status</span>
              <div>{userStats?.status}</div>
            </div>
            <div>
              <span className="font-semibold">Activation Date</span>
              <div>
                {userStats?.activationDate?.toDate
                  ? userStats.activationDate.toDate().toLocaleDateString()
                  : userStats?.activationDate || "Invalid Date"}
              </div>
            </div>
            <div>
              <span className="font-semibold">Sponsor ID</span>
              <div>{userStats?.sponsorId}</div>
            </div>
            <div>
              <span className="font-semibold">Upline ID</span>
              <div>{userStats?.uplineId}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mb-1" />
            <div className="text-lg font-bold text-blue-900">₦{userStats?.totalEarnings ?? 0}</div>
            <div className="text-xs text-gray-600">Total Earnings</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <CreditCard className="h-6 w-6 text-green-600 mb-1" />
            <div className="text-lg font-bold text-green-900">₦{userStats?.availableBalance ?? 0}</div>
            <div className="text-xs text-gray-600">Available Balance</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 flex flex-col items-center">
            <Users className="h-6 w-6 text-orange-600 mb-1" />
            <div className="text-lg font-bold text-orange-900">{userStats?.totalReferrals ?? 0}</div>
            <div className="text-xs text-gray-600">Direct Referrals</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
            <TrendingUp className="h-6 w-6 text-yellow-600 mb-1" />
            <div className="text-lg font-bold text-yellow-900">₦{userStats?.pendingEarnings ?? 0}</div>
            <div className="text-xs text-gray-600">Pending Earnings</div>
          </div>
        </div>

        {/* Referrals Table - always show, even if empty */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-semibold mb-2 text-gray-900">Your Referrals</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Joined</th>
                  <th className="py-2 pr-4">Level</th>
                </tr>
              </thead>
              <tbody>
                {userStats?.referrals && userStats.referrals.length > 0 ? (
                  userStats.referrals.map((ref: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4">{ref.referredUserName}</td>
                      <td className="py-2 pr-4">{ref.referredUserEmail}</td>
                      <td className="py-2 pr-4">{ref.joinedAt?.toDate?.().toLocaleDateString?.() || ""}</td>
                      <td className="py-2 pr-4">{ref.level}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2 pr-4 text-gray-400" colSpan={4}>No referrals yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commissions Table */}
        {userStats?.commissions && userStats.commissions.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="font-semibold mb-2 text-gray-900">Commission History</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Note</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.commissions.map((c: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4">₦{c.amount}</td>
                      <td className="py-2 pr-4 capitalize">{c.status}</td>
                      <td className="py-2 pr-4">{c.note || c.description}</td>
                      <td className="py-2 pr-4">{c.createdAt?.toDate?.().toLocaleDateString?.() || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Table */}
        {userStats?.withdrawals && userStats.withdrawals.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="font-semibold mb-2 text-gray-900">Withdrawal Requests</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Bank</th>
                    <th className="py-2 pr-4">Account No</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.withdrawals.map((w: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4">₦{w.amount}</td>
                      <td className="py-2 pr-4">{w.bankName}</td>
                      <td className="py-2 pr-4">{w.accountNumber}</td>
                      <td className="py-2 pr-4 capitalize">{w.status}</td>
                      <td className="py-2 pr-4">{w.requestedAt?.toDate?.().toLocaleDateString?.() || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button className="w-full sm:w-auto" variant="outline">
            Refer New Member
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={handleOpenWithdrawal}
            type="button"
          >
            Request Withdrawal
          </Button>
          <Button className="w-full sm:w-auto" variant="outline">
            View Commission History
          </Button>
          <Button className="w-full sm:w-auto" variant="outline">
            Update Profile
          </Button>
        </div>

        {/* Withdrawal Request Modal/Section */}
        {showWithdrawal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setShowWithdrawal(false)}
                aria-label="Close"
                type="button"
              >
                ×
              </button>
              <h3 className="font-bold mb-2">Request Withdrawal</h3>
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                placeholder="Bank Name"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                disabled={savingBank}
              />
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                placeholder="Account Number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                disabled={savingBank}
              />
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                placeholder="Account Name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                disabled={savingBank}
              />
              {!bankSaved ? (
                <Button className="w-full mb-2" onClick={handleSaveBankDetails} disabled={savingBank} type="button">
                  {savingBank ? "Saving..." : "Save Bank Details"}
                </Button>
              ) : (
                <>
                  <input
                    className="border rounded px-2 py-1 w-full mb-2"
                    placeholder="Amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                  <Button className="w-full mb-2" onClick={handleWithdrawal} type="button">
                    Submit Withdrawal Request
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full" onClick={() => setShowWithdrawal(false)} type="button">
                Cancel
              </Button>
              {withdrawMsg && <div className="text-xs text-red-600 mt-2">{withdrawMsg}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}