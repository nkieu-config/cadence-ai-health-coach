"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCheckin } from "@/lib/checkins/actions";
import { formatThaiDate, today } from "@/lib/checkins/date";
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
} from "@/lib/patterns/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, toggleValue } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-2 pt-1">{children}</div>
    </div>
  );
}

export function CheckinForm({
  date,
  existing,
  heading,
  beforeSave,
}: {
  date: string;
  existing: Checkin | null;
  heading: string;
  beforeSave?: () => string | null;
}) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<Checkin | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const asks = {
    skippedMeals: mealsCount !== null && mealsCount < TOTAL_MEALS,
    firstMealTime: ate,
    mealFeeling: ate,
    lateReason: bedTimeBucket !== null && LATE_BUCKETS.includes(bedTimeBucket),
    movementMinutes: !didNotMove && movementTypes.length > 0,
    movementBlocker: movementTypes.length > 0 && (didNotMove || minutes === 0),
    movementFeeling: moved,
  };

  const canProceed = [
    mealsCount !== null && sweetDrinks !== null,
    sleepHours !== null && bedTimeBucket !== null && sleepQuality !== null,
    movementTypes.length > 0 && minutes !== null,
    energyLevel !== null,
  ][step];

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

    const blocked = beforeSave?.();
    if (blocked) {
      setError(blocked);
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
    return <CheckinSummary checkin={saved} onEdit={() => setSaved(null)} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {heading} · {STEPS[step]}
        </CardTitle>
        <CardDescription>
          {formatThaiDate(date)} · ขั้นที่ {step + 1} จาก {STEPS.length}
          {existing && " · กำลังแก้ไขบันทึกเดิม"}
        </CardDescription>
        <div className="flex gap-1 pt-2">
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
            <Field label="วันนี้กินกี่มื้อ">
              {MEAL_COUNTS.map((count) => (
                <Chip
                  key={count}
                  active={mealsCount === count}
                  onClick={() => setMealsCount(count)}
                >
                  {count} มื้อ
                </Chip>
              ))}
            </Field>

            {asks.skippedMeals && (
              <Field label="มื้อไหนที่ข้ามไป" hint="เลือกได้หลายมื้อ">
                {keysOf(MEAL_LABELS).map((meal) => (
                  <Chip
                    key={meal}
                    active={skippedMeals.includes(meal)}
                    onClick={() => setSkippedMeals(toggleValue(skippedMeals, meal))}
                  >
                    {MEAL_LABELS[meal]}
                  </Chip>
                ))}
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

            <Field label="เครื่องดื่มหวานวันนี้" hint="ชานม น้ำอัดลม กาแฟใส่น้ำตาล">
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
            <Field label="เมื่อคืนนอนกี่ชั่วโมง">
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

            <Field label="เข้านอนตอนไหน">
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

            <Field label="ตื่นมารู้สึกว่านอนหลับดีแค่ไหน">
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
            <Field label="วันนี้ขยับร่างกายแบบไหนบ้าง" hint="เลือกได้หลายอย่าง">
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
              <Field label="รวมแล้วประมาณกี่นาที">
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
                    onClick={() => setMovementBlocker(movementBlocker === blocker ? null : blocker)}
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
                    onClick={() => setMovementFeeling(movementFeeling === feeling ? null : feeling)}
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
            <Field label="พลังงานวันนี้โดยรวม">
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

            <Field label="วันนี้มีอะไรพิเศษไหม" hint="เลือกได้หลายอย่าง">
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
              <p className="text-right text-xs text-muted-foreground">
                {note.length}/{NOTE_MAX_LENGTH}
              </p>
            </div>
          </>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={pending}>
              ย้อนกลับ
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep(step + 1)} disabled={!canProceed}>
              ถัดไป
            </Button>
          ) : (
            <Button className="flex-1" onClick={submit} disabled={!canProceed || pending}>
              {pending ? "กำลังบันทึก…" : "บันทึก"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
