import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PatternTable() {
  return (
    <Card className="w-full border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
          วิเคราะห์รูปแบบพฤติกรรม (Pattern Insights)
        </CardTitle>
        <CardDescription>
          ระบบวิเคราะห์ความสัมพันธ์ระหว่างการกิน การนอน และการเคลื่อนไหว
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[100px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg m-6 mt-0">
        <span className="text-sm text-muted-foreground">ส่วนของตาราง (กำลังอยู่ในขั้นตอนพัฒนาในสปรินต์ถัดไป)</span>
      </CardContent>
    </Card>
  );
}
