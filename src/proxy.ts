import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/order', '/api/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  const sessionToken =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token')

  // Logged-in user trying to access /login → send to home
  if (isPublic && pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isPublic) return NextResponse.next()

  // Lightweight check — cookie presence only, no DB call.
  // Full auth verification happens inside Server Components via auth() from @/auth.
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}
