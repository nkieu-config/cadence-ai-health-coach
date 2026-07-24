import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthMessage } from "@/components/auth/auth-message";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  const { error, deleted } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>เข้าสู่ระบบ</h1>
        </CardTitle>
        <CardDescription>Cadence — ผู้ช่วยดูแลสุขภาพประจำวัน</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deleted === "1" && (
          <AuthMessage tone="notice">
            ลบบัญชีและข้อมูลทั้งหมดเรียบร้อยแล้ว — ขอบคุณที่เคยใช้ Cadence
            หากอยากเริ่มใหม่สมัครได้ทุกเมื่อ
          </AuthMessage>
        )}
        {error === "oauth" && (
          <AuthMessage tone="error">เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง</AuthMessage>
        )}
        <GoogleButton from="/login" />
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">หรือ</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
