import { useEffect, useState } from "react";

// Helper to format the branch as a string
function formatBranch(branch: any[]) {
  return branch.map((ref) => ref.name || ref.userId).join(" → ");
}

// Helper to get commission per level
const COMMISSIONS = [4000, 2000, 2000, 1500, 1500, 1500];

export default function ReferralNetwork({ userId }: { userId: string }) {
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNetwork() {
      // Fetch the full tree
      const res = await fetch(`/api/user/network?userId=${userId}&maxLevel=6`);
      const data = await res.json();
      // Group by direct referral (level 1)
      const directRefs = data.network.filter((n: any) => n.level === 1);
      const all = data.network;
      // For each direct, build their branch (chain down to level 6)
      const branchList = directRefs.map((direct: any) => {
        let branch = [direct];
        let current = direct;
        for (let lvl = 2; lvl <= 6; lvl++) {
          const next = all.find(
            (n: any) =>
              n.level === lvl &&
              n.userId &&
              branch[branch.length - 1]?.userId ===
                n.userId?.slice(0, n.userId.length)
          );
          // Actually, find the next in the chain by parent/child relationship
          const nextNode = all.find(
            (n: any) =>
              n.level === lvl &&
              n.userId &&
              n.userId !== current.userId &&
              n.userId.startsWith(current.userId)
          );
          // But since we don't have parentId, just find the first at this level whose parent is previous userId
          const nextByParent = all.find(
            (n: any) => n.level === lvl && n.parentId === current.userId
          );
          // Fallback: find by sponsorId if available
          const nextBySponsor = all.find(
            (n: any) => n.level === lvl && n.sponsorId === current.userId
          );
          // Try to find the next in the chain
          const nextInChain =
            all.find((n: any) => n.level === lvl && n.parentId === current.userId) ||
            all.find((n: any) => n.level === lvl && n.sponsorId === current.userId);
          if (nextInChain) {
            branch.push(nextInChain);
            current = nextInChain;
          } else {
            break;
          }
        }
        return branch;
      });
      setBranches(branchList);
    }
    if (userId) fetchNetwork();
  }, [userId]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        Direct Referral Trees & Earnings
      </h3>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Direct Referral</th>
            <th className="border px-2 py-1">Branch (Tree)</th>
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <th key={lvl} className="border px-2 py-1">
                Level {lvl} <br /> (₦{COMMISSIONS[lvl - 1].toLocaleString()})
              </th>
            ))}
            <th className="border px-2 py-1">Total Earned</th>
          </tr>
        </thead>
        <tbody>
          {branches.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-2">
                No direct referrals found.
              </td>
            </tr>
          )}
          {branches.map((branch, idx) => {
            const total =
              branch.length > 0
                ? COMMISSIONS.slice(0, branch.length).reduce((a, b) => a + b, 0)
                : 0;
            return (
              <tr key={idx}>
                <td className="border px-2 py-1 font-semibold">
                  {branch[0]?.name || branch[0]?.userId}
                </td>
                <td className="border px-2 py-1">{formatBranch(branch)}</td>
                {[0, 1, 2, 3, 4, 5].map((lvl) => (
                  <td key={lvl} className="border px-2 py-1 text-center">
                    {branch[lvl] ? `₦${COMMISSIONS[lvl].toLocaleString()}` : "-"}
                  </td>
                ))}
                <td className="border px-2 py-1 font-bold text-green-700">
                  ₦{total.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
