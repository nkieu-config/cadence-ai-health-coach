"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { signUp, type AuthState } from "@/lib/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, undefined);
  const emailRef = useRef<HTMLInputElement>(null);
  const failed = Boolean(state && "error" in state);

  useEffect(() => {
    if (failed) emailRef.current?.focus();
  }, [failed, state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input ref={emailRef} id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <PasswordField autoComplete="new-password" minLength={6} hint="อย่างน้อย 6 ตัวอักษร" />

      {state && "error" in state && <AuthMessage tone="error">{state.error}</AuthMessage>}
      {state && "notice" in state && <AuthMessage tone="notice">{state.notice}</AuthMessage>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังสมัคร…" : "สมัครสมาชิก"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center px-1 underline underline-offset-4"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
