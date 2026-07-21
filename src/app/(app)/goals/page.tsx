import { Suspense } from "react";
import { PageContainer } from "@/components/page-container";
import { Target } from "lucide-react";
import { getActiveGoals } from "@/lib/goals/queries";
import { GoalSuggestionCard } from "@/components/goals/goal-suggestion-card";
import { GoalProgressCard } from "@/components/goals/goal-progress-card";
import { CardSkeleton } from "@/components/page-skeleton";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await getActiveGoals();

  return (
    <PageContainer width="content">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl text-foreground">
            <Target className="size-6 shrink-0 text-primary" />
            เป้าหมายสัปดาห์นี้
          </h1>
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
              <h3 className="px-1 text-sm font-semibold text-foreground">เป้าหมายที่กำลังทำ</h3>
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
