import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  // Protected routes
  const protectedRoutes = ["/dashboard", "/admin", "/profile", "/stockist/dashboard"]
  const adminRoutes = ["/admin"]
  const authRoutes = ["/auth/login", "/auth/register"]
  const stockistRoutes = ["/stockist/dashboard"]

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  const isStockistRoute = stockistRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // Check admin access
    if (isAdminRoute && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Check stockist access
    if (isStockistRoute && decoded.role !== "stockist" && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    const decoded = await verifyToken(token)
    if (decoded) {
      if (decoded.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (decoded.role === "stockist") {
        return NextResponse.redirect(new URL("/stockist/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
