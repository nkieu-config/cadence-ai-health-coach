import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-tr-none px-4 py-2.5 text-sm shadow-sm",
          "bg-primary text-primary-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

export function CoachMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm",
          "bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

export function PendingReply() {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "flex items-center gap-1 rounded-2xl rounded-tl-none px-4 py-3.5 bg-muted text-muted-foreground shadow-sm"
        )}
        aria-label="โค้ชกำลังพิมพ์"
      >
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export function QuotaReachedNotice() {
  return (
    <Card className="border-destructive/30 bg-destructive/5 text-destructive">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertCircle className="size-5 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm text-foreground">
          <p className="font-semibold text-destructive">คุยครบโควตา 5 ข้อความสำหรับวันนี้แล้ว</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            พรุ่งนี้กลับมาคุยต่อได้นะ ระหว่างนี้คุณยังสามารถเช็คอินและดูข้อมูลย้อนหลังได้ตามปกติ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
