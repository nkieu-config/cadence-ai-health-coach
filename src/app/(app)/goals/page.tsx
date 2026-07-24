import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { NotebookPen, Target } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getActiveGoals, getGoals } from "@/lib/goals/queries";
import { previousWeekStart, weekDates, weekStart } from "@/lib/goals/week";
import { formatShortThaiDate } from "@/lib/checkins/date";
import { GoalSuggestionCard } from "@/components/goals/goal-suggestion-card";
import { GoalProgressCard } from "@/components/goals/goal-progress-card";
import { LastWeekGoals } from "@/components/goals/last-week-goals";

export const metadata: Metadata = { title: "เป้าหมายสัปดาห์นี้" };

export const dynamic = "force-dynamic";

function weekRange(start: string): string {
  const days = weekDates(start);
  return `${formatShortThaiDate(days[0])} – ${formatShortThaiDate(days[6])}`;
}

export default async function GoalsPage() {
  const thisWeek = weekStart();
  const lastWeek = previousWeekStart(thisWeek);
  const [goals, lastWeekGoals] = await Promise.all([getActiveGoals(thisWeek), getGoals(lastWeek)]);

  return (
    <PageContainer width="content">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl text-foreground">
            <Target className="size-6 shrink-0 text-primary" />
            เป้าหมายสัปดาห์นี้
          </h1>
          <p className="text-sm text-muted-foreground">
            {weekRange(thisWeek)} · ตั้งเป้าหมายย่อยเพื่อความต่อเนื่องและคอยติ๊กบันทึกทุก ๆ วัน
          </p>
        </div>

        <GoalSuggestionCard initialGoals={goals} />

        <div className="space-y-4">
          {goals.length > 0 && (
            <>
              <h2 className="px-1 text-sm font-semibold text-foreground">เป้าหมายที่กำลังทำ</h2>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            </>
          )}
        </div>

        <LastWeekGoals goals={lastWeekGoals} range={weekRange(lastWeek)} />

        <Link
          href="/reflection"
          className={buttonVariants({ variant: "ghost", className: "w-full" })}
        >
          <NotebookPen className="size-4" />
          ดูสรุปสัปดาห์
        </Link>
      </div>
    </PageContainer>
  );
}
