"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Chip, toggleValue } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUSES = [
  { value: "student", label: "นักศึกษา" },
  { value: "first_jobber", label: "First jobber (เพิ่งเริ่มทำงาน)" },
] as const;

const DAYS = [
  { value: "mon", label: "จ" },
  { value: "tue", label: "อ" },
  { value: "wed", label: "พ" },
  { value: "thu", label: "พฤ" },
  { value: "fri", label: "ศ" },
  { value: "sat", label: "ส" },
  { value: "sun", label: "อา" },
];

const CONSTRAINTS = [
  { value: "no_time", label: "ไม่ค่อยมีเวลา" },
  { value: "no_place", label: "ไม่มีสถานที่ออกกำลังกาย" },
  { value: "limited_budget", label: "งบจำกัด" },
  { value: "poor_rest", label: "พักผ่อนไม่ค่อยพอ" },
];

const DISCLAIMER =
  "HealthCoach เป็นผู้ช่วยดูแลสุขภาพประจำวัน (wellness coach) ไม่ใช่บริการทางการแพทย์ — ไม่วินิจฉัยโรค ไม่แนะนำยาหรืออาหารเสริม ไม่ให้แผนลดน้ำหนัก หากมีอาการผิดปกติหรือกังวลเรื่องสุขภาพ ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ";

const TOTAL_STEPS = 4;

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(defaultName);
  const [status, setStatus] = useState<"student" | "first_jobber" | null>(null);
  const [earlyDays, setEarlyDays] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canProceed = step === 0 ? displayName.trim().length > 0 && status !== null : true;

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        displayName: displayName.trim(),
        status: status!,
        earlyDays,
        constraints,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ตั้งค่าเริ่มต้น</CardTitle>
          <CardDescription>
            ขั้นที่ {step + 1} จาก {TOTAL_STEPS} · ใช้เวลาไม่ถึง 1 นาที
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">เรียกคุณว่าอะไรดี</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ชื่อเล่น"
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label>ตอนนี้คุณเป็น</Label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Chip key={s.value} active={status === s.value} onClick={() => setStatus(s.value)}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>วันไหนที่มักมีเรียนหรือทำงานช่วงเช้า</Label>
              <p className="text-xs text-muted-foreground">เลือกได้หลายวัน (ข้ามได้ถ้าไม่แน่ใจ)</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {DAYS.map((d) => (
                  <Chip
                    key={d.value}
                    active={earlyDays.includes(d.value)}
                    onClick={() => setEarlyDays(toggleValue(earlyDays, d.value))}
                  >
                    {d.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>มีข้อจำกัดอะไรในการดูแลสุขภาพบ้าง</Label>
              <p className="text-xs text-muted-foreground">เลือกได้หลายข้อ (ข้ามได้)</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {CONSTRAINTS.map((c) => (
                  <Chip
                    key={c.value}
                    active={constraints.includes(c.value)}
                    onClick={() => setConstraints(toggleValue(constraints, c.value))}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                {DISCLAIMER}
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1"
                />
                <span>ฉันเข้าใจว่า HealthCoach เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่คำแนะนำทางการแพทย์</span>
              </label>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={pending}>
                ย้อนกลับ
              </Button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button className="flex-1" onClick={() => setStep(step + 1)} disabled={!canProceed}>
                ถัดไป
              </Button>
            ) : (
              <Button className="flex-1" onClick={submit} disabled={!accepted || pending}>
                {pending ? "กำลังบันทึก…" : "รับทราบและเริ่มใช้งาน"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
