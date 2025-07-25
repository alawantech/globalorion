"use client"

// This React component fetches and displays the total number of users, total earnings, and pending commissions for the admin dashboard.

import { useEffect, useState, Fragment } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, serverTimestamp, onSnapshot, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Menu } from "lucide-react"
import { fixReferralForUser } from "@/lib/referral-system"

// Simple copy icon SVG component
function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" fill="none" viewBox="0 0 20 20">
      <rect x="6" y="6" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

// Add User interface for type safety
interface User {
  id: string
  name: string
  userId: string
  collectionId: string
  email: string
  location: string
  deliveryStatus?: {
    isProductDelivered?: boolean
    time?: any
  }
  activationDate?: any // Add activationDate to User interface
}

// Add a good field name for the object
const DELIVERY_STATUS_FIELD = "deliveryStatus"

export default function AdminDashboard() {
  // State for admin statsnpm r
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null)
  const [pendingCommissions, setPendingCommissions] = useState<number | null>(null)
  const [availablePins, setAvailablePins] = useState<any[]>([])
  const [sentPins, setSentPins] = useState<any[]>([])
  const [usedPins, setUsedPins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Pin generation state
  const [pinCount, setPinCount] = useState<number>(1)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState<string>("")
  const [sendingPinIds, setSendingPinIds] = useState<string[]>([])
  const [copiedPin, setCopiedPin] = useState<string | null>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null)
  // Add state for users table
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  // Add search state
  const [search, setSearch] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<any[]>([])
  const [showSection, setShowSection] = useState<"withdrawals" | "users" | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  // Add state for referral network rows
  const [referralNetworkRows, setReferralNetworkRows] = useState<
    { userId: string; userName: string; referralId: string; referralName: string; level: number }[]
  >([])
  const [referralNetworkLoading, setReferralNetworkLoading] = useState(false)
  // Add search state for referral network
  const [referralSearch, setReferralSearch] = useState("")
  const [fixingReferrals, setFixingReferrals] = useState(false)
  const [fixMsg, setFixMsg] = useState("")
  const [fixingDuplicates, setFixingDuplicates] = useState(false)
  const [fixDuplicatesMsg, setFixDuplicatesMsg] = useState("")

  // Fetch admin stats from the API on mount and after login
  async function fetchAdminStats() {
    setLoading(true)
    setError(null)
    try {
      // Fetch all users from Firestore
      const usersSnap = await getDocs(collection(db, "users"))
      const usersArr = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const totalUsers = usersArr.length

      // Calculate total earnings and pending commissions from user commissions arrays
      let totalEarnings = 0
      let pendingCommissions = 0
      usersArr.forEach(user => {
        if (Array.isArray(user.commissions)) {
          user.commissions.forEach((c: any) => {
            if (c.status === "approved") totalEarnings += c.amount || 0
            if (c.status === "pending") pendingCommissions += c.amount || 0
          })
        }
      })

      // PIN stats (unchanged)
      const pinsSnap = await getDocs(collection(db, "pins"))
      const pins = pinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const availablePins = pins.filter(pin => pin.status === "unused")
      const sentPins = pins.filter(pin => pin.status === "sent")
      const usedPins = pins.filter(pin => pin.status === "used")

      setTotalUsers(totalUsers)
      setTotalEarnings(totalEarnings)
      setPendingCommissions(pendingCommissions)
      setAvailablePins(availablePins)
      setSentPins(sentPins)
      setUsedPins(usedPins)
    } catch (e: any) {
      setError("Failed to fetch stats")
    }
    setLoading(false)
  }

  // Fetch and sum all users' pending commissions from Firestore
  async function fetchPendingCommissionsFromUsers() {
    try {
      const usersSnap = await getDocs(collection(db, "users"))
      let pending = 0
      usersSnap.docs.forEach(docSnap => {
        const user = docSnap.data()
        if (Array.isArray(user.commissions)) {
          user.commissions.forEach((c: any) => {
            if (c.status === "pending" && typeof c.amount === "number") {
              pending += c.amount
            }
          })
        }
      })
      setPendingCommissions(pending)
    } catch {
      setPendingCommissions(0)
    }
  }

  // Fetch stats on mount and after login
  useEffect(() => {
    fetchAdminStats()
    fetchPendingCommissionsFromUsers()
    // Optionally, you can listen for login events and call fetchAdminStats() again if needed
  }, [])

  // Optionally, refresh pending commissions live if you want
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), () => {
      fetchPendingCommissionsFromUsers()
    })
    return () => unsub()
  }, [])

  // Fetch withdrawals on mount
  useEffect(() => {
    async function fetchWithdrawals() {
      setWithdrawalsLoading(true)
      setWithdrawalsError(null)
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, "users"))
        // Pending withdrawals
        const withdrawalUsers = usersSnap.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(u => typeof u.requestedWithdrawals === "number" && u.requestedWithdrawals > 0)
        const withdrawalsList = withdrawalUsers.map(u => ({
          id: u.id,
          userId: u.userId || u.id,
          name: u.name || u.fullName || "",
          email: u.email || "",
          bankName: u.bankName || "",
          accountNumber: u.accountNumber || "",
          accountName: u.accountName || "",
          amount: u.requestedWithdrawals,
          status: "pending",
          requestedAt: u.updatedAt?.toDate?.() || u.updatedAt || null,
        }))
        setWithdrawals(withdrawalsList)

        // Approved withdrawals: show all commissions with approved === true and approvedAt
        const approvedList: any[] = []
        usersSnap.docs.forEach(docSnap => {
          const user = docSnap.data()
          if (Array.isArray(user.commissions)) {
            user.commissions.forEach((c: any) => {
              if (
                (c.approved === true || c.approved === "true" || c.status === "approved") &&
                c.approvedAt &&
                c.amount > 0
              ) {
                approvedList.push({
                  id: docSnap.id,
                  userId: user.userId || docSnap.id,
                  name: user.name || user.fullName || "",
                  email: user.email || "",
                  bankName: user.bankName || "",
                  accountNumber: user.accountNumber || "",
                  accountName: user.accountName || "",
                  amount: c.amount || 0,
                  approvedAt: c.approvedAt,
                  commissionId: c.id || undefined,
                })
              }
            })
          }
        })
        approvedList.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
        setApprovedWithdrawals(approvedList)
      } catch (e: any) {
        setWithdrawalsError("Failed to fetch withdrawals")
      }
      setWithdrawalsLoading(false)
    }
    fetchWithdrawals()
  }, [])

  // Fetch all users on mount (change to real-time listener)
  useEffect(() => {
    // Import onSnapshot from firebase/firestore
    // ...existing code...
    const unsub = onSnapshot(collection(db, "users"), (usersSnap) => {
      const usersList: User[] = usersSnap.docs.map(doc => {
        const d = doc.data()
        return {
          id: doc.id,
          name: d.name || "",
          userId: d.userId || "",
          collectionId: d.collectionId || "",
          email: d.email || "",
          location: d.location || "",
          deliveryStatus: d.deliveryStatus || {},
          activationDate: d.activationDate, // Add activationDate to each user
        }
      })
      setUsers(usersList)
      setUsersLoading(false)
      // Do NOT recalculate totalEarnings or pendingCommissions here!
      // setTotalUsers(usersList.length) // Optional: can keep for live user count
      // Remove earnings/pending calculation here
    })
    return () => unsub()
  }, [])

  // --- LIVE WITHDRAWALS & APPROVED WITHDRAWALS ---
  useEffect(() => {
    setWithdrawalsLoading(true)
    setWithdrawalsError(null)
    const unsub = onSnapshot(collection(db, "users"), (usersSnap) => {
      // Pending withdrawals
      const withdrawalUsers = usersSnap.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(u => typeof u.requestedWithdrawals === "number" && u.requestedWithdrawals > 0)
      const withdrawalsList = withdrawalUsers.map(u => ({
        id: u.id,
        userId: u.userId || u.id,
        name: u.name || u.fullName || "",
        email: u.email || "",
        bankName: u.bankName || "",
        accountNumber: u.accountNumber || "",
        accountName: u.accountName || "",
        amount: u.requestedWithdrawals,
        status: "pending",
        requestedAt: u.updatedAt?.toDate?.() || u.updatedAt || null,
      }))
      setWithdrawals(withdrawalsList)
      // Approved withdrawals
      const approvedList: any[] = []
      usersSnap.docs.forEach(docSnap => {
        const user = docSnap.data()
        if (Array.isArray(user.commissions)) {
          user.commissions.forEach((c: any) => {
            if (
              (c.approved === true || c.approved === "true") &&
              c.approvedAt &&
              c.amount > 0
            ) {
              approvedList.push({
                id: docSnap.id,
                userId: user.userId || docSnap.id,
                name: user.name || user.fullName || "",
                email: user.email || "",
                bankName: user.bankName || "",
                accountNumber: user.accountNumber || "",
                accountName: user.accountName || "",
                amount: c.amount || 0,
                approvedAt: c.approvedAt,
                commissionId: c.id || undefined,
              })
            }
          })
        }
      })
      approvedList.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
      setApprovedWithdrawals(approvedList)
      setWithdrawalsLoading(false)
    }, () => setWithdrawalsError("Failed to fetch withdrawals"))
    return () => unsub()
  }, [])

  // --- LIVE PINS ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pins"), (pinsSnap) => {
      const pins = pinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAvailablePins(pins.filter(p => !p.usedBy && !p.sentAt))
      setSentPins(pins.filter(p => p.sentAt && !p.usedBy))
      setUsedPins(pins.filter(p => p.usedBy))
    })
    return () => unsub()
  }, [])

  // Generate PIN handler
  async function handleGeneratePins() {
    setGenerating(true)
    setGenMsg("")
    try {
      const res = await fetch("/api/admin/generate-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: pinCount }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setGenMsg(`Generated ${data.generated} PIN(s)`)
        await fetchAdminStats() // Refetch stats after generating PINs
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setGenMsg(data.error || "Failed to generate PINs")
      }
    } catch {
      setGenMsg("Failed to generate PINs")
    }
    setGenerating(false)
  }

  // Mark PIN as sent (move from available to sent)
  async function handleSendPin(pinId: string) {
    setSendingPinIds(prev => [...prev, pinId])
    try {
      const res = await fetch("/api/admin/mark-pin-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAvailablePins(prev => prev.filter(pin => pin.id !== pinId))
        const sentPin = availablePins.find(pin => pin.id === pinId)
        if (sentPin) setSentPins(prev => [{ ...sentPin, status: "sent" }, ...prev])
        await fetchAdminStats() // Refetch stats after sending PIN
      }
    } catch {}
    setSendingPinIds(prev => prev.filter(id => id !== pinId))
  }

  // Copy to clipboard handler
  function handleCopyPin(pinValue: string) {
    navigator.clipboard.writeText(pinValue)
    setCopiedPin(pinValue)
    setTimeout(() => setCopiedPin(null), 1200)
  }

  // Logout handler (assuming Firebase Auth)
  async function handleLogout() {
    if (typeof window !== "undefined") {
      try {
        const { signOut } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")
        await signOut(auth)
      } catch {}
      window.location.href = "/auth/login"
    }
  }

  // Handler for checkbox change
  async function handleDeliveryStatusCheck(user: User) {
    if (!user.id) return
    setUpdatingUserId(user.id)
    try {
      await updateDoc(doc(db, "users", user.id), {
        [DELIVERY_STATUS_FIELD]: {
          isProductDelivered: true,
          time: serverTimestamp(),
        },
      })
      // Optionally update UI to reflect change
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, [DELIVERY_STATUS_FIELD]: { isProductDelivered: true, time: new Date() } }
            : u
        )
      )
    } catch (e) {
      // Optionally handle error
    }
    setUpdatingUserId(null)
  }

  // Fix all referrals handler
  async function handleFixAllReferrals() {
    setFixingReferrals(true)
    setFixMsg("Fixing referrals...")
    try {
      const usersSnap = await getDocs(collection(db, "users"))
      const usersArr = usersSnap.docs.map(doc => doc.data())
      let fixedCount = 0
      for (const user of usersArr) {
        if (user.userId && user.sponsorId && user.sponsorId.trim() && user.sponsorId.trim().toUpperCase() !== user.userId.trim().toUpperCase()) {
          // Fix referral and commissions for all 6 levels
          await fixReferralForUser(user.userId)
          fixedCount++
        }
      }
      setFixMsg(`Fixed ${fixedCount} users with missing referral links and commissions for all 6 levels.`)
    } catch (err: any) {
      setFixMsg("Error fixing referrals: " + (err?.message || "Unknown error"))
    }
    setFixingReferrals(false)
    fetchAdminStats()
  }

  // --- Fix duplicate commissions for all users ---
  async function handleFixDuplicateCommissions() {
    setFixingDuplicates(true)
    setFixDuplicatesMsg("Fixing duplicate commissions...")
    try {
      const usersSnap = await getDocs(collection(db, "users"))
      const batch = writeBatch(db)
      let fixedCount = 0
      let foundAnyDuplicate = false
      for (const docSnap of usersSnap.docs) {
        const user = docSnap.data()
        if (Array.isArray(user.commissions) && user.commissions.length > 0) {
          // --- Dedupe by sourceUserId only, remove all duplicates including requested ---
          const seenSrc = new Set<string>()
          const deduped = []
          let hadDuplicate = false
          for (const c of user.commissions) {
            const srcId = (c.sourceUserId || c.levelId || "").toString().trim().toUpperCase()
            if (!seenSrc.has(srcId)) {
              deduped.push(c)
              seenSrc.add(srcId)
            } else {
              hadDuplicate = true
            }
          }
          if (hadDuplicate) foundAnyDuplicate = true
          // Debug log: show keys and counts for each user
          if (user.userId) {
            console.log(`User ${user.userId} (srcId dedupe, removes requested duplicates):`, {
              total: user.commissions.length,
              unique: deduped.length,
              srcIds: user.commissions.map(c => (c.sourceUserId || c.levelId || "").toString().trim().toUpperCase()),
              commissions: user.commissions,
            })
          }
          if (deduped.length < user.commissions.length) {
            batch.update(doc(db, "users", docSnap.id), { commissions: deduped })
            fixedCount++
          }
        }
      }
      if (fixedCount > 0) {
        await batch.commit()
        setFixDuplicatesMsg(`Fixed duplicates for ${fixedCount} user(s) (by sourceUserId only, removes requested duplicates).`)
      } else if (foundAnyDuplicate) {
        setFixDuplicatesMsg("Duplicates were found but could not be fixed. Please check the browser console for details.")
      } else {
        setFixDuplicatesMsg("No duplicate commissions found by sourceUserId. All requested and non-requested duplicates have already been removed. All requested commissions are unique.")
      }
    } catch (err: any) {
      setFixDuplicatesMsg("Error fixing duplicates: " + (err?.message || "Unknown error"))
    }
    setFixingDuplicates(false)
    fetchAdminStats()
  }

  // Filter users by search
  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.userId || "").toLowerCase().includes(q) ||
      (u.collectionId || "").toLowerCase().includes(q) ||
      (u.location || "").toLowerCase().includes(q)
    )
  })

  // Helper: Recursively collect all referrals for a user up to maxLevel, including their own tree
  function getReferralTreeWithSubtree(
    userId: string,
    userName: string,
    usersMap: Record<string, any>,
    level = 1,
    maxLevel = 6, // <-- Make sure this is 6
    visited = new Set<string>()
  ): any[] {
    if (level > maxLevel) return []
    if (visited.has(userId)) return []
    visited.add(userId)
    const user = usersMap[userId]
    if (!user) return []
    const referrals = Array.isArray(user.referrals) ? user.referrals : []
    let rows: any[] = []
    for (const ref of referrals) {
      // Build the subtree for this referral, up to 6 levels
      const subtree = getReferralTreeWithSubtree(
        ref.referredUserId,
        ref.referredUserName || ref.name || "",
        usersMap,
        level + 1,
        maxLevel,
        new Set(visited)
      )
      rows.push({
        userId,
        userName,
        referralId: ref.referredUserId,
        referralName: ref.referredUserName || ref.name || "",
        level,
        subtree,
      })
    }
    return rows
  }

  // Helper: Recursively flatten the referral tree up to 6 levels for table display
  function flattenReferralTree(tree: any[], maxLevel = 6, rows: any[] = []) {
    for (const row of tree) {
      if (row.level > maxLevel) continue
      rows.push(row)
      if (row.subtree && row.subtree.length > 0) {
        flattenReferralTree(row.subtree, maxLevel, rows)
      }
    }
    return rows
  }

  // Helper: Recursively build a user's full referral tree up to 6 levels, using sponsorId chain (handles cycles and missing sponsorId)
  // Each referral in the tree will have the correct level, the commission earned from that user at that level, and the correct referrer (upline).
  function buildFullReferralTree(
    user: any,
    usersMap: Record<string, any>,
    rootUser: any,
    parent: any = null,
    level = 1,
    maxLevel = 6,
    visited = new Set<string>()
  ): any[] {
    if (!user || level > maxLevel) return [];
    if (visited.has(user.userId)) return []; // Prevent cycles
    visited.add(user.userId);

    // Find all users whose sponsorId is this user's userId (direct referrals)
    const directReferrals = Object.values(usersMap).filter(
      (u: any) =>
        u.sponsorId &&
        typeof u.sponsorId === "string" &&
        u.sponsorId.trim().toUpperCase() === String(user.userId).trim().toUpperCase() &&
        u.userId !== user.userId // Prevent self-referral
    );

    let result: any[] = [];
    for (const refUser of directReferrals) {
      // Calculate the correct level for this referral (distance from root)
      let actualLevel = parent && parent.level ? parent.level + 1 : 1;
      // Find commission for the *root user* earned from this referral at this actualLevel
      let commission = null;
      if (Array.isArray(rootUser.commissions)) {
        commission = rootUser.commissions.find(
          (c: any) =>
            c.level === actualLevel &&
            (String(c.levelId).toUpperCase() === String(refUser.userId).toUpperCase() ||
             String(c.sourceUserId).toUpperCase() === String(refUser.userId).toUpperCase())
        );
      }
      result.push({
        referrerName: user.name || user.userName || "",
        referrerId: user.userId,
        referralName: refUser.name || refUser.userName || "",
        referralId: refUser.userId,
        level: actualLevel,
        commission: commission ? commission.amount : 0,
        commissionStatus: commission ? commission.status : "",
        subtree: buildFullReferralTree(refUser, usersMap, rootUser, { ...refUser, level: actualLevel }, actualLevel + 1, maxLevel, new Set(visited)),
      });
    }
    return result;
  }

  // Fetch all users and build referral network table with subtrees and commissions (full tree, not just direct)
  useEffect(() => {
    async function buildReferralNetwork() {
      setReferralNetworkLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const usersArr = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Build a map for quick lookup (normalize userId to uppercase for robustness)
        const usersMap: Record<string, any> = {};
        usersArr.forEach(u => {
          if (u.userId) usersMap[String(u.userId).trim().toUpperCase()] = u;
        });
        let allRows: any[] = [];
        for (const u of usersArr) {
          if (!u.userId) continue;
          // Build the full referral tree up to 6 levels, including commission info
          const tree = buildFullReferralTree(
            u,
            usersMap,
            u, // Pass the root user so commission is always from the perspective of the tree owner
            null,
            1,
            6,
            new Set()
          );
          allRows.push({
            userId: u.userId,
            userName: u.name || u.fullName || "",
            email: u.email || "",
            tree,
          });
        }
        setReferralNetworkRows(allRows);
      } catch (e) {
        setReferralNetworkRows([]);
      }
      setReferralNetworkLoading(false);
    }
    buildReferralNetwork();
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
        <span className="text-lg text-blue-700 font-semibold animate-pulse">Loading admin dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <span className="text-red-600 text-lg font-semibold">{error}</span>
      </div>
    )
  }

  // Show a warning if the API returned null/undefined for any value
  const showWarning =
    totalUsers === null || totalEarnings === null || pendingCommissions === null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Admin Header with Logout */}
      <header className="flex justify-between items-center max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded hover:bg-blue-100 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7 text-blue-700" />
          </button>
          <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2">
          {/* --- Fix Duplicate Commissions Button --- */}
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-700"
            onClick={handleFixDuplicateCommissions}
            disabled={fixingDuplicates}
          >
            {fixingDuplicates ? "Fixing..." : "Fix Duplicate Commissions"}
          </button>
          {fixDuplicatesMsg && (
            <span className="ml-2 text-sm text-yellow-700">{fixDuplicatesMsg}</span>
          )}
          <button
            className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-800"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>
      {/* Hamburger Menu (always visible for all screen sizes) */}
      {mobileMenuOpen && (
        <div className="bg-white/95 border-t border-blue-100 px-4 pb-4 space-y-2 z-30">
          <div className="flex flex-col gap-2 mt-4">
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-blue-900"
              onClick={() => { setShowSection("withdrawals"); setMobileMenuOpen(false) }}
            >
              Withdrawal Requests
              {withdrawals.length > 0 && (
                <span className="ml-2 inline-block bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {withdrawals.length}
                </span>
              )}
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-blue-900"
              onClick={() => { setShowSection("users"); setMobileMenuOpen(false) }}
            >
              All Users
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-red-700"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold"
              onClick={() => {
                setShowSection(null)
                setMobileMenuOpen(false)
              }}
            >
              Dashboard Home
            </button>
          </div>
        </div>
      )}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* PIN Generation Section and Stats Cards */}
        {showSection === null && (
          <>
            {/* PIN Generation Section */}
            <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
              <label className="font-semibold text-blue-900">
                Number of PINs to generate:
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={pinCount}
                  onChange={e => setPinCount(Math.max(1, Number(e.target.value)))}
                  className="ml-2 px-2 py-1 border rounded w-20"
                  disabled={generating}
                />
              </label>
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-900"
                onClick={handleGeneratePins}
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate PINs"}
              </button>
              {genMsg && (
                <span className={`ml-4 text-sm ${genMsg.includes("Failed") ? "text-red-600" : "text-green-700"}`}>
                  {genMsg}
                </span>
              )}
            </div>
            {showWarning && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                Warning: Some stats could not be loaded. Please check your API and data.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
                <div className="text-gray-500 text-sm mb-2">Total Users</div>
                <div className="text-3xl font-bold text-blue-700">
                  {totalUsers !== null ? totalUsers : "—"}
                </div>
                <div className="text-xs text-green-600 mt-2">+12% from last month</div>
              </div>
              {/* Total Earnings */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-green-100">
                <div className="text-gray-500 text-sm mb-2">Total Earnings</div>
                <div className="text-3xl font-bold text-green-700">
                  {totalEarnings !== null ? `₦${totalEarnings.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-green-600 mt-2">+8% from last month</div>
              </div>
              {/* Pending Commissions */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-yellow-100">
                <div className="text-gray-500 text-sm mb-2">Pending Commissions</div>
                <div className="text-3xl font-bold text-yellow-700">
                  {pendingCommissions !== null ? `₦${pendingCommissions.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-2">Awaiting approval</div>
              </div>
            </div>
            {/* Withdrawal Requests Count Card */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-200">
                <div className="text-gray-500 text-sm mb-2">Withdrawal Requests</div>
                <div className="text-3xl font-bold text-blue-700">
                  {withdrawals.length}
                </div>
                <div className="text-xs text-blue-600 mt-2">Pending requests</div>
              </div>
            </div>

            {/* PINs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Available PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-orange-100">
                <div className="text-lg font-bold text-orange-700 mb-2">Available PINs</div>
                <div className="text-2xl font-bold mb-2">{availablePins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Ready for distribution</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {availablePins.length > 0 ? (
                    availablePins.map((pin, idx) => (
                      <div key={pin.id || idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled={sendingPinIds.includes(pin.id)}
                          onChange={() => handleSendPin(pin.id)}
                          aria-label="Mark as sent"
                        />
                        <span>{pin.code || pin.pin || pin.id}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-blue-700"
                          title="Copy PIN"
                          onClick={() => handleCopyPin(pin.code || pin.pin || pin.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <CopyIcon />
                        </button>
                        {copiedPin === (pin.code || pin.pin || pin.id) && (
                          <span className="ml-1 text-green-600 text-xs">Copied!</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No available PINs</div>
                  )}
                </div>
              </div>
              {/* Sent PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                <div className="text-lg font-bold text-blue-700 mb-2">Sent PINs</div>
                <div className="text-2xl font-bold mb-2">{sentPins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Marked as sent</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {sentPins.length > 0 ? (
                    sentPins.map((pin, idx) => (
                      <div key={pin.id || idx} className="flex items-center gap-2">
                        <span>{pin.code || pin.pin || pin.id}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-blue-700"
                          title="Copy PIN"
                          onClick={() => handleCopyPin(pin.code || pin.pin || pin.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <CopyIcon />
                        </button>
                        {copiedPin === (pin.code || pin.pin || pin.id) && (
                          <span className="ml-1 text-green-600 text-xs">Copied!</span>
                        )}
                        {pin.sentAt && (
                          <span className="ml-2 text-gray-400">Sent: {new Date(pin.sentAt.seconds ? pin.sentAt.seconds * 1000 : pin.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No sent PINs</div>
                  )}
                </div>
              </div>
              {/* Used PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <div className="text-lg font-bold text-green-700 mb-2">Used PINs</div>
                <div className="text-2xl font-bold mb-2">{usedPins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Used by users</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {usedPins.length > 0 ? (
                    usedPins.map((pin, idx) => (
                      <div key={pin.id || idx}>
                        {pin.code || pin.pin || pin.id}
                        {pin.usedBy && (
                          <span className="ml-2 text-gray-400">Used by: {pin.usedBy}</span>
                        )}
                        {pin.usedAt && (
                          <span className="ml-2 text-gray-400">Used: {new Date(pin.usedAt.seconds ? pin.usedAt.seconds * 1000 : pin.usedAt).toLocaleString()}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No used PINs</div>
                  )}
                </div>
              </div>
            </div>
            {/* Withdrawals and Users Table buttons for desktop */}
            {/* <div className="hidden md:flex gap-4 mb-8"> ... </div> */}
          </>
        )}

        {/* Withdrawals Section - Full Page */}
        {showSection === "withdrawals" && (
          <div className="w-full">
            <button
              className="mb-4 px-4 py-2 rounded bg-blue-100 text-blue-900 font-semibold"
              onClick={() => setShowSection(null)}
            >
              ← Back to Dashboard
            </button>
            <div className="mb-12">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Withdrawal Requests</h2>
              {withdrawalsLoading ? (
                <div className="text-blue-700">Loading withdrawal requests...</div>
              ) : withdrawalsError ? (
                <div className="text-red-600">{withdrawalsError}</div>
              ) : withdrawals.length === 0 ? (
                <div className="text-gray-500">No withdrawal requests found.</div>
              ) : (
                <>
                  {/* Table for desktop/laptop */}
                  <div className="hidden md:block">
                    <table className="w-full bg-white rounded shadow text-xs md:text-base border border-blue-400 min-w-[800px]">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">User ID</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Email</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Requested Amount</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Net Amount (after 10%)</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Bank Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Account Number</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Account Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Status</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Requested At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w, idx) => (
                          <tr key={w.id || idx} className="border-b border-blue-300 last:border-none">
                            <td className="px-2 py-2 font-mono border border-blue-300 whitespace-normal break-words">{w.userId}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.name || "—"}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.email || "—"}</td>
                            <td className="px-2 py-2 font-semibold text-blue-900 border border-blue-300 whitespace-normal break-words">
                              ₦{Number(w.amount).toLocaleString()}
                            </td>
                            <td className="px-2 py-2 font-semibold text-green-900 border border-blue-300 whitespace-normal break-words">
                              ₦{Math.floor(Number(w.amount) * 0.9).toLocaleString()}
                            </td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.bankName}</td>
                            <td className="px-2 py-2 font-mono border border-blue-300 whitespace-normal break-words">{w.accountNumber}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.accountName}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">
                              {w.status === "pending" ? (
                                <button
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs md:text-base hover:bg-green-800"
                                  onClick={async () => {
                                    try {
                                      // Fetch user doc to get commissions
                                      const userRef = doc(db, "users", w.id)
                                      const userSnap = await getDocs(collection(db, "users"))
                                      const userDoc = userSnap.docs.find(d => d.id === w.id)
                                      let commissions = []
                                      if (userDoc) {
                                        commissions = Array.isArray(userDoc.data().commissions)
                                          ? userDoc.data().commissions
                                          : []
                                      }
                                      // Approve all requested commissions
                                      const updatedComms = commissions.map((c: any) =>
                                        (c.status === "requested" || c.requested)
                                          ? { 
                                              ...c, 
                                              status: "approved", 
                                              requested: false, 
                                              approved: true, // set approved: true when admin approves
                                              approvedAt: c.approvedAt || Date.now() // add approvedAt if not present
                                            }
                                          : c
                                      )
                                      await updateDoc(userRef, {
                                        requestedWithdrawals: 0,
                                        commissions: updatedComms,
                                      })
                                      setWithdrawals(prev =>
                                        prev.map(item =>
                                          item.id === w.id
                                            ? { ...item, status: "approved", amount: 0 }
                                            : item
                                        )
                                      )
                                    } catch (err) {
                                      alert("Failed to approve withdrawal")
                                    }
                                  }}
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="text-green-700 font-semibold">Approved</span>
                              )}
                            </td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">
                              {w.requestedAt
                                ? (w.requestedAt instanceof Date
                                    ? w.requestedAt.toLocaleString()
                                    : typeof w.requestedAt.toDate === "function"
                                      ? w.requestedAt.toDate().toLocaleString()
                                      : w.requestedAt)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Cards for mobile/tablet/small screens */}
                  <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
                    {withdrawals.map((w, idx) => (
                      <div
                        key={w.id || idx}
                        className="rounded-lg border border-blue-200 bg-white shadow p-3 text-xs sm:text-sm"
                        style={{
                          fontSize: '80%',
                          maxWidth: '100vw',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-blue-900 text-base">{w.name || "—"}</span>
                          <span className="font-mono text-gray-500">{w.userId}</span>
                        </div>
                        <div className="mb-1 text-gray-700">{w.email || "—"}</div>
                        <div className="mb-1">
                          <span className="font-semibold">Requested:</span>{" "}
                          <span className="text-blue-900 font-bold text-base">₦{Number(w.amount).toLocaleString()}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Net (after 10%):</span>{" "}
                          <span className="text-green-900 font-bold text-base">₦{Math.floor(Number(w.amount) * 0.9).toLocaleString()}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Bank:</span> {w.bankName}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Account No:</span> <span className="font-mono">{w.accountNumber}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Account Name:</span> {w.accountName}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Status:</span>{" "}
                          {w.status === "pending" ? (
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-800"
                              onClick={async () => {
                                try {
                                  // Fetch user doc to get commissions
                                  const userRef = doc(db, "users", w.id)
                                  const userSnap = await getDocs(collection(db, "users"))
                                  const userDoc = userSnap.docs.find(d => d.id === w.id)
                                  let commissions = []
                                  if (userDoc) {
                                    commissions = Array.isArray(userDoc.data().commissions)
                                      ? userDoc.data().commissions
                                      : []
                                  }
                                  // Approve all requested commissions
                                  const updatedComms = commissions.map((c: any) =>
                                    (c.status === "requested" || c.requested)
                                      ? { 
                                          ...c, 
                                          status: "approved", 
                                          requested: false, 
                                          approved: true, // set approved: true when admin approves
                                          approvedAt: c.approvedAt || Date.now() // add approvedAt if not present
                                        }
                                      : c
                                  )
                                  await updateDoc(userRef, {
                                    requestedWithdrawals: 0,
                                    commissions: updatedComms,
                                  })
                                  setWithdrawals(prev =>
                                    prev.map(item =>
                                      item.id === w.id
                                        ? { ...item, status: "approved", amount: 0 }
                                        : item
                                    )
                                  )
                                } catch (err) {
                                  alert("Failed to approve withdrawal")
                                }
                              }}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-green-700 font-semibold">Approved</span>
                          )}
                        </div>
                        <div className="mb-1 text-gray-500">
                          <span className="font-semibold">Requested At:</span>{" "}
                          {w.requestedAt
                            ? (w.requestedAt instanceof Date
                                ? w.requestedAt.toLocaleString()
                                : typeof w.requestedAt.toDate === "function"
                                  ? w.requestedAt.toDate().toLocaleString()
                                  : w.requestedAt)
                            : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* --- Approved Commissions Section --- */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-green-900 mb-4">Approved Withdrawals</h2>
              {/* Search bar for approved withdrawals */}
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID"
                  className="w-full max-w-md px-3 py-2 border border-green-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Group and sum approved withdrawals by approvedAt */}
              {(() => {
                // Filter by search
                const filtered = approvedWithdrawals.filter(w => {
                  const q = search.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (w.name || "").toLowerCase().includes(q) ||
                    (w.email || "").toLowerCase().includes(q) ||
                    (w.userId || "").toLowerCase().includes(q)
                  )
                })
                // Group by approvedAt (use string date for grouping)
                const groups: Record<string, { approvedAt: any, total: number, items: any[] }> = {}
                filtered.forEach(w => {
                  let key = ""
                  if (typeof w.approvedAt === "number") {
                    key = new Date(w.approvedAt).toLocaleString()
                  } else if (w.approvedAt?.toDate) {
                    key = w.approvedAt.toDate().toLocaleString()
                  } else {
                    key = String(w.approvedAt)
                  }
                  if (!groups[key]) {
                    groups[key] = { approvedAt: w.approvedAt, total: 0, items: [] }
                  }
                  groups[key].total += Number(w.amount) || 0
                  groups[key].items.push(w)
                })
                const groupList = Object.entries(groups)
                  .sort((a, b) => {
                    // Sort by approvedAt descending
                    const aTime = a[1].items[0]?.approvedAt
                    const bTime = b[1].items[0]?.approvedAt
                    const aNum = typeof aTime === "number" ? aTime : aTime?.toDate?.()?.getTime?.() || 0
                    const bNum = typeof bTime === "number" ? bTime : bTime?.toDate?.()?.getTime?.() || 0
                    return bNum - aNum
                  })
                if (groupList.length === 0) {
                  return <div className="text-gray-500">No approved withdrawals found.</div>
                }
                // Calculate total sum for all groups
                const totalApprovedSum = groupList.reduce((sum, [, group]) => sum + group.total, 0)
                // Show each group as a single row/card with summed amount
                return (
                  <>
                    {/* Table for desktop/laptop */}
                    <div className="hidden md:block">
                      <table className="w-full bg-white rounded shadow text-xs md:text-base border border-green-400">
                        <thead>
                          <tr className="bg-green-50">
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Approved At</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Total Amount</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">User(s)</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Email(s)</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupList.map(([key, group], idx) => (
                            <tr key={key + idx} className="border-b border-green-300 last:border-none">
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">{key}</td>
                              <td className="px-2 py-2 border border-green-300 font-semibold text-green-900 whitespace-normal break-words">
                                ₦{group.total.toLocaleString()}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {/* Show unique users for this group */}
                                {Array.from(new Set(group.items.map(i => `${i.userId} - ${i.name}`))).join(", ")}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {/* Show unique emails for this group */}
                                {Array.from(new Set(group.items.map(i => i.email))).join(", ")}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {group.items.length}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Cards for mobile/tablet/small screens */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                      {groupList.map(([key, group], idx) => (
                        <div
                          key={key + idx}
                          className="rounded-lg border border-green-300 bg-white shadow p-3 text-xs sm:text-sm"
                          style={{
                            fontSize: '80%',
                            maxWidth: '100vw',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div className="mb-1">
                            <span className="font-semibold">Approved At:</span>{" "}
                            {key}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Total Amount:</span>{" "}
                            <span className="text-green-900 font-bold text-base">₦{group.total.toLocaleString()}</span>
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">User(s):</span>{" "}
                            {Array.from(new Set(group.items.map(i => `${i.userId} - ${i.name}`))).join(", ")}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Email(s):</span>{" "}
                            {Array.from(new Set(group.items.map(i => i.email))).join(", ")}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Count:</span> {group.items.length}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Show total approved sum below the table/cards */}
                    <div className="mt-4 text-lg font-bold text-green-900">
                      Total Approved Amount: ₦{totalApprovedSum.toLocaleString()}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Users Table Section - Full Page */}
        {showSection === "users" && (
          <div className="w-full">
            <button
              className="mb-4 px-4 py-2 rounded bg-blue-100 text-blue-900 font-semibold"
              onClick={() => setShowSection(null)}
            >
              ← Back to Dashboard
            </button>
            <div className="max-w-5xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6">All Users</h2>
              {/* Search Bar */}
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, user ID, or collection ID"
                  className="w-full max-w-md px-3 py-2 border border-blue-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {usersLoading ? (
                <div className="p-8 text-center">Loading users...</div>
              ) : (
                // Show full table on desktop/laptop, scrollable only on tablet/mobile
                <div className="w-full overflow-x-auto md:overflow-x-visible">
                  <table className="min-w-[700px] w-full border-2 border-blue-400 rounded text-sm sm:text-base">
                    <thead>
                      <tr>
                        <th className="border-2 border-blue-400 px-2 py-1">Name</th>
                        <th className="border-2 border-blue-400 px-2 py-1">User ID</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Collection ID</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Email</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Location</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Select</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Product Status</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Activation Date</th> {/* New column */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.name}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.userId}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.collectionId}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.email}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.location}</td>
                          <td className="border-2 border-blue-400 px-2 py-1 text-center">
                            <input
                              type="checkbox"
                              checked={!!u.deliveryStatus?.isProductDelivered}
                              disabled={!!u.deliveryStatus?.isProductDelivered || updatingUserId === u.id}
                              onChange={() => handleDeliveryStatusCheck(u)}
                            />
                          </td>
                          <td className="border-2 border-blue-400 px-2 py-1 text-center">
                            {u.deliveryStatus?.isProductDelivered
                              ? <span className="text-green-700 font-semibold">Collected</span>
                              : <span className="text-gray-500">Not Collected</span>
                            }
                          </td>
                          <td className="border-2 border-blue-400 px-2 py-1">
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
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

/*
Move this file to:
e:\Globalorion\app\admin\dashboard\page.tsx

So the structure should be:
e:\Globalorion\app\admin\dashboard\page.tsx
*/

// No code changes needed, just rename the file as described above.

// No code changes needed in this file for your build error.
// To fix the build error with Next.js 14, you must remove the conflicting API route files:
// You cannot have both of these files at the same time:
//   - pages/api/admin/stats.ts
//   - app/api/admin/stats/route.ts
// 
// Solution:
// 1. If you are using the new app router (recommended for Next.js 13+):
//    Delete: pages/api/admin/stats.ts
// 2. If you want to use the old pages router:
//    Delete: app/api/admin/stats/route.ts
// 
// Only one file should exist for the /api/admin/stats endpoint. Remove the other, then redeploy.

// Your admin dashboard is already set up to update live (users, pins, withdrawals) using Firestore's onSnapshot.
// No redeploy or push is needed for live updates as long as you keep using onSnapshot for your data sources.

// IMPORTANT: To avoid build errors when pushing new changes and rebuilding (in any Vercel region, including Brazil):
// 1. Make sure you do NOT have both of these files in your project at the same time:
//      - pages/api/admin/stats.ts
//      - app/api/admin/stats/route.ts
// 2. If you are using the app router (recommended for Next.js 13+), DELETE pages/api/admin/stats.ts.
// 3. If you are using the old pages router, DELETE app/api/admin/stats/route.ts.
// 4. Only one file should exist for the /api/admin/stats endpoint.
// 5. After removing the duplicate, commit and push your changes, then redeploy.

// Your dashboard is already set up for live updates using Firestore's onSnapshot.
// No further code changes are needed for live data or for successful builds.