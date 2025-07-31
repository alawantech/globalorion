"use client"

import { Fragment, useEffect, useState, useRef } from "react"
import { Menu, LogOut, User, BarChart3, Settings, Users, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateMatrixRequirements } from "@/lib/matrix-calculator"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { doc, getDoc, query, collection, where, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { fixReferralLink, fixReferralForUser } from "@/lib/referral-system"

// Add this helper component at the top (after imports):
function SimpleModal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

// Remove the logic that resets requestedWithdrawals and moves "requested" commissions back to "pending" on reload
// Replace fetchCurrentUserDoc with a simple fetch (no cleanup)

async function fetchCurrentUserDoc(firebaseUid: string) {
  // Try userId field first
  let userData: any = null
  let userDocId: string | null = null
  let q = query(collection(db, "users"), where("userId", "==", firebaseUid))
  let snap = await getDocs(q)
  if (!snap.empty) {
    userData = snap.docs[0].data()
    userDocId = snap.docs[0].id
  }
  if (!userData) {
    const q2 = query(collection(db, "users"), where("firebaseUid", "==", firebaseUid))
    const snap2 = await getDocs(q2)
    if (!snap2.empty) {
      userData = snap2.docs[0].data()
      userDocId = snap2.docs[0].id
    }
  }
  if (!userData) {
    const docSnap = await getDoc(doc(db, "users", firebaseUid))
    if (docSnap.exists()) {
      userData = docSnap.data()
      userDocId = docSnap.id
    }
  }
  if (!userData || !userDocId) return null

  // No cleanup: just return userData as is
  return userData
}

export default function UserDashboard({ userId }: { userId: string }) {
  // User and dashboard state
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [downlines, setDownlines] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Bank details modal state
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [bankMsg, setBankMsg] = useState("")
  const [savingBank, setSavingBank] = useState(false)

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  // Add a new state for requested withdrawals
  const [requestedWithdrawals, setRequestedWithdrawals] = useState<number>(0)
  const [recalcLoading, setRecalcLoading] = useState(false)

  // Add search state for commissions
  const [commissionSearch, setCommissionSearch] = useState("")

  // Add state for full referral tree
  const [fullReferralTree, setFullReferralTree] = useState<any[]>([])

  // Add state for commission-based referral tree
  const [commissionTree, setCommissionTree] = useState<any[]>([])

  // Add state for downline counts per level
  const [downlineCounts, setDownlineCounts] = useState<Record<number, number>>({})

  const directReferralsRef = useRef<HTMLDivElement>(null)


  // Helper: recursively build the full referral tree up to 6 levels by fetching each downline's user doc
  async function fetchFullReferralTree(userId: string, level = 1, maxLevel = 6): Promise<any[]> {
    if (level > maxLevel) return [];
    // Fetch user doc by userId
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    if (snap.empty) return [];
    const userDoc = snap.docs[0].data();
    const referralsArr = Array.isArray(userDoc.referrals) ? userDoc.referrals : [];
    // For each referral, recursively fetch their tree
    const tree = [];
    for (const ref of referralsArr) {
      const children = await fetchFullReferralTree(ref.referredUserId, level + 1, maxLevel);
      tree.push({
        ...ref,
        level,
        children,
      });
    }
    return tree;
  }

  // Helper: Build full referral tree using commissions parentId/sourceUserId chain
  async function buildReferralTreeFromCommissions(userId: string, commissions: any[], level = 1, maxLevel = 6): Promise<any[]> {
    if (level > maxLevel) return [];
    // Find commission for this level where parentId matches userId
    const comm = commissions.find(c => c.level === level && c.parentId === userId);
    if (!comm || !comm.sourceUserId) return [];
    // Fetch user doc for sourceUserId
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", comm.sourceUserId)));
    if (snap.empty) return [];
    const userDoc = snap.docs[0].data();
    // Recursively build tree for next level
    const children = await buildReferralTreeFromCommissions(comm.sourceUserId, commissions, level + 1, maxLevel);
    return [{
      userId: userDoc.userId,
      name: userDoc.name,
      level,
      commission: comm.amount,
      children,
    }];
  }

  const router = useRouter()

  // Fetch user and dashboard data on auth state change
  useEffect(() => {
    if (typeof window === "undefined") return
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.uid) {
        setLoading(true)
        setError(null)
        try {
          // --- FETCH USER DOC BY firebaseUid OR USERID ---
          const userData = await fetchCurrentUserDoc(firebaseUser.uid)
          if (!userData) throw new Error("User not found")
          setUser(userData)
          setReferrals(Array.isArray(userData.referrals) ? userData.referrals : [])
          setCommissions(Array.isArray(userData.commissions) ? userData.commissions : [])
          setDownlines(Array.isArray(userData.downlines) ? userData.downlines : [])
        } catch (e: any) {
          setError(e.message || "Failed to load user data")
        }
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Load bank details from user doc into modal state when user data changes
  useEffect(() => {
    if (user) {
      setBankName(user.bankName || "")
      setAccountNumber(user.accountNumber || "")
      setAccountName(user.accountName || "")
    }
  }, [user])

  // Load requestedWithdrawals from user doc if present
  useEffect(() => {
    if (user && typeof user.requestedWithdrawals === "number") {
      setRequestedWithdrawals(user.requestedWithdrawals)
    }
  }, [user])

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user && (user.role === "admin" || user.isAdmin)) {
      router.replace("/admin/dashboard")
    }
  }, [user, router])

  // Remove any code that calls recalculateUserCommissions or resets commissions after withdrawal
  // Remove this effect entirely to prevent overwriting commissions with recalculated values
  /*
  useEffect(() => {
    if (user?.userId) {
      setRecalcLoading(true)
      recalculateUserCommissions(user.userId).then(branches => {
        setCommissionBranches(branches)
        // Also flatten all commissions for legacy UI
        const allComms = branches.flatMap((b: any) => b.commissions)
        setCommissions(allComms)
        setRecalcLoading(false)
      }).catch(() => setRecalcLoading(false))
    }
  }, [user?.userId])
  */

  // Fetch full referral tree after user loads
  useEffect(() => {
    async function loadFullTree() {
      if (user?.userId) {
        // Recursively fetch all downlines
        const tree = await fetchFullReferralTree(user.userId, 1, 6);
        setFullReferralTree(tree);
      }
    }
    loadFullTree();
  }, [user?.userId]);

  // Render full referral tree recursively
  function renderFullTree(nodes: any[]) {
    if (!nodes || nodes.length === 0) return null;
    return (
      <ul className="ml-4 border-l border-blue-200 pl-4">
        {nodes.map((node, idx) => (
          <li key={node.referredUserId || node.userId || idx} className="mb-2">
            <span className="font-semibold text-blue-800">
              {node.referredUserName || node.name}{" "}
              <span className="text-xs text-gray-500 font-mono">({node.referredUserId || node.userId})</span>
            </span>
            <span className="ml-2 text-xs text-gray-500">Level {node.level}</span>
            {renderFullTree(node.children)}
          </li>
        ))}
      </ul>
    )
  }

  // Matrix and earnings calculations
  const matrixLevels = calculateMatrixRequirements()
  const totalEarnings = commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.amount || 0), 0)
  const pendingEarnings = commissions.filter(c => c.status === "pending" && !c.requested).reduce((sum, c) => sum + (c.amount || 0), 0)
  const referralsPerLevel: Record<number, number> = {}
  referrals.forEach(r => {
    if (r.level) referralsPerLevel[r.level] = (referralsPerLevel[r.level] || 0) + 1
  })

  // Helper: recursively count downlines at each level
  async function countDownlinesPerLevel(userId: string, level = 1, maxLevel = 6, counts: Record<number, number> = {}) {
    if (level > maxLevel) return counts
    // Fetch user doc by userId
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    if (snap.empty) return counts
    const userDoc = snap.docs[0].data()
    const referralsArr = Array.isArray(userDoc.referrals) ? userDoc.referrals : []
    if (!counts[level]) counts[level] = 0
    counts[level] += referralsArr.length
    for (const ref of referralsArr) {
      await countDownlinesPerLevel(ref.referredUserId, level + 1, maxLevel, counts)
    }
    return counts
  }

  // Load downline counts per level after user loads
  useEffect(() => {
    async function loadDownlineCounts() {
      if (user?.userId) {
        const counts = await countDownlinesPerLevel(user.userId, 1, 6)
        setDownlineCounts(counts)
      }
    }
    loadDownlineCounts()
  }, [user?.userId])

  // Remove the old getPeopleInLevel function if present:
  // function getPeopleInLevel(level: number): number {
  //   if (!user) return 0
  //   const ids = new Set<string>()
  //   referrals.forEach(ref => {
  //     if (ref.level === level && ref.referredUserId) {
  //       ids.add(ref.referredUserId)
  //     }
  //   })
  //   return ids.size
  // }

  // For matrix progress, use downlineCounts per level
  function getPeopleInLevel(level: number): number {
    return downlineCounts[level] || 0
  }

  // Save bank details to Firestore via API
  const handleSaveBankDetails = async () => {
    setSavingBank(true)
    setBankMsg("")
    if (!bankName || !accountNumber || !accountName) {
      setBankMsg("All fields are required")
      setSavingBank(false)
      return
    }
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/user/update-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId || user.uid, // fallback to user.uid if userId is missing
          bankName,
          accountNumber,
          accountName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBankMsg("Bank details saved!")
        // Update user state with new bank details
        setUser((prev: any) => ({
          ...prev,
          bankName,
          accountNumber,
          accountName,
        }))
        setShowBankDialog(false)
      } else {
        setBankMsg(data.error || "Failed to save bank details")
      }
      setSavingBank(false)
    } catch {
      setBankMsg("Failed to save bank details")
      setSavingBank(false)
    }
  }

  // Handle withdrawal request: mark commissions as requested, update UI and DB
  const handleRequestWithdrawal = async () => {
    if (!hasBankDetails) {
      setShowBankDialog(true)
      return
    }
    if (pendingEarnings < 5000 || requestedWithdrawals > 0) return

    // Find all pending commissions that are not requested
    const pendingComms = commissions.filter(c => c.status === "pending" && !c.requested)
    const amount = pendingComms.reduce((sum, c) => sum + (c.amount || 0), 0)
    if (amount < 5000) return

    // Mark all pending commissions as requested (add a requested field and timestamp)
    const updatedComms = commissions.map(c =>
      c.status === "pending" && !c.requested
        ? { ...c, status: "requested", requested: true, requestedAt: Date.now() }
        : c
    )

    // Update UI: pending commissions are now zero, requestedWithdrawals is increased
    setCommissions(updatedComms)
    setRequestedWithdrawals(prev => prev + amount)
    setUser((prev: any) => ({
      ...prev,
      commissions: updatedComms,
      requestedWithdrawals: (prev?.requestedWithdrawals || 0) + amount,
      pendingEarnings: 0
    }))

    try {
      const token = await auth.currentUser?.getIdToken()
      // Update commissions and requestedWithdrawals in Firestore
      await fetch("/api/user/request-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId || user.uid,
          amount,
          commissions: updatedComms,
          requestedWithdrawals: (user.requestedWithdrawals || 0) + amount,
          pendingEarnings: 0
        }),
      })
      setBankMsg("")
      alert("Withdrawal request submitted!")
      // Force reload the page from server to get the latest DB state
      window.location.reload()
    } catch (err: any) {
      alert("Failed to request withdrawal: " + (err?.message || "Unknown error"))
    }
  }

  // Password change handler
  const handleChangePassword = async () => {
    setPasswordMsg("")
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg("All fields are required.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New passwords do not match.")
      return
    }
    setChangingPassword(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) {
        setPasswordMsg("No authenticated user.")
        setChangingPassword(false)
        return
      }
      // Re-authenticate with old password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      )
      await reauthenticateWithCredential(currentUser, credential)
      // Update password
      await updatePassword(currentUser, newPassword)
      setPasswordMsg("Password changed successfully.")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordMsg("")
      }, 1500)
    } catch (err: any) {
      // Firebase error messages are not user-friendly, so map some common ones
      let msg = err?.message || "Failed to change password."
      if (msg.includes("auth/wrong-password")) msg = "Old password is incorrect."
      if (msg.includes("auth/too-many-requests")) msg = "Too many attempts. Please try again later."
      setPasswordMsg(msg)
    }
    setChangingPassword(false)
  }

  // Helper to check if user has saved all bank details
  const hasBankDetails = !!(user?.bankName && user?.accountNumber && user?.accountName)

  // Add logout handler for user dashboard
  const handleLogout = async () => {
    try {
      await auth.signOut()
    } catch {}
    window.location.href = "/auth/login"
  }

  // No changes needed, dashboard will reflect new structure on reload
  // Remove Firestore "referrals" collection fetch for full referral tree.
  // Instead, build the tree from the user's own referrals array only.
  // Helper: recursively build the referral tree from the user's referrals array only
  function buildReferralTree(referralsArr: any[], sponsorId: string, level = 1) {
    const children = referralsArr.filter(ref => ref.sponsorId === sponsorId || (level === 1 && ref.sponsorId === user?.userId))
    if (children.length === 0) return null
    return (
      <ul className="ml-4 border-l border-blue-200 pl-4">
        {children.map(child => (
          <li key={child.referredUserId} className="mb-2">
            <span className="font-semibold text-blue-800">
              {child.referredUserName || child.name}{" "}
              <span className="text-xs text-gray-500 font-mono">({child.referredUserId})</span>
            </span>
            <span className="ml-2 text-xs text-gray-500">Level {level}</span>
            {/* Recursively show their referrals if any */}
            {buildReferralTree(referralsArr, child.referredUserId, level + 1)}
          </li>
        ))}
      </ul>
    )
  }

  // Group commissions by direct referral using parentId and show per-level earnings and user info
  function groupCommissionsByDirectReferral(commissions: any[], userId: string) {
    // Find all direct referrals (level 1 commissions)
    const directGroups: Record<string, { direct: any, items: any[], levelTotals: Record<number, { amount: number, users: string[] }> }> = {};
    commissions.forEach(c => {
      if (c.level === 1 && c.parentId) {
        directGroups[c.parentId] = { direct: c, items: [], levelTotals: {} };
      }
    });
    // Assign all commissions to their branch by parentId
    commissions.forEach(c => {
      if (c.parentId && directGroups[c.parentId]) {
        directGroups[c.parentId].items.push(c);
        // Sum commission per level under this direct referral, collect user IDs
        if (c.level) {
          if (!directGroups[c.parentId].levelTotals[c.level]) {
            directGroups[c.parentId].levelTotals[c.level] = { amount: 0, users: [] };
          }
          directGroups[c.parentId].levelTotals[c.level].amount += c.amount || 0;
          directGroups[c.parentId].levelTotals[c.level].users.push(c.levelId || c.sourceUserId || c.referredUserId || "");
        }
      }
    });
    // Add commissions where parentId is the current user (not under any direct referral)
    const directToUser = commissions.filter(c => c.parentId === userId);
    if (directToUser.length > 0) {
      const levelTotals: Record<number, { amount: number, users: string[] }> = {};
      directToUser.forEach(c => {
        if (c.level) {
          if (!levelTotals[c.level]) levelTotals[c.level] = { amount: 0, users: [] };
          levelTotals[c.level].amount += c.amount || 0;
          levelTotals[c.level].users.push(c.levelId || c.sourceUserId || c.referredUserId || "");
        }
      });
      directGroups[userId] = {
        direct: { levelName: "Direct to You", sourceUserId: userId },
        items: directToUser,
        levelTotals
      };
    }
    // Fallback: if no level 1, group all by parentId
    if (Object.keys(directGroups).length === 0) {
      commissions.forEach(c => {
        const key = c.parentId || "unknown";
        if (!directGroups[key]) {
          directGroups[key] = { direct: c, items: [], levelTotals: {} };
        }
        directGroups[key].items.push(c);
        if (c.level) {
          if (!directGroups[key].levelTotals[c.level]) directGroups[key].levelTotals[c.level] = { amount: 0, users: [] };
          directGroups[key].levelTotals[c.level].amount += c.amount || 0;
          directGroups[key].levelTotals[c.level].users.push(c.levelId || c.sourceUserId || c.referredUserId || "");
        }
      });
    }
    return Object.values(directGroups);
  }

  // Loading and error UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent"></div>
          <span className="text-lg text-blue-700 font-semibold animate-pulse">Loading user dashboard...</span>
        </div>
      </div>
    )
  }
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <span className="text-red-600 text-lg font-semibold">{error || "No user data found."}</span>
      </div>
    )
  }

  // Main dashboard UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with hamburger menu and logout */}
      <header className="bg-white/90 shadow-sm sticky top-0 z-20 border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-blue-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7 text-blue-700" />
            </button>
            <span className="text-xl sm:text-2xl font-bold text-[#0066E0] tracking-tight">User Dashboard</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2 text-blue-700 font-semibold">
              <User className="h-5 w-5" />
              {user.name || user.fullName}
            </Button>
            {/* Become Stockist button for desktop/laptop */}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/stockist/register"}
            >
              <Store className="h-5 w-5" />
              Become Stockist
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        {/* Mobile Hamburger Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-t border-blue-100 px-4 pb-4 space-y-2 z-30">
            <div className="flex flex-col gap-2 mt-4">
              {/* User info for mobile/tablet */}
              <div className="mb-4 space-y-1">
                <div className="font-bold text-blue-900">{user.name || user.fullName}</div>
                <div className="text-gray-700 text-sm">{user.email}</div>
                {user.collectionId && (
                  <div className="text-blue-700 text-xs">
                    <span className="font-semibold">Order Collection ID:</span>{" "}
                    <span className="font-mono">{user.collectionId}</span>
                  </div>
                )}
                <div className="text-gray-500 text-xs">User ID: {user.userId || user.memberId}</div>
              </div>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Redirect to correct dashboard based on role
                  if (user?.role === "admin" || user?.isAdmin) {
                    router.push("/admin/dashboard");
                  } else {
                    router.push("/user");
                  }
                }}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    directReferralsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
              >
                <Users className="h-5 w-5" />
                My Referrals
              </Button>
              <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                <Store className="h-5 w-5" />
                Become Stockist
              </Button>
              {/* --- Change Password in Hamburger Menu --- */}
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 justify-start"
                onClick={() => setShowPasswordModal(true)}
              >
                <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6" />
                </svg>
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 justify-start text-red-600 border-red-200"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-2 sm:px-4 py-8">
        {/* --- Product Delivered Banner --- */}
        {user?.deliveryStatus?.isProductDelivered && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 flex items-center gap-3">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-semibold">
              Your product has been delivered!
              {user.deliveryStatus.time && (
                <span className="ml-2 text-green-700 text-xs">
                  {typeof user.deliveryStatus.time?.toDate === "function"
                    ? `(${user.deliveryStatus.time.toDate().toLocaleString()})`
                    : ""}
                </span>
              )}
            </span>
          </div>
        )}
        {/* User Info, Earnings, and Withdraw/Bank Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Hide user info on mobile/tablet, show only on desktop or when menu open */}
            <div className={`transition-all duration-200 ${mobileMenuOpen ? "block" : "hidden"} md:block`}>
              <h2 className="text-2xl font-bold text-[#0066E0] mb-1">{user.name || user.fullName}</h2>
              <div className="text-gray-700 mb-1">{user.email}</div>
              {/* Improved label for collectionId */}
              {user.collectionId && (
                <div className="text-blue-700 text-sm mb-1">
                  <span className="font-semibold">Order Collection ID:</span>{" "}
                  <span className="font-mono">{user.collectionId}</span>
                  <span className="text-xs text-gray-500 ml-2">(Show this ID to collect your package/order)</span>
                </div>
              )}
              <div className="text-gray-500 text-xs mb-1">User ID: {user.userId || user.memberId}</div>
              {/* --- Change Password Button (always visible in user info section) --- */}
              <div className="mt-2 mb-2">
                <Button
                  variant="outline"
                  className="border-blue-300"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change Password
                </Button>
              </div>
              {/* Withdraw Button */}
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  className="bg-[#0066E0] hover:bg-[#00266C] text-white font-semibold px-6 py-2 rounded-lg shadow"
                  onClick={handleRequestWithdrawal}
                  disabled={pendingEarnings < 5000 || requestedWithdrawals > 0}
                >
                  Request Withdrawal
                </Button>
                {requestedWithdrawals > 0 && (
                  <div className="text-xs text-orange-600 mt-2">
                    You have a pending withdrawal request awaiting admin approval. You cannot request another withdrawal until it is approved.
                  </div>
                )}
                {pendingEarnings < 5000 && requestedWithdrawals === 0 && (
                  <div className="text-xs text-red-600 mt-2">
                    Pending earnings must be at least ₦5,000 to request withdrawal.
                  </div>
                )}
                {/* Edit Bank Details Button */}
                <Button
                  variant="outline"
                  className="w-fit mt-2"
                  onClick={() => setShowBankDialog(true)}
                >
                  {hasBankDetails ? "Edit Bank Details" : "Add Bank Details"}
                </Button>
              </div>
              {/* Display current bank details if present */}
              {(user.bankName || user.accountNumber || user.accountName) && (
                <div className="mt-4 bg-blue-50 rounded p-3 text-sm text-blue-900">
                  <div><span className="font-semibold">Bank Name:</span> {user.bankName}</div>
                  <div><span className="font-semibold">Account Number:</span> {user.accountNumber}</div>
                  <div><span className="font-semibold">Account Name:</span> {user.accountName}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Total Earnings</div>
                <div className="text-lg font-bold text-green-700">
                  ₦{totalEarnings.toLocaleString()}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Pending Earnings</div>
                <div className="text-lg font-bold text-yellow-700">
                  ₦{pendingEarnings.toLocaleString()}
                </div>
                {pendingEarnings > 0 && (
                  <div className="text-xs text-gray-600 mt-1">
                    <span>10% withdrawal charge applies.</span>
                    <br />
                    <span>
                      You will receive: <span className="font-semibold text-green-700">
                        ₦{Math.floor(pendingEarnings * 0.9).toLocaleString()}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex-1 min-w-[120px] bg-blue-50 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Direct Referrals</div>
              <div className="text-lg font-bold">{referrals.length}</div>
            </div>
            <div className="flex-1 min-w-[120px] bg-purple-50 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Matrix Downlines</div>
              <div className="text-lg font-bold">{downlines.length}</div>
            </div>
            {/* Requested Withdrawals Section */}
            <div className="flex-1 min-w-[120px] bg-orange-50 rounded-lg px-4 py-2 text-center border border-orange-200 shadow">
              <div className="text-xs text-orange-700 font-semibold">Requested Withdrawals</div>
              <div className="text-lg font-bold text-orange-700">
                ₦{requestedWithdrawals.toLocaleString()}
              </div>
              {requestedWithdrawals > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  <span>10% withdrawal charge applies.</span>
                  <br />
                  <span>
                    You will receive: <span className="font-semibold text-green-700">
                      ₦{Math.floor(requestedWithdrawals * 0.9).toLocaleString()}
                    </span>
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Awaiting admin approval
              </div>
            </div>
          </div>
        </div>

        {/* Show recalculation loading */}
        {recalcLoading && (
          <div className="text-blue-700 text-sm mb-4">Recalculating commissions...</div>
        )}

        {/* Direct Referrals Table */}
        <div ref={directReferralsRef} className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Direct Referrals</h3>
          {referrals.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-2 px-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Member ID</th>
                  <th className="py-2 px-2 text-left">Level</th>
                  <th className="py-2 px-2 text-left">To Complete Level</th>
                  <th className="py-2 px-2 text-left">Remaining for Level</th>
                  <th className="py-2 px-2 text-left">Matrix Level</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => {
                  const levelConfig = matrixLevels.find(l => l.level === r.level)
                  const needed = levelConfig
                    ? Math.max(0, levelConfig.requiredMembers - (referralsPerLevel[r.level] || 0))
                    : "-"
                  // Calculate how many more referrals this referral needs to complete their own level
                  const theirLevelConfig = matrixLevels.find(l => l.level === r.level)
                  // Count how many referrals this referral has at their level
                  const theirDirects = referrals.filter(ref => ref.sponsorId === r.referredUserId && ref.level === r.level).length
                  const theirNeeded = theirLevelConfig
                    ? Math.max(0, theirLevelConfig.requiredMembers - theirDirects)
                    : "-"
                  // Find which matrix level this referral is in for you
                  let matrixLevel = 1
                  let parentId = r.sponsorId
                  let currentId = r.referredUserId
                  while (parentId !== user.userId && matrixLevel < 6) {
                    // Find parent referral
                    const parentRef = referrals.find(ref => ref.referredUserId === parentId)
                    if (!parentRef) break
                    parentId = parentRef.sponsorId
                    matrixLevel++
                  }
                  return (
                    <tr key={i} className="even:bg-blue-50/40">
                      <td className="py-2 px-2">{r.referredUserName || r.name}</td>
                      <td className="py-2 px-2">{r.referredUserId || r.memberId}</td>
                      <td className="py-2 px-2">{r.level}</td>
                      <td className="py-2 px-2">{needed}</td>
                      <td className="py-2 px-2">{theirNeeded}</td>
                      <td className="py-2 px-2">{matrixLevel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">No referrals yet.</div>
          )}
        </div>

        {/* Matrix Progress Table as Progress Bars */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Matrix Progress</h3>
          <div className="space-y-6">
            {matrixLevels.map(level => {
              const people = getPeopleInLevel(level.level)
              const percent = Math.min(100, Math.round((people / level.requiredMembers) * 100))
              return (
                <div key={level.level}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">
                      Level {level.level} <span className="text-xs text-gray-500">(Required: {level.requiredMembers})</span>
                    </span>
                    <span className="text-sm font-semibold text-blue-700">
                      {people} / {level.requiredMembers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        percent === 100
                          ? "bg-green-500"
                          : percent >= 75
                          ? "bg-blue-500"
                          : percent >= 40
                          ? "bg-yellow-400"
                          : "bg-orange-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-800">
                      {percent}%
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {people >= level.requiredMembers ? (
                      <span className="text-green-600 font-bold">Complete</span>
                    ) : (
                      <span>
                        {level.requiredMembers - people} remaining to complete Level {level.level}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Commissions</h3>
          {/* Search bar for commissions */}
          <div className="mb-4 flex items-center">
            <input
              type="text"
              className="w-full max-w-md px-3 py-2 border border-blue-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search commissions by level, user name, or user ID"
              value={commissionSearch}
              onChange={e => setCommissionSearch(e.target.value)}
            />
          </div>
          {commissions.length > 0 ? (
            groupCommissionsByDirectReferral(commissions, user.userId)
              .filter(group => group.items.length > 0)
              .map((group, idx) => {
                // Filter branch items by search
                const search = commissionSearch.trim().toLowerCase()
                const filteredItems = !search
                  ? group.items
                  : group.items.filter(c =>
                      (String(c.level).includes(search)) ||
                      (c.levelName && c.levelName.toLowerCase().includes(search)) ||
                      (c.referredUserName && c.referredUserName.toLowerCase().includes(search)) ||
                      (c.name && c.name.toLowerCase().includes(search)) ||
                      (c.levelId && String(c.levelId).toLowerCase().includes(search)) ||
                      (c.sourceUserId && String(c.sourceUserId).toLowerCase().includes(search)) ||
                      (c.referredUserId && String(c.referredUserId).toLowerCase().includes(search))
                    )
                if (filteredItems.length === 0) return null // Hide branch if no match
                return (
                  <div key={idx} className="mb-10">
                    {/* Direct referral header */}
                    <div className="font-bold text-blue-700 text-lg mb-2 border-b border-blue-200 pb-2 flex items-center gap-2">
                      <span>
                        {group.direct.levelName === "Direct to You"
                          ? "Other Commissions:"
                          : "Direct Referral:"}
                      </span>
                      <span className="text-blue-900">
                        {group.direct.levelName || group.direct.referredUserName || group.direct.sourceUserId}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        ({group.direct.sourceUserId})
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[700px] w-full border border-blue-200 rounded-lg shadow-sm bg-white">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="py-2 px-2 text-left border-b border-blue-100">Level</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">User Name</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">User ID</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">Amount</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">Status</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">Description</th>
                            <th className="py-2 px-2 text-left border-b border-blue-100">Requested At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems
                            .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
                            .map((c: any, i: number) => (
                              <tr key={i} className="even:bg-blue-50/40">
                                <td className="py-2 px-2 border-b border-blue-50">{c.level ?? "-"}</td>
                                <td className="py-2 px-2 border-b border-blue-50">{c.levelName || c.referredUserName || c.name || "-"}</td>
                                <td className="py-2 px-2 border-b border-blue-50 font-mono">{c.levelId || c.sourceUserId || c.referredUserId || "-"}</td>
                                <td className="py-2 px-2 border-b border-blue-50 font-bold text-green-700">₦{c.amount?.toLocaleString?.() ?? 0}</td>
                                <td className="py-2 px-2 border-b border-blue-50">
                                  {c.status === "requested" ? (
                                    <span className="text-orange-700 font-semibold">Requested</span>
                                  ) : c.status === "approved" ? (
                                    <span className="text-green-700 font-semibold">Approved</span>
                                  ) : (
                                    <span className="text-yellow-700">Pending</span>
                                  )}
                                </td>
                                <td className="py-2 px-2 border-b border-blue-50">{c.description}</td>
                                <td className="py-2 px-2 border-b border-blue-50 font-mono text-xs">
                                  {c.requestedAt
                                    ? new Date(c.requestedAt).toLocaleString()
                                    : ""}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50">
                            <td colSpan={3} className="py-2 px-2 font-bold text-right text-green-700 border-t border-blue-200">Total Earned:</td>
                            <td className="py-2 px-2 font-bold text-green-700 border-t border-blue-200">
                              ₦{filteredItems.reduce((sum, c) => sum + (c.amount || 0), 0).toLocaleString()}
                            </td>
                            <td colSpan={3} className="border-t border-blue-200"></td>
                          </tr>
                          {/* Per-level summary row */}
                          <tr className="bg-blue-50">
                            <td colSpan={7} className="py-2 px-2 text-left border-t border-blue-200">
                              <div className="flex flex-wrap gap-4">
                                {[1,2,3,4,5,6].map(lvl => {
                                  const levelInfo = group.levelTotals[lvl] || { amount: 0, users: [] };
                                  return (
                                    <span key={lvl} className="text-xs text-blue-900 font-semibold">
                                      Level {lvl}: ₦{levelInfo.amount.toLocaleString()}
                                      {levelInfo.users.length > 0 && (
                                        <span className="ml-2 text-gray-500 font-mono">
                                          [{levelInfo.users.join(", ")}]
                                        </span>
                                      )}
                                    </span>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )
              })
          ) : (
            <div className="text-gray-500">No commissions yet.</div>
          )}
        </div>

        {/* --- Full Referral Tree Section --- */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Full Referral Tree</h3>
          {fullReferralTree.length > 0 ? (
            <div>
              <span className="font-bold text-blue-900">{user.name || user.fullName}</span>
              {renderFullTree(fullReferralTree)}
            </div>
          ) : (
            <div className="text-gray-500">No referrals yet.</div>
          )}
        </div>
      </main>
      {/* Bank Details Modal */}
      <SimpleModal open={showBankDialog} onClose={() => setShowBankDialog(false)}>
        {/* ...existing modal content (Dialog.Title, form, etc.)... */}
        <div className="text-lg font-bold mb-4 text-[#0066E0]">
          {user.bankName && user.accountNumber && user.accountName ? "Edit Bank Details" : "Add Bank Details"}
        </div>
        <div className="space-y-3">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="Enter bank name"
            />
          </div>
          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
            />
          </div>
          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="Enter account name"
            />
          </div>
          {/* Success/Error message */}
          {bankMsg && (
            <div className={`text-sm mt-2 ${bankMsg.includes("saved") ? "text-green-600" : "text-red-600"}`}>
              {bankMsg}
            </div>
          )}
          {/* Save/Cancel buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              className="bg-[#0066E0] text-white px-4 py-2 rounded"
              onClick={handleSaveBankDetails}
              disabled={savingBank}
            >
              {savingBank ? "Saving..." : "Save Bank Details"}
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 rounded"
              onClick={() => setShowBankDialog(false)}
              disabled={savingBank}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SimpleModal>
      {/* Change Password Modal */}
      <SimpleModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <div className="text-lg font-bold mb-4 text-[#0066E0]">Change Password</div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Old Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
          {passwordMsg && (
            <div className={`text-sm mt-2 ${passwordMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {passwordMsg}
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              className="bg-[#0066E0] text-white px-4 py-2 rounded"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 rounded"
              onClick={() => setShowPasswordModal(false)}
              disabled={changingPassword}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SimpleModal>
      {/* Optionally, auto-fix referral link on dashboard load for current user */}
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
        }
      `}</style>
    </div>
  )
}