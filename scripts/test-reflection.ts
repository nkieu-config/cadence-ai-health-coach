import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { GOAL_COLUMNS, type GoalRow, toGoal } from "../src/lib/goals/types";
import { generateReflectionText, mergeReflectionText } from "../src/lib/ai-outputs/reflection-ai";
import {
  buildWeekFacts,
  MIN_DAYS_FOR_REFLECTION,
  REFLECTION_DAYS,
} from "../src/lib/ai-outputs/reflection-facts";
import { findForbiddenTerms } from "../src/lib/safety/language";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";

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

  const [{ data: checkinRows, error: checkinError }, { data: goalRows, error: goalError }] =
    await Promise.all([
      admin
        .from("checkins")
        .select(CHECKIN_COLUMNS)
        .eq("user_id", demo.id)
        .gte("checkin_date", daysAgo(REFLECTION_DAYS - 1))
        .order("checkin_date", { ascending: true }),
      admin.from("goals").select(GOAL_COLUMNS).eq("user_id", demo.id),
    ]);
  if (checkinError) throw checkinError;
  if (goalError) throw goalError;

  const checkins = ((checkinRows as unknown as CheckinRow[]) ?? []).map(toCheckin);
  const goals = ((goalRows as unknown as GoalRow[]) ?? []).map(toGoal);

  console.log(
    `บัญชี ${EMAIL} · ${checkins.length} วันที่บันทึกใน 7 วันล่าสุด · ${goals.length} goal\n`
  );

  if (checkins.length < MIN_DAYS_FOR_REFLECTION) {
    console.log(
      `บันทึกน้อยกว่า ${MIN_DAYS_FOR_REFLECTION} วัน — ใช้ shortReflection ไม่ยิง Gemini`
    );
    process.exit(0);
  }

  const facts = buildWeekFacts(checkins, goals, REFLECTION_DAYS);
  console.log("สถิติสัปดาห์:", JSON.stringify(facts, null, 2));
  console.log("\nยิง Gemini หนึ่งครั้ง...\n");

  const aiText = await generateReflectionText(facts);
  const { pillars, strengths, nextWeek } = mergeReflectionText(facts, aiText);

  const usedAi = aiText !== null;
  const combined = [...pillars.map((p) => p.summary), strengths, nextWeek].join(" ");
  const forbidden = findForbiddenTerms(combined);

  console.log(`${usedAi ? "🤖 Gemini" : "📄 template"}`);
  for (const p of pillars) console.log(`  ${p.pillar}: ${p.summary}`);
  console.log(`  strengths: ${strengths}`);
  console.log(`  nextWeek: ${nextWeek}`);
  if (forbidden.length > 0) console.log(`  ⚠️ คำต้องห้าม: ${forbidden.join(", ")}`);

  console.log(
    `\nสรุป: ${usedAi ? "ใช้ Gemini" : "fallback เป็น template"} · คำต้องห้ามหลุด ${forbidden.length}`
  );
  if (!usedAi) {
    console.log("⚠️ generateReflectionText คืน null — โควตาหมด/ยิงพลาด/JSON ไม่ผ่าน");
  }
  process.exit(forbidden.length > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
