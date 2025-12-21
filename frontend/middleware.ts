import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Supabase Client Banao (Middleware Mode)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Response me cookie set karo (Session maintain karne ke liye)
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Cookie delete karo (Logout ke liye)
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 2. User Check Karo
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Security Rules (Guard) 👮‍♂️
  
  // Agar user login NAHI hai aur wo "/" (Home/Chat) par jane ki koshish kar raha hai
  if (!user && request.nextUrl.pathname === '/') {
    // To use Login Page par bhej do
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Agar user login HAI aur wo "/login" ya "/sign-in" par wapas ja raha hai
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/sign-in')) {
    // To use wapas Home page par bhej do (Kyunki wo already logged in hai)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}