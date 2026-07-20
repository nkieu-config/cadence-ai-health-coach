import { CoachChatClient } from "@/components/coach/chat-client";
import { getChatHistory, messagesLeftToday } from "@/lib/chat/queries";
import { buildCoachOpener } from "@/lib/chat/opener";
import { getCheckins } from "@/lib/checkins/queries";

export const dynamic = "force-dynamic";

const OPENER_WINDOW_DAYS = 7;

export default async function CoachPage() {
  const [history, quotaLeft, recent] = await Promise.all([
    getChatHistory(),
    messagesLeftToday(),
    getCheckins(OPENER_WINDOW_DAYS),
  ]);
  const opener = buildCoachOpener(recent);

  return (
    <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-4">
      <h1 className="sr-only">คุยกับโค้ช</h1>
      <div className="shrink-0">
        <h2 className="text-xl font-semibold lg:text-2xl">คุยกับโค้ชสุขภาพ</h2>
        <p className="text-sm text-muted-foreground">
          รับคำแนะนำเพื่อสร้างนิสัยการกิน การนอน และการเคลื่อนไหวที่ดี
        </p>
      </div>
      <CoachChatClient initialMessages={history} initialQuotaLeft={quotaLeft} opener={opener} />
    </div>
  );
}
