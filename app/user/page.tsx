// This file enables your dashboard to be rendered as a page in the Next.js App Router.

import UserDashboard from "./dashboard"

export default function Page() {
  // Optionally, you can pass an empty object or initial props.
  return <UserDashboard userStats={{}} />
}
    