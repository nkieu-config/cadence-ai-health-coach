import { ComingSoon } from "@/components/coming-soon";
import { PageContainer } from "@/components/page-container";

export default function CoachPage() {
  return (
    <PageContainer>
      <h1 className="sr-only">คุยกับโค้ช</h1>
      <ComingSoon title="คุยกับโค้ช" issue="F4 (Sprint 2)" owner="ไม้ + คีตะ" />
    </PageContainer>
  );
}
