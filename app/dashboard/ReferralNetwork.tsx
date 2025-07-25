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
      // Fetch user doc and build tree from arrays
      const res = await fetch(`/api/user/stats?userId=${userId}`);
      const data = await res.json();
      const user = data;
      const referrals = Array.isArray(user.referrals) ? user.referrals : [];
      const commissions = Array.isArray(user.commissions) ? user.commissions : [];
      // Build direct branches using parentId chain
      const directRefs = referrals.filter((r: any) => r.level === 1);
      const branchList = directRefs.map((direct: any) => {
        let branch = [direct];
        let currentId = direct.referredUserId;
        for (let lvl = 2; lvl <= 6; lvl++) {
          const next = referrals.find((r: any) => r.level === lvl && r.sponsorId === currentId);
          if (next) {
            branch.push(next);
            currentId = next.referredUserId;
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