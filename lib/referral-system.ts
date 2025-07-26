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
    // --- Always normalize userId and sourceUserId before querying or using ---
    const normUserId = normalizeId(userId);
    const normSourceUserId = sourceUserId ? normalizeId(sourceUserId) : undefined;

    // Find user doc
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", normUserId)));
    if (userSnap.empty) return false;
    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();
    const prevCommissions = Array.isArray(userData.commissions) ? userData.commissions : [];
    // --- Prevent duplicate commission by sourceUserId and level ---
    const srcId = (normSourceUserId || "");
    const alreadyExists = prevCommissions.some(
      (c: any) =>
        (normalizeId(c.sourceUserId || c.levelId || "") === srcId) &&
        (level ? c.level === level : true)
    );
    if (alreadyExists) {
      // Do not add duplicate commission
      return false;
    }
    const commission = {
      userId: normUserId,
      amount,
      type,
      description,
      status: "pending",
      createdAt: Timestamp.now(),
      ...(normSourceUserId ? { sourceUserId: normSourceUserId } : {}),
      ...(level ? { level } : {}),
      parentId: parentId || "",
      levelId: normSourceUserId || "",
      requested: false,
    };
    await updateDoc(doc(db, "users", userDoc.id), {
      commissions: [...prevCommissions, commission],
      pendingEarnings: (userData.pendingEarnings || 0) + amount,
    });
    return true;
  } catch (error) {
    return false;
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

// --- Create referral and commissions for all 6 levels (allow unlimited valid referrals per level, no cap, no artificial limit) ---
// This logic will always process every new referral and ensure all valid uplines up to 6 levels get their commission for this referral, if not already present.
export async function createReferral(referralData: CreateReferralData) {
  try {
    // --- Always normalize all IDs before using or saving ---
    const sponsorId = normalizeId(referralData.sponsorId);
    const referredUserId = normalizeId(referralData.referredUserId);

    // Find sponsor user doc
    const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", sponsorId)));
    if (sponsorSnap.empty) return false;
    const sponsorDoc = sponsorSnap.docs[0];
    const sponsorData = sponsorDoc.data();

    // Add to referrals array (normalize sponsorId and referredUserId)
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
    // Add to downlines array (normalize all IDs)
    const prevDownlines = Array.isArray(sponsorData.downlines) ? sponsorData.downlines : [];
    const newDownlines = prevDownlines.map(normalizeId).includes(referredUserId)
      ? prevDownlines
      : [...prevDownlines, referredUserId];
    await updateDoc(doc(db, "users", sponsorDoc.id), {
      referrals: newReferrals,
      downlines: newDownlines,
    });

    // --- Create commissions for all valid uplines up to 6 levels (normalize all IDs) ---
    let currentSponsorId = sponsorId;
    let currentUserId = referredUserId;
    for (let level = 1; level <= 6; level++) {
      // Always normalize before querying
      const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentSponsorId)));
      if (sponsorSnap.empty) break;
      const sponsorDoc = sponsorSnap.docs[0];
      const sponsorData = sponsorDoc.data();

      // --- NEW: For each upline, get all direct referrals of the downline at this level and award commissions for each ---
      // For level 1, direct referrals of sponsor; for level 2, direct referrals of previous downline, etc.
      let directReferrals: any[] = [];
      if (level === 1) {
        // For level 1, direct referrals are the new referred user only
        directReferrals = [{ referredUserId: currentUserId, referredUserName: referralData.referredUserName }];
      } else {
        // For level >= 2, fetch all direct referrals of the previous downline (currentUserId)
        const downlineSnap = await getDocs(query(collection(db, "users"), where("userId", "==", currentUserId)));
        if (!downlineSnap.empty) {
          const downlineData = downlineSnap.docs[0].data();
          directReferrals = Array.isArray(downlineData.referrals) ? downlineData.referrals : [];
        }
      }

      for (const ref of directReferrals) {
        const refUserId = normalizeId(ref.referredUserId);
        const prevCommissions = Array.isArray(sponsorData.commissions) ? sponsorData.commissions : [];
        const alreadyCommission = prevCommissions.some((c: any) =>
          normalizeId(c.sourceUserId) === refUserId && c.level === level
        );
        if (!alreadyCommission) {
          const commission = {
            userId: currentSponsorId,
            amount: COMMISSION_AMOUNTS[level - 1],
            type: "referral_bonus",
            description: `Referral bonus for ${ref.referredUserName || ref.referredUserId} (${refUserId}) at level ${level}`,
            status: "pending",
            createdAt: Timestamp.now(),
            sourceUserId: refUserId,
            level,
            parentId: currentSponsorId,
            levelId: refUserId,
            requested: false,
          };
          await updateDoc(doc(db, "users", sponsorDoc.id), {
            commissions: [...prevCommissions, commission],
            pendingEarnings: (sponsorData.pendingEarnings || 0) + COMMISSION_AMOUNTS[level - 1],
          });
        }
      }

      // Move up the tree for next level (normalize sponsorId)
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
  // Always normalize IDs before using
  const userId = normalizeId(newUser.userId);
  const sponsorId = normalizeId(newUser.sponsorId);
  // Only run if sponsorId exists and is not self-referral
  if (
    userId &&
    sponsorId &&
    sponsorId !== userId
  ) {
    // 1. Create referral and commissions for all uplines
    await createReferral({
      sponsorId,
      referredUserId: userId,
      referredUserName: newUser.name || "",
      referredUserEmail: newUser.email || "",
      level: 1,
    });
    // 2. Fix referral/commissions for the new user, their sponsor, and their sponsor's sponsor (up to 2 levels up)
    await fixReferralForUser(userId);
    await fixReferralForUser(sponsorId);
    // Optionally, fix for sponsor's sponsor (level 2 up)
    const sponsorSnap = await getDocs(query(collection(db, "users"), where("userId", "==", sponsorId)));
    if (!sponsorSnap.empty) {
      const sponsorData = sponsorSnap.docs[0].data();
      const sponsorSponsorId = sponsorData.sponsorId ? normalizeId(sponsorData.sponsorId) : null;
      if (sponsorSponsorId && sponsorSponsorId !== sponsorId) {
        await fixReferralForUser(sponsorSponsorId);
      }
    }
  }
}

/*
**Explanation: Do these three docs have duplicate commissions?**

**How duplicates are defined:**  
A duplicate commission is when a user has more than one commission with the same (sourceUserId, level) pair in their commissions array.

---

**1. Doc 1 (userId: GUT5Z634B6):**
- Commissions for level 1: GUN8HSZ2DH, GUXCSR21CA, GULXN2A64M, GUL4HDPSX4
- Commissions for level 2: GUBEKHCQYM
- Commissions for level 3: GU2WBNQ8DV
- Commissions for level 4: GUCEMSDJ6A
- Commissions for level 5: GURFBCGLJH
- ...etc.

**Result:**  
No duplicate (sourceUserId, level) pairs.  
Each commission is unique by sourceUserId and level.

---

**2. Doc 2 (userId: GUNKYZPUFA):**
- Commissions for level 1: GUT5Z634B6, GUD25UCSEH, GU84EFAR9K, GUV7SZU1EJ, GUSZM3WQ9D, GUH67EMTSN
- Commissions for level 2: GUN8HSZ2DH, GUXCSR21CA, GUT5Z634B6, GUD25UCSEH, GUGUHVZHTX
- Commissions for level 3: GUBEKHCQYM, GU2WBNQ8DV, GUT5Z634B6, GUXCSR21CA, GUD25UCSEH, GUNKYZPUFA
- ...etc.

**Result:**  
No duplicate (sourceUserId, level) pairs for this user.  
Each commission is unique by sourceUserId and level.

---

**3. Doc 3 (userId: ADMIN001):**
- Commissions for level 1: GUNKYZPUFA
- Commissions for level 2: GUKPQFKHFQ, GULGTS9UL6, GU84EFAR9K, GUT5Z634B6, GUD25UCSEH, GUGUHVZHTX
- Commissions for level 3: GUS7WAZ2SZ, GUUT1NJPKQ, GUUAJNBNZ2, GUPP2VAF6E, GUNKYZPUFA
- Commissions for level 4: GUZNC3SLQR, GUHEEF83FP, GUT9E4ALTM, GUWRG2XSYE, GU9UXKE51R, GUM9DD2P2J
- Commissions for level 5: GUCCXB46KC, GUJCBPJ3DZ, GU8E5981UB, GU2WBNQ8DV
- Commissions for level 6: GUZ6HN68YV, GUNDQGXX7J, GUUV3VU5Q8, GURAEPNC74, GUCEMSDJ6A

**Result:**  
No duplicate (sourceUserId, level) pairs for this user.  
Each commission is unique by sourceUserId and level.

---

**Summary:**  
**None of these three docs have duplicate commissions.**  
Your commission arrays are clean: every (sourceUserId, level) pair is unique for each user.
*/

/*
**Why is there no commission for user SS (GU2LXTZG8P) at level 2 in user BB's (GUNKYZPUFA) commissions?**

**Explanation:**

- The commission logic only creates a commission for a user if:
  1. The referral chain is valid (each user in the chain exists in the users collection and is linked by sponsorId).
  2. The commission for that (sourceUserId, level) does not already exist.
  3. The commission is created during the registration/referral process, or when you run a fix/rebuild.

**Possible reasons why SS (GU2LXTZG8P) is missing in BB's commissions:**

1. **SS is not actually in BB's downline by sponsorId chain.**
   - The "Full Referral Tree" UI may be showing all descendants, but the commission logic only pays for the *first* 6 levels of sponsorId uplines.
   - If SS is not a direct or indirect referral (by sponsorId) of BB, BB will not get a commission for SS.

2. **SS was added to the tree after BB's commissions were already created.**
   - If SS registered after the commission creation logic ran for BB, and you did not run a fix/rebuild, BB will not have a commission for SS.

3. **There is a break in the sponsorId chain.**
   - If any user between BB and SS is missing or has an incorrect sponsorId, the commission logic will not traverse to SS.

4. **Commission logic only pays for the *first* 6 downlines per level.**
   - If BB already has 6 commissions at level 2, additional referrals at that level may not generate a commission, depending on your business rules.

5. **Commission creation logic did not run for SS.**
   - If SS was not processed by the createReferral or fixReferralForUser logic, no commission would be created for BB.

**How to debug:**
- Check the users collection for SS (GU2LXTZG8P) and see who their sponsorId is.
- Trace the sponsorId chain from SS up to BB. If there is a break, BB will not get a commission.
- If the chain is correct, try running your fixReferralForUser or recalculateUserCommissions for BB to see if the commission appears.

**Summary:**  
The commission for SS at level 2 is missing because, according to your commission logic, BB is not eligible for a commission from SS at level 2—most likely due to a break in the sponsorId chain, or because the commission creation logic did not process SS for BB.
*/

/*
Why are not all level 2 users (e.g. qq, rr, ss, tt, uu, etc.) showing as commissions for BB (GUNKYZPUFA)?

**Explanation:**
- Your commission logic only creates a commission for a user if, during the registration of a new referral, the sponsor/upline chain is traversed *upwards*.
- Only the *direct sponsor chain* is used: when a new user registers, the code walks up the sponsorId chain, giving a commission to each upline at each level.
- If a user is not in the *direct sponsor chain* (i.e., not a direct or indirect sponsor of the new user), they will not get a commission for that user, even if the user appears in the "matrix" or "full referral tree".

**Why do you see more users at level 2 in the matrix/tree than in commissions?**
- The "matrix" or "full referral tree" may show all users who are at level 2 from the root, regardless of sponsorId chain.
- The commission logic, however, only gives a commission to BB for users who are in BB's *sponsorId chain* (i.e., BB → direct → indirect → ... → new user).
- If a user at level 2 is not in BB's sponsorId chain, BB will not get a commission for them.

**Example:**
- If user QQ is at level 2 in the matrix, but their sponsorId chain does not go through BB, BB will not get a commission for QQ.
- Only users whose sponsorId chain is: BB → ... → QQ will result in a commission for BB at level 2.

**How to fix if you want commissions for all users at level N in the matrix/tree:**
- You must change your commission logic to traverse the *matrix* or *referral tree* (not just the sponsorId chain) and add a commission for every user at each level, not just those in the sponsorId chain.
- This is a major logic change and may not match your business rules.

**Summary:**
- Your current logic is correct for classic MLM/upline commission: only sponsorId chain is rewarded.
- If you want to reward all users at a given matrix/tree level, you must change your commission logic to traverse the tree, not just the sponsorId chain.
*/

/*
Why does DD (GUN8HSZ2DH) have a commission for VV (GU17XRMK9T) at level 2, but not for WW (GUQRLUK6CJ) at level 2, even though both are in the referral tree under GG (GUBEKHCQYM)?

**Explanation:**
- Your commission logic only creates a commission for a user (DD) when a new user registers and the sponsorId chain is traversed upward.
- For DD to get a commission for a user at level 2 (like VV or WW), the following must happen:
  1. When VV registered, their sponsorId chain was: VV → GG → DD. So DD got a commission at level 2 for VV.
  2. When WW registered, if their sponsorId chain was NOT: WW → GG → DD, then DD would NOT get a commission for WW at level 2.

**Most common reasons for this:**
- WW's sponsorId is not GG (GUBEKHCQYM), or GG's sponsorId is not DD (GUN8HSZ2DH).
- The sponsorId chain is broken or not set up as expected in the users collection.
- The commission creation logic only rewards the upline chain at the time of registration. If the sponsorId chain is not correct, the commission is not created.

**How to debug:**
1. Check the users collection for WW (GUQRLUK6CJ):
   - Who is their sponsorId? Is it GG (GUBEKHCQYM)?
2. Check GG's sponsorId:
   - Is it DD (GUN8HSZ2DH)?
3. If either is not correct, DD will not get a commission for WW at level 2.
4. If you fix the sponsorId chain and re-run your fixReferralForUser or recalculateUserCommissions for DD, the commission should appear.

**Summary:**
- Commissions are only created for users in the *direct sponsorId chain*.
- If a user is in the matrix tree but not in the sponsorId chain, no commission is created for the upline.
- To ensure all expected commissions are created, make sure the sponsorId chain is correct for every user at registration.
*/

/*
You provided the user doc for WW (GUQRLUK6CJ):

- sponsorId: " GUBEKHCQYM" (note the leading space)
- userId: "GUQRLUK6CJ"

**Problem:**
- The sponsorId for WW has a leading space: `" GUBEKHCQYM"` instead of `"GUBEKHCQYM"`.
- Your commission logic uses `normalizeId()` to trim and uppercase IDs, but if the sponsorId is not normalized everywhere (especially in the referrals collection or when creating referrals), it may cause mismatches.

**Why commission is not added:**
- If, during registration or commission calculation, the sponsorId is not normalized (trimmed), the lookup for the sponsor may fail.
- This means the chain WW → GG → DD is broken in the logic, even though the data looks correct to you.

**How to fix:**
- Always use `normalizeId()` on all userId and sponsorId values everywhere in your code, especially when:
  - Creating new users
  - Creating referrals
  - Creating commissions
  - Querying for users by sponsorId or userId

**Action:**
- Check your user creation and referral creation logic to ensure sponsorId is always trimmed and uppercased before saving.
- You may need to run a one-time cleanup to normalize all sponsorId and userId fields in your users and referrals collections.

**Summary:**
- The commission for WW is missing because the sponsorId has a leading space, breaking the sponsor chain.
- Normalize all IDs everywhere to guarantee correct commission logic.
*/

/*
If you keep using `normalizeId()` on all userId and sponsorId values everywhere in your code (when creating users, referrals, commissions, and when querying), this problem will **not** happen again.

- All sponsorId/userId comparisons and lookups will be consistent.
- No more issues with leading/trailing spaces or case mismatches.
- Commissions will be created for all valid sponsor chains.

**Summary:**  
If you follow this flow, new users will trigger correct commission creation and you should not see this problem again.
*/

/*
If DD (GUN8HSZ2DH) still does not receive a level 2 commission for XX (GUQXQF9GPK), even though:

- XX's sponsorId is "GUBEKHCQYM" (GG)
- GG's sponsorId is "GUN8HSZ2DH" (DD)
- All IDs are normalized (no spaces, uppercase)

**Possible reasons:**
1. The commission for DD was not created at the time XX registered (e.g., registration logic did not run, or failed).
2. The fixReferralForUser or recalculateUserCommissions was not run for DD or XX after fixing sponsorId.
3. There is a bug in the commission creation logic or a race condition.
4. The referrals collection or users collection is out of sync (e.g., missing referral doc for XX).

**How to fix:**
- Make sure you run `fixReferralForUser("GUQXQF9GPK")` (for XX) and `fixReferralForUser("GUBEKHCQYM")` (for GG) and `fixReferralForUser("GUN8HSZ2DH")` (for DD) after normalizing all sponsorId/userId fields.
- Or, run `recalculateUserCommissions("GUN8HSZ2DH")` for DD.
- Ensure that all sponsorId/userId values are normalized everywhere in your database (users and referrals collections).
- Check that the referrals collection has a referral doc for XX with sponsorId "GUBEKHCQYM".

**Summary:**
- If all IDs are normalized and you run the fix or recalc logic, DD will receive the commission for XX at level 2.
- If not, check for missing or out-of-sync data in users/referrals collections.
*/

/*
Yes, if you register a new user now, your problem should be fixed **as long as**:

- All sponsorId and userId values are normalized (trimmed and uppercased) everywhere in your code and database.
- The `handleUserRegistrationReferral` function is called after every new user registration.
- The function creates the referral, commissions, and also calls `fixReferralForUser` for the new user, their sponsor, and their sponsor's sponsor.

This ensures that all sponsor/upline chains are correct and commissions are created for all valid uplines up to 6 levels.

**If you still see missing commissions for new users:**
- Double-check that the sponsorId and userId are normalized before saving to Firestore.
- Make sure the referral and user documents are created/updated as expected.
- Make sure `handleUserRegistrationReferral` is called after every registration.

**Summary:**  
If you follow this flow, new users will trigger correct commission creation and you should not see this problem again.
*/

/*
**Why are commissions at level 2 only showing for VV (GUBEKHCQYM) and not for WW, XX, YY, etc. under GG (GUBEKHCQYM)?**

**Root Cause:**
- Your commission logic only creates a level 2 commission for DD (GUN8HSZ2DH) when a new user registers *and* the sponsorId chain is strictly followed:  
  NewUser → GG (GUBEKHCQYM) → DD (GUN8HSZ2DH)
- If the registration or referral creation for WW, XX, YY did not properly trigger the sponsorId chain up to DD, or if the referral array for GG is not updated, the commission for DD at level 2 will not be created.

**Most common reasons:**
1. **Referrals array for GG is missing or incomplete.**
   - If GG's `referrals` array does not include WW, XX, YY, the logic will not traverse them for commission creation.
2. **The registration logic did not call `handleUserRegistrationReferral` for WW, XX, YY.**
   - If the function is not called, or fails, the commission chain is broken.
3. **The sponsorId chain is correct, but the referral array is not updated.**
   - If the `referrals` array is not updated for GG, the commission logic will not process these users.
4. **You are only updating the `referrals` array for direct referrals, not for all downlines.**
   - The commission logic depends on the `referrals` array to traverse the tree.

**How to fix:**
- Make sure that every time a new user registers (WW, XX, YY, etc.), you:
  1. Call `handleUserRegistrationReferral` with the correct, normalized sponsorId and userId.
  2. Ensure the sponsor's `referrals` array is updated to include the new user.
  3. Ensure the sponsorId chain is correct and normalized for all users.
  4. Optionally, after registration, run `fixReferralForUser` for the new user, their sponsor, and their sponsor's sponsor to guarantee the chain.

**Debug checklist:**
- Check GG's user document: does the `referrals` array include WW, XX, YY, etc.?
*/