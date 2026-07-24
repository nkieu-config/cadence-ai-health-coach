"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
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
import { ErrorNotice } from "@/components/ui/notice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DISCLAIMER =
  "Cadence เป็นผู้ช่วยดูแลสุขภาพประจำวัน (wellness coach) ไม่ใช่บริการทางการแพทย์ — ไม่วินิจฉัยโรค ไม่แนะนำยาหรืออาหารเสริม ไม่ให้แผนลดน้ำหนัก หากมีอาการผิดปกติหรือกังวลเรื่องสุขภาพ ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ";

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
  const [showHint, setShowHint] = useState(false);
  const [pending, startTransition] = useTransition();

  const canProceed = step === 0 ? displayName.trim().length > 0 && status !== null : true;

  function goNext() {
    if (!canProceed) {
      setShowHint(true);
      return;
    }
    setShowHint(false);
    setStep(step + 1);
  }

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
    <main className="flex min-h-dvh items-center justify-center p-3 xs:p-4">
      <h1 className="sr-only">ตั้งค่าเริ่มต้น Cadence</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ตั้งค่าเริ่มต้น</CardTitle>
          <CardDescription>
            ขั้นที่ {step + 1} จาก {TOTAL_STEPS} · ใช้เวลาไม่ถึง 1 นาที
          </CardDescription>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="ความคืบหน้าการตั้งค่า"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-54">
            {step === 0 && (
              <div className="space-y-4">
                <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  ยินดีต้อนรับสู่ Cadence — ตั้งค่าครั้งเดียวจบ จากนั้นเช็คอินวันละไม่ถึง 3 นาที
                  เพื่อดูรูปแบบการกิน การนอน และการเคลื่อนไหวของคุณเอง
                </p>
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
                <p className="text-xs text-muted-foreground">
                  เลือกได้หลายวัน (ข้ามได้ถ้าไม่แน่ใจ)
                </p>
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
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-border bg-background transition-colors has-checked:border-primary has-checked:bg-primary">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="peer absolute inset-0 cursor-pointer opacity-0"
                    />
                    <Check className="size-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100" />
                  </span>
                  <span>
                    ฉันเข้าใจว่า Cadence เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่คำแนะนำทางการแพทย์
                  </span>
                </label>
              </div>
            )}
          </div>

          {showHint && !canProceed && (
            <p role="alert" className="text-sm text-primary">
              กรอกชื่อเล่นและเลือกสถานะก่อนไปต่อนะ
            </p>
          )}
          {error && <ErrorNotice>{error}</ErrorNotice>}

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={pending}>
                ย้อนกลับ
              </Button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <>
                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep(step + 1)} disabled={pending}>
                    ข้ามขั้นนี้
                  </Button>
                )}
                <Button className="flex-1" onClick={goNext}>
                  ถัดไป
                </Button>
              </>
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
