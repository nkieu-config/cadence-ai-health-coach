import { generateInsightText, mergeInsightPatterns } from "../src/lib/ai-outputs/insight-ai";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { computePatternCandidates } from "../src/lib/patterns";
import { findForbiddenTerms } from "../src/lib/safety/language";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const PERIOD = 14;

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
    .gte("checkin_date", daysAgo(PERIOD - 1))
    .order("checkin_date", { ascending: true });
  if (error) throw error;

  const checkins = (data as unknown as CheckinRow[]).map(toCheckin);
  const candidates = computePatternCandidates(checkins);
  console.log(`บัญชี ${EMAIL} · ${checkins.length} วัน · ${candidates.length} สัญญาณ\n`);
  console.log("ยิง Gemini หนึ่งครั้ง...\n");

  const aiById = await generateInsightText(candidates);
  const patterns = mergeInsightPatterns(candidates, aiById);

  let fromAi = 0;
  let forbidden = 0;

  candidates.forEach((candidate, index) => {
    const merged = patterns[index];
    const usedAi = aiById?.has(candidate.id) ?? false;
    if (usedAi) fromAi += 1;

    const text = `${merged.observation} ${merged.meaning} ${merged.nextStep}`;
    const hits = findForbiddenTerms(text);
    if (hits.length > 0) forbidden += 1;

    console.log(`${usedAi ? "🤖 Gemini" : "📄 template"} · ${candidate.id}`);
    console.log(`   observation: ${merged.observation}`);
    console.log(`   meaning:     ${merged.meaning}`);
    console.log(`   next step:   ${merged.nextStep}`);
    console.log(
      `   evidence:    ${merged.evidence.metric} — ${merged.evidence.groupA.label} ${merged.evidence.groupA.value} vs ${merged.evidence.groupB.label} ${merged.evidence.groupB.value}`
    );
    if (hits.length > 0) console.log(`   ⚠️ คำต้องห้าม: ${hits.join(", ")}`);
    console.log();
  });

  console.log(
    `สรุป: Gemini ${fromAi}/${candidates.length} · template ${candidates.length - fromAi}/${candidates.length} · คำต้องห้ามหลุด ${forbidden}`
  );
  if (aiById === null) {
    console.log(
      "⚠️ generateInsightText คืน null — ทุกอันใช้ template (โควตาหมด/ยิงพลาด/JSON ไม่ผ่าน)"
    );
  }
  process.exit(forbidden > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
