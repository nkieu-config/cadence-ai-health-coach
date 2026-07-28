"use client";

import { usePathname } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { SafetyNotice } from "@/components/safety-notice";

const RENDERS_ITS_OWN = ["/coach"];

export function LayoutSafetyNotice() {
  const pathname = usePathname();
  if (RENDERS_ITS_OWN.includes(pathname)) return null;

  return (
    <div className="px-3 pb-3 xs:px-4 lg:px-10 lg:pb-8">
      <PageContainer width="content">
        <SafetyNotice />
      </PageContainer>
    </div>
  );
}
