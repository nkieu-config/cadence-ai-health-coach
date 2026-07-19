import { Sparkles } from "lucide-react";
import type { InsightPattern } from "@/lib/ai-outputs/types";
import { getLatestInsight } from "@/lib/ai-outputs/queries";
import { checkDataSufficiency } from "@/lib/ai-outputs/sufficiency";
import { PILLAR_LABELS } from "@/lib/checkins/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateInsightButton } from "./generate-insight-button";

function EvidenceRow({ pattern }: { pattern: InsightPattern }) {
  const { metric, groupA, groupB } = pattern.evidence;
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
      <p className="mb-1 font-medium text-foreground">{metric}</p>
      <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
        <span>
          {groupA.label} · {groupA.days} วัน
        </span>
        <span>
          {groupB.label} · {groupB.days} วัน
        </span>
      </div>
    </div>
  );
}

function PatternRow({ pattern }: { pattern: InsightPattern }) {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap gap-1.5">
        {pattern.pillars.map((pillar) => (
          <Badge key={pillar} variant="secondary">
            {PILLAR_LABELS[pillar]}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        <p className="font-medium">{pattern.observation}</p>
        <p className="text-sm text-muted-foreground">{pattern.meaning}</p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <p className="mb-1 text-xs font-medium text-primary">ลองทำสัปดาห์นี้</p>
        <p className="text-sm">{pattern.nextStep}</p>
      </div>

      <EvidenceRow pattern={pattern} />
    </div>
  );
}

function Shell({ description, children }: { description: string; children: React.ReactNode }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 shrink-0 text-primary" />
          วิเคราะห์รูปแบบพฤติกรรม
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export async function PatternTable({ days, recordedDays }: { days: number; recordedDays: number }) {
  const sufficiency = checkDataSufficiency(recordedDays);

  if (!sufficiency.enough) {
    return (
      <Shell description="ระบบเชื่อมโยงการกิน การนอน และการเคลื่อนไหวเข้ากับตารางชีวิตของคุณ">
        <p className="text-sm text-muted-foreground">{sufficiency.message}</p>
      </Shell>
    );
  }

  const insight = await getLatestInsight(days);

  if (!insight) {
    return (
      <Shell description="วิเคราะห์รูปแบบจากบันทึกของคุณด้วย AI — เชื่อมโยง 3 ด้านเข้ากับตารางชีวิต">
        <GenerateInsightButton days={days} />
      </Shell>
    );
  }

  if (insight.patterns.length === 0) {
    return (
      <Shell description={`ช่วง ${insight.periodStart} – ${insight.periodEnd}`}>
        <p className="text-sm text-muted-foreground">
          ยังไม่พบรูปแบบที่เด่นชัดในช่วงนี้ — บันทึกต่อไปเรื่อย ๆ ระบบจะเห็นความเชื่อมโยงมากขึ้น
        </p>
        <GenerateInsightButton days={days} label="วิเคราะห์ใหม่" variant="outline" />
      </Shell>
    );
  }

  return (
    <Shell
      description={`ช่วง ${insight.periodStart} – ${insight.periodEnd} · ${insight.patterns.length} รูปแบบที่พบ`}
    >
      <div className="space-y-4">
        {insight.patterns.map((pattern, index) => (
          <PatternRow key={index} pattern={pattern} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        ตัวเลขทั้งหมดคำนวณจากบันทึกจริงของคุณ · AI ช่วยเรียบเรียงเป็นภาษา ไม่ได้เดาเอง
      </p>
      <GenerateInsightButton days={days} label="วิเคราะห์ใหม่" variant="outline" />
    </Shell>
  );
}
