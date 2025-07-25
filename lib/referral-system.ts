import { doc, getDoc, updateDoc, Timestamp, getDocs, query, collection, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { calculateMatrixRequirements } from "./matrix-calculator"

// --- Referral creation ---
export interface CreateReferralData {
  sponsorId: string
  referredUserId: string
  referredUserName: string
  referredUserEmail: string
  level: number
}

// Add commission to user's commissions array
export async function createCommission(
  userId: string,
  amount: number,
  type: string,
  description: string,
  sourceUserId?: string,
  level?: number,
  parentId?: string
) {
  try {
    // Find user doc
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    if (userSnap.empty) return false
    const userDoc = userSnap.docs[0]
    const userData = userDoc.data()
    const prevCommissions = Array.isArray(userData.commissions) ? userData.commissions : []
    // --- Prevent duplicate commission by sourceUserId ---
    const srcId = (sourceUserId || "").toString().trim().toUpperCase()
    const alreadyExists = prevCommissions.some(
      (c: any) => (c.sourceUserId || c.levelId || "").toString().trim().toUpperCase() === srcId
    )
    if (alreadyExists) {
      // Do not add duplicate commission
      return false
    }
    const commission = {
      userId,
      amount,
      type,
      description,
      status: "pending",
      createdAt: Timestamp.now(),
      ...(sourceUserId ? { sourceUserId } : {}),
      ...(level ? { level } : {}),
      parentId: parentId || "",
      levelId: sourceUserId || "",
      requested: false,
    }
    await updateDoc(doc(db, "users", userDoc.id), {
      commissions: [...prevCommissions, commission],
      pendingEarnings: (userData.pendingEarnings || 0) + amount,
    })
    return true
  } catch (error) {
    return false
  }
}

// Traverse referral tree using user doc arrays (not collections)
export async function getReferralTree(userId: string, maxLevel = 6) {
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
  if (userSnap.empty) return []
  const user = userSnap.docs[0].data()
  const referrals = Array.isArray(user.referrals) ? user.referrals : []
  function traverse(refs: any[], sponsorId: string, level: number): any[] {
    if (level > maxLevel) return []
    const children = refs.filter(ref => ref.sponsorId === sponsorId)
    return children.map(child => ({
      ...child,
      level,
      children: traverse(refs, child.referredUserId, level + 1),
    }))
  }
  return traverse(referrals, userId, 1)
}

// Remove any duplicate definitions above this point!

// Helper: Traverse a referral tree up to 6 levels and collect commissions per branch, also collect the branch path and info per level
async function traverseReferralTreeWithPath(
  userId: string,
  referral: any,
  commissionAmounts: number[],
  level: number,
  branch: any[],
  commissions: any[]
) {
  if (level > 6) return;
  const commission = {
    userId,
    amount: commissionAmounts[level - 1],
    type: "referral_bonus",
    description: `Referral bonus for ${referral.referredUserName || referral.name} (${referral.referredUserId}) at level ${level}`,
    status: "pending",
    createdAt: referral.joinedAt || referral.createdAt || new Date(),
    sourceUserId: referral.referredUserId,
    level,
    referral: referral,
    // Add name and id for this level
    levelName: referral.referredUserName || referral.name || "",
    levelId: referral.referredUserId || "",
    parentId: userId // <-- Add parentId
  };
  commissions.push(commission);
  branch.push({
    ...referral,
    level,
    levelName: commission.levelName,
    levelId: commission.levelId,
    amount: commission.amount,
  });
  // Find the next referral in this branch (downline of this referral)
  const subRefsSnap = await getDocs(
    query(
      collection(db, "referrals"),
      where("sponsorId", "==", referral.referredUserId)
    )
  );
  if (!subRefsSnap.empty) {
    // Only follow the first downline in this branch (single branch per direct referral)
    const subRefs = subRefsSnap.docs.map(doc => doc.data());
    if (subRefs.length > 0) {
      await traverseReferralTreeWithPath(userId, subRefs[0], commissionAmounts, level + 1, branch, commissions);
    }
  }
}

// Recalculate commissions for a user and their direct referral trees (returns array of branches for differentiation)


// Helper: Recursively collect all users at each level under a given user
async function collectUsersByLevel(
  userId: string,
  currentLevel: number,
  maxLevel: number,
  result: Record<number, any[]>
) {
  if (currentLevel > maxLevel) return;
  const referralsSnap = await getDocs(
    query(collection(db, "referrals"), where("sponsorId", "==", userId))
  );
  const referrals = referralsSnap.docs.map(doc => doc.data());
  if (!result[currentLevel]) result[currentLevel] = [];
  for (const ref of referrals) {
    result[currentLevel].push(ref);
    await collectUsersByLevel(ref.referredUserId, currentLevel + 1, maxLevel, result);
  }
}

// Recalculate commissions for a user and their full referral tree (all users at each level, no cap)
export async function recalculateUserCommissions(userId: string) {
  // Get all direct referrals (level 1)
  const referralsSnap = await getDocs(
    query(collection(db, "referrals"), where("sponsorId", "==", userId))
  );
  const directReferrals = referralsSnap.docs.map(doc => doc.data());

  const commissionAmounts = [4000, 2000, 2000, 1500, 1500, 1500];
  const maxLevels = 6;
  let allBranches: any[] = [];
  let allCommissions: any[] = [];

  for (const directRef of directReferrals) {
    const usersByLevel: Record<number, any[]> = {};
    usersByLevel[1] = [directRef];
    await collectUsersByLevel(directRef.referredUserId, 2, maxLevels, usersByLevel);

    let branchCommissions: any[] = [];
    let branch: any[] = [];
    for (let lvl = 1; lvl <= maxLevels; lvl++) {
      const users = usersByLevel[lvl] || [];
      for (const user of users) {
        branchCommissions.push({
          userId,
          amount: commissionAmounts[lvl - 1],
          type: "referral_bonus",
          description: `Referral bonus for ${user.referredUserName || user.name} (${user.referredUserId}) at level ${lvl}`,
          status: "pending",
          createdAt: user.joinedAt || user.createdAt || new Date(),
          sourceUserId: user.referredUserId,
          level: lvl,
          levelName: user.referredUserName || user.name || "",
          levelId: user.referredUserId || "",
          parentId: userId // <-- Add parentId
        });
      }
      // For branch path display, push the first user at each level (for visual chain)
      if (users.length > 0) {
        branch.push({
          ...users[0],
          level: lvl,
          levelName: users[0].referredUserName || users[0].name || "",
          levelId: users[0].referredUserId || "",
          amount: commissionAmounts[lvl - 1],
        });
      }
    }
    allBranches.push({
      directReferral: directRef,
      branch,
      commissions: branchCommissions,
      total: branchCommissions.reduce((sum, c) => sum + (c.amount || 0), 0),
      usersByLevel,
    });
    allCommissions.push(...branchCommissions);
  }

  // Update user's commissions array in users collection (flat list for legacy UI)
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
  if (!userSnap.empty) {
    const userDoc = userSnap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), {
      commissions: allCommissions,
    });
  }
  // Return array of branches for UI to differentiate each direct referral and its tree
  return allBranches;
}

// --- Matrix placement (basic guidance) ---
// You should have a "matrix" collection with documents like:
// { userId, parentId, leftChild, rightChild, level, position, isComplete, createdAt, updatedAt }
// When a user registers, add them to the matrix under their upline or sponsor.
// See your lib/matrix-calculator.ts for calculation logic.

// --- What you need in Firestore ---
// 1. "referrals" collection (already used)
// 2. "users" collection with a "downlines" array field (already used)
// 3. "matrix" collection for matrix positions (see your MatrixDocument and matrix-calculator.ts)
//    - When a user registers, create a matrix node for them and update their upline's leftChild/rightChild if needed.

// --- To check if everything works ---
// - "referrals" collection should get a new doc for each referral.
// - Sponsor's "downlines" array in "users" should include the new user's userId.
// - "matrix" collection should have a node for each user, with correct parentId/level/position.
// - Use your matrix-calculator.ts utilities to manage matrix logic.

// No error signs, all types and logic are compatible with TypeScript and Firebase.
//    - When a user registers, create a matrix node for them and update their upline's leftChild/rightChild if needed.

// --- To check if everything works ---
// - "referrals" collection should get a new doc for each referral.
// - Sponsor's "downlines" array in "users" should include the new user's userId.
// - "matrix" collection should have a node for each user, with correct parentId/level/position.
// - Use your matrix-calculator.ts utilities to manage matrix logic.

// No error signs, all types and logic are compatible with TypeScript and Firebase.

// Add this helper to always trim IDs
function normalizeId(id: string): string {
  return (id || "").trim().toUpperCase();
}

// --- Commission rates per level ---
const COMMISSION_AMOUNTS = [4000, 2000, 2000, 1500, 1500, 1500];

// --- Create referral and commissions for all 6 levels (correct chain, no duplicates) ---
export async function createReferral(referralData: CreateReferralData) {
  try {
    const sponsorId = normalizeId(referralData.sponsorId);
    const referredUserId = normalizeId(referralData.referredUserId);

    // Find sponsor user doc
    const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", sponsorId)));
    if (sponsorSnap.empty) return false;
    const sponsorDoc = sponsorSnap.docs[0];
    const sponsorData = sponsorDoc.data();

    // Add to referrals array
    const prevReferrals = Array.isArray(sponsorData.referrals) ? sponsorData.referrals : [];
    const alreadyReferral = prevReferrals.some((r: any) => normalizeId(r.referredUserId) === referredUserId);
    const newReferrals = alreadyReferral
      ? prevReferrals
      : [
          ...prevReferrals,
          {
            ...referralData,
            sponsorId, // normalized
            referredUserId, // normalized
            status: "active",
            joinedAt: Timestamp.now(),
          }
        ];
    // Add to downlines array
    const prevDownlines = Array.isArray(sponsorData.downlines) ? sponsorData.downlines : [];
    const newDownlines = prevDownlines.map(normalizeId).includes(referredUserId)
      ? prevDownlines
      : [...prevDownlines, referredUserId];
    await updateDoc(doc(db, "users", sponsorDoc.id), {
      referrals: newReferrals,
      downlines: newDownlines,
    });

    // --- Create commissions for correct uplines only ---
    let currentSponsorId = sponsorId;
    let currentUserId = referredUserId;
    for (let level = 1; level <= 6; level++) {
      // Find sponsor doc for this level
      const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentSponsorId)));
      if (sponsorSnap.empty) break;
      const sponsorDoc = sponsorSnap.docs[0];
      const sponsorData = sponsorDoc.data();

      // Only create commission for the correct user at this level
      const prevCommissions = Array.isArray(sponsorData.commissions) ? sponsorData.commissions : [];
      // --- Prevent duplicate commission by sourceUserId and level ---
      const alreadyCommission = prevCommissions.some((c: any) =>
        normalizeId(c.sourceUserId) === currentUserId && c.level === level
      );
      if (!alreadyCommission) {
        const commission = {
          userId: currentSponsorId,
          amount: COMMISSION_AMOUNTS[level - 1],
          type: "referral_bonus",
          description: `Referral bonus for ${referralData.referredUserName || referralData.referredUserId} (${currentUserId}) at level ${level}`,
          status: "pending",
          createdAt: Timestamp.now(),
          sourceUserId: currentUserId,
          level,
          parentId: currentSponsorId,
          levelId: currentUserId,
          requested: false,
        };
        await updateDoc(doc(db, "users", sponsorDoc.id), {
          commissions: [...prevCommissions, commission],
          pendingEarnings: (sponsorData.pendingEarnings || 0) + COMMISSION_AMOUNTS[level - 1],
        });
      }

      // Move up the tree for next level
      // Only follow the actual sponsor chain
      if (!sponsorData.sponsorId || normalizeId(sponsorData.sponsorId) === currentSponsorId) break;
      currentUserId = currentSponsorId;
      currentSponsorId = normalizeId(sponsorData.sponsorId);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// --- Fix referral, downline, and commissions for all 6 levels for any user ---
export async function fixReferralForUser(userIdRaw: string) {
  const userId = normalizeId(userIdRaw);
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
  if (userSnap.empty) return;
  const userDoc = userSnap.docs[0];
  const userData = userDoc.data();
  const sponsorId = userData.sponsorId ? normalizeId(userData.sponsorId) : null;
  // Only fix if sponsorId exists and is not empty and not self-referral
  if (sponsorId && sponsorId !== userId) {
    // Fix referral and commissions for all 6 levels
    await createReferral({
      sponsorId,
      referredUserId: userId,
      referredUserName: userData.name || userData.userName || "",
      referredUserEmail: userData.email || "",
      level: 1,
    });
  }
}

// Call this after every new user registration to guarantee referral/commissions for all 6 levels
export async function handleUserRegistrationReferral(newUser: {
  userId: string,
  sponsorId: string,
  name?: string,
  email?: string
}) {
  // Only run if sponsorId exists and is not self-referral
  if (
    newUser.userId &&
    newUser.sponsorId &&
    normalizeId(newUser.sponsorId) !== normalizeId(newUser.userId)
  ) {
    await createReferral({
      sponsorId: newUser.sponsorId,
      referredUserId: newUser.userId,
      referredUserName: newUser.name || "",
      referredUserEmail: newUser.email || "",
      level: 1,
    });
  }
}
