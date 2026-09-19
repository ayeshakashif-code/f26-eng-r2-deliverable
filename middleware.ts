import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pendingCookies = new Map<string, { value: string; options: CookieOptions }>();
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rebuildResponse = () => {
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    pendingCookies.forEach(({ value, options }, name) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      response.cookies.set({ name, value, ...options });
    });
    response.headers.set("Cache-Control", "private, no-store");
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          request.cookies.set({
            name,
            value,
            ...options,
          });
          pendingCookies.set(name, { value, options });
          rebuildResponse();
        },
        remove(name: string, options: CookieOptions) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          pendingCookies.set(name, { value: "", options });
          rebuildResponse();
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
