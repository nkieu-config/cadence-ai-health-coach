import { Suspense } from "react";
import { PageContainer } from "@/components/page-container";
import { Zap } from "lucide-react";
import { getActiveGoals } from "@/lib/goals/queries";
import { GoalSuggestionCard } from "@/components/goals/goal-suggestion-card";
import { GoalProgressCard } from "@/components/goals/goal-progress-card";
import { CardSkeleton } from "@/components/page-skeleton";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await getActiveGoals();

  return (
    <PageContainer width="content">
      <h1 className="sr-only">จัดการเป้าหมายสุขภาพสัปดาห์นี้</h1>

      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl text-foreground">
            <Zap className="size-5 text-primary shrink-0" />
            เป้าหมายสัปดาห์นี้
          </h2>
          <p className="text-sm text-muted-foreground">
            ตั้งเป้าหมายย่อยเพื่อความต่อเนื่องและคอยติ๊กบันทึกทุก ๆ วัน
          </p>
        </div>

        <Suspense fallback={<CardSkeleton rows={2} />}>
          <GoalSuggestionCard initialGoals={goals} />
        </Suspense>

        <div className="space-y-4">
          {goals.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-foreground">เป้าหมายปัจจุบัน</h3>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {goals.length} รายการกำลังติดตาม
                </span>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
