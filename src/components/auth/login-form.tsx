"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { signIn, type AuthState } from "@/lib/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, undefined);
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

      <PasswordField autoComplete="current-password" />

      {state && "error" in state && <AuthMessage tone="error">{state.error}</AuthMessage>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center px-1 underline underline-offset-4"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}
