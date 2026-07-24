import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "ตั้งรหัสผ่านใหม่" };

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>ตั้งรหัสผ่านใหม่</h1>
        </CardTitle>
        <CardDescription>ตั้งรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร แล้วเข้าใช้งานได้เลย</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
