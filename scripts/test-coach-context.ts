import { COACH_SYSTEM_PROMPT, generate } from "../src/lib/ai";
import type { AiOutputRow, Insight } from "../src/lib/ai-outputs/types";
import { AI_OUTPUT_COLUMNS } from "../src/lib/ai-outputs/types";
import { formatCoachContext } from "../src/lib/chat/context-format";
import { toCheckin } from "../src/lib/checkins/mapper";
import { CHECKIN_COLUMNS, type CheckinRow } from "../src/lib/checkins/types";
import { GOAL_COLUMNS, type GoalRow, toGoal } from "../src/lib/goals/types";
import { createAdminClient } from "../src/lib/supabase/admin";

const EMAIL = process.env.DEMO_EMAIL ?? "palm@example.com";
const QUESTION = "สัปดาห์นี้ฉันเป็นไงบ้าง";

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
  if (!demo) throw new Error(`ไม่พบบัญชี demo (${EMAIL})`);

  const [{ data: checkinRows }, { data: profileRow }, { data: insightRow }, { data: goalRows }] =
    await Promise.all([
      admin
        .from("checkins")
        .select(CHECKIN_COLUMNS)
        .eq("user_id", demo.id)
        .gte("checkin_date", daysAgo(6))
        .order("checkin_date", { ascending: true }),
      admin
        .from("profiles")
        .select("status, early_days, busy_periods, typical_constraints")
        .eq("user_id", demo.id)
        .maybeSingle(),
      admin
        .from("ai_outputs")
        .select(AI_OUTPUT_COLUMNS)
        .eq("user_id", demo.id)
        .eq("kind", "pattern_analysis")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin.from("goals").select(GOAL_COLUMNS).eq("user_id", demo.id),
    ]);

  const checkins = ((checkinRows as unknown as CheckinRow[]) ?? []).map(toCheckin);
  const profile = profileRow
    ? {
        status: profileRow.status ?? null,
        earlyDays: profileRow.early_days ?? [],
        busyPeriods: profileRow.busy_periods ?? [],
        constraints: profileRow.typical_constraints ?? [],
      }
    : null;
  const insightRowTyped = insightRow as unknown as AiOutputRow | null;
  const insight = insightRowTyped
    ? ({
        periodStart: insightRowTyped.period_start,
        periodEnd: insightRowTyped.period_end,
        createdAt: insightRowTyped.created_at,
        ...(insightRowTyped.content as { patterns: Insight["patterns"] }),
      } as Insight)
    : null;
  const goals = ((goalRows as unknown as GoalRow[]) ?? []).map(toGoal);

  const context = formatCoachContext({ profile, checkins, insight, goals });

  console.log("━━━ บริบทที่แนบให้โค้ช ━━━\n");
  console.log(context ?? "(null — ไม่มีข้อมูล)");
  console.log(`\n━━━ ถาม: "${QUESTION}" (ยิง Gemini 1 ครั้ง) ━━━\n`);

  const system = context ? `${COACH_SYSTEM_PROMPT}\n\n${context}` : COACH_SYSTEM_PROMPT;
  const reply = await generate([{ role: "user", content: QUESTION }], { system });
  console.log(reply);
  process.exit(0);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
