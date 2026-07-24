"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorNotice } from "@/components/ui/notice";
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
  const [wiped, setWiped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const confirmId = useId();
  const confirmRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const open = (next: DeleteMode) => {
    setMode(next);
    setConfirmText("");
    setError(null);
    requestAnimationFrame(() => confirmRef.current?.focus());
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
      setWiped(true);
    });
  };

  // ลบสำเร็จแล้วต้องบอกให้รู้ก่อนพาไปหน้าอื่น — เด้งเงียบ ๆ ดูเหมือนระบบพัง
  if (wiped) {
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-3 py-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="font-medium text-foreground">ลบข้อมูลทั้งหมดเรียบร้อยแล้ว</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            บันทึก เป้าหมาย ประวัติแชท และผลวิเคราะห์ถูกลบหมดแล้ว — บัญชีของคุณยังอยู่
            เริ่มตั้งค่าใหม่ได้เลย
          </p>
          <Button className="min-h-11" onClick={() => router.push("/onboarding")}>
            เริ่มตั้งค่าใหม่
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          // ลบบัญชีย้อนกลับไม่ได้เลย จึงไม่ควรเป็นปุ่มแฝดน้ำหนักเท่ากับลบข้อมูล
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/40 dark:bg-transparent dark:hover:bg-destructive/20"
              onClick={() => open("data")}
            >
              {MODES.data.button}
            </Button>
            <div className="border-t pt-3 text-center">
              <button
                type="button"
                onClick={() => open("account")}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground underline underline-offset-4 transition-colors outline-none hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {MODES.account.button}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="space-y-4"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isPending) cancel();
            }}
          >
            <p className="text-sm text-muted-foreground">{MODES[mode].description}</p>

            {error && <ErrorNotice>{error}</ErrorNotice>}

            <div className="space-y-2">
              <label htmlFor={confirmId} className="block text-sm font-medium">
                พิมพ์ “{MODES[mode].phrase}” เพื่อยืนยัน
              </label>
              <Input
                id={confirmId}
                ref={confirmRef}
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
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
                {isPending ? "กำลังลบ…" : "ยืนยัน"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
