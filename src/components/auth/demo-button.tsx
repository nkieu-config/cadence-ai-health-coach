"use client";

import { useFormStatus } from "react-dom";
import { Play } from "lucide-react";
import { signInAsDemo } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

function SubmitButton({ variant }: { variant: "default" | "outline" }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} className="w-full" disabled={pending}>
      {pending ? (
        "กำลังเปิดบัญชีตัวอย่าง…"
      ) : (
        <>
          <Play />
          ลองเลย ด้วยบัญชีตัวอย่าง
        </>
      )}
    </Button>
  );
}

export function DemoButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  return (
    <form action={signInAsDemo}>
      <SubmitButton variant={variant} />
    </form>
  );
}
