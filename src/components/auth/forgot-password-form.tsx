"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/lib/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">อีเมลที่ใช้สมัคร</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      {state && "error" in state && <AuthMessage tone="error">{state.error}</AuthMessage>}
      {state && "notice" in state && <AuthMessage tone="notice">{state.notice}</AuthMessage>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังส่งลิงก์…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        นึกรหัสผ่านออกแล้ว?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center px-1 underline underline-offset-4"
        >
          กลับไปเข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
