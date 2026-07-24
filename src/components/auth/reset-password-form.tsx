"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/lib/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <PasswordField autoComplete="new-password" />

      {state && "error" in state && <AuthMessage tone="error">{state.error}</AuthMessage>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ลิงก์หมดอายุแล้ว?{" "}
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center px-1 underline underline-offset-4"
        >
          ขอลิงก์ใหม่
        </Link>
      </p>
    </form>
  );
}
