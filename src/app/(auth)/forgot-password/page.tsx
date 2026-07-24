import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>ลืมรหัสผ่าน</h1>
        </CardTitle>
        <CardDescription>
          กรอกอีเมลที่ใช้สมัคร แล้วเราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
