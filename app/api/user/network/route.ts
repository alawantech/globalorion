import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Recursively fetch referrals up to a certain level
async function fetchReferralTree(userId: string, level: number, maxLevel: number) {
  if (level > maxLevel) return [];
  const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
  if (userSnap.empty) return [];
  const user = userSnap.docs[0].data();
  const referrals = user.referrals || [];
  let result: any[] = [];
  for (const ref of referrals) {
    result.push({
      userId: ref.referredUserId,
      name: ref.referredUserName,
      level,
    });
    // Recursively fetch next level using sponsorId only
    const subRefs = await fetchReferralTree(ref.referredUserId, level + 1, maxLevel);
    result = result.concat(subRefs);
  }
  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const maxLevel = parseInt(searchParams.get("maxLevel") || "6", 10);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const network = await fetchReferralTree(userId, 1, maxLevel);

  return NextResponse.json({ network });
}
