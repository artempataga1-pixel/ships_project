import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedPaths = ["/", "/history", "/account"]
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"]

export default auth(function proxy(req) {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
  const isAuthPath = authPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
