import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWeekComparison,
  buildWeekFacts,
  REFLECTION_DAYS,
} from "../src/lib/ai-outputs/reflection-facts";
import { formatWeekChangeDelta, formatWeekChangeValue } from "../src/lib/ai-outputs/format";
import { daysAgo, shiftDate, today } from "../src/lib/checkins/date";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { weekDates, weekStart } from "../src/lib/goals/week";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const SKIP_AI = process.argv.includes("--goal-only");

type Admin = ReturnType<typeof createAdminClient>;

async function findUserId(admin: Admin): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === EMAIL);
  if (!user) throw new Error(`หาบัญชี demo ไม่เจอ: ${EMAIL} — seed ควรสร้างให้แล้ว`);
  return user.id;
}

function elapsedWeekdaysThisWeek(): string[] {
  const now = today();
  return weekDates().filter((date) => {
    if (date > now) return false;
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    return weekday >= 1 && weekday <= 5;
  });
}

async function clearTodayCheckin(admin: Admin, userId: string) {
  const { error } = await admin
    .from("checkins")
    .delete()
    .eq("user_id", userId)
    .eq("checkin_date", today());
  if (error) throw new Error(`ลบ check-in วันนี้ไม่ได้: ${error.message}`);
  console.log(`\nลบ check-in ของวันนี้ (${today()}) — หน้าเช็คอินเป็นฟอร์มเปล่า พร้อมกรอกสดบนเวที`);
}

async function ensureCurrentWeekGoal(admin: Admin, userId: string) {
  const week = weekStart();
  const progress = elapsedWeekdaysThisWeek();

  const { data: existing, error: readError } = await admin
    .from("goals")
    .select("id, title, status, progress_dates")
    .eq("user_id", userId)
    .eq("week_start", week)
    .eq("status", "active");
  if (readError) throw new Error(`อ่าน goals ไม่ได้: ${readError.message}`);

  if (existing && existing.length > 0) {
    const goal = existing[0];
    const currentProgress: string[] = goal.progress_dates ?? [];
    if (currentProgress.length === 0 && progress.length > 0) {
      const { error: updateError } = await admin
        .from("goals")
        .update({ progress_dates: progress })
        .eq("id", goal.id);
      if (updateError) throw new Error(`อัปเดต progress ไม่ได้: ${updateError.message}`);
      console.log(`\ngoal สัปดาห์นี้: "${goal.title}"`);
      console.log(`เติมความคืบหน้า ${progress.length} วัน (${progress.join(", ")})`);
    } else {
      console.log(`\nมี goal active ของสัปดาห์นี้อยู่แล้ว ${existing.length} ข้อ — ไม่แตะ`);
      for (const item of existing) console.log(`  • ${item.title}`);
    }
    return;
  }

  const { error: insertError } = await admin.from("goals").insert({
    user_id: userId,
    week_start: week,
    title: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า สำหรับวันจันทร์กับพุธที่เรียนเช้า",
    situation_tag: "early_class",
    status: "active",
    progress_dates: progress,
  });
  if (insertError) throw new Error(`insert goal ไม่ได้: ${insertError.message}`);
  console.log(`\nเพิ่ม goal ของสัปดาห์นี้แล้ว (ความคืบหน้า ${progress.length} วัน)`);
}

function warmAiCache() {
  if (SKIP_AI) {
    console.log(
      `\n⚠️ ข้าม AI warm (--goal-only) — seed เพิ่งล้างแชทและ insight ทิ้ง /coach กับ dashboard จะไม่มีของ AI จนกว่าจะรันแบบเต็ม`
    );
    return;
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.log(
      `\n⚠️ ไม่มี GEMINI_API_KEY — ข้าม AI warm · check-in/goal พร้อมแล้ว แต่ insight/reflection/แชทยังไม่อุ่น`
    );
    return;
  }

  console.log(`\n━━━ อุ่น AI cache (insight + reflection) ให้ตรงกับ today() ━━━`);
  runScript("backfill-demo-ai.ts", "อุ่น AI cache");

  console.log(`\n━━━ บทสนทนาโค้ช (deliverable 9 — ต้องมีตัวอย่างพร้อมโชว์) ━━━`);
  runScript("seed-coach-chat.ts", "สร้างบทสนทนาโค้ช");
  console.log(
    `\nบทสนทนาที่ seed ใช้โควตาแชทของวันนี้ไป 3 จาก 5 ข้อความ — เหลือ 2 นัดสำหรับ safety probe สดบนเวที`
  );
}

function runScript(name: string, label: string) {
  const script = join(dirname(fileURLToPath(import.meta.url)), name);
  const result = spawnSync(process.execPath, ["--import", "tsx", script], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${label}ไม่สำเร็จ (exit ${result.status})`);
  }
}

async function checkinsBetween(admin: Admin, userId: string, from: string, to: string) {
  const { data, error } = await admin
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .eq("user_id", userId)
    .gte("checkin_date", from)
    .lte("checkin_date", to)
    .order("checkin_date", { ascending: true });
  if (error) throw error;
  return ((data as unknown as CheckinRow[]) ?? []).map(toCheckin);
}

async function printOnScreenNumbers(admin: Admin, userId: string) {
  const periodStart = daysAgo(REFLECTION_DAYS - 1);
  const periodEnd = today();
  const previousEnd = shiftDate(periodStart, -1);
  const previousStart = shiftDate(previousEnd, -(REFLECTION_DAYS - 1));

  const [currentCheckins, previousCheckins] = await Promise.all([
    checkinsBetween(admin, userId, periodStart, periodEnd),
    checkinsBetween(admin, userId, previousStart, previousEnd),
  ]);

  const current = buildWeekFacts(currentCheckins, [], REFLECTION_DAYS);
  const previous = buildWeekFacts(previousCheckins, [], REFLECTION_DAYS);
  const comparison = buildWeekComparison(current, previous, previousStart, previousEnd);

  console.log(`\n━━━ ตัวเลขที่จะเห็นบนจอวันนี้ — การ์ด "เทียบกับสัปดาห์ก่อน" ใน /reflection ━━━`);
  if (!comparison) {
    console.log(`สัปดาห์ก่อนไม่มีบันทึก — การ์ดเทียบจะไม่โชว์`);
    return;
  }
  for (const change of comparison.changes) {
    const arrow = change.delta > 0 ? "↑" : change.delta < 0 ? "↓" : "—";
    console.log(
      `  ${change.label}: ${formatWeekChangeValue(change.metric, change.previous)} → ${formatWeekChangeValue(change.metric, change.current)} ${change.unit}  ${arrow} ${formatWeekChangeDelta(change.metric, change.delta)}`
    );
  }
  console.log(
    `  หมายเหตุ: แถว "บันทึก" ต่ำกว่าจริง 1 วันเพราะเว้นวันนี้ไว้กรอกสด — หลังกรอกบนเวทีจะกลับมาครบเอง`
  );
  console.log(
    `  ตัวเลขฝั่งสัปดาห์นี้จะขยับเล็กน้อยหลังกรอกสดด้วย — ชี้ลูกศรแล้วอ่านจากจอ อย่าท่องเลขล่วงหน้า`
  );
}

async function run() {
  const admin = createAdminClient();

  console.log(`บัญชี demo: ${EMAIL} · สัปดาห์ปัจจุบัน: ${weekStart()}`);

  console.log(`\n━━━ รีเซ็ตข้อมูล check-in 28 วันให้จบที่วันนี้ ━━━`);
  runScript("seed.ts", "seed ข้อมูล");

  const userId = await findUserId(admin);
  await clearTodayCheckin(admin, userId);
  await ensureCurrentWeekGoal(admin, userId);
  warmAiCache();
  await printOnScreenNumbers(admin, userId);

  console.log(
    `\nเสร็จ — เช็คก่อนขึ้นเวที: /checkin ต้องเป็นฟอร์มเปล่า · /coach มีบทสนทนา · goal ตรง narrative ปาล์ม`
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
