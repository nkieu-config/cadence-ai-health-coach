import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { generateGoalSuggestions, mergeGoalSuggestions } from "../src/lib/goals/goal-ai";
import { chooseSituations, fallbackGoal, validateGoalTitle } from "../src/lib/goals/suggest";
import { MAX_ACTIVE_GOALS, SITUATION_LABELS, type GoalProfile } from "../src/lib/goals/types";
import {
  BUSY_PERIOD_LABELS,
  CONSTRAINT_LABELS,
  EARLY_DAY_LABELS,
} from "../src/lib/onboarding/types";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const WINDOW_DAYS = 14;

function daysAgo(days: number): string {
  const date = new Date(Date.now() + 7 * 60 * 60 * 1000);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

async function run() {
  const admin = createAdminClient();
  const { data: users, error: userError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (userError) throw userError;

  const demo = users.users.find((user) => user.email === EMAIL);
  if (!demo) throw new Error(`ไม่พบบัญชี demo (${EMAIL}) — รัน npm run seed ก่อน`);

  const { data, error } = await admin
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .eq("user_id", demo.id)
    .gte("checkin_date", daysAgo(WINDOW_DAYS - 1))
    .order("checkin_date", { ascending: true });
  if (error) throw error;

  const { data: profileRow } = await admin
    .from("profiles")
    .select("early_days, busy_periods, typical_constraints")
    .eq("user_id", demo.id)
    .maybeSingle();

  const profile: GoalProfile | null = profileRow
    ? {
        earlyDays: profileRow.early_days ?? [],
        busyPeriods: profileRow.busy_periods ?? [],
        constraints: profileRow.typical_constraints ?? [],
      }
    : null;

  const checkins = (data as unknown as CheckinRow[]).map(toCheckin);
  const situations = chooseSituations(checkins, MAX_ACTIVE_GOALS);
  console.log(
    `บัญชี ${EMAIL} · ${checkins.length} วัน · สถานการณ์ที่เลือก: ${situations.join(", ")}`
  );
  console.log(
    profile
      ? `โปรไฟล์: ตื่นเช้า [${profile.earlyDays.map((d) => EARLY_DAY_LABELS[d as keyof typeof EARLY_DAY_LABELS]).join(" ")}] · งานหนัก [${profile.busyPeriods.map((p) => BUSY_PERIOD_LABELS[p as keyof typeof BUSY_PERIOD_LABELS]).join(", ")}] · ข้อจำกัด [${profile.constraints.map((c) => CONSTRAINT_LABELS[c as keyof typeof CONSTRAINT_LABELS]).join(", ")}]\n`
      : "⚠️ ไม่มีโปรไฟล์ — goal จะไม่ผูกกับข้อจำกัด\n"
  );
  console.log("ยิง Gemini หนึ่งครั้ง...\n");

  const aiBySituation = await generateGoalSuggestions(situations, checkins, profile);
  const suggestions = mergeGoalSuggestions(situations, aiBySituation);

  let fromAi = 0;
  let forbidden = 0;

  suggestions.forEach((goal) => {
    const usedAi = aiBySituation?.has(goal.situation) ?? false;
    if (usedAi) fromAi += 1;
    const invalid = validateGoalTitle(goal.title);
    if (invalid) forbidden += 1;

    console.log(`${usedAi ? "🤖 Gemini" : "📄 fallback"} · ${SITUATION_LABELS[goal.situation]}`);
    console.log(`   goal:     ${goal.title}`);
    console.log(`   มาตรฐาน:  ${fallbackGoal(goal.situation)}`);
    if (invalid) console.log(`   ⚠️ ${invalid}`);
    console.log();
  });

  console.log(
    `สรุป: Gemini ${fromAi}/${suggestions.length} · fallback ${suggestions.length - fromAi}/${suggestions.length} · หลุด validation ${forbidden}`
  );
  if (aiBySituation === null) {
    console.log(
      "⚠️ generateGoalSuggestions คืน null — ทุกอันใช้ fallback (โควตาหมด/ยิงพลาด/JSON ไม่ผ่าน)"
    );
  }
  process.exit(forbidden > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
