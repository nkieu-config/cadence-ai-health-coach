import { memo } from "react";
import { MessageCircle, Moon } from "lucide-react";
import { formatThaiDate, toBangkokDate } from "@/lib/checkins/date";
import type { ChatMessage } from "@/lib/chat/types";
import { FormattedMessage } from "./formatted-message";

function CoachAvatar() {
  return (
    <div
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
    >
      <MessageCircle className="size-4" />
    </div>
  );
}

export const UserMessage = memo(function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
});

export const CoachMessage = memo(function CoachMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex gap-2.5">
      <CoachAvatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="mb-1 text-xs font-medium text-muted-foreground">โค้ช</p>
        <div className="text-base text-foreground">
          <FormattedMessage content={message.content} />
        </div>
      </div>
    </div>
  );
});

export function DaySeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{formatThaiDate(toBangkokDate(date))}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function PendingReply() {
  return (
    <div role="status" className="flex gap-2.5">
      <span className="sr-only">โค้ชกำลังคิด</span>
      <CoachAvatar />
      <div className="flex items-center gap-1 pt-2.5">
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/50"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export function QuotaReachedNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
      <Moon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">คุยกับโค้ชครบสำหรับวันนี้แล้ว</p>
        <p className="text-xs text-muted-foreground">
          พรุ่งนี้กลับมาคุยต่อได้เลย ระหว่างนี้ยังเช็คอิน ตั้งเป้าหมาย และดูข้อมูลย้อนหลังได้ตามปกติ
        </p>
      </div>
    </div>
  );
}
