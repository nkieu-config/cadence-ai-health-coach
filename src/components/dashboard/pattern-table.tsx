import { ChevronDown, Sparkles } from "lucide-react";
import type { InsightPattern } from "@/lib/ai-outputs/types";
import { getLatestInsight } from "@/lib/ai-outputs/queries";
import { checkDataSufficiency } from "@/lib/ai-outputs/sufficiency";
import { PILLAR_LABELS } from "@/lib/checkins/labels";
import { formatThaiDateLong } from "@/lib/checkins/date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateInsightButton } from "./generate-insight-button";

const MAX_PATTERNS_SHOWN = 5;
const MOBILE_PATTERNS_UPFRONT = 2;

function EvidenceRow({ pattern }: { pattern: InsightPattern }) {
  const { metric, groupA, groupB } = pattern.evidence;
  return (
    <div className="border-t pt-2 text-xs text-muted-foreground">
      <p className="font-medium text-foreground">{metric}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
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

function PatternTableDesktop({ patterns }: { patterns: InsightPattern[] }) {
  return (
    <div className="hidden lg:block overflow-hidden rounded-xl border bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
            <th className="px-4 py-3 w-[15%]">ด้าน</th>
            <th className="px-4 py-3 w-[35%]">Pattern ที่พบ</th>
            <th className="px-4 py-3 w-[25%]">ความหมาย</th>
            <th className="px-4 py-3 w-[25%]">Next Step</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patterns.map((pattern, index) => (
            <tr key={index} className="align-top hover:bg-muted/30 transition-colors">
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {pattern.pillars.map((pillar) => (
                    <Badge key={pillar} variant="secondary" className="whitespace-nowrap">
                      {PILLAR_LABELS[pillar]}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 space-y-3">
                <p className="font-medium text-foreground">{pattern.observation}</p>
                <EvidenceRow pattern={pattern} />
              </td>
              <td className="px-4 py-4 text-muted-foreground ">{pattern.meaning}</td>
              <td className="px-4 py-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">
                    ลองทำสัปดาห์นี้
                  </p>
                  <p className="text-sm text-foreground font-medium">{pattern.nextStep}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Shell({
  description,
  action,
  children,
}: {
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 shrink-0 text-primary" />
            วิเคราะห์รูปแบบพฤติกรรม
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action && <div className="shrink-0">{action}</div>}
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
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground max-w-md">
            วิเคราะห์ความเชื่อมโยงระหว่างการกิน การนอน และการเคลื่อนไหว
            เพื่อค้นหาพฤติกรรมที่น่าจับตามองในชีวิตของคุณ
          </p>
          <GenerateInsightButton days={days} className="w-full sm:w-auto" />
        </div>
      </Shell>
    );
  }

  if (insight.patterns.length === 0) {
    return (
      <Shell
        description={`${formatThaiDateLong(insight.periodStart)} – ${formatThaiDateLong(insight.periodEnd)}`}
        action={
          <GenerateInsightButton
            days={days}
            label="วิเคราะห์ใหม่"
            variant="outline"
            className="w-full sm:w-auto text-xs"
          />
        }
      >
        <p className="text-sm text-muted-foreground">
          ยังไม่พบรูปแบบที่เด่นชัดในช่วงนี้ — บันทึกต่อไปเรื่อย ๆ ระบบจะเห็นความเชื่อมโยงมากขึ้น
        </p>
      </Shell>
    );
  }

  const shown = insight.patterns.slice(0, MAX_PATTERNS_SHOWN);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 shrink-0 text-primary" />
            วิเคราะห์รูปแบบพฤติกรรม
          </CardTitle>
          <CardDescription className="space-y-1">
            <span className="block">
              ในช่วงวันที่ {formatThaiDateLong(insight.periodStart)} –{" "}
              {formatThaiDateLong(insight.periodEnd)} พบ {shown.length} รูปแบบพฤติกรรมที่เด่นที่สุด
              จากทั้งหมด {insight.patterns.length} รูปแบบ
            </span>
          </CardDescription>
        </div>
        <div className="shrink-0">
          <GenerateInsightButton
            days={days}
            label="วิเคราะห์ใหม่"
            variant="outline"
            className="w-full sm:w-auto text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile view */}
        <div className="space-y-4 lg:hidden">
          {shown.slice(0, MOBILE_PATTERNS_UPFRONT).map((pattern, index) => (
            <PatternRow key={index} pattern={pattern} />
          ))}
          {shown.length > MOBILE_PATTERNS_UPFRONT && (
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border text-sm font-medium text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                <span className="group-open:hidden">
                  ดูอีก {shown.length - MOBILE_PATTERNS_UPFRONT} รูปแบบ
                </span>
                <span className="hidden group-open:inline">ซ่อนรูปแบบเพิ่มเติม</span>
              </summary>
              <div className="mt-4 space-y-4">
                {shown.slice(MOBILE_PATTERNS_UPFRONT).map((pattern, index) => (
                  <PatternRow key={index} pattern={pattern} />
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Desktop view */}
        <PatternTableDesktop patterns={shown} />

        <p className="text-xs text-muted-foreground">
          ตัวเลขทั้งหมดคำนวณจากบันทึกจริงของคุณ · AI ช่วยเรียบเรียงเป็นภาษา ไม่ได้เดาเอง
        </p>
      </CardContent>
    </Card>
  );
}
