"use client"

import { useState } from "react"
import { Menu, LogOut, User, Users, TrendingUp, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserDashboard({ userStats }: { userStats: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-lg">{userStats?.name || "User"}</span>
            </div>
            {/* Member ID and Collection ID shown together */}
            <div className="text-xs text-gray-500">
              Member ID: <span className="font-mono">{userStats?.memberId}</span>
              {userStats?.collectionId && (
                <>
                  <br />
                  Collection ID: <span className="font-mono">{userStats.collectionId}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: <span className="capitalize">{userStats?.status}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <div>Email: <span className="font-mono">{userStats?.email}</span></div>
            <div>Phone: <span className="font-mono">{userStats?.phone}</span></div>
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

        {/* Referrals Table */}
        {userStats?.referrals && userStats.referrals.length > 0 && (
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
                  {userStats.referrals.map((ref: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4">{ref.referredUserName}</td>
                      <td className="py-2 pr-4">{ref.referredUserEmail}</td>
                      <td className="py-2 pr-4">{ref.joinedAt?.toDate?.().toLocaleDateString?.() || ""}</td>
                      <td className="py-2 pr-4">{ref.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button className="w-full sm:w-auto" variant="outline">
            Refer New Member
          </Button>
          <Button className="w-full sm:w-auto" variant="outline">
            Request Withdrawal
          </Button>
          <Button className="w-full sm:w-auto" variant="outline">
            View Commission History
          </Button>
          <Button className="w-full sm:w-auto" variant="outline">
            Update Profile
          </Button>
        </div>
      </main>
    </div>
  )
}