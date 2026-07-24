"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import { Check, Clock } from "lucide-react";
import { saveCheckin } from "@/lib/checkins/actions";
import { formatThaiDate } from "@/lib/checkins/date";
import { CheckinSummary } from "./checkin-summary";
import {
  BED_TIME_LABELS,
  DISRUPTOR_LABELS,
  ENERGY_LABELS,
  FIRST_MEAL_TIME_LABELS,
  FOOD_TYPE_LABELS,
  LATE_REASON_LABELS,
  MEAL_FEELING_LABELS,
  MEAL_LABELS,
  MOVEMENT_BLOCKER_LABELS,
  MOVEMENT_FEELING_LABELS,
  MOVEMENT_TYPE_LABELS,
  SLEEP_QUALITY_LABELS,
} from "@/lib/checkins/labels";
import { NOTE_MAX_LENGTH, TOTAL_MEALS } from "@/lib/checkins/validate";
import type {
  BedTimeBucket,
  Checkin,
  Disruptor,
  EnergyLevel,
  FirstMealTime,
  FoodType,
  LateReason,
  Meal,
  MealFeeling,
  MovementBlocker,
  MovementFeeling,
  MovementType,
} from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, toggleValue } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { ErrorNotice, GentleNotice } from "@/components/ui/notice";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STEPS = ["กิน", "นอน", "เคลื่อนไหว", "บริบทวัน"];

const MEAL_COUNTS = [0, 1, 2, 3];
const SWEET_DRINKS = [0, 1, 2, 3, 4];
const SLEEP_HOURS = [3, 4, 5, 6, 7, 8, 9, 10];
const SLEEP_QUALITIES = [1, 2, 3, 4, 5] as const;
const MOVEMENT_MINUTES = [0, 10, 20, 30, 45, 60];
const LATE_BUCKETS: BedTimeBucket[] = ["00_01", "01_02", "after_02"];

function keysOf<T extends string>(labels: Record<T, string>) {
  return Object.keys(labels) as T[];
}

function countLabel(value: number, max: number) {
  return value === max ? `${value}+` : String(value);
}

function Field({
  label,
  hint,
  id,
  highlight,
  children,
}: {
  label: string;
  hint?: string;
  id?: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const labelId = useId();
  const hintId = useId();
  const describedBy = highlight || hint ? hintId : undefined;

  return (
    <div id={id} className="scroll-mt-24 space-y-2">
      <Label id={labelId}>{label}</Label>
      {highlight ? (
        <p id={hintId} role="alert" className="text-xs font-medium text-primary">
          เลือกสักอันก่อนไปต่อนะ
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        className="flex flex-wrap gap-2 pt-1"
      >
        {children}
      </div>
    </div>
  );
}

function StepRail({ step }: { step: number }) {
  return (
    <nav aria-hidden className="hidden lg:block">
      <p className="mb-3 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        ขั้นตอน
      </p>
      <ol className="space-y-1">
        {STEPS.map((name, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li
              key={name}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                current ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-2 border-primary text-foreground"
                      : "border-border"
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              {name}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 rounded-lg bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
        ค่อย ๆ ตอบได้ ไม่มีคำตอบไหนผิด · คำตอบจะถูกเก็บเมื่อกดบันทึกในขั้นสุดท้าย
      </p>
    </nav>
  );
}

export function CheckinForm({
  date,
  existing,
  heading,
  openWith,
  beforeSave,
  nudge,
  footer,
}: {
  date: string;
  existing: Checkin | null;
  heading: string;
  openWith?: Checkin | null;
  beforeSave?: () => string | null;
  nudge?: ReactNode;
  footer?: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [saved, setSaved] = useState<Checkin | null>(openWith ?? null);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [mealsCount, setMealsCount] = useState<number | null>(existing?.mealsCount ?? null);
  const [skippedMeals, setSkippedMeals] = useState<Meal[]>(existing?.skippedMeals ?? []);
  const [firstMealTime, setFirstMealTime] = useState<FirstMealTime | null>(
    existing?.firstMealTime ?? null
  );
  const [foodTypes, setFoodTypes] = useState<FoodType[]>(existing?.foodTypes ?? []);
  const [sweetDrinks, setSweetDrinks] = useState<number | null>(existing?.sweetDrinks ?? null);
  const [mealFeeling, setMealFeeling] = useState<MealFeeling | null>(existing?.mealFeeling ?? null);

  const [sleepHours, setSleepHours] = useState<number | null>(existing?.sleepHours ?? null);
  const [bedTimeBucket, setBedTimeBucket] = useState<BedTimeBucket | null>(
    existing?.bedTimeBucket ?? null
  );
  const [sleepQuality, setSleepQuality] = useState<Checkin["sleepQuality"] | null>(
    existing?.sleepQuality ?? null
  );
  const [lateReason, setLateReason] = useState<LateReason | null>(existing?.lateReason ?? null);

  const [movementTypes, setMovementTypes] = useState<MovementType[]>(existing?.movementTypes ?? []);
  const [movementMinutes, setMovementMinutes] = useState<number | null>(
    existing?.movementMinutes ?? null
  );
  const [movementBlocker, setMovementBlocker] = useState<MovementBlocker | null>(
    existing?.movementBlocker ?? null
  );
  const [movementFeeling, setMovementFeeling] = useState<MovementFeeling | null>(
    existing?.movementFeeling ?? null
  );

  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(existing?.energyLevel ?? null);
  const [disruptors, setDisruptors] = useState<Disruptor[]>(existing?.disruptors ?? []);
  const [note, setNote] = useState(existing?.note ?? "");

  const didNotMove = movementTypes.includes("none");
  const minutes = didNotMove ? 0 : movementMinutes;

  const ate = mealsCount !== null && mealsCount > 0;
  const moved = !didNotMove && movementTypes.length > 0 && (minutes ?? 0) > 0;

  const maxSkippedMeals = TOTAL_MEALS - (mealsCount ?? 0);

  const asks = {
    skippedMeals: mealsCount !== null && mealsCount < TOTAL_MEALS,
    firstMealTime: ate,
    mealFeeling: ate,
    lateReason: bedTimeBucket !== null && LATE_BUCKETS.includes(bedTimeBucket),
    movementMinutes: !didNotMove && movementTypes.length > 0,
    movementBlocker: movementTypes.length > 0 && (didNotMove || minutes === 0),
    movementFeeling: moved,
  };

  function firstMissingField(): string | null {
    if (step === 0) {
      if (mealsCount === null) return "field-meals";
      if (sweetDrinks === null) return "field-sweet";
    } else if (step === 1) {
      if (sleepHours === null) return "field-sleep";
      if (bedTimeBucket === null) return "field-bedtime";
      if (sleepQuality === null) return "field-quality";
    } else if (step === 2) {
      if (movementTypes.length === 0) return "field-movement";
      if (minutes === null) return "field-minutes";
    } else if (step === 3) {
      if (energyLevel === null) return "field-energy";
    }
    return null;
  }

  const shownHighlight =
    highlightField && firstMissingField() === highlightField ? highlightField : null;

  function goForward() {
    const missing = firstMissingField();
    if (missing) {
      setHighlightField(missing);
      const field = document.getElementById(missing);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      return;
    }
    setHighlightField(null);
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  }

  // จำนวนมื้อที่ข้ามต้องไม่ขัดกับจำนวนมื้อที่กิน — ตัดตั้งแต่ขั้นนี้
  // ไม่ปล่อยให้ไปแตกเป็น error ตอนกดบันทึกที่ขั้น 4 ซึ่งห่างจากสาเหตุ 3 ขั้น
  function pickMeals(count: number) {
    setMealsCount(count);
    setSkippedMeals((current) => current.slice(0, TOTAL_MEALS - count));
  }

  function pickMovementType(type: MovementType) {
    if (type === "none") {
      setMovementTypes(didNotMove ? [] : ["none"]);
      return;
    }
    setMovementTypes(
      toggleValue(
        movementTypes.filter((t) => t !== "none"),
        type
      )
    );
  }

  function pickDisruptor(disruptor: Disruptor) {
    if (disruptor === "none") {
      setDisruptors(disruptors.includes("none") ? [] : ["none"]);
      return;
    }
    setDisruptors(
      toggleValue(
        disruptors.filter((d) => d !== "none"),
        disruptor
      )
    );
  }

  function submit() {
    setError(null);
    setGuidance(null);

    const blocked = beforeSave?.();
    if (blocked) {
      setGuidance(blocked);
      return;
    }

    const checkin: Checkin = {
      checkinDate: date,
      mealsCount: mealsCount!,
      skippedMeals: asks.skippedMeals ? skippedMeals : [],
      firstMealTime: asks.firstMealTime ? firstMealTime : null,
      foodTypes,
      sweetDrinks: sweetDrinks!,
      mealFeeling: asks.mealFeeling ? mealFeeling : null,
      sleepHours: sleepHours!,
      bedTimeBucket: bedTimeBucket!,
      sleepQuality: sleepQuality!,
      lateReason: asks.lateReason ? lateReason : null,
      movementTypes,
      movementMinutes: minutes ?? 0,
      movementBlocker: asks.movementBlocker ? movementBlocker : null,
      movementFeeling: asks.movementFeeling ? movementFeeling : null,
      energyLevel: energyLevel!,
      disruptors,
      note: note.trim() || null,
    };

    startTransition(async () => {
      const result = await saveCheckin(checkin);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSaved(checkin);
    });
  }

  if (saved) {
    return (
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <CheckinSummary checkin={saved} onEdit={() => setSaved(null)} />
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,28rem)] lg:items-start lg:gap-8">
      <StepRail step={step} />
      <div className="mx-auto w-full max-w-md space-y-4 lg:mx-0 lg:max-w-none">
        {nudge}
        <Card>
          <CardHeader>
            <CardTitle>
              {heading} · {STEPS[step]}
            </CardTitle>
            <CardDescription>
              {formatThaiDate(date)} · ขั้นที่ {step + 1} จาก {STEPS.length}
              {existing && " · กำลังแก้ไขบันทึกเดิม"}
            </CardDescription>
            <div className="flex gap-1 pt-2 lg:hidden">
              {STEPS.map((name, index) => (
                <div
                  key={name}
                  className={`h-1 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 0 && (
              <>
                <Field
                  id="field-meals"
                  highlight={shownHighlight === "field-meals"}
                  label="วันนี้กินกี่มื้อ"
                >
                  {MEAL_COUNTS.map((count) => (
                    <Chip
                      key={count}
                      active={mealsCount === count}
                      onClick={() => pickMeals(count)}
                    >
                      {count} มื้อ
                    </Chip>
                  ))}
                </Field>

                {mealsCount === 0 && (
                  <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                    วันที่ยุ่งจนไม่ได้กินก็มีนะ บันทึกไว้ก่อน แล้วค่อย ๆ ดูแลตัวเองกันต่อพรุ่งนี้
                  </p>
                )}

                {asks.skippedMeals && (
                  <Field
                    label="มื้อไหนที่ข้ามไป"
                    hint={`เลือกได้ไม่เกิน ${maxSkippedMeals} มื้อ · ข้ามได้`}
                  >
                    {keysOf(MEAL_LABELS).map((meal) => {
                      const active = skippedMeals.includes(meal);
                      return (
                        <Chip
                          key={meal}
                          active={active}
                          disabled={!active && skippedMeals.length >= maxSkippedMeals}
                          onClick={() => setSkippedMeals(toggleValue(skippedMeals, meal))}
                        >
                          {MEAL_LABELS[meal]}
                        </Chip>
                      );
                    })}
                  </Field>
                )}

                {asks.firstMealTime && (
                  <Field label="มื้อแรกของวันกินตอนไหน" hint="ข้ามได้">
                    {keysOf(FIRST_MEAL_TIME_LABELS).map((time) => (
                      <Chip
                        key={time}
                        active={firstMealTime === time}
                        onClick={() => setFirstMealTime(firstMealTime === time ? null : time)}
                      >
                        {FIRST_MEAL_TIME_LABELS[time]}
                      </Chip>
                    ))}
                  </Field>
                )}

                <Field label="วันนี้ได้กินอะไรอีกไหม" hint="เลือกได้หลายอย่าง · ข้ามได้">
                  {keysOf(FOOD_TYPE_LABELS).map((type) => (
                    <Chip
                      key={type}
                      active={foodTypes.includes(type)}
                      onClick={() => setFoodTypes(toggleValue(foodTypes, type))}
                    >
                      {FOOD_TYPE_LABELS[type]}
                    </Chip>
                  ))}
                </Field>

                <Field
                  id="field-sweet"
                  highlight={shownHighlight === "field-sweet"}
                  label="เครื่องดื่มหวานวันนี้"
                  hint="ชานม น้ำอัดลม กาแฟใส่น้ำตาล"
                >
                  {SWEET_DRINKS.map((count) => (
                    <Chip
                      key={count}
                      active={sweetDrinks === count}
                      onClick={() => setSweetDrinks(count)}
                    >
                      {count === 0 ? "ไม่ดื่ม" : `${countLabel(count, 4)} แก้ว`}
                    </Chip>
                  ))}
                </Field>

                {asks.mealFeeling && (
                  <Field label="หลังกินรู้สึกยังไง" hint="ข้ามได้">
                    {keysOf(MEAL_FEELING_LABELS).map((feeling) => (
                      <Chip
                        key={feeling}
                        active={mealFeeling === feeling}
                        onClick={() => setMealFeeling(mealFeeling === feeling ? null : feeling)}
                      >
                        {MEAL_FEELING_LABELS[feeling]}
                      </Chip>
                    ))}
                  </Field>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <Field
                  id="field-sleep"
                  highlight={shownHighlight === "field-sleep"}
                  label="เมื่อคืนนอนกี่ชั่วโมง"
                >
                  {SLEEP_HOURS.map((hours) => (
                    <Chip
                      key={hours}
                      active={sleepHours === hours}
                      onClick={() => setSleepHours(hours)}
                    >
                      {hours === 3 ? "≤3" : countLabel(hours, 10)} ชม.
                    </Chip>
                  ))}
                </Field>

                <Field
                  id="field-bedtime"
                  highlight={shownHighlight === "field-bedtime"}
                  label="เข้านอนตอนไหน"
                >
                  {keysOf(BED_TIME_LABELS).map((bucket) => (
                    <Chip
                      key={bucket}
                      active={bedTimeBucket === bucket}
                      onClick={() => setBedTimeBucket(bucket)}
                    >
                      {BED_TIME_LABELS[bucket]}
                    </Chip>
                  ))}
                </Field>

                {asks.lateReason && (
                  <Field label="ที่นอนดึกเพราะอะไร" hint="ข้ามได้">
                    {keysOf(LATE_REASON_LABELS).map((reason) => (
                      <Chip
                        key={reason}
                        active={lateReason === reason}
                        onClick={() => setLateReason(lateReason === reason ? null : reason)}
                      >
                        {LATE_REASON_LABELS[reason]}
                      </Chip>
                    ))}
                  </Field>
                )}

                <Field
                  id="field-quality"
                  highlight={shownHighlight === "field-quality"}
                  label="ตื่นมารู้สึกว่านอนหลับดีแค่ไหน"
                >
                  {SLEEP_QUALITIES.map((quality) => (
                    <Chip
                      key={quality}
                      active={sleepQuality === quality}
                      onClick={() => setSleepQuality(quality)}
                    >
                      {quality} · {SLEEP_QUALITY_LABELS[quality]}
                    </Chip>
                  ))}
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field
                  id="field-movement"
                  highlight={shownHighlight === "field-movement"}
                  label="วันนี้ขยับร่างกายแบบไหนบ้าง"
                  hint="เลือกได้หลายอย่าง"
                >
                  {keysOf(MOVEMENT_TYPE_LABELS).map((type) => (
                    <Chip
                      key={type}
                      active={movementTypes.includes(type)}
                      onClick={() => pickMovementType(type)}
                    >
                      {MOVEMENT_TYPE_LABELS[type]}
                    </Chip>
                  ))}
                </Field>

                {asks.movementMinutes && (
                  <Field
                    id="field-minutes"
                    highlight={shownHighlight === "field-minutes"}
                    label="รวมแล้วประมาณกี่นาที"
                  >
                    {MOVEMENT_MINUTES.map((value) => (
                      <Chip
                        key={value}
                        active={movementMinutes === value}
                        onClick={() => setMovementMinutes(value)}
                      >
                        {value === 0 ? "แทบไม่ได้ขยับ" : `${countLabel(value, 60)} นาที`}
                      </Chip>
                    ))}
                  </Field>
                )}

                {asks.movementBlocker && (
                  <Field label="อะไรทำให้ไม่ได้ขยับ" hint="ข้ามได้">
                    {keysOf(MOVEMENT_BLOCKER_LABELS).map((blocker) => (
                      <Chip
                        key={blocker}
                        active={movementBlocker === blocker}
                        onClick={() =>
                          setMovementBlocker(movementBlocker === blocker ? null : blocker)
                        }
                      >
                        {MOVEMENT_BLOCKER_LABELS[blocker]}
                      </Chip>
                    ))}
                  </Field>
                )}

                {asks.movementFeeling && (
                  <Field label="หลังขยับรู้สึกยังไง" hint="ข้ามได้">
                    {keysOf(MOVEMENT_FEELING_LABELS).map((feeling) => (
                      <Chip
                        key={feeling}
                        active={movementFeeling === feeling}
                        onClick={() =>
                          setMovementFeeling(movementFeeling === feeling ? null : feeling)
                        }
                      >
                        {MOVEMENT_FEELING_LABELS[feeling]}
                      </Chip>
                    ))}
                  </Field>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground">
                  ขั้นสุดท้ายแล้ว — เหลือแค่ภาพรวมของวันนี้
                </p>

                <Field
                  id="field-energy"
                  highlight={shownHighlight === "field-energy"}
                  label="วันนี้รู้สึกมีพลังงานแค่ไหน"
                  hint="มองภาพรวมทั้งวันที่ผ่านมา"
                >
                  {keysOf(ENERGY_LABELS).map((level) => (
                    <Chip
                      key={level}
                      active={energyLevel === level}
                      onClick={() => setEnergyLevel(level)}
                    >
                      {ENERGY_LABELS[level]}
                    </Chip>
                  ))}
                </Field>

                <Field label="วันนี้มีอะไรพิเศษไหม" hint="เลือกได้หลายอย่าง · ข้ามได้">
                  {keysOf(DISRUPTOR_LABELS).map((disruptor) => (
                    <Chip
                      key={disruptor}
                      active={disruptors.includes(disruptor)}
                      onClick={() => pickDisruptor(disruptor)}
                    >
                      {DISRUPTOR_LABELS[disruptor]}
                    </Chip>
                  ))}
                </Field>

                <div className="space-y-2">
                  <Label htmlFor="note">บันทึกเพิ่มเติม (ข้ามได้)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={NOTE_MAX_LENGTH}
                    rows={3}
                    placeholder="เช่น วันนี้ประชุมยาว เลยไม่ได้กินข้าวเที่ยง"
                  />
                  {note.length > NOTE_MAX_LENGTH * 0.8 && (
                    <p className="text-right text-xs text-muted-foreground">
                      {note.length}/{NOTE_MAX_LENGTH}
                    </p>
                  )}
                </div>
              </>
            )}

            {guidance && <GentleNotice icon={Clock}>{guidance}</GentleNotice>}
            {error && <ErrorNotice>{error}</ErrorNotice>}

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setHighlightField(null);
                    setStep(step - 1);
                  }}
                  disabled={pending}
                >
                  ย้อนกลับ
                </Button>
              )}
              <Button className="flex-1" onClick={goForward} disabled={pending}>
                {step < STEPS.length - 1
                  ? "ถัดไป"
                  : pending
                    ? "กำลังบันทึก…"
                    : "บันทึกเช็คอินวันนี้"}
              </Button>
            </div>
          </CardContent>
        </Card>
        {footer}
      </div>
    </div>
  );
}
