import type { ReactNode } from "react";
import { SafetyNotice } from "@/components/safety-notice";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-4">
      <div className="w-full max-w-sm">{children}</div>
      <SafetyNotice className="max-w-sm" />
    </main>
  );
}
