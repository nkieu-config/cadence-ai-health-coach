"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form action={signOut} className="flex items-center gap-2">
        <Button type="submit" size="sm">
          ออกเลย
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          ยกเลิก
        </Button>
      </form>
    );
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="ออกจากระบบ"
        onClick={() => setConfirming(true)}
      >
        <LogOut className="size-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-4 text-muted-foreground"
      onClick={() => setConfirming(true)}
    >
      <LogOut className="size-5 shrink-0" />
      ออกจากระบบ
    </Button>
  );
}
