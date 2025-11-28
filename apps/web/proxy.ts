import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/login', '/signup']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Better Auth のセッションクッキーを確認
  const sessionCookie = request.cookies.get('better-auth.session_token')

  // 保護されたルートへの未認証アクセス
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 認証済みユーザーの認証ページアクセス
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
