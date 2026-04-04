import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const premiumPaths = ['/api/chat']
  const pathname = request.nextUrl.pathname
  const shouldEnforcePremium = premiumPaths.some((path) => pathname.startsWith(path))
  let currentUserId: string | null = null
  let currentSubscription:
    | { status?: string | null; end_date?: string | null; trial_end?: string | null }
    | null = null

  // Do not fail every request if runtime env is missing in production.
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const authResult = await supabase.auth.getUser()
      currentUserId = authResult.data.user?.id ?? null

      if (shouldEnforcePremium && currentUserId) {
        const subscriptionResult = await supabase
          .from('subscriptions')
          .select('status, end_date, trial_end')
          .eq('user_id', currentUserId)
          .maybeSingle()
        currentSubscription = subscriptionResult.data
      }
    } catch (error) {
      console.error('Middleware Supabase init failed:', error)
    }
  }

  if (shouldEnforcePremium) {
    const now = Date.now()
    const noSubscriptionYet = !currentSubscription
    const trialAllowed =
      currentSubscription?.status === 'trial' &&
      !!currentSubscription?.trial_end &&
      new Date(currentSubscription.trial_end).getTime() > now

    const activeAllowed =
      currentSubscription?.status === 'active' &&
      (!currentSubscription?.end_date || new Date(currentSubscription.end_date).getTime() > now)

    if (!noSubscriptionYet && !trialAllowed && !activeAllowed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/pricing'
      redirectUrl.searchParams.set('reason', 'subscription_required')
      return NextResponse.redirect(redirectUrl)
    }
  }

  const refCode = request.nextUrl.searchParams.get("ref")
  if (refCode) {
    response.cookies.set("ts_ref", refCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
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
