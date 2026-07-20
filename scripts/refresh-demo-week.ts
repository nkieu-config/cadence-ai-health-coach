import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { today } from "../src/lib/checkins/date";
import { weekDates, weekStart } from "../src/lib/goals/week";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const SKIP_AI = process.argv.includes("--goal-only");

const DEMO_GOAL = {
  title: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้า สำหรับวันจันทร์กับพุธที่เรียนเช้า",
  situation_tag: "early_class",
};

type Admin = ReturnType<typeof createAdminClient>;

async function findUserId(admin: Admin): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === EMAIL);
  if (!user) throw new Error(`หาบัญชี demo ไม่เจอ: ${EMAIL} — รัน npm run seed ก่อน`);
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

async function ensureCurrentWeekGoal(admin: Admin, userId: string) {
  const week = weekStart();
  const { data: existing, error: readError } = await admin
    .from("goals")
    .select("id, title, status")
    .eq("user_id", userId)
    .eq("week_start", week)
    .eq("status", "active");
  if (readError) throw new Error(`อ่าน goals ไม่ได้: ${readError.message}`);

  if (existing && existing.length > 0) {
    console.log(`\nมี goal active ของสัปดาห์นี้อยู่แล้ว ${existing.length} ข้อ — ไม่แตะ`);
    for (const goal of existing) console.log(`  • ${goal.title}`);
    return;
  }

  const progress = elapsedWeekdaysThisWeek();
  const { error: insertError } = await admin.from("goals").insert({
    user_id: userId,
    week_start: week,
    title: DEMO_GOAL.title,
    situation_tag: DEMO_GOAL.situation_tag,
    status: "active",
    progress_dates: progress,
  });
  if (insertError) throw new Error(`insert goal ไม่ได้: ${insertError.message}`);

  console.log(`\nเพิ่ม goal ของสัปดาห์นี้แล้ว: "${DEMO_GOAL.title}"`);
  console.log(`ความคืบหน้า: ${progress.length} วัน (${progress.join(", ") || "ยังไม่มี"})`);
}

function warmAiCache() {
  if (SKIP_AI) {
    console.log(`\nข้าม AI warm (--goal-only)`);
    return;
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.log(
      `\n⚠️ ไม่มี GEMINI_API_KEY — ข้าม AI warm · goal อัปเดตแล้ว แต่ insight/reflection ยังไม่อุ่น`
    );
    return;
  }

  console.log(`\n━━━ อุ่น AI cache (insight + reflection) ให้ตรงกับ today() ━━━`);
  runScript("backfill-demo-ai.ts", "อุ่น AI cache");

  console.log(`\n━━━ บทสนทนาโค้ช (deliverable 9 — ต้องมีตัวอย่างพร้อมโชว์) ━━━`);
  runScript("seed-coach-chat.ts", "สร้างบทสนทนาโค้ช");
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

async function run() {
  const admin = createAdminClient();

  console.log(`บัญชี demo: ${EMAIL} · สัปดาห์ปัจจุบัน: ${weekStart()}`);
  const userId = await findUserId(admin);

  await ensureCurrentWeekGoal(admin, userId);
  warmAiCache();

  console.log(`\nเสร็จ · goal ของสัปดาห์นี้พร้อมสำหรับ demo`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
