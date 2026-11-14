import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs only for /admin and /api/admin.
 *  • Refreshes the Supabase session cookie so admins stay signed in.
 *  • Optimistically sends signed-out visitors to the login page.
 *
 * This is NOT the security boundary: every admin page, server action and API
 * route re-checks the session + admin membership on the server, and the
 * database enforces Row Level Security on top of that.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isApi = path.startsWith("/api/admin");
  const isLogin = path.startsWith("/admin/login");

  let response = NextResponse.next({ request });
  if (!url || !key) {
    if (isApi) return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const withCookies = (res: NextResponse) => {
    for (const cookie of response.cookies.getAll()) res.cookies.set(cookie);
    return res;
  };

  if (!user && !isLogin) {
    if (isApi) return withCookies(NextResponse.json({ error: "Unauthorised" }, { status: 401 }));
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    login.searchParams.set("next", path);
    return withCookies(NextResponse.redirect(login));
  }

  if (user && isLogin) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/admin/reviews";
    dest.search = "";
    return withCookies(NextResponse.redirect(dest));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
