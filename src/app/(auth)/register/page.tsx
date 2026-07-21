import { RegisterForm } from "@/components/auth/register-form";
import { AuthMessage } from "@/components/auth/auth-message";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>สมัครสมาชิก</h1>
        </CardTitle>
        <CardDescription>เริ่มดูแลสุขภาพประจำวันกับ HealthCoach</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "oauth" && (
          <AuthMessage tone="error">สมัครด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง</AuthMessage>
        )}
        <GoogleButton from="/register" />
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">หรือ</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
