"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/onboarding/actions";
import {
  BUSY_PERIOD_LABELS,
  CONSTRAINT_LABELS,
  DISPLAY_NAME_MAX_LENGTH,
  EARLY_DAY_LABELS,
  STATUS_LABELS,
  type BusyPeriod,
  type Constraint,
  type EarlyDay,
  type UserStatus,
} from "@/lib/onboarding/types";
import { Button } from "@/components/ui/button";
import { Chip, toggleValue } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DISCLAIMER =
  "HealthCoach เป็นผู้ช่วยดูแลสุขภาพประจำวัน (wellness coach) ไม่ใช่บริการทางการแพทย์ — ไม่วินิจฉัยโรค ไม่แนะนำยาหรืออาหารเสริม ไม่ให้แผนลดน้ำหนัก หากมีอาการผิดปกติหรือกังวลเรื่องสุขภาพ ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ";

const TOTAL_STEPS = 5;

function keysOf<T extends string>(labels: Record<T, string>) {
  return Object.keys(labels) as T[];
}

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(defaultName);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [earlyDays, setEarlyDays] = useState<EarlyDay[]>([]);
  const [busyPeriods, setBusyPeriods] = useState<BusyPeriod[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
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
        busyPeriods,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
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
                  maxLength={DISPLAY_NAME_MAX_LENGTH}
                />
              </div>
              <div className="space-y-2">
                <Label>ตอนนี้คุณเป็น</Label>
                <div className="flex flex-wrap gap-2">
                  {keysOf(STATUS_LABELS).map((value) => (
                    <Chip key={value} active={status === value} onClick={() => setStatus(value)}>
                      {STATUS_LABELS[value]}
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
                {keysOf(EARLY_DAY_LABELS).map((day) => (
                  <Chip
                    key={day}
                    active={earlyDays.includes(day)}
                    onClick={() => setEarlyDays(toggleValue(earlyDays, day))}
                  >
                    {EARLY_DAY_LABELS[day]}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>ช่วงไหนที่งานมักหนักหรือมีเดดไลน์</Label>
              <p className="text-xs text-muted-foreground">เลือกได้หลายข้อ (ข้ามได้)</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {keysOf(BUSY_PERIOD_LABELS).map((period) => (
                  <Chip
                    key={period}
                    active={busyPeriods.includes(period)}
                    onClick={() => setBusyPeriods(toggleValue(busyPeriods, period))}
                  >
                    {BUSY_PERIOD_LABELS[period]}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>มีข้อจำกัดอะไรในการดูแลสุขภาพบ้าง</Label>
              <p className="text-xs text-muted-foreground">เลือกได้หลายข้อ (ข้ามได้)</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {keysOf(CONSTRAINT_LABELS).map((constraint) => (
                  <Chip
                    key={constraint}
                    active={constraints.includes(constraint)}
                    onClick={() => setConstraints(toggleValue(constraints, constraint))}
                  >
                    {CONSTRAINT_LABELS[constraint]}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
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
                <span>
                  ฉันเข้าใจว่า HealthCoach เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่คำแนะนำทางการแพทย์
                </span>
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
