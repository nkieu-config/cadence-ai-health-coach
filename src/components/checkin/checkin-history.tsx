"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarPlus, Check, Pencil, Trash2 } from "lucide-react";
import { PILLAR_COLORS, PILLAR_ICONS } from "@/components/pillar-visual";
import { deleteCheckin } from "@/lib/checkins/actions";
import { formatShortThaiDate, formatThaiDate, formatThaiMonth } from "@/lib/checkins/date";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import type { Checkin } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ENERGY_BADGE = {
  low: { label: "พลังงานต่ำ", variant: "secondary" as const },
  medium: { label: "พลังงานปานกลาง", variant: "secondary" as const },
  high: { label: "พลังงานสูง", variant: "secondary" as const },
};

function HistoryRow({ checkin }: { checkin: Checkin }) {
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { entries } = buildCheckinSummary(checkin);
  const shortDate = formatShortThaiDate(checkin.checkinDate);
  const energy = ENERGY_BADGE[checkin.energyLevel];
  const disruptors = checkin.disruptors.filter((disruptor) => disruptor !== "none");

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCheckin(checkin.checkinDate);
      if ("error" in result) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      setConfirming(false);
      setDeleted(true);
    });
  }

  if (deleted) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Check className="size-4 shrink-0 text-primary" />
          ลบบันทึกของ {shortDate} แล้ว
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium">{formatThaiDate(checkin.checkinDate)}</p>
          <Badge variant={energy.variant}>{energy.label}</Badge>
        </div>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {entries.map((entry) => {
            const Icon = PILLAR_ICONS[entry.pillar];
            return (
              <li key={entry.pillar} className="flex gap-2">
                <Icon
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: PILLAR_COLORS[entry.pillar] }}
                />
                <span>{entry.text}</span>
              </li>
            );
          })}
        </ul>

        {disruptors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {disruptors.map((disruptor) => (
              <Badge key={disruptor} variant="outline" className="text-muted-foreground">
                {DISRUPTOR_LABELS[disruptor]}
              </Badge>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {confirming ? (
          <div className="mt-auto space-y-2">
            <p className="text-sm">ลบบันทึกของ {shortDate} ถาวร — กู้คืนไม่ได้</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={remove}
                disabled={pending}
              >
                {pending ? "กำลังลบ…" : `ยืนยันลบ ${shortDate}`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex gap-2">
            <Link
              href={`/checkin/edit/${checkin.checkinDate}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
            >
              <Pencil className="size-4" />
              แก้ไข
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              <Trash2 className="size-4" />
              ลบ
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MissingDayRow({ date }: { date: string }) {
  return (
    <Link
      href={`/checkin/edit/${date}`}
      className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-dashed p-4 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span>
        <span className="font-medium">{formatShortThaiDate(date)}</span>
        <span className="block text-xs text-muted-foreground">ยังไม่ได้บันทึกวันนี้</span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
        <CalendarPlus className="size-4" />
        บันทึกย้อนหลัง
      </span>
    </Link>
  );
}

const PAGE_SIZE = 14;

export function CheckinHistory({
  checkins,
  missingDates = [],
}: {
  checkins: Checkin[];
  missingDates?: string[];
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (checkins.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">ยังไม่มีบันทึกย้อนหลัง</p>
          <Link href="/checkin" className={buttonVariants({ className: "w-full" })}>
            บันทึกวันนี้
          </Link>
        </CardContent>
      </Card>
    );
  }

  // แทรกวันที่ขาดไว้ตามลำดับเวลาจริง เพื่อให้มีทางเข้าบันทึกย้อนหลังทุกวัน ไม่ใช่แค่เมื่อวาน
  const allRows = [
    ...checkins.map((checkin) => ({ date: checkin.checkinDate, checkin })),
    ...missingDates.map((date) => ({ date, checkin: null })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const rows = allRows.slice(0, visible);
  const remaining = allRows.length - rows.length;

  const months: { month: string; items: typeof rows }[] = [];
  for (const row of rows) {
    const month = formatThaiMonth(row.date);
    const current = months.at(-1);
    if (current?.month === month) current.items.push(row);
    else months.push({ month, items: [row] });
  }

  return (
    <div className="space-y-6">
      {months.map(({ month, items }) => (
        <section key={month} className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-muted-foreground">{month}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {items.map((row) =>
              row.checkin ? (
                <HistoryRow key={row.date} checkin={row.checkin} />
              ) : (
                <MissingDayRow key={row.date} date={row.date} />
              )
            )}
          </div>
        </section>
      ))}

      {remaining > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setVisible((current) => current + PAGE_SIZE)}
        >
          ดูอีก {Math.min(remaining, PAGE_SIZE)} วัน (เหลือ {remaining} วัน)
        </Button>
      )}
    </div>
  );
}
