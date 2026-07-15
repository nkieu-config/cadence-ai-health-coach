import { getLatestInsight } from "@/lib/ai-outputs/queries";
import { getProfile } from "@/lib/auth/user";
import { getCheckins } from "@/lib/checkins/queries";
import { getActiveGoals } from "@/lib/goals/queries";
import { type BehaviorProfile, formatCoachContext } from "./context-format";

const CONTEXT_DAYS = 7;
const CONTEXT_INSIGHT_DAYS = 14;

export async function buildCoachContext(): Promise<string | null> {
  const [profileRow, checkins, insight, goals] = await Promise.all([
    getProfile(),
    getCheckins(CONTEXT_DAYS),
    getLatestInsight(CONTEXT_INSIGHT_DAYS),
    getActiveGoals(),
  ]);

  const profile: BehaviorProfile | null = profileRow
    ? {
        status: profileRow.status ?? null,
        earlyDays: profileRow.early_days ?? [],
        busyPeriods: profileRow.busy_periods ?? [],
        constraints: profileRow.typical_constraints ?? [],
      }
    : null;

  return formatCoachContext({ profile, checkins, insight, goals });
}
