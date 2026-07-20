import { toRow } from "../src/lib/checkins/mapper";
import { weekStart } from "../src/lib/goals/week";
import type { Checkin } from "../src/lib/domain";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const PASSWORD = process.env.DEMO_PASSWORD ?? "PalmDemo2026!";
const DAYS = 28;

const PROFILE = {
  display_name: "ปาล์ม",
  status: "student",
  early_days: ["mon", "wed"],
  busy_periods: ["exam", "project_deadline"],
  typical_constraints: ["no_time", "poor_rest"],
};

type DayPlan = Omit<Checkin, "checkinDate">;

const MONDAY: DayPlan = {
  mealsCount: 2,
  skippedMeals: ["breakfast"],
  firstMealTime: "after_12",
  foodTypes: ["snack"],
  sweetDrinks: 0,
  mealFeeling: "hungry_fast",
  sleepHours: 7.5,
  bedTimeBucket: "00_01",
  sleepQuality: 4,
  lateReason: null,
  movementTypes: ["walk"],
  movementMinutes: 25,
  movementBlocker: null,
  movementFeeling: "refreshed",
  energyLevel: "medium",
  disruptors: ["early_class"],
  note: "ตื่นไม่ทันอีกแล้ว วิ่งไปเรียนเลย กว่าจะได้กินมื้อแรกก็เที่ยง",
};

const TUESDAY: DayPlan = {
  mealsCount: 3,
  skippedMeals: [],
  firstMealTime: "before_9",
  foodTypes: ["veg_fruit"],
  sweetDrinks: 0,
  mealFeeling: "just_right",
  sleepHours: 7.5,
  bedTimeBucket: "00_01",
  sleepQuality: 4,
  lateReason: null,
  movementTypes: ["stretch"],
  movementMinutes: 5,
  movementBlocker: "long_sitting",
  movementFeeling: null,
  energyLevel: "high",
  disruptors: ["online_class"],
  note: "เรียน online ทั้งวัน นั่งยาวมาก ลุกแค่ตอนเข้าห้องน้ำ",
};

const WEDNESDAY: DayPlan = {
  mealsCount: 2,
  skippedMeals: ["breakfast"],
  firstMealTime: "after_12",
  foodTypes: ["snack"],
  sweetDrinks: 3,
  mealFeeling: "sleepy",
  sleepHours: 4.5,
  bedTimeBucket: "after_02",
  sleepQuality: 2,
  lateReason: "work",
  movementTypes: ["walk"],
  movementMinutes: 10,
  movementBlocker: "tired",
  movementFeeling: "tired",
  energyLevel: "low",
  disruptors: ["early_class", "deadline"],
  note: "โค้ดถึงตี 3 กว่าจะ push ทัน แล้วต้องตื่นไปเรียน 9 โมง ชานม 3 แก้วยังไม่พอ",
};

const THURSDAY: DayPlan = {
  mealsCount: 3,
  skippedMeals: [],
  firstMealTime: "before_9",
  foodTypes: ["veg_fruit"],
  sweetDrinks: 1,
  mealFeeling: "just_right",
  sleepHours: 8,
  bedTimeBucket: "23_00",
  sleepQuality: 4,
  lateReason: null,
  movementTypes: ["stretch"],
  movementMinutes: 5,
  movementBlocker: "long_sitting",
  movementFeeling: null,
  energyLevel: "medium",
  disruptors: ["online_class"],
  note: null,
};

const FRIDAY: DayPlan = {
  mealsCount: 2,
  skippedMeals: ["breakfast"],
  firstMealTime: "after_12",
  foodTypes: ["snack"],
  sweetDrinks: 3,
  mealFeeling: "hungry_fast",
  sleepHours: 5,
  bedTimeBucket: "after_02",
  sleepQuality: 2,
  lateReason: "work",
  movementTypes: ["none"],
  movementMinutes: 0,
  movementBlocker: "no_time",
  movementFeeling: null,
  energyLevel: "low",
  disruptors: ["deadline"],
  note: "ส่งงานทัน แต่หมดแรงเลย ทั้งวันแทบไม่ได้ลุกไปไหน",
};

const SATURDAY: DayPlan = {
  mealsCount: 3,
  skippedMeals: [],
  firstMealTime: "before_9",
  foodTypes: ["veg_fruit", "snack"],
  sweetDrinks: 1,
  mealFeeling: "energized",
  sleepHours: 8,
  bedTimeBucket: "23_00",
  sleepQuality: 5,
  lateReason: null,
  movementTypes: ["walk"],
  movementMinutes: 40,
  movementBlocker: null,
  movementFeeling: "refreshed",
  energyLevel: "high",
  disruptors: [],
  note: "วันนี้ว่าง เดินเล่นรอบหอยาว ๆ รู้สึกดีกว่าทั้งอาทิตย์",
};

const SUNDAY: DayPlan = {
  mealsCount: 3,
  skippedMeals: [],
  firstMealTime: "before_9",
  foodTypes: ["veg_fruit"],
  sweetDrinks: 0,
  mealFeeling: "just_right",
  sleepHours: 8,
  bedTimeBucket: "23_00",
  sleepQuality: 5,
  lateReason: null,
  movementTypes: ["walk"],
  movementMinutes: 30,
  movementBlocker: null,
  movementFeeling: "relaxed",
  energyLevel: "high",
  disruptors: [],
  note: null,
};

const BY_WEEKDAY: Record<number, DayPlan> = {
  0: SUNDAY,
  1: MONDAY,
  2: TUESDAY,
  3: WEDNESDAY,
  4: THURSDAY,
  5: FRIDAY,
  6: SATURDAY,
};

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function bangkokToday(): Date {
  const now = new Date(Date.now() + BANGKOK_OFFSET_MS);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function buildCheckins(from: Date = bangkokToday()): Checkin[] {
  const checkins: Checkin[] = [];

  for (let ago = DAYS - 1; ago >= 0; ago -= 1) {
    const date = new Date(from);
    date.setUTCDate(date.getUTCDate() - ago);

    const weekday = date.getUTCDay();
    const forgotToLog = ago >= 14 && (weekday === 0 || weekday === 6);
    if (forgotToLog) continue;

    checkins.push({ checkinDate: date.toISOString().slice(0, 10), ...BY_WEEKDAY[weekday] });
  }

  return checkins;
}

type Admin = ReturnType<typeof createAdminClient>;

async function findOrCreateUser(admin: Admin): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) return created.data.user.id;

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const existing = data.users.find((user) => user.email === EMAIL);
  if (!existing) {
    throw new Error(`สร้างบัญชีไม่ได้ และหาของเดิมไม่เจอ: ${created.error?.message ?? "?"}`);
  }
  return existing.id;
}

async function run() {
  const admin = createAdminClient();

  console.log(`บัญชี demo: ${EMAIL}`);
  const userId = await findOrCreateUser(admin);
  console.log(`user_id:    ${userId}`);

  for (const table of ["ai_outputs", "chat_messages", "goals", "checkins"]) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error) throw new Error(`ล้าง ${table} ไม่สำเร็จ: ${error.message}`);
  }
  console.log("ล้างข้อมูลเดิมของบัญชีนี้แล้ว — รันซ้ำได้ไม่มีข้อมูลซ้อน");

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ user_id: userId, ...PROFILE, disclaimer_accepted_at: new Date().toISOString() });
  if (profileError) throw new Error(`profiles: ${profileError.message}`);

  const checkins = buildCheckins();
  const { error: checkinError } = await admin
    .from("checkins")
    .insert(checkins.map((checkin) => toRow(checkin, userId)));
  if (checkinError) throw new Error(`checkins: ${checkinError.message}`);

  const { error: goalError } = await admin.from("goals").insert({
    user_id: userId,
    week_start: weekStart(),
    title: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า สำหรับวันจันทร์กับพุธที่เรียนเช้า",
    situation_tag: "early_class",
    status: "active",
    progress_dates: [],
  });
  if (goalError) throw new Error(`goals: ${goalError.message}`);

  console.log(
    `\ncheck-in ${checkins.length} วัน จาก ${DAYS} วัน (ขาดบันทึก ${DAYS - checkins.length} วัน — เสาร์/อาทิตย์ของ 2 สัปดาห์แรกที่ยังไม่ติดนิสัย)`
  );
  console.log(`ช่วงวันที่:  ${checkins[0].checkinDate} → ${checkins.at(-1)!.checkinDate}`);
  console.log("เป้าหมายสัปดาห์นี้: 1 ข้อ (active)");
  console.log(`\nล็อกอิน: ${EMAIL} / ${PASSWORD}`);
  console.log("ตรวจว่า pattern โผล่ครบ: npm run verify:seed");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
