import { ComingSoon } from "@/components/coming-soon";
import { PageContainer } from "@/components/page-container";

export default function GoalsPage() {
  return (
    <PageContainer>
      <h1 className="sr-only">เป้าหมายสัปดาห์นี้</h1>
      <ComingSoon title="เป้าหมายสัปดาห์นี้" issue="F5-02" owner="สาย 🟨" />
    </PageContainer>
  );
}
