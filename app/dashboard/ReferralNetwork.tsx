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
      <h3>Your Full Referral Network</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>User ID</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {network.map((ref, idx) => (
            <tr key={idx}>
              <td>{ref.name}</td>
              <td>{ref.userId}</td>
              <td>{ref.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
