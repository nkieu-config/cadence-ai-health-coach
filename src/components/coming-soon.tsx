import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({
  title,
  issue,
  owner,
}: {
  title: string;
  issue: string;
  owner: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>หน้านี้กำลังพัฒนา</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>
          งาน: <span className="font-mono">{issue}</span> · ผู้รับผิดชอบ: {owner}
        </p>
        <p>ผู้รับงานให้แทนที่เนื้อหาในไฟล์นี้ทั้งหมด (โครง layout, เมนู และ guard มีให้แล้ว)</p>
      </CardContent>
    </Card>
  );
}
