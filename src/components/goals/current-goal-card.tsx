import Link from "next/link";
import { Target } from "lucide-react";
import { getActiveGoals } from "@/lib/goals/queries";
import { weekDates } from "@/lib/goals/week";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function CurrentGoalCard() {
  const active = await getActiveGoals();
  const week = weekDates();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="size-4 shrink-0 text-primary" />
          เป้าหมายสัปดาห์นี้
        </CardTitle>
        {active.length > 0 && (
          <CardDescription>
            ทำได้แล้ว {active.reduce((sum, goal) => sum + goal.progressDates.length, 0)} วัน
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {active.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">ยังไม่ได้ตั้งเป้าหมายสัปดาห์นี้</p>
            <Link href="/goals" className={buttonVariants({ className: "w-full" })}>
              ขอคำแนะนำเป้าหมาย
            </Link>
          </>
        ) : (
          <>
            <ul className="space-y-2 text-sm">
              {active.map((goal) => (
                <li key={goal.id} className="flex items-baseline justify-between gap-3">
                  <span>{goal.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {goal.progressDates.length}/{week.length}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/goals"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              ติ๊กความคืบหน้า
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
