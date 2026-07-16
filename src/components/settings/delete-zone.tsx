"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteAccount, deleteAllData } from "@/lib/account/actions";

type DeleteMode = "data" | "account";

const MODES: Record<DeleteMode, { button: string; phrase: string; description: string }> = {
  data: {
    button: "ลบข้อมูลทั้งหมด",
    phrase: "ลบข้อมูลทั้งหมด",
    description:
      "ลบบันทึกทั้งหมด เป้าหมาย ประวัติแชท และผลวิเคราะห์ — บัญชียังอยู่ แต่ต้องเริ่มตั้งค่าใหม่ตั้งแต่ต้น",
  },
  account: {
    button: "ลบบัญชีถาวร",
    phrase: "ลบบัญชีถาวร",
    description: "ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร กู้คืนไม่ได้ และจะออกจากระบบทันที",
  },
};

export function DeleteZone() {
  const [mode, setMode] = useState<DeleteMode | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmId = useId();
  const router = useRouter();

  const open = (next: DeleteMode) => {
    setMode(next);
    setConfirmText("");
    setError(null);
  };

  const cancel = () => {
    setMode(null);
    setConfirmText("");
    setError(null);
  };

  const confirm = () => {
    if (!mode) return;
    setError(null);
    startTransition(async () => {
      if (mode === "account") {
        const result = await deleteAccount();
        if (result && "error" in result) setError(result.error);
        return;
      }

      const result = await deleteAllData();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/onboarding");
    });
  };

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="size-5 shrink-0" />
          โซนอันตรายสูง
        </CardTitle>
        <CardDescription>การลบทำทันทีและกู้คืนไม่ได้ ต้องพิมพ์ยืนยันก่อนทุกครั้ง</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {mode === null ? (
          <div className="grid gap-2 lg:grid-cols-2">
            <Button variant="destructive" onClick={() => open("data")}>
              {MODES.data.button}
            </Button>
            <Button variant="destructive" onClick={() => open("account")}>
              {MODES.account.button}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {MODES[mode].description}
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor={confirmId} className="block text-sm font-medium">
                พิมพ์ “{MODES[mode].phrase}” เพื่อยืนยัน
              </label>
              <Input
                id={confirmId}
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder={MODES[mode].phrase}
                disabled={isPending}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              <Button variant="outline" onClick={cancel} disabled={isPending}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={confirm}
                disabled={confirmText !== MODES[mode].phrase || isPending}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "กำลังลบ..." : "ยืนยัน"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
