import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { getLatestReflection } from "@/lib/ai-outputs/queries";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function ReflectionCard() {
  const reflection = await getLatestReflection();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <NotebookPen className="size-4 shrink-0 text-primary" />
          สรุปสัปดาห์
        </CardTitle>
        <CardDescription>
          {reflection
            ? `บันทึก ${reflection.daysRecorded} จาก ${reflection.totalDays} วัน`
            : "ภาพรวม 7 วันล่าสุด"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Link
          href="/reflection"
          className={buttonVariants({
            variant: reflection ? "outline" : "default",
            className: "w-full",
          })}
        >
          {reflection ? "ดูสรุปสัปดาห์" : "สร้างสรุปสัปดาห์"}
        </Link>
      </CardContent>
    </Card>
  );
}
