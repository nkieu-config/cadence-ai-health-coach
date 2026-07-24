import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/auth/user";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev || !forwardedHost ? request.nextUrl.origin : `https://${forwardedHost}`;

  const next = request.nextUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/reset-password") {
        return NextResponse.redirect(`${baseUrl}/reset-password`);
      }
      const onboarded = await hasCompletedOnboarding();
      return NextResponse.redirect(`${baseUrl}${onboarded ? "/" : "/onboarding"}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=oauth`);
}
