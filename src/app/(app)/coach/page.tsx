import { PageContainer } from "@/components/page-container";
import { CoachChatClient } from "@/components/coach/chat-client";
import { getChatHistory, messagesLeftToday } from "@/lib/chat/queries";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const [history, quotaLeft] = await Promise.all([getChatHistory(), messagesLeftToday()]);

  return (
    <PageContainer>
      <h1 className="sr-only">คุยกับโค้ช</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold lg:text-2xl">คุยกับโค้ชสุขภาพ</h2>
          <p className="text-sm text-muted-foreground">
            รับคำแนะนำเพื่อสร้างนิสัยการกิน การนอน และการเคลื่อนไหวที่ดี
          </p>
        </div>
        <CoachChatClient initialMessages={history} initialQuotaLeft={quotaLeft} />
      </div>
    </PageContainer>
  );
}
