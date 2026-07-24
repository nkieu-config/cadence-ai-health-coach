import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GOAL_STATUS_LABELS, type Goal } from "@/lib/goals/types";

function outcomeLine(goal: Goal): string {
  const days = goal.progressDates.length;
  if (goal.status === "dropped") return "เก็บไว้ลองใหม่เมื่อพร้อม";
  if (days === 0) return "สัปดาห์นั้นยังไม่ได้ติ๊กวันไหน";
  return `ทำได้ ${days} วันในสัปดาห์นั้น`;
}

export function LastWeekGoals({ goals, range }: { goals: Goal[]; range: string }) {
  if (goals.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">สัปดาห์ที่แล้ว · {range}</h2>
      <Card>
        <CardContent className="space-y-4 py-5">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{goal.title}</p>
                <p className="text-xs text-muted-foreground">{outcomeLine(goal)}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {GOAL_STATUS_LABELS[goal.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
