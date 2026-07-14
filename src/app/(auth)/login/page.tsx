import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
        <CardDescription>HealthCoach — ผู้ช่วยดูแลสุขภาพประจำวัน</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "oauth" && (
          <p className="text-sm text-destructive">
            เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง
          </p>
        )}
        <GoogleButton />
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
