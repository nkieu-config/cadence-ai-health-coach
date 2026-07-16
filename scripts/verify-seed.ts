import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { toInsightPattern } from "../src/lib/ai-outputs/templates";
import { computePatternCandidates, hasEnoughData } from "../src/lib/patterns";
import type { PatternId } from "../src/lib/patterns/types";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const PERIODS = [7, 14, 30];
const DEFAULT_PERIOD = 14;

const FEATURE_2_ROWS: { id: PatternId; label: string }[] = [
  { id: "early-class-skip-breakfast", label: "กิน — ข้ามมื้อเช้าในวันที่มีเรียนเช้า" },
  { id: "deadline-sleep-bedtime", label: "นอน — นอนดึกในคืนก่อน deadline" },
  { id: "online-class-movement", label: "ออกกำลังกาย — เดินน้อยในวันที่เรียน online" },
];

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
    .order("checkin_date", { ascending: true });
  if (error) throw error;

  const all = (data as unknown as CheckinRow[]).map(toCheckin);
  console.log(`บัญชี demo: ${EMAIL} · check-in ทั้งหมด ${all.length} วัน\n`);

  let failed = false;

  for (const period of PERIODS) {
    const from = daysAgo(period - 1);
    const window = all.filter((checkin) => checkin.checkinDate >= from);
    const enough = hasEnoughData(window);

    const patterns = computePatternCandidates(window).map(toInsightPattern);

    const marker = period === DEFAULT_PERIOD ? " ← ค่าเริ่มต้นของ dashboard" : "";
    console.log(`━━ ${period} วัน (บันทึก ${window.length} วัน)${marker}`);

    if (!enough) {
      console.log(`   ยังไม่ถึง 7 วัน → ระบบจะบอกว่า "ข้อมูลยังไม่พอ" (ถูกต้องตาม FR-3.3)\n`);
      continue;
    }

    console.log(`   pattern ที่โผล่: ${patterns.length} ข้อ`);
    for (const pattern of patterns) {
      const { groupA, groupB, metric } = pattern.evidence;
      console.log(`   • ${pattern.observation}`);
      console.log(
        `     หลักฐาน: ${metric} — ${groupA.label} ${groupA.value} (${groupA.days} วัน) vs ${groupB.label} ${groupB.value} (${groupB.days} วัน)`
      );
    }
    console.log();

    if (period === DEFAULT_PERIOD) {
      const ids = computePatternCandidates(window).map((candidate) => candidate.id);
      console.log("   ตรวจตาราง Feature 2 (โจทย์บังคับ 3 แถว):");
      for (const { id, label } of FEATURE_2_ROWS) {
        const found = ids.includes(id);
        if (!found) failed = true;
        console.log(`   ${found ? "✅" : "❌"} ${label}`);
      }
      console.log();
    }
  }

  console.log(
    failed
      ? "❌ ตาราง Feature 2 ไม่ครบบน view 14 วัน — seed ใช้ demo ไม่ได้"
      : "✅ ครบตามโจทย์: Feature 2 ทั้ง 3 แถวโผล่บน view เริ่มต้น (14 วัน)"
  );
  process.exit(failed ? 1 : 0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
