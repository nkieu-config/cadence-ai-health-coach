import { ComingSoon } from "@/components/coming-soon";
import { PageContainer } from "@/components/page-container";

export default function ReflectionPage() {
  return (
    <PageContainer width="content">
      <h1 className="sr-only">สรุปสัปดาห์</h1>
      <ComingSoon title="สรุปสัปดาห์" issue="F6-02" owner="สาย 🟨" />
    </PageContainer>
  );
}
