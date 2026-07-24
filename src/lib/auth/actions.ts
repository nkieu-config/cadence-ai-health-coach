"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/auth/user";

export type AuthState = { error: string } | { notice: string } | undefined;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function describeSignUpError(message: string) {
  if (/already registered|already exists|already been registered/i.test(message)) {
    return "อีเมลนี้ถูกใช้สมัครแล้ว ลองเข้าสู่ระบบแทน";
  }
  return "สมัครไม่สำเร็จ ลองใหม่อีกครั้ง";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { error: "กรอกอีเมลและรหัสผ่านให้ครบ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  const onboarded = await hasCompletedOnboarding();

  revalidatePath("/", "layout");
  redirect(onboarded ? "/" : "/onboarding");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { error: "กรอกอีเมลและรหัสผ่านให้ครบ" };
  }
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { error: describeSignUpError(error.message) };
  }
  if (!data.session) {
    return {
      notice:
        "สมัครสำเร็จแล้ว — เราส่งลิงก์ยืนยันไปที่อีเมลของคุณ กดลิงก์นั้นแล้วกลับมาเข้าสู่ระบบ",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "กรอกอีเมลที่ใช้สมัครไว้" };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });

  // ตอบเหมือนกันเสมอ ไม่ว่าอีเมลนี้จะมีบัญชีอยู่จริงหรือไม่ — ไม่เปิดเผยว่าใครสมัครไว้บ้าง
  return {
    notice: `ถ้ามีบัญชีที่ใช้ ${email} อยู่ เราส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้ว — เปิดลิงก์จากอีเมลได้เลย`,
  };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ลิงก์ตั้งรหัสผ่านหมดอายุแล้ว — ขอลิงก์ใหม่อีกครั้งได้เลย" };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

async function siteOrigin() {
  const store = await headers();
  const host = store.get("x-forwarded-host") ?? store.get("host") ?? "localhost:3000";
  const proto = store.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInWithGoogle(formData: FormData) {
  const from = String(formData.get("from") ?? "/login");
  const origin = from === "/register" ? "/register" : "/login";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback` },
  });
  if (error || !data.url) {
    redirect(`${origin}?error=oauth`);
  }
  redirect(data.url);
}
