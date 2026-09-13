import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isDemoAuth = request.cookies.get('pos_demo_auth')?.value === 'true';
  const isAuthenticated = Boolean(user) || isDemoAuth;

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicAsset = /\.(png|jpg|ico|svg|webp|json|js|css|woff2?)$/i.test(pathname);
  const isApiRoute = pathname.startsWith('/api');

  if (!isAuthenticated && !isAuthRoute && !isPublicAsset && !isApiRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirected_from', pathname);
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Persist cookies from the supabase response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return redirectResponse;
  }
  
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/home';
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Persist cookies from the supabase response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return redirectResponse;
  }
  
  return supabaseResponse;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icons|screenshots).*)'] };

