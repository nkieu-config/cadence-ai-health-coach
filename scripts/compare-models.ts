import { generate } from "../src/lib/ai";
import { generateInsightText, mergeInsightPatterns } from "../src/lib/ai-outputs/insight-ai";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { computePatternCandidates } from "../src/lib/patterns";
import { findForbiddenTerms } from "../src/lib/safety/language";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const PERIOD = 14;

const MODELS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.6-flash"];

const COACH_QUESTION = "ช่วงนี้นอนดึกเพราะงานส่งไม่ทัน ตื่นมาแล้วเพลียมาก ควรเริ่มจากตรงไหนดี";

function daysAgo(days: number): string {
  const date = new Date(Date.now() + 7 * 60 * 60 * 1000);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

type Result = {
  model: string;
  insightMs: number | null;
  insightFilled: string;
  insightForbidden: number;
  insightError: string | null;
  chatMs: number | null;
  chatChars: number | null;
  chatForbidden: string[];
  chatError: string | null;
  chatSample: string;
};

async function loadCandidates() {
  const admin = createAdminClient();
  const { data: users, error: userError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (userError) throw userError;
  const demo = users.users.find((user) => user.email === EMAIL);
  if (!demo) throw new Error(`ไม่พบบัญชี demo (${EMAIL})`);

  const { data, error } = await admin
    .from("checkins")
    .select(CHECKIN_COLUMNS)
    .eq("user_id", demo.id)
    .gte("checkin_date", daysAgo(PERIOD - 1))
    .order("checkin_date", { ascending: true });
  if (error) throw error;

  const checkins = (data as unknown as CheckinRow[]).map(toCheckin);
  return computePatternCandidates(checkins);
}

async function runModel(
  model: string,
  candidates: Awaited<ReturnType<typeof loadCandidates>>
): Promise<Result> {
  process.env.AI_MODEL = model;
  const result: Result = {
    model,
    insightMs: null,
    insightFilled: "-",
    insightForbidden: 0,
    insightError: null,
    chatMs: null,
    chatChars: null,
    chatForbidden: [],
    chatError: null,
    chatSample: "",
  };

  const insightStart = Date.now();
  try {
    const aiById = await generateInsightText(candidates);
    result.insightMs = Date.now() - insightStart;
    if (aiById === null) {
      result.insightError = "คืน null (โควตา/JSON ไม่ผ่าน/ยิงพลาด)";
    } else {
      const merged = mergeInsightPatterns(candidates, aiById);
      const filled = candidates.filter((c) => aiById.has(c.id)).length;
      result.insightFilled = `${filled}/${candidates.length}`;
      result.insightForbidden = merged.filter(
        (m) => findForbiddenTerms(`${m.observation} ${m.meaning} ${m.nextStep}`).length > 0
      ).length;
    }
  } catch (error) {
    result.insightMs = Date.now() - insightStart;
    result.insightError = error instanceof Error ? error.message : String(error);
  }

  const chatStart = Date.now();
  try {
    const reply = await generate([{ role: "user", content: COACH_QUESTION }]);
    result.chatMs = Date.now() - chatStart;
    result.chatChars = reply.length;
    result.chatForbidden = findForbiddenTerms(reply);
    result.chatSample = reply.replace(/\s+/g, " ").trim().slice(0, 150);
  } catch (error) {
    result.chatMs = Date.now() - chatStart;
    result.chatError = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function run() {
  const candidates = await loadCandidates();
  console.log(`ข้อมูล ${EMAIL} · ${PERIOD} วัน · ${candidates.length} สัญญาณจาก lib/patterns`);
  console.log(`ทดสอบ ${MODELS.length} โมเดล · 2 ครั้งต่อโมเดล (insight JSON + แชตโค้ช)\n`);

  const results: Result[] = [];
  for (const model of MODELS) {
    process.stdout.write(`  ${model} ... `);
    const result = await runModel(model, candidates);
    console.log("เสร็จ");
    results.push(result);
  }

  console.log("\n=== insight (JSON schema · ข้อมูลจริง) ===");
  for (const r of results) {
    console.log(
      `${r.model.padEnd(24)} ${String(r.insightMs).padStart(6)}ms  AI เติม ${r.insightFilled}  คำต้องห้าม ${r.insightForbidden}${r.insightError ? `  ⚠️ ${r.insightError}` : ""}`
    );
  }

  console.log("\n=== แชตโค้ช (ข้อความล้วน) ===");
  for (const r of results) {
    console.log(
      `${r.model.padEnd(24)} ${String(r.chatMs).padStart(6)}ms  ${String(r.chatChars).padStart(4)} ตัวอักษร  คำต้องห้าม ${r.chatForbidden.length ? r.chatForbidden.join(",") : 0}${r.chatError ? `  ⚠️ ${r.chatError}` : ""}`
    );
  }

  console.log("\n=== ตัวอย่างคำตอบโค้ช ===");
  for (const r of results) {
    console.log(`\n[${r.model}]\n${r.chatSample || r.chatError}`);
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
