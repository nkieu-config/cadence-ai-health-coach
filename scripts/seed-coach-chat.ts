import { COACH_SYSTEM_PROMPT, generate, type ChatTurn } from "../src/lib/ai";
import { AI_OUTPUT_COLUMNS, type AiOutputRow, type Insight } from "../src/lib/ai-outputs/types";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { daysAgo, today } from "../src/lib/checkins/date";
import { formatCoachContext, type BehaviorProfile } from "../src/lib/chat/context-format";
import { GOAL_COLUMNS, type GoalRow, toGoal } from "../src/lib/goals/types";
import { findForbiddenTerms } from "../src/lib/safety/language";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const CONTEXT_DAYS = 7;
const DRY = process.argv.includes("--dry");

const USER_TURNS = [
  "ช่วงนี้รู้สึกว่าตื่นเช้าไม่ค่อยไหวเลย ทั้งที่ว่านอนเร็วขึ้นแล้วนะ",
  "วันไหนที่มีเรียนเช้าคือแทบไม่ได้กินข้าวเช้าเลย พอถึงบ่ายก็หมดแรง",
  "ถ้าจะเริ่มแก้สักอย่างในสัปดาห์หน้า ควรเริ่มจากอะไรดี",
];

type Admin = ReturnType<typeof createAdminClient>;

async function findUserId(admin: Admin): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === EMAIL);
  if (!user) throw new Error(`หาบัญชี demo ไม่เจอ: ${EMAIL} — รัน npm run seed ก่อน`);
  return user.id;
}

const INSIGHT_DAYS = 14;

async function latestInsight(admin: Admin, userId: string): Promise<Insight | null> {
  const { data } = await admin
    .from("ai_outputs")
    .select(AI_OUTPUT_COLUMNS)
    .eq("user_id", userId)
    .eq("kind", "pattern_analysis")
    .eq("period_start", daysAgo(INSIGHT_DAYS - 1))
    .eq("period_end", today())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const row = data as unknown as AiOutputRow;
  return {
    periodStart: row.period_start,
    periodEnd: row.period_end,
    createdAt: row.created_at,
    ...(row.content as { patterns: Insight["patterns"] }),
  };
}

async function buildContext(admin: Admin, userId: string): Promise<string | null> {
  const [{ data: profileRow }, { data: checkinRows }, { data: goalRows }, insight] =
    await Promise.all([
      admin.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      admin
        .from("checkins")
        .select(CHECKIN_COLUMNS)
        .eq("user_id", userId)
        .gte("checkin_date", daysAgo(CONTEXT_DAYS - 1))
        .lte("checkin_date", today())
        .order("checkin_date", { ascending: true }),
      admin.from("goals").select(GOAL_COLUMNS).eq("user_id", userId).eq("status", "active"),
      latestInsight(admin, userId),
    ]);

  const profile: BehaviorProfile | null = profileRow
    ? {
        status: profileRow.status ?? null,
        earlyDays: profileRow.early_days ?? [],
        busyPeriods: profileRow.busy_periods ?? [],
        constraints: profileRow.typical_constraints ?? [],
      }
    : null;

  return formatCoachContext({
    profile,
    checkins: ((checkinRows as unknown as CheckinRow[]) ?? []).map(toCheckin),
    insight,
    goals: ((goalRows as unknown as GoalRow[]) ?? []).map(toGoal),
  });
}

async function run() {
  const admin = createAdminClient();
  const userId = await findUserId(admin);
  const context = await buildContext(admin, userId);
  const system = context ? `${COACH_SYSTEM_PROMPT}\n\n${context}` : COACH_SYSTEM_PROMPT;

  console.log(`บัญชี demo: ${EMAIL}`);
  console.log(`คุยกับโมเดลจริงผ่าน lib/ai · ${USER_TURNS.length} รอบ\n`);

  const turns: ChatTurn[] = [];
  for (const [index, text] of USER_TURNS.entries()) {
    turns.push({ role: "user", content: text });
    console.log(`[${index + 1}/${USER_TURNS.length}] ผู้ใช้: ${text}`);

    const reply = await generate(turns, { system });
    turns.push({ role: "coach", content: reply });

    const flagged = findForbiddenTerms(reply);
    console.log(`         โค้ช: ${reply.slice(0, 90).replace(/\n/g, " ")}...`);
    if (flagged.length > 0) {
      console.log(`         ⚠️  พบคำที่ต้องอ่านยืนยัน: ${flagged.join(", ")}`);
    }
  }

  if (DRY) {
    console.log("\n--dry — ไม่ได้เขียนลง DB");
    return;
  }

  await admin.from("chat_messages").delete().eq("user_id", userId);

  // ตัวนับโควตาอยู่คนละตารางและไม่หายไปพร้อมการล้างประวัติ (โดยตั้งใจ ดู migration 0004)
  // แต่บัญชี demo ต้องเริ่มวัน pitch ด้วยโควตาเต็ม จึงต้องล้างตรงนี้ด้วย
  // ข้ามได้เงียบ ๆ ถ้ายังไม่ได้ apply migration
  const usage = await admin.from("chat_daily_usage").delete().eq("user_id", userId);
  if (usage.error) {
    console.log("ข้ามการล้างตัวนับโควตา (ยังไม่มีตาราง chat_daily_usage)");
  }

  const base = Date.now() - turns.length * 60_000;
  const rows = turns.map((turn, index) => ({
    user_id: userId,
    role: turn.role,
    content: turn.content,
    created_at: new Date(base + index * 60_000).toISOString(),
  }));

  const { error } = await admin.from("chat_messages").insert(rows);
  if (error) throw new Error(`chat_messages: ${error.message}`);

  console.log(`\nบันทึกแล้ว ${rows.length} ข้อความ — เปิด /coach ด้วยบัญชีปาล์มดูได้เลย`);
  console.log("คำตอบทุกข้อความมาจากโมเดล production ไม่ได้เขียนบทเอง");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
