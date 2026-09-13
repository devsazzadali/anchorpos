import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const demoAuth = request.cookies.get('pos_demo_auth')?.value === 'true';
  const isAuthenticated = Boolean(user || demoAuth);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicAsset = /\.(png|jpg|ico|svg|webp|json|js|css|woff2?)$/i.test(pathname);
  const isApiRoute = pathname.startsWith('/api');

  if (!isAuthenticated && !isAuthRoute && !isPublicAsset && !isApiRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirected_from', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url));
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icons|screenshots).*)'] };
