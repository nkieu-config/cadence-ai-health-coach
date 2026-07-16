import { daysAgo, today } from "../src/lib/checkins/date";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { generateInsightText, mergeInsightPatterns } from "../src/lib/ai-outputs/insight-ai";
import { generateReflectionText, mergeReflectionText } from "../src/lib/ai-outputs/reflection-ai";
import {
  buildWeekFacts,
  MIN_DAYS_FOR_REFLECTION,
  shortReflection,
} from "../src/lib/ai-outputs/reflection-facts";
import { checkDataSufficiency } from "../src/lib/ai-outputs/sufficiency";
import { computePatternCandidates } from "../src/lib/patterns";
import { GOAL_COLUMNS, type GoalRow, toGoal } from "../src/lib/goals/types";
import { findForbiddenTerms } from "../src/lib/safety/language";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const REFLECTION_DAYS = 7;
const REFLECTION_WEEKS_BACK = [0, 1, 2, 3];
const PATTERN_RANGES = [14, 30];
const DRY = process.argv.includes("--dry");

type Admin = ReturnType<typeof createAdminClient>;

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

async function goalsBetween(admin: Admin, userId: string, from: string, to: string) {
  const { data, error } = await admin
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("user_id", userId)
    .gte("week_start", from)
    .lte("week_start", to);
  if (error) throw error;
  return ((data as unknown as GoalRow[]) ?? []).map(toGoal);
}

async function replaceOutput(
  admin: Admin,
  userId: string,
  kind: "weekly_reflection" | "pattern_analysis",
  periodStart: string,
  periodEnd: string,
  content: unknown
) {
  await admin
    .from("ai_outputs")
    .delete()
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd);
  const { error } = await admin.from("ai_outputs").insert({
    user_id: userId,
    kind,
    period_start: periodStart,
    period_end: periodEnd,
    content,
  });
  if (error) throw error;
}

async function backfillReflections(admin: Admin, userId: string): Promise<number> {
  let forbidden = 0;
  console.log("\n━━━ weekly reflection ย้อนหลัง ━━━");

  for (const weeksBack of REFLECTION_WEEKS_BACK) {
    const periodStart = daysAgo(7 * weeksBack + 6);
    const periodEnd = daysAgo(7 * weeksBack);
    const checkins = await checkinsBetween(admin, userId, periodStart, periodEnd);

    if (checkins.length === 0) {
      console.log(`  ${periodStart}..${periodEnd} · ไม่มีบันทึก — ข้าม`);
      continue;
    }

    let content: Record<string, unknown>;
    let source: string;

    if (checkins.length < MIN_DAYS_FOR_REFLECTION) {
      content = shortReflection(checkins.length, REFLECTION_DAYS) as unknown as Record<
        string,
        unknown
      >;
      source = "📄 short (ไม่ยิง Gemini)";
    } else {
      const goals = await goalsBetween(admin, userId, periodStart, periodEnd);
      const facts = buildWeekFacts(checkins, goals, REFLECTION_DAYS);
      const aiText = DRY ? null : await generateReflectionText(facts);
      const merged = mergeReflectionText(facts, aiText);
      content = { daysRecorded: checkins.length, totalDays: REFLECTION_DAYS, ...merged };
      source = aiText ? "🤖 Gemini" : "📄 template (fallback)";
    }

    const combined = [
      ...(content.pillars as { summary: string }[]).map((p) => p.summary),
      content.strengths,
      content.nextWeek,
    ].join(" ");
    const hits = findForbiddenTerms(combined);
    if (hits.length > 0) forbidden += 1;

    if (!DRY) {
      await replaceOutput(admin, userId, "weekly_reflection", periodStart, periodEnd, content);
    }
    console.log(
      `  ${periodStart}..${periodEnd} · ${checkins.length} วัน · ${source}${hits.length ? ` · ⚠️ ${hits.join(",")}` : ""}`
    );
  }

  return forbidden;
}

async function backfillPatterns(admin: Admin, userId: string): Promise<number> {
  let forbidden = 0;
  console.log("\n━━━ pattern analysis ━━━");

  for (const days of PATTERN_RANGES) {
    const periodStart = daysAgo(days - 1);
    const periodEnd = today();
    const checkins = await checkinsBetween(admin, userId, periodStart, periodEnd);

    const sufficiency = checkDataSufficiency(checkins.length);
    if (!sufficiency.enough) {
      console.log(
        `  ${days} วัน (${periodStart}..${periodEnd}) · ${checkins.length} วัน — ข้อมูลไม่พอ ข้าม`
      );
      continue;
    }

    const candidates = computePatternCandidates(checkins);
    const aiById = DRY ? null : await generateInsightText(candidates);
    const patterns = mergeInsightPatterns(candidates, aiById);
    const content = { patterns };

    const combined = patterns.map((p) => `${p.observation} ${p.meaning} ${p.nextStep}`).join(" ");
    const hits = findForbiddenTerms(combined);
    if (hits.length > 0) forbidden += 1;

    if (!DRY) {
      await replaceOutput(admin, userId, "pattern_analysis", periodStart, periodEnd, content);
    }
    console.log(
      `  ${days} วัน (${periodStart}..${periodEnd}) · ${patterns.length} สัญญาณ · ${aiById ? "🤖 Gemini" : "📄 template"}${hits.length ? ` · ⚠️ ${hits.join(",")}` : ""}`
    );
  }

  return forbidden;
}

async function run() {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.error("GEMINI_API_KEY ไม่ถูกตั้ง");
    process.exit(1);
  }

  const admin = createAdminClient();
  const { data: users, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const demo = users.users.find((user) => user.email === EMAIL);
  if (!demo) throw new Error(`ไม่พบบัญชี demo (${EMAIL})`);

  console.log(
    `backfill AI ให้ ${EMAIL} · today()=${today()}${DRY ? " · DRY RUN (ไม่เขียน ไม่ยิง Gemini)" : ""}`
  );

  const forbidden =
    (await backfillReflections(admin, demo.id)) + (await backfillPatterns(admin, demo.id));

  console.log(`\nเสร็จ · คำต้องห้ามหลุด ${forbidden}`);
  process.exit(forbidden > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
