"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Footprints, Moon, Pencil, Trash2, Utensils } from "lucide-react";
import { deleteCheckin } from "@/lib/checkins/actions";
import { formatShortThaiDate, formatThaiDate, formatThaiMonth } from "@/lib/checkins/date";
import { DISRUPTOR_LABELS } from "@/lib/checkins/labels";
import { buildCheckinSummary } from "@/lib/checkins/summary";
import type { Checkin, Pillar } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PILLAR_ICONS: Record<Pillar, typeof Utensils> = {
  eating: Utensils,
  sleep: Moon,
  movement: Footprints,
};

const PILLAR_COLORS: Record<Pillar, string> = {
  eating: "var(--chart-2)",
  sleep: "var(--chart-1)",
  movement: "var(--chart-3)",
};

const ENERGY_BADGE = {
  low: { label: "พลังงานต่ำ", variant: "outline" as const },
  medium: { label: "พลังงานปานกลาง", variant: "secondary" as const },
  high: { label: "พลังงานสูง", variant: "default" as const },
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

export function CheckinHistory({ checkins }: { checkins: Checkin[] }) {
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

  const months: { month: string; items: Checkin[] }[] = [];
  for (const checkin of checkins) {
    const month = formatThaiMonth(checkin.checkinDate);
    const current = months.at(-1);
    if (current?.month === month) current.items.push(checkin);
    else months.push({ month, items: [checkin] });
  }

  return (
    <div className="space-y-6">
      {months.map(({ month, items }) => (
        <section key={month} className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-muted-foreground">{month}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((checkin) => (
              <HistoryRow key={checkin.checkinDate} checkin={checkin} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
