import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export interface User {
  userId: string
  email: string
  role: string
}

export async function getUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

    const { payload } = await jwtVerify(token, secret)

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("Auth verification failed:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getUser(request)

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request)

  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }

  return user
}
