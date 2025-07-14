import { useEffect, useState } from "react";

export default function ReferralNetwork({ userId }: { userId: string }) {
  const [network, setNetwork] = useState<any[]>([]);
  useEffect(() => {
    async function fetchNetwork() {
      const res = await fetch(`/api/user/network?userId=${userId}&maxLevel=6`);
      const data = await res.json();
      setNetwork(data.network || []);
    }
    if (userId) fetchNetwork();
  }, [userId]);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Full Referral Tree</h3>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">User ID</th>
            <th className="border px-2 py-1">Level</th>
          </tr>
        </thead>
        <tbody>
          {network.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-2">
                No referrals found.
              </td>
            </tr>
          )}
          {network.map((ref, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{ref.name}</td>
              <td className="border px-2 py-1">{ref.userId}</td>
              <td className="border px-2 py-1">{ref.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
